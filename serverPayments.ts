import express from "express";
import Stripe from "stripe";
import { LaunchTicket, LocalDatabase, User, UserRole, MembershipStatus, MembershipTier, Payment } from "./src/types";
import { renderEmailTemplate } from "./serverEmailTemplates";

// ---------------------------------------------------------------------------
// Launch Experience ticket sales (Stripe Checkout).
// All state is injected via LaunchRoutesContext — the module is pure wiring
// over the shared `db` reference and never mutates global module state.
// ---------------------------------------------------------------------------

export const LAUNCH_EVENT = {
  name: "WomenPlay Launch Experience - Jersey Style",
  date: "Saturday, October 24, 2026 (1:00 PM - 6:00 PM)",
  location: "Surrey, BC"
};

export const LAUNCH_TICKET_TIERS: Record<string, { name: string; price: number }> = {
  "early-bird": { name: "Early Bird", price: 69.99 },
  "last-call": { name: "Last Call", price: 89.99 }
};

export interface LaunchRoutesContext {
  db: LocalDatabase;
  saveDatabase: () => void;
  getStripe: () => Stripe | null;
  emailPattern: RegExp;
  requireAdmin: express.RequestHandler;
  sendNotificationEmail: (subject: string, htmlContent: string, customRecipient?: string) => Promise<unknown>;
}

