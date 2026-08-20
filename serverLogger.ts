import express from "express";
import crypto from "crypto";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  requestId?: string;
  method?: string;
  path?: string;
  status?: number;
  durationMs?: number;
  userId?: string;
  ip?: string;
  meta?: Record<string, unknown>;
}

// In-memory bounded circular buffer for admin live log inspection
const MAX_LOGS = 300;
const logBuffer: LogEntry[] = [];

function appendToBuffer(entry: LogEntry) {
  logBuffer.unshift(entry);
  if (logBuffer.length > MAX_LOGS) {
    logBuffer.pop();
  }
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>, requestId?: string) {
    const entry: LogEntry = {
      id: "log-" + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      level: "info",
      message,
      requestId,
      meta,
    };
    appendToBuffer(entry);
    console.log(JSON.stringify({ ...entry, scope: "womenplay-app" }));
  },

  warn(message: string, meta?: Record<string, unknown>, requestId?: string) {
    const entry: LogEntry = {
      id: "log-" + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      level: "warn",
      message,
      requestId,
      meta,
    };
    appendToBuffer(entry);
    console.warn(JSON.stringify({ ...entry, scope: "womenplay-app" }));
  },

  error(message: string, errorOrMeta?: unknown, requestId?: string) {
    let meta: Record<string, unknown> = {};
    if (errorOrMeta instanceof Error) {
      meta = {
        name: errorOrMeta.name,
        errorMessage: errorOrMeta.message,
        stack: errorOrMeta.stack,
      };
    } else if (typeof errorOrMeta === "object" && errorOrMeta !== null) {
      meta = errorOrMeta as Record<string, unknown>;
    } else if (errorOrMeta !== undefined) {
      meta = { raw: String(errorOrMeta) };
    }

    const entry: LogEntry = {
      id: "log-" + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      requestId,
      meta,
    };
    appendToBuffer(entry);
    console.error(JSON.stringify({ ...entry, scope: "womenplay-app" }));
  },

  getRecentLogs(limit = 100, level?: string, search?: string): LogEntry[] {
    let result = logBuffer;
    if (level && level !== "all") {
      result = result.filter(l => l.level === level);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l => 
        l.message.toLowerCase().includes(q) || 
        (l.requestId && l.requestId.toLowerCase().includes(q)) ||
        (l.path && l.path.toLowerCase().includes(q))
      );
    }
    return result.slice(0, limit);
  }
};

// Express middleware to attach unique Request ID and structured response timing
export function requestLoggerMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const reqId = (req.headers["x-request-id"] as string) || `wp-req-${crypto.randomUUID().slice(0, 8)}`;
  (req as any).id = reqId;
  res.setHeader("X-Request-Id", reqId);

  const startTime = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(startTime);
    const durationMs = Math.round((diff[0] * 1e3 + diff[1] * 1e-6) * 100) / 100;
    const status = res.statusCode;

    // Filter out noisy static asset requests unless in error
    if (req.path.startsWith("/api") || status >= 400) {
      const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
      const entry: LogEntry = {
        id: "log-" + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        level,
        message: `HTTP ${req.method} ${req.path} -> ${status} (${durationMs}ms)`,
        requestId: reqId,
        method: req.method,
        path: req.path,
        status,
        durationMs,
        ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress,
        userId: (req as any).user?.id,
      };

      appendToBuffer(entry);
      if (level === "error") {
        console.error(JSON.stringify({ ...entry, scope: "http-access" }));
      } else if (level === "warn") {
        console.warn(JSON.stringify({ ...entry, scope: "http-access" }));
      } else {
        console.log(JSON.stringify({ ...entry, scope: "http-access" }));
      }
    }
  });

  next();
}
