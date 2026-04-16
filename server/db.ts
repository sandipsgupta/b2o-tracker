import { and, desc, eq, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, attendanceRecords, userSettings, sharedDashboards } from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from "nanoid";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get or create user settings with defaults
 */
export async function getUserSettings(userId: number) {
  const db = await getDb();
  if (!db) return null;

  let settings = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  
  if (settings.length === 0) {
    // Create default settings
    await db.insert(userSettings).values({
      userId,
      targetPercentage: 60,
      workingDays: "1,2,3,4,5",
    });
    settings = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  }
  
  return settings[0] || null;
}

/**
 * Update user settings
 */
export async function updateUserSettings(userId: number, data: { targetPercentage?: number; workingDays?: string }) {
  const db = await getDb();
  if (!db) return null;

  await db.update(userSettings).set(data).where(eq(userSettings.userId, userId));
  return getUserSettings(userId);
}

/**
 * Get attendance records for a date range
 */
export async function getAttendanceRecords(userId: number, startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.userId, userId),
        gte(attendanceRecords.date, startDate),
        lte(attendanceRecords.date, endDate)
      )
    )
    .orderBy(attendanceRecords.date);
}

/**
 * Upsert attendance record for a specific date
 */
export async function upsertAttendanceRecord(userId: number, date: string, status: "office" | "wfh" | "planned") {
  const db = await getDb();
  if (!db) return null;

  const existing = await db.select().from(attendanceRecords)
    .where(and(eq(attendanceRecords.userId, userId), eq(attendanceRecords.date, date)))
    .limit(1);

  if (existing.length > 0) {
    await db.update(attendanceRecords).set({ status }).where(
      and(eq(attendanceRecords.userId, userId), eq(attendanceRecords.date, date))
    );
  } else {
    await db.insert(attendanceRecords).values({ userId, date, status });
  }

  return db.select().from(attendanceRecords)
    .where(and(eq(attendanceRecords.userId, userId), eq(attendanceRecords.date, date)))
    .limit(1)
    .then(r => r[0] || null);
}

/**
 * Delete attendance record
 */
export async function deleteAttendanceRecord(userId: number, date: string) {
  const db = await getDb();
  if (!db) return true;

  await db.delete(attendanceRecords)
    .where(and(eq(attendanceRecords.userId, userId), eq(attendanceRecords.date, date)));
  return true;
}

/**
 * Create or get shared dashboard token
 */
export async function createSharedDashboard(userId: number, expiresAt?: Date) {
  const db = await getDb();
  if (!db) return null;

  const token = `share_${nanoid(32)}`;
  
  await db.insert(sharedDashboards).values({
    userId,
    token,
    expiresAt,
  });

  return token;
}

/**
 * Get shared dashboard by token
 */
export async function getSharedDashboardByToken(token: string) {
  const db = await getDb();
  if (!db) return null;

  const dashboard = await db.select().from(sharedDashboards)
    .where(eq(sharedDashboards.token, token))
    .limit(1);

  if (dashboard.length === 0) return null;

  const share = dashboard[0];
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
    return null; // Token expired
  }

  return share;
}

/**
 * Get all shared dashboards for a user
 */
export async function getUserSharedDashboards(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(sharedDashboards)
    .where(eq(sharedDashboards.userId, userId))
    .orderBy(desc(sharedDashboards.createdAt));
}

/**
 * Delete shared dashboard
 */
export async function deleteSharedDashboard(token: string) {
  const db = await getDb();
  if (!db) return true;

  await db.delete(sharedDashboards).where(eq(sharedDashboards.token, token));
  return true;
}
