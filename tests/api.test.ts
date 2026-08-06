import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

import { app } from "../server";

const TEST_DB = path.join(process.cwd(), "tests", ".test-database.json");
const ADMIN_EMAIL = "admin@womenplay.org";
const ADMIN_PASSWORD = "WomenPlay@2026!";

describe("Health", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body).toHaveProperty("engine");
    expect(res.body).toHaveProperty("uptime");
  });
});

describe("Registration", () => {
  const email = `reg-${Date.now()}@example.com`;

  it("rejects weak passwords", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email,
      fullName: "Test User",
      password: "short",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/8 characters/i);
  });

  it("rejects missing required fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email,
      password: "a-strong-password",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/fullName/i);
  });

  it("registers a new user with a verification URL", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email,
      fullName: "Test User",
      password: "a-strong-password",
    });
    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/verification/i);
    expect(res.body.verificationUrl).toMatch(/\/verify-email\/vtoken_/);
  });

  it("rejects duplicate email addresses", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email,
      fullName: "Test User",
      password: "a-strong-password",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already registered/i);
  });

  it("does not expose the password hash in any response", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: `hash-${Date.now()}@example.com`,
      fullName: "Hash Check",
      password: "a-strong-password",
    });
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash/);
  });
});

describe("Login", () => {
  it("rejects an unknown email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@nowhere.example",
      password: ADMIN_PASSWORD,
    });
    expect(res.status).toBe(401);
  });

  it("rejects a wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: ADMIN_EMAIL,
      password: "wrong-password-123",
    });
    expect(res.status).toBe(401);
  });

  it("rejects login before email verification", async () => {
    const email = `unverified-${Date.now()}@example.com`;
    const reg = await request(app).post("/api/auth/register").send({
      email,
      fullName: "Unverified User",
      password: "a-strong-password",
    });
    expect(reg.status).toBe(201);

    const res = await request(app).post("/api/auth/login").send({
      email,
      password: "a-strong-password",
    });
    expect(res.status).toBe(403);
    expect(res.body.emailUnverified).toBe(true);
  });

  it("issues a token for a verified admin and strips secrets", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe(ADMIN_EMAIL);
    expect(res.body.user.role).toBe("ADMIN");
    expect(res.body.user).not.toHaveProperty("passwordHash");
    expect(res.body.user).not.toHaveProperty("twoFactorSecret");
    expect(res.body.user).not.toHaveProperty("verificationToken");
  });

  it("completes email verification, then allows login", async () => {
    const email = `verify-${Date.now()}@example.com`;
    const reg = await request(app).post("/api/auth/register").send({
      email,
      fullName: "Verify Me",
      password: "a-strong-password",
    });
    const token = reg.body.verificationUrl.split("/verify-email/")[1];

    const verify = await request(app).post("/api/auth/verify-email").send({ token });
    expect(verify.status).toBe(200);
    expect(verify.body.success).toBe(true);

    const login = await request(app).post("/api/auth/login").send({
      email,
      password: "a-strong-password",
    });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();
  });
});

