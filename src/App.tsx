import React from "react";
import { 
  Award, Check, Ticket, ChevronRight, X, ArrowRight, Loader2, Sparkles, LogIn, Heart,
  QrCode, Camera, Download, ShieldCheck as ShieldIcon, Lock
} from "lucide-react";
import { UserRole } from "./types";
import type { User, EventItem, BlogArticle, SuccessStory, Announcement, Registration, AuditLog, Founder } from "./types";
import { showSuccessAlert, showErrorAlert } from "./lib/swal";
import Header, { NavView } from "./components/Header";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import { pathToView, VIEW_PATHS } from "./router";

// Lazy-load the heavy route components so they only download when needed
const HomeView = React.lazy(() => import("./components/HomeView"));
const Portal = React.lazy(() => import("./components/Portal"));
const AdminDashboard = React.lazy(() => import("./components/AdminDashboard"));
const PrivacyView = React.lazy(() => import("./components/PrivacyView"));
const TermsView = React.lazy(() => import("./components/TermsView"));
const SponsorshipView = React.lazy(() => import("./components/SponsorshipView"));
const FaqView = React.lazy(() => import("./components/FaqView"));
const ProfileView = React.lazy(() => import("./components/ProfileView"));
const GalleryView = React.lazy(() => import("./components/GalleryView"));
const WhyChooseUsView = React.lazy(() => import("./components/WhyChooseUsView"));
const LaunchView = React.lazy(() => import("./components/LaunchView"));
const TicketsView = React.lazy(() => import("./components/TicketsView"));
const FoundersView = React.lazy(() => import("./components/FoundersView"));
const EventsView = React.lazy(() => import("./components/EventsView"));
const ContactView = React.lazy(() => import("./components/ContactView"));
const VolunteerView = React.lazy(() => import("./components/VolunteerView"));
const EventCheckoutModal = React.lazy(() => import("./components/EventCheckoutModal"));
const BadgeScannerModal = React.lazy(() => import("./components/BadgeScannerModal"));
const BusinessCardQRModal = React.lazy(() => import("./components/BusinessCardQRModal"));
const Mandatory2FAModal = React.lazy(() => import("./components/Mandatory2FAModal"));
const ResetPasswordPage = React.lazy(() => import("./components/ResetPassword"));
const VerifyEmailPage = React.lazy(() => import("./components/VerifyEmail"));
const ActivateAccountPage = React.lazy(() => import("./components/ActivateAccount"));

