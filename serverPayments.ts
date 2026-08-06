import express from "express";
import Stripe from "stripe";
import { LaunchTicket, LocalDatabase } from "./src/types";
import { renderEmailTemplate } from "./serverEmailTemplates";

// ---------------------------------------------------------------------------
// Launch Experience ticket sales (Stripe Checkout).
// All state is injected via LaunchRoutesContext — the module is pure wiring
// over the shared `db` reference and never mutates global module state.
// ---------------------------------------------------------------------------

export const LAUNCH_EVENT = {
  name: "WomenPlay Launch Experience - Jersey Style",
  date: "Saturday, September 19, 2026 (1:00 PM - 6:00 PM)",
  location: "Surrey, BC"
};

export const LAUNCH_TICKET_TIERS: Record<string, { name: string; price: number }> = {
  "early-bird": { name: "Early Bird", price: 49.99 },
  regular: { name: "Regular", price: 69.99 },
  "last-call": { name: "Last Call", price: 79.99 }
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
  ctx: LaunchRoutesContext
): Promise<boolean> {
  const { db, saveDatabase, sendNotificationEmail } = ctx;
  if (!db.launchTickets) db.launchTickets = [];
  if (!session.id || db.launchTickets.find(t => t.sessionId === session.id)) {
    return false;
  }

  const meta = session.metadata || {};
  const attendeeEmail = meta.attendeeEmail || session.customer_details?.email || session.customer_email || "";
  const attendeeName = meta.attendeeName || session.customer_details?.name || "Guest";
  const tierKey = meta.ticketType || "regular";
  const tier = LAUNCH_TICKET_TIERS[tierKey] || LAUNCH_TICKET_TIERS.regular;
  const quantity = Math.min(Math.max(parseInt(meta.quantity || "1", 10) || 1, 1), 20);
  const amountPaid = session.amount_total ? session.amount_total / 100 : tier.price * quantity;

  if (!attendeeEmail) {
    console.error("Launch ticket: no attendee email in session metadata", session.id);
    return false;
  }

  const badgeCode = `LAUNCH-${tierKey.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${Math.floor(Math.random() * 900000 + 100000)}`;
  const receiptNumber = "RCPT-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 90000 + 10000);

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

  if (!db.payments) db.payments = [];
  db.payments.unshift({
    id: "pay-" + Math.random().toString(36).substr(2, 9),
    userId: attendeeEmail,
    amount: amountPaid,
    purpose: "Event Registration",
    itemId: "launch-ticket",
    status: "completed",
    method: "Credit Card",
    transactionId: `TXN-STRIPE-L-${session.id.slice(-12)}`,
    createdAt: new Date().toISOString(),
    receiptNumber
  });

  db.auditLogs.unshift({
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: "system",
    adminName: "Stripe Gateway",
    action: "LAUNCH_TICKET_PURCHASED",
    details: `${attendeeName} (${attendeeEmail}) purchased ${quantity} x ${tier.name} Launch ticket for $${amountPaid.toFixed(2)}`,
    timestamp: new Date().toISOString()
  });

  saveDatabase();

  // Email the Event Access Pass with the attendee's badge details
  if (db.settings?.smtpSettings?.alertOnEventBooking) {
    const rendered = renderEmailTemplate("event-access-pass", {
      userName: attendeeName,
      userEmail: attendeeEmail,
      eventName: LAUNCH_EVENT.name,
      eventDate: LAUNCH_EVENT.date,
      eventLocation: LAUNCH_EVENT.location,
      ticketCode: badgeCode,
      ticketPackage: `${tier.name} Ticket${quantity > 1 ? ` x${quantity}` : ""}`,
      ticketPrice: amountPaid.toFixed(2)
    }, db.settings?.emailTemplates);
    if (rendered) {
      sendNotificationEmail(rendered.subject, rendered.bodyHtml, attendeeEmail)
        .catch(err => console.error("Launch ticket access pass email dispatch failed:", err));
    }
  }

  return true;
}

export function registerLaunchRoutes(app: express.Express, ctx: LaunchRoutesContext): void {
  const { db, saveDatabase, getStripe, emailPattern, requireAdmin } = ctx;

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
      const origin = req.headers.origin || "http://localhost:3000";
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
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
          attendeeEmail: email,
          phone: phone || "",
          ticketType: ticketType as string,
          quantity: String(qty),
          teamPreference: teamPreference || "",
        },
        success_url: `${origin}/api/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/tickets?stripe_cancel=true`,
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

    if (stripe && session_id) {
      try {
        const session = await stripe.checkout.sessions.retrieve(session_id as string);
        paid = session.payment_status === "paid";
        if (paid) {
          await recordLaunchTicketPurchase(session, ctx);
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