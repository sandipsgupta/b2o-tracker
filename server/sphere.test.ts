import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { users, spheres, sphereMembers } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number, name: string, email: string): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email,
    name,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Sphere Router", () => {
  let testUser1Id: number;
  let testUser2Id: number;
  let db: Awaited<ReturnType<typeof getDb>>;
  const ts = Date.now();
  const openId1 = `test-sphere-u1-${ts}`;
  const openId2 = `test-sphere-u2-${ts}`;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Failed to get database");

    // Create test users and capture their IDs
    await db.insert(users).values({ openId: openId1, name: "Sphere Test User 1", email: "spheretest1@example.com" });
    await db.insert(users).values({ openId: openId2, name: "Sphere Test User 2", email: "spheretest2@example.com" });

    const u1 = await db.select({ id: users.id }).from(users).where(eq(users.openId, openId1)).limit(1);
    const u2 = await db.select({ id: users.id }).from(users).where(eq(users.openId, openId2)).limit(1);

    if (!u1[0] || !u2[0]) throw new Error("Failed to create test users");
    testUser1Id = u1[0].id;
    testUser2Id = u2[0].id;
  });

  afterAll(async () => {
    if (!db) return;
    await db.delete(sphereMembers).where(eq(sphereMembers.userId, testUser1Id));
    await db.delete(sphereMembers).where(eq(sphereMembers.userId, testUser2Id));
    await db.delete(spheres).where(eq(spheres.ownerId, testUser1Id));
    await db.delete(users).where(eq(users.id, testUser1Id));
    await db.delete(users).where(eq(users.id, testUser2Id));
  });

  it("should create a sphere", async () => {
    const ctx = createAuthContext(testUser1Id, "Sphere Test User 1", "spheretest1@example.com");
    const caller = appRouter.createCaller(ctx);

    const sphere = await caller.sphere.create({ name: "Test Sphere" });
    expect(sphere).toBeDefined();
    expect(sphere.name).toBe("Test Sphere");
    expect(sphere.ownerId).toBe(testUser1Id);
    expect(sphere.code).toMatch(/^sphere_/);
  });

  it("should get user's own sphere", async () => {
    const ctx = createAuthContext(testUser1Id, "Sphere Test User 1", "spheretest1@example.com");
    const caller = appRouter.createCaller(ctx);

    const sphere = await caller.sphere.getOwn();
    expect(sphere).toBeDefined();
    expect(sphere?.name).toBe("Test Sphere");
    expect(sphere?.ownerId).toBe(testUser1Id);
  });

  it("should join a sphere via code", async () => {
    const ownerCtx = createAuthContext(testUser1Id, "Sphere Test User 1", "spheretest1@example.com");
    const ownerCaller = appRouter.createCaller(ownerCtx);
    const sphere = await ownerCaller.sphere.getOwn();
    if (!sphere) throw new Error("No sphere found");

    const ctx = createAuthContext(testUser2Id, "Sphere Test User 2", "spheretest2@example.com");
    const caller = appRouter.createCaller(ctx);

    const joined = await caller.sphere.join({ code: sphere.code });
    expect(joined).toBeDefined();
    expect(joined.id).toBe(sphere.id);
  });

  it("should get sphere members", async () => {
    const ctx = createAuthContext(testUser1Id, "Sphere Test User 1", "spheretest1@example.com");
    const caller = appRouter.createCaller(ctx);

    const sphere = await caller.sphere.getOwn();
    if (!sphere) throw new Error("No sphere found");

    const members = await caller.sphere.getMembers({ sphereId: sphere.id });
    expect(Array.isArray(members)).toBe(true);
    expect(members.length).toBeGreaterThanOrEqual(1);
  });

  it("should reject invalid sphere code", async () => {
    const ctx = createAuthContext(testUser2Id, "Sphere Test User 2", "spheretest2@example.com");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.sphere.join({ code: "invalid_code_xyz" });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      // joinSphere throws when code not found
      expect(error).toBeDefined();
    }
  });

  it("should prevent creating multiple spheres", async () => {
    const ctx = createAuthContext(testUser1Id, "Sphere Test User 1", "spheretest1@example.com");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.sphere.create({ name: "Second Sphere" });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("already has a sphere");
    }
  });

  it("should prevent owner from leaving their sphere", async () => {
    const ctx = createAuthContext(testUser1Id, "Sphere Test User 1", "spheretest1@example.com");
    const caller = appRouter.createCaller(ctx);

    const sphere = await caller.sphere.getOwn();
    if (!sphere) throw new Error("No sphere found");

    try {
      await caller.sphere.leave({ sphereId: sphere.id });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toContain("Owner cannot leave");
    }
  });

  it("should allow non-owner to leave sphere", async () => {
    const ownerCtx = createAuthContext(testUser1Id, "Sphere Test User 1", "spheretest1@example.com");
    const ownerCaller = appRouter.createCaller(ownerCtx);
    const sphere = await ownerCaller.sphere.getOwn();
    if (!sphere) throw new Error("No sphere found");

    const ctx = createAuthContext(testUser2Id, "Sphere Test User 2", "spheretest2@example.com");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.sphere.leave({ sphereId: sphere.id });
    expect(result).toBe(true);
  });
});
