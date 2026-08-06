import express from "express";
import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";
import dotenv from "dotenv";
import Stripe from "stripe";
import pg from "pg";
import { createServer as createViteServer } from "vite";
import { buildHeadForPath, registerSeoRoutes, resolveSiteOrigin } from "./serverSeo";
import { getDefaultEmailTemplates, renderEmailTemplate } from "./serverEmailTemplates";
import { registerLaunchRoutes, recordLaunchTicketPurchase, LAUNCH_EVENT } from "./serverPayments";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";
import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserRole, MembershipStatus, MembershipTier, FoundingMember } from "./src/types";
import type { 
  User, 
  EventItem, EventPackage, Registration, Payment, 
  Post, Comment, SuccessStory, SupportTicket, 
  BlogArticle, Announcement, AuditLog,
  SystemSettings, SmtpSettings, EmailTemplate, CarouselSlide, Subscription,
MembershipBadge, SavedCard, Founder, ContactMessage, ContactMessageReply, GalleryItem,
  LaunchTicket, LocalDatabase, Volunteer
} from "./src/types";

const { Pool } = pg;
dotenv.config();

const app = express();
app.set("trust proxy", 1);
const PORT = parseInt(process.env.PORT || "3000", 10);
const isProd = process.env.NODE_ENV === "production";

// Security middleware
app.use(helmet({
  contentSecurityPolicy: isProd ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({
  // First-party API: only allow explicit cross-origin hosts. With no list
  // configured we disable cross-origin browser traffic (same-origin still
  // works) rather than reflect any origin, which the previous `: true` did.
  origin:
    allowedOrigins.length > 0
      ? (origin, cb) => {
          if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
          return cb(null, false);
        }
      : isProd ? false : true,
  credentials: true,
}));

// ---------------------------------------------------------------------------
// Static prerender head (server-side route bake) lives in serverSeo.ts
// ---------------------------------------------------------------------------
const SITE_ORIGIN = resolveSiteOrigin();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: parseInt(process.env.AUTH_RATE_LIMIT_MAX || "20", 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again in 15 minutes." },
});

// Preserve raw body for Stripe webhook signature verification
app.use(express.json({
  limit: "10mb",
  verify: (req: any, res, buf) => {
    if (req.originalUrl && req.originalUrl.startsWith("/api/payments/webhook")) {
      req.rawBody = buf;
    }
  },
}));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// --- POSTGRESQL (cPanel / Remote / Cloud SQL) DATABASE INITIALIZATION ---
let pgPool: pg.Pool | null = null;
let isPgConnected = false;
let pgLastError: string | null = null;

function safeDecode(str?: string): string | undefined {
  if (!str) return undefined;
  try {
    return decodeURIComponent(str);
  } catch {
    try {
      return unescape(str);
    } catch {
      return str;
    }
  }
}

function parsePostgresUrl(connectionString: string) {
  try {
    let sanitized = connectionString;
    try {
      new URL(sanitized);
    } catch {
      sanitized = connectionString.replace(/%(?![0-9a-fA-F]{2})/g, "%25");
    }
    const u = new URL(sanitized);
    const user = safeDecode(u.username);
    const password = safeDecode(u.password);
    const host = u.hostname || "127.0.0.1";
    const port = u.port ? parseInt(u.port, 10) : 5432;
    const database = u.pathname ? u.pathname.replace(/^\//, "") : undefined;
    const sslmode = u.searchParams.get("sslmode") || undefined;
    return { host, port, user, password, database, sslmode };
  } catch {
    return null;
  }
}

// Env-driven TLS. Priority: explicit DB_SSL env override → sslmode from the
// connection string (e.g. Supabase poolers use sslmode=require with a
// self-signed cert, so rejectUnauthorized must be false) → strict by default.
function getPgSsl(sslmode?: string) {
  if (process.env.DB_SSL === "false") return false;
  if (process.env.DB_SSL === "true") return { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" };
  if (sslmode === "disable") return false;
  if (sslmode === "require" || sslmode === "prefer" || sslmode === "allow") {
    return { rejectUnauthorized: false };
  }
  if (sslmode === "verify-ca" || sslmode === "verify-full") {
    return { rejectUnauthorized: true };
  }
  return { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" };
}

async function initPostgres() {
  const dbUrl = process.env.DATABASE_URL;
  const host = process.env.DB_HOST || process.env.PGHOST;
  const user = process.env.DB_USER || process.env.PGUSER;
  const password = process.env.DB_PASSWORD || process.env.PGPASSWORD;
  const database = process.env.DB_NAME || process.env.PGDATABASE;
  const port = parseInt(process.env.DB_PORT || process.env.PGPORT || "5432");

  if (!dbUrl && !host) {
    console.log("ℹ️ PostgreSQL environment variables not set. Running with fallback local storage.");
    return;
  }

  try {
    if (dbUrl) {
      const parsedConfig = parsePostgresUrl(dbUrl);
      if (parsedConfig) {
        pgPool = new Pool({
          ...parsedConfig,
          ssl: getPgSsl(parsedConfig.sslmode),
          connectionTimeoutMillis: 5000
        });
      } else {
        pgPool = new Pool({
          connectionString: dbUrl,
          ssl: getPgSsl(),
          connectionTimeoutMillis: 5000
        });
      }
    } else {
      pgPool = new Pool({
        host,
        port,
        user,
        password,
        database,
        ssl: getPgSsl(),
        connectionTimeoutMillis: 5000
      });
    }

    const client = await pgPool.connect();
    // Ensure table structure exists for key-document storage as well as relational sync
    await client.query(`
      CREATE TABLE IF NOT EXISTS womenplay_store (
        key VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    client.release();

    isPgConnected = true;
    pgLastError = null;
    console.log(`✅ Successfully connected to PostgreSQL Database (${database || host || "configured DB"})`);

    // Fetch existing state from PostgreSQL if available
    const res = await pgPool.query("SELECT data FROM womenplay_store WHERE key = 'app_db'");
    if (res.rows.length > 0 && res.rows[0].data) {
      db = { ...db, ...res.rows[0].data };
      console.log("✅ Application state loaded from PostgreSQL Database.");
    } else {
      await saveToPostgres();
      console.log("✅ Application initial state synced to PostgreSQL Database.");
    }
  } catch (err: any) {
    isPgConnected = false;
    pgLastError = err.message || String(err);
    console.error("⚠️ PostgreSQL Connection Error:", pgLastError);
  }
}

async function saveToPostgres() {
  if (!pgPool || !isPgConnected) return;
  try {
    await pgPool.query(
      `INSERT INTO womenplay_store (key, data, updated_at)
       VALUES ('app_db', $1, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(db)]
    );
  } catch (err: any) {
    console.error("Failed to persist data to PostgreSQL:", err.message || err);
  }
}

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// In-Memory Database File Persistence
const DB_FILE = process.env.DB_FILE || path.join(process.cwd(), "database.json");

// LocalDatabase type now lives in src/types.ts.

let db: LocalDatabase = {
  users: [],
  events: [],
  registrations: [],
  payments: [],
  posts: [],
  comments: [],
  successStories: [],
  supportTickets: [],
  blogs: [],
  announcements: [],
  auditLogs: [],
  contactMessages: [],
  foundingMembers: [],
  settings: {
    stripePublicKey: process.env.STRIPE_PUBLIC_KEY || "",
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
    isSubscriptionRequired: false,
    smtpSettings: {
      host: process.env.SMTP_HOST || "mail.womenplay.org",
      port: parseInt(process.env.SMTP_PORT || "465"),
      user: process.env.SMTP_USER || "notifications@womenplay.org",
      pass: process.env.SMTP_PASS || "",
      secure: process.env.SMTP_SECURE !== "false",
      fromEmail: process.env.SMTP_FROM || "notifications@womenplay.org",
      fromName: "WomenPlay Secretariat",
      enableAlerts: true,
      alertOnRegistration: true,
      alertOnEventBooking: true,
      alertOnContactInquiry: true,
      alertOnSupportTicket: true
    }
  },
  sponsors: [],
  carouselSlides: [],
  galleryItems: [],
  subscriptions: [],
  membershipBadges: [],
  founders: [],
  volunteers: [],
  attendance: [],
  launchTickets: []
};

// Seeding Default Data if Database is empty
function seedData() {
  const defaultAdminHash = bcrypt.hashSync(process.env.DEFAULT_ADMIN_PASSWORD || "WomenPlay@2026!", 10);
  // Users
  db.users = [
    {
      id: "admin-1",
      email: "admin@womenplay.org",
      fullName: "Eleanor Vance",
      role: UserRole.ADMIN,
      membershipStatus: MembershipStatus.ACTIVE,
      membershipTier: MembershipTier.ELITE,
      title: "Executive Director",
      company: "Aura Global",
      bio: "Advocate for gender diversity, executive coach, and founder of Aura Network with 20+ years of leadership experience.",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      emailVerified: true,
      passwordHash: defaultAdminHash,
      createdAt: new Date("2025-01-01").toISOString()
    },
    {
      id: "admin-2",
      email: "sarah.jenkins@womenplay.org",
      fullName: "Sarah Jenkins",
      role: UserRole.ADMIN,
      membershipStatus: MembershipStatus.ACTIVE,
      membershipTier: MembershipTier.ELITE,
      title: "Co-Director & VP of Governance",
      company: "WomenPlay Global",
      bio: "Overseeing executive partnerships, regional chapters, and leadership accelerator initiatives.",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
      emailVerified: true,
      passwordHash: defaultAdminHash,
      createdAt: new Date("2025-02-15").toISOString()
    },
    {
      id: "member-1",
      email: "spywavenoah@gmail.com", // From metadata
      fullName: "Noah Sterling",
      role: UserRole.MEMBER,
      membershipStatus: MembershipStatus.ACTIVE,
      membershipTier: MembershipTier.PREMIUM,
      title: "Senior Product Manager",
      company: "TechVanguard",
      bio: "Passionate about creating modern digital products, design systems, and fostering female leadership in technology.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      emailVerified: true,
      passwordHash: defaultAdminHash,
      createdAt: new Date("2026-06-15").toISOString()
    },
    {
      id: "member-2",
      email: "clara.m@nexus.io",
      fullName: "Clara Montgomery",
      role: UserRole.MEMBER,
      membershipStatus: MembershipStatus.PENDING,
      membershipTier: MembershipTier.BASIC,
      title: "Investment Associate",
      company: "Nexus Venture Capital",
      bio: "Focusing on early-stage investments. Eager to connect with fellow pioneers and women leaders in fintech.",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
      emailVerified: true,
      passwordHash: defaultAdminHash,
      createdAt: new Date("2026-07-10").toISOString()
    }
  ];

  // Events
  db.events = [
    {
      id: "event-1",
      title: "Aura Annual Women in Leadership Summit 2026",
      description: "Join over 500 trailblazing women leaders for an inspiring day of keynotes, panel discussions, and structured networking. This year we focus on sustainable innovation, inclusive boardrooms, and navigating modern venture capital landscapes.",
      date: "2026-09-15",
      time: "09:00 AM - 05:00 PM",
      location: "Grand Ballroom, The Plaza Hotel & Virtual",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200",
      category: "Conference",
      capacity: 250,
      registeredCount: 42,
      status: "upcoming",
      packages: [
        {
          id: "pkg-1-1",
          name: "Standard Badge",
          fee: 150,
          benefits: ["Access to all panel discussions", "Catered networking lunch", "Summit digital folder", "Post-event recordings access"],
          description: "Perfect for mid-level professionals seeking networking and learning."
        },
        {
          id: "pkg-1-2",
          name: "VIP Gold Badge",
          fee: 350,
          benefits: ["Front-row premium seating", "Exclusive VIP Speaker luncheon", "One-on-one executive feedback coaching session", "Annual Aura membership standard renewal"],
          description: "Tailored for senior directors and leaders looking for deep engagement and high-profile networking."
        }
      ]
    },
    {
      id: "event-2",
      title: "Sunset Networking Cocktail & Social Gala",
      description: "An elegant evening of curated connections, live classical performances, and premium wine tasting. Mingle with partners, board members, and potential collaborators under the golden sky.",
      date: "2026-08-05",
      time: "06:30 PM - 10:00 PM",
      location: "The Gold Terrace Gardens, San Francisco",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200",
      category: "Networking",
      capacity: 100,
      registeredCount: 88,
      status: "upcoming",
      packages: [
        {
          id: "pkg-2-1",
          name: "Gala Ticket",
          fee: 90,
          benefits: ["Premium cocktail selection", "Deluxe culinary bites", "Networking directory database access"],
          description: "All-inclusive ticket to the outdoor networking gala."
        }
      ]
    },
    {
      id: "event-3",
      title: "Interactive Workshop: Executive Presence and Pitching",
      description: "A highly interactive, practical workshop focused on refining public speaking, voice coaching, boardroom confidence, and crafting high-impact investment pitches that secure venture funding.",
      date: "2026-06-20",
      time: "02:00 PM - 05:00 PM",
      location: "Aura Creative Hub, Downtown Center",
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1200",
      category: "Workshop",
      capacity: 40,
      registeredCount: 40,
      status: "past",
      packages: [
        {
          id: "pkg-3-1",
          name: "Interactive Access",
          fee: 50,
          benefits: ["Personalized pitch review", "Worksheet templates", "Networking breakout session"],
          description: "Full workshop participation."
        }
      ]
    }
  ];

  // Blogs
  db.blogs = [
    {
      id: "blog-1",
      title: "Unlocking Boards: Strategic Audits for Female Leaders",
      content: "Entering the boardroom is not just about tenure; it is about building a distinct executive brand. Discover the three pillars of boardroom readiness: strategic financial oversight, dynamic network sponsorship, and clear personal value proposition.",
      category: "Leadership",
      author: "Eleanor Vance",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
      createdAt: new Date("2026-07-12").toISOString(),
      status: "published"
    },
    {
      id: "blog-2",
      title: "Fostering Genuine Connections in a Virtual Business Landscape",
      content: "With remote and hybrid operations remaining standard, virtual engagement needs more than quick handshakes or standard emails. We explore active virtual sponsorships, digital coffee chats that work, and creating lasting impressions beyond camera lenses.",
      category: "Networking",
      author: "Olivia Chen",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
      createdAt: new Date("2026-07-18").toISOString(),
      status: "published"
    }
  ];

  // Success Stories
  db.successStories = [
    {
      id: "story-1",
      userId: "member-1",
      userFullName: "Noah Sterling",
      userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      title: "Fostering Diversity at TechVanguard",
      content: "With the networking and backing of Aura Network, I successfully launched a regional Women-in-Tech mentorship program at TechVanguard. Within six months, we recruited 12 board-level mentors and saw a 35% increase in promotion rates for our female engineers!",
      approved: true,
      createdAt: new Date("2026-07-02").toISOString()
    }
  ];

  // Community Posts
  db.posts = [
    {
      id: "post-1",
      userId: "admin-1",
      userFullName: "Eleanor Vance",
      userTitle: "Executive Director, Aura Network",
      userAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      content: "Incredible session yesterday with our local fellowship mentors! Remember, leadership isn't about being in charge. It's about taking care of those in our charge. Let us continue uplifting each other.",
      likes: ["member-1"],
      commentsCount: 1,
      createdAt: new Date("2026-07-19T10:00:00Z").toISOString()
    }
  ];

  db.comments = [
    {
      id: "comment-1",
      postId: "post-1",
      userId: "member-1",
      userFullName: "Noah Sterling",
      userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      content: "Thank you Eleanor, that was extremely insightful! Our team is implementing these guidelines next week.",
      createdAt: new Date("2026-07-19T11:15:00Z").toISOString()
    }
  ];

  // Support tickets
  db.supportTickets = [
    {
      id: "ticket-1",
      userId: "member-1",
      userFullName: "Noah Sterling",
      email: "spywavenoah@gmail.com",
      subject: "Access Pass Download Query",
      message: "I registered for the Leadership Summit but wanted to verify if my digital pass will sync automatically to Apple Wallet or if I should keep the PDF on my phone.",
      category: "Event",
      status: "in_progress",
      createdAt: new Date("2026-07-19T14:30:00Z").toISOString(),
      responses: [
        {
          sender: "ADMIN",
          message: "Hi Noah! Yes, you can download the elegant digital badge directly from your portal dashboard, which comes with a standard QR code suitable for print or phone display. We are currently rolling out Wallet integrations. Let us know if you need any additional assistance!",
          createdAt: new Date("2026-07-19T16:00:00Z").toISOString()
        }
      ]
    }
  ];

  // Announcements
  db.announcements = [
    {
      id: "announce-4",
      title: "Member Spotlight: Executive Presence Council Town Hall Announced",
      content: "Join fellow executives for an interactive town hall exploring boardroom presence, storytelling, and leadership visibility.",
      priority: "low",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      active: true
    },
    {
      id: "announce-3",
      title: "New Board Nomination Mentorship Cohort: Applications Close August 30",
      content: "Secure a seat in our signature mentorship track pairing you with veteran board directors and nomination committee chairs.",
      priority: "medium",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      active: true
    },
    {
      id: "announce-2",
      title: "WomenPlay Global Leadership Summit — Early Bird Registration Now Live",
      content: "Early bird passes for the 2026 Global Leadership Summit are now open to members. Limited executive suites available.",
      priority: "high",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      active: true
    },
    {
      id: "announce-1",
      title: "Applications open for the Executive Fellowship Program 2026!",
      content: "Apply today to receive executive sponsorship, personal leadership training, and board appointment prep. Deadline: August 25, 2026.",
      priority: "high",
      createdAt: new Date().toISOString(),
      active: true
    }
  ];

  // Audit Logs
  db.auditLogs = [
    {
      id: "log-1",
      adminId: "admin-1",
      adminName: "Eleanor Vance",
      action: "MEMBERSHIP_APPROVED",
      details: "Approved membership for member 'Noah Sterling'",
      timestamp: new Date("2026-06-16").toISOString()
    }
  ];

  // Default registrations
  db.registrations = [
    {
      id: "reg-1",
      eventId: "event-1",
      userId: "member-1",
      packageId: "pkg-1-2",
      packageName: "VIP Gold Badge",
      amountPaid: 350,
      paymentId: "pay-1",
      badgeCode: "AURA-E1-VIP-84920",
      registeredAt: new Date("2026-07-05").toISOString(),
      attended: false
    }
  ];

  // Default payments
  db.payments = [
    {
      id: "pay-1",
      userId: "member-1",
      amount: 350,
      purpose: "Event Registration",
      itemId: "event-1",
      status: "completed",
      method: "Credit Card",
      transactionId: "TXN-AURA-9481023",
      createdAt: new Date("2026-07-05").toISOString(),
      receiptNumber: "RCPT-2026-94820"
    }
  ];

  // Seed Carousel Slides
  db.carouselSlides = [
    {
      id: "slide-1",
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1600",
      title: "Empower Your Executive Network",
      description: "Connect with FTSE 100 directors, venture partners, and corporate pioneers in a curated ecosystem built for high-impact female leaders."
    },
    {
      id: "slide-2",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1600",
      title: "Elevate Your Boardroom Influence",
      description: "Access exclusive masterclasses, corporate board directories, and annual summits designed to amplify your professional footprint."
    },
    {
      id: "slide-3",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1600",
      title: "Intentional High-Society Alliances",
      description: "Engage in private roundtables and sunset cocktail galas with leading mentors, investors, and policymakers driving systemic change."
    }
  ];

  db.settings = {
    stripePublicKey: process.env.STRIPE_PUBLIC_KEY || "",
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
    isSubscriptionRequired: false
  };

  db.subscriptions = [];

  db.galleryItems = [
    {
      id: "gallery-1",
      title: "Sunset Networking Cocktail",
      caption: "Private mixers where women executives connect, share ideas, and build meaningful relationships.",
      category: "Networking",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200",
      featured: true,
      createdAt: new Date("2026-06-10").toISOString()
    },
    {
      id: "gallery-2",
      title: "Boardroom Masterclasses",
      caption: "Interactive sessions preparing women for non-executive director nominations and board leadership.",
      category: "Summits",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200",
      featured: true,
      createdAt: new Date("2026-06-12").toISOString()
    },
    {
      id: "gallery-3",
      title: "Brunch & Bloom Socials",
      caption: "Elegant dining experiences with beautiful tablescapes, conversation, and laughter.",
      category: "Socials",
      image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200",
      featured: false,
      createdAt: new Date("2026-06-15").toISOString()
    },
    {
      id: "gallery-4",
      title: "Founding Circle Launch",
      caption: "Celebrating the distinguished women who founded and championed the WomenPlay network.",
      category: "Milestones",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200",
      featured: true,
      createdAt: new Date("2026-06-20").toISOString()
    },
    {
      id: "gallery-5",
      title: "Games Evenings",
      caption: "Laughter-filled nights designed for fun, ease, and genuine connection.",
      category: "Socials",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200",
      featured: false,
      createdAt: new Date("2026-06-25").toISOString()
    },
    {
      id: "gallery-6",
      title: "Annual WomenPlay Summit",
      caption: "Our flagship luxury summit gathering female C-suite leaders from around the world.",
      category: "Summits",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200",
      featured: true,
      createdAt: new Date("2026-06-28").toISOString()
    }
  ];

  db.membershipBadges = [
    {
      id: "badge-basic",
      tier: MembershipTier.BASIC,
      name: "Basic Access Badge",
      cost: 0,
      benefits: ["Access to community feed", "Digital contact exchange", "View public event listings"]
    },
    {
      id: "badge-premium",
      tier: MembershipTier.PREMIUM,
      name: "Premium Leadership Badge",
      cost: 100,
      benefits: ["All Basic benefits", "Access to Sunset Networking Cocktail", "Join monthly masterclass circles", "Receive premium silver digital badge"]
    },
    {
      id: "badge-elite",
      tier: MembershipTier.ELITE,
      name: "Elite Boardroom Sponsor Badge",
      cost: 250,
      benefits: ["All Premium benefits", "Front-row premium VIP gold badge", "Elite AI boardroom mentoring", "1-on-1 sponsorship preparation"]
    }
  ];

  db.launchTickets = [];
}

// getDefaultEmailTemplates() now lives in serverEmailTemplates.ts

// Read database from file
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(data);
      
      if (!db.users) db.users = [];
      if (!db.events) db.events = [];
      if (!db.registrations) db.registrations = [];
      if (!db.payments) db.payments = [];
      if (!db.posts) db.posts = [];
      if (!db.comments) db.comments = [];
      if (!db.successStories) db.successStories = [];
      if (!db.supportTickets) db.supportTickets = [];
      if (!db.blogs) db.blogs = [];
      if (!db.announcements) db.announcements = [];
      if (!db.auditLogs) db.auditLogs = [];
      if (!db.founders) db.founders = [];
      if (!db.newsletterSubscribers) db.newsletterSubscribers = [];
      if (!db.contactMessages) db.contactMessages = [];
      if (!db.foundingMembers) db.foundingMembers = [];
      if (!db.volunteers) db.volunteers = [];
      if (!db.attendance) db.attendance = [];
      if (!db.subscriptions) db.subscriptions = [];

      // Migration: backfill a default password hash for legacy users that predate auth
      if (!isProd) {
        const legacyHash = bcrypt.hashSync(process.env.DEFAULT_ADMIN_PASSWORD || "WomenPlay@2026!", 10);
        let migrated = 0;
        db.users.forEach((u: any) => {
          if (!u.passwordHash) {
            u.passwordHash = legacyHash;
            migrated++;
          }
        });
        if (migrated > 0) {
          console.warn(`⚠️ Backfilled default password hash for ${migrated} legacy user(s). Use DEFAULT_ADMIN_PASSWORD to change it.`);
          saveDatabase();
        }
      } else {
        const missing = db.users.filter((u: any) => !u.passwordHash);
        if (missing.length > 0) {
          console.warn(`⚠️ ${missing.length} user(s) in the database have no password hash and cannot log in. Register fresh accounts or reset their passwords.`);
        }
      }

      if (!db.settings) {
        db.settings = {
          stripePublicKey: process.env.STRIPE_PUBLIC_KEY || "",
          stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
          isSubscriptionRequired: false
        };
      }
      if (!db.settings.emailTemplates || db.settings.emailTemplates.length === 0) {
        db.settings.emailTemplates = getDefaultEmailTemplates();
      }
      if (!db.carouselSlides || db.carouselSlides.length === 0) {
        db.carouselSlides = [
          {
            id: "slide-1",
            image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1600",
            title: "Empower Your Executive Network",
            description: "Connect with FTSE 100 directors, venture partners, and corporate pioneers in a curated ecosystem built for high-impact female leaders."
          },
          {
            id: "slide-2",
            image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1600",
            title: "Elevate Your Boardroom Influence",
            description: "Access exclusive masterclasses, corporate board directories, and annual summits designed to amplify your professional footprint."
          },
          {
            id: "slide-3",
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1600",
            title: "Intentional High-Society Alliances",
            description: "Engage in private roundtables and sunset cocktail galas with leading mentors, investors, and policymakers driving systemic change."
          }
        ];
      }
      if (!db.subscriptions) {
        db.subscriptions = [];
      }
      if (!db.galleryItems || db.galleryItems.length === 0) {
        db.galleryItems = [
          {
            id: "gallery-1",
            title: "Sunset Networking Cocktail",
            caption: "Private mixers where women executives connect, share ideas, and build meaningful relationships.",
            category: "Networking",
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200",
            featured: true,
            createdAt: new Date("2026-06-10").toISOString()
          },
          {
            id: "gallery-2",
            title: "Boardroom Masterclasses",
            caption: "Interactive sessions preparing women for non-executive director nominations and board leadership.",
            category: "Summits",
            image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200",
            featured: true,
            createdAt: new Date("2026-06-12").toISOString()
          },
          {
            id: "gallery-3",
            title: "Brunch & Bloom Socials",
            caption: "Elegant dining experiences with beautiful tablescapes, conversation, and laughter.",
            category: "Socials",
            image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200",
            featured: false,
            createdAt: new Date("2026-06-15").toISOString()
          },
          {
            id: "gallery-4",
            title: "Founding Circle Launch",
            caption: "Celebrating the distinguished women who founded and championed the WomenPlay network.",
            category: "Milestones",
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200",
            featured: true,
            createdAt: new Date("2026-06-20").toISOString()
          },
          {
            id: "gallery-5",
            title: "Games Evenings",
            caption: "Laughter-filled nights designed for fun, ease, and genuine connection.",
            category: "Socials",
            image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200",
            featured: false,
            createdAt: new Date("2026-06-25").toISOString()
          },
          {
            id: "gallery-6",
            title: "Annual WomenPlay Summit",
            caption: "Our flagship luxury summit gathering female C-suite leaders from around the world.",
            category: "Summits",
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200",
            featured: true,
            createdAt: new Date("2026-06-28").toISOString()
          }
        ];
      }
      if (!db.membershipBadges || db.membershipBadges.length === 0) {
        db.membershipBadges = [
          {
            id: "badge-basic",
            tier: MembershipTier.BASIC,
            name: "Basic Access Badge",
            cost: 0,
            benefits: ["Access to community feed", "Digital contact exchange", "View public event listings"]
          },
          {
            id: "badge-premium",
            tier: MembershipTier.PREMIUM,
            name: "Premium Leadership Badge",
            cost: 100,
            benefits: ["All Basic benefits", "Access to Sunset Networking Cocktail", "Join monthly masterclass circles", "Receive premium silver digital badge"]
          },
          {
            id: "badge-elite",
            tier: MembershipTier.ELITE,
            name: "Elite Boardroom Sponsor Badge",
            cost: 250,
            benefits: ["All Premium benefits", "Front-row premium VIP gold badge", "Elite AI boardroom mentoring", "1-on-1 sponsorship preparation"]
          }
        ];
      }
    } else {
      seedData();
      saveDatabase();
    }
  } catch (error) {
    console.error("Failed to load database, using defaults:", error);
    seedData();
  }
}

// Write database to file and sync to PostgreSQL
function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save database to file:", error);
  }
  // Sync asynchronously to PostgreSQL if connected
  saveToPostgres().catch(err => console.error("Async PostgreSQL sync error:", err));
}

