import { logger } from "./logger";

interface RunningSession {
  intervalHandle: ReturnType<typeof setInterval> | null;
  timeoutHandle: ReturnType<typeof setTimeout> | null;
  stopped: boolean;
}

const runningSessions = new Map<number, RunningSession>();

export async function sendDiscordMessage(token: string, channelId: string, content: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>;
      return { ok: false, error: `Discord API error ${res.status}: ${JSON.stringify(body)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function validateToken(token: string): Promise<{ valid: boolean; id?: string; username?: string; avatar?: string; error?: string }> {
  try {
    const res = await fetch("https://discord.com/api/v10/users/@me", {
      headers: {
        "Authorization": token,
        "User-Agent": "Mozilla/5.0",
      },
    });
    if (!res.ok) {
      return { valid: false, error: `Invalid token (HTTP ${res.status})` };
    }
    const user = await res.json() as { id: string; username: string; avatar?: string };
    return { valid: true, id: user.id, username: user.username, avatar: user.avatar ?? undefined };
  } catch (err) {
    return { valid: false, error: String(err) };
  }
}

export function startAutoAd(
  sessionId: number,
  token: string,
  channelId: string,
  message: string,
  delay: number,
  interval: number,
  onSent: () => void,
  onError: (err: string) => void,
): void {
  const runner: RunningSession = { intervalHandle: null, timeoutHandle: null, stopped: false };
  runningSessions.set(sessionId, runner);

  const sendLoop = () => {
    if (runner.stopped) return;
    sendDiscordMessage(token, channelId, message).then(({ ok, error }) => {
      if (runner.stopped) return;
      if (!ok) {
        onError(error ?? "Unknown error");
        stopAutoAd(sessionId);
      } else {
        onSent();
      }
    }).catch((err) => {
      logger.error({ sessionId, err }, "Auto-ad send error");
      onError(String(err));
      stopAutoAd(sessionId);
    });
  };

  if (delay > 0) {
    runner.timeoutHandle = setTimeout(() => {
      if (runner.stopped) return;
      sendLoop();
      runner.intervalHandle = setInterval(sendLoop, interval);
    }, delay);
  } else {
    sendLoop();
    runner.intervalHandle = setInterval(sendLoop, interval);
  }
}

export function stopAutoAd(sessionId: number): void {
  const runner = runningSessions.get(sessionId);
  if (!runner) return;
  runner.stopped = true;
  if (runner.timeoutHandle) clearTimeout(runner.timeoutHandle);
  if (runner.intervalHandle) clearInterval(runner.intervalHandle);
  runningSessions.delete(sessionId);
}

export function isRunning(sessionId: number): boolean {
  return runningSessions.has(sessionId);
}
