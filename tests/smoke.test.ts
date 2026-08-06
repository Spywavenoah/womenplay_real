import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { spawn, type ChildProcess } from "child_process";
import path from "path";
import fs from "fs";

const PORT = 3999;
const BASE = `http://127.0.0.1:${PORT}`;
const DIST_SERVER = path.join(process.cwd(), "dist", "server.cjs");

let server: ChildProcess;

describe("Full app smoke test (boots dist/server.cjs)", () => {
  beforeAll(async () => {
    if (!fs.existsSync(DIST_SERVER)) {
      throw new Error(
        "dist/server.cjs not found — run `npm run build` before the smoke test."
      );
    }
    server = spawn(process.execPath, [DIST_SERVER], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PORT: String(PORT),
        NODE_ENV: "test",
        DB_FILE: path.join(process.cwd(), "tests", ".smoke-database.json"),
        JWT_SECRET: "smoke-test-secret-key-1234567890-abcdefghijklmnop",
        AUTH_RATE_LIMIT_MAX: "10000",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    // Wait for the server to accept connections
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`${BASE}/api/health`);
        if (res.ok) return;
      } catch {
        /* not up yet */
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    throw new Error("Smoke server did not become ready in time");
  });

  afterAll(async () => {
    if (server) {
      server.kill("SIGTERM");
      await new Promise((r) => setTimeout(r, 500));
    }
    const smokeDb = path.join(process.cwd(), "tests", ".smoke-database.json");
    if (fs.existsSync(smokeDb)) fs.unlinkSync(smokeDb);
  });

  it("serves the SPA index.html at /", async () => {
    const res = await fetch(`${BASE}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("root");
  });

  it("serves the SPA for deep links (URL-routed pages)", async () => {
    for (const deepLink of ["/faq", "/privacy", "/terms", "/sponsorship", "/portal", "/admin", "/volunteer", "/activate?token=smoke"]) {
      const res = await fetch(`${BASE}${deepLink}`);
      expect(res.status, `deep link ${deepLink} should return 200`).toBe(200);
      const html = await res.text();
      expect(html, `deep link ${deepLink} should serve index.html`).toContain("root");
    }
  });

  it("reports database status via /api/db/status", async () => {
    const res = await fetch(`${BASE}/api/db/status`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(["postgresql", "local_json"]).toContain(body.engine);
    expect(typeof body.counts.users).toBe("number");
  });

  it("lists events via /api/events", async () => {
    const res = await fetch(`${BASE}/api/events`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it("rejects unauthenticated member access", async () => {
    const res = await fetch(`${BASE}/api/members`);
    expect(res.status).toBe(401);
  });

  it("authenticates the seeded admin end to end", async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@womenplay.org",
        password: "WomenPlay@2026!",
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.token).toBeTruthy();
    expect(body.user.role).toBe("ADMIN");
  });
});

describe("Rate limiting / account lockout", () => {
  const LIMIT_PORT = 3998;
  const LIMIT_BASE = `http://127.0.0.1:${LIMIT_PORT}`;
  let limited: ChildProcess;

  beforeAll(async () => {
    limited = spawn(process.execPath, [DIST_SERVER], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PORT: String(LIMIT_PORT),
        NODE_ENV: "test",
        DB_FILE: path.join(process.cwd(), "tests", ".smoke-database.json"),
        JWT_SECRET: "smoke-test-secret-key-1234567890-abcdefghijklmnop",
        AUTH_RATE_LIMIT_MAX: "3",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`${LIMIT_BASE}/api/health`);
        if (res.ok) return;
      } catch {
        /* not up yet */
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    throw new Error("Rate-limit server did not become ready in time");
  });

  afterAll(async () => {
    if (limited) {
      limited.kill("SIGTERM");
      await new Promise((r) => setTimeout(r, 500));
    }
  });

  it("locks out an IP after the configured number of auth attempts", async () => {
    const attempt = (n: number) =>
      fetch(`${LIMIT_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: `nobody-${n}@example.com`, password: "x" }),
      });

    // First requests are allowed through (401 invalid credentials)
    for (let i = 0; i < 3; i++) {
      const res = await attempt(i);
      expect([400, 401, 429]).toContain(res.status);
    }

    // Over the limit -> 429 Too Many Requests
    let got429 = false;
    for (let i = 0; i < 5; i++) {
      const res = await attempt(i + 100);
      if (res.status === 429) {
        got429 = true;
        const body = await res.json();
        expect(body.error).toMatch(/Too many authentication attempts/i);
        break;
      }
    }
    expect(got429).toBe(true);
  });
});