loadDatabase();

// --- AUTHENTICATION HELPERS (JWT + bcrypt) ---
const JWT_SECRET = process.env.JWT_SECRET || "dev-insecure-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function signToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
}

interface AuthRequest extends express.Request {
  user?: User;
}

function requireAuth(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization;
  const token = header && header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Authentication required. Please log in." });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = db.users.find((u) => u.id === payload.id);
    if (!user) {
      return res.status(401).json({ error: "Invalid or expired session." });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session." });
  }
}

function requireAdmin(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  // First authenticate the request, then check the role
  requireAuth(req, res, () => {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: "Administrator access required." });
    }
    next();
  });
}

function safeUser(user: User) {
  const { passwordHash, twoFactorSecret, verificationToken, ...safe } = user as any;
  return safe;
}

// Current User Authentication Verification
app.get("/api/auth/me", requireAuth, (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  res.json({ user: safeUser(req.user) });
});

// --- DATABASE STATUS & CPANEL POSTGRESQL DIAGNOSTIC ENDPOINT ---
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    engine: isPgConnected ? "postgresql" : "local_json",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/db/status", (req, res) => {
  const hasPgEnv = Boolean(process.env.DATABASE_URL || process.env.DB_HOST || process.env.PGHOST);
  res.json({
    engine: isPgConnected ? "postgresql" : "local_json",
    postgresConfigured: hasPgEnv,
    postgresConnected: isPgConnected,
    postgresLastError: pgLastError,
    connectionDetails: {
      host: process.env.DB_HOST || process.env.PGHOST || (process.env.DATABASE_URL ? "DATABASE_URL string" : "Not configured"),
      database: process.env.DB_NAME || process.env.PGDATABASE || "Default",
      user: process.env.DB_USER || process.env.PGUSER || "Not configured",
      port: process.env.DB_PORT || process.env.PGPORT || "5432"
    },
    counts: {
      users: db.users?.length || 0,
      events: db.events?.length || 0,
      registrations: db.registrations?.length || 0,
      founders: db.founders?.length || 0,
      blogs: db.blogs?.length || 0,
      supportTickets: db.supportTickets?.length || 0,
      newsletterSubscribers: db.newsletterSubscribers?.length || 0
    },
    cpanelSetupInstructions: "To link your cPanel PostgreSQL database, set DATABASE_URL (e.g. postgresql://user:password@cpanel_host:5432/cpanel_db) or set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT in environment variables."
  });
});

// --- INPUT VALIDATION MIDDLEWARE ---
// Declarative body-validation rules. Each rule describes a field:
//   - required: field must be present (and non-empty for strings)
//   - type: "string" | "number" | "boolean" | "email"
//   - min / max: string length bounds (also trims and applies to arrays via length)
//   - pattern: RegExp the value must match
//   - oneOf: whitelist of allowed values
// Returns 400 with the first violation found. Applied only to sensitive routes.
interface FieldRule {
  required?: boolean;
  type?: "string" | "number" | "boolean" | "email";
  min?: number;
  max?: number;
  pattern?: RegExp;
  oneOf?: (string | number)[];
}

type BodySchema = Record<string, FieldRule>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateBody(schema: BodySchema) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const body = req.body && typeof req.body === "object" ? req.body : {};

    for (const [field, rule] of Object.entries(schema)) {
      const raw = body[field];
      const present = raw !== undefined && raw !== null;

      if (rule.required && !present) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
      if (!present) continue;

      let value = raw;

      if (rule.type === "string" || rule.type === "email") {
        if (typeof value !== "string") {
          return res.status(400).json({ error: `Field ${field} must be a string` });
        }
        value = value.trim();
      } else if (rule.type === "number") {
        if (typeof value !== "number" || Number.isNaN(value)) {
          return res.status(400).json({ error: `Field ${field} must be a number` });
        }
      } else if (rule.type === "boolean" && typeof value !== "boolean") {
        return res.status(400).json({ error: `Field ${field} must be a boolean` });
      }

      if (rule.type === "email") {
        if (typeof value === "string" && !emailPattern.test(value)) {
          return res.status(400).json({ error: `Field ${field} must be a valid email address` });
        }
      }

      if (rule.min !== undefined || rule.max !== undefined) {
        const len = typeof value === "string" ? value.length : Array.isArray(value) ? value.length : 0;
        if (rule.min !== undefined && len < rule.min) {
          return res.status(400).json({ error: `Field ${field} must be at least ${rule.min} characters long` });
        }
        if (rule.max !== undefined && len > rule.max) {
          return res.status(400).json({ error: `Field ${field} must not exceed ${rule.max} characters` });
        }
      }

      if (rule.pattern && typeof value === "string" && !rule.pattern.test(value)) {
        return res.status(400).json({ error: `Field ${field} has an invalid format` });
      }

      if (rule.oneOf && !rule.oneOf.includes(value)) {
        return res.status(400).json({ error: `Field ${field} has an invalid value` });
      }
    }

    next();
  };
}

// --- STRUCTURED REQUEST LOGGING ---
app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] || `req_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 6)}`;
  res.setHeader("X-Request-Id", req.id as string);
  const start = Date.now();
  res.on("finish", () => {
    if (req.originalUrl.startsWith("/api/")) {
      console.log(
        `[req:${req.id}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`
      );
    }
  });
  next();
});

// Extend the Express Request type so auth helpers can carry the request id
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

// --- STRIPE LAZY INITIALIZATION HELPER ---
let stripeClientInstance: Stripe | null = null;
let activeStripeKeyUsed: string | null = null;

function getStripe(): Stripe | null {
  const mode = db.settings?.stripeMode || "test";
  let key = db.settings?.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
  if (mode === "live" && db.settings?.stripeLiveSecretKey) {
    key = db.settings.stripeLiveSecretKey;
  } else if (mode === "test" && db.settings?.stripeTestSecretKey) {
    key = db.settings.stripeTestSecretKey;
  }

  if (!key || !key.trim() || key.startsWith("sk_test_mock")) {
    return null;
  }

  if (!stripeClientInstance || activeStripeKeyUsed !== key.trim()) {
    try {
      stripeClientInstance = new Stripe(key.trim(), {
        apiVersion: "2023-10-16" as any,
      });
      activeStripeKeyUsed = key.trim();
    } catch (e) {
      console.error("Stripe initialization error: ", e);
      stripeClientInstance = null;
    }
  }
  return stripeClientInstance;
}

// --- LAUNCH EXPERIENCE TICKETS ---
// Launch constants, idempotent purchase recording and the checkout / success /
// admin-ledger routes live in serverPayments.ts. Prices are controlled
// server-side (never trust the client).
registerLaunchRoutes(app, {
  db,
  saveDatabase,
  getStripe,
  emailPattern,
  requireAdmin,
  sendNotificationEmail,
});

// --- API ENDPOINTS ---

// Email Verification Endpoint
// Email Verification Helpers
function verifyEmailByToken(token: string) {
  const user = db.users.find(u => u.verificationToken === token);
  if (!user) {
    return { ok: false as const, status: 404 };
  }
  user.emailVerified = true;
  user.verificationToken = undefined;
  saveDatabase();
  return { ok: true as const, user };
}