// Idempotently record a confirmed launch-ticket purchase (used by both the
// success URL handler and the Stripe webhook) and email the access pass.
export async function recordLaunchTicketPurchase(
  session: Stripe.Checkout.Session,
  ctx: LaunchRoutesContext,
  requestOrigin?: string
): Promise<boolean> {
  const { db, saveDatabase, sendNotificationEmail } = ctx;
  if (!db.launchTickets) db.launchTickets = [];
  if (!session.id || db.launchTickets.find(t => t.sessionId === session.id)) {
    return false;
  }

  const meta = session.metadata || {};
  const attendeeEmail = (meta.attendeeEmail || session.customer_details?.email || session.customer_email || "").trim();
  const attendeeName = (meta.attendeeName || session.customer_details?.name || "Guest").trim();
  const tierKey = meta.ticketType || "early-bird";
  const tier = LAUNCH_TICKET_TIERS[tierKey] || LAUNCH_TICKET_TIERS["early-bird"];
  const quantity = Math.min(Math.max(parseInt(meta.quantity || "1", 10) || 1, 1), 20);
  const amountPaid = session.amount_total ? session.amount_total / 100 : tier.price * quantity;

  if (!attendeeEmail) {
    console.error("Launch ticket: no attendee email in session metadata", session.id);
    return false;
  }

  const badgeCode = `LAUNCH-${tierKey.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${Math.floor(Math.random() * 900000 + 100000)}`;
  const receiptNumber = "RCPT-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 90000 + 10000);

  // 1. Check if user account already exists
  if (!db.users) db.users = [];
  const normalizedEmail = attendeeEmail.toLowerCase();
  let existingUser = db.users.find(u => u.email.trim().toLowerCase() === normalizedEmail);

  let userIdForTransaction = "";
  let isNewUserCreated = false;
  let verificationToken = "";

  if (existingUser) {
    userIdForTransaction = existingUser.id;
    if (!existingUser.phone && meta.phone) {
      existingUser.phone = meta.phone;
    }
  } else {
    // User does not exist: create an account with a verification token for activation
    isNewUserCreated = true;
    const newUserId = "user-" + Math.random().toString(36).substr(2, 9);
    verificationToken = "vtoken_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);

    const newUser: User = {
      id: newUserId,
      email: attendeeEmail,
      fullName: attendeeName,
      role: UserRole.MEMBER,
      membershipStatus: MembershipStatus.PENDING,
      membershipTier: MembershipTier.BASIC,
      phone: meta.phone || undefined,
      company: meta.teamPreference ? `Team: ${meta.teamPreference}` : "",
      emailVerified: false,
      verificationToken,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    userIdForTransaction = newUserId;
  }

  // 2. Save the launch ticket record
  const ticket: LaunchTicket = {
    id: "ticket-" + Math.random().toString(36).substr(2, 9),
    sessionId: session.id,
    attendeeName,
    attendeeEmail,
    phone: meta.phone || undefined,
    ticketType: tierKey,
    ticketName: tier.name,
    quantity,
    unitPrice: tier.price,
    amountPaid,
    badgeCode,
    teamPreference: meta.teamPreference || undefined,
    createdAt: new Date().toISOString()
  };
  db.launchTickets.unshift(ticket);

  // 3. Record transaction details in the user's account transaction history
  if (!db.payments) db.payments = [];
  const paymentRecord: Payment = {
    id: "pay-" + Math.random().toString(36).substr(2, 9),
    userId: userIdForTransaction,
    amount: amountPaid,
    purpose: `Launch Experience Ticket - ${tier.name}`,
    itemId: ticket.id,
    status: "completed",
    method: "Credit Card (Stripe)",
    transactionId: `TXN-STRIPE-L-${session.id.slice(-12)}`,
    createdAt: new Date().toISOString(),
    receiptNumber
  };
  db.payments.unshift(paymentRecord);

  // 4. Audit logging
  db.auditLogs.unshift({
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: "system",
    adminName: "Stripe Gateway",
    action: "LAUNCH_TICKET_PURCHASED",
    details: `${attendeeName} (${attendeeEmail}) confirmed ${quantity} x ${tier.name} Launch ticket ($${amountPaid.toFixed(2)}). ${isNewUserCreated ? "New account created (activation email queued)" : "Existing account (transaction ledger updated)"}`,
    timestamp: new Date().toISOString()
  });

  saveDatabase();

  const siteOrigin = (requestOrigin || process.env.APP_URL || "https://womenplay.org").replace(/\/+$/, "");

  // 5. EMAIL 1: Send Event Access Badge designed with QR Code to attendee email
  const renderedBadge = renderEmailTemplate("event-access-pass", {
    userName: attendeeName,
    userEmail: attendeeEmail,
    eventName: LAUNCH_EVENT.name,
    eventDate: LAUNCH_EVENT.date,
    eventLocation: LAUNCH_EVENT.location,
    ticketCode: badgeCode,
    ticketPackage: `${tier.name} Ticket${quantity > 1 ? ` (Qty: ${quantity})` : ""}`,
    ticketPrice: amountPaid.toFixed(2),
    appUrl: `${siteOrigin}/portal`,
    teamPreference: meta.teamPreference || "Not specified",
    receiptNumber
  }, db.settings?.emailTemplates);

  if (renderedBadge) {
    sendNotificationEmail(renderedBadge.subject, renderedBadge.bodyHtml, attendeeEmail)
      .then(() => console.log(`🎟️ Event Access Badge with QR Code dispatched to ${attendeeEmail}`))
      .catch(err => console.error("Launch ticket access pass email dispatch failed:", err));
  }

  // 6. EMAIL 2: If the user does not exist, send Account Activation Email
  if (isNewUserCreated && verificationToken) {
    const activationUrl = `${siteOrigin}/activate?token=${verificationToken}`;
    const renderedActivation = renderEmailTemplate("account-activation", {
      userName: attendeeName,
      userEmail: attendeeEmail,
      activationUrl,
      appUrl: siteOrigin,
      eventName: LAUNCH_EVENT.name
    }, db.settings?.emailTemplates);

    if (renderedActivation) {
      sendNotificationEmail(renderedActivation.subject, renderedActivation.bodyHtml, attendeeEmail)
        .then(() => console.log(`✉️ Account activation email dispatched to new attendee ${attendeeEmail}`))
        .catch(err => console.error("Account activation email dispatch failed:", err));
    }
  }

  return true;
}

export function registerLaunchRoutes(app: express.Express, ctx: LaunchRoutesContext): void {
  const { db, getStripe, emailPattern, requireAdmin } = ctx;

  // Stripe Checkout for Launch Experience Tickets
  app.post("/api/tickets/checkout", async (req, res) => {
    const { fullName, email, phone, ticketType, quantity, teamPreference } = req.body || {};

    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return res.status(400).json({ error: "Full name is required." });
    }
    if (!email || typeof email !== "string" || !emailPattern.test(email)) {
      return res.status(400).json({ error: "A valid email address is required." });
    }
    const tier = LAUNCH_TICKET_TIERS[ticketType as string];
    if (!tier) {
      return res.status(400).json({ error: "Please select a valid ticket tier." });
    }
    const qty = Math.min(Math.max(parseInt(quantity, 10) || 1, 1), 20);

    const stripe = getStripe();
    if (!stripe) {
      return res.status(400).json({ error: "Stripe is not configured. Please configure your Stripe API credentials in Admin Settings." });
    }

    try {
      const origin = req.headers.origin || `${req.protocol}://${req.get("host")}` || "http://localhost:3000";
      const idempotencyKey = `wp_launch_${email.toLowerCase().replace(/[^a-z0-9]/g, "")}_${ticketType}_${qty}_${Math.floor(Date.now() / 60000)}`;
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "cad",
            product_data: {
              name: `WomenPlay Launch Experience - ${tier.name} Ticket`,
              description: `${LAUNCH_EVENT.date} \u2022 ${LAUNCH_EVENT.location}`,
            },
            unit_amount: Math.round(tier.price * 100),
          },
          quantity: qty,
        }],
        mode: "payment",
        customer_email: email,
        metadata: {
          kind: "launch-ticket",
          attendeeName: fullName.trim(),
          attendeeEmail: email.trim(),
          phone: phone || "",
          ticketType: ticketType as string,
          quantity: String(qty),
          teamPreference: teamPreference || "",
        },
        success_url: `${origin}/api/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/tickets?stripe_cancel=true`,
      }, {
        idempotencyKey,
      });

      return res.json({ checkoutUrl: session.url });
    } catch (e: any) {
      console.error("Stripe Launch Ticket Checkout Error:", e);
      return res.status(500).json({ error: e.message || "Failed to create Stripe Checkout Session" });
    }
  });

  // Stripe Launch Ticket success handler — records the purchase, emails the
  // access pass, then returns the attendee to the tickets page.
  app.get("/api/tickets/success", async (req, res) => {
    const { session_id } = req.query;
    const stripe = getStripe();
    let paid = false;

    const requestOrigin = (req.headers.origin as string) || `${req.protocol}://${req.get("host")}`;

    if (stripe && session_id) {
      try {
        const session = await stripe.checkout.sessions.retrieve(session_id as string);
        paid = session.payment_status === "paid";
        if (paid) {
          await recordLaunchTicketPurchase(session, ctx, requestOrigin);
        }
      } catch (e) {
        console.error("Failed to retrieve Stripe launch ticket session:", e);
      }
    }

    if (!paid) {
      return res.redirect("/tickets?stripe_error=true");
    }

    res.redirect("/tickets?ticket_success=true");
  });

  // Admin ledger of launch ticket sales (support tickets use /api/tickets).
  app.get("/api/launch-tickets", requireAdmin, (req, res) => {
    const tickets = (db.launchTickets || []).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json(tickets);
  });
}