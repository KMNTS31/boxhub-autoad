import { Router } from "express";
import { db, authorizedUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createSession, getSession, deleteSession } from "../lib/sessionStore";
import { validateToken } from "../lib/autoAdRunner";
import { logger } from "../lib/logger";
import { ValidateDiscordTokenBody } from "@workspace/api-zod";

const ADMIN_IDS = new Set(["1474928810888532061", "1505595777286672485"]);
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? "";
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET ?? "";

function getRedirectUri(req: import("express").Request): string {
  const proto = req.headers["x-forwarded-proto"] ?? req.protocol ?? "https";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
  return `${proto}://${host}/api/auth/discord/callback`;
}

const router = Router();

router.get("/auth/discord", (req, res) => {
  if (!DISCORD_CLIENT_ID) {
    res.status(500).json({ error: "Discord client ID not configured" });
    return;
  }
  const redirectUri = getRedirectUri(req);
  const state = Math.random().toString(36).substring(2);
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify",
    state,
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

router.get("/auth/discord/callback", async (req, res) => {
  const { code } = req.query as { code?: string };
  if (!code) {
    res.status(400).json({ error: "Missing code" });
    return;
  }
  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
    res.status(500).json({ error: "Discord OAuth not configured. Set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET." });
    return;
  }

  try {
    const redirectUri = getRedirectUri(req);
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      logger.error({ status: tokenRes.status, body }, "Discord token exchange failed");
      res.status(400).json({ error: "OAuth token exchange failed" });
      return;
    }

    const tokenData = await tokenRes.json() as { access_token: string; token_type: string };
    const userRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      res.status(400).json({ error: "Failed to fetch Discord user" });
      return;
    }

    const discordUser = await userRes.json() as { id: string; username: string; discriminator: string; avatar?: string; global_name?: string };
    const isAdmin = ADMIN_IDS.has(discordUser.id);

    let isAuthorized = isAdmin;
    if (!isAdmin) {
      const existing = await db.select().from(authorizedUsersTable).where(eq(authorizedUsersTable.discordId, discordUser.id)).limit(1);
      isAuthorized = existing.length > 0;
    }

    const sessionId = createSession({
      discordId: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar ?? null,
      globalName: discordUser.global_name ?? null,
      isAdmin,
      isAuthorized,
      accessToken: tokenData.access_token,
    });

    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const redirectTo = isAuthorized ? "/dashboard" : "/unauthorized";
    res.redirect(redirectTo);
  } catch (err) {
    logger.error({ err }, "Discord OAuth callback error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", (req, res) => {
  const sessionId = req.cookies?.sessionId;
  if (!sessionId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const session = getSession(sessionId);
  if (!session) {
    res.status(401).json({ error: "Session expired" });
    return;
  }
  res.json({
    id: session.discordId,
    username: session.username,
    discriminator: session.discriminator,
    avatar: session.avatar,
    global_name: session.globalName,
    isAdmin: session.isAdmin,
    isAuthorized: session.isAuthorized,
  });
});

router.post("/auth/logout", (req, res) => {
  const sessionId = req.cookies?.sessionId;
  if (sessionId) {
    deleteSession(sessionId);
    res.clearCookie("sessionId");
  }
  res.json({ message: "Logged out" });
});

router.post("/validate-token", async (req, res) => {
  const parsed = ValidateDiscordTokenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { token } = parsed.data;
  const result = await validateToken(token);
  res.json(result);
});

export default router;
