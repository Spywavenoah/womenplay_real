import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, Calendar, Award, DollarSign, Check, X, ShieldAlert, ShieldCheck, Sparkles, 
  Trash2, Plus, ArrowUpRight, MessageSquare, PlusCircle, Edit3, 
  ToggleLeft, Clipboard, Loader2, RefreshCw, BarChart as ChartIcon,
  Download, FileText, Printer, Menu, ChevronRight, Settings,
  Mail, Server, Send, CheckCircle, FileCode, Eye, Copy, RotateCcw, Code2, CheckSquare, Images, Building2
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from "recharts";
import { MembershipStatus, MembershipTier } from "../types";
import type { User, EventItem, EventPackage, Registration, SuccessStory, SupportTicket, AuditLog, BlogArticle, Announcement, Payment, MembershipBadge, SmtpSettings, EmailTemplate, ContactMessage, LaunchTicket } from "../types";
import { showSuccessAlert, showErrorAlert, showConfirmDialog, showToast } from "../lib/swal";

// Import modular admin components
import AdminSponsors from "./AdminSponsors";
import AdminStories from "./AdminStories";
import AdminPosts from "./AdminPosts";
import AdminEvents from "./AdminEvents";
import AdminSupport from "./AdminSupport";
import AdminBlogs from "./AdminBlogs";
import AdminAnnouncements from "./AdminAnnouncements";
import AdminCarousel from "./AdminCarousel";
import AdminFounders from "./AdminFounders";
import AdminAdmins from "./AdminAdmins";
import AdminTasks from "./AdminTasks";
import AdminContacts from "./AdminContacts";
import AdminGallery from "./AdminGallery";
import AdminVolunteers from "./AdminVolunteers";
import AdminBulkMessaging from "./AdminBulkMessaging";
import { StatCard } from "./admin/AdminUI";
import AdminAudit from "./admin/AdminAudit";
import AdminPayments from "./admin/AdminPayments";
import AdminOverview from "./admin/AdminOverview";
import AdminMembers from "./admin/AdminMembers";

interface AdminDashboardProps {
  currentUser: User;
  onRefreshData: () => Promise<void>;
  events: EventItem[];
  members: User[];
  auditLogs: AuditLog[];
  blogs: BlogArticle[];
  announcements: Announcement[];
}

