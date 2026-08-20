export enum UserRole {
  MEMBER = "MEMBER",
  ADMIN = "ADMIN",
  VOLUNTEER = "VOLUNTEER"
}

export enum MembershipStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED"
}

export enum MembershipTier {
  BASIC = "BASIC",
  PREMIUM = "PREMIUM",
  ELITE = "ELITE"
}

export interface SavedCard {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  paymentMethodId: string;
  cardholderName?: string;
  expiryDate?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  membershipStatus: MembershipStatus;
  membershipTier: MembershipTier;
  avatarUrl?: string;
  bio?: string;
  title?: string;
  company?: string;
  createdAt: string;
  savedCard?: SavedCard;
  twoFactorEnabled?: boolean;
  twoFactorMethod?: "email" | "authenticator" | null;
  twoFactorSecret?: string;
  emailVerified?: boolean;
  verificationToken?: string;
  resetToken?: string;
  resetTokenExpiry?: string;
  passwordHash?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tier: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  createdAt: string;
}

export interface EventPackage {
  id: string;
  name: string;
  fee: number;
  benefits: string[];
  description: string;
  availabilityPeriod?: string;
  maxLimit?: number;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: "Conference" | "Networking" | "Leadership" | "Social" | "Socials" | "Play & Games" | "Wellness" | "Gatherings" | "Workshop" | string;
  capacity: number;
  registeredCount: number;
  packages: EventPackage[];
  status: "upcoming" | "past" | "archived" | "deactivated";
  deactivated?: boolean;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  packageId: string;
  packageName: string;
  amountPaid: number;
  paymentId: string;
  badgeCode: string; // Unique code for digital pass/QR
  registeredAt: string;
  attended: boolean;
  seat?: string;
}

export interface Attendance {
  id: string;
  eventId: string;
  eventName: string;
  userId?: string;
  fullName: string;
  email: string;
  accessCode: string;
  scannedAt: string;
}

export interface LaunchTicket {
  id: string;
  sessionId: string;
  attendeeName: string;
  attendeeEmail: string;
  phone?: string;
  ticketType: string;
  ticketName: string;
  quantity: number;
  unitPrice: number;
  amountPaid: number;
  badgeCode: string;
  teamPreference?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  purpose: "Membership" | "Event Registration";
  itemId?: string; // Event ID or Tier Name
  status: "pending" | "completed" | "failed" | "refunded";
  method: "Credit Card" | "Bank Transfer" | "Local Payment";
  transactionId: string;
  createdAt: string;
  receiptNumber: string;
}

export interface MembershipBadge {
  id: string;
  tier: MembershipTier;
  name: string;
  title?: string;
  cost: number;
  benefits: string[];
  codePrefix?: string;
  bgColor?: string;
  textColor?: string;
}

export interface Post {
  id: string;
  userId: string;
  userFullName: string;
  userTitle?: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string;
  likes: string[]; // List of userIds
  commentsCount: number;
  createdAt: string;
  approved?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userFullName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface SuccessStory {
  id: string;
  userId: string;
  userFullName: string;
  userAvatar?: string;
  title: string;
  content: string;
  imageUrl?: string;
  approved: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userFullName: string;
  email: string;
  subject: string;
  message: string;
  category: "Membership" | "Billing" | "Event" | "Other" | "Abuse";
  status: "open" | "in_progress" | "resolved";
  responses: {
    sender: "USER" | "ADMIN";
    message: string;
    createdAt: string;
  }[];
  createdAt: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  image: string;
  createdAt: string;
  status: "published" | "draft" | "scheduled";
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
  active: boolean;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SmtpSettings {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
  fromEmail: string;
  fromName: string;
  enableAlerts: boolean;
  alertOnRegistration: boolean;
  alertOnEventBooking: boolean;
  alertOnContactInquiry: boolean;
  alertOnSupportTicket: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  bodyHtml: string;
  variables: string[];
  updatedAt: string;
}

export interface SystemSettings {
  stripeMode?: "test" | "live";
  stripeTestPublicKey?: string;
  stripeTestSecretKey?: string;
  stripeLivePublicKey?: string;
  stripeLiveSecretKey?: string;
  stripePublicKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret?: string;
  isSubscriptionRequired: boolean;
  smtpSettings?: SmtpSettings;
  emailTemplates?: EmailTemplate[];
}

export interface TaskItem {
  id: string;
  text: string;
  description?: string;
  category: "Interface" | "Feature" | "Other" | "Administrative" | "Operations";
  completed: boolean;
  priority: "High" | "Medium" | "Low";
  assignedToUserId?: string;
  assignedToFullName?: string;
  assignedToEmail?: string;
  createdById?: string;
  createdByName?: string;
  dueDate?: string;
  createdAt?: string;
  status?: "Pending" | "In Progress" | "Completed" | "Blocked";
}

export interface CarouselSlide {
  id: string;
  image: string;
  title: string;
  description: string;
  overlayColor?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption?: string;
  category: string;
  image: string;
  featured?: boolean;
  createdAt?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: MembershipTier;
  status: "active" | "cancelled";
  stripeSubscriptionId?: string;
  nextBillingDate: string;
  createdAt: string;
  amount: number;
}

export interface Founder {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  order?: number;
  createdAt?: string;
}

export interface ContactMessageReply {
  id: string;
  sender: "ADMIN" | "USER";
  senderName: string;
  message: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  firstName: string;
  fullName?: string;
  email: string;
  phone?: string;
  interest: string;
  organization?: string;
  subject?: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
  replies?: ContactMessageReply[];
}

export interface FoundingMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  ageRange?: string;
  interests: string[];
  status: "pending" | "approved" | "waitlisted";
  createdAt: string;
  source: "founding-circle";
}

export type VolunteerStatus = "pending" | "approved" | "disabled";

export interface Volunteer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  linkedin?: string;
  availability: string;
  shirtSize?: string;
  roles: string[];          // Roles of interest
  skills?: string;
  why?: string;
  emergencyContact?: string;
  role?: string;            // Assigned role after review
  status: VolunteerStatus;
  enabled: boolean;         // Login access granted by admin
  userId?: string;          // Linked portal user account id
  createdAt: string;
}

export interface BulkBroadcast {
  id: string;
  sentAt: string;
  sentBy: string;
  targetAudience: string;
  subject: string;
  recipientCount: number;
  status: "Sent" | "Failed" | "Draft";
  samplePreview: string;
  templateId?: string;
}

export interface LocalDatabase {
  users: User[];
  events: EventItem[];
  registrations: Registration[];
  payments: Payment[];
  posts: Post[];
  comments: Comment[];
  successStories: SuccessStory[];
  supportTickets: SupportTicket[];
  blogs: BlogArticle[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  settings?: SystemSettings;
  carouselSlides?: CarouselSlide[];
  galleryItems?: GalleryItem[];
  subscriptions?: Subscription[];
  membershipBadges?: MembershipBadge[];
  founders?: Founder[];
  sponsors?: Sponsor[];
  bulkBroadcasts?: BulkBroadcast[];
  newsletterSubscribers?: string[];
  contactMessages?: ContactMessage[];
  foundingMembers?: FoundingMember[];
  volunteers?: Volunteer[];
  attendance?: Attendance[];
  tasks?: TaskItem[];
  launchTickets?: LaunchTicket[];
  processedWebhookEvents?: string[];
}