describe("Authorization", () => {
  let adminToken: string;
  let memberToken: string;

  beforeAll(async () => {
    const admin = await request(app).post("/api/auth/login").send({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    adminToken = admin.body.token;

    const memberLogin = await request(app).post("/api/auth/login").send({
      email: "spywavenoah@gmail.com",
      password: ADMIN_PASSWORD,
    });
    memberToken = memberLogin.body.token;
  });

  it("blocks /api/members without a token", async () => {
    const res = await request(app).get("/api/members");
    expect(res.status).toBe(401);
  });

  it("blocks /api/members with an invalid token", async () => {
    const res = await request(app)
      .get("/api/members")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });

  it("allows an admin to list members without exposing secrets", async () => {
    const res = await request(app)
      .get("/api/members")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const serialized = JSON.stringify(res.body);
    expect(serialized).not.toMatch(/passwordHash|twoFactorSecret|verificationToken/);
  });

  it("allows an admin to list launch ticket purchases", async () => {
    const res = await request(app)
      .get("/api/launch-tickets")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("2FA", () => {
  it("rejects verify-2fa without a pending session", async () => {
    const res = await request(app).post("/api/auth/login/verify-2fa").send({
      tempToken: "does-not-exist",
      code: "123456",
    });
    expect(res.status).toBe(400);
  });
});

describe("Input Validation", () => {
  it("rejects a non-email in the email field", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "not-an-email",
      password: "somepassword",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it("rejects login with an empty password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: ADMIN_EMAIL,
      password: "",
    });
    expect(res.status).toBe(400);
  });

  it("rejects an oversized full name on register", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: `longname-${Date.now()}@example.com`,
      fullName: "A".repeat(500),
      password: "a-strong-password",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/must not exceed/i);
  });

  it("rejects a non-numeric 2FA code format", async () => {
    const res = await request(app).post("/api/auth/login/verify-2fa").send({
      tempToken: "whatever",
      code: "abc",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/format/i);
  });

  it("rejects a profile update with an invalid avatar URL length", async () => {
    const admin = await request(app).post("/api/auth/login").send({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    const res = await request(app)
      .put("/api/members/admin-1/profile")
      .set("Authorization", `Bearer ${admin.body.token}`)
      .send({ bio: "B".repeat(3000) });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/must not exceed/i);
  });
});

describe("Password Reset", () => {  it("does not reveal whether an email exists", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({
      email: "no-such-account@nowhere.example",
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/If that email address is registered/);
  });

  it("rejects a reset without a token", async () => {
    const res = await request(app).post("/api/auth/reset-password").send({
      token: "",
      newPassword: "NewStrongPass1!",
    });
    expect(res.status).toBe(400);
  });

  it("rejects a reset with a weak password", async () => {
    const res = await request(app).post("/api/auth/reset-password").send({
      token: "any-token",
      newPassword: "short",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/8 characters/i);
  });

  it("rejects an unknown/expired reset token", async () => {
    const res = await request(app).post("/api/auth/reset-password").send({
      token: "prt_bogus_doesnotexist",
      newPassword: "NewStrongPass1!",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid or expired/i);
  });

  it("resets a password and allows login with the new one", async () => {
    // Snapshot the original admin hash so we can restore it afterwards
    const dbBefore = JSON.parse(fs.readFileSync(TEST_DB, "utf-8"));
    const adminBefore = dbBefore.users.find((u: any) => u.email === ADMIN_EMAIL);
    const originalHash = adminBefore.passwordHash;

    // Request a reset for the seeded admin
    const forgot = await request(app).post("/api/auth/forgot-password").send({
      email: ADMIN_EMAIL,
    });
    expect(forgot.status).toBe(200);

    // Read the reset token straight from the isolated test DB
    const dbData = JSON.parse(fs.readFileSync(TEST_DB, "utf-8"));
    const admin = dbData.users.find((u: any) => u.email === ADMIN_EMAIL);
    expect(admin.resetToken).toMatch(/^prt_/);

    const reset = await request(app).post("/api/auth/reset-password").send({
      token: admin.resetToken,
      newPassword: "NewStrongPass1!",
    });
    expect(reset.status).toBe(200);
    expect(reset.body.message).toMatch(/reset successfully/i);

    // Old password no longer works
    const oldLogin = await request(app).post("/api/auth/login").send({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    expect(oldLogin.status).toBe(401);

    // New password works
    const newLogin = await request(app).post("/api/auth/login").send({
      email: ADMIN_EMAIL,
      password: "NewStrongPass1!",
    });
    expect(newLogin.status).toBe(200);
    expect(newLogin.body.token).toBeTruthy();

    // Token is consumed
    const dbAfter = JSON.parse(fs.readFileSync(TEST_DB, "utf-8"));
    const adminAfter = dbAfter.users.find((u: any) => u.email === ADMIN_EMAIL);
    expect(adminAfter.resetToken).toBeUndefined();

    // Restore the original password hash so the persisted test DB stays stable
    // across test runs (the server already exited its write of the new hash).
    const restore = JSON.parse(fs.readFileSync(TEST_DB, "utf-8"));
    const adminToRestore = restore.users.find((u: any) => u.email === ADMIN_EMAIL);
    adminToRestore.passwordHash = originalHash;
    adminToRestore.resetToken = undefined;
    adminToRestore.resetTokenExpiry = undefined;
    fs.writeFileSync(TEST_DB, JSON.stringify(restore, null, 2), "utf-8");
  });
});

describe("Launch Tickets", () => {
  it("rejects checkout without a full name", async () => {
    const res = await request(app).post("/api/tickets/checkout").send({
      email: "buyer@example.com",
      ticketType: "regular",
      quantity: 1,
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });

  it("rejects checkout with an invalid email", async () => {
    const res = await request(app).post("/api/tickets/checkout").send({
      fullName: "Test Buyer",
      email: "not-an-email",
      ticketType: "regular",
      quantity: 1,
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it("rejects an unknown ticket tier", async () => {
    const res = await request(app).post("/api/tickets/checkout").send({
      fullName: "Test Buyer",
      email: "buyer@example.com",
      ticketType: "golden-ticket",
      quantity: 1,
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/ticket tier/i);
  });

  it("returns a clear error when Stripe is not configured", async () => {
    const res = await request(app).post("/api/tickets/checkout").send({
      fullName: "Test Buyer",
      email: "buyer@example.com",
      ticketType: "regular",
      quantity: 2,
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Stripe is not configured/i);
  });

  it("blocks listing launch tickets without admin access", async () => {
    const anon = await request(app).get("/api/launch-tickets");
    expect(anon.status).toBe(401);

    const memberLogin = await request(app).post("/api/auth/login").send({
      email: "spywavenoah@gmail.com",
      password: ADMIN_PASSWORD,
    });
    const memberRes = await request(app)
      .get("/api/launch-tickets")
      .set("Authorization", `Bearer ${memberLogin.body.token}`);
    expect(memberRes.status).toBe(403);
  });
});

describe("Founding Circle Account Activation", () => {
  const email = `fc-${Date.now()}@example.com`;

  // POST /api/founding-circle triggers saveDatabase(), which dumps the whole
  // in-memory DB â€” including the seeded admin whose hash the Password Reset test
  // deliberately left restored in the file. Snapshot that hash up front and
  // rewrite it afterwards so the persisted test DB stays stable across runs.
  let originalAdminHash: string;
  beforeAll(() => {
    const db = JSON.parse(fs.readFileSync(TEST_DB, "utf-8"));
    originalAdminHash = db.users.find((u: any) => u.email === ADMIN_EMAIL).passwordHash;
  });
  afterAll(() => {
    const db = JSON.parse(fs.readFileSync(TEST_DB, "utf-8"));
    const admin = db.users.find((u: any) => u.email === ADMIN_EMAIL);
    admin.passwordHash = originalAdminHash;
    admin.resetToken = undefined;
    admin.resetTokenExpiry = undefined;
    fs.writeFileSync(TEST_DB, JSON.stringify(db, null, 2), "utf-8");
  });

  it("creates a founding member, an account, and allows activation", async () => {
    const signup = await request(app).post("/api/founding-circle").send({
      firstName: "Founding",
      lastName: "Test",
      email,
      phone: "+1 (604) 000-0000",
      city: "Vancouver",
      ageRange: "30-39",
      interests: "Brunches,Karaoke,Wellness Events",
    });
    expect(signup.status).toBe(201);
    expect(signup.body.member).toBeTruthy();
    expect(signup.body.member.firstName).toBe("Founding");
    expect(signup.body.message).toMatch(/activation link/i);

    const db = JSON.parse(fs.readFileSync(TEST_DB, "utf-8"));
    const user = db.users.find((u: any) => u.email === email);
    expect(user).toBeTruthy();
    expect(user.emailVerified).toBe(false);
    expect(user.verificationToken).toMatch(/^vtoken_/);

    const foundingRecord = db.foundingMembers.find((m: any) => m.email === email);
    expect(foundingRecord).toBeTruthy();
    expect(foundingRecord.interests).toContain("Karaoke");

    // Login blocked before activation (no password set yet)
    const blocked = await request(app).post("/api/auth/login").send({
      email,
      password: "Whatever123!",
    });
    expect(blocked.status).toBe(401);

    // Activate: verifies email + sets password
    const activate = await request(app).post("/api/auth/activate").send({
      token: user.verificationToken,
      password: "FoundingPass1!",
    });
    expect(activate.status).toBe(200);
    expect(activate.body.token).toBeTruthy();
    expect(activate.body.user.emailVerified).toBe(true);
    expect(activate.body.user).not.toHaveProperty("passwordHash");

    // Login with the newly set password works
    const login = await request(app).post("/api/auth/login").send({
      email,
      password: "FoundingPass1!",
    });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();

    // Founding member record was promoted to approved on activation
    const dbAfter = JSON.parse(fs.readFileSync(TEST_DB, "utf-8"));
    const fm = dbAfter.foundingMembers.find((m: any) => m.email === email);
    expect(fm.status).toBe("approved");

    // Token is consumed after activation
    const userAfter = dbAfter.users.find((u: any) => u.email === email);
    expect(userAfter.verificationToken).toBeUndefined();
  });

  it("rejects an invalid or already-used activation token", async () => {
    const res = await request(app).post("/api/auth/activate").send({
      token: "vtoken_doesnotexist123",
      password: "StrongPass1!",
    });
    expect(res.status).toBe(400);
  });

  it("rejects duplicate founding circle emails", async () => {
    const dupEmail = `fc-dup-${Date.now()}@example.com`;
    const first = await request(app).post("/api/founding-circle").send({
      firstName: "Dup",
      lastName: "Member",
      email: dupEmail,
    });
    expect(first.status).toBe(201);

    const second = await request(app).post("/api/founding-circle").send({
      firstName: "Dup",
      lastName: "Member",
      email: dupEmail,
    });
    expect(second.status).toBe(400);
  });
});

describe("Volunteer Program", () => {
  const email = `vol-${Date.now()}@example.com`;

  let originalAdminHash: string;
  beforeAll(async () => {
    const db = JSON.parse(fs.readFileSync(TEST_DB, "utf-8"));
    originalAdminHash = db.users.find((u: any) => u.email === ADMIN_EMAIL).passwordHash;

    // The earlier Password Reset test permanently changed the in-memory seeded
    // admin password (only the file was restored). Reset it back via the running
    // server so admin-authenticated requests in this suite succeed.
    const forgot = await request(app).post("/api/auth/forgot-password").send({
      email: ADMIN_EMAIL,
    });
    expect(forgot.status).toBe(200);
    const dbWithReset = JSON.parse(fs.readFileSync(TEST_DB, "utf-8"));
    const adminReset = dbWithReset.users.find((u: any) => u.email === ADMIN_EMAIL);
    const reset = await request(app).post("/api/auth/reset-password").send({
      token: adminReset.resetToken,
      newPassword: ADMIN_PASSWORD,
    });
    expect(reset.status).toBe(200);
  });
  afterAll(() => {
    const db = JSON.parse(fs.readFileSync(TEST_DB, "utf-8"));
    const admin = db.users.find((u: any) => u.email === ADMIN_EMAIL);
    admin.passwordHash = originalAdminHash;
    admin.resetToken = undefined;
    admin.resetTokenExpiry = undefined;
    fs.writeFileSync(TEST_DB, JSON.stringify(db, null, 2), "utf-8");
  });

  it("rejects a volunteer application missing required fields", async () => {
    const res = await request(app).post("/api/volunteers").send({
      email,
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });

  it("accepts a volunteer application and stores it", async () => {
    const res = await request(app).post("/api/volunteers").send({
      fullName: "Volunteer Test",
      email,
      phone: "+1 (604) 555-1234",
      availability: "Full day",
      roles: "Guest Experience,Registration",
      why: "I love helping women connect and have fun.",
    });
    expect(res.status).toBe(201);
    expect(res.body.volunteer).toBeTruthy();
    expect(res.body.volunteer.roles).toContain("Registration");
    expect(res.body.volunteer.enabled).toBe(false);
    expect(res.body.volunteer.status).toBe("pending");
  });

  it("rejects duplicate volunteer applications from the same email", async () => {
    const res = await request(app).post("/api/volunteers").send({
      fullName: "Volunteer Test 2",
      email,
      phone: "+1 (604) 555-1234",
      availability: "Event shift",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already submitted/i);
  });

  it("blocks anonymous and non-admin access to volunteer admin routes", async () => {
    const anon = await request(app).get("/api/volunteers");
    expect(anon.status).toBe(401);

    const memberLogin = await request(app).post("/api/auth/login").send({
      email: "spywavenoah@gmail.com",
      password: ADMIN_PASSWORD,
    });
    const memberRes = await request(app)
      .get("/api/volunteers")
      .set("Authorization", `Bearer ${memberLogin.body.token}`);
    expect(memberRes.status).toBe(403);
  });

  it("allows an admin to enable a volunteer, creating a login account and activation email", async () => {
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    expect(adminLogin.status).toBe(200);
    const adminToken = adminLogin.body.token;

    const list = await request(app)
      .get("/api/volunteers")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(list.status).toBe(200);
    const volunteer = list.body.find((v: any) => v.email === email);
    expect(volunteer).toBeTruthy();

    const enable = await request(app)
      .post(`/api/volunteers/${volunteer.id}/enable`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(enable.status).toBe(200);
    expect(enable.body.volunteer.enabled).toBe(true);
    expect(enable.body.volunteer.status).toBe("approved");
    expect(enable.body.message).toMatch(/activation email/i);

    const db = JSON.parse(fs.readFileSync(TEST_DB, "utf-8"));
    const user = db.users.find((u: any) => u.email === email);
    expect(user).toBeTruthy();
    expect(user.role).toBe("VOLUNTEER");
    expect(user.emailVerified).toBe(false);
    expect(user.verificationToken).toMatch(/^vtoken_/);

    // Volunteer record references the created account
    const vol = db.volunteers.find((v: any) => v.email === email);
    expect(vol.userId).toBe(user.id);

    // Login blocked before the volunteer activates (no password yet)
    const blocked = await request(app).post("/api/auth/login").send({
      email,
      password: "Whatever123!",
    });
    expect(blocked.status).toBe(401);

    // Volunteer activates their account (sets password)
    const activate = await request(app).post("/api/auth/activate").send({
      token: user.verificationToken,
      password: "VolunteerPass1!",
    });
    expect(activate.status).toBe(200);
    expect(activate.body.user.role).toBe("VOLUNTEER");
    expect(activate.body.user.emailVerified).toBe(true);

    // Volunteer can now sign in through the standard login page
    const login = await request(app).post("/api/auth/login").send({
      email,
      password: "VolunteerPass1!",
    });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();
    expect(login.body.user.role).toBe("VOLUNTEER");
  });

  it("allows an admin to delete a volunteer application", async () => {
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    expect(adminLogin.status).toBe(200);
    const adminToken = adminLogin.body.token;

    const create = await request(app).post("/api/volunteers").send({
      fullName: "Delete Me Volunteer",
      email: `vol-del-${Date.now()}@example.com`,
      phone: "+1 (604) 555-9999",
      availability: "Teardown shift",
    });
    expect(create.status).toBe(201);

    const del = await request(app)
      .delete(`/api/volunteers/${create.body.volunteer.id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(del.status).toBe(200);

    const list = await request(app)
      .get("/api/volunteers")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(list.body.find((v: any) => v.id === create.body.volunteer.id)).toBeUndefined();
  });
});