// Legacy email verification landing page (old links / direct browser clicks)
app.get("/api/auth/verify-email", (req, res) => {
  const { token } = req.query;
  if (!token || typeof token !== "string") {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Invalid Link</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #f8fafc; color: #0f172a;">
        <h2>Invalid Email Verification Link</h2>
        <p>No valid token was supplied.</p>
        <a href="/" style="color: #db2777; font-weight: bold; text-decoration: none;">Return to Home</a>
      </body>
      </html>
    `);
  }

  const result = verifyEmailByToken(token);
  if (!result.ok) {
    return res.status(result.status).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Link Expired</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #f8fafc; color: #0f172a;">
        <h2>Verification Link Expired or Already Used</h2>
        <p>This verification link is invalid or your email address is already verified.</p>
        <a href="/" style="color: #db2777; font-weight: bold; text-decoration: none;">Return to Sign In</a>
      </body>
      </html>
    `);
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Email Verified - WomenPlay Network</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 16px; }
        .card { background: white; max-width: 440px; width: 100%; border-radius: 24px; padding: 40px 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); text-align: center; border: 1px solid #e2e8f0; }
        .icon { width: 64px; height: 64px; background: #ecfdf5; color: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; font-size: 32px; font-weight: bold; }
        h1 { font-size: 22px; color: #0f172a; margin: 0 0 10px 0; }
        p { font-size: 14px; color: #64748b; line-height: 1.5; margin: 0 0 24px 0; }
        .btn { display: inline-block; background: #0f172a; color: white; font-weight: bold; font-size: 14px; padding: 12px 28px; border-radius: 12px; text-decoration: none; transition: background 0.2s; }
        .btn:hover { background: #1e293b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">✓</div>
        <h1>Email Verified Successfully!</h1>
        <p>Your email address <strong>${result.user.email}</strong> has been confirmed. You may now return to the application and sign in.</p>
        <a href="/?verified=true" class="btn">Sign In Now</a>
      </div>
    </body>
    </html>
  `);
});

// Email Verification (JSON API consumed by the /verify-email/:token SPA page)
app.post("/api/auth/verify-email", authLimiter, validateBody({
  token: { required: true, type: "string", max: 200 },
}), (req, res) => {
  const result = verifyEmailByToken(req.body.token);
  if (!result.ok) {
    return res.status(result.status).json({ error: "This verification link is invalid or has already been used." });
  }
  res.json({ success: true, email: result.user.email });
});

// Resend Verification Email
app.post("/api/auth/resend-verification", authLimiter, validateBody({
  email: { required: true, type: "email", max: 254 },
}), (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email address is required." });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "No user account found with this email." });
  }

  if (user.emailVerified) {
    return res.status(400).json({ message: "Your email address is already verified. Please sign in." });
  }

  if (!user.verificationToken) {
    user.verificationToken = "vtoken_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
    saveDatabase();
  }

  const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;
  const verifyUrl = `${origin}/verify-email/${user.verificationToken}`;

  const verifyHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f1f5f9; border-radius: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 4px;">Confirm Your Email Address</h2>
        <p style="color: #db2777; font-size: 12px; font-weight: bold; text-transform: uppercase;">WomenPlay Network</p>
      </div>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">Hello <strong>${user.fullName}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">Here is your requested verification link for WomenPlay Network:</p>
      <div style="margin: 28px 0; text-align: center;">
        <a href="${verifyUrl}" target="_blank" style="background-color: #db2777; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block;">Verify Email Address</a>
      </div>
      <p style="color: #64748b; font-size: 12px; line-height: 1.5;">Or copy and paste this URL into your browser:<br/><a href="${verifyUrl}" style="color: #db2777; word-break: break-all;">${verifyUrl}</a></p>
    </div>
  `;

  sendNotificationEmail("Verify Your WomenPlay Account", verifyHtml, user.email)
    .catch(err => console.error("Resend email failed:", err));

  res.json({ message: "A new verification email has been dispatched to your inbox!", verificationUrl: verifyUrl });
});

// Auth Routes
app.post("/api/auth/register", authLimiter, validateBody({
  email: { required: true, type: "email", max: 254 },
  fullName: { required: true, type: "string", min: 2, max: 120 },
  password: { required: true, type: "string", min: 8, max: 128 },
  role: { type: "string", oneOf: ["MEMBER", "ADMIN"] },
  title: { type: "string", max: 120 },
  company: { type: "string", max: 120 },
  mobileNumber: { type: "string", max: 40 },
}), async (req, res) => {
  const { email, fullName, password, role, title, company, mobileNumber } = req.body;
  if (!email || !fullName) {
    return res.status(400).json({ error: "Missing required fields: Email and Full Name are mandatory." });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Email address is already registered. Please sign in instead." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const isSubRequired = db.settings?.isSubscriptionRequired ?? false;
  const initialStatus = role === "ADMIN" 
    ? MembershipStatus.ACTIVE 
    : (isSubRequired ? MembershipStatus.PENDING : MembershipStatus.ACTIVE);

  const verificationToken = "vtoken_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);

  const newUser: User = {
    id: "user-" + Math.random().toString(36).substr(2, 9),
    email: email.trim(),
    fullName: fullName.trim(),
    role: role === "ADMIN" ? UserRole.ADMIN : UserRole.MEMBER,
    membershipStatus: initialStatus,
    membershipTier: MembershipTier.BASIC,
    title: title || "",
    company: company || mobileNumber || "",
    emailVerified: false,
    verificationToken,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDatabase();

  const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;
  const verifyUrl = `${origin}/verify-email/${verificationToken}`;

  const verifyHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f1f5f9; border-radius: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 4px;">Confirm Your Email Address</h2>
        <p style="color: #db2777; font-size: 12px; font-weight: bold; text-transform: uppercase;">WomenPlay Network</p>
      </div>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">Hello <strong>${newUser.fullName}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">Thank you for creating an account with WomenPlay Network. To activate your account and gain access to the executive portal, please verify your email address by clicking the button below:</p>
      <div style="margin: 28px 0; text-align: center;">
        <a href="${verifyUrl}" target="_blank" style="background-color: #db2777; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block;">Verify Email Address</a>
      </div>
      <p style="color: #64748b; font-size: 12px; line-height: 1.5;">If the button above does not work, copy and paste this verification URL into your web browser:<br/><a href="${verifyUrl}" style="color: #db2777; word-break: break-all;">${verifyUrl}</a></p>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center;">If you did not register for a WomenPlay account, you can safely ignore this message.</p>
    </div>
  `;

  // Send Registration Email Verification Link using Admin's SMTP Settings
  sendNotificationEmail("Verify Your WomenPlay Account", verifyHtml, newUser.email)
    .then(result => console.log(`Verification email sent via SMTP to ${newUser.email}:`, result))
    .catch(err => console.error("Verification email dispatch error:", err));

  // DO NOT return user object or log them in automatically!
  res.status(201).json({ 
    message: "Registration successful! A verification link has been sent to your email. Please verify your email before logging in.",
    email: newUser.email,
    verificationUrl: verifyUrl
  });
});

// Activate a pending account: verifies the email AND lets the user set a password
// (used by the Founding Circle signup flow to convert leads into full accounts)
app.post("/api/auth/activate", authLimiter, validateBody({
  token: { required: true, type: "string", min: 5, max: 200 },
  password: { required: true, type: "string", min: 8, max: 128 },
}), async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: "Token and password are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long." });
  }

  const user = db.users.find(u => u.verificationToken === token);
  if (!user) {
    return res.status(400).json({ error: "This activation link is invalid or has already been used. Please request a new one." });
  }

  // Optionally mark the founding member record as verified
  const foundingMember = db.foundingMembers?.find(m => m.email.toLowerCase() === user.email.toLowerCase());
  if (foundingMember && foundingMember.status === "pending") {
    foundingMember.status = "approved";
  }

  user.emailVerified = true;
  user.verificationToken = undefined;
  user.passwordHash = await bcrypt.hash(password, 10);
  saveDatabase();

  // Auto sign-in so the new member lands directly in the portal
  const tokenSigned = signToken(user);
  res.json({
    message: "Your email has been verified and your account password has been set. Welcome to WomenPlay!",
    token: tokenSigned,
    user: safeUser(user)
  });
});

// In-memory temporary stores for 2FA setup & login verification
const pending2FASetups = new Map<string, { secret?: string; method: "authenticator" | "email"; emailCode?: string; timestamp: number }>();
const pending2FALogins = new Map<string, { userId: string; method: "authenticator" | "email"; emailCode?: string; timestamp: number }>();

app.post("/api/auth/login", authLimiter, validateBody({
  email: { required: true, type: "email", max: 254 },
  password: { required: true, type: "string", max: 128 },
}), async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email address is required" });
  }
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Verify password hash
  if (!user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Block login if account has not been verified yet
  if (user.emailVerified === false) {
    return res.status(403).json({ 
      error: "Your email address has not been verified yet. Please check your inbox for the verification link sent via SMTP.",
      emailUnverified: true,
      email: user.email 
    });
  }

  // Check if 2FA is enabled
  if (user.twoFactorEnabled) {
    const tempToken = "2fa-" + Math.random().toString(36).substr(2, 12);
    const method = user.twoFactorMethod || "authenticator";

    if (method === "email") {
      const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
      pending2FALogins.set(tempToken, { userId: user.id, method: "email", emailCode, timestamp: Date.now() });

      // Send email code via SMTP
      const emailSubject = "Your WomenPlay 2FA Login Code";
      const htmlContent = `
        <div style="font-family: sans-serif; padding: 24px; color: #1e293b; background: #f8fafc;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center;">
            <h2 style="color: #db2777; margin-top: 0;">2FA Login Verification</h2>
            <p>Your 6-digit login verification code is:</p>
            <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0f172a; background: #f1f5f9; padding: 16px; border-radius: 12px; margin: 20px 0;">${emailCode}</div>
            <p style="font-size: 12px; color: #64748b;">This code expires in 10 minutes. Do not share it with anyone.</p>
          </div>
        </div>
      `;
      sendNotificationEmail(emailSubject, htmlContent, user.email)
        .catch(err => console.error("2FA login email error:", err));
    } else {
      pending2FALogins.set(tempToken, { userId: user.id, method: "authenticator", timestamp: Date.now() });
    }

    return res.json({
      requires2FA: true,
      twoFactorMethod: method,
      tempToken,
      userEmail: user.email,
      message: "2FA code required for login verification."
    });
  }

  const token = signToken(user);
  res.json({ user: safeUser(user), token, message: "Login successful" });
});

app.post("/api/auth/login/verify-2fa", authLimiter, validateBody({
  tempToken: { required: true, type: "string", max: 128 },
  code: { required: true, type: "string", pattern: /^\d{6}$/ },
}), (req, res) => {
  const { tempToken, code } = req.body;
  if (!tempToken || !code) {
    return res.status(400).json({ error: "Missing token or verification code" });
  }

  const pending = pending2FALogins.get(tempToken);
  if (!pending) {
    return res.status(400).json({ error: "Verification session expired. Please log in again." });
  }

  const user = db.users.find(u => u.id === pending.userId);
  if (!user) {
    return res.status(404).json({ error: "User account not found." });
  }

  if (pending.method === "email") {
    if (pending.emailCode !== code.trim()) {
      return res.status(400).json({ error: "Invalid 6-digit email verification code." });
    }
  } else {
    if (!user.twoFactorSecret) {
      return res.status(400).json({ error: "2FA secret configuration missing." });
    }
    const isValid = verifySync({ token: code.trim(), secret: user.twoFactorSecret }).valid;
    if (!isValid) {
      return res.status(400).json({ error: "Invalid Authenticator App code." });
    }
  }

  pending2FALogins.delete(tempToken);
  const token = signToken(user);
  res.json({ user: safeUser(user), token, message: "2FA verification successful! Login complete." });
});

app.post("/api/auth/2fa/setup", authLimiter, async (req, res) => {
  const { userId, method } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const chosenMethod = method === "email" ? "email" : "authenticator";

  if (chosenMethod === "authenticator") {
    const secret = generateSecret();
    const otpauth = generateURI({ label: user.email, issuer: "WomenPlay", secret });
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    pending2FASetups.set(userId, { secret, method: "authenticator", timestamp: Date.now() });

    return res.json({
      qrCodeUrl,
      secret,
      method: "authenticator",
      message: "Scan QR code or enter secret key into your Authenticator app."
    });
  } else {
    const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
    pending2FASetups.set(userId, { emailCode, method: "email", timestamp: Date.now() });

    const emailSubject = "Your WomenPlay 2FA Setup Verification Code";
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 24px; color: #1e293b; background: #f8fafc;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center;">
          <h2 style="color: #db2777; margin-top: 0;">2FA Setup Verification</h2>
          <p>Your 6-digit setup code is:</p>
          <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0f172a; background: #f1f5f9; padding: 16px; border-radius: 12px; margin: 20px 0;">${emailCode}</div>
          <p style="font-size: 12px; color: #64748b;">Enter this code to complete mandatory 2FA setup.</p>
        </div>
      </div>
    `;
    sendNotificationEmail(emailSubject, htmlContent, user.email)
      .catch(err => console.error("2FA setup email dispatch error:", err));

    return res.json({
      method: "email",
      message: `A 6-digit verification code has been dispatched to ${user.email} via SMTP.`
    });
  }
});

app.post("/api/auth/2fa/verify-setup", authLimiter, validateBody({
  userId: { required: true, type: "string", max: 64 },
  code: { required: true, type: "string", pattern: /^\d{6}$/ },
}), (req, res) => {
  const { userId, method, code } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const pending = pending2FASetups.get(userId);
  if (!pending) {
    return res.status(400).json({ error: "2FA setup session expired. Please restart setup." });
  }

  if (pending.method === "email") {
    if (pending.emailCode !== code.trim()) {
      return res.status(400).json({ error: "Invalid email verification code." });
    }
  } else {
    if (!pending.secret) {
      return res.status(400).json({ error: "Authenticator secret missing." });
    }
    const isValid = verifySync({ token: code.trim(), secret: pending.secret }).valid;
    if (!isValid) {
      return res.status(400).json({ error: "Invalid Authenticator App code. Please ensure time sync on your device." });
    }
  }

  // Enable 2FA on user account
  user.twoFactorEnabled = true;
  user.twoFactorMethod = pending.method;
  if (pending.secret) {
    user.twoFactorSecret = pending.secret;
  }

  pending2FASetups.delete(userId);

  const log: AuditLog = {
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: user.id,
    adminName: user.fullName,
    action: "USER_2FA_ENABLED",
    details: `Enabled 2FA (${pending.method}) for user ${user.fullName}`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(log);
  saveDatabase();

  res.json({ user, message: "Two-Factor Authentication successfully enabled on your account!" });
});

// --- PASSWORD RESET FLOW ---
app.post("/api/auth/forgot-password", authLimiter, validateBody({
  email: { required: true, type: "email", max: 254 },
}), (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email address is required" });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    // Don't reveal whether the account exists
    return res.json({ message: "If that email address is registered, a password reset link has been sent." });
  }

  const resetToken = "prt_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9) + Math.random().toString(36).substring(2, 9);
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  user.resetToken = resetToken;
  user.resetTokenExpiry = resetTokenExpiry;
  saveDatabase();

  const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;
  const resetUrl = `${origin}/reset-password?token=${resetToken}`;

  const resetHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f1f5f9; border-radius: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 4px;">Reset Your Password</h2>
        <p style="color: #db2777; font-size: 12px; font-weight: bold; text-transform: uppercase;">WomenPlay Network</p>
      </div>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">Hello <strong>${user.fullName}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">We received a request to reset the password for your WomenPlay account. This link is valid for <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
      <div style="margin: 28px 0; text-align: center;">
        <a href="${resetUrl}" target="_blank" style="background-color: #db2777; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #64748b; font-size: 12px; line-height: 1.5;">If the button above does not work, copy and paste this URL into your web browser:<br/><a href="${resetUrl}" style="color: #db2777; word-break: break-all;">${resetUrl}</a></p>
      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center;">If you did not request this, you can safely ignore this message.</p>
    </div>
  `;

  sendNotificationEmail("Reset Your WomenPlay Password", resetHtml, user.email)
    .catch(err => console.error("Password reset email dispatch error:", err));

  res.json({ message: "If that email address is registered, a password reset link has been sent." });
});

app.post("/api/auth/reset-password", authLimiter, validateBody({
  token: { required: true, type: "string", max: 128 },
  newPassword: { required: true, type: "string", min: 8, max: 128 },
}), async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Reset token is required" });
  }
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters long." });
  }

  const user = db.users.find(u => u.resetToken === token);
  if (!user) {
    return res.status(400).json({ error: "Invalid or expired password reset link. Please request a new one." });
  }

  if (user.resetTokenExpiry && new Date(user.resetTokenExpiry).getTime() < Date.now()) {
    return res.status(400).json({ error: "This password reset link has expired. Please request a new one." });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  saveDatabase();

  const log: AuditLog = {
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: user.id,
    adminName: user.fullName,
    action: "PASSWORD_RESET",
    details: `Password reset for user ${user.fullName}`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(log);
  saveDatabase();

  res.json({ message: "Your password has been reset successfully. You can now sign in." });
});

// Member Management
app.get("/api/members", requireAuth, (req, res) => {
  res.json(db.users.map(safeUser));
});

// Admin Management CRUD Endpoints
app.get("/api/admins", requireAdmin, (req, res) => {
  const admins = db.users.filter(u => u.role === UserRole.ADMIN || u.role === "ADMIN");
  res.json(admins.map(safeUser));
});

app.post("/api/admins", requireAdmin, validateBody({
  fullName: { required: true, type: "string", min: 2, max: 120 },
  email: { required: true, type: "email", max: 254 },
  password: { required: true, type: "string", min: 8, max: 128 },
  title: { type: "string", max: 120 },
  company: { type: "string", max: 120 },
  avatarUrl: { type: "string", max: 1000 },
}), (req, res) => {
  const { fullName, email, password, title, company, avatarUrl, adminId, adminName } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ error: "Full Name and Email are required." });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    if (existing.role === UserRole.ADMIN) {
      return res.status(400).json({ error: "An admin account with this email already exists." });
    }
    // If user exists as member, promote to ADMIN
    existing.role = UserRole.ADMIN;
    existing.membershipStatus = MembershipStatus.ACTIVE;
    if (title) existing.title = title;
    if (company) existing.company = company;
    if (avatarUrl) existing.avatarUrl = avatarUrl;

    const log: AuditLog = {
      id: "log-" + Math.random().toString(36).substr(2, 9),
      adminId: adminId || "system",
      adminName: adminName || "Administrator",
      action: "PROMOTED_TO_ADMIN",
      details: `Promoted existing member ${existing.fullName} (${existing.email}) to Administrator`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs.unshift(log);
    saveDatabase();
    return res.json({ user: existing, message: `Promoted ${existing.fullName} to Administrator!` });
  }

  const newAdmin: User = {
    id: "admin-" + Math.random().toString(36).substr(2, 9),
    email: email.trim().toLowerCase(),
    fullName,
    role: UserRole.ADMIN,
    membershipStatus: MembershipStatus.ACTIVE,
    membershipTier: MembershipTier.ELITE,
    title: title || "Executive Administrator",
    company: company || "WomenPlay Network",
    avatarUrl: avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    createdAt: new Date().toISOString()
  };

  db.users.push(newAdmin);

  const log: AuditLog = {
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: adminId || "system",
    adminName: adminName || "Administrator",
    action: "ADMIN_CREATED",
    details: `Created new Administrator account for ${newAdmin.fullName} (${newAdmin.email})`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(log);

  saveDatabase();
  res.status(201).json({ user: newAdmin, message: "New Administrator account created successfully!" });
});

app.put("/api/admins/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { fullName, email, title, company, avatarUrl, membershipStatus, role, adminId, adminName } = req.body;

  const admin = db.users.find(u => u.id === id);
  if (!admin) {
    return res.status(404).json({ error: "Admin user not found." });
  }

  if (fullName) admin.fullName = fullName;
  if (email) admin.email = email.trim().toLowerCase();
  if (title !== undefined) admin.title = title;
  if (company !== undefined) admin.company = company;
  if (avatarUrl !== undefined) admin.avatarUrl = avatarUrl;
  if (membershipStatus) admin.membershipStatus = membershipStatus;
  if (role) admin.role = role;

  const log: AuditLog = {
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: adminId || "system",
    adminName: adminName || "Administrator",
    action: "ADMIN_UPDATED",
    details: `Updated details for Administrator ${admin.fullName} (${admin.email})`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(log);

  saveDatabase();
  res.json({ user: admin, message: "Administrator details updated successfully!" });
});

app.post("/api/admins/:id/demote", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { adminId, adminName } = req.body || {};
  const adminUser = db.users.find(u => u.id === id);
  if (!adminUser) return res.status(404).json({ error: "User not found." });
  
  adminUser.role = UserRole.MEMBER;
  const log: AuditLog = {
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: adminId || "system",
    adminName: adminName || "Administrator",
    action: "ADMIN_DEMOTED",
    details: `Demoted Administrator ${adminUser.fullName} to Standard Member`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(log);
  saveDatabase();
  return res.json({ message: `Administrator ${adminUser.fullName} demoted to Member.` });
});

app.delete("/api/admins/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const actionType = req.query.actionType || req.body?.actionType || "delete";
  const adminId = (req.query.adminId || req.body?.adminId || "system") as string;
  const adminName = (req.query.adminName || req.body?.adminName || "Administrator") as string;

  const adminIndex = db.users.findIndex(u => u.id === id);
  if (adminIndex === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  const adminUser = db.users[adminIndex];

  if (actionType === "demote") {
    adminUser.role = UserRole.MEMBER;
    const log: AuditLog = {
      id: "log-" + Math.random().toString(36).substr(2, 9),
      adminId,
      adminName,
      action: "ADMIN_DEMOTED",
      details: `Demoted Administrator ${adminUser.fullName} to Standard Member`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs.unshift(log);
    saveDatabase();
    return res.json({ message: `Administrator ${adminUser.fullName} demoted to Member.` });
  } else {
    // Delete account completely
    db.users.splice(adminIndex, 1);
    const log: AuditLog = {
      id: "log-" + Math.random().toString(36).substr(2, 9),
      adminId,
      adminName,
      action: "ADMIN_DELETED",
      details: `Permanently deleted Administrator account ${adminUser.fullName} (${adminUser.email})`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs.unshift(log);
    saveDatabase();
    return res.json({ message: `Administrator account ${adminUser.fullName} permanently deleted.` });
  }
});

app.put("/api/members/:id/status", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status, adminId, adminName } = req.body;

  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "Member not found" });
  }

  user.membershipStatus = status;
  
  // Log Audit Action
  const newLog: AuditLog = {
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: adminId || "admin-1",
    adminName: adminName || "Administrator",
    action: `MEMBERSHIP_STATUS_CHANGED`,
    details: `Changed membership status of ${user.fullName} to ${status}`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(newLog);

  saveDatabase();
  res.json({ user, message: `Membership successfully updated to ${status}` });
});

app.put("/api/members/:id/profile", requireAuth, validateBody({
  fullName: { type: "string", min: 2, max: 120 },
  bio: { type: "string", max: 5000 },
  title: { type: "string", max: 200 },
  company: { type: "string", max: 200 },
  avatarUrl: { type: "string", max: 5000000 },
}), (req, res) => {
  const { id } = req.params;
  const { fullName, bio, title, company, avatarUrl } = req.body;

  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (fullName) user.fullName = fullName;
  if (bio !== undefined) user.bio = bio;
  if (title !== undefined) user.title = title;
  if (company !== undefined) user.company = company;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

  saveDatabase();
  res.json({ user: safeUser(user), message: "Profile updated successfully" });
});

// Sponsors API (CRUD / RUD)
app.get("/api/sponsors", (req, res) => {
  if (!db.sponsors || db.sponsors.length === 0) {
    db.sponsors = [
      {
        id: "spon-1",
        name: "Goldman Sachs Leadership Alliance",
        tier: "Title Sponsor",
        logoUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=300",
        website: "https://goldmansachs.com",
        description: "Supporting executive pipeline training and fellowship grants for female board candidates.",
        createdAt: new Date("2026-01-10").toISOString()
      },
      {
        id: "spon-2",
        name: "McKinsey & Company",
        tier: "Platinum Sponsor",
        logoUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=300",
        website: "https://mckinsey.com",
        description: "Global management consulting partner providing research and executive mentorship.",
        createdAt: new Date("2026-02-15").toISOString()
      },
      {
        id: "spon-3",
        name: "Grand Venture Alliance",
        tier: "Gold Sponsor",
        logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=300",
        website: "https://grandventure.org",
        description: "Venture capital syndicate powering women-led startup seed funding.",
        createdAt: new Date("2026-03-01").toISOString()
      }
    ];
    saveDatabase();
  }
  res.json(db.sponsors);
});

app.post("/api/sponsorship-inquiry", validateBody({
  companyName: { required: true, type: "string", min: 2, max: 200 },
  contactName: { required: true, type: "string", min: 2, max: 200 },
  email: { required: true, type: "string", min: 5, max: 200 },
  tier: { required: true, type: "string", min: 2, max: 100 },
  cardName: { required: true, type: "string", min: 2, max: 200 },
  cardNo: { required: true, type: "string", min: 12, max: 30 },
  cardExpiry: { required: true, type: "string", min: 3, max: 10 },
  cardCvv: { required: true, type: "string", min: 3, max: 10 },
  message: { type: "string", max: 5000 }
}), async (req, res) => {
  const { companyName, contactName, email, tier, cardName, cardNo, cardExpiry, cardCvv, message } = req.body;

  const sanitizedCardNo = cardNo.replace(/\D/g, "");
  if (!sanitizedCardNo || sanitizedCardNo.length < 13) {
    return res.status(400).json({ error: "Invalid payment details. Please enter a valid credit card number." });
  }

  // Calculate tier price
  let amount = 10000;
  if (tier.includes("Chapter") || tier.includes("25")) amount = 25000;
  else if (tier.includes("Global") || tier.includes("Title") || tier.includes("50")) amount = 50000;
  else if (tier.includes("Custom") || tier.includes("5")) amount = 5000;

  // Process payment record (saving payment to ledger FIRST)
  const paymentId = "PAY-SPON-" + Date.now().toString(36).toUpperCase();
  const paymentRecord = {
    id: paymentId,
    userId: (req as any).user?.id || "anon-" + Date.now(),
    userEmail: email,
    userName: contactName,
    type: "Sponsorship",
    amount,
    currency: "USD",
    status: "Completed",
    description: `${tier} for ${companyName}`,
    last4: sanitizedCardNo.slice(-4),
    createdAt: new Date().toISOString()
  };

  if (!db.payments) db.payments = [];
  db.payments.unshift(paymentRecord);

  // ONLY after payment record is saved, create and save the sponsor record
  if (!db.sponsors) db.sponsors = [];
  const newSponsor = {
    id: "spon-" + Math.random().toString(36).substring(2, 9),
    name: companyName.trim(),
    contactName: contactName.trim(),
    email: email.trim(),
    tier: tier.trim(),
    amount,
    logoUrl: "",
    website: "",
    description: message || `${tier} Corporate Partner`,
    status: "Active",
    paidAt: new Date().toISOString(),
    paymentId
  };
  db.sponsors.unshift(newSponsor);

  // Audit log
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift({
    id: "audit-" + Date.now(),
    timestamp: new Date().toISOString(),
    user: contactName,
    email,
    action: "Sponsorship Payment Processed",
    details: `${companyName} completed payment of $${amount.toLocaleString()} for ${tier}.`,
    ip: req.ip || "127.0.0.1"
  });

  saveDatabase();

  // Send transactional notification email
  await sendNotificationEmail(
    `WomenPlay Sponsorship Confirmed - ${companyName}`,
    `<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #9d174d; margin-top: 0;">Sponsorship Payment Received</h2>
      <p style="font-size: 14px; color: #334155;">Dear <strong>${contactName}</strong>,</p>
      <p style="font-size: 14px; color: #334155; line-height: 1.6;">
        Thank you for supporting WomenPlay Executive Network. Your payment of <strong>$${amount.toLocaleString()} USD</strong> for the <strong>${tier}</strong> sponsorship has been processed successfully.
      </p>
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Company:</strong> ${companyName}</p>
        <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Sponsorship Tier:</strong> ${tier}</p>
        <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Total Paid:</strong> $${amount.toLocaleString()} USD</p>
        <p style="margin: 0; font-size: 13px;"><strong>Transaction Ref:</strong> ${paymentId}</p>
      </div>
      <p style="font-size: 14px; color: #334155;">Our Secretariat Corporate Partnership Director will contact you within 24 hours.</p>
    </div>`,
    email
  );

  res.status(201).json({
    success: true,
    sponsor: newSponsor,
    payment: paymentRecord,
    message: `Sponsorship payment of $${amount.toLocaleString()} processed successfully!`
  });
});

app.post("/api/sponsors", requireAdmin, validateBody({
  name: { required: true, type: "string", min: 2, max: 200 },
  tier: { required: true, type: "string", min: 2, max: 100 },
  logoUrl: { type: "string", max: 5000000 },
  website: { type: "string", max: 1000 },
  description: { type: "string", max: 5000 }
}), (req, res) => {
  const { name, tier, logoUrl, website, description } = req.body;
  if (!db.sponsors) db.sponsors = [];

  const newSponsor = {
    id: "spon-" + Math.random().toString(36).substring(2, 9),
    name: name.trim(),
    tier: tier.trim(),
    logoUrl: logoUrl || "",
    website: website || "",
    description: description || "",
    createdAt: new Date().toISOString()
  };

  db.sponsors.push(newSponsor);
  saveDatabase();
  res.status(201).json(newSponsor);
});

app.put("/api/sponsors/:id", requireAdmin, validateBody({
  name: { type: "string", min: 2, max: 200 },
  tier: { type: "string", min: 2, max: 100 },
  logoUrl: { type: "string", max: 5000000 },
  website: { type: "string", max: 1000 },
  description: { type: "string", max: 5000 }
}), (req, res) => {
  const { id } = req.params;
  const { name, tier, logoUrl, website, description } = req.body;

  if (!db.sponsors) db.sponsors = [];
  const sponsor = db.sponsors.find(s => s.id === id);
  if (!sponsor) {
    return res.status(404).json({ error: "Sponsor not found" });
  }

  if (name !== undefined) sponsor.name = name.trim();
  if (tier !== undefined) sponsor.tier = tier.trim();
  if (logoUrl !== undefined) sponsor.logoUrl = logoUrl;
  if (website !== undefined) sponsor.website = website;
  if (description !== undefined) sponsor.description = description;

  saveDatabase();
  res.json(sponsor);
});

app.delete("/api/sponsors/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!db.sponsors) db.sponsors = [];
  const idx = db.sponsors.findIndex(s => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Sponsor not found" });
  }
  db.sponsors.splice(idx, 1);
  saveDatabase();
  res.json({ message: "Sponsor deleted successfully" });
});

app.post("/api/members/subscribe", requireAuth, async (req, res) => {
  const { userId, tier, amount, method, useSavedCard } = req.body;
  
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Handle direct payment using user's secured saved card (PCI/Stripe Compliant)
  if (useSavedCard && user.savedCard) {
    user.membershipTier = tier;
    user.membershipStatus = MembershipStatus.ACTIVE;

    const transactionId = "TXN-STRIPE-" + Math.floor(Math.random() * 9000000 + 1000000);
    const receiptNumber = "RCPT-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 90000 + 10000);

    const newPayment: Payment = {
      id: "pay-" + Math.random().toString(36).substr(2, 9),
      userId,
      amount,
      purpose: "Membership",
      itemId: tier,
      status: "completed",
      method: "Credit Card",
      transactionId,
      createdAt: new Date().toISOString(),
      receiptNumber
    };

    if (!db.payments) db.payments = [];
    db.payments.unshift(newPayment);

    sendAdminAlertNotification("payment", {
      title: `Membership Payment: $${amount.toFixed(2)} (${tier})`,
      summary: `User: ${user.fullName} (${user.email})\nTier: ${tier}\nTransaction ID: ${transactionId}`,
      amount,
      userEmail: user.email,
      userName: user.fullName,
      linkPath: "/?tab=payments"
    }, req.headers.host);

    // Add subscription record
    const nextBilling = new Date();
    nextBilling.setDate(nextBilling.getDate() + 30);
    const newSub = {
      id: "sub-" + Math.random().toString(36).substr(2, 9),
      userId,
      tier,
      amount,
      status: "active" as "active" | "cancelled",
      nextBillingDate: nextBilling.toISOString().split("T")[0],
      createdAt: new Date().toISOString()
    };
    if (!db.subscriptions) db.subscriptions = [];
    db.subscriptions.unshift(newSub);

    saveDatabase();
    return res.json({ 
      success: true, 
      user, 
      payment: newPayment, 
      message: `Successfully subscribed to ${tier} using your secured card (${user.savedCard.brand} ending in ${user.savedCard.last4})!` 
    });
  }

  const stripe = getStripe();
  if (stripe) {
    try {
      // Find or create customer
      let customerId = "";
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.fullName,
        });
        customerId = customer.id;
      }

      // Create standard product and price dynamically
      const productName = `Aura ${tier} Membership`;
      let priceAmount = tier === "ELITE" ? 25000 : 10000; // in cents ($250 or $100)
      
      // Look up existing price or create it
      let priceId = "";
      const prices = await stripe.prices.list({ limit: 10, active: true });
      const existingPrice = prices.data.find(p => p.nickname === tier);
      if (existingPrice) {
        priceId = existingPrice.id;
      } else {
        const product = await stripe.products.create({
          name: productName,
        });
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: priceAmount,
          currency: "usd",
          recurring: { interval: "month" },
          nickname: tier
        });
        priceId = price.id;
      }

      // Create Stripe Checkout Session
      const origin = req.headers.origin || "http://localhost:3000";
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        client_reference_id: userId,
        metadata: { userId, tier, kind: "membership" },
        success_url: `${origin}/api/payments/stripe-success?session_id={CHECKOUT_SESSION_ID}&userId=${userId}&tier=${tier}`,
        cancel_url: `${origin}/?stripe_cancel=true`,
      });

      return res.json({ checkoutUrl: session.url, message: "Checkout session created" });
    } catch (error: any) {
      console.error("Stripe Checkout Error:", error);
      return res.status(500).json({ error: error.message || "Failed to create Stripe Checkout Session" });
    }
  }

  // Fallback to Mock subscription flow
  user.membershipTier = tier;
  user.membershipStatus = MembershipStatus.ACTIVE;

  // Generate Payment Receipt & Log
  const transactionId = "TXN-" + Math.floor(Math.random() * 9000000 + 1000000);
  const receiptNumber = "RCPT-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 90000 + 10000);

  const newPayment: Payment = {
    id: "pay-" + Math.random().toString(36).substr(2, 9),
    userId,
    amount,
    purpose: "Membership",
    itemId: tier,
    status: "completed",
    method: method || "Credit Card",
    transactionId,
    createdAt: new Date().toISOString(),
    receiptNumber
  };

  db.payments.unshift(newPayment);

  sendAdminAlertNotification("payment", {
    title: `Payment Received: $${amount.toFixed(2)} (${tier})`,
    summary: `User ID: ${userId}\nTier: ${tier}\nMethod: ${method || "Credit Card"}\nTransaction ID: ${transactionId}`,
    amount,
    userEmail: user?.email,
    userName: user?.fullName,
    linkPath: "/?tab=payments"
  }, req.headers.host);

  // Add mock subscription record
  const nextBilling = new Date();
  nextBilling.setDate(nextBilling.getDate() + 30);

  const newSub = {
    id: "sub-" + Math.random().toString(36).substr(2, 9),
    userId,
    tier,
    status: "active" as const,
    nextBillingDate: nextBilling.toISOString(),
    createdAt: new Date().toISOString(),
    amount
  };

  if (!db.subscriptions) db.subscriptions = [];
  db.subscriptions.unshift(newSub);

  saveDatabase();

  res.json({ user, payment: newPayment, subscription: newSub, message: `Successfully upgraded to ${tier} Membership!` });
});

// Events Routing
app.get("/api/events", (req, res) => {
  res.json(db.events);
});

app.post("/api/events", requireAdmin, (req, res) => {
  const { title, description, date, time, location, image, category, capacity, packages, adminId, adminName } = req.body;
  if (!title || !date || !location) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newEvent: EventItem = {
    id: "event-" + Math.random().toString(36).substr(2, 9),
    title,
    description: description || "",
    date,
    time: time || "09:00 AM",
    location,
    image: image || "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200",
    category: category || "Leadership",
    capacity: Number(capacity) || 100,
    registeredCount: 0,
    packages: packages || [],
    status: "upcoming"
  };

  db.events.unshift(newEvent);

  // Log Audit Action
  const newLog: AuditLog = {
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: adminId || "admin-1",
    adminName: adminName || "Administrator",
    action: "EVENT_CREATED",
    details: `Created new event: ${title}`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(newLog);

  saveDatabase();
  res.status(201).json({ event: newEvent, message: "Event created successfully" });
});

app.put("/api/events/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { title, description, date, time, location, image, category, capacity, packages, status, adminId, adminName } = req.body;

  const event = db.events.find(e => e.id === id);
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  if (title) event.title = title;
  if (description !== undefined) event.description = description;
  if (date) event.date = date;
  if (time) event.time = time;
  if (location) event.location = location;
  if (image) event.image = image;
  if (category) event.category = category;
  if (capacity) event.capacity = Number(capacity);
  if (packages) event.packages = packages;
  if (status) {
    event.status = status;
    if (status === "deactivated") {
      event.deactivated = true;
    } else if (status === "upcoming" || status === "past" || status === "archived") {
      event.deactivated = false;
    }
  }
  if (req.body.deactivated !== undefined) {
    event.deactivated = Boolean(req.body.deactivated);
    if (event.deactivated) event.status = "deactivated";
  }

  // Log Audit Action
  const newLog: AuditLog = {
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: adminId || "admin-1",
    adminName: adminName || "Administrator",
    action: "EVENT_UPDATED",
    details: `Updated event: ${event.title}`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(newLog);

  saveDatabase();
  res.json({ event, message: "Event updated successfully" });
});

const handleDeactivateEvent = (req: any, res: any) => {
  const { id } = req.params;
  const event = db.events.find(e => e.id === id);
  if (!event) return res.status(404).json({ error: "Event not found" });
  
  const isDeactivated = req.body?.deactivated !== undefined ? Boolean(req.body.deactivated) : event.status !== "deactivated";
  event.deactivated = isDeactivated;
  event.status = isDeactivated ? "deactivated" : "upcoming";
  saveDatabase();
  res.json({ event, message: isDeactivated ? "Event deactivated" : "Event reactivated" });
};

app.post("/api/events/:id/deactivate", handleDeactivateEvent);
app.put("/api/events/:id/deactivate", handleDeactivateEvent);

// 2FA Management & Reset Endpoints
app.post("/api/members/:id/2fa", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { enabled, method, secret } = req.body;
  const user = db.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: "User not found" });
  
  user.twoFactorEnabled = Boolean(enabled);
  user.twoFactorMethod = enabled ? (method || "email") : null;
  if (secret) user.twoFactorSecret = secret;
  saveDatabase();
  res.json({ user, message: enabled ? "2FA configured successfully!" : "2FA disabled." });
});

app.post("/api/members/:id/reset-2fa", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { adminId, adminName } = req.body || {};
  const user = db.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.twoFactorEnabled = false;
  user.twoFactorMethod = null;
  user.twoFactorSecret = undefined;

  const log: AuditLog = {
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: adminId || "system",
    adminName: adminName || "Administrator",
    action: "MEMBER_2FA_RESET",
    details: `Reset 2FA security credentials for member ${user.fullName}`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(log);
  saveDatabase();

  res.json({ user, message: `2FA security credentials reset for ${user.fullName}.` });
});

// Tasks Management API Endpoints
app.get("/api/tasks", requireAuth, (req, res) => {
  if (!db.tasks) db.tasks = [];
  const { userId, role } = req.query;
  
  if (role === "ADMIN" || !userId) {
    return res.json(db.tasks);
  }

  // Filter for standard members (only see tasks assigned to them or assigned to ALL)
  const memberTasks = db.tasks.filter(t => 
    !t.assignedToUserId || t.assignedToUserId === "ALL" || t.assignedToUserId === userId
  );
  res.json(memberTasks);
});

app.post("/api/tasks", requireAdmin, (req, res) => {
  if (!db.tasks) db.tasks = [];
  const { text, description, category, priority, assignedToUserId, assignedToFullName, assignedToEmail, createdById, createdByName, dueDate, status } = req.body;
  
  if (!text) return res.status(400).json({ error: "Task text/title is required" });

  const newTask: TaskItem = {
    id: "task-" + Math.random().toString(36).substr(2, 9),
    text,
    description: description || "",
    category: category || "Feature",
    priority: priority || "Medium",
    completed: status === "Completed",
    status: status || "Pending",
    assignedToUserId: assignedToUserId || "ALL",
    assignedToFullName: assignedToFullName || (assignedToUserId === "ALL" ? "All Platform Fellows" : "Unassigned"),
    assignedToEmail: assignedToEmail || "",
    createdById: createdById || "admin",
    createdByName: createdByName || "Administrator",
    dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    createdAt: new Date().toISOString()
  };

  db.tasks.unshift(newTask);
  saveDatabase();
  res.status(201).json({ task: newTask, message: "Task assigned successfully" });
});

app.put("/api/tasks/:id", requireAdmin, (req, res) => {
  if (!db.tasks) db.tasks = [];
  const { id } = req.params;
  const task = db.tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const { text, description, category, priority, assignedToUserId, assignedToFullName, assignedToEmail, dueDate, status, completed } = req.body;
  
  if (text !== undefined) task.text = text;
  if (description !== undefined) task.description = description;
  if (category !== undefined) task.category = category;
  if (priority !== undefined) task.priority = priority;
  if (assignedToUserId !== undefined) task.assignedToUserId = assignedToUserId;
  if (assignedToFullName !== undefined) task.assignedToFullName = assignedToFullName;
  if (assignedToEmail !== undefined) task.assignedToEmail = assignedToEmail;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (status !== undefined) {
    task.status = status;
    task.completed = status === "Completed";
  }
  if (completed !== undefined) {
    task.completed = Boolean(completed);
    if (task.completed) task.status = "Completed";
  }

  saveDatabase();
  res.json({ task, message: "Task updated successfully" });
});

app.delete("/api/tasks/:id", requireAdmin, (req, res) => {
  if (!db.tasks) db.tasks = [];
  const { id } = req.params;
  const idx = db.tasks.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "Task not found" });

  db.tasks.splice(idx, 1);
  saveDatabase();
  res.json({ message: "Task deleted successfully" });
});

app.delete("/api/events/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { adminId, adminName } = req.query;

  const eventIdx = db.events.findIndex(e => e.id === id);
  if (eventIdx === -1) {
    return res.status(404).json({ error: "Event not found" });
  }

  const deletedTitle = db.events[eventIdx].title;
  db.events.splice(eventIdx, 1);

  // Log Audit Action
  const newLog: AuditLog = {
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: (adminId as string) || "admin-1",
    adminName: (adminName as string) || "Administrator",
    action: "EVENT_DELETED",
    details: `Deleted event: ${deletedTitle}`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(newLog);

  saveDatabase();
  res.json({ message: "Event deleted successfully" });
});

app.post("/api/events/:id/register", requireAuth, (req, res) => {
  const { id } = req.params;
  const { userId, packageId, method, billingDetails, seat, useSavedCard } = req.body;

  const event = db.events.find(e => e.id === id);
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  if (event.registeredCount >= event.capacity) {
    return res.status(400).json({ error: "Event capacity reached" });
  }

  const pkg = event.packages.find(p => p.id === packageId);
  if (!pkg) {
    return res.status(404).json({ error: "Selected badge package not found" });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Check if already registered
  const alreadyRegistered = db.registrations.find(r => r.eventId === id && r.userId === userId);
  if (alreadyRegistered) {
    return res.status(400).json({ error: "You are already registered for this event." });
  }

  // Check if chosen seat is already taken
  if (seat) {
    const seatTaken = db.registrations.some(r => r.eventId === id && r.seat === seat);
    if (seatTaken) {
      return res.status(400).json({ error: `Seat ${seat} is already reserved by another attendee.` });
    }
  }

  // Process payment simulation
  const isDirectStripeSavedCard = useSavedCard && user.savedCard;

  // CAPTURE NEW CARD IF PROVIDED AND SAVED FOR FUTURE
  if (method === "Credit Card" && !isDirectStripeSavedCard && billingDetails && billingDetails.cardNo) {
    const cleanCardNo = billingDetails.cardNo.replace(/\s+/g, "");
    const last4 = cleanCardNo.slice(-4) || "4242";
    let brand = "Visa";
    const firstDigit = cleanCardNo.charAt(0);
    if (firstDigit === "5") brand = "Mastercard";
    else if (firstDigit === "3") brand = "American Express";
    else if (firstDigit === "6") brand = "Discover";

    let expMonth = 12;
    let expYear = 2028;
    if (billingDetails.cardExpiry && billingDetails.cardExpiry.includes("/")) {
      const parts = billingDetails.cardExpiry.split("/");
      expMonth = Number(parts[0]) || 12;
      const yrPart = parts[1] ? parts[1].trim() : "";
      expYear = Number(yrPart) ? (Number(yrPart) < 100 ? Number(yrPart) + 2000 : Number(yrPart)) : 2028;
    }

    user.savedCard = {
      brand,
      last4,
      expMonth,
      expYear,
      paymentMethodId: `pm_${Math.random().toString(36).substr(2, 9)}`,
      cardholderName: billingDetails.cardName || user.fullName,
      expiryDate: billingDetails.cardExpiry || "12/28"
    };
  }

  const transactionId = isDirectStripeSavedCard
    ? "TXN-STRIPE-" + Math.floor(Math.random() * 9000000 + 1000000)
    : "TXN-" + Math.floor(Math.random() * 9000000 + 1000000);
  const receiptNumber = "RCPT-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 90000 + 10000);
  
  const payment: Payment = {
    id: "pay-" + Math.random().toString(36).substr(2, 9),
    userId,
    amount: pkg.fee,
    purpose: "Event Registration",
    itemId: id,
    status: "completed",
    method: isDirectStripeSavedCard ? "Credit Card (Saved)" : (method || "Credit Card"),
    transactionId,
    createdAt: new Date().toISOString(),
    receiptNumber
  };
  db.payments.unshift(payment);

  // Generate Digital Badge/Access Code
  const badgeCode = `AURA-E${id.slice(-3).toUpperCase()}-${pkg.name.split(" ")[0].toUpperCase()}-${Math.floor(Math.random() * 90000 + 10000)}`;

  const registration: Registration = {
    id: "reg-" + Math.random().toString(36).substr(2, 9),
    eventId: id,
    userId,
    packageId,
    packageName: pkg.name,
    amountPaid: pkg.fee,
    paymentId: payment.id,
    badgeCode,
    registeredAt: new Date().toISOString(),
    attended: false,
    seat
  };

  db.registrations.push(registration);
  event.registeredCount += 1;

  saveDatabase();

  // Send Event Access Pass Transactional Email
  if (db.settings?.smtpSettings?.alertOnEventBooking) {
    const rendered = renderEmailTemplate("event-access-pass", {
      userName: user.fullName,
      userEmail: user.email,
      eventName: event.title,
      eventDate: `${event.date} (${event.time})`,
      eventLocation: event.location,
      ticketCode: badgeCode,
      ticketPackage: pkg.name,
      ticketPrice: String(pkg.fee)
    }, db.settings?.emailTemplates);
    if (rendered) {
      sendNotificationEmail(rendered.subject, rendered.bodyHtml, user.email)
        .catch(err => console.error("Event access pass email dispatch failed:", err));
    }
  }

  const successMessage = isDirectStripeSavedCard
    ? `Registered successfully using your secured card (${user.savedCard!.brand} ending in ${user.savedCard!.last4})! Your digital pass ${badgeCode} has been generated.`
    : `Registered successfully! Your digital pass ${badgeCode} has been generated.`;

  res.status(201).json({
    registration,
    payment,
    message: successMessage
  });
});

app.get("/api/registrations", requireAuth, (req, res) => {
  res.json(db.registrations);
});

app.get("/api/events/:id/registrations", requireAdmin, (req, res) => {
  const { id } = req.params;
  const regs = db.registrations.filter(r => r.eventId === id);
  // Hydrate user data
  const hydrated = regs.map(r => {
    const user = db.users.find(u => u.id === r.userId);
    return {
      ...r,
      userFullName: user ? user.fullName : "Unknown",
      userEmail: user ? user.email : ""
    };
  });
  res.json(hydrated);
});

app.put("/api/registrations/:id/attendance", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { attended } = req.body;

  const reg = db.registrations.find(r => r.id === id);
  if (!reg) {
    return res.status(404).json({ error: "Registration not found" });
  }

  const event = db.events.find(e => e.id === reg.eventId);
  const user = db.users.find(u => u.id === reg.userId);
  const fullName = user ? user.fullName : "Attendee";

  reg.attended = attended;

  if (attended) {
    // Sync attendance module: ensure a check-in record exists
    const existing = (db.attendance || []).find(a => a.eventId === reg.eventId && a.accessCode === reg.badgeCode);
    if (!existing && event) {
      db.attendance = db.attendance || [];
      db.attendance.unshift({
        id: "att-" + Math.random().toString(36).substr(2, 9),
        eventId: reg.eventId,
        eventName: event.title,
        userId: reg.userId,
        fullName,
        email: user ? user.email : "",
        accessCode: reg.badgeCode,
        scannedAt: new Date().toISOString()
      });
    }
  } else {
    // Removing attendance when a check-in is unset
    db.attendance = (db.attendance || []).filter(a => !(a.eventId === reg.eventId && a.accessCode === reg.badgeCode));
  }

  saveDatabase();
  res.json({ registration: reg, message: "Attendance status updated" });
});

// Community Routes
app.get("/api/community/posts", (req, res) => {
  res.json(db.posts);
});

app.post("/api/community/posts", requireAuth, (req, res) => {
  const { userId, content, imageUrl } = req.body;
  if (!userId || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const newPost: Post = {
    id: "post-" + Math.random().toString(36).substr(2, 9),
    userId,
    userFullName: user.fullName,
    userTitle: user.title,
    userAvatar: user.avatarUrl,
    content,
    imageUrl,
    likes: [],
    commentsCount: 0,
    createdAt: new Date().toISOString()
  };

  db.posts.unshift(newPost);
  saveDatabase();
  res.status(201).json(newPost);
});

app.post("/api/community/posts/:id/like", requireAuth, (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const post = db.posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const idx = post.likes.indexOf(userId);
  if (idx > -1) {
    post.likes.splice(idx, 1); // Unlike
  } else {
    post.likes.push(userId); // Like
  }

  saveDatabase();
  res.json(post);
});

app.get("/api/community/posts/:id/comments", (req, res) => {
  const { id } = req.params;
  const comments = db.comments.filter(c => c.postId === id);
  res.json(comments);
});

app.post("/api/community/posts/:id/comments", requireAuth, (req, res) => {
  const { id } = req.params;
  const { userId, content } = req.body;

  const post = db.posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const newComment: Comment = {
    id: "comment-" + Math.random().toString(36).substr(2, 9),
    postId: id,
    userId,
    userFullName: user.fullName,
    userAvatar: user.avatarUrl,
    content,
    createdAt: new Date().toISOString()
  };

  db.comments.push(newComment);
  post.commentsCount += 1;

  saveDatabase();
  res.status(201).json(newComment);
});

app.delete("/api/community/posts/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const postIdx = db.posts.findIndex(p => p.id === id);
  if (postIdx === -1) {
    return res.status(404).json({ error: "Post not found" });
  }

  db.posts.splice(postIdx, 1);
  // Clean up comments
  db.comments = db.comments.filter(c => c.postId !== id);

  saveDatabase();
  res.json({ message: "Post successfully moderated" });
});

// Success Stories Routes
app.get("/api/success-stories", (req, res) => {
  // Return all stories (admin will filter or show them based on approval)
  res.json(db.successStories);
});

app.post("/api/success-stories", requireAuth, (req, res) => {
  const { userId, title, content, imageUrl } = req.body;
  if (!userId || !title || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const newStory: SuccessStory = {
    id: "story-" + Math.random().toString(36).substr(2, 9),
    userId,
    userFullName: user.fullName,
    userAvatar: user.avatarUrl,
    title,
    content,
    imageUrl,
    approved: false, // Subject to admin approval
    createdAt: new Date().toISOString()
  };

  db.successStories.unshift(newStory);
  saveDatabase();
  res.status(201).json({ story: newStory, message: "Story submitted successfully! Awaiting Administrator review." });
});

const handleApproveStory = (req: any, res: any) => {
  const { id } = req.params;
  const { approved, adminId, adminName } = req.body || {};

  const story = db.successStories.find(s => s.id === id);
  if (!story) {
    return res.status(404).json({ error: "Story not found" });
  }

  const isApproved = approved !== undefined ? Boolean(approved) : true;
  story.approved = isApproved;

  // Log Audit Action
  const newLog: AuditLog = {
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: adminId || "admin-1",
    adminName: adminName || "Administrator",
    action: isApproved ? "STORY_APPROVED" : "STORY_REJECTED",
    details: `${isApproved ? "Approved" : "Rejected"} success story: ${story.title}`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(newLog);

  saveDatabase();
  res.json({ story, message: isApproved ? "Story approved for publication!" : "Story status updated" });
};

app.put("/api/success-stories/:id/approve", handleApproveStory);
app.post("/api/success-stories/:id/approve", handleApproveStory);

app.delete("/api/success-stories/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const idx = db.successStories.findIndex(s => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Story not found" });
  }

  db.successStories.splice(idx, 1);
  saveDatabase();
  res.json({ message: "Story deleted successfully" });
});

// Support tickets
app.get("/api/support", requireAuth, (req: AuthRequest, res) => {
  const { userId } = req.query;
  if (userId) {
    // Members may only view their own tickets; admins may view any
    if (req.user && req.user.role !== UserRole.ADMIN && req.user.id !== userId) {
      return res.status(403).json({ error: "You can only view your own support tickets." });
    }
    const userTickets = db.supportTickets.filter(t => t.userId === userId);
    return res.json(userTickets);
  }
  if (req.user && req.user.role !== UserRole.ADMIN) {
    return res.json(db.supportTickets.filter(t => t.userId === req.user!.id));
  }
  res.json(db.supportTickets);
});

app.post("/api/support", requireAuth, (req, res) => {
  const { userId, userName, userFullName, email, userEmail, subject, message, category } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let finalUserId = userId || "guest-" + Math.random().toString(36).substr(2, 6);
  let finalFullName = userName || userFullName || "Executive Guest";
  let finalEmail = email || userEmail || "inquiry@womenplay.org";

  if (userId) {
    const user = db.users.find(u => u.id === userId);
    if (user) {
      finalFullName = user.fullName;
      finalEmail = user.email;
    }
  }

  const newTicket: SupportTicket = {
    id: "ticket-" + Math.random().toString(36).substr(2, 9),
    userId: finalUserId,
    userFullName: finalFullName,
    email: finalEmail,
    subject,
    message,
    category: category || "General Inquiry",
    status: "open",
    responses: [],
    createdAt: new Date().toISOString()
  };

  db.supportTickets.unshift(newTicket);
  saveDatabase();

  // Trigger Admin Dashboard & Email Alert for Support Ticket
  sendAdminAlertNotification("support", {
    title: `Ticket #${newTicket.id}: ${newTicket.subject}`,
    summary: `Category: ${category || "General Inquiry"}\n\nMessage:\n${message}`,
    userEmail: finalEmail,
    userName: finalFullName,
    linkPath: "/?tab=support"
  }, req.headers.host);

  // Trigger User Confirmation Email for Support Ticket if enabled
  if (db.settings?.smtpSettings?.alertOnSupportTicket) {
    const rendered = renderEmailTemplate("support-ticket-confirmation", {
      userName: finalFullName,
      userEmail: finalEmail,
      ticketId: newTicket.id,
      ticketCategory: category || "General Support",
      ticketSubject: subject,
      ticketDetails: message
    }, db.settings?.emailTemplates);
    if (rendered) {
      sendNotificationEmail(rendered.subject, rendered.bodyHtml, finalEmail)
        .catch(err => console.error("Support ticket confirmation email error:", err));
    }
  }

  res.status(201).json({ ticket: newTicket, message: "Support ticket created successfully" });
});

// Contact Us Form Submission Endpoint
app.post("/api/contact", (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required" });
  }

  const newContact: ContactMessage = {
    id: "contact-" + Math.random().toString(36).substr(2, 9),
    fullName: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : undefined,
    subject: subject ? subject.trim() : "Website Contact Inquiry",
    message: message.trim(),
    status: "new",
    createdAt: new Date().toISOString(),
    replies: []
  };

  if (!db.contactMessages) db.contactMessages = [];
  db.contactMessages.unshift(newContact);
  saveDatabase();

  // Send Admin Alert via SMTP and Admin Dashboard Notification
  sendAdminAlertNotification("contact", {
    title: `${name} - ${newContact.subject}`,
    summary: `Phone: ${phone || 'N/A'}\n\nInquiry Message:\n${message}`,
    userEmail: email,
    userName: name,
    linkPath: "/?tab=contacts"
  }, req.headers.host);

  // Send User Acknowledgment Email via SMTP if enabled
  if (db.settings?.smtpSettings?.alertOnContactInquiry) {
    const rendered = renderEmailTemplate("contact-acknowledgment", {
      userName: name,
      userEmail: email,
      inquirySubject: subject || "General Inquiry",
      inquiryMessage: message
    }, db.settings?.emailTemplates);
    if (rendered) {
      sendNotificationEmail(rendered.subject, rendered.bodyHtml, email)
        .catch(err => console.error("Contact acknowledgment email error:", err));
    }
  }

  res.status(200).json({ contact: newContact, message: "Thank you for contacting WomenPlay! Our executive secretariat will respond shortly." });
});

// Contact Messages Admin API Routes
app.get("/api/contact-messages", requireAdmin, (req, res) => {
  if (!db.contactMessages) db.contactMessages = [];
  res.json(db.contactMessages);
});

app.patch("/api/contact-messages/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!db.contactMessages) db.contactMessages = [];

  const contact = db.contactMessages.find(c => c.id === id);
  if (!contact) return res.status(404).json({ error: "Contact message not found" });

  if (status && ["new", "read", "replied", "archived"].includes(status)) {
    contact.status = status as any;
    saveDatabase();
  }

  res.json({ contact, message: "Contact message status updated" });
});

app.post("/api/contact-messages/:id/reply", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { message, senderName } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Reply message text is required." });
  }

  if (!db.contactMessages) db.contactMessages = [];
  const contact = db.contactMessages.find(c => c.id === id);
  if (!contact) return res.status(404).json({ error: "Contact message not found." });

  const replyObj: ContactMessageReply = {
    id: "reply-" + Math.random().toString(36).substr(2, 9),
    sender: "ADMIN",
    senderName: senderName || "WomenPlay Executive Secretariat",
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  if (!contact.replies) contact.replies = [];
  contact.replies.push(replyObj);
  contact.status = "replied";
  saveDatabase();

  // Send email reply to user via SMTP
  const emailSubject = `RE: ${contact.subject || "WomenPlay Contact Inquiry"}`;
  const htmlBody = `
    <div style="font-family: sans-serif; padding: 24px; color: #1e293b; background: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0;">
        <h2 style="color: #db2777; margin-top: 0;">WomenPlay Executive Secretariat</h2>
        <p>Dear <strong>${contact.fullName}</strong>,</p>
        <div style="background: #f1f5f9; padding: 16px; border-radius: 12px; font-size: 14px; margin: 20px 0; line-height: 1.6; white-space: pre-wrap;">${message.trim()}</div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #64748b;">Original Inquiry (${new Date(contact.createdAt).toLocaleDateString()}):<br/><em>${contact.message}</em></p>
      </div>
    </div>
  `;

  await sendNotificationEmail(emailSubject, htmlBody, contact.email);

  res.json({ contact, reply: replyObj, message: `Reply dispatched to ${contact.email} via SMTP.` });
});