function ViewFallback() {
  return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="w-8 h-8 text-brand-pink animate-spin" />
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = React.useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("aura_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [currentView, setCurrentView] = React.useState<NavView>(() =>
    pathToView(window.location.pathname) || "home"
  );

  // History-API router: changing the URL for each page (back/forward supported)
  const navigate = React.useCallback((view: NavView) => {
    const path = VIEW_PATHS[view];
    if (window.location.pathname !== path) {
      window.history.pushState({ view }, "", path);
    }
    setCurrentView(view);
    window.scrollTo(0, 0);
  }, []);

  // Sync view when the user uses browser back/forward
  React.useEffect(() => {
    const handlePopState = () => {
      const v = pathToView(window.location.pathname);
      if (v) setCurrentView(v);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Per-route SEO: update <title>, meta description and og:title for each view.
  const PAGE_META: Partial<Record<NavView, { title: string; description: string }>> = {
    home: {
      title: "WomenPlay — Platform for High-Impact Women Leaders",
      description: "An executive network and membership platform empowering high-impact women through events, celebration, wellness, travel and community.",
    },
    launch: {
      title: "WomenPlay Launch Experience — Jersey Style",
      description: "A high-energy women-only play experience for 100 women in Surrey, BC. Register for the WomenPlay Launch Experience.",
    },
    tickets: {
      title: "Launch Experience Tickets — WomenPlay",
      description: "Secure your Launch Experience ticket. Early Bird, Regular and Last Call phases. Limited to 100 women.",
    },
    founders: {
      title: "Become a Founding Member — WomenPlay",
      description: "Join the Founding Circle for free during pre-launch: early access to events, exclusive launch updates and more.",
    },
    events: {
      title: "Events — WomenPlay Executive Network",
      description: "Explore luxury summits, curated dinners, pitch sessions, and professional board workshops. Book premium registration badges.",
    },
    contact: {
      title: "Contact Us — WomenPlay Executive Network",
      description: "Get in touch with the WomenPlay executive secretariat. Questions, event ideas, partnerships and membership enquiries welcome.",
    },
    volunteer: {
      title: "Volunteer — WomenPlay Founding Volunteer Program",
      description: "Join the WomenPlay founding volunteer team for the launch experience in Surrey, BC. Apply online to help bring WomenPlay to life.",
    },
    gallery: {
      title: "Gallery — WomenPlay Executive Network",
      description: "Moments from WomenPlay events, celebrations and community experiences.",
    },
    sponsorship: {
      title: "Sponsorship & Partnerships — WomenPlay",
      description: "Partner with WomenPlay to reach high-impact women leaders across Canada.",
    },
    whychooseus: {
      title: "Why Choose WomenPlay",
      description: "Discover the WomenPlay executive network and membership benefits for women leaders.",
    },
    faq: {
      title: "Frequently Asked Questions — WomenPlay",
      description: "Answers to common questions about WomenPlay membership, events and community.",
    },
    privacy: { title: "Privacy Policy — WomenPlay", description: "How WomenPlay handles your data and privacy." },
    terms: { title: "Terms & Conditions — WomenPlay", description: "The terms and conditions governing use of the WomenPlay platform." },
  };

  React.useEffect(() => {
    const meta = PAGE_META[currentView];
    if (!meta) return;
    document.title = meta.title;
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) {
      desc = document.createElement("meta");
      desc.setAttribute("name", "description");
      document.head.appendChild(desc);
    }
    desc.setAttribute("content", meta.description);
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", meta.title);

    // Per-route structured data (JSON-LD) injected as a single managed script.
    const ROUTE_SCHEMA: Partial<Record<NavView, Record<string, unknown>>> = {
      home: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "WomenPlay",
        url: "https://womenplay.org",
      },
      launch: {
        "@context": "https://schema.org",
        "@type": "Event",
        name: "WomenPlay Launch Experience — Jersey Style",
        startDate: "2026-09-19T13:00:00-07:00",
        endDate: "2026-09-19T18:00:00-07:00",
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: { "@type": "Place", name: "Surrey, BC" },
        description: "A high-energy women-only play experience for 100 women, launching the WomenPlay brand.",
        offers: { "@type": "Offer", price: "49.99", priceCurrency: "CAD", url: "https://womenplay.org/tickets" },
      },
      faq: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "What is WomenPlay?", acceptedAnswer: { "@type": "Answer", text: "WomenPlay is an executive network and membership platform for high-impact women leaders." } },
        ],
      },
      events: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "WomenPlay Events",
        description: "Luxury summits, curated dinners, pitch sessions, and professional board workshops for women leaders.",
      },
      contact: {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact WomenPlay",
        description: "Reach the WomenPlay executive secretariat.",
      },
    };
    const schema = ROUTE_SCHEMA[currentView];
    let schemaEl = document.getElementById("seo-jsonld") as HTMLScriptElement | null;
    if (schema) {
      if (!schemaEl) {
        schemaEl = document.createElement("script");
        schemaEl.type = "application/ld+json";
        schemaEl.id = "seo-jsonld";
        document.head.appendChild(schemaEl);
      }
      schemaEl.textContent = JSON.stringify(schema);
    } else if (schemaEl) {
      schemaEl.remove();
    }
  }, [currentView, navigate]);

  // Database lists
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [blogs, setBlogs] = React.useState<BlogArticle[]>([]);
  const [successStories, setSuccessStories] = React.useState<SuccessStory[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [registrations, setRegistrations] = React.useState<Registration[]>([]);
  const [allMembers, setAllMembers] = React.useState<User[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);
  const [founders, setFounders] = React.useState<Founder[]>([]);

  // Modals state
  const [authOpen, setAuthOpen] = React.useState(false);
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [selectedEventCheckout, setSelectedEventCheckout] = React.useState<EventItem | null>(null);
  const [scannerOpen, setScannerOpen] = React.useState(false);
  const [qrModalOpen, setQrModalOpen] = React.useState(false);
  const [qrTargetMember, setQrTargetMember] = React.useState<User | null>(null);

  // Post-Registration Success Modal details
  const [showRegSuccess, setShowRegSuccess] = React.useState(false);
  const [recentRegistration, setRecentRegistration] = React.useState<any>(null);
  const [recentPayment, setRecentPayment] = React.useState<any>(null);

  // Loading indicator
  const [loadingInitial, setLoadingInitial] = React.useState(true);

  // Persistent scan history state for the overlay
  const [scanHistory, setScanHistory] = React.useState<any[]>(() => {
    try {
      const cachedUser = localStorage.getItem("aura_user");
      const u = cachedUser ? JSON.parse(cachedUser) : null;
      const storageKey = u ? `wp-scan-history-${u.id}` : "wp-scan-history-anonymous";
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Handle URL callback parameters (email verification, stripe payment callbacks)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "true") {
      setAuthOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get("stripe_success") === "true") {
      showSuccessAlert("Subscription Active", "Stripe Membership payment completed successfully! Your subscription is now active.");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get("stripe_event_success") === "true") {
      showSuccessAlert("Event Ticket Confirmed", "Stripe Event payment completed successfully! Your ticket badge has been generated.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Sync scan history on event or when currentUser changes
  React.useEffect(() => {
    const handleSyncHistory = () => {
      try {
        const storageKey = currentUser ? `wp-scan-history-${currentUser.id}` : "wp-scan-history-anonymous";
        const saved = localStorage.getItem(storageKey);
        setScanHistory(saved ? JSON.parse(saved) : []);
      } catch (err) {
        console.error("Error syncing scan history:", err);
      }
    };
    
    const handleViewMemberProfile = () => {
      navigate("portal");
    };

    window.addEventListener("scan-history-updated", handleSyncHistory);
    window.addEventListener("contacts-updated", handleSyncHistory);
    window.addEventListener("view-member-profile", handleViewMemberProfile);

    return () => {
      window.removeEventListener("scan-history-updated", handleSyncHistory);
      window.removeEventListener("contacts-updated", handleSyncHistory);
      window.removeEventListener("view-member-profile", handleViewMemberProfile);
    };
  }, [currentUser]);

  const handleDownloadCSV = () => {
    if (scanHistory.length === 0) return;
    
    const headers = ["Full Name", "Email", "Company", "Title", "Scanned At", "Notes"];
    const rows = scanHistory.map(entry => [
      entry.member?.fullName || "",
      entry.member?.email || "",
      entry.member?.company || "",
      entry.member?.title || "",
      entry.scannedAt || "",
      entry.notes || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `WomenPlay_Scan_History_${currentUser?.fullName || "User"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    if (scanHistory.length === 0) return;
    const jsonString = JSON.stringify(scanHistory, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `WomenPlay_Scan_History_${currentUser?.fullName || "User"}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Core Data Fetcher
  const fetchGlobalData = async () => {
    try {
      const evRes = await fetch("/api/events");
      const evData = await evRes.json();
      setEvents(evData);

      const blRes = await fetch("/api/blogs");
      const blData = await blRes.json();
      setBlogs(blData);

      const storRes = await fetch("/api/success-stories");
      const storData = await storRes.json();
      setSuccessStories(storData);

      const annRes = await fetch("/api/announcements");
      const annData = await annRes.json();
      setAnnouncements(annData);

      const foundRes = await fetch("/api/founders");
      if (foundRes.ok) {
        const foundData = await foundRes.json();
        setFounders(foundData);
      }

      // If user logged in, verify session and fetch specific data
      const cachedUser = localStorage.getItem("aura_user");
      const token = localStorage.getItem("wp_token");
      if (cachedUser) {
        const u = JSON.parse(cachedUser);
        
        // Verify session with /api/auth/me
        if (token) {
          const meRes = await fetch("/api/auth/me");
          if (meRes.ok) {
            const meData = await meRes.json();
            setCurrentUser(meData.user);
            localStorage.setItem("aura_user", JSON.stringify(meData.user));
          } else if (meRes.status === 401) {
            // Token is invalid/expired — clear stale session
            localStorage.removeItem("aura_user");
            localStorage.removeItem("wp_token");
            setCurrentUser(null);
            return;
          }
        }

        // Fetch members directory
        const memsRes = await fetch("/api/members");
        if (memsRes.ok) {
          const memsData = await memsRes.json();
          setAllMembers(memsData);

          const refreshed = memsData.find((member: User) => member.id === u.id);
          if (refreshed) {
            setCurrentUser(refreshed);
            localStorage.setItem("aura_user", JSON.stringify(refreshed));
          }
        }

        // Fetch attendee registrations for this user
        const regsRes = await fetch("/api/registrations");
        if (regsRes.ok) {
          const regsData = await regsRes.json();
          setRegistrations(regsData.filter((r: Registration) => r.userId === u.id));
        }

        // Fetch logs if Admin
        if (u.role === UserRole.ADMIN) {
          const logRes = await fetch("/api/reports");
          if (logRes.ok) {
            const logData = await logRes.json();
            setAuditLogs(logData.auditLogs || []);
          }
        }
      }
    } catch (err) {
      console.error("Failed to sync global Aura directories:", err);
    } finally {
      setLoadingInitial(false);
    }
  };

  React.useEffect(() => {
    fetchGlobalData();
  }, []);

  // Handle successful login
  const handleLoginSuccess = (user: User, token?: string) => {
    if (token) localStorage.setItem("wp_token", token);
    localStorage.setItem("aura_user", JSON.stringify(user));
    setCurrentUser(user);
    setAuthOpen(false);
    fetchGlobalData();
    // Redirect to Portal for premium workspace view
    navigate("portal");
  };

  // Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("aura_user");
    localStorage.removeItem("wp_token");
    setRegistrations([]);
    navigate("home");
  };

  // Update Profile
  const handleUpdateProfile = async (profileData: Partial<User>) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/members/${currentUser.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        localStorage.setItem("aura_user", JSON.stringify(data.user));
        fetchGlobalData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Subscribe Membership Tier
  const handleSubscribe = async (tier: any, amount: number, method: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/members/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, tier, amount, method })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
        setCurrentUser(data.user);
        localStorage.setItem("aura_user", JSON.stringify(data.user));
        fetchGlobalData();
      } else {
        showErrorAlert("Subscription Failed", data.error || "Subscription failed");
      }
    } catch (e: any) {
      console.error(e);
      showErrorAlert("Error", e.message || "An error occurred");
    }
  };

  // Register Event checkout click
  const handleRegisterEventTrigger = (eventId: string) => {
    if (!currentUser) {
      setAuthOpen(true);
      return;
    }
    const ev = events.find(e => e.id === eventId);
    if (ev) {
      setSelectedEventCheckout(ev);
      setCheckoutOpen(true);
    }
  };

  // Checkout Success
  const handleCheckoutSuccess = (reg: any, payment: any) => {
    setRecentRegistration(reg);
    setRecentPayment(payment);
    setCheckoutOpen(false);
    setShowRegSuccess(true);
    fetchGlobalData();
  };

  // Add a newly scanned/simulated contact to the current user's contact list in local storage
  const handleAddContact = (contact: User) => {
    if (!currentUser) return;
    try {
      const storageKey = `wp-contacts-${currentUser.id}`;
      const existingRaw = localStorage.getItem(storageKey);
      const existing: User[] = existingRaw ? JSON.parse(existingRaw) : [];
      
      // Check if already in contacts list to prevent duplicates
      if (!existing.some(c => c.id === contact.id)) {
        const updated = [...existing, contact];
        localStorage.setItem(storageKey, JSON.stringify(updated));
        
        // Dispatch custom event so the Portal component can listen and update instantly
        window.dispatchEvent(new Event("contacts-updated"));
      }
    } catch (err) {
      console.error("Failed to add contact:", err);
    }
  };

  // 4 most recent announcements for the header marquee
  const recentAnnouncementTitles = [...announcements]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)
    .map(a => a.title);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans" id="aura-network-root">
      {/* Dynamic Header */}
      <Header
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={navigate}
        onLogout={handleLogout}
        onOpenAuth={() => setAuthOpen(true)}
        announcements={recentAnnouncementTitles}
      />

      {/* Main Screen Router */}
      <main className="flex-1">
        {window.location.pathname.startsWith("/verify-email") ? (
          <React.Suspense fallback={<ViewFallback />}>
            <VerifyEmailPage />
          </React.Suspense>
        ) : window.location.pathname.startsWith("/reset-password") ? (
          <React.Suspense fallback={<ViewFallback />}>
            <ResetPasswordPage />
          </React.Suspense>
        ) : window.location.pathname.startsWith("/activate") ? (
          <React.Suspense fallback={<ViewFallback />}>
            <ActivateAccountPage />
          </React.Suspense>
        ) : loadingInitial ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-brand-pink" />
            <p className="font-display font-bold text-sm tracking-widest text-slate-700">PREPPING EXECUTIVES INTERFACES...</p>
          </div>
        ) : (
          <React.Suspense fallback={<ViewFallback />}>
            {currentView === "home" && (
              <HomeView
                blogs={blogs}
                successStories={successStories}
                onOpenAuth={() => setAuthOpen(true)}
                currentUser={currentUser}
                onNavigate={navigate}
                founders={founders}
              />
            )}

            {currentView === "portal" && currentUser && (
              <Portal
                currentUser={currentUser}
                onUpdateProfile={handleUpdateProfile}
                onSubscribe={handleSubscribe}
                events={events}
                registrations={registrations}
                onRefreshData={fetchGlobalData}
                allMembers={allMembers}
                onOpenScanner={currentUser.role === UserRole.ADMIN ? () => setScannerOpen(true) : undefined}
              />
            )}

            {currentView === "portal" && !currentUser && (
              <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
                <div className="bg-white rounded-3xl border border-slate-100 luxury-shadow p-8 md:p-12 max-w-lg w-full text-center space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-brand-pink/10 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-brand-pink" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900">
                      Executive Portal Access
                    </h1>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Please sign in with your executive credentials or register as a WomenPlay member to access your private member workspace, events, and networking hub.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setAuthOpen(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-pink hover:bg-brand-pink-dark text-white font-bold px-8 py-3.5 rounded-full shadow-md shadow-brand-pink/25 transition hover:-translate-y-0.5 text-sm cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In / Register</span>
                    </button>
                    <button
                      onClick={() => navigate("home")}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-3.5 rounded-full transition text-sm cursor-pointer"
                    >
                      Return Home
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentView === "admin" && currentUser && currentUser.role === UserRole.ADMIN && (
              <AdminDashboard
                currentUser={currentUser}
                onRefreshData={fetchGlobalData}
                events={events}
                members={allMembers}
                auditLogs={auditLogs}
                blogs={blogs}
                announcements={announcements}
              />
            )}

            {currentView === "admin" && (!currentUser || currentUser.role !== UserRole.ADMIN) && (
              <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
                <div className="bg-white rounded-3xl border border-slate-100 luxury-shadow p-8 md:p-12 max-w-lg w-full text-center space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-brand-pink/10 flex items-center justify-center">
                    <ShieldIcon className="w-8 h-8 text-brand-pink" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900">
                      {currentUser ? "Admin Access Required" : "Sign In To Access Admin"}
                    </h1>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {currentUser
                        ? "Your account does not have administrator privileges. Please sign in with an admin account to access the executive control board."
                        : "Please sign in with your executive credentials to access the WomenPlay admin dashboard."}
                    </p>
                  </div>
                  <button
                    onClick={() => setAuthOpen(true)}
                    className="inline-flex items-center gap-2 bg-brand-pink hover:bg-brand-pink-dark text-white font-bold px-8 py-3.5 rounded-full shadow-md shadow-brand-pink/25 transition hover:-translate-y-0.5 text-sm cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{currentUser ? "Switch Admin Account" : "Sign In"}</span>
                  </button>
                  {!currentUser && (
                    <button
                      onClick={() => navigate("home")}
                      className="block mx-auto text-xs font-semibold text-slate-500 hover:text-brand-pink transition"
                    >
                      Return to Home
                    </button>
                  )}
                </div>
              </div>
            )}
            {currentView === "privacy" && (
              <PrivacyView onNavigateHome={() => navigate("home")} />
            )}

            {currentView === "terms" && (
              <TermsView onNavigateHome={() => navigate("home")} />
            )}

            {currentView === "sponsorship" && (
              <SponsorshipView 
                onNavigateHome={() => navigate("home")} 
                onOpenAuth={() => setAuthOpen(true)}
              />
            )}

            {currentView === "faq" && (
              <FaqView
                onNavigateHome={() => navigate("home")}
                onOpenContact={() => navigate("contact")}
              />
            )}

            {currentView === "profile" && (
              <ProfileView onNavigateHome={() => navigate("home")} />
            )}

            {currentView === "gallery" && (
              <GalleryView onNavigateHome={() => navigate("home")} />
            )}

            {currentView === "whychooseus" && (
              <WhyChooseUsView onNavigateHome={() => navigate("home")} />
            )}

            {currentView === "launch" && (
              <LaunchView
                onNavigateHome={() => navigate("home")}
                onNavigateTickets={() => navigate("tickets")}
              />
            )}

            {currentView === "tickets" && (
              <TicketsView onNavigateHome={() => navigate("home")} />
            )}

            {currentView === "founders" && (
              <FoundersView onNavigateHome={() => navigate("home")} />
            )}

            {currentView === "events" && (
              <EventsView
                events={events}
                currentUser={currentUser}
                onOpenAuth={() => setAuthOpen(true)}
                onRegisterEvent={handleRegisterEventTrigger}
                onSelectPackageForCheckout={(event, pkg) => {
                  if (!currentUser) {
                    setAuthOpen(true);
                  } else {
                    setSelectedEventCheckout(event);
                    setCheckoutOpen(true);
                  }
                }}
                onNavigateHome={() => navigate("home")}
              />
            )}

            {currentView === "contact" && (
              <ContactView onNavigateHome={() => navigate("home")} />
            )}

            {currentView === "volunteer" && (
              <VolunteerView onNavigateHome={() => navigate("home")} />
            )}
          </React.Suspense>
        )}
      </main>

      {/* Footer Branding */}
      <Footer onNavigate={navigate} />

      {/* Auth Modal Overlay */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Event Checkout Modal Overlay */}
      {currentUser && (
        <React.Suspense fallback={null}>
          <EventCheckoutModal
            isOpen={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
            event={selectedEventCheckout}
            currentUser={currentUser}
            onSuccess={handleCheckoutSuccess}
          />
        </React.Suspense>
      )}

      {/* SUCCESSFUL REGISTRATION POPUP RECEIPT */}
      {showRegSuccess && recentRegistration && (() => {
        const successEvent = events.find(e => e.id === recentRegistration.eventId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" id="reg-success-overlay">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 luxury-shadow w-full max-w-lg text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-500 mx-auto flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-display font-extrabold text-slate-900">Summit Access Secured!</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Your luxury entry credentials and QR check-in pass are compiled. Please present this code at reception.
                </p>
              </div>

              {/* HIGH-FIDELITY EVENT ENTRY PASS WITH DYNAMIC QR CODE */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-brand-pink text-white rounded-2xl p-5 border border-slate-800 text-left relative overflow-hidden shadow-xl space-y-4">
                {/* Background decorative glowing orb */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-pink/15 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-brand-pink/10 rounded-full blur-2xl pointer-events-none" />

                {/* Pass Header */}
                <div className="flex justify-between items-start pb-3 border-b border-slate-800/60 relative z-10">
                  <div>
                    <span className="text-[8px] uppercase font-bold tracking-widest text-brand-pink">
                      WOMENPLAY NETWORK
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 truncate max-w-[240px] mt-0.5">
                      {successEvent ? successEvent.title : "Summit Access Pass"}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono font-bold uppercase bg-brand-pink/20 text-brand-pink px-2.5 py-0.5 rounded-full border border-brand-pink/30">
                      {recentRegistration.packageName || "VIP Delegate"}
                    </span>
                  </div>
                </div>

                {/* Main Pass Info & QR Code */}
                <div className="flex items-center justify-between gap-4 relative z-10">
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="text-[8px] uppercase text-slate-500 font-bold tracking-wider">OFFICIAL ATTENDEE</p>
                      <p className="text-sm font-bold text-slate-100">{currentUser?.fullName || "Elite Professional"}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{currentUser?.email}</p>
                    </div>

                    <div>
                      <p className="text-[8px] uppercase text-slate-500 font-bold tracking-wider">SEAT / ADMISSION</p>
                      <p className="text-xs font-mono font-bold text-brand-pink flex items-center gap-1">
                        <span>{recentRegistration.seat ? `SEAT ${recentRegistration.seat}` : "GENERAL ADMISSION"}</span>
                      </p>
                      <p className="text-[9px] font-mono text-slate-400 mt-0.5">
                        REG CODE: <span className="text-slate-200">{recentRegistration.badgeCode}</span>
                      </p>
                    </div>
                  </div>

                  {/* QR Code Graphic Frame */}
                  <div className="bg-white p-2.5 rounded-xl flex flex-col items-center justify-center border border-slate-800 shrink-0 shadow-lg relative group">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(recentRegistration.badgeCode)}`}
                      alt="Check-In QR Code"
                      className="w-24 h-24"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 border-2 border-brand-pink/20 rounded-xl pointer-events-none" />
                    <span className="text-[7px] text-slate-400 font-mono font-bold mt-1 uppercase tracking-wider">Fast-Track Entry</span>
                  </div>
                </div>

                {/* Pass Footer */}
                <div className="pt-3 border-t border-slate-800/60 flex justify-between items-center text-[9px] text-slate-400 font-medium relative z-10">
                  <div>
                    <p className="text-slate-400">DATE: <span className="text-slate-200">{successEvent?.date || "Executive Hours"}</span></p>
                    <p className="text-slate-400">TIME: <span className="text-slate-200">{successEvent?.time || "TBD"}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400">VENUE: <span className="text-slate-200">{successEvent?.location || "WomenPlay Hub"}</span></p>
                  </div>
                </div>
              </div>

              {/* Summary / Invoice info (subtle) */}
              {recentPayment && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-left font-mono text-[9px] space-y-1 text-slate-500">
                  <div className="flex justify-between font-bold text-slate-700 border-b pb-1 uppercase">
                    <span>Invoice Summary</span>
                    <span>No. {recentPayment.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="text-slate-700 font-medium">{recentPayment.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Verified:</span>
                    <span className="text-slate-700 font-medium">${recentPayment.amount} USD</span>
                  </div>
                </div>
              )}

              {/* Scan Badge Button (Admin Only) */}
              {currentUser.role === UserRole.ADMIN && (
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  id="btn-scan-badge"
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow hover:shadow-md cursor-pointer border border-slate-800"
                >
                  <Camera className="w-4 h-4 text-brand-pink" />
                  <span>Scan Fellow Member's Badge</span>
                </button>
              )}

              {/* Scan History list inside #reg-success-overlay (Admin Only) */}
              {currentUser.role === UserRole.ADMIN && scanHistory.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-2.5 max-h-48 overflow-y-auto text-left" id="overlay-scan-history">
                  <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recently Scanned Members ({scanHistory.length})</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleDownloadCSV}
                        id="btn-download-history-csv"
                        className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition rounded-lg text-[9px] font-bold cursor-pointer"
                        title="Export as CSV"
                      >
                        <Download className="w-3 h-3 text-brand-pink" />
                        <span>CSV</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadJSON}
                        id="btn-download-history-json"
                        className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition rounded-lg text-[9px] font-bold cursor-pointer"
                        title="Export as JSON"
                      >
                        <Download className="w-3 h-3 text-brand-pink" />
                        <span>JSON</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {scanHistory.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-150 shadow-xs text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center text-brand-pink font-bold text-xs uppercase shrink-0 overflow-hidden">
                            {entry.member.avatarUrl ? (
                              <img src={entry.member.avatarUrl} alt={entry.member.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              entry.member.fullName.substring(0, 2)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">{entry.member.fullName}</p>
                            <p className="text-[9px] text-slate-400 truncate">{entry.member.title || "Elite Professional"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setQrTargetMember(entry.member);
                              setQrModalOpen(true);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-brand-pink/10 hover:text-brand-pink text-slate-600 transition rounded-lg cursor-pointer"
                            title="Generate Business Card QR"
                            id={`btn-qr-entry-${entry.member.id}`}
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              // Dispatch view member profile event
                              const event = new CustomEvent("view-member-profile", {
                                detail: { member: entry.member }
                              });
                              window.dispatchEvent(event);
                              // Close this registration receipt overlay
                              setShowRegSuccess(false);
                            }}
                            className="px-2.5 py-1 bg-brand-pink/10 hover:bg-brand-pink text-brand-pink hover:text-white transition rounded-lg text-[10px] font-bold shrink-0 cursor-pointer"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegSuccess(false);
                    navigate("portal");
                  }}
                  id="btn-goto-portal-passes"
                  className="flex-1 py-2.5 px-4 bg-brand-pink hover:bg-brand-pink/90 text-white text-xs font-bold rounded-xl transition shadow-sm hover:shadow cursor-pointer"
                >
                  Go to My Passes
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegSuccess(false)}
                  id="btn-close-success"
                  className="flex-1 py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* BADGE SCANNER MODAL (Admin Only) */}
      {currentUser && currentUser.role === UserRole.ADMIN && (
        <React.Suspense fallback={null}>
          <BadgeScannerModal
            isOpen={scannerOpen}
            onClose={() => setScannerOpen(false)}
            currentUser={currentUser}
            allMembers={allMembers}
            onAddContact={handleAddContact}
          />
        </React.Suspense>
      )}

      {/* BUSINESS CARD QR MODAL */}
      <React.Suspense fallback={null}>
        <BusinessCardQRModal
          isOpen={qrModalOpen}
          onClose={() => {
            setQrModalOpen(false);
            setQrTargetMember(null);
          }}
          scannedMember={qrTargetMember}
          currentUser={currentUser}
        />
      </React.Suspense>

      {/* MANDATORY 2FA ENFORCEMENT MODAL */}
      {currentUser && currentUser.twoFactorEnabled !== true && (
        <React.Suspense fallback={null}>
          <Mandatory2FAModal
            currentUser={currentUser}
            onUpdateCurrentUser={(updatedUser) => {
              setCurrentUser(updatedUser);
              localStorage.setItem("aura_user", JSON.stringify(updatedUser));
            }}
          />
        </React.Suspense>
      )}
    </div>
  );
}
