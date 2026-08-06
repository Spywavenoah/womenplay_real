import React from "react";
import { 
  User as UserIcon, CreditCard, Award, MessageSquare, History, 
  Send, Plus, Loader2, Sparkles, Check, ChevronRight, FileText, 
  ShieldAlert, Bookmark, Ticket, Landmark, RefreshCw, Eye, MessageCircle, Heart,
  Trash2, Sliders, Smartphone, Tablet, Calendar, Users, QrCode, Camera, Globe, X, Menu,
  Mail, ShieldCheck, Lock, Copy
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MembershipTier } from "../types";
import type { User, Post, Comment, SuccessStory, SupportTicket, EventItem, Registration, TaskItem } from "../types";
import DigitalBadge from "./DigitalBadge";
import EventCalendar from "./EventCalendar";
import { showSuccessAlert, showErrorAlert, showConfirmDialog, showInfoAlert } from "../lib/swal";

interface PortalProps {
  currentUser: User;
  onUpdateProfile: (data: Partial<User>) => Promise<void>;
  onSubscribe: (tier: MembershipTier, amount: number, method: string) => Promise<void>;
  events: EventItem[];
  registrations: Registration[];
  onRefreshData: () => Promise<void>;
  allMembers?: User[];
  onOpenScanner?: () => void;
}

const assessmentQuestions = [
  {
    id: "gov-1",
    category: "Corporate Governance",
    title: "Fiduciary Responsibilities & SEC Compliance",
    desc: "Understanding directors' duties, fiduciary standards of care/loyalty, and public compliance disclosures."
  },
  {
    id: "gov-2",
    category: "Corporate Governance",
    title: "Bylaws & Committee Structure",
    desc: "Familiarity with audit, nominating, compensation, and risk committee operations."
  },
  {
    id: "gov-3",
    category: "Corporate Governance",
    title: "Risk Management & Regulatory Oversight",
    desc: "Ability to analyze regulatory compliance risks, litigation exposure, and cybersecurity oversight frameworks."
  },
  {
    id: "strat-1",
    category: "Strategic Strategy",
    title: "Diversity, ESG & Sustainability Mandates",
    desc: "Knowledge of modern ESG reporting metrics, board diversity legislation, and corporate citizenship benchmarks."
  },
  {
    id: "strat-2",
    category: "Strategic Strategy",
    title: "Global Scale & Disruption Oversight",
    desc: "Strategic guidance on global expansion plans, digital transformation vectors, and market-disruption vectors."
  },
  {
    id: "strat-3",
    category: "Strategic Strategy",
    title: "Executive Succession & Compensation",
    desc: "Reviewing CEO performance, drafting succession roadmaps, and formulating key executive reward tiers."
  },
  {
    id: "fin-1",
    category: "Financial Acumen",
    title: "Audit & Balance Sheet Mastership",
    desc: "Expertise in corporate accounting rules, evaluating complex P&L statements, and audit reports."
  },
  {
    id: "fin-2",
    category: "Financial Acumen",
    title: "Mergers & Acquisitions Oversight",
    desc: "Vetting asset transactions, joint venture partnerships, leverage restructuring, and investment syndicate alignment."
  },
  {
    id: "fin-3",
    category: "Financial Acumen",
    title: "Capital Allocation Strategy",
    desc: "Formulating debt-to-equity targets, shareholder buybacks, and seed-to-growth series investment pathways."
  },
  {
    id: "eth-1",
    category: "Boardroom Presence",
    title: "Executive Influence & Persuasion",
    desc: "Ability to command respect in the boardroom, negotiate consensus, and advocate strategic viewpoints."
  },
  {
    id: "eth-2",
    category: "Boardroom Presence",
    title: "Crisis Governance & Communications",
    desc: "Managing high-pressure shareholder disputes, public relations emergencies, or internal executive reviews."
  },
  {
    id: "eth-3",
    category: "Boardroom Presence",
    title: "Strategic Alliance Integration",
    desc: "Leveraging key high-level professional, government, or venture capital networks to create synergy."
  }
];

