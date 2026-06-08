import { Router } from "express";
import { db, authorizedUsersTable, sessionsTable, activityLogTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { AuthorizeUserBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";
import type { UserSession } from "../lib/sessionStore";

const ADMIN_IDS = new Set(["1474928810888532061", "1487904327816446233", "1505595777286672485"]);

const router = Router();
type AuthedRequest = import("express").Request & { user: UserSession };

router.get("/users/authorized", requireAuth, async (req, res) => {
  const { isAdmin } = (req as AuthedRequest).user;
  if (!isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  try {
    const rows = await db.select().from(authorizedUsersTable);
    res.json(rows.map(toUserDto));
  } catch (err) {
    logger.error({ err }, "Failed to list authorized users");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/users/authorized/:discordId", requireAuth, async (req, res) => {
  const { isAdmin, username: adminUsername } = (req as AuthedRequest).user;
  if (!isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  const discordId = String(req.params.discordId);
  const parsed = AuthorizeUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  const { username, displayName, avatar, notes } = parsed.data;

  try {
    const existing = await db.select().from(authorizedUsersTable).where(eq(authorizedUsersTable.discordId, discordId)).limit(1);
    if (existing.length > 0) {
      const [updated] = await db.update(authorizedUsersTable)
        .set({ username, displayName: displayName ?? null, avatar: avatar ?? null, notes: notes ?? null })
        .where(eq(authorizedUsersTable.discordId, discordId))
        .returning();
      res.json(toUserDto(updated));
      return;
    }

    const [row] = await db.insert(authorizedUsersTable).values({
      discordId,
      username,
      displayName: displayName ?? null,
      avatar: avatar ?? null,
      authorizedBy: adminUsername,
      notes: notes ?? null,
    }).returning();

    await db.insert(activityLogTable).values({
      discordId,
      username,
      action: `Authorized by ${adminUsername}`,
    });

    res.json(toUserDto(row));
  } catch (err) {
    logger.error({ err }, "Failed to authorize user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/users/authorized/:discordId", requireAuth, async (req, res) => {
  const { isAdmin, username: adminUsername } = (req as AuthedRequest).user;
  if (!isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  const discordId = String(req.params.discordId);
  try {
    const [existing] = await db.select().from(authorizedUsersTable).where(eq(authorizedUsersTable.discordId, discordId)).limit(1);
    if (!existing) { res.status(404).json({ error: "User not found" }); return; }

    await db.delete(authorizedUsersTable).where(eq(authorizedUsersTable.discordId, discordId));
    await db.insert(activityLogTable).values({
      discordId,
      username: existing.username,
      action: `Revoked by ${adminUsername}`,
    });

    res.json({ message: "User revoked" });
  } catch (err) {
    logger.error({ err }, "Failed to revoke user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/check/:discordId", async (req, res) => {
  const discordId = String(req.params.discordId);
  const isAdmin = ADMIN_IDS.has(discordId);
  if (isAdmin) { res.json({ authorized: true, isAdmin: true }); return; }
  try {
    const rows = await db.select().from(authorizedUsersTable).where(eq(authorizedUsersTable.discordId, discordId)).limit(1);
    res.json({ authorized: rows.length > 0, isAdmin: false });
  } catch (err) {
    logger.error({ err }, "Failed to check user access");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const [{ count: totalAuthorized }] = await db.select({ count: sql<number>`count(*)::int` }).from(authorizedUsersTable);
    const [{ count: activeSessionsCount }] = await db.select({ count: sql<number>`count(*)::int` }).from(sessionsTable).where(eq(sessionsTable.status, "running"));
    const [{ total: totalMessagesSent }] = await db.select({ total: sql<number>`coalesce(sum(messages_sent), 0)::int` }).from(sessionsTable);
    const recentActivity = await db.select().from(activityLogTable).orderBy(sql`timestamp desc`).limit(20);
    res.json({
      totalAuthorized,
      activeSessionsCount,
      totalMessagesSent,
      recentActivity: recentActivity.map((a) => ({
        discordId: a.discordId,
        username: a.username,
        action: a.action,
        timestamp: a.timestamp?.toISOString() ?? new Date().toISOString(),
      })),
    });
  } catch (err) {
    logger.error({ err }, "Failed to get admin stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

function toUserDto(row: typeof authorizedUsersTable.$inferSelect) {
  return {
    id: row.id,
    discordId: row.discordId,
    username: row.username,
    displayName: row.displayName ?? null,
    avatar: row.avatar ?? null,
    authorizedAt: row.authorizedAt?.toISOString() ?? new Date().toISOString(),
    authorizedBy: row.authorizedBy,
    notes: row.notes ?? null,
    tokenHash: row.tokenHash ?? null,
    lastSeen: row.lastSeen?.toISOString() ?? null,
    sessionCount: row.sessionCount,
  };
}

export default router;
