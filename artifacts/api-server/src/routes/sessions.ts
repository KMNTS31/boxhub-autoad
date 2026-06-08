import { Router } from "express";
import { db, sessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { startAutoAd, stopAutoAd } from "../lib/autoAdRunner";
import { CreateSessionBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";
import type { UserSession } from "../lib/sessionStore";

const router = Router();

type AuthedRequest = import("express").Request & { user: UserSession };

router.get("/sessions", requireAuth, async (req, res) => {
  const { discordId } = (req as AuthedRequest).user;
  try {
    const rows = await db.select().from(sessionsTable).where(eq(sessionsTable.discordId, discordId));
    res.json(rows.map(toSessionDto));
  } catch (err) {
    logger.error({ err }, "Failed to list sessions");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sessions", requireAuth, async (req, res) => {
  const { discordId } = (req as AuthedRequest).user;
  const parsed = CreateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { channelId, message, delay, interval, userToken } = parsed.data;
  try {
    const [row] = await db.insert(sessionsTable).values({
      discordId,
      channelId,
      message,
      delay,
      interval,
      userToken,
      status: "idle",
    }).returning();
    res.status(201).json(toSessionDto(row));
  } catch (err) {
    logger.error({ err }, "Failed to create session");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/sessions/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  const { discordId, isAdmin } = (req as AuthedRequest).user;
  try {
    const [row] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, id)).limit(1);
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    if (row.discordId !== discordId && !isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
    res.json(toSessionDto(row));
  } catch (err) {
    logger.error({ err }, "Failed to get session");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/sessions/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  const { discordId, isAdmin } = (req as AuthedRequest).user;
  try {
    const [row] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, id)).limit(1);
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    if (row.discordId !== discordId && !isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
    stopAutoAd(id);
    await db.delete(sessionsTable).where(eq(sessionsTable.id, id));
    res.json({ message: "Deleted" });
  } catch (err) {
    logger.error({ err }, "Failed to delete session");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sessions/:id/start", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  const { discordId, isAdmin } = (req as AuthedRequest).user;
  try {
    const [row] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, id)).limit(1);
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    if (row.discordId !== discordId && !isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
    if (row.status === "running") { res.json(toSessionDto(row)); return; }

    await db.update(sessionsTable).set({ status: "running", errorMessage: null }).where(eq(sessionsTable.id, id));

    const currentCount = row.messagesSent;
    startAutoAd(
      id,
      row.userToken,
      row.channelId,
      row.message,
      row.delay,
      row.interval,
      async () => {
        try {
          const [current] = await db.select({ messagesSent: sessionsTable.messagesSent }).from(sessionsTable).where(eq(sessionsTable.id, id)).limit(1);
          const newCount = (current?.messagesSent ?? currentCount) + 1;
          await db.update(sessionsTable).set({ messagesSent: newCount, lastSentAt: new Date() }).where(eq(sessionsTable.id, id));
        } catch (e) {
          logger.error({ e }, "Failed to update message count");
        }
      },
      async (error) => {
        await db.update(sessionsTable).set({ status: "error", errorMessage: error }).where(eq(sessionsTable.id, id));
      },
    );

    const [updated] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, id)).limit(1);
    res.json(toSessionDto(updated));
  } catch (err) {
    logger.error({ err }, "Failed to start session");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sessions/:id/stop", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  const { discordId, isAdmin } = (req as AuthedRequest).user;
  try {
    const [row] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, id)).limit(1);
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    if (row.discordId !== discordId && !isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
    stopAutoAd(id);
    await db.update(sessionsTable).set({ status: "stopped" }).where(eq(sessionsTable.id, id));
    const [updated] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, id)).limit(1);
    res.json(toSessionDto(updated));
  } catch (err) {
    logger.error({ err }, "Failed to stop session");
    res.status(500).json({ error: "Internal server error" });
  }
});

function toSessionDto(row: typeof sessionsTable.$inferSelect) {
  return {
    id: row.id,
    discordId: row.discordId,
    channelId: row.channelId,
    message: row.message,
    delay: row.delay,
    interval: row.interval,
    status: row.status,
    messagesSent: row.messagesSent,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    lastSentAt: row.lastSentAt?.toISOString() ?? null,
    errorMessage: row.errorMessage ?? null,
  };
}

export default router;