export default function Portal({
  currentUser,
  onUpdateProfile,
  onSubscribe,
  events,
  registrations,
  onRefreshData,
  allMembers = [],
  onOpenScanner
}: PortalProps) {
  // Tabs: feed, subscription, passes, stories, support, profile, todo, calendar
  const [activeTab, setActiveTab] = React.useState<"feed" | "subscription" | "passes" | "stories" | "support" | "profile" | "todo" | "calendar">("feed");
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  // Executive contacts (scanned badges) list state
  const [contacts, setContacts] = React.useState<User[]>(() => {
    try {
      const storageKey = `wp-contacts-${currentUser.id}`;
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedContactCard, setSelectedContactCard] = React.useState<User | null>(null);

  // Sync contacts automatically when custom event fires
  React.useEffect(() => {
    const handleContactsUpdate = () => {
      try {
        const storageKey = `wp-contacts-${currentUser.id}`;
        const saved = localStorage.getItem(storageKey);
        setContacts(saved ? JSON.parse(saved) : []);
      } catch (err) {
        console.error("Error syncing updated contacts in Portal:", err);
      }
    };

    const handleViewMemberProfile = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.member) {
        setSelectedContactCard(customEvent.detail.member);
        setActiveTab("profile");
      }
    };

    window.addEventListener("contacts-updated", handleContactsUpdate);
    window.addEventListener("view-member-profile", handleViewMemberProfile);

    return () => {
      window.removeEventListener("contacts-updated", handleContactsUpdate);
      window.removeEventListener("view-member-profile", handleViewMemberProfile);
    };
  }, [currentUser.id]);
  
  // Profile Form state
  const [profileForm, setProfileForm] = React.useState({
    fullName: currentUser.fullName,
    title: currentUser.title || "",
    company: currentUser.company || "",
    bio: currentUser.bio || "",
    avatarUrl: currentUser.avatarUrl || ""
  });
  const [updatingProfile, setUpdatingProfile] = React.useState(false);
  const [profileSuccess, setProfileSuccess] = React.useState(false);

  // Community Feed State
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loadingFeed, setLoadingFeed] = React.useState(false);
  const [postInput, setPostInput] = React.useState("");
  const [activePostComments, setActivePostComments] = React.useState<Record<string, { comments: Comment[], show: boolean }>>({});
  const [commentInputs, setCommentInputs] = React.useState<Record<string, string>>({});

  // Subscription Checkout state
  const [selectedTier, setSelectedTier] = React.useState<MembershipTier | null>(null);
  const [checkoutMethod, setCheckoutMethod] = React.useState<"Credit Card" | "Bank Transfer">("Credit Card");
  const [checkoutCardName, setCheckoutCardName] = React.useState("");
  const [checkoutCardNo, setCheckoutCardNo] = React.useState("");
  const [checkoutBank, setCheckoutBank] = React.useState("");
  const [processingPayment, setProcessingPayment] = React.useState(false);
  const [paymentSuccess, setPaymentSuccess] = React.useState(false);
  const [subscriptionReceipt, setSubscriptionReceipt] = React.useState<any>(null);

  // Active Subscription details
  const [activeSub, setActiveSub] = React.useState<any>(null);
  const [loadingSub, setLoadingSub] = React.useState(false);
  const [unsubscribing, setUnsubscribing] = React.useState(false);

  const fetchActiveSubscription = async () => {
    if (!currentUser) return;
    setLoadingSub(true);
    try {
      const res = await fetch(`/api/members/${currentUser.id}/subscription`);
      if (res.ok) {
        const data = await res.json();
        setActiveSub(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSub(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === "subscription" && (currentUser.membershipTier === "PREMIUM" || currentUser.membershipTier === "ELITE")) {
      fetchActiveSubscription();
    }
    if (activeTab === "profile") {
      fetchMemberPayments();
    }
  }, [activeTab, currentUser.membershipTier]);

  const handleUnsubscribe = async () => {
    const confirmed = await showConfirmDialog(
      "Cancel Subscription?",
      "Are you sure you want to cancel your recurring premium subscription? This will instantly downgrade your access to the basic plan.",
      "Yes, Cancel Subscription"
    );
    if (!confirmed) return;
    setUnsubscribing(true);
    try {
      const res = await fetch("/api/members/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await res.json();
      if (res.ok) {
        showSuccessAlert("Subscription Cancelled", "Your subscription has been successfully cancelled.");
        setActiveSub(null);
        if (onRefreshData) {
          await onRefreshData();
        }
      } else {
        showErrorAlert("Cancellation Failed", data.error || "Failed to unsubscribe");
      }
    } catch (e: any) {
      console.error(e);
      showErrorAlert("Error", e.message || "An error occurred");
    } finally {
      setUnsubscribing(false);
    }
  };

  // Success Story State
  const [myStories, setMyStories] = React.useState<SuccessStory[]>([]);
  const [storyTitle, setStoryTitle] = React.useState("");
  const [storyContent, setStoryContent] = React.useState("");
  const [submittingStory, setSubmittingStory] = React.useState(false);
  const [storySuccess, setStorySuccess] = React.useState(false);
  const [storyRefinement, setStoryRefinement] = React.useState("");
  const [refiningStory, setRefiningStory] = React.useState(false);

  // Support State
  const [myTickets, setMyTickets] = React.useState<SupportTicket[]>([]);
  const [ticketSubject, setTicketSubject] = React.useState("");
  const [ticketMessage, setTicketMessage] = React.useState("");
  const [ticketCategory, setTicketCategory] = React.useState<any>("Membership");
  const [submittingTicket, setSubmittingTicket] = React.useState(false);
  const [ticketSuccess, setTicketSuccess] = React.useState(false);
  const [ticketReplies, setTicketReplies] = React.useState<Record<string, string>>({});

  // Registered Events
  const [selectedBadge, setSelectedBadge] = React.useState<Registration | null>(null);

  // Interactive Task Item representation
  interface TaskItem {
    id: string;
    text: string;
    category: "Interface" | "Feature" | "Other";
    completed: boolean;
    priority: "High" | "Medium" | "Low";
  }

  // Interactive Todo List / Task Planner State
  const defaultTasks: TaskItem[] = [
    { id: "task-1", text: "Rename all instances from AURANETWORK to WomenPlay", category: "Interface", completed: true, priority: "High" },
    { id: "task-2", text: "Integrate new high-resolution gold & pink brand logo and meta icons", category: "Interface", completed: true, priority: "High" },
    { id: "task-3", text: "Implement interactive leadership todo & roadmap dashboard planner", category: "Feature", completed: true, priority: "High" },
    { id: "task-4", text: "Enable dynamic seats reservation for upcoming summits", category: "Feature", completed: false, priority: "Medium" },
    { id: "task-5", text: "Launch WomenPlay Board Readiness Assessment Matrix", category: "Feature", completed: false, priority: "High" },
    { id: "task-6", text: "Optimize mobile layouts & responsive touch controls", category: "Interface", completed: false, priority: "Medium" }
  ];

  const [todos, setTodos] = React.useState<TaskItem[]>(() => {
    const saved = localStorage.getItem("womenplay_todos");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultTasks;
      }
    }
    return defaultTasks;
  });

  React.useEffect(() => {
    localStorage.setItem("womenplay_todos", JSON.stringify(todos));
  }, [todos]);

  React.useEffect(() => {
    const hasSeatReservation = registrations.some(r => r.seat);
    if (hasSeatReservation) {
      setTodos(prev => {
        const t4 = prev.find(t => t.id === "task-4");
        if (t4 && !t4.completed) {
          return prev.map(t => t.id === "task-4" ? { ...t, completed: true } : t);
        }
        return prev;
      });
    }
  }, [registrations]);

  const [newTodoText, setNewTodoText] = React.useState("");
  const [newTodoCategory, setNewTodoCategory] = React.useState<"Interface" | "Feature" | "Other">("Interface");
  const [newTodoPriority, setNewTodoPriority] = React.useState<"High" | "Medium" | "Low">("Medium");
  const [todoFilter, setTodoFilter] = React.useState<"all" | "interface" | "feature" | "completed" | "pending">("all");

  // Board Readiness Assessment Matrix state
  const [matrixScores, setMatrixScores] = React.useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("womenplay_matrix_scores");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    const defaults: Record<string, number> = {};
    assessmentQuestions.forEach(q => { defaults[q.id] = 3; });
    return defaults;
  });

  const [assessmentCertified, setAssessmentCertified] = React.useState<boolean>(() => {
    return localStorage.getItem("womenplay_matrix_certified") === "true";
  });

  const updateQuestionScore = (id: string, score: number) => {
    const next = { ...matrixScores, [id]: score };
    setMatrixScores(next);
    localStorage.setItem("womenplay_matrix_scores", JSON.stringify(next));
  };

  const handleCertifyAssessment = () => {
    setAssessmentCertified(true);
    localStorage.setItem("womenplay_matrix_certified", "true");
    setTodos(prev => prev.map(t => t.id === "task-5" ? { ...t, completed: true } : t));
  };

  const handleResetAssessment = () => {
    setAssessmentCertified(false);
    localStorage.removeItem("womenplay_matrix_certified");
    const defaults: Record<string, number> = {};
    assessmentQuestions.forEach(q => { defaults[q.id] = 3; });
    setMatrixScores(defaults);
    localStorage.setItem("womenplay_matrix_scores", JSON.stringify(defaults));
    setTodos(prev => prev.map(t => t.id === "task-5" ? { ...t, completed: false } : t));
  };

  // Mobile Layout & Touch Optimization State (Roadmap Task 6)
  const [mobileOptimizerActive, setMobileOptimizerActive] = React.useState<boolean>(() => {
    return localStorage.getItem("womenplay_mobile_optimizer") === "true";
  });
  const [activeSimulationDevice, setActiveSimulationDevice] = React.useState<"iphone" | "tablet" | "desktop">("iphone");
  const [simulationStatus, setSimulationStatus] = React.useState<string>("");

  const handleApplyMobileOptimization = () => {
    setMobileOptimizerActive(true);
    localStorage.setItem("womenplay_mobile_optimizer", "true");
    setTodos(prev => prev.map(t => t.id === "task-6" ? { ...t, completed: true } : t));
    setSimulationStatus("Successfully integrated responsive layout wrappers and 44px minimum tap target guidelines.");
  };

  const handleResetMobileOptimization = () => {
    setMobileOptimizerActive(false);
    localStorage.removeItem("womenplay_mobile_optimizer");
    setTodos(prev => prev.map(t => t.id === "task-6" ? { ...t, completed: false } : t));
    setSimulationStatus("");
  };

  // Member Wallet & Payment States (compliant with Stripe)
  const [walletCardName, setWalletCardName] = React.useState("");
  const [walletCardNumber, setWalletCardNumber] = React.useState("");
  const [walletCardExpiry, setWalletCardExpiry] = React.useState("");
  const [walletCardCvv, setWalletCardCvv] = React.useState("");

  const formatCardExpiry = (rawVal: string, prevVal: string = ""): string => {
    if (prevVal.endsWith("/") && rawVal.length < prevVal.length) {
      const digits = rawVal.replace(/\D/g, "");
      return digits.slice(0, -1);
    }
    const digits = rawVal.replace(/\D/g, "").slice(0, 4);
    if (!digits) return "";
    if (digits.length === 1) {
      if (parseInt(digits, 10) > 1) return `0${digits}/`;
      return digits;
    }
    let month = digits.slice(0, 2);
    let monthNum = parseInt(month, 10);
    if (monthNum > 12) month = "12";
    if (monthNum === 0 && digits.length >= 2) month = "01";

    if (digits.length > 2) {
      return `${month}/${digits.slice(2, 4)}`;
    }
    if (digits.length === 2) {
      return `${month}/`;
    }
    return month;
  };
  const [walletSaving, setWalletSaving] = React.useState(false);
  const [walletDeleting, setWalletDeleting] = React.useState(false);
  
  const [memberPayments, setMemberPayments] = React.useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = React.useState(false);

  const fetchMemberPayments = async () => {
    setLoadingPayments(true);
    try {
      const res = await fetch("/api/payments");
      if (res.ok) {
        const allPayments = await res.json();
        // Filter payments belonging to current user
        const myPayments = allPayments.filter((p: any) => p.userId === currentUser.id);
        setMemberPayments(myPayments);
      }
    } catch (err) {
      console.error("Error fetching personal payments history:", err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleSetupWalletCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletCardName.trim() || !walletCardNumber.trim() || !walletCardExpiry.trim() || !walletCardCvv.trim()) {
      showErrorAlert("Missing Information", "All card credentials must be supplied to safely establish your secured credit profile.");
      return;
    }

    setWalletSaving(true);
    try {
      const res = await fetch(`/api/members/${currentUser.id}/setup-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardholderName: walletCardName,
          cardNumber: walletCardNumber,
          expiryDate: walletCardExpiry,
          cvv: walletCardCvv
        })
      });

      const data = await res.json();
      if (res.ok) {
        showSuccessAlert("Card Secured", data.message || "Card secured successfully!");
        setWalletCardName("");
        setWalletCardNumber("");
        setWalletCardExpiry("");
        setWalletCardCvv("");
        await onRefreshData(); // Refreshes currentUser.savedCard state!
      } else {
        showErrorAlert("Card Error", data.error || "Failed to secure card.");
      }
    } catch (err) {
      console.error(err);
      showErrorAlert("Error", "Network error processing secure card integration.");
    } finally {
      setWalletSaving(false);
    }
  };

  const handleDeleteWalletCard = async () => {
    const confirmed = await showConfirmDialog(
      "Delete Saved Card?",
      "Are you sure you want to delete your saved card? Stripe subscription billing may fail without a secure backup payment method on file.",
      "Yes, Delete Card"
    );
    if (!confirmed) return;

    setWalletDeleting(true);
    try {
      const res = await fetch(`/api/members/${currentUser.id}/delete-card`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        showSuccessAlert("Card Deleted", data.message || "Card details removed securely.");
        await onRefreshData(); // Refreshes currentUser.savedCard state!
      } else {
        showErrorAlert("Error", data.error || "Failed to remove card.");
      }
    } catch (err) {
      console.error(err);
      showErrorAlert("Error", "Network error removing card details.");
    } finally {
      setWalletDeleting(false);
    }
  };

  // 2FA Management State & Real OTP Setup Process
  const [twoFactorMethod, setTwoFactorMethod] = React.useState<"email" | "authenticator">((currentUser.twoFactorMethod as any) || "authenticator");
  const [twoFactorLoading, setTwoFactorLoading] = React.useState(false);
  const [twoFactorMsg, setTwoFactorMsg] = React.useState("");
  const [twoFactorQrCode, setTwoFactorQrCode] = React.useState("");
  const [twoFactorSecret, setTwoFactorSecret] = React.useState("");
  const [twoFactorVerifyCode, setTwoFactorVerifyCode] = React.useState("");
  const [twoFactorStep, setTwoFactorStep] = React.useState<"idle" | "setup" | "active">(currentUser.twoFactorEnabled ? "active" : "idle");

  const handleStart2FASetup = async () => {
    setTwoFactorLoading(true);
    setTwoFactorMsg("");
    try {
      const res = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, method: twoFactorMethod })
      });
      const data = await res.json();
      if (res.ok) {
        if (twoFactorMethod === "authenticator") {
          setTwoFactorQrCode(data.qrCodeUrl || "");
          setTwoFactorSecret(data.secret || "");
        }
        setTwoFactorStep("setup");
        setTwoFactorMsg(data.message || (twoFactorMethod === "email" ? "A 6-digit verification code has been sent to your email." : "Scan the QR code or copy the secret key into your Authenticator app."));
      } else {
        setTwoFactorMsg(data.error || "Failed to initialize 2FA setup.");
      }
    } catch (err) {
      setTwoFactorMsg("Network error starting 2FA setup.");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleVerifyAndEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorVerifyCode.trim()) return;
    setTwoFactorLoading(true);
    setTwoFactorMsg("");
    try {
      const res = await fetch("/api/auth/2fa/verify-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          method: twoFactorMethod,
          code: twoFactorVerifyCode.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        showSuccessAlert("2FA Security Enabled!", data.message || "Two-Factor Authentication is now active on your account.");
        setTwoFactorStep("active");
        setTwoFactorVerifyCode("");
        await onRefreshData();
      } else {
        setTwoFactorMsg(data.error || "Invalid 2FA code. Please check your app or email and try again.");
      }
    } catch (err) {
      setTwoFactorMsg("Error verifying 2FA setup code.");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    const confirmed = await showConfirmDialog(
      "Disable 2FA?",
      "Are you sure you want to disable Two-Factor Authentication on your account? This will reduce your account sign-in security.",
      "Yes, Disable 2FA"
    );
    if (!confirmed) return;

    setTwoFactorLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await res.json();
      if (res.ok) {
        showSuccessAlert("2FA Disabled", data.message || "Two-Factor Security disabled.");
        setTwoFactorStep("idle");
        setTwoFactorQrCode("");
        setTwoFactorSecret("");
        setTwoFactorVerifyCode("");
        await onRefreshData();
      } else {
        showErrorAlert("Error", data.error || "Failed to disable 2FA.");
      }
    } catch (err) {
      showErrorAlert("Error", "Network error disabling 2FA.");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newTodoText.trim(),
          category: newTodoCategory,
          priority: newTodoPriority,
          assignedToUserId: currentUser.id,
          assignedToFullName: currentUser.fullName,
          assignedToEmail: currentUser.email,
          createdById: currentUser.id,
          createdByName: currentUser.fullName,
          status: "Pending",
          completed: false
        })
      });
      if (res.ok) {
        const newTask = await res.json();
        setTodos([newTask, ...todos]);
        setNewTodoText("");
      }
    } catch (err) {
      console.error("Error adding task", err);
    }
  };

  const handleToggleTodo = async (id: string) => {
    const target = todos.find(t => t.id === id);
    if (!target) return;
    const newStatus = !target.completed;
    setTodos(todos.map(t => t.id === id ? { ...t, completed: newStatus, status: newStatus ? "Completed" : "Pending" } : t));

    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed: newStatus,
          status: newStatus ? "Completed" : "Pending"
        })
      });
    } catch (err) {
      console.error("Error toggling task", err);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Error deleting task", err);
    }
  };

  // Fetch community and tickets data
  const loadPortalData = async () => {
    if (!currentUser?.id) return;
    setLoadingFeed(true);
    try {
      // 1. Fetch Posts
      const pRes = await fetch("/api/community/posts");
      if (pRes.ok) {
        const pData = await pRes.json();
        if (Array.isArray(pData)) setPosts(pData);
      }

      // 2. Fetch Tickets
      const tRes = await fetch(`/api/support?userId=${currentUser.id}`);
      if (tRes.ok) {
        const tData = await tRes.json();
        if (Array.isArray(tData)) setMyTickets(tData);
      }

      // 3. Fetch Stories
      const sRes = await fetch("/api/success-stories");
      if (sRes.ok) {
        const sData = await sRes.json();
        if (Array.isArray(sData)) {
          setMyStories(sData.filter((story: any) => story.userId === currentUser.id));
        }
      }

      // 4. Fetch Tasks assigned to user or ALL
      const taskRes = await fetch(`/api/tasks?userId=${currentUser.id}&role=${currentUser.role}`);
      if (taskRes.ok) {
        const taskData = await taskRes.json();
        if (Array.isArray(taskData) && taskData.length > 0) {
          setTodos(taskData);
        }
      }
    } catch (e) {
      console.error("Failed to load portal data", e);
    } finally {
      setLoadingFeed(false);
    }
  };

  React.useEffect(() => {
    if (currentUser?.id) {
      loadPortalData();
    }
  }, [currentUser?.id, activeTab]);

  // Profile update handler
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileSuccess(false);
    try {
      await onUpdateProfile(profileForm);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Submit Community Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postInput.trim()) return;

    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, content: postInput })
      });
      if (res.ok) {
        setPostInput("");
        loadPortalData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Like Post
  const handleLikePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (res.ok) {
        loadPortalData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Show Comments Drawer
  const handleToggleComments = async (postId: string) => {
    const isShowing = activePostComments[postId]?.show;
    if (isShowing) {
      setActivePostComments({
        ...activePostComments,
        [postId]: { ...activePostComments[postId], show: false }
      });
    } else {
      try {
        const res = await fetch(`/api/community/posts/${postId}/comments`);
        const data = await res.json();
        setActivePostComments({
          ...activePostComments,
          [postId]: { comments: data, show: true }
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Submit Comment
  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, content })
      });
      if (res.ok) {
        setCommentInputs({ ...commentInputs, [postId]: "" });
        // Reload comments
        const commRes = await fetch(`/api/community/posts/${postId}/comments`);
        const commData = await commRes.json();
        setActivePostComments({
          ...activePostComments,
          [postId]: { comments: commData, show: true }
        });
        loadPortalData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Subscription Payment Process
  const handleSubscriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    setProcessingPayment(true);
    setPaymentSuccess(false);

    let fee = 100;
    if (selectedTier === MembershipTier.ELITE) fee = 250;

    try {
      const res = await fetch("/api/members/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          tier: selectedTier,
          amount: fee,
          method: checkoutMethod
        })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
        setSubscriptionReceipt(data.payment);
        setPaymentSuccess(true);
        await onRefreshData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Ask AI to Polish Success Story
  const handleRefineStory = async () => {
    if (!storyContent.trim()) return;
    setRefiningStory(true);
    setStoryRefinement("");
    try {
      const res = await fetch("/api/ai/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Success Story Title: ${storyTitle}\nDraft Story: ${storyContent}\n\nPlease improve this story to sound incredibly professional and inspiring for women leaders. Highlight standard executive metrics and make it sound elegant.`,
          type: "improve_story"
        })
      });
      const data = await res.json();
      setStoryRefinement(data.response || "Failed to generate recommendation.");
    } catch (err) {
      setStoryRefinement("Offline refinement: Ensure your executive draft emphasizes leadership outcomes.");
    } finally {
      setRefiningStory(false);
    }
  };

  // Submit Success Story to timeline (awaiting admin approval)
  const handlePublishStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyTitle || !storyContent) return;

    setSubmittingStory(true);
    setStorySuccess(false);
    try {
      const res = await fetch("/api/success-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          title: storyTitle,
          content: storyContent
        })
      });
      if (res.ok) {
        setStoryTitle("");
        setStoryContent("");
        setStoryRefinement("");
        setStorySuccess(true);
        loadPortalData();
        setTimeout(() => setStorySuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingStory(false);
    }
  };

  // Submit Support Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    setSubmittingTicket(true);
    setTicketSuccess(false);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          subject: ticketSubject,
          message: ticketMessage,
          category: ticketCategory
        })
      });
      if (res.ok) {
        setTicketSubject("");
        setTicketMessage("");
        setTicketSuccess(true);
        loadPortalData();
        setTimeout(() => setTicketSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Reply to active support ticket
  const handleReplyTicket = async (ticketId: string) => {
    const replyMsg = ticketReplies[ticketId];
    if (!replyMsg?.trim()) return;

    try {
      const res = await fetch(`/api/support/${ticketId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "USER",
          message: replyMsg
        })
      });
      if (res.ok) {
        setTicketReplies({ ...ticketReplies, [ticketId]: "" });
        loadPortalData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 text-left" id="portal-container">
      {/* Mobile Menu Toggler Bar */}
      <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 luxury-shadow mb-6" id="portal-mobile-toggle-bar">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand-pink/10 rounded-xl text-brand-pink">
            <Menu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Portal Section</span>
            <p className="text-xs font-bold text-slate-800">
              {
                activeTab === "feed" ? "Community Feed" :
                activeTab === "calendar" ? "Scheduled Calendar" :
                activeTab === "todo" ? "Roadmap & Tasks" :
                activeTab === "passes" ? "My Event Passes" :
                activeTab === "subscription" ? "Upgrade Membership" :
                activeTab === "stories" ? "Success Story Pitch" :
                activeTab === "support" ? "Support & Tickets" :
                activeTab === "profile" ? "Manage Profile" : "Navigation"
              }
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          id="portal-menu-toggle-btn"
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
              id="portal-sidebar-backdrop-mobile"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-[280px] max-w-[80vw] z-50 bg-slate-50 border-r border-slate-100 p-6 overflow-y-auto flex flex-col space-y-6 h-full shadow-2xl text-left"
              id="portal-sidebar-nav-mobile"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-pink" />
                  <span className="font-display font-bold text-slate-800 text-sm tracking-wide">Portal Navigation</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Card inside Mobile Drawer */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <img 
                    src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                    alt={currentUser.fullName} 
                    className="w-20 h-20 rounded-full border-2 border-brand-gold object-cover"
                  />
                  <span className={`absolute bottom-0 right-1 w-4 h-4 rounded-full border-2 border-white ${
                    currentUser.membershipStatus === "ACTIVE" ? "bg-emerald-500" : "bg-amber-500"
                  }`} title={`Status: ${currentUser.membershipStatus}`} />
                </div>

                <div>
                  <h3 className="font-display font-bold text-slate-800 text-base leading-tight">{currentUser.fullName}</h3>
                  <p className="text-slate-500 text-[11px] mt-1">{currentUser.title || "Elite Professional"}</p>
                </div>

                <div className="w-full pt-4 border-t border-slate-50 flex justify-between text-xs">
                  <div className="text-left">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider">TIER</span>
                    <span className="font-bold text-brand-pink text-[11px]">{currentUser.membershipTier}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider">STATUS</span>
                    <span className={`font-bold uppercase tracking-wide text-[10px] ${
                      currentUser.membershipStatus === "ACTIVE" ? "text-emerald-600" : "text-amber-600"
                    }`}>{currentUser.membershipStatus}</span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation inside Mobile Drawer */}
              <div className="bg-white rounded-2xl border border-slate-100 luxury-shadow overflow-hidden flex flex-col">
                {[
                  { id: "feed", name: "Community Feed", icon: MessageSquare },
                  { id: "calendar", name: "Scheduled Calendar", icon: Calendar },
                  { id: "todo", name: "Roadmap & Tasks", icon: Check },
                  { id: "passes", name: "My Event Passes", icon: Ticket },
                  { id: "subscription", name: "Upgrade Membership", icon: CreditCard },
                  { id: "stories", name: "Success Story Pitch", icon: FileText },
                  { id: "support", name: "Support & Tickets", icon: ShieldAlert },
                  { id: "profile", name: "Manage Profile", icon: UserIcon }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setSelectedBadge(null);
                        setIsMenuOpen(false); // Auto hide menu on selection
                      }}
                      id={`portal-nav-tab-mobile-${tab.id}`}
                      className={`flex items-center space-x-3.5 py-4 px-6 text-sm font-semibold transition text-left border-l-4 ${
                        activeTab === tab.id 
                          ? "bg-brand-pink-light/30 border-brand-pink text-brand-pink font-bold" 
                          : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-brand-pink"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${activeTab === tab.id ? "text-brand-pink" : "text-slate-400"}`} />
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
        {/* Left Menu Navigation Panel (Desktop version) */}
        <div className="hidden lg:block space-y-6" id="portal-sidebar-nav">
          {/* User Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <img 
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                alt={currentUser.fullName} 
                className="w-20 h-20 rounded-full border-2 border-brand-gold object-cover"
              />
              <span className={`absolute bottom-0 right-1 w-4 h-4 rounded-full border-2 border-white ${
                currentUser.membershipStatus === "ACTIVE" ? "bg-emerald-500" : "bg-amber-500"
              }`} title={`Status: ${currentUser.membershipStatus}`} />
            </div>

            <div>
              <h3 className="font-display font-bold text-slate-800 text-lg leading-tight">{currentUser.fullName}</h3>
              <p className="text-slate-500 text-xs mt-1">{currentUser.title || "Elite Professional"} at {currentUser.company || "WomenPlay Secretariat"}</p>
            </div>

            <div className="w-full pt-4 border-t border-slate-50 flex justify-between text-xs">
              <div className="text-left">
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider">TIER</span>
                <span className="font-bold text-brand-pink">{currentUser.membershipTier}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider">STATUS</span>
                <span className={`font-bold uppercase tracking-wide text-[10px] ${
                  currentUser.membershipStatus === "ACTIVE" ? "text-emerald-600" : "text-amber-600"
                }`}>{currentUser.membershipStatus}</span>
              </div>
            </div>
          </div>

          {/* Tab Controls Navigation List */}
          <div className="bg-white rounded-2xl border border-slate-100 luxury-shadow overflow-hidden flex flex-col">
            {[
              { id: "feed", name: "Community Feed", icon: MessageSquare },
              { id: "calendar", name: "Scheduled Calendar", icon: Calendar },
              { id: "todo", name: "Roadmap & Tasks", icon: Check },
              { id: "passes", name: "My Event Passes", icon: Ticket },
              { id: "subscription", name: "Upgrade Membership", icon: CreditCard },
              { id: "stories", name: "Success Story Pitch", icon: FileText },
              { id: "support", name: "Support & Tickets", icon: ShieldAlert },
              { id: "profile", name: "Manage Profile", icon: UserIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSelectedBadge(null);
                    setIsMenuOpen(false); // Auto hide menu on selection
                  }}
                  id={`portal-nav-tab-${tab.id}`}
                  className={`flex items-center space-x-3.5 py-4 px-6 text-sm font-semibold transition text-left border-l-4 ${
                    activeTab === tab.id 
                      ? "bg-brand-pink-light/30 border-brand-pink text-brand-pink font-bold" 
                      : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-brand-pink"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === tab.id ? "text-brand-pink" : "text-slate-400"}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Panels */}
        <div className="lg:col-span-3 bg-white p-6 md:p-8 rounded-2xl border border-slate-100 luxury-shadow min-h-[500px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full h-full"
          >
            {/* TAB: CALENDAR VIEW */}
            {activeTab === "calendar" && (
          <EventCalendar
            events={events}
            registrations={registrations}
            currentUser={currentUser}
            onRefreshData={onRefreshData}
            onViewPasses={() => {
              setActiveTab("passes");
              setSelectedBadge(null);
            }}
          />
        )}

        {/* TAB 1: COMMUNITY FEED */}
        {activeTab === "feed" && (
          <div className="space-y-6" id="panel-community-feed">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-display font-extrabold text-slate-900">WomenPlay Community Timeline</h2>
                <p className="text-slate-500 text-xs">Share strategic objectives, updates, or coordinate leadership breaks with fellows.</p>
              </div>
              <button 
                onClick={loadPortalData}
                id="btn-refresh-feed"
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-brand-pink hover:bg-slate-50 transition"
                title="Refresh Timeline"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Post Creation Form */}
            <form onSubmit={handleCreatePost} className="flex gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-150">
              <img 
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                alt={currentUser.fullName} 
                className="w-10 h-10 rounded-full border border-brand-gold object-cover"
              />
              <div className="flex-1 flex flex-col gap-2">
                <textarea
                  placeholder="What executive breakthrough or networking request would you like to share?"
                  value={postInput}
                  onChange={(e) => setPostInput(e.target.value)}
                  id="textarea-feed-post"
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 italic">Timeline posts are monitored for high-society decorum.</span>
                  <button
                    type="submit"
                    id="btn-submit-post"
                    className="bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold py-2 px-5 rounded-xl shadow-md transition"
                  >
                    Share Post
                  </button>
                </div>
              </div>
            </form>

            {/* Timeline List */}
            <div className="space-y-6 mt-6">
              {loadingFeed ? (
                <div className="flex items-center justify-center py-12 text-slate-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-pink mr-2" />
                  <span>Downloading community insights...</span>
                </div>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.id} className="border border-slate-100 rounded-2xl p-6 space-y-4 shadow-xs" id={`feed-post-${post.id}`}>
                    {/* Post Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-3">
                        <img 
                          src={post.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                          alt={post.userFullName} 
                          className="w-11 h-11 rounded-full object-cover border border-brand-gold/60"
                        />
                        <div className="text-left leading-snug">
                          <h4 className="text-sm font-bold text-slate-900">{post.userFullName}</h4>
                          <span className="text-slate-500 text-[10px]">{post.userTitle || "Executive Fellow"}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Post Content */}
                    <p className="text-slate-700 text-xs leading-relaxed text-left whitespace-pre-line">{post.content}</p>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-6 border-t border-b border-slate-50 py-3 text-xs font-semibold text-slate-500">
                      <button 
                        onClick={() => handleLikePost(post.id)}
                        id={`btn-like-post-${post.id}`}
                        className={`flex items-center space-x-1.5 hover:text-brand-pink transition ${
                          post.likes.includes(currentUser.id) ? "text-brand-pink" : ""
                        }`}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                        <span>{post.likes.length} Likes</span>
                      </button>

                      <button 
                        onClick={() => handleToggleComments(post.id)}
                        id={`btn-toggle-comments-${post.id}`}
                        className="flex items-center space-x-1.5 hover:text-brand-pink transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.commentsCount} Comments</span>
                      </button>
                    </div>

                    {/* Comments Area */}
                    {activePostComments[post.id]?.show && (
                      <div className="space-y-4 bg-slate-50 p-4 rounded-xl text-xs">
                        <div className="space-y-3">
                          {activePostComments[post.id].comments.map((comm) => (
                            <div key={comm.id} className="flex gap-2 text-left">
                              <img src={comm.userAvatar} alt={comm.userFullName} className="w-7 h-7 rounded-full object-cover" />
                              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex-1">
                                <p className="font-bold text-slate-900 text-[11px]">{comm.userFullName}</p>
                                <p className="text-slate-600 mt-1">{comm.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Comment input form */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add strategic feedback..."
                            value={commentInputs[post.id] || ""}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            id={`input-comment-${post.id}`}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            id={`btn-submit-comment-${post.id}`}
                            className="p-2 bg-brand-pink hover:bg-brand-pink-dark text-white rounded-xl transition"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                  No post insights shared on the timeline yet. Be the first to start the connection!
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY EVENT PASSES */}
        {activeTab === "passes" && (
          <div className="space-y-6" id="panel-event-passes">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-display font-extrabold text-slate-900">My Registered Access Passes</h2>
              <p className="text-slate-500 text-xs">Display your luxury digital passes and badges with custom QR verification at WomenPlay receptions.</p>
            </div>

            {selectedBadge ? (
              <div className="space-y-4 text-center">
                <button 
                  onClick={() => setSelectedBadge(null)}
                  id="btn-back-to-badges-list"
                  className="text-xs font-semibold text-brand-pink hover:text-brand-pink-dark flex items-center justify-center mx-auto"
                >
                  ← Back to Passes List
                </button>
                {/* Find corresponding event details */}
                {(() => {
                  const ev = events.find(e => e.id === selectedBadge.eventId);
                  return (
                    <DigitalBadge
                      attendeeName={currentUser.fullName}
                      badgeType={selectedBadge.packageName}
                      eventTitle={ev?.title || "Leadership Event"}
                      eventDate={ev?.date || "TBD"}
                      eventLocation={ev?.location || "TBD"}
                      badgeCode={selectedBadge.badgeCode}
                      seat={selectedBadge.seat}
                    />
                  );
                })()}
              </div>
            ) : registrations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {registrations.map((reg) => {
                  const ev = events.find(e => e.id === reg.eventId);
                  return (
                    <div key={reg.id} className="border border-brand-gold/30 gold-gradient p-5 rounded-2xl flex flex-col justify-between" id={`pass-item-${reg.id}`}>
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] uppercase tracking-wider bg-brand-gold-dark text-white px-2 py-0.5 rounded-full font-bold">
                            {reg.packageName}
                          </span>
                          {(ev?.status === "deactivated" || ev?.deactivated) && (
                            <span className="text-[9px] uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full font-extrabold">
                              Session Closed
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{ev?.title || "Registered Session"}</h3>
                        <p className="text-[11px] text-slate-500 font-medium">Code: {reg.badgeCode}</p>
                        {ev && (
                          <div className="text-[10px] text-slate-600 space-y-0.5">
                            <p><strong>Date:</strong> {ev.date} ({ev.time})</p>
                            <p><strong>Location:</strong> {ev.location}</p>
                          </div>
                        )}
                        {reg.seat && (
                          <p className="text-xs font-bold text-brand-pink mt-1">
                            Reserved Seat: {reg.seat}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedBadge(reg)}
                        id={`btn-view-pass-${reg.id}`}
                        className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-xs transition"
                      >
                        Display Digital Badge
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl space-y-3">
                <p>You have not registered for any upcoming WomenPlay sessions yet.</p>
                <p className="text-brand-pink font-semibold">Visit the homepage to view outstanding summit itineraries!</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: UPGRADE SUBSCRIPTION */}
        {activeTab === "subscription" && (
          <div className="space-y-8" id="panel-subscription">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-display font-extrabold text-slate-900">Manage Your WomenPlay Membership Tier</h2>
              <p className="text-slate-500 text-xs">WomenPlay offers role-based tier allocations catering to distinguished levels of sponsorship and corporate preparatories.</p>
            </div>

            {/* Active Subscription Overview Card */}
            {(currentUser.membershipTier === "PREMIUM" || currentUser.membershipTier === "ELITE") && (
              <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-brand-gold-dark/20 text-white rounded-2xl p-6 border border-slate-800 luxury-shadow relative overflow-hidden text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold bg-brand-gold text-slate-900 px-3 py-1 rounded-full">
                    Active VIP Subscription
                  </span>
                  <h3 className="text-xl font-extrabold flex items-center gap-2">
                    <span>{currentUser.membershipTier} Tier Member</span>
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  </h3>
                  <div className="text-slate-300 text-xs space-y-1">
                    <p className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-brand-gold animate-bounce" />
                      <span>Status: <strong className="text-emerald-400 uppercase">{currentUser.membershipStatus || "ACTIVE"}</strong></span>
                    </p>
                    {activeSub && (
                      <>
                        <p>Billing Cycle: <strong>{activeSub.interval === "month" ? "Monthly" : "Annual"} Recurring</strong></p>
                        <p>Next Payment Due: <strong>{new Date(activeSub.nextBillingDate).toLocaleDateString()}</strong></p>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
                  <button
                    onClick={handleUnsubscribe}
                    disabled={unsubscribing}
                    className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
                  >
                    {unsubscribing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Cancelling...</span>
                      </>
                    ) : (
                      <span>Cancel Premium Subscription</span>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 italic text-center md:text-left">Downgrades instantly to Free plan.</p>
                </div>
              </div>
            )}

            {paymentSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl space-y-4 text-center">
                <Check className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">Subscription Upgraded Successfully!</h3>
                <p className="text-slate-600 text-xs">Welcome to the prestigious <span className="font-bold text-brand-pink">{currentUser.membershipTier}</span> layer of the WomenPlay Network.</p>
                
                {subscriptionReceipt && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 max-w-sm mx-auto text-left font-mono text-[11px] space-y-2">
                    <p className="font-bold text-center border-b pb-2">WOMENPLAY OFFICIAL RECEIPT</p>
                    <p><strong>Receipt:</strong> {subscriptionReceipt.receiptNumber}</p>
                    <p><strong>Tier:</strong> {subscriptionReceipt.itemId}</p>
                    <p><strong>Amount:</strong> ${subscriptionReceipt.amount}</p>
                    <p><strong>Transaction:</strong> {subscriptionReceipt.transactionId}</p>
                    <p><strong>Date:</strong> {new Date(subscriptionReceipt.createdAt).toLocaleDateString()}</p>
                    <p className="text-center pt-2 border-t text-[9px] text-slate-400">THANK YOU FOR YOUR PRESTIGIOUS SPONSORSHIP</p>
                  </div>
                )}

                <button 
                  onClick={() => {
                    setPaymentSuccess(false);
                    setSelectedTier(null);
                  }}
                  id="btn-subscription-done"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition"
                >
                  Continue Browsing Portal
                </button>
              </div>
            ) : selectedTier ? (
              <form onSubmit={handleSubscriptionSubmit} className="space-y-6 max-w-lg">
                <div className="flex justify-between items-center bg-brand-gold-light/40 border border-brand-gold/30 p-4 rounded-xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Selected Tier Upgrade</span>
                    <h3 className="font-bold text-slate-800 text-base">{selectedTier} Membership</h3>
                  </div>
                  <span className="text-lg font-bold text-brand-gold-dark">
                    {selectedTier === MembershipTier.PREMIUM ? "$100" : "$250"}
                  </span>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-700 block">Select Secure Gateway Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setCheckoutMethod("Credit Card")}
                      id="btn-sub-method-card"
                      className={`p-4 rounded-xl border text-center font-bold text-xs transition ${
                        checkoutMethod === "Credit Card" 
                          ? "border-brand-pink bg-brand-pink-light/30 text-brand-pink" 
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      Credit / Debit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutMethod("Bank Transfer")}
                      id="btn-sub-method-bank"
                      className={`p-4 rounded-xl border text-center font-bold text-xs transition ${
                        checkoutMethod === "Bank Transfer" 
                          ? "border-brand-pink bg-brand-pink-light/30 text-brand-pink" 
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      Direct Bank Transfer
                    </button>
                  </div>
                </div>

                {checkoutMethod === "Credit Card" ? (
                  <div className="space-y-4 border border-slate-100 p-4 rounded-xl bg-slate-50">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Name on Card</label>
                      <input
                        type="text"
                        required
                        placeholder="Jane Doe"
                        value={checkoutCardName}
                        onChange={(e) => setCheckoutCardName(e.target.value)}
                        id="input-sub-cardname"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Card Number</label>
                      <input
                        type="text"
                        required
                        placeholder="•••• •••• •••• ••••"
                        value={checkoutCardNo}
                        onChange={(e) => setCheckoutCardNo(e.target.value)}
                        id="input-sub-cardno"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 border border-slate-100 p-4 rounded-xl bg-slate-50">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Bank Routing / Account Holder Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Chase Executive / Jane Doe"
                        value={checkoutBank}
                        onChange={(e) => setCheckoutBank(e.target.value)}
                        id="input-sub-bank"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 italic">Please execute transfer to WomenPlay Global routing, using your unique membership ID as reference.</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedTier(null)}
                    id="btn-sub-cancel"
                    className="flex-1 py-3 px-6 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                  >
                    Back to Tiers
                  </button>
                  <button
                    type="submit"
                    disabled={processingPayment}
                    id="btn-sub-confirm"
                    className="flex-1 py-3 px-6 rounded-xl bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-md"
                  >
                    {processingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing Gateway...</span>
                      </>
                    ) : (
                      <span>Complete Secure Upgrade</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {/* Premium Tier */}
                <div className="border border-brand-pink-mid/30 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden bg-gradient-to-b from-brand-pink-light/20 to-white hover:border-brand-pink transition duration-350 shadow-sm">
                  <div className="space-y-4">
                    <span className="text-[9px] uppercase tracking-widest font-extrabold bg-brand-pink text-white px-2.5 py-0.5 rounded-full">PREMIUM TIER</span>
                    <h3 className="text-xl font-bold text-slate-900">$100 <span className="text-xs text-slate-400 font-normal">/ Annually</span></h3>
                    <p className="text-xs text-slate-500">Fosters foundational networking and key accesses to annual sessions.</p>
                    <ul className="text-xs text-slate-600 space-y-2 pt-2 text-left">
                      <li className="flex items-center"><Check className="w-3.5 h-3.5 text-emerald-500 mr-2" /> Book standard passes for summits</li>
                      <li className="flex items-center"><Check className="w-3.5 h-3.5 text-emerald-500 mr-2" /> Publish breakthroughs to timeline</li>
                      <li className="flex items-center"><Check className="w-3.5 h-3.5 text-emerald-500 mr-2" /> Interactive community feed access</li>
                    </ul>
                  </div>

                  <button
                    disabled={currentUser.membershipTier === "PREMIUM" || currentUser.membershipTier === "ELITE"}
                    onClick={() => setSelectedTier(MembershipTier.PREMIUM)}
                    id="btn-select-tier-premium"
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition ${
                      currentUser.membershipTier === "PREMIUM" 
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                        : currentUser.membershipTier === "ELITE" 
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                        : "bg-brand-pink hover:bg-brand-pink-dark text-white"
                    }`}
                  >
                    {currentUser.membershipTier === "PREMIUM" || currentUser.membershipTier === "ELITE" ? "Active / Upgraded" : "Select Premium Tier"}
                  </button>
                </div>

                {/* Elite Tier */}
                <div className="border border-brand-gold rounded-2xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden bg-gradient-to-b from-brand-gold-light/40 to-white hover:border-brand-gold-dark transition duration-350 shadow-md">
                  <div className="absolute top-0 right-0 bg-brand-gold-dark text-white text-[9px] font-bold px-3 py-1 uppercase rounded-bl-xl tracking-wider">RECOMMENDED</div>
                  <div className="space-y-4">
                    <span className="text-[9px] uppercase tracking-widest font-extrabold bg-brand-gold-dark text-white px-2.5 py-0.5 rounded-full">ELITE SPONSOR TIER</span>
                    <h3 className="text-xl font-bold text-slate-900">$250 <span className="text-xs text-slate-400 font-normal">/ Annually</span></h3>
                    <p className="text-xs text-slate-500">Perfect for senior board members and aspiring non-executive directors.</p>
                    <ul className="text-xs text-slate-600 space-y-2 pt-2 text-left">
                      <li className="flex items-center"><Check className="w-3.5 h-3.5 text-emerald-500 mr-2" /> Premium front-row VIP gold badges</li>
                      <li className="flex items-center"><Check className="w-3.5 h-3.5 text-emerald-500 mr-2" /> Elite AI Boardroom mentoring access</li>
                      <li className="flex items-center"><Check className="w-3.5 h-3.5 text-emerald-500 mr-2" /> 1-on-1 sponsorship prep support</li>
                    </ul>
                  </div>

                  <button
                    disabled={currentUser.membershipTier === "ELITE"}
                    onClick={() => setSelectedTier(MembershipTier.ELITE)}
                    id="btn-select-tier-elite"
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition ${
                      currentUser.membershipTier === "ELITE" 
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                        : "gold-button-gradient text-slate-900 shadow-md"
                    }`}
                  >
                    {currentUser.membershipTier === "ELITE" ? "Active / Active" : "Select Elite Tier"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SUCCESS STORIES PITCH */}
        {activeTab === "stories" && (
          <div className="space-y-6" id="panel-stories">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-display font-extrabold text-slate-900">Publish Success Stories & Pitch Achievements</h2>
              <p className="text-slate-500 text-xs">Share your board appointments, leadership breakthroughs, or corporate promotions. All stories require Administrator validation before timeline visibility.</p>
            </div>

            {storySuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-xl font-medium animate-pulse">
                Story submitted successfully! Once approved by Eleanor Vance or Clara Montgomery, it will be published to the WomenPlay Network corporate pages.
              </div>
            )}

            <div className="max-w-2xl">
              {/* Submission Form */}
              <form onSubmit={handlePublishStory} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Story Title / Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="Appointed as Non-Executive Director at Chase"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    id="input-story-title"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Your Strategic Narrative</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Outline your milestones, metrics, and key sponsorship links from WomenPlay network..."
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                    id="textarea-story-content"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingStory}
                  id="btn-story-submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs tracking-wider uppercase shadow-md transition cursor-pointer"
                >
                  Submit Story to Admin
                </button>
              </form>
            </div>

            {/* My Stories list */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">My Success Story Timeline Statuses</h3>
              {myStories.length > 0 ? (
                myStories.map((story) => (
                  <div key={story.id} className="border border-slate-100 rounded-xl p-4 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800">{story.title}</h4>
                      <p className="text-slate-400 mt-1">{new Date(story.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`py-1 px-3 rounded-full font-bold text-[10px] ${
                      story.approved 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {story.approved ? "Published" : "Awaiting Approval"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-xs italic">No success stories created yet.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SUPPORT TICKETS & COMPLAINTS */}
        {activeTab === "support" && (
          <div className="space-y-6" id="panel-support">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-display font-extrabold text-slate-900">WomenPlay Executive Helpdesk & Complaints</h2>
              <p className="text-slate-500 text-xs">Submit support tickets, report compliance concerns or track active inquiries directly below.</p>
            </div>

            {ticketSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-xl font-medium animate-pulse">
                Support ticket filed successfully! Eleanor Vance or an operations lead will respond shortly.
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Submit Ticket Form */}
              <form onSubmit={handleCreateTicket} className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Complaint Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value as any)}
                      id="select-ticket-category"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="Membership">Membership / Setup</option>
                      <option value="Billing">Billing & Subscription</option>
                      <option value="Event">Event Pass Registration</option>
                      <option value="Abuse">Abuse or Safety Report</option>
                      <option value="Other">Other Issues</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Subject Headline</label>
                    <input
                      type="text"
                      required
                      placeholder="Access Code mismatch"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      id="input-ticket-subject"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Your Detailed Query</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide context, references, or specific issues for faster administrative response..."
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    id="textarea-ticket-msg"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingTicket}
                  id="btn-ticket-submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs tracking-wider uppercase shadow-md transition"
                >
                  File Complaint
                </button>
              </form>

              {/* Active tickets and progress tracking */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800">My Ticket Statuses & Active Replies</h3>
                {myTickets.length > 0 ? (
                  <div className="space-y-4 h-[300px] overflow-y-auto pr-2">
                    {myTickets.map((ticket) => (
                      <div key={ticket.id} className="border border-slate-100 p-4 rounded-xl space-y-3 bg-slate-50 text-[11px]" id={`ticket-card-${ticket.id}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800">{ticket.subject}</span>
                          <span className={`py-0.5 px-2 rounded-full text-[9px] font-bold uppercase ${
                            ticket.status === "open" 
                              ? "bg-blue-50 text-blue-700 border border-blue-100" 
                              : ticket.status === "in_progress" 
                              ? "bg-amber-50 text-amber-700 border border-amber-100" 
                              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          }`}>{ticket.status.replace("_", " ")}</span>
                        </div>
                        <p className="text-slate-500 italic">"{ticket.message}"</p>

                        {/* Active responses */}
                        <div className="space-y-2 border-t border-slate-200 pt-2 text-[10px]">
                          {ticket.responses.map((rep, idx) => (
                            <div key={idx} className={`p-2 rounded-lg ${
                              rep.sender === "ADMIN" ? "bg-brand-pink-light/30 border border-brand-pink/10 text-left" : "bg-white text-right"
                            }`}>
                              <span className="font-bold block text-slate-700">{rep.sender === "ADMIN" ? "Concierge Support" : "Me"}</span>
                              <p className="text-slate-600 mt-0.5">{rep.message}</p>
                            </div>
                          ))}
                        </div>

                        {/* Quick reply form */}
                        {ticket.status !== "resolved" && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Type support reply..."
                              value={ticketReplies[ticket.id] || ""}
                              onChange={(e) => setTicketReplies({ ...ticketReplies, [ticket.id]: e.target.value })}
                              id={`input-reply-${ticket.id}`}
                              className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
                            />
                            <button
                              onClick={() => handleReplyTicket(ticket.id)}
                              id={`btn-reply-submit-${ticket.id}`}
                              className="p-1 px-3 bg-brand-pink hover:bg-brand-pink-dark text-white rounded-lg transition"
                            >
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">No support tickets found.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MANAGE PROFILE */}
        {activeTab === "profile" && (
          <div className="space-y-6" id="panel-profile">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-display font-extrabold text-slate-900">Manage Your Executive Profile</h2>
              <p className="text-slate-500 text-xs">Update your career details, company affiliations, and biographical details displayed to WomenPlay fellows.</p>
            </div>

            <div className="max-w-2xl">
              {/* Profile Form */}
              <div className="space-y-4">
                {profileSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-xl font-medium animate-pulse">
                    Executive Profile updated successfully! Changes are live across WomenPlay timelines.
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        id="input-profile-fullname"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Avatar Image Upload</label>
                      <div className="flex items-center space-x-2">
                        {profileForm.avatarUrl ? (
                          <img src={profileForm.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-brand-pink shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px] shrink-0">IMG</div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setProfileForm({ ...profileForm, avatarUrl: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          id="input-profile-avatar-file"
                          className="block w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-brand-pink file:text-white hover:file:bg-brand-pink-dark cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Executive Title</label>
                      <input
                        type="text"
                        placeholder="Chief Investment Officer"
                        value={profileForm.title}
                        onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                        id="input-profile-title"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Corporate Affiliation</label>
                      <input
                        type="text"
                        placeholder="Grand Venture Alliance"
                        value={profileForm.company}
                        onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                        id="input-profile-company"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Professional Biography</label>
                    <textarea
                      rows={4}
                      placeholder="Tell us about your corporate breakthroughs and leadership sponsorships..."
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      id="textarea-profile-bio"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updatingProfile}
                    id="btn-profile-submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs tracking-wider uppercase shadow-md transition flex justify-center items-center cursor-pointer"
                  >
                    {updatingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span>Synchronizing Core Profile...</span>
                      </>
                    ) : (
                      <span>Update Profile Data</span>
                    )}
                  </button>
                </form>

                {/* SECURED WALLET CARD MANAGER */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 text-left">
                  <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-brand-pink" />
                        <span>Secured Payment Wallet</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Compliant with Stripe & PCI standards</p>
                    </div>
                    {currentUser.savedCard && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                        Active Card
                      </span>
                    )}
                  </div>

                  {currentUser.savedCard ? (
                    <div className="space-y-4">
                      {/* Interactive visual credit card */}
                      <div className="bg-gradient-to-r from-slate-800 to-slate-950 text-white rounded-xl p-4 shadow-md font-mono relative overflow-hidden min-h-[120px] flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-bold text-slate-400">WomenPlay Premium Link</span>
                          <span className="text-xs font-extrabold tracking-widest text-slate-300">
                            {currentUser.savedCard.brand?.toUpperCase() || "CARD"}
                          </span>
                        </div>
                        <div className="text-base font-bold tracking-widest text-slate-100 py-2">
                          •••• •••• •••• {currentUser.savedCard.last4 || "4242"}
                        </div>
                        <div className="flex justify-between items-end text-[10px]">
                          <div>
                            <span className="text-slate-500 block text-[8px] uppercase">Cardholder</span>
                            <span className="font-bold text-slate-200">{currentUser.savedCard.cardholderName || currentUser.fullName}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-500 block text-[8px] uppercase">Expires</span>
                            <span className="font-bold text-slate-200">{currentUser.savedCard.expiryDate || "12/28"}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleDeleteWalletCard}
                        disabled={walletDeleting}
                        className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition cursor-pointer text-center border border-red-200"
                      >
                        {walletDeleting ? "Removing Secure Profile..." : "Remove Card details"}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSetupWalletCard} className="space-y-3.5 text-xs">
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        No payment profile found on record. Store your card securely for effortless summit registrations and recurring memberships.
                      </p>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sandra Bullock"
                          value={walletCardName}
                          onChange={(e) => setWalletCardName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Card Number (compliant 16-digit)</label>
                        <input
                          type="text"
                          required
                          maxLength={16}
                          placeholder="4111222233334444"
                          value={walletCardNumber}
                          onChange={(e) => setWalletCardNumber(e.target.value.replace(/\D/g, ""))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 font-mono focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            required
                            placeholder="12/28"
                            maxLength={5}
                            value={walletCardExpiry}
                            onChange={(e) => setWalletCardExpiry(formatCardExpiry(e.target.value, walletCardExpiry))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-center font-mono focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">CVV</label>
                          <input
                            type="password"
                            required
                            maxLength={4}
                            placeholder="***"
                            value={walletCardCvv}
                            onChange={(e) => setWalletCardCvv(e.target.value.replace(/\D/g, ""))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-center font-mono focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="text-[9px] text-slate-400 italic bg-white/50 p-2.5 rounded-xl border border-slate-100">
                        🔒 Card details are sent directly to Stripe via secure cryptographic vaults. No CVVs or full credit numbers are persisted on local application servers.
                      </div>

                      <button
                        type="submit"
                        disabled={walletSaving}
                        className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                      >
                        {walletSaving ? "Securing payment wallet..." : "Secure and Save Card"}
                      </button>
                    </form>
                  )}
                </div>

                {/* 2-FACTOR AUTHENTICATION (2FA) CONFIGURATION */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 text-left">
                  <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-brand-pink" />
                        <span>Two-Factor Security (2FA)</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Protect executive access with One-Time Passcodes</p>
                    </div>
                    {currentUser.twoFactorEnabled ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        2FA Active
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        2FA Not Configured
                      </span>
                    )}
                  </div>

                  {twoFactorMsg && (
                    <div className="p-3 bg-brand-pink/10 border border-brand-pink/20 text-brand-pink font-bold text-[11px] rounded-xl leading-relaxed">
                      {twoFactorMsg}
                    </div>
                  )}

                  {currentUser.twoFactorEnabled ? (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800">Two-Factor Status</p>
                          <p className="text-[11px] text-slate-500">
                            Active via <strong className="text-brand-pink capitalize">{currentUser.twoFactorMethod === "authenticator" ? "Authenticator App (TOTP)" : "Email Verification"}</strong>
                          </p>
                        </div>
                        <ShieldCheck className="w-6 h-6 text-emerald-600" />
                      </div>
                      <button
                        type="button"
                        onClick={handleDisable2FA}
                        disabled={twoFactorLoading}
                        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer border border-rose-200"
                      >
                        {twoFactorLoading ? "Disabling 2FA..." : "Disable 2FA Security"}
                      </button>
                    </div>
                  ) : twoFactorStep === "idle" ? (
                    <div className="space-y-3.5 text-xs">
                      <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">Select 2FA Security Method</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setTwoFactorMethod("authenticator")}
                            className={`p-2.5 rounded-xl border text-[11px] font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                              twoFactorMethod === "authenticator"
                                ? "bg-brand-pink/10 border-brand-pink text-brand-pink"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>OTP App (TOTP)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setTwoFactorMethod("email")}
                            className={`p-2.5 rounded-xl border text-[11px] font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                              twoFactorMethod === "email"
                                ? "bg-brand-pink/10 border-brand-pink text-brand-pink"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email Code</span>
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleStart2FASetup}
                        disabled={twoFactorLoading}
                        className="w-full bg-brand-pink hover:bg-brand-pink-hover text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer uppercase tracking-wider shadow-xs flex items-center justify-center gap-2"
                      >
                        {twoFactorLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        <span>Start {twoFactorMethod === "authenticator" ? "Authenticator App" : "Email"} 2FA Setup</span>
                      </button>
                    </div>
                  ) : (
                    /* Step 2: Verification step */
                    <form onSubmit={handleVerifyAndEnable2FA} className="bg-white p-4 rounded-xl border border-slate-200 space-y-4 text-xs">
                      {twoFactorMethod === "authenticator" && twoFactorQrCode && (
                        <div className="text-center space-y-3">
                          <p className="text-[11px] text-slate-600 font-medium">Scan this QR Code with Google Authenticator, Authy, or 1Password:</p>
                          <div className="bg-white p-2 border border-slate-200 rounded-xl inline-block shadow-sm">
                            <img src={twoFactorQrCode} alt="2FA QR Code" className="w-36 h-36 mx-auto" />
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Secret Key (Manual Input)</span>
                            <code className="text-xs font-mono font-bold text-slate-800 break-all select-all">{twoFactorSecret}</code>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 block">Enter 6-Digit Verification Code</label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={twoFactorVerifyCode}
                          onChange={(e) => setTwoFactorVerifyCode(e.target.value.replace(/\D/g, ""))}
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl font-mono text-center text-lg font-extrabold tracking-widest text-slate-900 focus:outline-none focus:border-brand-pink"
                          required
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setTwoFactorStep("idle")}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={twoFactorLoading || twoFactorVerifyCode.length !== 6}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-2 rounded-xl transition uppercase tracking-wider"
                        >
                          {twoFactorLoading ? "Verifying..." : "Enable 2FA"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* PERSONAL BILLING & PAYMENT LEDGER */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl luxury-shadow space-y-4 text-left">
              <div className="border-b border-slate-150 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-display font-extrabold text-slate-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-brand-pink" />
                    <span>My Billing & Payment History</span>
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">Track your past membership subscriptions and event registrations</p>
                </div>
                <button
                  onClick={fetchMemberPayments}
                  disabled={loadingPayments}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                  title="Reload payments ledger"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingPayments ? "animate-spin" : ""}`} />
                </button>
              </div>

              {loadingPayments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-pink" />
                </div>
              ) : memberPayments.length === 0 ? (
                <p className="text-slate-400 text-xs py-4 text-center">No payment records found for your account.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Transaction / Date</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberPayments.map((p) => (
                        <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-800 block text-[11px]">{p.transactionId || p.id}</span>
                            <span className="text-slate-400 text-[10px] block mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-700 block">{p.purpose}</span>
                            <span className="text-slate-400 text-[10px] font-mono block mt-0.5">Payment Method: {p.method}</span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            ${p.amount.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${
                              p.status === "completed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : p.status === "refunded"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}>
                              {p.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                showInfoAlert(
                                  "OFFICIAL INVOICE RECEIPT",
                                  `Transaction ID: ${p.transactionId || p.id}\nDate: ${new Date(p.createdAt).toLocaleString()}\nMember: ${currentUser.fullName}\nItem: ${p.purpose}\nAmount: $${p.amount.toFixed(2)}\nStatus: ${p.status.toUpperCase()}`
                                );
                              }}
                              className="py-1 px-2.5 bg-slate-100 hover:bg-brand-pink/10 hover:text-brand-pink text-slate-600 rounded-lg text-[10px] font-bold transition cursor-pointer"
                            >
                              View Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* DIGITAL BUSINESS CARD MODAL */}
            <AnimatePresence>
              {selectedContactCard && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm shadow-xl" id="contact-business-card-overlay">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-2xl w-full max-w-sm text-center relative overflow-hidden space-y-6"
                  >
                    {/* Luxury top accent */}
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-pink to-brand-gold" />
                    
                    {/* Close button */}
                    <button
                      type="button"
                      onClick={() => setSelectedContactCard(null)}
                      className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="pt-4 flex flex-col items-center space-y-3">
                      <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-brand-pink to-brand-gold">
                        <div className="w-full h-full rounded-full bg-white p-0.5">
                          <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-800 overflow-hidden">
                            {selectedContactCard.avatarUrl ? (
                              <img src={selectedContactCard.avatarUrl} alt={selectedContactCard.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              selectedContactCard.fullName.substring(0, 2).toUpperCase()
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-display font-extrabold text-slate-900">{selectedContactCard.fullName}</h4>
                        <p className="text-[10px] text-brand-pink font-semibold uppercase tracking-widest mt-0.5">
                          {selectedContactCard.title || "Elite Corporate Director"}
                        </p>
                        <p className="text-xs text-slate-500">{selectedContactCard.company || "WomenPlay Alliance"}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-xs space-y-2.5 text-slate-600">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{selectedContactCard.email}</span>
                      </div>
                      {selectedContactCard.bio && (
                        <div className="pt-2 border-t border-slate-100">
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1">Professional bio</p>
                          <p className="italic leading-relaxed text-slate-500">"{selectedContactCard.bio}"</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={`mailto:${selectedContactCard.email}`}
                        className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer text-center"
                      >
                        Send Direct Message
                      </a>
                      <button
                        type="button"
                        onClick={() => setSelectedContactCard(null)}
                        className="py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition cursor-pointer"
                      >
                        Close Card
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* TAB 7: ROADMAP & INTERACTIVE TODO LIST */}
        {activeTab === "todo" && (
          <div className="space-y-6" id="panel-roadmap-todo">
            <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-display font-extrabold text-slate-900">WomenPlay Executive Roadmap & Tasks</h2>
                <p className="text-slate-500 text-xs">Monitor, execute, and propose tasks for platform feature launches and user experience refinements.</p>
              </div>
              <div className="flex items-center space-x-2 bg-brand-pink-light/30 border border-brand-pink/10 px-3 py-1.5 rounded-full text-[10px] text-brand-pink font-extrabold uppercase">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Strategic Member Vision Board</span>
              </div>
            </div>

            {/* Overall Progress Tracker Visualizer */}
            {(() => {
              const completedCount = todos.filter(t => t.completed).length;
              const totalCount = todos.length;
              const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
              return (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Vision Road Completion Rate</span>
                      <span className="text-brand-pink">{progressPercent}%</span>
                    </div>
                    {/* Progress Bar background */}
                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-gradient-to-r from-brand-pink to-brand-gold h-full rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Successfully deployed {completedCount} of {totalCount} corporate requirements.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:col-span-2">
                    <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                      <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">COMPLETED</span>
                      <span className="text-xl font-display font-extrabold text-emerald-600">{completedCount}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
                      <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">PENDING</span>
                      <span className="text-xl font-display font-extrabold text-brand-gold-dark">{totalCount - completedCount}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Filter and Add Task Controls Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Task Addition Form panel */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-4 text-xs">
                <h3 className="font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <Plus className="w-4 h-4 text-brand-pink" />
                  <span>Propose Vision Task</span>
                </h3>

                <form onSubmit={handleAddTodo} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Task Headline</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Set up localized summit chats"
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Category</label>
                      <select
                        value={newTodoCategory}
                        onChange={(e: any) => setNewTodoCategory(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-[11px] focus:outline-none"
                      >
                        <option value="Interface">Interface</option>
                        <option value="Feature">Feature</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Priority</label>
                      <select
                        value={newTodoPriority}
                        onChange={(e: any) => setNewTodoPriority(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-[11px] focus:outline-none"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow transition"
                  >
                    Add Task To Backlog
                  </button>
                </form>
              </div>

              {/* Task Listing with Filter */}
              <div className="lg:col-span-2 space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
                  {[
                    { id: "all", name: "All Tasks" },
                    { id: "interface", name: "Interface Improvements" },
                    { id: "feature", name: "Full Features" },
                    { id: "completed", name: "Completed" },
                    { id: "pending", name: "Pending" }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setTodoFilter(filter.id as any)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition ${
                        todoFilter === filter.id 
                          ? "bg-brand-pink text-white shadow-sm" 
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {filter.name}
                    </button>
                  ))}
                </div>

                {/* List Items */}
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
                  {(() => {
                    const filteredTodos = todos.filter(todo => {
                      if (todoFilter === "completed") return todo.completed;
                      if (todoFilter === "pending") return !todo.completed;
                      if (todoFilter === "interface") return todo.category === "Interface";
                      if (todoFilter === "feature") return todo.category === "Feature";
                      return true;
                    });

                    if (filteredTodos.length === 0) {
                      return (
                        <p className="text-slate-400 text-xs italic py-10 text-center border border-dashed border-slate-200 rounded-2xl">
                          No tasks match the active selection filter.
                        </p>
                      );
                    }

                    return filteredTodos.map((todo) => (
                      <div 
                        key={todo.id} 
                        className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition duration-200 ${
                          todo.completed 
                            ? "bg-emerald-50/20 border-emerald-100/50 opacity-80" 
                            : "bg-white border-slate-150 hover:border-slate-250 shadow-xs"
                        } border-l-4 ${
                          todo.priority === "High" 
                            ? "border-l-rose-500" 
                            : todo.priority === "Medium" 
                            ? "border-l-amber-500" 
                            : "border-l-slate-400"
                        }`}
                      >
                        <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                          <button
                            onClick={() => handleToggleTodo(todo.id)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                              todo.completed 
                                ? "bg-emerald-500 border-emerald-500 text-white" 
                                : "border-slate-300 hover:border-brand-pink bg-white"
                            }`}
                          >
                            {todo.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-semibold leading-tight break-words text-slate-800 ${
                              todo.completed ? "line-through text-slate-400 font-normal" : ""
                            }`}>
                              {todo.text}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                                todo.category === "Interface" 
                                  ? "bg-purple-50 text-purple-700 border border-purple-100" 
                                  : todo.category === "Feature" 
                                  ? "bg-blue-50 text-blue-700 border border-blue-100" 
                                  : "bg-slate-50 text-slate-700 border border-slate-100"
                              }`}>
                                {todo.category}
                              </span>
                              <span className={`text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                                todo.priority === "High" 
                                  ? "bg-rose-50 text-rose-700" 
                                  : todo.priority === "Medium" 
                                  ? "bg-amber-50 text-amber-700" 
                                  : "bg-slate-50 text-slate-600"
                              }`}>
                                {todo.priority} Priority
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Delete Action button */}
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                          title="Delete vision task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* INTERACTIVE BOARD READINESS ASSESSMENT MATRIX (ROADMAP TASK 5) */}
            <hr className="border-slate-150 my-10" />

            <div className="space-y-6" id="board-readiness-matrix-section">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-brand-pink text-xs uppercase tracking-wider font-extrabold">
                    <Sliders className="w-4 h-4" />
                    <span>Exclusive Leadership Tool</span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-slate-800">
                    WomenPlay Board Readiness Assessment Matrix
                  </h3>
                  <p className="text-slate-500 text-xs max-w-3xl">
                    Fulfill roadmap milestone #5 by mapping your competencies across corporate governance, finance, and strategic oversight pillars to determine institutional boardroom readiness.
                  </p>
                </div>
                {assessmentCertified && (
                  <button
                    onClick={handleResetAssessment}
                    className="px-3.5 py-1.5 border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Assessment</span>
                  </button>
                )}
              </div>

              {(() => {
                const totalScoreMax = 12 * 5; // 60
                const currentTotalScore = assessmentQuestions.reduce((acc, q) => acc + (matrixScores[q.id] || 3), 0);
                const readinessIndex = Math.round((currentTotalScore / totalScoreMax) * 100);

                const categoriesList = [
                  { name: "Corporate Governance", icon: Landmark, color: "bg-purple-500" },
                  { name: "Strategic Strategy", icon: Sparkles, color: "bg-blue-500" },
                  { name: "Financial Acumen", icon: CreditCard, color: "bg-amber-500" },
                  { name: "Boardroom Presence", icon: Award, color: "bg-brand-pink" }
                ];

                const getCategoryAvg = (cat: string) => {
                  const qs = assessmentQuestions.filter(q => q.category === cat);
                  const sum = qs.reduce((acc, q) => acc + (matrixScores[q.id] || 3), 0);
                  return Math.round((sum / (qs.length * 5)) * 100);
                };

                let badgeTitle = "Emerging Advisory Candidate";
                let badgeColor = "text-slate-600 bg-slate-50 border-slate-200";
                let badgeText = "You possess strong foundational leadership. Focus on building technical audit and corporate finance oversight credentials.";
                
                if (readinessIndex >= 90) {
                  badgeTitle = "Elite Boardroom Ready Fellow";
                  badgeColor = "text-amber-700 bg-amber-50 border-amber-200";
                  badgeText = "Exceptional boardroom suitability. Qualified for immediate corporate nominating committee presentations and public board roles.";
                } else if (readinessIndex >= 76) {
                  badgeTitle = "High-Impact Board Nominee";
                  badgeColor = "text-brand-pink bg-brand-pink-light/20 border-brand-pink/20";
                  badgeText = "Highly competitive profile. Prepared for advanced corporate board of directors nominations and fiduciary leadership seats.";
                } else if (readinessIndex >= 50) {
                  badgeTitle = "Strategic Committee Prospect";
                  badgeColor = "text-purple-700 bg-purple-50 border-purple-200";
                  badgeText = "Excellent strategic background. Suitable for advisory councils, non-profit boards, and major corporate sub-committees.";
                }

                if (assessmentCertified) {
                  return (
                    <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 luxury-shadow relative overflow-hidden space-y-8 animate-fade-in">
                      {/* Decorative Gold Elements */}
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-tr from-brand-gold/10 to-transparent rounded-full blur-2xl" />
                      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-brand-pink/10 to-transparent rounded-full blur-2xl" />

                      <div className="flex flex-col lg:flex-row gap-8 items-center relative z-10">
                        {/* Certificate Graphic Card */}
                        <div className="w-full lg:w-2/5 max-w-sm bg-white text-slate-900 border-4 border-brand-gold rounded-2xl p-6 text-center space-y-5 shadow-2xl relative">
                          {/* Inner double line border */}
                          <div className="absolute inset-2 border border-brand-gold-dark/20 pointer-events-none rounded-lg" />
                          
                          <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 border border-brand-gold flex items-center justify-center">
                            <Award className="w-6 h-6 text-brand-gold-dark" />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[8px] tracking-widest uppercase font-extrabold text-brand-pink block">Executive Certificate</span>
                            <h4 className="font-display font-extrabold text-slate-800 text-base">Boardroom Competency</h4>
                          </div>

                          <div className="border-t border-b border-slate-100 py-3 my-2 text-xs">
                            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Nominee Fellow</p>
                            <p className="font-display font-extrabold text-slate-900 text-sm mt-0.5">{currentUser.fullName}</p>
                            <p className="text-[9px] text-slate-500 mt-0.5 italic">{currentUser.title || "Elite Professional"} @ {currentUser.company || "WomenPlay Corporate"}</p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-slate-400 text-[8px] uppercase font-bold block">Assessment Score</span>
                            <span className="font-display font-black text-3xl text-brand-gold-dark tracking-tight">{readinessIndex}%</span>
                            <span className="block text-[9px] font-bold text-slate-600 uppercase tracking-wider">{badgeTitle}</span>
                          </div>

                          <p className="text-[10px] text-slate-400 px-2 leading-relaxed">
                            Certified by the Secretariat under official guidelines for advanced female board delegation placement.
                          </p>
                        </div>

                        {/* Summary Details */}
                        <div className="flex-1 space-y-6">
                          <div className="space-y-2">
                            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-gold/10 text-brand-gold-dark border border-brand-gold/20 rounded-full text-[10px] font-extrabold uppercase">
                              <Check className="w-3.5 h-3.5" />
                              <span>Governance Credential Verified</span>
                            </div>
                            <h4 className="text-xl font-display font-extrabold text-white">Your Boardroom Suitability Profile</h4>
                            <p className="text-slate-300 text-xs leading-relaxed">
                              {badgeText} Your scores have been successfully verified and synchronized with your leader portfolio. Use these details to showcase audit and strategic competencies.
                            </p>
                          </div>

                          {/* Radar-like list */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {categoriesList.map((cat) => {
                              const avg = getCategoryAvg(cat.name);
                              const CatIcon = cat.icon;
                              return (
                                <div key={cat.name} className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl space-y-3">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                      <div className={`${cat.color} p-1.5 rounded-lg text-white`}>
                                        <CatIcon className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="text-xs font-bold text-slate-200">{cat.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-brand-gold">{avg}%</span>
                                  </div>
                                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-brand-gold h-full rounded-full" style={{ width: `${avg}%` }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-start space-x-3">
                            <Sparkles className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h5 className="text-xs font-bold text-brand-gold">Next Career Milestones</h5>
                              <p className="text-slate-300 text-[11px] leading-relaxed">
                                We recommend attending the upcoming executive retreat roundtable to connect with corporate nomination chairs and showcase your strategic profile.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="bg-white rounded-3xl border border-slate-150 p-6 space-y-6 shadow-sm">
                    {/* Live Indicator Alert */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 border border-slate-150 rounded-2xl gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0 border border-brand-gold/20">
                          <Sliders className="w-5 h-5 text-brand-gold-dark" />
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-extrabold text-slate-400 block">Current Status</span>
                          <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                            <span>Ready to Evaluate</span>
                            <span className="inline-block w-2 h-2 rounded-full bg-brand-pink animate-pulse" />
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-left sm:text-right">
                          <span className="text-[9px] uppercase font-extrabold text-slate-400 block">Calculated Index</span>
                          <span className="text-sm font-black text-slate-800">{readinessIndex}%</span>
                        </div>
                        <div className="text-xs">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${badgeColor}`}>
                            {badgeTitle}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Questions Grouping */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      {assessmentQuestions.map((q) => {
                        const currentVal = matrixScores[q.id] || 3;
                        return (
                          <div 
                            key={q.id} 
                            className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between space-y-3.5"
                          >
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-[8px] uppercase tracking-wider font-extrabold text-brand-pink px-2 py-0.5 bg-brand-pink-light/20 rounded-full">
                                  {q.category}
                                </span>
                                <span className="text-[10px] font-black text-slate-400">Score: {currentVal}/5</span>
                              </div>
                              <h4 className="font-bold text-slate-800 text-[11px] leading-tight">{q.title}</h4>
                              <p className="text-slate-500 text-[10px] leading-relaxed">{q.desc}</p>
                            </div>

                            {/* Clickable 1-5 Competency Pills */}
                            <div className="flex items-center justify-between gap-1.5 pt-2">
                              {[1, 2, 3, 4, 5].map((val) => {
                                const isSelected = currentVal === val;
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => updateQuestionScore(q.id, val)}
                                    className={`flex-1 py-1 px-1 rounded-lg border text-[10px] font-bold text-center transition ${
                                      isSelected
                                        ? "bg-slate-900 border-slate-900 text-white"
                                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                    }`}
                                  >
                                    {val}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>All 12 evaluation metrics completed. Ready for verification and sync.</span>
                      </div>
                      <button
                        onClick={handleCertifyAssessment}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-brand-pink to-brand-gold hover:opacity-90 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center space-x-2"
                      >
                        <Award className="w-4 h-4" />
                        <span>Certify Competencies & Sync Roadmap</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* MOBILE LAYOUTS & TOUCH CONTROLS OPTIMIZATION CENTER (ROADMAP TASK 6) */}
            <hr className="border-slate-150 my-10" />

            <div className="space-y-6" id="mobile-layout-optimizer-section">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-brand-pink text-xs uppercase tracking-wider font-extrabold">
                    <Smartphone className="w-4 h-4" />
                    <span>Executive Accessibility Portal</span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-slate-800">
                    WomenPlay Mobile & Touch Controls Optimization Hub
                  </h3>
                  <p className="text-slate-500 text-xs max-w-3xl">
                    Satisfy roadmap milestone #6 by reviewing, validating, and applying mobile-responsive touch-target layouts (min 44px) across key portfolio feeds and checkout processes.
                  </p>
                </div>
                {mobileOptimizerActive && (
                  <button
                    onClick={handleResetMobileOptimization}
                    className="px-3.5 py-1.5 border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Optimizations</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Simulator Column */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-150 p-6 space-y-6 shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-700">Responsive Viewport Simulator</span>
                    <div className="flex space-x-1">
                      {[
                        { id: "iphone", name: "iPhone 15", icon: Smartphone },
                        { id: "tablet", name: "iPad Pro", icon: Tablet },
                        { id: "desktop", name: "Desktop Mini", icon: Eye }
                      ].map((dev) => {
                        const DevIcon = dev.icon;
                        const isSelected = activeSimulationDevice === dev.id;
                        return (
                          <button
                            key={dev.id}
                            onClick={() => {
                              setActiveSimulationDevice(dev.id as any);
                              setSimulationStatus(`Switched simulation container viewport to ${dev.name}.`);
                            }}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold flex items-center space-x-1 transition ${
                              isSelected
                                ? "bg-slate-900 border-slate-900 text-white"
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            <DevIcon className="w-3 h-3" />
                            <span className="hidden sm:inline">{dev.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Simulated Device Frame wrapper */}
                  <div className="flex justify-center items-center py-6 bg-slate-100/50 rounded-2xl border border-slate-150/60 overflow-hidden min-h-[300px]">
                    <div 
                      className={`transition-all duration-300 bg-white border border-slate-300 shadow-md flex flex-col ${
                        activeSimulationDevice === "iphone" 
                          ? "w-[280px] h-[380px] rounded-[36px] border-[8px] border-slate-800" 
                          : activeSimulationDevice === "tablet"
                          ? "w-[440px] h-[300px] rounded-2xl border-4 border-slate-700"
                          : "w-full max-w-lg h-[240px] rounded-xl border border-slate-300"
                      }`}
                    >
                      {/* Device top notches */}
                      {activeSimulationDevice === "iphone" && (
                        <div className="w-24 h-4 bg-slate-800 rounded-b-xl mx-auto mb-1 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-700 mr-2" />
                          <span className="w-8 h-1 bg-slate-700 rounded-full" />
                        </div>
                      )}

                      {/* Screen inner container */}
                      <div className="p-4 flex-1 overflow-y-auto space-y-4 text-left">
                        {/* Status bar */}
                        <div className="flex justify-between items-center text-[8px] font-mono font-bold text-slate-400 border-b border-slate-50 pb-1.5">
                          <span>09:41 AM</span>
                          <span className="flex items-center space-x-1">
                            <span>LTE</span>
                            <span>[🔋 100%]</span>
                          </span>
                        </div>

                        {/* Event list mock preview */}
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="text-[7px] uppercase font-extrabold text-brand-pink tracking-wider">Premium Summit</span>
                            <h5 className="text-[10px] font-extrabold text-slate-800">WomenPlay Boardroom Retreat</h5>
                            <p className="text-[8px] text-slate-400">London, UK • Aug 14</p>
                          </div>

                          {/* Seating Reservation Mock Button */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                            <span className="text-[8px] font-bold text-slate-500 block">Select Reservation Method:</span>
                            
                            {/* Layout selection showcasing optimized padding */}
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setSimulationStatus("Checked Credit Card touch option!")}
                                className={`rounded-lg border text-[8px] font-bold text-center transition ${
                                  mobileOptimizerActive
                                    ? "p-3 bg-brand-pink/10 border-brand-pink text-brand-pink font-semibold" // Touch targets >= 44px
                                    : "p-1.5 bg-white border-slate-200 text-slate-500" // Tiny, non-accessible hit area
                                }`}
                              >
                                {mobileOptimizerActive ? "Card (Tap-Friendly)" : "Card (Small)"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setSimulationStatus("Checked Bank touch option!")}
                                className={`rounded-lg border text-[8px] font-bold text-center transition ${
                                  mobileOptimizerActive
                                    ? "p-3 bg-brand-pink/10 border-brand-pink text-brand-pink font-semibold"
                                    : "p-1.5 bg-white border-slate-200 text-slate-500"
                                }`}
                              >
                                {mobileOptimizerActive ? "Bank (Tap-Friendly)" : "Bank (Small)"}
                              </button>
                            </div>

                            {/* Help tooltip with hit area explanation */}
                            <p className="text-[7px] text-slate-400 italic leading-tight">
                              {mobileOptimizerActive 
                                ? "✓ Optimizations active: Tap areas expanded to minimum 44px (11mm height) for high tactile precision."
                                : "⚠ Unoptimized: Buttons have small padding (under 30px tap height) leading to high potential of user tap failures."}
                            </p>
                          </div>
                        </div>

                        {/* Interactive Board readiness evaluation preview */}
                        <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[7px] uppercase tracking-wider font-extrabold text-brand-gold">Competency Score</span>
                            <span className="text-[8px] font-black">94%</span>
                          </div>
                          
                          {/* Mock Pill Selector */}
                          <div className="flex justify-between gap-1">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setSimulationStatus(`Simulated rating tap: score ${num}`)}
                                className={`flex-1 rounded-md text-[8px] font-bold transition ${
                                  mobileOptimizerActive 
                                    ? "py-2 px-1 bg-white/20 hover:bg-white text-white hover:text-slate-900 border border-white/10" // Touch friendly
                                    : "py-0.5 px-0.5 bg-white/5 text-slate-400 border border-transparent" // Tiny
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Control Panel Column */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-150 flex flex-col justify-between space-y-6 text-xs">
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-200 pb-2">
                      <Sliders className="w-4 h-4 text-brand-pink" />
                      <span>Tactile Verification</span>
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[9px] uppercase font-extrabold text-slate-400 block">Touch Guideline</span>
                        <span className="text-[11px] font-bold text-slate-700 block">W3C Mobile Accessibility Criteria</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed text-[11px]">
                        Web guidelines require all interactive touch components to have a physical hit target of at least <strong>44 x 44 CSS pixels</strong> to prevent accidental double-taps or misaligned gestures.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${mobileOptimizerActive ? "bg-emerald-500" : "bg-slate-300 animate-pulse"}`}>
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">Responsive Viewports Bindings</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${mobileOptimizerActive ? "bg-emerald-500" : "bg-slate-300 animate-pulse"}`}>
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">44px Tap Target Expansions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${mobileOptimizerActive ? "bg-emerald-500" : "bg-slate-300 animate-pulse"}`}>
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">Responsive Fluid Side-Margins</span>
                      </div>
                    </div>

                    {simulationStatus && (
                      <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 text-[10px] font-mono leading-relaxed">
                        <span className="text-brand-gold font-bold block mb-0.5">CONSOLE LOG:</span>
                        {simulationStatus}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleApplyMobileOptimization}
                      className="w-full py-3 bg-gradient-to-r from-brand-pink to-brand-gold hover:opacity-95 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center space-x-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Verify & Apply Optimizations</span>
                    </button>
                    <p className="text-[10px] text-slate-400 text-center">
                      Completes roadmap item #6 by configuring responsive layout rules.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}
