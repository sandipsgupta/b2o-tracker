import { getDb } from "../db";
import { attendanceRecords, userSettings, users } from "../../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";
import {
  getWorkingDatesForWeek,
  getNextSunday11Pm,
  msUntilNextSunday11Pm,
  parseWorkingDays,
} from "../utils/dateUtils";

/**
 * Auto-WFH Assignment Job
 * Runs at end of week (Sunday 11:59 PM) to assign WFH status to unlogged working days
 * 
 * Logic:
 * 1. Get all users
 * 2. For each user, get their working days config
 * 3. Calculate this week's working dates
 * 4. Find unlogged working days (no record for that date)
 * 5. Create WFH records for those days
 */

let scheduledTimeoutId: NodeJS.Timeout | null = null;

export async function autoAssignWfhForWeek() {
  const db = await getDb();
  if (!db) {
    console.error("[autoWfhAssignment] Database not available");
    return;
  }

  try {
    console.log("[autoWfhAssignment] Starting auto-WFH assignment job");
    
    // Get all users
    const allUsers = await db.select().from(users);

    let totalAssigned = 0;

    for (const user of allUsers) {
      // Get user's working days config
      const settings = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, user.id))
        .limit(1);

      if (settings.length === 0) continue;

      const workingDaysStr = settings[0].workingDays || "1,2,3,4,5";
      
      // Get this week's working dates for this user
      const workingDates = getWorkingDatesForWeek(workingDaysStr);

      if (workingDates.length === 0) continue;

      // Get existing records for this week's working dates
      const existingRecords = await db
        .select()
        .from(attendanceRecords)
        .where(
          and(
            eq(attendanceRecords.userId, user.id),
            inArray(attendanceRecords.date, workingDates)
          )
        );

      const existingDates = new Set(existingRecords.map(r => r.date));

      // Find unlogged working days
      const unloggedDates = workingDates.filter(date => !existingDates.has(date));

      // Create WFH records for unlogged days
      if (unloggedDates.length > 0) {
        const now = new Date();
        const records = unloggedDates.map(date => ({
          userId: user.id,
          date,
          status: "wfh" as const,
          startTime: null,
          endTime: null,
          hoursWorked: null,
          createdAt: now,
          updatedAt: now,
        }));

        await db.insert(attendanceRecords).values(records);
        console.log(`[autoWfhAssignment] Assigned ${unloggedDates.length} WFH days for user ${user.id}`);
        totalAssigned += unloggedDates.length;
      }
    }

    console.log(`[autoWfhAssignment] Job completed: ${totalAssigned} total WFH days assigned`);
  } catch (error) {
    console.error("[autoWfhAssignment] Job failed:", error);
  }
}

/**
 * Schedule auto-WFH assignment for Sunday 11:59 PM
 * This should be called once during server startup
 * 
 * Safety: Clears any existing scheduled timeout before scheduling a new one
 * to prevent duplicate scheduling on restart
 */
export function scheduleAutoWfhAssignment() {
  // Clear any existing scheduled job (safety against duplicate scheduling)
  if (scheduledTimeoutId !== null) {
    clearTimeout(scheduledTimeoutId);
    console.log("[autoWfhAssignment] Cleared existing scheduled job");
  }

  const msUntilNext = msUntilNextSunday11Pm();
  const nextSunday = getNextSunday11Pm();

  console.log(
    `[autoWfhAssignment] Scheduled for ${nextSunday.toISOString()} (in ${Math.round(msUntilNext / 1000 / 60)} minutes)`
  );

  // Schedule the first run
  scheduledTimeoutId = setTimeout(() => {
    autoAssignWfhForWeek();
    
    // Then schedule it to run every week (7 days)
    // Note: This will run at slightly different times due to system clock variations
    // For production, consider using a more robust job scheduler like node-cron or bull
    const weeklyIntervalId = setInterval(autoAssignWfhForWeek, 7 * 24 * 60 * 60 * 1000);
    
    // Store the interval ID for potential cleanup (not used currently but available for graceful shutdown)
    console.log("[autoWfhAssignment] Scheduled weekly recurring job");
  }, msUntilNext);
}

/**
 * Cancel scheduled auto-WFH assignment job
 * Useful for graceful shutdown or testing
 */
export function cancelAutoWfhAssignment() {
  if (scheduledTimeoutId !== null) {
    clearTimeout(scheduledTimeoutId);
    scheduledTimeoutId = null;
    console.log("[autoWfhAssignment] Cancelled scheduled job");
  }
}
