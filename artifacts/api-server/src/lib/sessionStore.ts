import { randomBytes } from "crypto";

export interface UserSession {
  sessionId: string;
  discordId: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  globalName: string | null;
  isAdmin: boolean;
  isAuthorized: boolean;
  accessToken: string;
  createdAt: number;
}

const sessions = new Map<string, UserSession>();

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function createSession(data: Omit<UserSession, "sessionId" | "createdAt">): string {
  const sessionId = randomBytes(32).toString("hex");
  sessions.set(sessionId, {
    ...data,
    sessionId,
    createdAt: Date.now(),
  });
  return sessionId;
}

export function getSession(sessionId: string): UserSession | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

export function updateSession(sessionId: string, data: Partial<UserSession>): void {
  const session = sessions.get(sessionId);
  if (session) {
    sessions.set(sessionId, { ...session, ...data });
  }
}