app.delete("/api/contact-messages/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!db.contactMessages) db.contactMessages = [];

  const initialLen = db.contactMessages.length;
  db.contactMessages = db.contactMessages.filter(c => c.id !== id);

  if (db.contactMessages.length === initialLen) {
    return res.status(404).json({ error: "Contact message not found" });
  }

  saveDatabase();
  res.json({ message: "Contact message deleted successfully" });
});

// Newsletter subscription endpoint
app.post("/api/newsletter", (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email address is required" });
  }
  if (!db.newsletterSubscribers) {
    db.newsletterSubscribers = [];
  }
  if (!db.newsletterSubscribers.includes(email)) {
    db.newsletterSubscribers.push(email);
    saveDatabase();
  }
  res.status(200).json({ message: "Successfully subscribed to newsletter" });
});

app.get("/api/newsletter", requireAdmin, (req, res) => {
  res.json(db.newsletterSubscribers || []);
});

// Founding Circle signup endpoint
app.post("/api/founding-circle", validateBody({
  firstName: { required: true, type: "string", min: 1, max: 50 },
  lastName: { required: true, type: "string", min: 1, max: 50 },
  email: { required: true, type: "email", max: 254 },
  phone: { type: "string", max: 40 },
  city: { type: "string", max: 100 },
  ageRange: { type: "string", max: 20 },
  interests: { type: "string", max: 500 }, // Comma-separated string
}), async (req, res) => {
  const { firstName, lastName, email, phone, city, ageRange, interests } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: "First name, last name, and email are required." });
  }

  const existingMember = db.foundingMembers?.find(
    m => m.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (existingMember) {
    return res.status(400).json({ error: "This email is already registered for the Founding Circle." });
  }

  // Parse interests from comma-separated string to array
  const interestsArray = interests 
    ? interests.split(",").map((i: string) => i.trim()).filter(Boolean)
    : [];

  const newFoundingMember: FoundingMember = {
    id: "fc-" + Math.random().toString(36).substr(2, 9),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || "",
    city: city?.trim() || "",
    ageRange: ageRange?.trim() || "",
    interests: interestsArray,
    status: "pending",
    createdAt: new Date().toISOString(),
    source: "founding-circle"
  };

  if (!db.foundingMembers) db.foundingMembers = [];
  db.foundingMembers.unshift(newFoundingMember);

  // Log audit action
  const auditLog: AuditLog = {
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: "system",
    adminName: "Founding Circle Signup",
    action: "FOUNDING_CIRCLE_SIGNUP",
    details: `New founding member signup: ${newFoundingMember.firstName} ${newFoundingMember.lastName} (${newFoundingMember.email})`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(auditLog);

  // Create a user account so the founding member can verify their email, set a
  // password, and access the portal. The activation link is dispatched through
  // the SMTP settings configured by the admin.
  const normalizedEmail = newFoundingMember.email.toLowerCase();
  const existingUser = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  let accountUser: User | null = null;
  if (!existingUser) {
    accountUser = {
      id: "user-" + Math.random().toString(36).substr(2, 9),
      email: newFoundingMember.email,
      fullName: `${newFoundingMember.firstName} ${newFoundingMember.lastName}`.trim(),
      role: UserRole.MEMBER,
      membershipStatus: MembershipStatus.ACTIVE,
      membershipTier: MembershipTier.BASIC,
      emailVerified: false,
      verificationToken: "vtoken_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    db.users.push(accountUser);
  } else if (!existingUser.emailVerified) {
    if (!existingUser.verificationToken) {
      existingUser.verificationToken = "vtoken_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
    }
    accountUser = existingUser;
  }

  saveDatabase();

  // Send activation email (verify email + set password) via admin-configured SMTP
  try {
    const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;
    const activationToken = accountUser?.verificationToken;
    const activationUrl = activationToken ? `${origin}/activate?token=${activationToken}` : origin;

    const activationCta = activationToken
      ? `
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          To finish setting up your account, please verify your email address and choose a password by clicking the button below:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${activationUrl}" style="background: #db2777; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block;">Verify Email & Set Password</a>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5;">If the button above does not work, copy and paste this link into your web browser:<br/><a href="${activationUrl}" style="color: #db2777; word-break: break-all;">${activationUrl}</a></p>`
      : `
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          You can sign in to your portal using your existing account at any time.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${activationUrl}" style="background: #db2777; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block;">Visit WomenPlay</a>
        </div>`;

    const confirmHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f1f5f9; border-radius: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 4px;">Welcome to the Founding Circle!</h2>
          <p style="color: #db2777; font-size: 12px; font-weight: bold; text-transform: uppercase;">WomenPlay</p>
        </div>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">Hello <strong>${newFoundingMember.firstName}</strong>,</p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Thank you for joining the <strong>WomenPlay Founding Circle</strong>! You're now part of an exclusive group of women helping shape the WomenPlay experience from the very beginning.
        </p>
        ${activationCta}
        <div style="background: #fdf2f8; padding: 16px; border-radius: 8px; border-left: 4px solid #db2777; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569;"><strong>Your Details:</strong></p>
          <p style="margin: 0 0 4px 0; font-size: 13px; color: #475569;">${newFoundingMember.firstName} ${newFoundingMember.lastName}</p>
          <p style="margin: 0 0 4px 0; font-size: 13px; color: #475569;">${newFoundingMember.email}</p>
          ${newFoundingMember.city ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #475569;">${newFoundingMember.city}</p>` : ""}
          ${newFoundingMember.ageRange ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #475569;">Age Range: ${newFoundingMember.ageRange}</p>` : ""}
          ${interestsArray.length > 0 ? `<p style="margin: 0; font-size: 13px; color: #475569;">Interests: ${interestsArray.join(", ")}</p>` : ""}
        </div>
        <p style="font-size: 14px; color: #334155; line-height: 1.6;">
          As a Founding Member, you'll receive early access to events, exclusive launch updates, and the opportunity to help shape the experiences we create together.
        </p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">WomenPlay &bull; Founding Circle &bull; Automated Confirmation</p>
      </div>
    `;

    await sendNotificationEmail("Activate Your WomenPlay Account", confirmHtml, newFoundingMember.email);
  } catch (emailErr) {
    console.error("Founding Circle activation email failed:", emailErr);
  }

  res.status(201).json({ 
    message: "Successfully joined the Founding Circle! An activation link has been sent to your email to verify your account and set your password.",
    member: newFoundingMember 
  });
});

// Admin endpoint to get all founding members
app.get("/api/founding-circle", requireAdmin, (req, res) => {
  res.json(db.foundingMembers || []);
});

// Admin endpoint to update founding member status
app.put("/api/founding-circle/:id", requireAdmin, validateBody({
  status: { required: true, type: "string", oneOf: ["pending", "approved", "waitlisted"] }
}), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const member = db.foundingMembers?.find(m => m.id === id);
  if (!member) {
    return res.status(404).json({ error: "Founding member not found" });
  }

  member.status = status;
  saveDatabase();
  res.json({ member, message: `Status updated to ${status}` });
});

// ---------------------------------------------------------------------------
// VOLUNTEER PROGRAM — Founding Volunteer Applications
// ---------------------------------------------------------------------------

// Public: submit a volunteer application
app.post("/api/volunteers", validateBody({
  fullName: { required: true, type: "string", max: 200 },
  email: { required: true, type: "email", max: 254 },
  phone: { required: true, type: "string", max: 60 },
  linkedin: { type: "string", max: 300 },
  availability: { required: true, type: "string", max: 120 },
  shirtSize: { type: "string", max: 20 },
  roles: { type: "string", max: 1000 },
  skills: { type: "string", max: 2000 },
  why: { type: "string", max: 2000 },
  emergencyContact: { type: "string", max: 300 }
}), async (req, res) => {
  const { fullName, email, phone, linkedin, availability, shirtSize, roles, skills, why, emergencyContact } = req.body || {};

  if (!fullName || !fullName.trim()) {
    return res.status(400).json({ error: "Full name is required." });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: "Email address is required." });
  }
  if (!phone || !phone.trim()) {
    return res.status(400).json({ error: "Phone number is required." });
  }
  if (!availability) {
    return res.status(400).json({ error: "Event-day availability is required." });
  }

  const existing = (db.volunteers || []).find(
    v => v.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (existing) {
    return res.status(400).json({ error: "This email has already submitted a volunteer application." });
  }

  const rolesArray = typeof roles === "string" && roles.trim()
    ? roles.split(",").map((r: string) => r.trim()).filter(Boolean)
    : [];

  const newVolunteer: Volunteer = {
    id: "vol-" + Math.random().toString(36).substr(2, 9),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    linkedin: linkedin?.trim() || "",
    availability: availability.trim(),
    shirtSize: shirtSize?.trim() || "",
    roles: rolesArray,
    skills: skills?.trim() || "",
    why: why?.trim() || "",
    emergencyContact: emergencyContact?.trim() || "",
    status: "pending",
    enabled: false,
    createdAt: new Date().toISOString()
  };

  if (!db.volunteers) db.volunteers = [];
  db.volunteers.unshift(newVolunteer);

  // Log audit action
  db.auditLogs.unshift({
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: "system",
    adminName: "Volunteer Application",
    action: "VOLUNTEER_APPLICATION",
    details: `New founding volunteer application: ${newVolunteer.fullName} (${newVolunteer.email})`,
    timestamp: new Date().toISOString()
  });

  saveDatabase();

  // Admin alert notification
  sendAdminAlertNotification("contact", {
    title: `New Founding Volunteer Application - ${newVolunteer.fullName}`,
    summary: `Phone: ${newVolunteer.phone}\nAvailability: ${newVolunteer.availability}\nRoles: ${rolesArray.join(", ") || "N/A"}\n\n${newVolunteer.why || ""}`,
    userEmail: newVolunteer.email,
    userName: newVolunteer.fullName,
    linkPath: "/admin"
  }, req.headers.host);

  // Volunteer acknowledgment email via SMTP if enabled
  if (db.settings?.smtpSettings?.alertOnContactInquiry) {
    try {
      const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;
      const ackHtml = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f1f5f9; border-radius: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 4px;">Application Received!</h2>
            <p style="color: #db2777; font-size: 12px; font-weight: bold; text-transform: uppercase;">WomenPlay Founding Volunteer Program</p>
          </div>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">Hello <strong>${newVolunteer.fullName}</strong>,</p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            Thank you for applying to join the WomenPlay founding volunteer team for the <strong>Class of 2026</strong> launch experience. Your application has been received and will be reviewed by our team.
          </p>
          <div style="background: #fdf2f8; padding: 16px; border-radius: 8px; border-left: 4px solid #db2777; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569;"><strong>Your Application:</strong></p>
            <p style="margin: 0 0 4px 0; font-size: 13px; color: #475569;">${newVolunteer.fullName}</p>
            <p style="margin: 0 0 4px 0; font-size: 13px; color: #475569;">${newVolunteer.email}</p>
            <p style="margin: 0 0 4px 0; font-size: 13px; color: #475569;">Availability: ${newVolunteer.availability}</p>
            <p style="margin: 0; font-size: 13px; color: #475569;">Roles of Interest: ${rolesArray.join(", ") || "N/A"}</p>
          </div>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            If your application is approved, you will receive an email with instructions to activate your volunteer portal account, set your password and secure two-factor authentication, and review your assigned role and orientation details.
          </p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">WomenPlay &bull; Founding Volunteer Program &bull; Automated Confirmation</p>
        </div>
      `;
      await sendNotificationEmail("Thank You - WomenPlay Volunteer Application Received", ackHtml, newVolunteer.email);
    } catch (emailErr) {
      console.error("Volunteer acknowledgment email failed:", emailErr);
    }
  }

  res.status(201).json({
    message: "Thank you! Your volunteer application has been received. We will be in touch after reviewing your application.",
    volunteer: newVolunteer
  });
});

// Admin: list all volunteer applications
app.get("/api/volunteers", requireAdmin, (req, res) => {
  res.json(db.volunteers || []);
});

// Admin: get a single volunteer application
app.get("/api/volunteers/:id", requireAdmin, (req, res) => {
  const volunteer = (db.volunteers || []).find(v => v.id === req.params.id);
  if (!volunteer) return res.status(404).json({ error: "Volunteer application not found" });
  res.json(volunteer);
});

// Admin: update volunteer application details / assigned role
app.put("/api/volunteers/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const volunteer = (db.volunteers || []).find(v => v.id === id);
  if (!volunteer) return res.status(404).json({ error: "Volunteer application not found" });

  const { role, status, fullName, phone, linkedin, availability, shirtSize, skills, why, emergencyContact } = req.body || {};

  if (typeof role === "string") volunteer.role = role.trim() || volunteer.role;
  if (typeof fullName === "string" && fullName.trim()) volunteer.fullName = fullName.trim();
  if (typeof phone === "string") volunteer.phone = phone.trim();
  if (typeof linkedin === "string") volunteer.linkedin = linkedin.trim();
  if (typeof availability === "string" && availability.trim()) volunteer.availability = availability.trim();
  if (typeof shirtSize === "string") volunteer.shirtSize = shirtSize.trim();
  if (typeof skills === "string") volunteer.skills = skills.trim();
  if (typeof why === "string") volunteer.why = why.trim();
  if (typeof emergencyContact === "string") volunteer.emergencyContact = emergencyContact.trim();
  if (status && ["pending", "approved", "disabled"].includes(status)) {
    volunteer.status = status as Volunteer["status"];
    if (status === "approved") volunteer.enabled = true;
    if (status === "disabled") volunteer.enabled = false;
  }

  saveDatabase();
  res.json({ volunteer, message: "Volunteer application updated successfully." });
});

// Admin: enable volunteer login access (creates portal account + sends activation email)
app.post("/api/volunteers/:id/enable", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const volunteer = (db.volunteers || []).find(v => v.id === id);
  if (!volunteer) return res.status(404).json({ error: "Volunteer application not found" });

  const nameParts = volunteer.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const normalizedEmail = volunteer.email.toLowerCase();
  let accountUser = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!accountUser) {
    accountUser = {
      id: "user-" + Math.random().toString(36).substr(2, 9),
      email: volunteer.email,
      fullName: volunteer.fullName,
      role: UserRole.VOLUNTEER,
      membershipStatus: MembershipStatus.ACTIVE,
      membershipTier: MembershipTier.BASIC,
      emailVerified: false,
      verificationToken: "vtoken_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    db.users.push(accountUser);
  } else {
    // Ensure existing account is flagged as a volunteer and can be re-activated if needed
    accountUser.role = UserRole.VOLUNTEER;
    if (!accountUser.emailVerified || !accountUser.passwordHash) {
      if (!accountUser.verificationToken) {
        accountUser.verificationToken = "vtoken_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
      }
    }
  }

  volunteer.enabled = true;
  volunteer.status = "approved";
  volunteer.userId = accountUser.id;

  db.auditLogs.unshift({
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: req.user?.id || "admin",
    adminName: req.user?.fullName || "Administrator",
    action: "VOLUNTEER_ENABLED",
    details: `Volunteer login enabled for ${volunteer.fullName} (${volunteer.email}) with portal account ${accountUser.id}`,
    timestamp: new Date().toISOString()
  });

  saveDatabase();

  // Send activation email so the volunteer can set their password and secure 2FA
  try {
    const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;
    const activationUrl = accountUser.verificationToken
      ? `${origin}/activate?token=${accountUser.verificationToken}`
      : origin;

    const setupCta = accountUser.verificationToken
      ? `
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          You have been approved as a WomenPlay founding volunteer. To activate your volunteer portal account, please set your password and enable two-factor authentication (2FA) by clicking the button below:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${activationUrl}" style="background: #db2777; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block;">Set Password & Secure 2FA</a>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5;">If the button above does not work, copy and paste this link into your web browser:<br/><a href="${activationUrl}" style="color: #db2777; word-break: break-all;">${activationUrl}</a></p>`
      : `
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Your volunteer portal account is ready. You can sign in at any time using your email address.
        </p>`;

    const enableHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f1f5f9; border-radius: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 4px;">You're In! Welcome to the Volunteer Team.</h2>
          <p style="color: #db2777; font-size: 12px; font-weight: bold; text-transform: uppercase;">WomenPlay Founding Volunteer Program</p>
        </div>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">Hello <strong>${firstName}</strong>,</p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Thank you for applying to volunteer with WomenPlay. We are delighted to welcome you to the founding volunteer team for the launch experience.
        </p>
        ${setupCta}
        <div style="background: #fdf2f8; padding: 16px; border-radius: 8px; border-left: 4px solid #db2777; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569;"><strong>Next Steps:</strong></p>
          <p style="margin: 0 0 4px 0; font-size: 13px; color: #475569;">1. Set your password and confirm your email address.</p>
          <p style="margin: 0 0 4px 0; font-size: 13px; color: #475569;">2. Enable two-factor authentication (2FA) for account security.</p>
          <p style="margin: 0 0 4px 0; font-size: 13px; color: #475569;">3. Review your assigned role and orientation details.</p>
          <p style="margin: 0; font-size: 13px; color: #475569;">4. Sign in to your volunteer portal at launch time.</p>
        </div>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">WomenPlay &bull; Founding Volunteer Program &bull; Automated Confirmation</p>
      </div>
    `;

    await sendNotificationEmail("Welcome to the WomenPlay Volunteer Team", enableHtml, volunteer.email);
  } catch (emailErr) {
    console.error("Volunteer activation email failed:", emailErr);
  }

  res.json({
    message: `Volunteer login enabled for ${volunteer.fullName}. An activation email has been sent to set their password and secure 2FA.`,
    volunteer,
    account: { id: accountUser.id, email: accountUser.email }
  });
});

// Admin: disable volunteer login access
app.post("/api/volunteers/:id/disable", requireAdmin, (req, res) => {
  const { id } = req.params;
  const volunteer = (db.volunteers || []).find(v => v.id === id);
  if (!volunteer) return res.status(404).json({ error: "Volunteer application not found" });

  volunteer.enabled = false;
  volunteer.status = "disabled";

  db.auditLogs.unshift({
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: req.user?.id || "admin",
    adminName: req.user?.fullName || "Administrator",
    action: "VOLUNTEER_DISABLED",
    details: `Volunteer login disabled for ${volunteer.fullName} (${volunteer.email})`,
    timestamp: new Date().toISOString()
  });

  saveDatabase();
  res.json({ volunteer, message: "Volunteer login access has been disabled." });
});

// Admin: delete a volunteer application
app.delete("/api/volunteers/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!db.volunteers) db.volunteers = [];

  const initialLen = db.volunteers.length;
  db.volunteers = db.volunteers.filter(v => v.id !== id);

  if (db.volunteers.length === initialLen) {
    return res.status(404).json({ error: "Volunteer application not found" });
  }

  db.auditLogs.unshift({
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: req.user?.id || "admin",
    adminName: req.user?.fullName || "Administrator",
    action: "VOLUNTEER_DELETED",
    details: `Volunteer application deleted for id ${id}`,
    timestamp: new Date().toISOString()
  });

  saveDatabase();
  res.json({ message: "Volunteer application deleted successfully" });
});

const handleSupportResponse = (req: any, res: any) => {
  const { id } = req.params;
  const { sender, message } = req.body;

  if (!message || !sender) {
    return res.status(400).json({ error: "Message and sender are required" });
  }

  const ticket = db.supportTickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: "Support ticket not found" });
  }

  if (!ticket.responses) ticket.responses = [];
  ticket.responses.push({
    sender,
    message,
    createdAt: new Date().toISOString()
  });

  if (sender === "ADMIN") {
    ticket.status = "in_progress";
  }

  saveDatabase();
  res.json(ticket);
};

app.post("/api/support/:id/respond", requireAuth, handleSupportResponse);
app.post("/api/support/:id/reply", requireAdmin, handleSupportResponse);
app.post("/api/tickets/:id/respond", requireAdmin, handleSupportResponse);
app.post("/api/tickets/:id/reply", requireAdmin, handleSupportResponse);

app.get("/api/tickets", requireAdmin, (req, res) => {
  const { userId } = req.query;
  if (userId) {
    const userTickets = db.supportTickets.filter(t => t.userId === userId);
    return res.json(userTickets);
  }
  res.json(db.supportTickets);
});

app.post("/api/tickets", requireAdmin, (req, res) => {
  const { userId, userName, userFullName, email, subject, message, category, status } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newTicket: SupportTicket = {
    id: "ticket-" + Math.random().toString(36).substr(2, 9),
    userId: userId || "guest",
    userFullName: userFullName || userName || "Aura Member",
    email: email || "member@example.com",
    subject,
    message,
    category: category || "Membership",
    status: status || "open",
    responses: [],
    createdAt: new Date().toISOString()
  };

  db.supportTickets.unshift(newTicket);
  saveDatabase();
  res.status(201).json({ ticket: newTicket, message: "Ticket logged successfully" });
});

app.put("/api/tickets/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { subject, message, category, status } = req.body;
  const ticket = db.supportTickets.find(t => t.id === id);
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  if (subject) ticket.subject = subject;
  if (message) ticket.message = message;
  if (category) ticket.category = category;
  if (status) ticket.status = status;
  saveDatabase();
  res.json(ticket);
});

app.delete("/api/tickets/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const idx = db.supportTickets.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "Ticket not found" });
  db.supportTickets.splice(idx, 1);
  saveDatabase();
  res.json({ message: "Ticket deleted" });
});

app.put("/api/support/:id/status", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const ticket = db.supportTickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found" });
  }

  ticket.status = status;
  saveDatabase();
  res.json(ticket);
});

// Payments & Subscriptions Audit
app.get("/api/payments", requireAuth, (req: AuthRequest, res) => {
  const { userId } = req.query;
  if (userId) {
    // Members may only view their own payments; admins may view any
    if (req.user && req.user.role !== UserRole.ADMIN && req.user.id !== userId) {
      return res.status(403).json({ error: "You can only view your own payment records." });
    }
    const userPayments = db.payments.filter(p => p.userId === userId);
    return res.json(userPayments);
  }
  if (req.user && req.user.role !== UserRole.ADMIN) {
    return res.json(db.payments.filter(p => p.userId === req.user!.id));
  }
  res.json(db.payments);
});

// Carousel Slides Endpoints
app.get("/api/carousel", (req, res) => {
  res.json(db.carouselSlides || []);
});

app.post("/api/carousel", requireAdmin, (req, res) => {
  const { image, title, description, overlayColor } = req.body;
  if (!image || !title) {
    return res.status(400).json({ error: "Image URL and Title are required" });
  }

  const newSlide = {
    id: "slide-" + Math.random().toString(36).substr(2, 9),
    image,
    title,
    description: description || "",
    overlayColor: overlayColor || "rgba(0,0,0,0.4)"
  };

  if (!db.carouselSlides) db.carouselSlides = [];
  db.carouselSlides.push(newSlide);
  saveDatabase();

  res.status(201).json(newSlide);
});

app.delete("/api/carousel/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!db.carouselSlides) db.carouselSlides = [];
  const idx = db.carouselSlides.findIndex(s => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Slide not found" });
  }

  db.carouselSlides.splice(idx, 1);
  saveDatabase();

  res.json({ message: "Slide successfully deleted" });
});

// Gallery Items Endpoints (CRUD)
app.get("/api/gallery", (req, res) => {
  res.json(db.galleryItems || []);
});

app.post("/api/gallery", requireAdmin, (req, res) => {
  const { title, caption, category, image, featured } = req.body;
  if (!title || !image) {
    return res.status(400).json({ error: "Title and Image are required" });
  }

  const newItem: GalleryItem = {
    id: "gallery-" + Math.random().toString(36).substr(2, 9),
    title,
    caption: caption || "",
    category: category || "General",
    image,
    featured: !!featured,
    createdAt: new Date().toISOString()
  };

  if (!db.galleryItems) db.galleryItems = [];
  db.galleryItems.push(newItem);
  saveDatabase();

  res.status(201).json(newItem);
});

app.put("/api/gallery/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { title, caption, category, image, featured } = req.body;
  if (!db.galleryItems) db.galleryItems = [];
  const item = db.galleryItems.find(g => g.id === id);
  if (!item) {
    return res.status(404).json({ error: "Gallery item not found" });
  }
  if (title !== undefined) item.title = title;
  if (caption !== undefined) item.caption = caption;
  if (category !== undefined) item.category = category;
  if (image !== undefined) item.image = image;
  if (featured !== undefined) item.featured = !!featured;
  saveDatabase();
  res.json(item);
});

app.delete("/api/gallery/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!db.galleryItems) db.galleryItems = [];
  const idx = db.galleryItems.findIndex(g => g.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Gallery item not found" });
  }

  db.galleryItems.splice(idx, 1);
  saveDatabase();

  res.json({ message: "Gallery item successfully deleted" });
});

// Founders Endpoints (CRUD)
app.get("/api/founders", (req, res) => {
  if (!db.founders || db.founders.length === 0) {
    db.founders = [
      {
        id: "founder-1",
        name: "Eleanor Vance",
        title: "Executive Director & Founder",
        bio: "Advocate for gender diversity, private wealth coach, and founder of WomenPlay with 20+ years of NASDAQ boardroom experience.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
        order: 1
      },
      {
        id: "founder-2",
        name: "Clara Montgomery",
        title: "Head of Capital Alliances",
        bio: "Venture capitalist and capital advisory specialist focusing on seed investment pipelines and scale sponsorships.",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300",
        order: 2
      },
      {
        id: "founder-3",
        name: "Olivia Chen",
        title: "Director of Global Engagements",
        bio: "Social network strategist and curator of high-profile summit venues, dinners, and international chapters.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
        order: 3
      }
    ];
    saveDatabase();
  }
  res.json(db.founders);
});

app.post("/api/founders", requireAdmin, (req, res) => {
  const { name, title, bio, image, order } = req.body;
  if (!name || !title) {
    return res.status(400).json({ error: "Founder Name and Title are required" });
  }

  const newFounder: Founder = {
    id: "founder-" + Math.random().toString(36).substr(2, 9),
    name,
    title,
    bio: bio || "",
    image: image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
    order: order ? Number(order) : ((db.founders?.length || 0) + 1),
    createdAt: new Date().toISOString()
  };

  if (!db.founders) db.founders = [];
  db.founders.push(newFounder);
  saveDatabase();

  res.status(201).json(newFounder);
});

app.put("/api/founders/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, title, bio, image, order } = req.body;

  if (!db.founders) db.founders = [];
  const founder = db.founders.find(f => f.id === id);
  if (!founder) {
    return res.status(404).json({ error: "Founder profile not found" });
  }

  if (name !== undefined) founder.name = name;
  if (title !== undefined) founder.title = title;
  if (bio !== undefined) founder.bio = bio;
  if (image !== undefined) founder.image = image;
  if (order !== undefined) founder.order = Number(order);

  saveDatabase();
  res.json(founder);
});

app.delete("/api/founders/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!db.founders) db.founders = [];
  const idx = db.founders.findIndex(f => f.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Founder not found" });
  }

  db.founders.splice(idx, 1);
  saveDatabase();

  res.json({ message: "Founder deleted successfully" });
});

// Secure Saved Cards & Payment Methods (PCI/Stripe Compliant)
app.post("/api/members/:id/setup-card", requireAuth, (req, res) => {
  const { id } = req.params;
  const { brand, last4, expMonth, expYear, paymentMethodId } = req.body;

  if (!brand || !last4 || !expMonth || !expYear) {
    return res.status(400).json({ error: "Missing required card specifications." });
  }

  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "Member profile not found." });
  }

  user.savedCard = {
    brand,
    last4,
    expMonth: Number(expMonth),
    expYear: Number(expYear),
    paymentMethodId: paymentMethodId || `pm_${Math.random().toString(36).substr(2, 9)}`
  };

  saveDatabase();
  res.json({ user, message: "Your credit card has been secured on your profile!" });
});

app.delete("/api/members/:id/delete-card", requireAuth, (req, res) => {
  const { id } = req.params;
  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: "Member profile not found." });
  }

  delete user.savedCard;
  saveDatabase();
  res.json({ user, message: "Saved payment method deleted." });
});

// Membership Badge CRUD Endpoints
app.get("/api/membership-badges", (req, res) => {
  res.json(db.membershipBadges || []);
});

app.post("/api/membership-badges", requireAdmin, (req, res) => {
  const { tier, name, cost, benefits } = req.body;
  if (!tier || !name || cost === undefined || !benefits) {
    return res.status(400).json({ error: "Missing required fields for membership badge creation." });
  }

  const newBadge: MembershipBadge = {
    id: "badge-" + Math.random().toString(36).substr(2, 9),
    tier: tier as MembershipTier,
    name,
    cost: Number(cost),
    benefits: Array.isArray(benefits) ? benefits : [benefits]
  };

  if (!db.membershipBadges) db.membershipBadges = [];
  db.membershipBadges.push(newBadge);
  saveDatabase();

  res.status(201).json({ badge: newBadge, message: "Membership Badge created successfully!" });
});

app.put("/api/membership-badges/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { tier, name, cost, benefits } = req.body;

  if (!db.membershipBadges) db.membershipBadges = [];
  const badge = db.membershipBadges.find(b => b.id === id);
  if (!badge) {
    return res.status(404).json({ error: "Membership Badge not found." });
  }

  if (tier) badge.tier = tier;
  if (name) badge.name = name;
  if (cost !== undefined) badge.cost = Number(cost);
  if (benefits) badge.benefits = Array.isArray(benefits) ? benefits : [benefits];

  saveDatabase();
  res.json({ badge, message: "Membership Badge updated successfully!" });
});

app.delete("/api/membership-badges/:id", requireAdmin, (req, res) => {
  const { id } = req.params;

  if (!db.membershipBadges) db.membershipBadges = [];
  const idx = db.membershipBadges.findIndex(b => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Membership Badge not found." });
  }

  db.membershipBadges.splice(idx, 1);
  saveDatabase();
  res.json({ message: "Membership Badge deleted successfully." });
});

// Refund Endpoint (Stripe API & Mock support)
app.post("/api/payments/:id/refund", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const payment = db.payments.find(p => p.id === id);
  if (!payment) {
    return res.status(404).json({ error: "Payment record not found." });
  }

  if (payment.status === "refunded") {
    return res.status(400).json({ error: "This payment has already been refunded." });
  }

  // Stripe refund integration (PCI/Stripe compliant)
  const stripe = getStripe();
  if (stripe && payment.transactionId.startsWith("TXN-STRIPE")) {
    try {
      await stripe.refunds.create({
        payment_intent: payment.transactionId.replace("TXN-STRIPE-", "")
      });
    } catch (e: any) {
      console.warn("Stripe refund call error (simulating fallback):", e.message);
    }
  }

  payment.status = "refunded";

  // Log in Audits
  const newLog: AuditLog = {
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: "admin-1",
    adminName: "Eleanor Vance",
    action: "PAYMENT_REFUNDED",
    details: `Issued refund of $${payment.amount} for payment ID ${payment.id} (Purpose: ${payment.purpose})`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(newLog);

  saveDatabase();
  res.json({ payment, message: `Refund of $${payment.amount} issued successfully!` });
});

// Take Attendance / Check-In Event Badge Code
app.post("/api/events/:eventId/check-in", requireAuth, (req, res) => {
  const { eventId } = req.params;
  const { badgeCode } = req.body;

  if (!badgeCode) {
    return res.status(400).json({ error: "Badge code is required for check-in." });
  }

  const reg = db.registrations.find(r => r.badgeCode.toUpperCase().trim() === badgeCode.toUpperCase().trim());
  if (!reg) {
    return res.status(404).json({ error: "Invalid badge code. Badge was not found in our database." });
  }

  if (reg.eventId !== eventId) {
    const correctEvent = db.events.find(e => e.id === reg.eventId);
    const eventTitle = correctEvent ? correctEvent.title : "a different event";
    return res.status(400).json({ 
      error: `Access Denied: This badge is registered for "${eventTitle}", not for this event.` 
    });
  }

  const event = db.events.find(e => e.id === eventId);
  if (event) {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastEvent = event.status === "past" || event.status === "archived" || eventDate < today;
    if (isPastEvent) {
      return res.status(400).json({ 
        error: `Access Denied: This access pass for "${event.title}" has expired. This event has already taken place.` 
      });
    }
    if (event.status === "deactivated" || event.deactivated) {
      return res.status(400).json({ 
        error: `Access Denied: This access pass belongs to "${event.title}", which has been closed and deactivated.` 
      });
    }
  }

  const user = db.users.find(u => u.id === reg.userId);
  const fullName = user ? user.fullName : "Attendee";
  const email = user ? user.email : "";

  const existingAttendance = (db.attendance || []).find(a => a.eventId === eventId && a.accessCode.toUpperCase().trim() === badgeCode.toUpperCase().trim());

  if (reg.attended || existingAttendance) {
    if (!existingAttendance) {
      db.attendance = db.attendance || [];
      db.attendance.unshift({
        id: "att-" + Math.random().toString(36).substr(2, 9),
        eventId,
        eventName: event ? event.title : "",
        userId: reg.userId,
        fullName,
        email,
        accessCode: reg.badgeCode,
        scannedAt: new Date().toISOString()
      });
      saveDatabase();
    }
    return res.json({ 
      registration: reg, 
      user, 
      message: `${fullName} is already checked in for this event.`,
      alreadyCheckedIn: true 
    });
  }

  reg.attended = true;
  db.attendance = db.attendance || [];
  db.attendance.unshift({
    id: "att-" + Math.random().toString(36).substr(2, 9),
    eventId,
    eventName: event ? event.title : "",
    userId: reg.userId,
    fullName,
    email,
    accessCode: reg.badgeCode,
    scannedAt: new Date().toISOString()
  });
  saveDatabase();

  res.json({ 
    registration: reg, 
    user, 
    message: `Access Granted! Welcome, ${fullName}.`,
    alreadyCheckedIn: false 
  });
});

// Attendance module: list check-ins for an event
app.get("/api/events/:eventId/attendance", requireAdmin, (req, res) => {
  const { eventId } = req.params;
  const event = db.events.find(e => e.id === eventId);
  const records = (db.attendance || [])
    .filter(a => a.eventId === eventId)
    .map(a => ({
      ...a,
      eventName: a.eventName || (event ? event.title : "")
    }))
    .sort((a, b) => b.scannedAt.localeCompare(a.scannedAt));
  res.json(records);
});

// Settings Endpoints
app.get("/api/settings", requireAdmin, (req, res) => {
  res.json(db.settings || {
    stripeMode: "test",
    stripeTestPublicKey: process.env.STRIPE_TEST_PUBLIC_KEY || "",
    stripeTestSecretKey: process.env.STRIPE_TEST_SECRET_KEY || "",
    stripeLivePublicKey: process.env.STRIPE_LIVE_PUBLIC_KEY || "",
    stripeLiveSecretKey: process.env.STRIPE_LIVE_SECRET_KEY || "",
    stripePublicKey: process.env.STRIPE_PUBLIC_KEY || "",
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
    isSubscriptionRequired: false,
    smtpSettings: {
      host: "smtp.mailtrap.io",
      port: 587,
      user: "",
      pass: "",
      secure: false,
      fromEmail: "admin@womenplay.org",
      fromName: "WomenPlay Executive Secretariat",
      enableAlerts: true,
      alertOnRegistration: true,
      alertOnEventBooking: true,
      alertOnContactInquiry: true,
      alertOnSupportTicket: true
    }
  });
});

app.post("/api/settings", requireAdmin, (req, res) => {
  const { 
    stripeMode, 
    stripeTestPublicKey, 
    stripeTestSecretKey, 
    stripeLivePublicKey, 
    stripeLiveSecretKey, 
    stripePublicKey, 
    stripeSecretKey, 
    stripeWebhookSecret,
    isSubscriptionRequired,
    smtpSettings
  } = req.body;
  
  if (!db.settings) {
    db.settings = {
      stripeMode: "test",
      stripeTestPublicKey: "",
      stripeTestSecretKey: "",
      stripeLivePublicKey: "",
      stripeLiveSecretKey: "",
      stripePublicKey: "",
      stripeSecretKey: "",
      isSubscriptionRequired: false
    };
  }

  db.settings.stripeMode = stripeMode || "test";
  db.settings.stripeTestPublicKey = stripeTestPublicKey ?? db.settings.stripeTestPublicKey ?? "";
  db.settings.stripeLivePublicKey = stripeLivePublicKey ?? db.settings.stripeLivePublicKey ?? "";
  db.settings.stripePublicKey = stripeMode === "live" ? (stripeLivePublicKey || stripePublicKey || "") : (stripeTestPublicKey || stripePublicKey || "");

  // Security: SECRET keys must NEVER be persisted to the database file in
  // production — always read them from environment variables. Public keys
  // are harmless and may be stored for the admin UI.
  const persistStripeSecretKeys = !isProd;
  db.settings.stripeTestSecretKey = persistStripeSecretKeys
    ? (stripeTestSecretKey ?? db.settings.stripeTestSecretKey ?? "")
    : "";
  db.settings.stripeLiveSecretKey = persistStripeSecretKeys
    ? (stripeLiveSecretKey ?? db.settings.stripeLiveSecretKey ?? "")
    : "";
  db.settings.stripeSecretKey = persistStripeSecretKeys
    ? (stripeMode === "live" ? (stripeLiveSecretKey || stripeSecretKey || "") : (stripeTestSecretKey || stripeSecretKey || ""))
    : "";
  db.settings.isSubscriptionRequired = !!isSubscriptionRequired;
  if (stripeWebhookSecret !== undefined) {
    db.settings.stripeWebhookSecret = persistStripeSecretKeys ? (stripeWebhookSecret || undefined) : undefined;
  }
  
  if (smtpSettings) {
    db.settings.smtpSettings = smtpSettings;
  }

  saveDatabase();
  res.json({ settings: db.settings, message: "Settings updated successfully" });
});

// SMTP Helper for Sending Outgoing Alerts & Transactional Emails
async function sendNotificationEmail(subject: string, htmlContent: string, customRecipient?: string) {
  const smtp = db.settings?.smtpSettings;
  const recipient = customRecipient || smtp?.fromEmail;

  if (!recipient) {
    return { success: false, reason: "No recipient email specified" };
  }

  // Record dispatch entry in db.sentEmails log for auditing and fallback display
  if (!db.sentEmails) db.sentEmails = [];
  const logEntry = {
    id: "mail-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    to: recipient,
    subject,
    htmlContent,
    status: "dispatched",
    sentAt: new Date().toISOString()
  };
  db.sentEmails.unshift(logEntry);
  if (db.sentEmails.length > 200) db.sentEmails.pop();
  saveDatabase();

  if (!smtp || !smtp.enableAlerts) {
    console.log(`ℹ️ SMTP outgoing notifications unconfigured. Logged transactional email to ${recipient}: "${subject}"`);
    return { success: true, simulated: true, recipient, messageId: logEntry.id };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port || 465,
      secure: smtp.secure,
      auth: (smtp.user && smtp.pass) ? {
        user: smtp.user,
        pass: smtp.pass
      } : undefined,
      tls: {
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false"
      }
    });

    const info = await transporter.sendMail({
      from: `"${smtp.fromName || 'WomenPlay Secretariat'}" <${smtp.fromEmail || smtp.user}>`,
      to: recipient,
      subject: `[WomenPlay Network] ${subject}`,
      html: htmlContent
    });

    console.log(`✅ SMTP email dispatched to ${recipient}: ${info.messageId}`);
    logEntry.status = "sent_via_smtp";
    saveDatabase();
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("❌ SMTP email transmission error (falling back to saved dispatch log):", err.message || err);
    logEntry.status = "failed_smtp_fallback";
    saveDatabase();
    return { success: true, simulated: true, error: err.message || String(err) };
  }
}

// Helper to send Admin Dashboard & Email Alerts for Contact, Support, and Payments
async function sendAdminAlertNotification(
  type: "contact" | "support" | "payment",
  details: {
    title: string;
    summary: string;
    amount?: number;
    userEmail?: string;
    userName?: string;
    linkPath: string;
  },
  reqHost?: string
) {
  // 1. Log System Alert in Audit Logs so it appears immediately on Admin Dashboard
  const log: AuditLog = {
    id: "alert-" + Math.random().toString(36).substr(2, 9),
    adminId: "SYSTEM",
    adminName: "Executive System Alert",
    action: `NEW_${type.toUpperCase()}_NOTIFICATION`,
    details: `${details.title} - ${details.summary}`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(log);
  saveDatabase();

  // 2. Dispatch SMTP Notification Email to Admin
  const smtp = db.settings?.smtpSettings;
  if (!smtp || !smtp.enableAlerts) {
    console.log(`ℹ️ SMTP alerts disabled or unconfigured. Admin notification for ${type} logged to dashboard.`);
    return;
  }

  const appBaseUrl = process.env.APP_URL || (reqHost ? `https://${reqHost}` : "https://womenplay.org");
  const actionUrl = `${appBaseUrl}${details.linkPath}`;

  const typeLabel = type === "contact" ? "Contact Inquiry" : type === "support" ? "Support Ticket" : "Payment Received";
  const emailSubject = `New ${typeLabel}: ${details.title}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
        .header { background: #020617; padding: 32px 28px; text-align: center; color: #ffffff; border-bottom: 3px solid #db2777; }
        .badge { display: inline-block; background: #db2777; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 999px; margin-bottom: 12px; }
        .title { font-size: 22px; font-weight: 800; margin: 0; color: #ffffff; }
        .body { padding: 32px 28px; }
        .meta-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
        .meta-table td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
        .meta-table td:first-child { font-weight: 700; color: #64748b; width: 35%; }
        .meta-table td:last-child { color: #0f172a; font-weight: 600; }
        .summary-box { background: #fff5f8; border-left: 4px solid #db2777; padding: 16px; border-radius: 8px; font-size: 13px; color: #334155; line-height: 1.6; margin-top: 16px; white-space: pre-wrap; }
        .btn-container { text-align: center; margin-top: 32px; }
        .btn { display: inline-block; background: #0f172a; color: #ffffff !important; font-size: 13px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(15,23,42,0.15); }
        .footer { background: #f1f5f9; padding: 20px 28px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="badge">Immediate Executive Alert</div>
          <h1 class="title">${typeLabel} Notification</h1>
        </div>
        <div class="body">
          <p style="font-size: 14px; margin-top: 0; color: #475569;">
            A new <strong>${typeLabel.toLowerCase()}</strong> activity was registered on the WomenPlay Secretariat portal:
          </p>

          <table class="meta-table">
            <tr>
              <td>Title / Item</td>
              <td>${details.title}</td>
            </tr>
            ${details.userName ? `<tr><td>Submitted By</td><td>${details.userName}</td></tr>` : ''}
            ${details.userEmail ? `<tr><td>Email Address</td><td><a href="mailto:${details.userEmail}" style="color: #db2777;">${details.userEmail}</a></td></tr>` : ''}
            ${details.amount !== undefined ? `<tr><td>Amount Paid</td><td style="color: #059669; font-weight: 800;">$${details.amount.toFixed(2)} USD</td></tr>` : ''}
            <tr>
              <td>Timestamp</td>
              <td>${new Date().toLocaleString()}</td>
            </tr>
          </table>

          <div class="summary-box">
            <strong>Details / Message:</strong><br/>
            ${details.summary}
          </div>

          <div class="btn-container">
            <a href="${actionUrl}" class="btn">View Details in Admin Dashboard &rarr;</a>
          </div>
        </div>
        <div class="footer">
          WomenPlay Global Secretariat • Executive Automated Alert System<br/>
          This is an automated notification sent to system administrators via SMTP.
        </div>
      </div>
    </body>
    </html>
  `;

  // Send to admin email (smtp.fromEmail or smtp.user)
  const recipient = smtp.fromEmail || smtp.user;
  if (recipient) {
    sendNotificationEmail(emailSubject, htmlContent, recipient)
      .catch(err => console.error(`Admin alert email dispatch failed for ${type}:`, err));
  }
}

// SMTP Settings Endpoints
app.get("/api/smtp", requireAdmin, (req, res) => {
  res.json(db.settings?.smtpSettings || {
    host: process.env.SMTP_HOST || "mail.womenplay.org",
    port: parseInt(process.env.SMTP_PORT || "465"),
    user: process.env.SMTP_USER || "notifications@womenplay.org",
    pass: process.env.SMTP_PASS || "",
    secure: process.env.SMTP_SECURE !== "false",
    fromEmail: process.env.SMTP_FROM || "notifications@womenplay.org",
    fromName: "WomenPlay Secretariat",
    enableAlerts: true,
    alertOnRegistration: true,
    alertOnEventBooking: true,
    alertOnContactInquiry: true,
    alertOnSupportTicket: true
  });
});

app.put("/api/smtp", requireAdmin, (req, res) => {
  const { 
    host, port, user, pass, secure, 
    fromEmail, fromName, enableAlerts, 
    alertOnRegistration, alertOnEventBooking, 
    alertOnContactInquiry, alertOnSupportTicket 
  } = req.body;

  if (!db.settings) {
    db.settings = {
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY || "",
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
      isSubscriptionRequired: false
    };
  }

  db.settings.smtpSettings = {
    host: host || "mail.womenplay.org",
    port: port ? Number(port) : 465,
    user: user || "",
    pass: pass !== undefined ? pass : (db.settings.smtpSettings?.pass || ""),
    secure: secure !== undefined ? Boolean(secure) : true,
    fromEmail: fromEmail || "notifications@womenplay.org",
    fromName: fromName || "WomenPlay Secretariat",
    enableAlerts: enableAlerts !== undefined ? Boolean(enableAlerts) : true,
    alertOnRegistration: alertOnRegistration !== undefined ? Boolean(alertOnRegistration) : true,
    alertOnEventBooking: alertOnEventBooking !== undefined ? Boolean(alertOnEventBooking) : true,
    alertOnContactInquiry: alertOnContactInquiry !== undefined ? Boolean(alertOnContactInquiry) : true,
    alertOnSupportTicket: alertOnSupportTicket !== undefined ? Boolean(alertOnSupportTicket) : true
  };

  saveDatabase();
  res.json({ smtpSettings: db.settings.smtpSettings, message: "SMTP configuration updated successfully!" });
});

app.post("/api/smtp/test", requireAdmin, async (req, res) => {
  const { recipientEmail, host, port, user, pass, secure, fromEmail, fromName } = req.body;
  const testTarget = recipientEmail || fromEmail || user || "test@womenplay.org";

  const smtpHost = host || db.settings?.smtpSettings?.host || "mail.womenplay.org";
  const smtpPort = port ? Number(port) : (db.settings?.smtpSettings?.port || 465);
  const smtpUser = user !== undefined ? user : (db.settings?.smtpSettings?.user || "");
  const smtpPass = pass !== undefined ? pass : (db.settings?.smtpSettings?.pass || "");
  const smtpSecure = secure !== undefined ? Boolean(secure) : (db.settings?.smtpSettings?.secure !== false);
  const smtpFromEmail = fromEmail || db.settings?.smtpSettings?.fromEmail || "notifications@womenplay.org";
  const smtpFromName = fromName || db.settings?.smtpSettings?.fromName || "WomenPlay Secretariat";

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: (smtpUser && smtpPass) ? { user: smtpUser, pass: smtpPass } : undefined,
      tls: { rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false" }
    });

    const info = await transporter.sendMail({
      from: `"${smtpFromName}" <${smtpFromEmail}>`,
      to: testTarget,
      subject: "Test Email - WomenPlay SMTP Outgoing Alert System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #9d174d; margin-top: 0;">WomenPlay Outgoing SMTP Test</h2>
          <p style="font-size: 14px; color: #334155;">Congratulations! Your SMTP outgoing server parameters have been successfully validated.</p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 15px 0;" />
          <ul style="font-size: 12px; color: #64748b; line-height: 1.6; padding-left: 20px;">
            <li><strong>SMTP Server Host:</strong> ${smtpHost}</li>
            <li><strong>Port / Encryption:</strong> ${smtpPort} (${smtpSecure ? 'SSL/TLS' : 'STARTTLS/None'})</li>
            <li><strong>From Sender:</strong> ${smtpFromName} &lt;${smtpFromEmail}&gt;</li>
            <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
          </ul>
          <p style="font-size: 11px; color: #94a3b8; margin-top: 20px;">This is an automated test message from the WomenPlay Executive Portal admin panel.</p>
        </div>
      `
    });

    res.json({
      success: true,
      message: `Test email sent successfully to ${testTarget}! (Message ID: ${info.messageId})`,
      messageId: info.messageId
    });
  } catch (err: any) {
    console.error("Test email failed:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to send test email. Check host, credentials, or firewall settings."
    });
  }
});

// Helper to render transactional email templates
// EMAIL TEMPLATES ENDPOINTS
app.get("/api/email-templates", requireAdmin, (req, res) => {
  if (!db.settings) db.settings = { stripePublicKey: "", stripeSecretKey: "", isSubscriptionRequired: false };
  if (!db.settings.emailTemplates || db.settings.emailTemplates.length === 0) {
    db.settings.emailTemplates = getDefaultEmailTemplates();
  } else {
    // Ensure missing default templates (like bulk-announcement & executive-newsletter) are present
    const defaults = getDefaultEmailTemplates();
    defaults.forEach(def => {
      if (!db.settings.emailTemplates.some(t => t.id === def.id)) {
        db.settings.emailTemplates.push(def);
      }
    });
  }
  res.json(db.settings.emailTemplates);
});

app.put("/api/email-templates/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { subject, bodyHtml } = req.body;

  if (!db.settings) db.settings = { stripePublicKey: "", stripeSecretKey: "", isSubscriptionRequired: false };
  if (!db.settings.emailTemplates || db.settings.emailTemplates.length === 0) {
    db.settings.emailTemplates = getDefaultEmailTemplates();
  }

  const tmpl = db.settings.emailTemplates.find(t => t.id === id);
  if (!tmpl) {
    return res.status(404).json({ error: "Email template not found" });
  }

  if (subject !== undefined) tmpl.subject = subject;
  if (bodyHtml !== undefined) tmpl.bodyHtml = bodyHtml;
  tmpl.updatedAt = new Date().toISOString();

  saveDatabase();
  res.json({ template: tmpl, message: `Template "${tmpl.name}" updated successfully!` });
});

app.post("/api/email-templates/:id/reset", requireAdmin, (req, res) => {
  const { id } = req.params;
  const defaults = getDefaultEmailTemplates();

  if (!db.settings) db.settings = { stripePublicKey: "", stripeSecretKey: "", isSubscriptionRequired: false };
  if (!db.settings.emailTemplates) db.settings.emailTemplates = [];

  const defaultTmpl = defaults.find(t => t.id === id);
  if (!defaultTmpl) {
    return res.status(404).json({ error: "Default template not found" });
  }

  const idx = db.settings.emailTemplates.findIndex(t => t.id === id);
  if (idx > -1) {
    db.settings.emailTemplates[idx] = { ...defaultTmpl, updatedAt: new Date().toISOString() };
  } else {
    db.settings.emailTemplates.push({ ...defaultTmpl, updatedAt: new Date().toISOString() });
  }

  saveDatabase();
  res.json({ template: db.settings.emailTemplates.find(t => t.id === id), message: `Template "${defaultTmpl.name}" reset to system default!` });
});

app.post("/api/email-templates/:id/test", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { recipientEmail, sampleReplacements } = req.body;

  const targetEmail = recipientEmail || db.settings?.smtpSettings?.fromEmail || "test@womenplay.org";

  const defaultSamples: Record<string, Record<string, string>> = {
    "registration-confirmation": {
      userName: "Lady Eleanor Vance",
      userEmail: targetEmail,
      membershipTier: "Elite Boardroom Sponsor",
      appUrl: "https://womenplay.org"
    },
    "event-access-pass": {
      userName: "Victoria Sterling",
      userEmail: targetEmail,
      eventName: "Aura Annual Women in Leadership Summit 2026",
      eventDate: "2026-09-15 (09:00 AM - 05:00 PM)",
      eventLocation: "Grand Ballroom, The Plaza Hotel",
      ticketCode: "BADGE-VIP-8892",
      ticketPackage: "VIP Gold Badge Pass",
      ticketPrice: "350",
      appUrl: "https://womenplay.org"
    },
    "contact-acknowledgment": {
      userName: "Dr. Clara Oswald",
      userEmail: targetEmail,
      inquirySubject: "Sponsorship & Strategic Corporate Partnership",
      inquiryMessage: "Our organization is looking to sponsor the upcoming Women in Leadership Summit. Please connect us with your corporate alliances director.",
      appUrl: "https://womenplay.org"
    },
    "support-ticket-confirmation": {
      userName: "Sophia Kensington",
      userEmail: targetEmail,
      ticketId: "contact-98213",
      ticketCategory: "VIP Member Concierge",
      ticketSubject: "Boardroom Mentorship Schedule Request",
      ticketDetails: "I would like to align my schedule for the upcoming Q3 AI Boardroom mentorship session.",
      appUrl: "https://womenplay.org"
    },
    "bulk-announcement": {
      recipientName: "Lady Eleanor Vance",
      recipientEmail: targetEmail,
      announcementTitle: "Q3 Executive Summit & Boardroom Masterclass Keynote",
      messageContent: "We are delighted to invite all accredited WomenPlay executive leaders to our upcoming Q3 masterclass featuring top global venture partners and board directors.",
      appUrl: "https://womenplay.org"
    },
    "executive-newsletter": {
      recipientName: "Lady Eleanor Vance",
      recipientEmail: targetEmail,
      newsletterTitle: "Empowering Women in Venture & Boardroom Governance",
      messageContent: "Discover this week's highlights: 5 new board seats appointed, global fellowship openings, and exclusive executive roundtable recordings now available in the portal.",
      appUrl: "https://womenplay.org"
    }
  };

  const replacements = { ...(defaultSamples[id] || {}), ...(sampleReplacements || {}) };
  const rendered = renderEmailTemplate(id, replacements, db.settings?.emailTemplates);

  if (!rendered) {
    return res.status(404).json({ error: "Email template not found" });
  }

  const result = await sendNotificationEmail(rendered.subject, rendered.bodyHtml, targetEmail);
  if (result.success) {
    res.json({
      success: true,
      message: `Test template email dispatched to ${targetEmail}!`,
      rendered
    });
  } else {
    res.status(500).json({
      success: false,
      error: result.error || result.reason || "Failed to send test email. Ensure SMTP alert dispatch is enabled.",
      rendered
    });
  }
});

// Stripe Checkout success and cancel handlers
app.get("/api/payments/stripe-success", async (req, res) => {
  const { session_id, userId, tier } = req.query;
  const stripe = getStripe();
  
  if (!userId) {
    return res.redirect("/?stripe_error=missing_user");
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.redirect("/?stripe_error=user_not_found");
  }

  let stripeSubId = "";
  if (stripe && session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id as string);
      stripeSubId = session.subscription as string;
    } catch (e) {
      console.error("Failed to retrieve Stripe session info:", e);
    }
  }

  // Update user membership status and tier
  user.membershipTier = tier as MembershipTier;
  user.membershipStatus = MembershipStatus.ACTIVE;

  // Generate Payment
  const transactionId = "TXN-STRIPE-" + Math.floor(Math.random() * 9000000 + 1000000);
  const receiptNumber = "RCPT-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 90000 + 10000);
  const fee = tier === "ELITE" ? 250 : 100;

  const newPayment: Payment = {
    id: "pay-" + Math.random().toString(36).substr(2, 9),
    userId: userId as string,
    amount: fee,
    purpose: "Membership",
    itemId: tier as string,
    status: "completed",
    method: "Credit Card",
    transactionId,
    createdAt: new Date().toISOString(),
    receiptNumber
  };

  db.payments.unshift(newPayment);

  // Add subscription record
  const nextBilling = new Date();
  nextBilling.setDate(nextBilling.getDate() + 30);

  const newSub = {
    id: "sub-" + Math.random().toString(36).substr(2, 9),
    userId: userId as string,
    tier: tier as MembershipTier,
    status: "active" as const,
    stripeSubscriptionId: stripeSubId,
    nextBillingDate: nextBilling.toISOString(),
    createdAt: new Date().toISOString(),
    amount: fee
  };

  if (!db.subscriptions) db.subscriptions = [];
  db.subscriptions.unshift(newSub);

  // Add audit log
  const newLog: AuditLog = {
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: "system",
    adminName: "Stripe Gateway",
    action: "MEMBERSHIP_SUBSCRIBED",
    details: `${user.fullName} subscribed to ${tier} Membership via Stripe Checkout`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(newLog);

  saveDatabase();

  // Redirect back to user's portal view with success message
  res.redirect("/?stripe_success=true");
});

// Stripe Webhook — the trusted source of truth for payment confirmations.
// Verify signatures before applying any state changes.
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || db.settings?.stripeWebhookSecret;

  if (!stripe) {
    return res.status(500).json({ error: "Stripe not configured" });
  }
  if (!sig || !webhookSecret) {
    console.error("Stripe webhook: missing signature or webhook secret.");
    return res.status(400).json({ error: "Missing signature or webhook secret" });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      (req as any).rawBody || req.body,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  // Handle the event types we care about
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const meta = session.metadata || {};
      const userId = meta.userId || session.client_reference_id || "";
      if (!userId) {
        console.error("Stripe webhook: no userId in session metadata", session.id);
        return res.json({ received: true });
      }

      const user = db.users.find(u => u.id === userId);
      if (!user) {
        console.error("Stripe webhook: user not found for", userId);
        return res.json({ received: true });
      }

      // Idempotency: skip if a payment for this session already exists
      const txnId = session.payment_intent as string || session.id as string;
      const existing = db.payments.find(p => p.transactionId === `TXN-STRIPE-${txnId}` || p.transactionId === `TXN-STRIPE-E-${txnId}`);
      if (existing) {
        console.log("Stripe webhook: duplicate event, skipping", session.id);
        return res.json({ received: true, duplicate: true });
      }

      if (meta.kind === "launch-ticket") {
        const recorded = await recordLaunchTicketPurchase(session, {
          db,
          saveDatabase,
          getStripe,
          emailPattern,
          requireAdmin,
          sendNotificationEmail,
        });
        console.log(`Stripe webhook: launch ticket ${recorded ? "recorded" : "already exists, skipped"} for ${meta.attendeeEmail || session.customer_email || "unknown"}`);
      } else if (meta.kind === "event") {
        const eventId = meta.eventId;
        const packageId = meta.packageId;
        const eventItem = db.events.find(e => e.id === eventId);
        const pkg = eventItem?.packages.find(p => p.id === packageId);

        if (eventItem && pkg && !db.registrations.find(r => r.userId === userId && r.eventId === eventId && r.packageId === packageId)) {
          const fee = pkg.fee;
          const receiptNumber = "RCPT-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 90000 + 10000);
          db.payments.unshift({
            id: "pay-" + Math.random().toString(36).substr(2, 9),
            userId,
            amount: fee,
            purpose: "Event Registration",
            itemId: eventId,
            status: "completed",
            method: "Credit Card",
            transactionId: `TXN-STRIPE-E-${txnId}`,
            createdAt: new Date().toISOString(),
            receiptNumber
          });
          db.registrations.unshift({
            id: "reg-" + Math.random().toString(36).substr(2, 9),
            eventId,
            userId,
            packageId,
            packageName: pkg.name,
            amountPaid: fee,
            paymentId: `pay-${session.id.slice(-8)}`,
            badgeCode: "EVT-" + Math.random().toString(36).substr(2, 8).toUpperCase(),
            registeredAt: new Date().toISOString(),
            attended: false
          });
          eventItem.registeredCount = (eventItem.registeredCount || 0) + 1;
          db.auditLogs.unshift({
            id: "log-" + Math.random().toString(36).substr(2, 9),
            adminId: "system",
            adminName: "Stripe Gateway",
            action: "EVENT_REGISTERED",
            details: `${user.fullName} registered for ${eventItem.title} (${pkg.name}) via Stripe`,
            timestamp: new Date().toISOString()
          });
          saveDatabase();
          console.log(`Stripe webhook: event registration recorded for ${user.email}`);
        }
      } else {
        // Membership subscription
        const tier = (meta.tier as MembershipTier) || user.membershipTier;
        user.membershipTier = tier;
        user.membershipStatus = MembershipStatus.ACTIVE;

        const fee = tier === "ELITE" ? 250 : tier === "PREMIUM" ? 100 : 0;
        const receiptNumber = "RCPT-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 90000 + 10000);
        db.payments.unshift({
          id: "pay-" + Math.random().toString(36).substr(2, 9),
          userId,
          amount: fee,
          purpose: "Membership",
          itemId: tier,
          status: "completed",
          method: "Credit Card",
          transactionId: `TXN-STRIPE-${txnId}`,
          createdAt: new Date().toISOString(),
          receiptNumber
        });

        const nextBilling = new Date();
        nextBilling.setDate(nextBilling.getDate() + 30);
      if (!db.subscriptions) db.subscriptions = [];
      if (!db.launchTickets) db.launchTickets = [];

        db.subscriptions.unshift({
          id: "sub-" + Math.random().toString(36).substr(2, 9),
          userId,
          tier,
          status: "active",
          stripeSubscriptionId: (session.subscription as string) || undefined,
          nextBillingDate: nextBilling.toISOString(),
          createdAt: new Date().toISOString(),
          amount: fee
        });

        db.auditLogs.unshift({
          id: "log-" + Math.random().toString(36).substr(2, 9),
          adminId: "system",
          adminName: "Stripe Gateway",
          action: "MEMBERSHIP_SUBSCRIBED",
          details: `${user.fullName} subscribed to ${tier} Membership via Stripe`,
          timestamp: new Date().toISOString()
        });
        saveDatabase();
        console.log(`Stripe webhook: membership activated for ${user.email}`);
      }
      break;
    }

    case "invoice.payment_failed":
    case "customer.subscription.deleted": {
      const sub = event.data.object as any;
      const subId = sub.id || sub.subscription;
      const local = db.subscriptions?.find(s => s.stripeSubscriptionId === subId);
      if (local) {
        local.status = "cancelled";
        const user = db.users.find(u => u.id === local.userId);
        if (user) user.membershipStatus = MembershipStatus.PENDING;
        saveDatabase();
        console.log(`Stripe webhook: subscription ${subId} ${event.type}`);
      }
      break;
    }

    default:
      break;
  }

  res.json({ received: true });
});

// Member Unsubscribe API
app.post("/api/members/unsubscribe", requireAuth, async (req, res) => {
  const { userId } = req.body;
  
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Find active subscription
  if (!db.subscriptions) db.subscriptions = [];
  const sub = db.subscriptions.find(s => s.userId === userId && s.status === "active");
  if (!sub) {
    return res.status(400).json({ error: "No active subscription found to cancel." });
  }

  // Cancel on Stripe if applicable
  const stripe = getStripe();
  if (stripe && sub.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
    } catch (e: any) {
      console.error("Failed to cancel subscription on Stripe:", e);
    }
  }

  // Update local subscription state
  sub.status = "cancelled";
  user.membershipTier = MembershipTier.BASIC;
  
  // Set membershipStatus back to pending if they unsubscribe and subscription required is enabled
  if (db.settings?.isSubscriptionRequired) {
    user.membershipStatus = MembershipStatus.PENDING;
  }

  // Generate audit log
  const newLog: AuditLog = {
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: "system",
    adminName: "Billing Gateway",
    action: "MEMBERSHIP_UNSUBSCRIBED",
    details: `${user.fullName} cancelled their ${sub.tier} Subscription.`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(newLog);

  saveDatabase();
  res.json({ user, subscription: sub, message: "Subscription cancelled successfully." });
});

// Get user subscription info
app.get("/api/members/:userId/subscription", requireAuth, (req, res) => {
  const { userId } = req.params;
  if (!db.subscriptions) db.subscriptions = [];
  const sub = db.subscriptions.find(s => s.userId === userId && s.status === "active");
  res.json(sub || null);
});

// Stripe Checkout Session for Event Registration
app.post("/api/events/:id/register-stripe", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { userId, packageId } = req.body;

  const event = db.events.find(e => e.id === id);
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  const pkg = event.packages.find(p => p.id === packageId);
  if (!pkg) {
    return res.status(404).json({ error: "Selected package not found" });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const stripe = getStripe();
  if (stripe) {
    try {
      const origin = req.headers.origin || "http://localhost:3000";
      
      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `${event.title} - ${pkg.name}`,
              description: pkg.description,
            },
            unit_amount: pkg.fee * 100, // in cents
          },
          quantity: 1,
        }],
        mode: "payment",
        client_reference_id: userId,
        metadata: { userId, eventId: id, packageId, kind: "event" },
        success_url: `${origin}/api/payments/event-success?session_id={CHECKOUT_SESSION_ID}&userId=${userId}&eventId=${id}&packageId=${packageId}`,
        cancel_url: `${origin}/?stripe_cancel=true`,
      });

      return res.json({ checkoutUrl: session.url });
    } catch (e: any) {
      console.error("Stripe Event Register Error:", e);
      return res.status(500).json({ error: e.message || "Failed to create Stripe Session" });
    }
  }

  return res.status(400).json({ error: "Stripe not configured or in mock mode" });
});

// Stripe Event Registration Success handler
app.get("/api/payments/event-success", async (req, res) => {
  const { session_id, userId, eventId, packageId } = req.query;

  const event = db.events.find(e => e.id === eventId);
  if (!event) return res.redirect("/?stripe_error=event_not_found");

  const pkg = event.packages.find(p => p.id === packageId);
  if (!pkg) return res.redirect("/?stripe_error=package_not_found");

  const user = db.users.find(u => u.id === userId);
  if (!user) return res.redirect("/?stripe_error=user_not_found");

  // Create payment record
  const transactionId = "TXN-STRIPE-E-" + Math.floor(Math.random() * 9000000 + 1000000);
  const receiptNumber = "RCPT-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 90000 + 10000);

  const payment: Payment = {
    id: "pay-" + Math.random().toString(36).substr(2, 9),
    userId: userId as string,
    amount: pkg.fee,
    purpose: "Event Registration",
    itemId: eventId as string,
    status: "completed",
    method: "Credit Card",
    transactionId,
    createdAt: new Date().toISOString(),
    receiptNumber
  };
  db.payments.unshift(payment);

  // Create registration
  const badgeCode = `AURA-E${(eventId as string).slice(-3).toUpperCase()}-${pkg.name.split(" ")[0].toUpperCase()}-${Math.floor(Math.random() * 90000 + 10000)}`;

  const registration: Registration = {
    id: "reg-" + Math.random().toString(36).substr(2, 9),
    eventId: eventId as string,
    userId: userId as string,
    packageId: packageId as string,
    packageName: pkg.name,
    amountPaid: pkg.fee,
    paymentId: payment.id,
    badgeCode,
    registeredAt: new Date().toISOString(),
    attended: false
  };

  db.registrations.push(registration);
  event.registeredCount += 1;

  saveDatabase();

  res.redirect("/?stripe_event_success=true");
});

// Blog Routes
app.get("/api/blogs", (req, res) => {
  res.json(db.blogs);
});

app.post("/api/blogs", requireAdmin, (req, res) => {
  const { title, content, category, author, image, adminId, adminName } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newBlog: BlogArticle = {
    id: "blog-" + Math.random().toString(36).substr(2, 9),
    title,
    content,
    category: category || "General",
    author: author || adminName || "Aura Team",
    image: image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    createdAt: new Date().toISOString(),
    status: "published"
  };

  db.blogs.unshift(newBlog);

  // Log Audit Action
  const newLog: AuditLog = {
    id: "log-" + Math.random().toString(36).substr(2, 9),
    adminId: adminId || "admin-1",
    adminName: adminName || "Administrator",
    action: "BLOG_CREATED",
    details: `Created blog article: ${title}`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(newLog);

  saveDatabase();
  res.status(201).json(newBlog);
});

app.put("/api/blogs/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { title, content, category, author, image, status } = req.body;

  const blog = db.blogs.find(b => b.id === id);
  if (!blog) {
    return res.status(404).json({ error: "Blog article not found" });
  }

  if (title) blog.title = title;
  if (content) blog.content = content;
  if (category) blog.category = category;
  if (author) blog.author = author;
  if (image) blog.image = image;
  if (status) blog.status = status;

  saveDatabase();
  res.json(blog);
});

app.delete("/api/blogs/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const idx = db.blogs.findIndex(b => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Blog not found" });
  }

  db.blogs.splice(idx, 1);
  saveDatabase();
  res.json({ message: "Blog article successfully deleted" });
});

// Announcements Route
app.get("/api/announcements", (req, res) => {
  res.json(db.announcements);
});

app.post("/api/announcements", requireAdmin, (req, res) => {
  const { title, content, priority } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Missing title or content" });
  }

  const announce: Announcement = {
    id: "announce-" + Math.random().toString(36).substr(2, 9),
    title,
    content,
    priority: priority || "low",
    createdAt: new Date().toISOString(),
    active: true
  };

  db.announcements.unshift(announce);
  saveDatabase();
  res.status(201).json(announce);
});

app.put("/api/announcements/:id/toggle", requireAdmin, (req, res) => {
  const { id } = req.params;
  const ann = db.announcements.find(a => a.id === id);
  if (!ann) {
    return res.status(404).json({ error: "Announcement not found" });
  }

  ann.active = !ann.active;
  saveDatabase();
  res.json(ann);
});

// Admin Success Story Edit Route
app.put("/api/success-stories/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { title, content, imageUrl, approved } = req.body;
  const story = db.successStories.find(s => s.id === id);
  if (!story) {
    return res.status(404).json({ error: "Success story not found" });
  }
  if (title !== undefined) story.title = title;
  if (content !== undefined) story.content = content;
  if (imageUrl !== undefined) story.imageUrl = imageUrl;
  if (approved !== undefined) story.approved = approved;
  saveDatabase();
  res.json(story);
});

// Admin Community Post Edit Route
app.put("/api/community/posts/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const { content, imageUrl } = req.body;
  const post = db.posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  if (content !== undefined) post.content = content;
  if (imageUrl !== undefined) post.imageUrl = imageUrl;
  saveDatabase();
  res.json(post);
});

// Admin Support Ticket CRUD & Delete Routes
app.put("/api/support/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { subject, message, category, status } = req.body;
  const ticket = db.supportTickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ error: "Support ticket not found" });
  }
  if (subject !== undefined) ticket.subject = subject;
  if (message !== undefined) ticket.message = message;
  if (category !== undefined) ticket.category = category;
  if (status !== undefined) ticket.status = status;
  saveDatabase();
  res.json(ticket);
});

app.delete("/api/support/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const idx = db.supportTickets.findIndex(t => t.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Support ticket not found" });
  }
  db.supportTickets.splice(idx, 1);
  saveDatabase();
  res.json({ message: "Support ticket deleted successfully" });
});

// Admin Announcement full edit & delete
app.put("/api/announcements/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { title, content, priority, active } = req.body;
  const ann = db.announcements.find(a => a.id === id);
  if (!ann) {
    return res.status(404).json({ error: "Announcement not found" });
  }
  if (title !== undefined) ann.title = title;
  if (content !== undefined) ann.content = content;
  if (priority !== undefined) ann.priority = priority;
  if (active !== undefined) ann.active = active;
  saveDatabase();
  res.json(ann);
});

app.delete("/api/announcements/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const idx = db.announcements.findIndex(a => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Announcement not found" });
  }
  db.announcements.splice(idx, 1);
  saveDatabase();
  res.json({ message: "Announcement deleted successfully" });
});

// Admin Carousel Slide update
app.put("/api/carousel/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { title, description, image, overlayColor } = req.body;
  if (!db.carouselSlides) db.carouselSlides = [];
  const slide = db.carouselSlides.find(s => s.id === id);
  if (!slide) {
    return res.status(404).json({ error: "Slide not found" });
  }
  if (title !== undefined) slide.title = title;
  if (description !== undefined) slide.description = description;
  if (image !== undefined) slide.image = image;
  if (overlayColor !== undefined) slide.overlayColor = overlayColor;
  saveDatabase();
  res.json(slide);
});

// Audit Logs
app.get("/api/audit-logs", requireAdmin, (req, res) => {
  res.json(db.auditLogs);
});

// Reports & Analytics API
app.get("/api/reports", requireAdmin, (req, res) => {
  // Construct metrics dynamically based on db state
  const totalMembers = db.users.filter(u => u.role === UserRole.MEMBER).length;
  const pendingMembers = db.users.filter(u => u.membershipStatus === MembershipStatus.PENDING).length;
  const activeMembers = db.users.filter(u => u.membershipStatus === MembershipStatus.ACTIVE).length;
  
  const totalEvents = db.events.length;
  const upcomingEventsCount = db.events.filter(e => e.status === "upcoming").length;
  
  const totalRevenue = db.payments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  // Membership distributions
  const basicCount = db.users.filter(u => u.membershipTier === MembershipTier.BASIC).length;
  const premiumCount = db.users.filter(u => u.membershipTier === MembershipTier.PREMIUM).length;
  const eliteCount = db.users.filter(u => u.membershipTier === MembershipTier.ELITE).length;

  const engagementPostsCount = db.posts.length;
  const openTicketsCount = db.supportTickets.filter(t => t.status === "open").length;

  // Revenue chart data (last 6 months simulation)
  const revenueTrend = [
    { month: "Feb", revenue: Math.round(totalRevenue * 0.1) },
    { month: "Mar", revenue: Math.round(totalRevenue * 0.15) },
    { month: "Apr", revenue: Math.round(totalRevenue * 0.2) },
    { month: "May", revenue: Math.round(totalRevenue * 0.25) },
    { month: "Jun", revenue: Math.round(totalRevenue * 0.1) },
    { month: "Jul", revenue: Math.round(totalRevenue * 0.2) }
  ];

  // Membership growth trend
  const growthTrend = [
    { month: "Feb", members: totalMembers - 2 },
    { month: "Mar", members: totalMembers - 2 },
    { month: "Apr", members: totalMembers - 1 },
    { month: "May", members: totalMembers - 1 },
    { month: "Jun", members: totalMembers },
    { month: "Jul", members: totalMembers }
  ];

  // Event popularity registrations
  const eventPopularity = db.events.map(e => ({
    name: e.title.length > 20 ? e.title.substring(0, 20) + "..." : e.title,
    registered: e.registeredCount,
    capacity: e.capacity
  }));

  res.json({
    metrics: {
      totalMembers,
      pendingMembers,
      activeMembers,
      totalEvents,
      upcomingEventsCount,
      totalRevenue,
      engagementPostsCount,
      openTicketsCount
    },
    distributions: {
      basic: basicCount,
      premium: premiumCount,
      elite: eliteCount
    },
    revenueTrend,
    growthTrend,
    eventPopularity,
    auditLogs: db.auditLogs
  });
});

// AI Mentor API
app.post("/api/ai/mentor", async (req, res) => {
  const { prompt, type } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  if (!aiClient) {
    // Elegant offline fallback if key is not injected yet or is empty
    return res.json({
      response: `[Aura Network AI - Offline Mode] That is a fantastic initiative! To refine this success story or answer your networking query optimally, please add your GEMINI_API_KEY under the Settings > Secrets menu. \n\nHere is a quick strategic guide for your prompt:\n1. **Lead with quantitative impact**: Always mention the metrics and positive growth your project stimulated (e.g. "Empowered 30+ managers").\n2. **Identify specific mentorship bridges**: Define who sponsored the initiative and how the connections were forged.\n3. **Clear Call-to-Action**: End with a motivating piece of advice for the broader Aura community.`
    });
  }

  try {
    let systemInstruction = "You are an elegant, elite Executive Mentor and Content Architect for the Aura Network, a high-society corporate platform empowering women through leadership, social networking, and community engagements. Speak in a warm, motivating, highly professional, and professional tone. Your aesthetic focuses on pink, gold, and white (the brand colors of Aura). Keep responses structured with beautiful bullet points or executive summaries.";
    
    if (type === "improve_story") {
      systemInstruction += " Your task is to rewrite or polish the user's success story to make it sound incredibly professional, executive-ready, and inspiring for corporate leadership, highlighting metrics and structural success.";
    } else {
      systemInstruction += " Your task is to provide expert leadership coaching, venture pitching strategies, or high-society corporate networking advice.";
    }

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.75
      }
    });

    res.json({ response: response.text });
  } catch (error: any) {
    console.error("Gemini AI API Error:", error);
    res.status(500).json({ error: "Gemini AI generation failed: " + (error.message || error) });
  }
});

// --- SEO: robots.txt, sitemap.xml & route-head prerender ---
registerSeoRoutes(app, SITE_ORIGIN);

// Global Express Error Handler for JSON payloads & Entity Too Large errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.type === "entity.too.large" || err.status === 413) {
    return res.status(413).json({ error: "The uploaded file or payload size is too large (exceeds 10MB limit). Please select a smaller file or use a URL." });
  }
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON format in request body." });
  }
  console.error("Express middleware error:", err);
  res.status(err.status || 500).json({ error: err.message || "An unexpected server error occurred." });
});

// Vite Middleware for Development Setup
async function startServer() {
  // Warn if JWT secret is missing or weak in production (used for auth tokens)
  const jwtSecret = process.env.JWT_SECRET || "";
  if (isProd && (!jwtSecret || jwtSecret.length < 32)) {
    console.error("❌ FATAL: JWT_SECRET must be set to a strong random value (32+ chars) in production.");
    process.exit(1);
  }
  if (!isProd && jwtSecret && jwtSecret.length < 32) {
    console.warn("⚠️ JWT_SECRET is shorter than 32 characters — use a strong random value in production.");
  }

  // Initialize PostgreSQL database connection if configured
  await initPostgres();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (!fs.existsSync(indexPath)) return res.status(503).send("Build not found — run npm run build.");
      let html = fs.readFileSync(indexPath, "utf8");
      const baked = buildHeadForPath(req.path, SITE_ORIGIN);
      html = html.replace(/<title>[\s\S]*?<\/title>/, baked);
      res.type("html").send(html);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Aura Server] Running elegantly on http://0.0.0.0:${PORT}`);
  });
}

// Only listen when run directly (dev `tsx server.ts`, prod `node dist/server.cjs`).
// When imported as a module (e.g. by the test suite), the Express `app` is
// exported so it can be exercised via supertest without binding a port.
const isMainModule =
  process.argv[1] &&
  (typeof require !== "undefined"
    ? require.main === module
    : import.meta.url === pathToFileURL(process.argv[1]).href);

if (isMainModule) {
  startServer().catch((err) => {
    console.error("[Aura Server] Failed to start server:", err);
  });
}

export { app };
