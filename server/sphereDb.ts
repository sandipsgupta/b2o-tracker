import { and, eq } from "drizzle-orm";
import { getDb } from "./db";
import { spheres, sphereMembers, users } from "../drizzle/schema";
import { nanoid } from "nanoid";

/**
 * Create a new sphere (only one per user)
 */
export async function createSphere(userId: number, name: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Check if user already has a sphere
    const existing = await db.select().from(spheres)
      .where(eq(spheres.ownerId, userId))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("User already has a sphere");
    }

    // Generate unique invite code
    const code = `sphere_${nanoid(16)}`;

    // Create sphere
    await db.insert(spheres).values({
      ownerId: userId,
      name,
      code,
    });

    // Add owner as a member
    const result = await db.select().from(spheres)
      .where(and(eq(spheres.ownerId, userId), eq(spheres.code, code)))
      .limit(1);

    if (result.length > 0) {
      await db.insert(sphereMembers).values({
        sphereId: result[0].id,
        userId,
      });
    }

    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create sphere:", error);
    throw error;
  }
}

/**
 * Get user's sphere (one per user)
 */
export async function getUserSphere(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(spheres)
    .where(eq(spheres.ownerId, userId))
    .limit(1);

  return result[0] || null;
}

/**
 * Join a sphere via code
 */
export async function joinSphere(userId: number, code: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Find sphere by code
    const sphere = await db.select().from(spheres)
      .where(eq(spheres.code, code))
      .limit(1);

    if (sphere.length === 0) {
      throw new Error("Sphere not found");
    }

    const sphereId = sphere[0].id;

    // Check if user is already a member
    const existing = await db.select().from(sphereMembers)
      .where(and(eq(sphereMembers.sphereId, sphereId), eq(sphereMembers.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      return sphere[0]; // Already a member
    }

    // Add user to sphere
    await db.insert(sphereMembers).values({
      sphereId,
      userId,
    });

    return sphere[0];
  } catch (error) {
    console.error("[Database] Failed to join sphere:", error);
    throw error;
  }
}

/**
 * Get sphere members with user details and today's attendance
 */
export async function getSphereMembersWithAttendance(sphereId: number, today: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get all members of the sphere
    const members = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
    }).from(sphereMembers)
      .innerJoin(users, eq(sphereMembers.userId, users.id))
      .where(eq(sphereMembers.sphereId, sphereId));

    return members;
  } catch (error) {
    console.error("[Database] Failed to get sphere members:", error);
    return [];
  }
}

/**
 * Get sphere by ID
 */
export async function getSphereById(sphereId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(spheres)
    .where(eq(spheres.id, sphereId))
    .limit(1);

  return result[0] || null;
}

/**
 * Leave a sphere
 */
export async function leaveSphere(userId: number, sphereId: number) {
  const db = await getDb();
  if (!db) return true;

  try {
    // Check if user is the owner
    const sphere = await getSphereById(sphereId);
    if (sphere && sphere.ownerId === userId) {
      throw new Error("Owner cannot leave their own sphere");
    }

    // Remove user from sphere
    await db.delete(sphereMembers)
      .where(and(eq(sphereMembers.sphereId, sphereId), eq(sphereMembers.userId, userId)));

    return true;
  } catch (error) {
    console.error("[Database] Failed to leave sphere:", error);
    throw error;
  }
}
