import { Request, Response, NextFunction } from "express";
import { getSession } from "../lib/sessionStore";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const sessionId = req.cookies?.sessionId;
  if (!sessionId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const session = getSession(sessionId);
  if (!session) {
    res.status(401).json({ error: "Session expired or invalid" });
    return;
  }
  (req as Request & { user: typeof session }).user = session;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const sessionId = req.cookies?.sessionId;
  if (!sessionId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const session = getSession(sessionId);
  if (!session) {
    res.status(401).json({ error: "Session expired or invalid" });
    return;
  }
  if (!session.isAdmin) {
    res.status(403).json({ error: "Forbidden: admin only" });
    return;
  }
  (req as Request & { user: typeof session }).user = session;
  next();
}
