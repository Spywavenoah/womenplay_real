# WomenPlay — Go-Live Checklist

Default database engine: **Supabase (Postgres)** via `DATABASE_URL` connection string.
Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

---

## 1. Supabase — default database engine
- [x] Create Supabase project (or use existing `kkdvkkzxevgkvtwyiwxm`) — project is live; connected via pooler
- [x] Copy the **direct/pooler Postgres connection string** from Supabase Dashboard → Settings → Database → Connection string — using `aws-0-eu-west-1.pooler.supabase.com:6543` (transaction pooler; the `db.<ref>` direct host is IPv6-only)
- [x] Set `DATABASE_URL` to the Supabase connection string in production env (server-only, never in the repo) — verified live: server connects, auto-creates `womenplay_store`, writes/reads state end-to-end
- [x] Confirm `womenplay_store` table (key/value JSONB) is auto-created on first boot (`server.ts` does this already) — verified in Supabase (`SELECT key FROM womenplay_store` → `app_db`)
- [ ] Keep `database.json` as an **offline dev fallback only** — remove it as a fallback in production if desired
- [x] Set `DB_SSL=true` in production (Supabase requires TLS) — added `?sslmode=require` support in `parsePostgresUrl`/`getPgSsl` (pooler uses a self-signed cert; `rejectUnauthorized:false` for `require`/`prefer`/`allow`, strict for `verify-ca`/`verify-full`)
- [x] **Rotate the leaked Supabase keys** (anon + service_role) in the Supabase dashboard — done (new keys issued; rotate again since shared in chat)
- [x] Replace `.env.example` values with placeholders (`SUPABASE_URL=...`, `SUPABASE_ANON_KEY=...`, `SUPABASE_SERVICE_ROLE_KEY=...` with no real secrets)
- [x] Add real `.env` to `.gitignore` (verify it's ignored) — added `tests/.test-database.json` too
- [ ] Enable PITR (point-in-time recovery) on the Supabase project
- [ ] Run a restore drill from a backup into a staging project
- [x] Add database status check to `/api/db/status` so startup logs the engine clearly (already returns `postgresql` vs `local_json`) — verified `engine=postgresql, postgresConnected=true`

## 2. Security hardening (backend)
- [x] Add `helmet` middleware (strict CSP, HSTS, no-sniff, frame protection)
- [x] Add CORS with an allowlist of production origins (deny by default)
- [x] Reduce body limit from `50mb` → `10mb`
- [x] Add auth rate limiting (20 req/15 min on login/register/2FA)
- [x] Move `JWT_SECRET` to env-only, fail fast at startup if missing in production
- [x] Replace hardcoded `rejectUnauthorized: false` with env-driven TLS config (`DB_SSL`, `DB_SSL_REJECT_UNAUTHORIZED`, `SMTP_REJECT_UNAUTHORIZED`)
- [x] Make TLS verification strict (`true`) for the Supabase connection in production
- [x] Add input validation middleware for all POST/PUT bodies — declarative `validateBody()` rule engine applied to auth, admin, and profile routes (required/type/email/length/pattern/oneOf)
- [x] Remove the mock Stripe test keys from default `settings`
- [x] Ensure `safeUser`/owner checks are applied on every sensitive route

## 3. Authentication & 2FA
- [ ] Test full registration flow in production env (verification email → login → mandatory 2FA setup)
- [x] Verify TOTP 2FA works (setup, login verification, recovery/reset) — fixed `otplib@13` API usage (`generateSecret`/`generateURI`/`verifySync`); unit-tested verify-2fa rejection path
- [x] Add password reset flow — `POST /api/auth/forgot-password` + `POST /api/auth/reset-password` (1h expiry, token consumed on use), AuthModal "Forgot your password?" link, dedicated `/reset-password?token=` page; rate-limited
- [x] Test account lockout / rate limiting on repeated failed logins — `tests/smoke.test.ts` boots a server with `AUTH_RATE_LIMIT_MAX=3` and asserts 429 after the limit

## 4. Payments (Stripe)
- [x] Replace mock Stripe keys (`pk_test_51Mock...` / `sk_test_51Mock...`) with real live keys via env
- [ ] Create live Stripe products/prices for Basic / Premium / Elite badges
- [x] Implement a **Stripe webhook endpoint** with signature verification for `checkout.session.completed`, `invoice.payment_failed`, `customer.subscription.deleted`
<<<<<<< HEAD
- [x] Launch Experience tickets (`/tickets`) checkout via Stripe — `POST /api/tickets/checkout` creates a Checkout Session using the admin-configured keys; `GET /api/tickets/success` + the `checkout.session.completed` webhook (`metadata.kind = "launch-ticket"`) record the purchase and email the attendee the `event-access-pass` badge. Requires `STRIPE_WEBHOOK_SECRET` to be set for reliable confirmation.
=======
>>>>>>> a8dfaa8e65d41e35805fca80f3b6fd0da224b4a8
- [ ] Test checkout, refund, and subscription flows against the live Stripe API (test mode first)
- [ ] Confirm PCI scope is empty (no raw card data handled — via Stripe Checkout/Elements)
- [ ] Verify payment ledger (`/api/payments`) records only what Stripe confirms

## 5. Email & SMTP
- [ ] Configure a deliverable SMTP provider (e.g., Resend, Mailgun, SES) — not a shared cPanel mail server
- [ ] Verify SPF, DKIM, DMARC records for the sending domain (`womenplay.org`)
- [ ] Set `SMTP_HOST/PORT/USER/PASS/FROM` in production env
- [ ] Test every transactional template: verification, password reset, 2FA, registration confirmation, event booking, contact reply, support ticket, newsletter
- [ ] Confirm alerts (registration, event booking, contact, support) actually send

## 6. AI (Gemini)
- [ ] Provision a production `GEMINI_API_KEY` with quota/budget limits
- [ ] Verify the AI features (mentoring, Q&A) behave in production and handle API failures gracefully

## 7. Frontend
- [x] **Code-split the bundle** (was a single 1,425 kB chunk) — `React.lazy()` + `Suspense` for Portal, AdminDashboard, HomeView, legal views, and modals; main bundle now ~332 kB (96 kB gzip)
- [x] Remove dead code: `src/context/AppContext.tsx` (unused), `server/` folder (unreferenced), `vitest.config.ts` + old `server/__tests__/`
- [ ] Accessibility pass (labels, focus, contrast, keyboard nav)
- [ ] Responsive pass on mobile/tablet for Portal and AdminDashboard
- [ ] Final UI review: header, home, portal, admin, auth, modals

## 8. Testing (restore the suite)
- [x] Add vitest + supertest back as devDependencies
- [x] Rebuild tests to hit the **real** backend (`server.ts`) — `tests/api.test.ts` via supertest against the exported `app`
- [x] Test register / duplicate / weak password / login / wrong password / 2FA / RBAC / verification / password reset
- [x] Add a smoke test that boots the full app (`dist/server.cjs`) and hits `/api/db/status`, `/api/events`, SPA root, and auth — `tests/smoke.test.ts`
- [x] Add `test` script to `package.json` (`npm test` → `vitest run`)
- [ ] Get `npm run lint` (tsc) + `npm test` green in CI

## 9. Deployment
- [ ] Pick a host for the Node/Express server (e.g., Render, Railway, Fly.io, or Cloud Run)
- [ ] Add production config: env vars, secrets, domain, HTTPS cert
- [ ] Verify SPA fallback + static asset serving from `dist/`
- [ ] Set up CI/CD (GitHub Actions): install → lint → test → build → deploy
- [x] Add a health-check endpoint (`/api/health`) and wire to uptime monitor
- [x] Test the production build end-to-end (`npm run build && npm start`)

## 10. Monitoring & Ops
- [x] Structured logging (request IDs, error context) — `X-Request-Id` middleware (echoes client id or generates one) + `[req:...] METHOD path -> status (ms)` logs for all `/api/*`; frontend interceptor sends a `web_*` request id
- [ ] Error tracking (Sentry or similar) for server + frontend
- [ ] Uptime monitoring + alerting on `/api/health` and `/api/db/status`
- [ ] Scheduled Supabase backups + documented restore procedure
- [ ] Secret rotation policy + checklist (JWT, Stripe, SMTP, Supabase, Gemini)

## 11. Compliance & Legal
- [ ] Privacy Policy (with Supabase + Stripe + email provider as data processors)
- [ ] Terms of Service
- [ ] Cookie banner / consent if required by jurisdiction (GDPR/CCPA)
- [ ] Account deletion / data export flow
- [ ] Payment receipts + record keeping per accounting rules

## 12. Pre-launch validation
- [ ] Full E2E walkthrough: register → verify email → 2FA → choose badge → pay → book event → use QR check-in → submit support ticket → admin reviews
- [ ] Load test (concurrent logins, event registrations, feed posts)
- [ ] Security review pass (headers, secrets, authz on all admin routes)
- [ ] Rollback plan documented
- [ ] Launch 🚀