export default function AdminDashboard({
  currentUser,
  onRefreshData,
  events,
  members,
  auditLogs,
  blogs,
  announcements
}: AdminDashboardProps) {
  // Tabs redefined for explicit standalone pages:
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "contacts" | "admins" | "members" | "founders" | "sponsors" | "events" | "stories" | "posts" | "support" | "blogs" | "announcements" | "carousel" | "gallery" | "volunteers" | "payments" | "membership-badges" | "audit" | "settings" | "smtp" | "email-templates" | "bulk-messages" | "tasks"
  >("overview");
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [contactMessages, setContactMessages] = React.useState<ContactMessage[]>([]);

  // Email Templates States
  const [emailTemplates, setEmailTemplates] = React.useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("registration-confirmation");
  const [templateSubject, setTemplateSubject] = React.useState("");
  const [templateBodyHtml, setTemplateBodyHtml] = React.useState("");
  const [loadingTemplates, setLoadingTemplates] = React.useState(false);
  const [savingTemplate, setSavingTemplate] = React.useState(false);
  const [templateSavedMsg, setTemplateSavedMsg] = React.useState("");
  const [templateTestEmail, setTemplateTestEmail] = React.useState(currentUser?.email || "admin@womenplay.org");
  const [sendingTemplateTest, setSendingTemplateTest] = React.useState(false);
  const [templateTestResult, setTemplateTestResult] = React.useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [templatePreviewMode, setTemplatePreviewMode] = React.useState<"editor" | "preview">("editor");
  const [copiedVar, setCopiedVar] = React.useState<string | null>(null);

  // Member Directory Filter State
  const [memberFilterStatus, setMemberFilterStatus] = React.useState<"ALL" | "ACTIVE" | "PENDING" | "SUSPENDED">("ALL");

  // Settings States
  const [stripeMode, setStripeMode] = React.useState<"test" | "live">("test");
  const [stripeTestPublicKey, setStripeTestPublicKey] = React.useState("");
  const [stripeTestSecretKey, setStripeTestSecretKey] = React.useState("");
  const [stripeLivePublicKey, setStripeLivePublicKey] = React.useState("");
  const [stripeLiveSecretKey, setStripeLiveSecretKey] = React.useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = React.useState("");
  const [stripePublicKey, setStripePublicKey] = React.useState("");
  const [stripeSecretKey, setStripeSecretKey] = React.useState("");
  const [isSubscriptionRequired, setIsSubscriptionRequired] = React.useState(false);
  const [loadingSettings, setLoadingSettings] = React.useState(false);
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = React.useState("");

  // SMTP Outgoing Email State
  const [smtpForm, setSmtpForm] = React.useState<SmtpSettings>({
    host: "mail.womenplay.org",
    port: 465,
    user: "notifications@womenplay.org",
    pass: "",
    secure: true,
    fromEmail: "notifications@womenplay.org",
    fromName: "WomenPlay Secretariat",
    enableAlerts: true,
    alertOnRegistration: true,
    alertOnEventBooking: true,
    alertOnContactInquiry: true,
    alertOnSupportTicket: true
  });
  const [loadingSmtp, setLoadingSmtp] = React.useState(false);
  const [savingSmtp, setSavingSmtp] = React.useState(false);
  const [smtpSavedMsg, setSmtpSavedMsg] = React.useState("");
  const [smtpTestEmail, setSmtpTestEmail] = React.useState("");
  const [testingSmtp, setTestingSmtp] = React.useState(false);
  const [smtpTestResult, setSmtpTestResult] = React.useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  // Carousel Slides States
  const [carouselSlides, setCarouselSlides] = React.useState<any[]>([]);
  const [newSlideTitle, setNewSlideTitle] = React.useState("");
  const [newSlideImage, setNewSlideImage] = React.useState("");
  const [newSlideDesc, setNewSlideDesc] = React.useState("");

  // Gallery Items States
  const [galleryItems, setGalleryItems] = React.useState<any[]>([]);

  // Report States
  const [reportData, setReportData] = React.useState<any>(null);
  const [loadingReports, setLoadingReports] = React.useState(false);
  const [allRegistrations, setAllRegistrations] = React.useState<Registration[]>([]);
  const [showReportModal, setShowReportModal] = React.useState(false);

  // New Event Form States
  const [newEvent, setNewEvent] = React.useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    image: "",
    category: "Leadership" as any,
    capacity: 100,
    packages: [
      { id: "pkg-std", name: "Standard Badge", fee: 100, benefits: ["All sessions"], description: "General Entry" },
      { id: "pkg-vip", name: "VIP Pass", fee: 250, benefits: ["Front-row, Speaker lunch"], description: "VIP Gold Access" }
    ] as EventPackage[]
  });
  const [creatingEvent, setCreatingEvent] = React.useState(false);
  const [eventSuccessMsg, setEventSuccessMsg] = React.useState("");

  // Attendance Check States
  const [selectedEventForAttendance, setSelectedEventForAttendance] = React.useState<string | null>(null);
  const [eventRegistrations, setEventRegistrations] = React.useState<any[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = React.useState(false);

  // Support / Content Lists state
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [stories, setStories] = React.useState<SuccessStory[]>([]);
  const [supportResponse, setSupportResponse] = React.useState<Record<string, string>>({});

  // New Blog State
  const [newBlog, setNewBlog] = React.useState({ title: "", content: "", category: "Leadership", image: "" });
  const [blogSuccess, setBlogSuccess] = React.useState(false);

  // New Announcement state
  const [newAnnounce, setNewAnnounce] = React.useState({ title: "", content: "", priority: "low" });
  const [annSuccess, setAnnSuccess] = React.useState(false);

  // Active Community Posts Moderation state
  const [communityPosts, setCommunityPosts] = React.useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = React.useState(false);

  // --- COMPREHENSIVE CRUD EDITING STATES ---
  const [editingStory, setEditingStory] = React.useState<SuccessStory | null>(null);
  const [storyForm, setStoryForm] = React.useState({ title: "", content: "", imageUrl: "", approved: false });

  const [editingPost, setEditingPost] = React.useState<any | null>(null);
  const [postForm, setPostForm] = React.useState({ content: "", imageUrl: "" });

  const [editingEvent, setEditingEvent] = React.useState<EventItem | null>(null);
  const [eventForm, setEventForm] = React.useState({ title: "", description: "", date: "", time: "", location: "", image: "", category: "Leadership" as any, capacity: 100 });

  const [editingTicket, setEditingTicket] = React.useState<SupportTicket | null>(null);
  const [ticketForm, setTicketForm] = React.useState({ subject: "", message: "", category: "", status: "open" });

  const [editingBlog, setEditingBlog] = React.useState<BlogArticle | null>(null);
  const [blogForm, setBlogForm] = React.useState({ title: "", content: "", category: "Leadership", image: "", author: "" });

  const [editingAnnounce, setEditingAnnounce] = React.useState<Announcement | null>(null);
  const [announceForm, setAnnounceForm] = React.useState({ title: "", content: "", priority: "low", active: true });

  const [editingSlide, setEditingSlide] = React.useState<any | null>(null);
  const [slideForm, setSlideForm] = React.useState({ title: "", description: "", image: "", overlayColor: "rgba(0,0,0,0.4)" });

  // PRINT / EXPORT PDF POPUP MODAL
  const [pdfReport, setPdfReport] = React.useState<{ title: string; headers: string[]; rows: string[][] } | null>(null);

  // Payments & Membership Badges Admin States
  const [paymentsList, setPaymentsList] = React.useState<Payment[]>([]);
  const [launchTickets, setLaunchTickets] = React.useState<LaunchTicket[]>([]);
  const [membershipBadgesList, setMembershipBadgesList] = React.useState<MembershipBadge[]>([]);
  const [badgeActionLoading, setBadgeActionLoading] = React.useState(false);

  // Membership Badge Form States for Admin CRUD
  const [editingBadge, setEditingBadge] = React.useState<MembershipBadge | null>(null);
  const [isCreatingBadge, setIsCreatingBadge] = React.useState(false);
  const [badgeTitle, setBadgeTitle] = React.useState("");
  const [badgeCost, setBadgeCost] = React.useState(0);
  const [badgeCodePrefix, setBadgeCodePrefix] = React.useState("");
  const [badgeBgColor, setBadgeBgColor] = React.useState("#1E293B");
  const [badgeTextColor, setBadgeTextColor] = React.useState("#FFFFFF");
  const [badgeBenefits, setBadgeBenefits] = React.useState("");

  // Attendance Check-in & Badge Scanning States
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => curr?.message === message ? null : curr);
    }, 4000);
  };

  const [scannedBadgeCode, setScannedBadgeCode] = React.useState("");
  const [checkInMsg, setCheckInMsg] = React.useState<string | null>(null);
  const [checkInError, setCheckInError] = React.useState<string | null>(null);
  const [checkingInBadge, setCheckingInBadge] = React.useState(false);

  const handleBadgeCheckIn = async (badgeCodeToUse?: string) => {
    const codeToSubmit = badgeCodeToUse || scannedBadgeCode;
    if (!codeToSubmit.trim() || !selectedEventForAttendance) return;

    setCheckingInBadge(true);
    setCheckInMsg(null);
    setCheckInError(null);

    try {
      const res = await fetch(`/api/events/${selectedEventForAttendance}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeCode: codeToSubmit })
      });

      const data = await res.json();
      if (res.ok) {
        setCheckInMsg(data.message);
        setScannedBadgeCode("");
        // Reload registrations list to show the checked-in user updated status
        handleViewRegistrations(selectedEventForAttendance);
      } else {
        setCheckInError(data.error || "Failed to check in badge.");
      }
    } catch (err: any) {
      setCheckInError("Network error occurred during check-in.");
    } finally {
      setCheckingInBadge(false);
    }
  };

  const resetBadgeForm = () => {
    setEditingBadge(null);
    setIsCreatingBadge(false);
    setBadgeTitle("");
    setBadgeCost(0);
    setBadgeCodePrefix("");
    setBadgeBgColor("#1E293B");
    setBadgeTextColor("#FFFFFF");
    setBadgeBenefits("");
  };

  const openEditBadge = (badge: MembershipBadge) => {
    setEditingBadge(badge);
    setIsCreatingBadge(false);
    setBadgeTitle(badge.title || badge.name || "");
    setBadgeCost(badge.cost);
    setBadgeCodePrefix(badge.codePrefix || "");
    setBadgeBgColor(badge.bgColor || "#1E293B");
    setBadgeTextColor(badge.textColor || "#FFFFFF");
    setBadgeBenefits(badge.benefits.join("\n"));
  };

  const handleSaveBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeTitle.trim() || !badgeCodePrefix.trim()) {
      showErrorAlert("Validation Error", "Title and Prefix are required.");
      return;
    }

    setBadgeActionLoading(true);
    const parsedBenefits = badgeBenefits
      .split("\n")
      .map(b => b.trim())
      .filter(b => b.length > 0);

    const payload = {
      title: badgeTitle,
      cost: Number(badgeCost),
      codePrefix: badgeCodePrefix,
      bgColor: badgeBgColor,
      textColor: badgeTextColor,
      benefits: parsedBenefits
    };

    try {
      let res;
      if (editingBadge) {
        // UPDATE
        res = await fetch(`/api/membership-badges/${editingBadge.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        // CREATE
        res = await fetch("/api/membership-badges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (res.ok) {
        showSuccessAlert("Success", editingBadge ? "Badge updated successfully!" : "New Badge tier created!");
        resetBadgeForm();
        loadAdminData();
      } else {
        showErrorAlert("Error", data.error || "Failed to save badge tier.");
      }
    } catch (err) {
      console.error(err);
      showErrorAlert("Error", "Network error saving membership badge.");
    } finally {
      setBadgeActionLoading(false);
    }
  };

  const handleDeleteBadge = async (id: string) => {
    const confirmed = await showConfirmDialog(
      "Delete Membership Badge?",
      "Are you sure you want to delete this Membership Badge? Current members holding this status won't be modified but no new members will be able to subscribe to it.",
      "Yes, Delete Badge"
    );
    if (!confirmed) return;

    setBadgeActionLoading(true);
    try {
      const res = await fetch(`/api/membership-badges/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        showSuccessAlert("Success", "Membership Badge deleted successfully.");
        loadAdminData();
      } else {
        showErrorAlert("Error", data.error || "Failed to delete badge.");
      }
    } catch (err) {
      console.error(err);
      showErrorAlert("Error", "Network error deleting badge.");
    } finally {
      setBadgeActionLoading(false);
    }
  };

  // Load Administrative data
  const loadAdminData = async () => {
    setLoadingReports(true);
    try {
      // 1. Fetch Reports
      const repRes = await fetch("/api/reports");
      const repData = await repRes.json();
      setReportData(repData);

      // 2. Fetch Support tickets
      const supRes = await fetch("/api/support");
      const supData = await supRes.json();
      setTickets(supData);

      // 3. Fetch Stories
      const storRes = await fetch("/api/success-stories");
      const storData = await storRes.json();
      setStories(storData);

      // 4. Fetch All Registrations
      const regRes = await fetch("/api/registrations");
      if (regRes.ok) {
        const regData = await regRes.json();
        setAllRegistrations(regData);
      }

      // 5. Fetch Payments Ledger
      const payRes = await fetch("/api/payments");
      if (payRes.ok) {
        const payData = await payRes.json();
        setPaymentsList(payData);
      }

      // 5b. Fetch Launch Experience Ticket Sales
      const ticketRes = await fetch("/api/launch-tickets");
      if (ticketRes.ok) {
        const ticketData = await ticketRes.json();
        setLaunchTickets(ticketData || []);
      }

      // 6. Fetch Membership Badges List
      const badgeRes = await fetch("/api/membership-badges");
      if (badgeRes.ok) {
        const badgeData = await badgeRes.json();
        setMembershipBadgesList(badgeData);
      }

      // 7. Fetch Community Posts
      const postRes = await fetch("/api/community/posts");
      if (postRes.ok) {
        const postData = await postRes.json();
        setCommunityPosts(postData || []);
      }

      // 8. Fetch Contact Messages Submissions
      const contactRes = await fetch("/api/contact-messages");
      if (contactRes.ok) {
        const contactData = await contactRes.json();
        setContactMessages(contactData || []);
      }

      // 9. Fetch Gallery Items
      const galleryRes = await fetch("/api/gallery");
      if (galleryRes.ok) {
        const galleryData = await galleryRes.json();
        setGalleryItems(galleryData || []);
      }
    } catch (e) {
      console.error("Failed to fetch administrative reports", e);
    } finally {
      setLoadingReports(false);
    }
  };

  // Fetch SMTP Settings
  const loadSmtpSettings = async () => {
    setLoadingSmtp(true);
    try {
      const res = await fetch("/api/smtp");
      if (res.ok) {
        const data = await res.json();
        setSmtpForm(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSmtp(false);
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSmtp(true);
    setSmtpSavedMsg("");
    try {
      const res = await fetch("/api/smtp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smtpForm)
      });
      const data = await res.json();
      if (res.ok) {
        setSmtpSavedMsg("SMTP settings and alert rules saved successfully!");
        showToast("SMTP settings and alert rules saved successfully!");
        setTimeout(() => setSmtpSavedMsg(""), 4000);
      } else {
        showErrorAlert("Error", data.error || "Failed to update SMTP settings");
      }
    } catch (err) {
      console.error(err);
      showErrorAlert("Error", "Network error updating SMTP settings");
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleTestSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingSmtp(true);
    setSmtpTestResult(null);
    try {
      const res = await fetch("/api/smtp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...smtpForm,
          recipientEmail: smtpTestEmail || smtpForm.fromEmail
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSmtpTestResult({ success: true, message: data.message });
      } else {
        setSmtpTestResult({ success: false, error: data.error || "SMTP test failed" });
      }
    } catch (err: any) {
      setSmtpTestResult({ success: false, error: "Network error testing SMTP server" });
    } finally {
      setTestingSmtp(false);
    }
  };

  // Fetch settings & slides
  const loadSettingsAndSlides = async () => {
    setLoadingSettings(true);
    try {
      const setRes = await fetch("/api/settings");
      const setData = await setRes.json();
      setStripeMode(setData.stripeMode || "test");
      setStripeTestPublicKey(setData.stripeTestPublicKey || "pk_test_51MockPublicKeyAuraNetwork12345");
      setStripeTestSecretKey(setData.stripeTestSecretKey || "sk_test_51MockSecretKeyAuraNetwork12345");
      setStripeLivePublicKey(setData.stripeLivePublicKey || "");
      setStripeLiveSecretKey(setData.stripeLiveSecretKey || "");
      setStripeWebhookSecret(setData.stripeWebhookSecret || "");
      setStripePublicKey(setData.stripePublicKey || "");
      setStripeSecretKey(setData.stripeSecretKey || "");
      setIsSubscriptionRequired(!!setData.isSubscriptionRequired);
      if (setData.smtpSettings) {
        setSmtpForm(setData.smtpSettings);
      }

      const slideRes = await fetch("/api/carousel");
      const slideData = await slideRes.json();
      setCarouselSlides(slideData || []);
    } catch (e) {
      console.error("Error fetching configurations:", e);
    } finally {
      setLoadingSettings(false);
    }
  };

  // Fetch Email Templates
  const loadEmailTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch("/api/email-templates");
      if (res.ok) {
        const data: EmailTemplate[] = await res.json();
        setEmailTemplates(data);
        const current = data.find(t => t.id === selectedTemplateId) || data[0];
        if (current) {
          setSelectedTemplateId(current.id);
          setTemplateSubject(current.subject);
          setTemplateBodyHtml(current.bodyHtml);
        }
      }
    } catch (err) {
      console.error("Failed to fetch email templates:", err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = emailTemplates.find(t => t.id === id);
    if (tmpl) {
      setTemplateSubject(tmpl.subject);
      setTemplateBodyHtml(tmpl.bodyHtml);
    }
    setTemplateSavedMsg("");
    setTemplateTestResult(null);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTemplate(true);
    setTemplateSavedMsg("");
    try {
      const res = await fetch(`/api/email-templates/${selectedTemplateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: templateSubject,
          bodyHtml: templateBodyHtml
        })
      });
      const data = await res.json();
      if (res.ok) {
        setTemplateSavedMsg(data.message || "Template saved successfully!");
        loadEmailTemplates();
        setTimeout(() => setTemplateSavedMsg(""), 4000);
      } else {
        showErrorAlert("Error", data.error || "Failed to save template.");
      }
    } catch (err) {
      console.error(err);
      showErrorAlert("Error", "Network error saving email template.");
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleResetTemplate = async () => {
    const confirmed = await showConfirmDialog(
      "Reset Template Layout?",
      "Are you sure you want to reset this email template back to the default system layout? Unsaved edits will be discarded.",
      "Yes, Reset Layout"
    );
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/email-templates/${selectedTemplateId}/reset`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.template) {
        setTemplateSubject(data.template.subject);
        setTemplateBodyHtml(data.template.bodyHtml);
        setTemplateSavedMsg("Template reset to system default!");
        loadEmailTemplates();
        setTimeout(() => setTemplateSavedMsg(""), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendTemplateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingTemplateTest(true);
    setTemplateTestResult(null);
    try {
      const res = await fetch(`/api/email-templates/${selectedTemplateId}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail: templateTestEmail })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTemplateTestResult({ success: true, message: data.message });
      } else {
        setTemplateTestResult({ success: false, error: data.error || "Failed to dispatch test template email." });
      }
    } catch (err: any) {
      setTemplateTestResult({ success: false, error: "Network error sending test template." });
    } finally {
      setSendingTemplateTest(false);
    }
  };

  const copyVariableToClipboard = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedVar(tag);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  React.useEffect(() => {
    if (activeTab === "settings" || activeTab === "carousel") {
      loadSettingsAndSlides();
    } else if (activeTab === "smtp") {
      loadSmtpSettings();
    } else if (activeTab === "email-templates") {
      loadEmailTemplates();
    } else {
      loadAdminData();
    }
  }, [activeTab]);

  // Save settings handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSavedMsg("");
    try {
      const activePub = stripeMode === "live" ? stripeLivePublicKey : stripeTestPublicKey;
      const activeSec = stripeMode === "live" ? stripeLiveSecretKey : stripeTestSecretKey;
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stripeMode,
          stripeTestPublicKey,
          stripeTestSecretKey,
          stripeLivePublicKey,
          stripeLiveSecretKey,
          stripeWebhookSecret,
          stripePublicKey: activePub,
          stripeSecretKey: activeSec,
          isSubscriptionRequired,
          smtpSettings: smtpForm
        })
      });
      if (res.ok) {
        setSettingsSavedMsg("Stripe Mode & System Settings updated successfully!");
        setTimeout(() => setSettingsSavedMsg(""), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  // Add Slide handler
  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideImage || !newSlideTitle) return;
    try {
      const res = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: newSlideImage,
          title: newSlideTitle,
          description: newSlideDesc
        })
      });
      if (res.ok) {
        setNewSlideTitle("");
        setNewSlideImage("");
        setNewSlideDesc("");
        loadSettingsAndSlides();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Slide handler
  const handleDeleteSlide = async (id: string) => {
    const confirmed = await showConfirmDialog("Delete Slide?", "Are you sure you want to delete this slide?", "Yes, Delete Slide");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/carousel/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        loadSettingsAndSlides();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Approve/Suspend member status
  const handleUpdateMemberStatus = async (memberId: string, status: MembershipStatus) => {
    try {
      const res = await fetch(`/api/members/${memberId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminId: currentUser.id,
          adminName: currentUser.fullName
        })
      });
      if (res.ok) {
        onRefreshData();
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetMember2FA = async (memberId: string, memberName: string) => {
    const confirmed = await showConfirmDialog(
      "Reset 2FA Credentials?",
      `Are you sure you want to reset 2FA security credentials for ${memberName}?`,
      "Yes, Reset 2FA"
    );
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/members/${memberId}/reset-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: currentUser.id,
          adminName: currentUser.fullName
        })
      });
      const data = await res.json();
      if (res.ok) {
        showSuccessAlert("2FA Reset", data.message || `2FA credentials reset for ${memberName}`);
        onRefreshData();
        loadAdminData();
      } else {
        showErrorAlert("Error", data.error || "Failed to reset 2FA");
      }
    } catch (e) {
      console.error(e);
      showErrorAlert("Error", "Error resetting 2FA.");
    }
  };

  // Create Event Submit
  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingEvent(true);
    setEventSuccessMsg("");

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEvent,
          adminId: currentUser.id,
          adminName: currentUser.fullName
        })
      });
      if (res.ok) {
        setEventSuccessMsg("Summit Event successfully created & published live!");
        setNewEvent({
          title: "",
          description: "",
          date: "",
          time: "",
          location: "",
          image: "",
          category: "Leadership",
          capacity: 100,
          packages: [
            { id: "pkg-std", name: "Standard Badge", fee: 100, benefits: ["All sessions"], description: "General Entry" },
            { id: "pkg-vip", name: "VIP Pass", fee: 250, benefits: ["Front-row, Speaker lunch"], description: "VIP Gold Access" }
          ]
        });
        onRefreshData();
        loadAdminData();
        setTimeout(() => setEventSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingEvent(false);
    }
  };

  // Archive/Delete Event
  const handleDeleteEvent = async (eventId: string) => {
    const confirmed = await showConfirmDialog("Archive Event?", "Are you sure you want to archive this event?", "Yes, Archive Event");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/events/${eventId}?adminId=${currentUser.id}&adminName=${currentUser.fullName}`, {
        method: "DELETE"
      });
      if (res.ok) {
        onRefreshData();
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // View Registered Attendees and Check-In
  const handleViewRegistrations = async (eventId: string) => {
    setSelectedEventForAttendance(eventId);
    setLoadingRegistrations(true);
    try {
      const res = await fetch(`/api/events/${eventId}/registrations`);
      const data = await res.json();
      setEventRegistrations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  // Toggle Attendance
  const handleToggleAttendance = async (regId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/registrations/${regId}/attendance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attended: !currentStatus })
      });
      if (res.ok && selectedEventForAttendance) {
        handleViewRegistrations(selectedEventForAttendance);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Approve success story
  const handleApproveStory = async (storyId: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/success-stories/${storyId}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approved,
          adminId: currentUser.id,
          adminName: currentUser.fullName
        })
      });
      if (res.ok) {
        showToast(approved ? "Success story approved & published!" : "Success story approval revoked.");
        loadAdminData();
      } else {
        showToast("Failed to change story approval.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Network error changing story approval.", "error");
    }
  };

  // Delete success story
  const handleDeleteStory = async (storyId: string) => {
    const confirmed = await showConfirmDialog("Delete Story?", "Are you sure you want to delete this success story?", "Yes, Delete Story");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/success-stories/${storyId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Success story deleted successfully.");
        loadAdminData();
      } else {
        showToast("Failed to delete success story.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Network error deleting success story.", "error");
    }
  };

  // Update success story
  const handleUpdateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory) return;
    try {
      const res = await fetch(`/api/success-stories/${editingStory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: storyForm.title,
          content: storyForm.content,
          imageUrl: storyForm.imageUrl,
          approved: storyForm.approved
        })
      });
      if (res.ok) {
        showToast("Success story updated successfully!");
        setEditingStory(null);
        loadAdminData();
      } else {
        showToast("Failed to update success story.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error updating story.", "error");
    }
  };

  // Update community post
  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    try {
      const res = await fetch(`/api/community/posts/${editingPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: postForm.content,
          imageUrl: postForm.imageUrl
        })
      });
      if (res.ok) {
        showToast("Community post moderated and updated!");
        setEditingPost(null);
        loadAdminData();
      } else {
        showToast("Failed to update post.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error updating post.", "error");
    }
  };

  // Delete community post
  const handleDeletePost = async (id: string) => {
    const confirmed = await showConfirmDialog("Delete Post?", "Are you sure you want to delete this community post?", "Yes, Delete Post");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/community/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Post deleted successfully.");
        loadAdminData();
      } else {
        showToast("Failed to delete post.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error deleting post.", "error");
    }
  };

  // Update Event
  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventForm.title,
          description: eventForm.description,
          date: eventForm.date,
          time: eventForm.time,
          location: eventForm.location,
          image: eventForm.image,
          category: eventForm.category,
          capacity: Number(eventForm.capacity)
        })
      });
      if (res.ok) {
        showToast("Event schedules updated successfully!");
        setEditingEvent(null);
        onRefreshData();
      } else {
        showToast("Failed to update event.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error updating event.", "error");
    }
  };

  // Update Support Ticket
  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;
    try {
      const res = await fetch(`/api/support/${editingTicket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: ticketForm.subject,
          category: ticketForm.category,
          status: ticketForm.status
        })
      });
      if (res.ok) {
        showToast("Support ticket updated successfully!");
        setEditingTicket(null);
        loadAdminData();
      } else {
        showToast("Failed to update ticket.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error updating ticket.", "error");
    }
  };

  // Delete Support Ticket
  const handleDeleteTicket = async (id: string) => {
    const confirmed = await showConfirmDialog("Delete Support Ticket?", "Are you sure you want to delete this support ticket?", "Yes, Delete Ticket");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/support/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Ticket deleted successfully.");
        loadAdminData();
      } else {
        showToast("Failed to delete ticket.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error deleting ticket.", "error");
    }
  };

  // Update Blog Article
  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    try {
      const res = await fetch(`/api/blogs/${editingBlog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: blogForm.title,
          content: blogForm.content,
          category: blogForm.category,
          image: blogForm.image,
          author: blogForm.author
        })
      });
      if (res.ok) {
        showToast("Blog article updated successfully!");
        setEditingBlog(null);
        onRefreshData();
      } else {
        showToast("Failed to update blog article.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error updating blog.", "error");
    }
  };

  // Update Announcement Banner
  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnounce) return;
    try {
      const res = await fetch(`/api/announcements/${editingAnnounce.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: announceForm.title,
          content: announceForm.content,
          priority: announceForm.priority,
          active: announceForm.active
        })
      });
      if (res.ok) {
        showToast("Announcement banner updated!");
        setEditingAnnounce(null);
        onRefreshData();
      } else {
        showToast("Failed to update announcement.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error updating announcement.", "error");
    }
  };

  // Update Carousel Slide
  const handleUpdateSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    try {
      const res = await fetch(`/api/carousel/${editingSlide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: slideForm.title,
          description: slideForm.description,
          imageUrl: slideForm.image,
          overlayColor: slideForm.overlayColor
        })
      });
      if (res.ok) {
        showToast("Carousel slide updated successfully!");
        setEditingSlide(null);
        loadSettingsAndSlides();
      } else {
        showToast("Failed to update slide.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error updating slide.", "error");
    }
  };

  // Respond to support ticket
  const handleSupportTicketReply = async (ticketId: string) => {
    const msg = supportResponse[ticketId];
    if (!msg?.trim()) return;

    try {
      const res = await fetch(`/api/support/${ticketId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "ADMIN",
          message: msg
        })
      });
      if (res.ok) {
        setSupportResponse({ ...supportResponse, [ticketId]: "" });
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Resolve Ticket
  const handleResolveTicket = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/support/${ticketId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" })
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Blog
  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newBlog,
          adminId: currentUser.id,
          adminName: currentUser.fullName
        })
      });
      if (res.ok) {
        setNewBlog({ title: "", content: "", category: "Leadership", image: "" });
        setBlogSuccess(true);
        onRefreshData();
        setTimeout(() => setBlogSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit active Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAnnounce)
      });
      if (res.ok) {
        setNewAnnounce({ title: "", content: "", priority: "low" });
        setAnnSuccess(true);
        onRefreshData();
        setTimeout(() => setAnnSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Blog Article
  const handleDeleteBlog = async (id: string) => {
    const confirmed = await showConfirmDialog("Delete Blog Article?", "Are you sure you want to delete this blog article?", "Yes, Delete Blog");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id: string) => {
    const confirmed = await showConfirmDialog("Remove Announcement?", "Are you sure you want to remove this announcement banner?", "Yes, Remove Banner");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export Member List to CSV
  const exportToCSV = (filename?: string, customHeaders?: string[], customRows?: any[][]) => {
    let headers = [
      "Member ID", 
      "Full Name", 
      "Email Address", 
      "Executive Title", 
      "Corporate Entity", 
      "Membership Tier", 
      "Account Status", 
      "Join Date", 
      "Total Registrations", 
      "Attended EventsCount", 
      "Scheduled Registrations History"
    ];
    
    let rows: any[][];
    if (customHeaders && customRows) {
      headers = customHeaders;
      rows = customRows;
    } else {
      rows = members.map(m => {
        // Find all registrations for this member
        const memberRegs = allRegistrations.filter(r => r.userId === m.id);
        
        // Separate attended vs registered
        const attendedCount = memberRegs.filter(r => r.attended).length;
        
        // Formatted list of events
        const registeredEventsStr = memberRegs.map(r => {
          const event = events.find(e => e.id === r.eventId);
          const eventTitle = event ? event.title : "Unknown Event";
          const dateStr = event ? event.date : "";
          const status = r.attended ? "Attended" : "Registered";
          return `${eventTitle} (${dateStr} - ${status})`;
        }).join("; ");

        return [
          m.id,
          `"${m.fullName.replace(/"/g, '""')}"`,
          `"${m.email.replace(/"/g, '""')}"`,
          `"${(m.title || "Elite Professional").replace(/"/g, '""')}"`,
          `"${(m.company || "WomenPlay Corporate").replace(/"/g, '""')}"`,
          `"${m.membershipTier}"`,
          `"${m.membershipStatus}"`,
          `"${m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "N/A"}"`,
          memberRegs.length,
          attendedCount,
          `"${registeredEventsStr.replace(/"/g, '""')}"`
        ];
      });
    }

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename || `WomenPlay_Platform_Members_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 text-left" id="admin-panel-wrapper">
      {/* Admin Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-6 mb-8 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-extrabold text-brand-pink">ADMINISTRATOR PORTAL</span>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 mt-1">WomenPlay Executive Control Board</h1>
          <p className="text-slate-500 text-xs">Complete authority over registered memberships, summits registration, community posts, stories moderation, and analytical indices.</p>
        </div>
        <button 
          onClick={loadAdminData}
          id="btn-admin-refresh"
          className="flex items-center space-x-2 py-2 px-4 rounded-xl border border-slate-200 text-slate-700 hover:text-brand-pink hover:bg-slate-50 text-xs font-semibold transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Synchronize Board Data</span>
        </button>
      </div>

      {/* Top Quick Metrics Tiles */}
      {reportData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <StatCard
            label="Total Members"
            value={reportData.metrics.totalMembers}
            sublabel={`${reportData.metrics.pendingMembers} Awaiting Approval`}
            sublabelClassName="text-[9px] text-amber-600 font-bold"
            icon={<Users className="w-8 h-8" />}
            iconClassName="text-brand-pink/60"
          />
          <StatCard
            label="Total Revenue"
            value={`$${reportData.metrics.totalRevenue}`}
            sublabel="From Tiers & Event Badges"
            valueClassName="text-brand-gold-dark"
            icon={<DollarSign className="w-8 h-8" />}
            iconClassName="text-brand-gold"
          />
          <StatCard
            label="Summit Modules"
            value={reportData.metrics.totalEvents}
            sublabel={`${reportData.metrics.upcomingEventsCount} Active / Upcoming`}
            sublabelClassName="text-[9px] text-emerald-600 font-bold"
            icon={<Calendar className="w-8 h-8" />}
            iconClassName="text-brand-gold-dark"
          />
          <StatCard
            label="Open Tickets"
            value={reportData.metrics.openTicketsCount}
            sublabel="Complaints & Enquiries"
            sublabelClassName="text-[9px] text-red-500 font-bold"
            icon={<ShieldAlert className="w-8 h-8" />}
            iconClassName="text-red-400"
          />
        </div>
      )}

      {/* Mobile Menu Toggler Bar */}
      <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 luxury-shadow mb-6" id="admin-mobile-toggle-bar">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand-pink/10 rounded-xl text-brand-pink">
            <Menu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Admin Section</span>
            <p className="text-xs font-bold text-slate-800">
              {
                activeTab === "overview" ? "Overview Analytics" :
                activeTab === "members" ? "Membership Approvals" :
                activeTab === "founders" ? "Founders Directory" :
                activeTab === "stories" ? "Pending Success Stories" :
                activeTab === "posts" ? "Timeline Moderation" :
                activeTab === "events" ? "Active Event Listings" :
                activeTab === "support" ? "Concierge Support Desk" :
                activeTab === "blogs" ? "Blog Articles Admin" :
                activeTab === "announcements" ? "Global Announcements" :
                activeTab === "carousel" ? "Slider Carousel Settings" :
                activeTab === "gallery" ? "Public Gallery Manager" :
                activeTab === "volunteers" ? "Volunteer Applications" :
                activeTab === "payments" ? "Payments Ledger" :
                activeTab === "membership-badges" ? "Membership Badges" :
                activeTab === "audit" ? "Administrative Audits" :
                activeTab === "settings" ? "Stripe Config" :
                activeTab === "smtp" ? "SMTP & Email Alerts" : "Navigation"
              }
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          id="admin-menu-toggle-btn"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
        >
          <span>{isMenuOpen ? "Hide Menu" : "Show Menu"}</span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? "rotate-90" : ""}`} />
        </button>
      </div>

      {/* Mobile Sliding Overlay Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs"
              id="admin-sidebar-backdrop-mobile"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-[290px] max-w-[85vw] z-50 bg-slate-50 border-r border-slate-100 p-6 overflow-y-auto flex flex-col space-y-6 h-full shadow-2xl text-left"
              id="admin-sidebar-nav-mobile"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-pink" />
                  <span className="font-display font-bold text-slate-800 text-sm tracking-wide">Admin Navigation</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 luxury-shadow overflow-hidden flex flex-col">
                {[
                  { id: "overview" as const, name: "Overview Analytics", icon: ChartIcon },
                  { id: "contacts" as const, name: "Contact Submissions", icon: Mail },
                  { id: "admins" as const, name: "Admin Personnel Management", icon: ShieldCheck },
                  { id: "members" as const, name: "Membership Approvals", icon: Users },
                  { id: "founders" as const, name: "Founders Directory", icon: Sparkles },
                  { id: "sponsors" as const, name: "Sponsors & Partners (RUD)", icon: Building2 },
                  { id: "stories" as const, name: "Pending Success Stories", icon: Sparkles },
                  { id: "posts" as const, name: "Timeline Moderation", icon: MessageSquare },
                  { id: "events" as const, name: "Active Event Listings", icon: Calendar },
                  { id: "support" as const, name: "Concierge & Support Desk", icon: ShieldAlert },
                  { id: "blogs" as const, name: "Blog Articles Admin", icon: FileText },
                  { id: "announcements" as const, name: "Global Announcements", icon: ToggleLeft },
                  { id: "carousel" as const, name: "Slider Carousel Settings", icon: Settings },
                  { id: "gallery" as const, name: "Gallery Manager", icon: Images },
                  { id: "volunteers" as const, name: "Volunteer Applications", icon: Users },
                  { id: "payments" as const, name: "Payments Ledger", icon: DollarSign },
                  { id: "membership-badges" as const, name: "Membership Badges", icon: Award },
                  { id: "audit" as const, name: "Administrative Audits", icon: Clipboard },
                  { id: "tasks" as const, name: "Task Management", icon: CheckSquare },
                  { id: "settings" as const, name: "Stripe Config", icon: Settings },
                  { id: "smtp" as const, name: "SMTP & Email Alerts", icon: Mail },
                  { id: "email-templates" as const, name: "Email Templates Editor", icon: FileCode },
                  { id: "bulk-messages" as const, name: "Bulk Email Broadcasts", icon: Send }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMenuOpen(false);
                      }}
                      id={`admin-tab-mobile-${tab.id}`}
                      className={`flex items-center space-x-3 py-3 px-5 text-xs font-semibold transition text-left border-l-4 ${
                        activeTab === tab.id 
                          ? "bg-brand-pink-light/30 border-brand-pink text-brand-pink font-bold" 
                          : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-brand-pink"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? "text-brand-pink" : "text-slate-400"}`} />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: admin navigation menu (Desktop version) */}
        <div className="hidden lg:block space-y-6" id="admin-sidebar-nav">
          <div className="bg-white rounded-2xl border border-slate-100 luxury-shadow overflow-hidden flex flex-col">
            {[
              { id: "overview" as const, name: "Overview Analytics", icon: ChartIcon },
              { id: "contacts" as const, name: "Contact Submissions", icon: Mail },
              { id: "admins" as const, name: "Admin Personnel Management", icon: ShieldCheck },
              { id: "members" as const, name: "Membership Approvals", icon: Users },
              { id: "founders" as const, name: "Founders Directory", icon: Sparkles },
              { id: "sponsors" as const, name: "Sponsors & Partners (RUD)", icon: Building2 },
              { id: "stories" as const, name: "Pending Success Stories", icon: Sparkles },
              { id: "posts" as const, name: "Timeline Moderation", icon: MessageSquare },
              { id: "events" as const, name: "Active Event Listings", icon: Calendar },
              { id: "support" as const, name: "Concierge & Support Desk", icon: ShieldAlert },
              { id: "blogs" as const, name: "Blog Articles Admin", icon: FileText },
              { id: "announcements" as const, name: "Global Announcements", icon: ToggleLeft },
              { id: "carousel" as const, name: "Slider Carousel Settings", icon: Settings },
              { id: "gallery" as const, name: "Gallery Manager", icon: Images },
              { id: "volunteers" as const, name: "Volunteer Applications", icon: Users },
              { id: "payments" as const, name: "Payments Ledger", icon: DollarSign },
              { id: "membership-badges" as const, name: "Membership Badges", icon: Award },
              { id: "audit" as const, name: "Administrative Audits", icon: Clipboard },
              { id: "tasks" as const, name: "Task Management", icon: CheckSquare },
              { id: "settings" as const, name: "Stripe Config", icon: Settings },
              { id: "smtp" as const, name: "SMTP & Email Alerts", icon: Mail },
              { id: "email-templates" as const, name: "Email Templates Editor", icon: FileCode },
              { id: "bulk-messages" as const, name: "Bulk Email Broadcasts", icon: Send }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMenuOpen(false);
                  }}
                  id={`admin-tab-${tab.id}`}
                  className={`flex items-center space-x-3 py-3 px-5 text-xs font-semibold transition text-left border-l-4 ${
                    activeTab === tab.id 
                      ? "bg-brand-pink-light/30 border-brand-pink text-brand-pink font-bold" 
                      : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-brand-pink"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? "text-brand-pink" : "text-slate-400"}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Panels */}
        <div className="lg:col-span-3 space-y-8">

      {/* PANELS SECTION */}

      {/* TAB: CONTACT SUBMISSIONS */}
      {activeTab === "contacts" && (
        <AdminContacts contacts={contactMessages} onRefreshData={loadAdminData} />
      )}

      {/* TAB: ADMIN PERSONNEL MANAGEMENT */}
      {activeTab === "admins" && (
        <AdminAdmins currentUser={currentUser} onRefreshData={onRefreshData} />
      )}

      {/* TAB: TASK MANAGEMENT */}
      {activeTab === "tasks" && (
        <AdminTasks currentUser={currentUser} members={members} onRefresh={onRefreshData} />
      )}

      {/* TAB 1: OVERVIEW ANALYTICS */}
      {activeTab === "overview" && reportData && <AdminOverview reportData={reportData} />}

      {/* TAB 2: MEMBERSHIP APPROVALS */}
      {activeTab === "members" && (
        <AdminMembers
          members={members}
          memberFilterStatus={memberFilterStatus}
          setMemberFilterStatus={setMemberFilterStatus}
          onUpdateStatus={handleUpdateMemberStatus}
          onReset2FA={handleResetMember2FA}
          onExportCSV={exportToCSV}
          onExportPDF={() => setShowReportModal(true)}
        />
      )}

      {/* TAB 3: ACTIVE EVENT LISTINGS */}
      {activeTab === "events" && (
        <AdminEvents 
          events={events} 
          onRefresh={loadAdminData} 
        />
      )}

      {/* TAB: FOUNDERS DIRECTORY */}
      {activeTab === "founders" && (
        <AdminFounders onRefreshData={onRefreshData} />
      )}

      {/* TAB: SPONSORS DIRECTORY (RUD) */}
      {activeTab === "sponsors" && (
        <AdminSponsors onRefreshData={onRefreshData} />
      )}

      {/* TAB 4: STORIES & POST MODERATION */}
      {activeTab === "stories" && (
        <AdminStories 
          stories={stories} 
          currentUser={currentUser}
          onRefresh={loadAdminData} 
        />
      )}
      {activeTab === "posts" && (
        <AdminPosts 
          posts={communityPosts} 
          currentUser={currentUser}
          onRefresh={loadAdminData} 
        />
      )}

      {/* TAB 5: CONCIERGE TICKETS DESK */}
      {activeTab === "support" && (
        <AdminSupport 
          tickets={tickets} 
          currentUser={currentUser} 
          onRefresh={loadAdminData} 
        />
      )}

      {/* TAB 6: BLOGS & ALERTS */}
      {activeTab === "blogs" && (
        <AdminBlogs 
          blogs={blogs} 
          currentUser={currentUser} 
          onRefresh={loadAdminData} 
        />
      )}
      {activeTab === "announcements" && (
        <AdminAnnouncements 
          announcements={announcements} 
          onRefresh={loadAdminData} 
        />
      )}

      {/* TAB 7: ADMINISTRATIVE AUDITS */}
      {activeTab === "audit" && <AdminAudit auditLogs={auditLogs} />}

{/* TAB: PAYMENTS & STRIPE REFUNDS */}
      {activeTab === "payments" && (
        <AdminPayments paymentsList={paymentsList} launchTickets={launchTickets} loadAdminData={loadAdminData} />
      )}

      {/* TAB: MEMBERSHIP BADGES CRUD & TIER MANAGER */}
      {activeTab === "membership-badges" && (
        <div className="space-y-6 text-left animate-fade-in" id="panel-admin-badges">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Award className="w-5 h-5 text-brand-pink" />
                <span>Membership Badge Tiers & Benefits Manager</span>
              </h2>
              <p className="text-slate-500 text-[11px] mt-1">
                Customize badge aesthetics, prefixes, monthly price points, and member benefits in real-time.
              </p>
            </div>
            
            {!isCreatingBadge && !editingBadge && (
              <button
                onClick={() => {
                  resetBadgeForm();
                  setIsCreatingBadge(true);
                }}
                className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Tier</span>
              </button>
            )}
          </div>

          {/* Create / Edit Form Drawer */}
          {(isCreatingBadge || editingBadge) && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 luxury-shadow space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  {editingBadge ? `Edit Tier: ${editingBadge.title}` : "Establish New Custom Membership Tier"}
                </h3>
                <button
                  onClick={resetBadgeForm}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveBadge} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tier Title</label>
                    <input
                      type="text"
                      placeholder="e.g. VIP Sovereign, Diamond Circle"
                      value={badgeTitle}
                      onChange={(e) => setBadgeTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-brand-pink"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Monthly Cost ($)</label>
                      <input
                        type="number"
                        placeholder="e.g. 199"
                        value={badgeCost}
                        onChange={(e) => setBadgeCost(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-brand-pink"
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Badge Code Prefix</label>
                      <input
                        type="text"
                        placeholder="e.g. AURA-VIP, AURA-DIAMOND"
                        value={badgeCodePrefix}
                        onChange={(e) => setBadgeCodePrefix(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold uppercase tracking-wider font-mono focus:outline-none focus:border-brand-pink"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Background Hex</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={badgeBgColor}
                          onChange={(e) => setBadgeBgColor(e.target.value)}
                          className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={badgeBgColor}
                          onChange={(e) => setBadgeBgColor(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-center font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Text/Accent Hex</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={badgeTextColor}
                          onChange={(e) => setBadgeTextColor(e.target.value)}
                          className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={badgeTextColor}
                          onChange={(e) => setBadgeTextColor(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-center font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Aesthetic Badge Preview */}
                  <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Badge Aesthetic Preview:</span>
                    <div className="flex justify-center py-4">
                      <div 
                        style={{ backgroundColor: badgeBgColor, color: badgeTextColor, borderColor: badgeTextColor + "40" }}
                        className="px-6 py-3 rounded-xl border text-center shadow-lg font-bold tracking-widest min-w-[200px]"
                      >
                        <p className="text-[10px] uppercase tracking-wider opacity-80 font-bold">{badgeTitle || "Preview Tier"}</p>
                        <p className="text-xs font-mono font-extrabold mt-1">{badgeCodePrefix || "PREFIX"}-XXXXX</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tier Benefits list (one benefit per line)</label>
                    <textarea
                      placeholder="e.g. Complimentary entrance to VIP Lounge&#10;Private Concierge Liaison&#10;All summit general admission packages included"
                      value={badgeBenefits}
                      onChange={(e) => setBadgeBenefits(e.target.value)}
                      rows={10}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3.5 font-medium focus:outline-none focus:border-brand-pink"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3.5 pt-4">
                    <button
                      type="button"
                      onClick={resetBadgeForm}
                      className="py-2.5 px-5 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={badgeActionLoading}
                      className="py-2.5 px-6 bg-brand-pink text-white rounded-xl font-bold transition hover:bg-brand-pink-dark cursor-pointer disabled:opacity-50"
                    >
                      {badgeActionLoading ? "Saving Changes..." : editingBadge ? "Save Badge tier" : "Create Badge tier"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Grid of Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {membershipBadgesList.map((badge) => (
              <div 
                key={badge.id}
                className="bg-white rounded-2xl border border-slate-100 luxury-shadow overflow-hidden flex flex-col hover:border-slate-200 transition"
                id={`badge-card-${badge.id}`}
              >
                {/* Visual Badge Card Header */}
                <div 
                  style={{ backgroundColor: badge.bgColor || "#1E293B", color: badge.textColor || "#FFFFFF" }}
                  className="p-5 text-center relative border-b border-black/10"
                >
                  <span className="text-[10px] uppercase tracking-widest font-extrabold opacity-75">{badge.title}</span>
                  <h4 className="text-lg font-extrabold mt-1 font-mono tracking-wider">{badge.codePrefix}-XXXX</h4>
                  <div className="absolute top-4 right-4 bg-black/20 text-white rounded-full px-2.5 py-0.5 text-[9px] font-bold">
                    ${badge.cost}/mo
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <h5 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Included Benefits & Privileges:</h5>
                    <ul className="space-y-1.5">
                      {badge.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600 font-medium">
                          <Check className="w-3.5 h-3.5 text-brand-pink shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => openEditBadge(badge)}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer text-center"
                    >
                      Edit Config
                    </button>
                    <button
                      onClick={() => handleDeleteBadge(badge.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      title="Delete Membership Tier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "carousel" && (
        <AdminCarousel 
          slides={carouselSlides} 
          onRefresh={loadSettingsAndSlides} 
        />
      )}

      {activeTab === "gallery" && (
        <AdminGallery 
          gallery={galleryItems} 
          onRefresh={loadAdminData} 
        />
      )}

      {/* TAB: VOLUNTEER APPLICATIONS */}
      {activeTab === "volunteers" && (
        <AdminVolunteers onRefreshData={onRefreshData} />
      )}

      {/* TAB 8: SYSTEMS & PAYMENTS CONFIG */}
      {activeTab === "settings" && (
        <div className="space-y-8 animate-fade-in" id="panel-admin-settings">
          <div className="max-w-3xl mx-auto">
            
            {/* System Configuration Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-brand-pink" />
                  <span>Stripe & Membership Gateway Settings</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Configure Stripe credentials and toggle membership subscription requirements.</p>
              </div>

              {settingsSavedMsg && (
                <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-3.5 rounded-xl border border-emerald-100 flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{settingsSavedMsg}</span>
                </div>
              )}

              {loadingSettings ? (
                <div className="flex items-center justify-center py-12 text-slate-400 text-xs gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-pink" />
                  <span>Fetching system settings...</span>
                </div>
              ) : (
                <form onSubmit={handleSaveSettings} className="space-y-5 text-xs text-left">
                  {/* Stripe Mode Selector */}
                  <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <label className="font-extrabold text-slate-700 uppercase tracking-wider block">Stripe Operating Environment Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setStripeMode("test")}
                        className={`py-2 px-3 rounded-lg font-bold text-xs transition border ${
                          stripeMode === "test"
                            ? "bg-amber-50 text-amber-900 border-amber-300 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Sandbox / Test Mode
                      </button>
                      <button
                        type="button"
                        onClick={() => setStripeMode("live")}
                        className={`py-2 px-3 rounded-lg font-bold text-xs transition border ${
                          stripeMode === "live"
                            ? "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Production / Live Mode
                      </button>
                    </div>
                  </div>

                  {stripeMode === "test" ? (
                    <div className="space-y-4 p-4 rounded-xl border border-amber-200 bg-amber-50/30">
                      <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">Sandbox API Keys</span>
                      <div className="space-y-1.5">
                        <label className="font-extrabold text-slate-600 uppercase tracking-wider block text-[10px]">Test Publishable Key</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pink/20 text-slate-800 font-mono transition text-xs"
                          placeholder="pk_test_..."
                          value={stripeTestPublicKey}
                          onChange={(e) => setStripeTestPublicKey(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-extrabold text-slate-600 uppercase tracking-wider block text-[10px]">Test Secret Key</label>
                        <input
                          type="password"
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pink/20 text-slate-800 font-mono transition text-xs"
                          placeholder="sk_test_..."
                          value={stripeTestSecretKey}
                          onChange={(e) => setStripeTestSecretKey(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
                      <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Production Live API Keys</span>
                      <div className="space-y-1.5">
                        <label className="font-extrabold text-slate-600 uppercase tracking-wider block text-[10px]">Live Publishable Key</label>
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pink/20 text-slate-800 font-mono transition text-xs"
                          placeholder="pk_live_..."
                          value={stripeLivePublicKey}
                          onChange={(e) => setStripeLivePublicKey(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-extrabold text-slate-600 uppercase tracking-wider block text-[10px]">Live Secret Key</label>
                        <input
                          type="password"
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pink/20 text-slate-800 font-mono transition text-xs"
                          placeholder="sk_live_..."
                          value={stripeLiveSecretKey}
                          onChange={(e) => setStripeLiveSecretKey(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stripe Webhook Signing Secret (same for test & live as configured in the Stripe dashboard) */}
                  <div className="space-y-1.5 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <label className="font-extrabold text-slate-600 uppercase tracking-wider block text-[10px]">Stripe Webhook Signing Secret</label>
                    <input
                      type="password"
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pink/20 text-slate-800 font-mono transition text-xs"
                      placeholder="whsec_..."
                      value={stripeWebhookSecret}
                      onChange={(e) => setStripeWebhookSecret(e.target.value)}
                    />
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      Found in the Stripe dashboard (Developers &gt; Webhooks &gt; your endpoint). Required so the server can verify payment webhooks and confirm ticket/membership purchases automatically.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 max-w-[80%]">
                        <label className="font-extrabold text-slate-700 uppercase tracking-wider block">Require Subscription for New Registrations</label>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          When enabled, new users are registered as <strong>PENDING</strong> and cannot access full portal benefits until they complete subscription payment.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSubscriptionRequired(!isSubscriptionRequired)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isSubscriptionRequired ? "bg-brand-pink" : "bg-slate-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            isSubscriptionRequired ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-3.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    {savingSettings ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Configuration...</span>
                      </>
                    ) : (
                      <span>Save System Settings</span>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 15. SMTP & OUTGOING EMAIL ALERTS SETTINGS */}
      {activeTab === "smtp" && (
        <div className="space-y-8 animate-fadeIn" id="admin-smtp-settings-view">
          {/* Section Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-display font-extrabold text-slate-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-brand-pink" />
                  <span>SMTP Outgoing Server & Automated Alerts</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure your cPanel webmail, SendGrid, Mailgun, or Amazon SES credentials to send outgoing notifications for new member registrations, event ticket purchases, contact form submissions, and concierge support tickets.
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${smtpForm.enableAlerts ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>
                {smtpForm.enableAlerts ? "â— Outgoing Alerts Active" : "â—‹ Alerts Paused"}
              </span>
            </div>

            {smtpSavedMsg && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{smtpSavedMsg}</span>
              </div>
            )}

            {loadingSmtp ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-brand-pink" />
                <span className="text-xs font-medium">Retrieving SMTP credentials...</span>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Connection & Credential Parameters */}
                <form onSubmit={handleSaveSmtp} className="space-y-4 text-xs text-left">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
                      <Server className="w-4 h-4 text-slate-600" />
                      <span>SMTP Host Connection</span>
                    </h3>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 space-y-1">
                        <label className="font-bold text-slate-600">SMTP Host Server</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. mail.womenplay.org"
                          value={smtpForm.host}
                          onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-brand-pink font-mono text-slate-800"
                        />
                        <span className="text-[10px] text-slate-400">cPanel Host: mail.domain.com</span>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-600">Port</label>
                        <input
                          type="number"
                          required
                          placeholder="465"
                          value={smtpForm.port}
                          onChange={(e) => setSmtpForm({ ...smtpForm, port: parseInt(e.target.value) || 465 })}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-brand-pink font-mono text-slate-800"
                        />
                        <span className="text-[10px] text-slate-400">465 (SSL) / 587</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600">SMTP Account Username</label>
                        <input
                          type="text"
                          placeholder="notifications@womenplay.org"
                          value={smtpForm.user}
                          onChange={(e) => setSmtpForm({ ...smtpForm, user: e.target.value })}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-brand-pink text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-600">SMTP Password</label>
                        <input
                          type="password"
                          placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                          value={smtpForm.pass}
                          onChange={(e) => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-brand-pink text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-800 block text-xs">Use SSL / TLS Encryption</span>
                        <span className="text-[10px] text-slate-400">Recommended for cPanel port 465</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSmtpForm({ ...smtpForm, secure: !smtpForm.secure })}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          smtpForm.secure ? "bg-brand-pink" : "bg-slate-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            smtpForm.secure ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Sender Identity Info */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-600" />
                      <span>From Sender Identity</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-600">From Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="notifications@womenplay.org"
                          value={smtpForm.fromEmail}
                          onChange={(e) => setSmtpForm({ ...smtpForm, fromEmail: e.target.value })}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-brand-pink text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-600">From Display Name</label>
                        <input
                          type="text"
                          required
                          placeholder="WomenPlay Secretariat"
                          value={smtpForm.fromName}
                          onChange={(e) => setSmtpForm({ ...smtpForm, fromName: e.target.value })}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-brand-pink text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingSmtp}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-3.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    {savingSmtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving SMTP Configuration...</span>
                      </>
                    ) : (
                      <span>Save SMTP Settings & Alert Rules</span>
                    )}
                  </button>
                </form>

                {/* Right Column: Trigger Rules & Live Test Email */}
                <div className="space-y-6 text-xs text-left">
                  {/* Automated Notification Rules */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
                      <ToggleLeft className="w-4 h-4 text-slate-600" />
                      <span>Outgoing Alert Trigger Rules</span>
                    </h3>

                    {/* Master Switch */}
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-900 block">Master Switch: Enable Outgoing Email Dispatch</span>
                        <span className="text-[10px] text-slate-400">Master control to pause or resume all automated email alerts</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSmtpForm({ ...smtpForm, enableAlerts: !smtpForm.enableAlerts })}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          smtpForm.enableAlerts ? "bg-emerald-600" : "bg-slate-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            smtpForm.enableAlerts ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      {[
                        { key: "alertOnRegistration", label: "Alert on New Member Registration", desc: "Notify admin when executive registers" },
                        { key: "alertOnEventBooking", label: "Alert on Event Ticket Booking", desc: "Notify admin when event ticket is purchased" },
                        { key: "alertOnContactInquiry", label: "Alert on Contact Us Form Submission", desc: "Send immediate email for website inquiries" },
                        { key: "alertOnSupportTicket", label: "Alert on Support Desk Ticket Created", desc: "Notify support team for newly opened tickets" }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                          <div>
                            <span className="font-bold text-slate-800 text-xs block">{item.label}</span>
                            <span className="text-[10px] text-slate-400">{item.desc}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSmtpForm({ ...smtpForm, [item.key]: !(smtpForm as any)[item.key] })}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              (smtpForm as any)[item.key] ? "bg-brand-pink" : "bg-slate-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                (smtpForm as any)[item.key] ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Test Email Transmitter */}
                  <form onSubmit={handleTestSmtp} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                    <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
                      <Send className="w-4 h-4 text-brand-pink" />
                      <span>SMTP Connection Test</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Send a diagnostic test email to verify your cPanel / SMTP credentials, handshake, and authentication.
                    </p>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">Test Recipient Email Address</label>
                      <input
                        type="email"
                        placeholder={smtpForm.fromEmail || "your-email@example.com"}
                        value={smtpTestEmail}
                        onChange={(e) => setSmtpTestEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-brand-pink text-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={testingSmtp}
                      className="w-full bg-brand-pink hover:bg-brand-pink-dark text-white font-bold p-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      {testingSmtp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Testing SMTP Connection...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Transmit Test Email</span>
                        </>
                      )}
                    </button>

                    {smtpTestResult && (
                      <div className={`p-3.5 rounded-xl border text-xs font-medium ${smtpTestResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                        <div className="flex items-start gap-2">
                          {smtpTestResult.success ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1">
                            <p className="font-bold">{smtpTestResult.success ? "SMTP Validation Successful!" : "SMTP Transmission Failed"}</p>
                            <p className="text-[11px] opacity-90">{smtpTestResult.message || smtpTestResult.error}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 16. TRANSACTIONAL EMAIL TEMPLATE EDITOR */}
      {activeTab === "email-templates" && (
        <div className="space-y-8 animate-fadeIn" id="admin-email-templates-view">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-display font-extrabold text-slate-900 flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-brand-pink" />
                  <span>Transactional Email Templates Editor</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Customize the subject lines, layout, and HTML formatting of automated transactional emails dispatched using your saved cPanel SMTP credentials.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetTemplate}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="Reset selected template to system default"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset to Default</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  disabled={savingTemplate}
                  className="px-4 py-1.5 rounded-lg bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {savingTemplate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>

            {templateSavedMsg && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{templateSavedMsg}</span>
              </div>
            )}

            {loadingTemplates ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-brand-pink" />
                <span className="text-xs font-medium">Loading transactional templates...</span>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Template Selection Sidebar */}
                <div className="space-y-3 lg:col-span-1">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>System Templates ({emailTemplates.length})</span>
                  </h3>

                  <div className="space-y-2">
                    {emailTemplates.map((tmpl) => {
                      const isSelected = tmpl.id === selectedTemplateId;
                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => handleSelectTemplate(tmpl.id)}
                          className={`p-4 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between space-y-2 ${
                            isSelected
                              ? "bg-brand-pink-light/20 border-brand-pink shadow-xs"
                              : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900 text-xs leading-snug">
                              {tmpl.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase shrink-0 ${
                              tmpl.category === "Onboarding" ? "bg-purple-100 text-purple-700" :
                              tmpl.category === "Events" ? "bg-amber-100 text-amber-800" :
                              tmpl.category === "Customer Service" ? "bg-blue-100 text-blue-700" :
                              "bg-emerald-100 text-emerald-800"
                            }`}>
                              {tmpl.category}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-slate-500 line-clamp-1 italic font-mono">
                            {tmpl.subject}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100/80">
                            <span>Vars: {tmpl.variables ? tmpl.variables.length : 0}</span>
                            <span>Updated: {tmpl.updatedAt ? new Date(tmpl.updatedAt).toLocaleDateString() : 'Default'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-2 mt-4">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
                      <span>SMTP Synchronization</span>
                    </div>
                    <p className="leading-relaxed">
                      All templates edited here are rendered on the fly and dispatched through your configured SMTP server when relevant events occur.
                    </p>
                  </div>
                </div>

                {/* Right Column: Code/Subject Editor + Live Preview */}
                <div className="lg:col-span-2 space-y-5 text-left">
                  
                  {/* Template Subject & Variables Header */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-brand-pink" />
                        <span>Email Subject Line</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Supports template variables</span>
                    </div>

                    <input
                      type="text"
                      required
                      value={templateSubject}
                      onChange={(e) => setTemplateSubject(e.target.value)}
                      placeholder="e.g. Welcome to WomenPlay Executive Network, {{userName}}!"
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-pink"
                    />

                    {/* Variable Pills Bar */}
                    <div className="pt-2 border-t border-slate-200/60">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                          Insertable Variables (Click to copy):
                        </span>
                        {copiedVar && (
                          <span className="text-[10px] text-emerald-600 font-bold animate-fadeIn">
                            Copied {copiedVar}!
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(emailTemplates.find(t => t.id === selectedTemplateId)?.variables || [
                          "{{userName}}", "{{userEmail}}", "{{membershipTier}}", "{{eventName}}", "{{eventDate}}", "{{eventLocation}}", "{{ticketCode}}", "{{ticketPackage}}", "{{ticketPrice}}", "{{inquirySubject}}", "{{inquiryMessage}}", "{{ticketId}}", "{{ticketCategory}}", "{{ticketSubject}}", "{{ticketDetails}}", "{{appUrl}}"
                        ]).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => copyVariableToClipboard(v)}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-mono hover:border-brand-pink hover:text-brand-pink transition cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Click to copy variable tag"
                          >
                            <Copy className="w-2.5 h-2.5 text-slate-400" />
                            <span>{v}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Editor Mode Selector */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setTemplatePreviewMode("editor")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          templatePreviewMode === "editor"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>HTML Template Code</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTemplatePreviewMode("preview")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          templatePreviewMode === "preview"
                            ? "bg-brand-pink text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Live Email Preview</span>
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      {templatePreviewMode === "editor" ? "Direct HTML / Inline CSS Styling" : "Sample Live Rendering"}
                    </span>
                  </div>

                  {/* Editor View vs Live Preview View */}
                  {templatePreviewMode === "editor" ? (
                    <div className="space-y-2">
                      <textarea
                        rows={16}
                        value={templateBodyHtml}
                        onChange={(e) => setTemplateBodyHtml(e.target.value)}
                        className="w-full bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-pink leading-relaxed"
                        placeholder="Enter HTML template markup here..."
                      />
                      <p className="text-[10px] text-slate-400 italic">
                        Tip: Keep CSS styles inline (e.g., style="color: #9d174d; font-family: Arial;") for maximum client compatibility across Gmail, Outlook, and Apple Mail.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                      <div className="bg-white p-2 rounded-lg border border-slate-200 mb-3 text-xs text-slate-600 space-y-1">
                        <p><strong>From:</strong> WomenPlay Secretariat &lt;notifications@womenplay.org&gt;</p>
                        <p><strong>Subject:</strong> {templateSubject.replace(/\{\{\s*userName\s*\}\}/gi, "Lady Eleanor Vance").replace(/\{\{\s*eventName\s*\}\}/gi, "Annual Leadership Summit").replace(/\{\{\s*ticketCode\s*\}\}/gi, "BADGE-VIP-8892")}</p>
                      </div>

                      <div 
                        className="bg-white p-4 rounded-lg border border-slate-200 overflow-x-auto shadow-xs"
                        dangerouslySetInnerHTML={{
                          __html: templateBodyHtml
                            .replace(/\{\{\s*userName\s*\}\}/gi, "Lady Eleanor Vance")
                            .replace(/\{\{\s*userEmail\s*\}\}/gi, templateTestEmail)
                            .replace(/\{\{\s*membershipTier\s*\}\}/gi, "Elite Boardroom Sponsor")
                            .replace(/\{\{\s*eventName\s*\}\}/gi, "Aura Annual Women in Leadership Summit 2026")
                            .replace(/\{\{\s*eventDate\s*\}\}/gi, "2026-09-15 (09:00 AM - 05:00 PM)")
                            .replace(/\{\{\s*eventLocation\s*\}\}/gi, "Grand Ballroom, The Plaza Hotel")
                            .replace(/\{\{\s*ticketCode\s*\}\}/gi, "BADGE-VIP-8892")
                            .replace(/\{\{\s*ticketPackage\s*\}\}/gi, "VIP Gold Badge Pass")
                            .replace(/\{\{\s*ticketPrice\s*\}\}/gi, "350")
                            .replace(/\{\{\s*inquirySubject\s*\}\}/gi, "Corporate Sponsorship Request")
                            .replace(/\{\{\s*inquiryMessage\s*\}\}/gi, "We would like to partner for the upcoming Q3 Leadership Summit.")
                            .replace(/\{\{\s*ticketId\s*\}\}/gi, "contact-98213")
                            .replace(/\{\{\s*ticketCategory\s*\}\}/gi, "VIP Member Concierge")
                            .replace(/\{\{\s*ticketSubject\s*\}\}/gi, "Boardroom Schedule Request")
                            .replace(/\{\{\s*ticketDetails\s*\}\}/gi, "Requesting schedule confirmation for the upcoming Q3 session.")
                            .replace(/\{\{\s*appUrl\s*\}\}/gi, "https://womenplay.org")
                        }}
                      />
                    </div>
                  )}

                  {/* Transmit Test Template Email Card */}
                  <form onSubmit={handleSendTemplateTest} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
                      <Send className="w-3.5 h-3.5 text-brand-pink" />
                      <span>Transmit Test Template Email</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Send a live formatted test email of this template to your inbox using current SMTP settings.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        required
                        placeholder="your-email@example.com"
                        value={templateTestEmail}
                        onChange={(e) => setTemplateTestEmail(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 p-2.5 rounded-lg text-xs focus:outline-none focus:border-brand-pink text-slate-800"
                      />
                      <button
                        type="submit"
                        disabled={sendingTemplateTest}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
                      >
                        {sendingTemplateTest ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Dispatching...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Test Email</span>
                          </>
                        )}
                      </button>
                    </div>

                    {templateTestResult && (
                      <div className={`p-3 rounded-xl border text-xs font-medium ${templateTestResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                        <div className="flex items-start gap-2">
                          {templateTestResult.success ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-bold">{templateTestResult.success ? "Template Email Delivered!" : "Template Dispatch Failed"}</p>
                            <p className="text-[11px] opacity-90">{templateTestResult.message || templateTestResult.error}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </form>

                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 17. BULK MESSAGING & BROADCAST DISPATCH */}
      {activeTab === "bulk-messages" && <AdminBulkMessaging />}
        </div> {/* closing lg:col-span-3 */}
      </div> {/* closing grid grid-cols-1 lg:grid-cols-4 gap-8 */}

      {/* Dynamic Printing Style Tag */}
      {showReportModal && (
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            /* Hide everything outside the report container */
            #root > div, #root > main, #root > footer, #root > header, #admin-panel-wrapper, .fixed, .modal-backdrop, .no-print {
              display: none !important;
              visibility: hidden !important;
            }
            /* Display only the printable container */
            #printable-executive-report {
              display: block !important;
              visibility: visible !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 30px !important;
              background: white !important;
              box-shadow: none !important;
              border: none !important;
            }
          }
        `}} />
      )}

      {/* 8. REPORT GENERATOR MODAL (PDF PREVIEW / PRINT STYLE) */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-100 modal-backdrop no-print">
          <div className="bg-white w-full max-w-5xl rounded-2xl overflow-hidden border border-slate-200 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header / Actions toolbar */}
            <div className="p-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between no-print shrink-0 text-left">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4.5 h-4.5 text-brand-pink" />
                  <span>Executive Report Document Preview</span>
                </h3>
                <p className="text-[10px] text-slate-400">Generate high-fidelity reports for corporate board reviews and save them as PDF.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportToCSV}
                  className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV File</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  className="py-1.5 px-4 bg-brand-pink hover:bg-brand-pink/95 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Scrollable Document Container */}
            <div className="p-8 md:p-12 overflow-y-auto bg-slate-100 flex-1 flex justify-center">
              {/* Actual Report Sheet (Formatted for standard Letter/A4 printing) */}
              <div 
                id="printable-executive-report" 
                className="bg-white p-10 md:p-12 w-full max-w-4xl shadow-md border border-slate-200 rounded-lg text-left text-slate-800 font-sans"
              >
                {/* Letterhead */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                  <div>
                    <h1 className="text-xl font-display font-extrabold tracking-tight text-slate-900 uppercase">
                      WomenPlay Executive Network
                    </h1>
                    <p className="text-xs font-semibold text-brand-pink uppercase tracking-widest mt-0.5">
                      Platform Membership & Administrative Registry
                    </p>
                    <p className="text-[10px] text-slate-500 mt-2">
                      Corporate Headquarters: San Francisco Aura Creative Hub
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-extrabold uppercase bg-slate-900 text-white py-1 px-2.5 rounded-sm tracking-wider">
                      CONFIDENTIAL REPORT
                    </span>
                    <p className="text-[10px] text-slate-400 mt-3 font-semibold">
                      Generated: {new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Operator: {currentUser.fullName} (Admin)
                    </p>
                  </div>
                </div>

                {/* Sub-Header Title */}
                <div className="mb-6">
                  <h2 className="text-base font-extrabold uppercase text-slate-800 tracking-wider">
                    Executive Registry Summary
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    An audited high-society ledger detailing network memberships, subscription levels, and workshop attendance. All registry data resides securely within the platform cloud database.
                  </p>
                </div>

                {/* Summary KPIs Row */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total Members</p>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">{members.length}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Elite Tier</p>
                    <p className="text-lg font-extrabold text-brand-pink mt-1">
                      {members.filter(m => m.membershipTier === MembershipTier.ELITE).length}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Premium Tier</p>
                    <p className="text-lg font-extrabold text-slate-850 mt-1">
                      {members.filter(m => m.membershipTier === MembershipTier.PREMIUM).length}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Event RSVPs</p>
                    <p className="text-lg font-extrabold text-emerald-600 mt-1">{allRegistrations.length}</p>
                  </div>
                </div>

                {/* Main Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-[11px] border-b border-slate-200">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-50 font-bold text-slate-700">
                        <th className="py-2.5 px-3">Name / Contact</th>
                        <th className="py-2.5 px-3">Corporate Title</th>
                        <th className="py-2.5 px-3">Tier</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Registered Events History</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m) => {
                        const mRegs = allRegistrations.filter(r => r.userId === m.id);
                        return (
                          <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="py-3 px-3">
                              <p className="font-bold text-slate-900">{m.fullName}</p>
                              <span className="text-[10px] text-slate-500">{m.email}</span>
                            </td>
                            <td className="py-3 px-3">
                              <p className="font-medium text-slate-800">{m.title || "Elite Professional"}</p>
                              <span className="text-[10px] text-slate-400">{m.company || "WomenPlay Corporate"}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-brand-pink text-[10px] uppercase">{m.membershipTier}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-[9px] font-bold uppercase">{m.membershipStatus}</span>
                            </td>
                            <td className="py-3 px-3 max-w-[240px]">
                              {mRegs.length === 0 ? (
                                <span className="text-slate-400 italic text-[10px]">No events registered</span>
                              ) : (
                                <div className="space-y-1">
                                  {mRegs.map(r => {
                                    const event = events.find(e => e.id === r.eventId);
                                    return (
                                      <div key={r.id} className="text-[10px] leading-snug flex items-center gap-1">
                                        <span className={`w-1 h-1 rounded-full shrink-0 ${r.attended ? "bg-emerald-500" : "bg-brand-pink"}`} />
                                        <span className="truncate font-medium text-slate-700">
                                          {event ? event.title : "Unknown Event"}
                                        </span>
                                        <span className="text-[8px] text-slate-400 font-bold shrink-0">
                                          ({r.attended ? "Attended" : "Registered"})
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Report Sign-off details footer */}
                <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-2 gap-6 text-[10px] text-slate-400">
                  <div>
                    <p className="font-bold uppercase tracking-wider text-slate-600">Verification & Authenticity</p>
                    <p className="mt-1 leading-relaxed">
                      This system generated administrative ledger is prepared using cryptographic event tracking and audited stripe membership transactions.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold uppercase tracking-wider text-slate-600">Official Seal</p>
                    <p className="mt-1">WomenPlay Executive Committee Board</p>
                    <p className="italic text-[9px] text-slate-300 mt-2">Sign-off Authorized</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer (Screen view only) */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0 no-print">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="py-2.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-xs cursor-pointer"
              >
                Close Report
              </button>
              <button
                type="button"
                onClick={handlePrintPDF}
                className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4 text-brand-pink" />
                <span>Save Report / Print PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
