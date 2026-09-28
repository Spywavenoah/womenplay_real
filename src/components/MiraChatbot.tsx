import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, ChevronRight, Check, Loader2 } from "lucide-react";
import type { NavView } from "./Header";

declare global {
  interface Window {
    MIRA_CONFIG?: {
      aiEndpoint?: string;
      leadEndpoint?: string;
      contactEmail?: string;
      adminNote?: string;
    };
  }
}

// Initialize MIRA_CONFIG globally
if (typeof window !== "undefined") {
  window.MIRA_CONFIG = window.MIRA_CONFIG || {
    aiEndpoint: "/api/mira/chat",
    leadEndpoint: "/api/contact",
    contactEmail: "womenplay.org@gmail.com",
    adminNote: "Connect this prototype to the WomenPlay-owned AI chatbot and CRM accounts before launch."
  };
}

interface Message {
  id: string;
  sender: "mira" | "user";
  text: string;
  isHtml?: boolean;
  showQuickChips?: boolean;
  showLeadForm?: boolean;
  leadKind?: string;
  leadSubmitted?: boolean;
}

interface MiraChatbotProps {
  onNavigate: (view: NavView) => void;
}

const QUICK_OPTIONS = [
  "I want to attend an event",
  "I want to make new friends",
  "I’m new to the WomenPlay community",
  "I want to become a member",
  "I have a question about tickets",
  "I want to partner or sponsor",
  "I’m interested in becoming a vendor",
  "I want to volunteer",
  "What is WomenPlay?",
  "I have another question"
];

function escapeHtml(str: string): string {
  return String(str).replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return map[c] || c;
  });
}

export default function MiraChatbot({ onNavigate }: MiraChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [welcomed, setWelcomed] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  
  // Lead form state per form rendered
  const [leadForms, setLeadForms] = useState<Record<string, {
    firstName: string;
    email: string;
    phone: string;
    interest: string;
    organization: string;
    message: string;
    consent: boolean;
    submitting: boolean;
    submitted: boolean;
    error: string | null;
  }>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 250);
      }
      if (!welcomed) {
        setWelcomed(true);
        const welcomeMsg: Message = {
          id: "msg-welcome",
          sender: "mira",
          text: "Hello and welcome to <strong>WomenPlay!</strong> I’m Mira, your WomenPlay Concierge. I’m here to help you discover our events, community experiences and everything WomenPlay has to offer. What brings you here today?",
          isHtml: true,
          showQuickChips: true
        };
        setMessages([welcomeMsg]);
      }
    }
  }, [isOpen, welcomed]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, leadForms, showAllQuestions]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const siteLink = (id: string, label: string, primary = false) => {
    return `<a class="mira-action${primary ? " primary" : ""}" data-route="${id}" href="#${id}">${label}</a>`;
  };

  const getEventAnswer = () => {
    return `<p>We’d love to have you play with us💕</p>
      <p style="margin-top:8px;">Our first <strong>WomenPlay Launch Experience- Jersey Style</strong> is coming! Expect an unforgettable women-only experience filled with games, laughter, connection and plenty of playful moments.</p>
      <p style="margin-top:8px;">We’re still putting the final details together. Join our update list to be the first to receive the date, venue and ticket information when registration opens.</p>
      <div class="mira-actions" style="margin-top:12px; margin-bottom:10px;">
        <button type="button" class="mira-action primary" data-action="open-update-list">KEEP ME IN THE PLAY</button>
      </div>
      <div style="margin-top:10px; padding-top:8px; border-top:1px dashed #e2e8f0; font-size:12px; color:#475569;">
        <strong>Would you like me to add you to the WomenPlay update list?</strong>
      </div>`;
  };

  const ANSWERS: Record<string, string> = {
    what: `WomenPlay.Org is a women’s lifestyle and experiences community created for connection, joyful play, beautiful gatherings, wellness and shared laughter. Because life is better when… Women can play too! ${siteLink("experiences", "Explore Experiences")}`,
    join: `WomenPlay welcomes women from different backgrounds, walks of life and stages of their journey. Our experiences are created for adult women who want joyful play, connection and memorable moments. ${siteLink("for-women", "See Who It’s For")}`,
    alone: `Absolutely. Many women attend on their own. WomenPlay is designed to feel warm and welcoming, with activities that make it easier to connect naturally—without the pressure of a stuffy networking event.`,
    shy: `Yes. You do not need to be outgoing to enjoy WomenPlay. You can participate at your own pace, and our low-pressure games and shared experiences help conversations happen naturally.`,
    friend: `You may attend with a friend, subject to each guest having a valid registration. Group-ticket details will be shared on the event registration page when available.`,
    tickets: `We’re currently putting the final details together for our upcoming <strong>WomenPlay Launch Experience — Jersey Style</strong>. Ticket tiers and pricing will be announced soon. Join our update list to be the first to receive the date, venue and ticket information when registration opens! 💕
      <div class="mira-actions" style="margin-top:10px;">
        <button type="button" class="mira-action primary" data-action="open-update-list">KEEP ME IN THE PLAY</button>
      </div>`,
    refund: `The official refund and cancellation policy will be published when event registrations open. Please reach out to our team with any specific questions. ${siteLink("contact", "Contact WomenPlay")}`,
    dress: `The Jersey Style dress code includes sports jerseys, biker shorts or leggings, sneakers and team colours. Comfortable flats and clean sneakers fit the playful, active format.`,
    food: `Food and refreshment details will be confirmed with the venue announcement. The event concept includes delicious refreshments and comfort food options.`,
    photo: `Photography and video may be present at WomenPlay experiences, with a clear consent process communicated before the event. Please contact the team if you have a privacy concern. ${siteLink("contact", "Contact the Team")}`,
    parking: `The venue location and parking/transit guidelines will be announced to our update list first.`,
    access: `Accessibility information will be confirmed with the venue details. Please share your specific accessibility question so our team can accommodate you. ${siteLink("contact", "Ask About Accessibility")}`,
    age: `WomenPlay experiences are designed for adult women. The exact minimum age for each event will be stated on its registration page.`,
    founders: `WomenPlay.Org was created by visionary women who believe adulthood should leave plenty of room for laughter, playful movement, and joy. Full founder spotlights will be unveiled as part of our upcoming launch experiences!`,
    member: `The Founding Circle is the best place to begin. Members receive early access to announcements and priority event information. ${siteLink("founding", "Become a Founding Member", true)}`,
    merch: `WomenPlay merchandise details will be announced soon. Please join the update list or Founding Circle for first access. ${siteLink("founding", "Join the Founding Circle")}`,
    contact: `I’d be happy to help you reach the WomenPlay team at womenplay.org@gmail.com. ${siteLink("contact", "Go to Contact", true)}`
  };

  const classifyQuery = (q: string): string => {
    const s = q.toLowerCase();
    if (/keep me in the play|add me to the (womenplay )?update list|join (the )?update list|yes,? (please )?add me/.test(s)) return "update-list";
    if (/attend an event|next event|upcoming event|when is|event date|where is the event|taking place/.test(s)) return "event";
    if (/new to (the )?(womenplay )?community|i[’']?m new to|new to womenplay/.test(s)) return "new-community";
    if (/make new friends|friends|connect with women/.test(s)) return "friends";
    if (/shy|introvert|nervous/.test(s)) return "shy";
    if (/come alone|attend alone|do not know anyone|don't know anyone/.test(s)) return "alone";
    if (/bring a friend|bring friends/.test(s)) return "friend";
    if (/ticket|how much|buy a ticket|registration|register|payment/.test(s)) return "tickets";
    if (/refund|cancel|cancellation/.test(s)) return "refund";
    if (/dress|wear|flats|sneakers|theme/.test(s)) return "dress";
    if (/food|refreshment|meal|drink/.test(s)) return "food";
    if (/photo|video|camera/.test(s)) return "photo";
    if (/parking|transport|bus|transit/.test(s)) return "parking";
    if (/accessib|wheelchair|accommodation/.test(s)) return "access";
    if (/age|how old/.test(s)) return "age";
    if (/founder|uno|matilda/.test(s)) return "founders";
    if (/member|membership|founding circle/.test(s)) return "member";
    if (/sponsor|partner|collaborat/.test(s)) return "partner";
    if (/vendor|business/.test(s)) return "vendor";
    if (/volunteer/.test(s)) return "volunteer";
    if (/merch|shirt|jersey for sale/.test(s)) return "merch";
    if (/contact|email|phone|reach the team/.test(s)) return "contact";
    if (/what is womenplay|mission|vision|about womenplay/.test(s)) return "what";
    if (/who can join|only for women/.test(s)) return "join";
    return "unknown";
  };

  const callProductionAI = async (question: string): Promise<string | null> => {
    const endpoint = window.MIRA_CONFIG?.aiEndpoint;
    if (!endpoint) return null;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, source: "womenplay-v10.5" })
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.answer || null;
    } catch {
      return null;
    }
  };

  const openUpdateListForm = () => {
    const newFormId = "mira-" + Date.now();
    const updateMsg: Message = {
      id: newFormId,
      sender: "mira",
      text: "Wonderful! Please provide your name and email below, and I'll add you directly to the <strong>WomenPlay Update List</strong> for priority notice.",
      isHtml: true,
      showLeadForm: true,
      leadKind: "WomenPlay Update List — Launch Experience"
    };

    setMessages((prev) => [...prev, updateMsg]);
    setLeadForms((prev) => ({
      ...prev,
      [newFormId]: {
        firstName: "",
        email: "",
        phone: "",
        interest: "WomenPlay Update List — Launch Experience",
        organization: "",
        message: "Please add me to the WomenPlay Launch Experience update list to receive the date, venue and ticket information when registration opens.",
        consent: true,
        submitting: false,
        submitted: false,
        error: null
      }
    }));
  };

  const handleUserMessage = async (text: string) => {
    const q = text.trim();
    if (!q) return;

    setShowAllQuestions(false);

    // Keep quick chips active on newest response rather than discarding them forever
    setMessages((prev) =>
      prev.map((m) => ({ ...m, showQuickChips: false }))
    );

    const userMsg: Message = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: q,
      isHtml: false
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    setTimeout(async () => {
      const type = classifyQuery(q);
      let replyMsg: Message | null = null;

      if (type === "update-list") {
        replyMsg = {
          id: "mira-" + Date.now(),
          sender: "mira",
          text: "Wonderful! Please enter your details below and I’ll add you to the WomenPlay update list for priority launch notice.",
          isHtml: false,
          showLeadForm: true,
          leadKind: "WomenPlay Update List — Launch Experience",
          showQuickChips: false
        };
      } else if (type === "event") {
        replyMsg = {
          id: "mira-" + Date.now(),
          sender: "mira",
          text: getEventAnswer(),
          isHtml: true,
          showQuickChips: true
        };
      } else if (type === "new-community") {
        replyMsg = {
          id: "mira-" + Date.now(),
          sender: "mira",
          text: "Welcome to WomenPlay. You don’t need to know anyone before you arrive. Our experiences are designed to make connection feel natural through play, laughter and shared moments. Come as you are, join in and enjoy the experience.",
          isHtml: false,
          showQuickChips: true
        };
      } else if (type === "friends") {
        replyMsg = {
          id: "mira-" + Date.now(),
          sender: "mira",
          text: "WomenPlay is built around genuine connection through shared play and memorable experiences—not forced networking. You can come as you are, meet women naturally and enjoy the moment.",
          isHtml: false,
          showQuickChips: true
        };
      } else if (type === "partner") {
        replyMsg = {
          id: "mira-" + Date.now(),
          sender: "mira",
          text: "Wonderful. Mira can collect a partnership or sponsorship enquiry for the WomenPlay team. I cannot promise an agreement, discount or special arrangement.",
          isHtml: false,
          showLeadForm: true,
          leadKind: "Partnership or sponsorship",
          showQuickChips: true
        };
      } else if (type === "vendor") {
        replyMsg = {
          id: "mira-" + Date.now(),
          sender: "mira",
          text: "Thank you for your interest in becoming a WomenPlay vendor. Please share your business and proposal for the team to review.",
          isHtml: false,
          showLeadForm: true,
          leadKind: "Vendor opportunity",
          showQuickChips: true
        };
      } else if (type === "volunteer") {
        replyMsg = {
          id: "mira-" + Date.now(),
          sender: "mira",
          text: "Thank you for wanting to support WomenPlay. Volunteer opportunities will be announced soon, and I can collect your interest for the team.",
          isHtml: false,
          showLeadForm: true,
          leadKind: "Volunteer opportunity",
          showQuickChips: true
        };
      } else if (ANSWERS[type]) {
        replyMsg = {
          id: "mira-" + Date.now(),
          sender: "mira",
          text: ANSWERS[type],
          isHtml: true,
          showQuickChips: true
        };
      } else {
        // Try production AI
        const aiAnswer = await callProductionAI(q);
        if (aiAnswer) {
          replyMsg = {
            id: "mira-" + Date.now(),
            sender: "mira",
            text: aiAnswer,
            isHtml: false,
            showQuickChips: true
          };
        } else {
          // Fallback lead form
          replyMsg = {
            id: "mira-" + Date.now(),
            sender: "mira",
            text: "I want to make sure you receive the correct information. Please leave your name, email address and question, and a member of the WomenPlay team will get back to you.",
            isHtml: false,
            showLeadForm: true,
            leadKind: "General question",
            showQuickChips: true
          };
        }
      }

      setIsTyping(false);
      if (replyMsg) {
        setMessages((prev) => [...prev, replyMsg!]);
        // Initialize lead form state if present
        if (replyMsg.showLeadForm && replyMsg.leadKind) {
          const formId = replyMsg.id;
          setLeadForms((prev) => ({
            ...prev,
            [formId]: {
              firstName: "",
              email: "",
              phone: "",
              interest: replyMsg.leadKind || "General question",
              organization: "",
              message: replyMsg.leadKind.includes("Update List")
                ? "Please add me to the WomenPlay Launch Experience update list to receive date, venue and tickets when registration opens."
                : "",
              consent: true,
              submitting: false,
              submitted: false,
              error: null
            }
          }));
        }
      }
    }, 450);
  };

  const handleLeadSubmit = async (formId: string, e: React.FormEvent) => {
    e.preventDefault();
    const current = leadForms[formId];
    if (!current) return;
    if (!current.firstName || !current.email) {
      setLeadForms((prev) => ({
        ...prev,
        [formId]: { ...prev[formId], error: "First name and email are required." }
      }));
      return;
    }

    setLeadForms((prev) => ({
      ...prev,
      [formId]: { ...prev[formId], submitting: true, error: null }
    }));

    const leadData = {
      firstName: current.firstName,
      email: current.email,
      phone: current.phone,
      interest: current.interest,
      organization: current.organization,
      message: current.message || "WomenPlay Update List Request",
      consent: current.consent,
      createdAt: new Date().toISOString()
    };

    try {
      const endpoint = window.MIRA_CONFIG?.leadEndpoint || "/api/contact";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData)
      });

      if (!res.ok) throw new Error("Failed to submit lead");

      // Also back up to localStorage
      try {
        const stored = JSON.parse(localStorage.getItem("womenplay_mira_leads") || "[]");
        stored.push(leadData);
        localStorage.setItem("womenplay_mira_leads", JSON.stringify(stored));
      } catch {
        // ignore
      }

      setLeadForms((prev) => ({
        ...prev,
        [formId]: { ...prev[formId], submitting: false, submitted: true }
      }));
    } catch {
      setLeadForms((prev) => ({
        ...prev,
        [formId]: {
          ...prev[formId],
          submitting: false,
          error: "Could not submit right now. Please try again or reach out to womenplay.org@gmail.com."
        }
      }));
    }
  };

  // Handle action link click delegation in HTML messages
  const handleBubbleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Check for direct data-action button clicks (like "KEEP ME IN THE PLAY")
    const actionBtn = target.closest("[data-action]") as HTMLElement | null;
    if (actionBtn) {
      e.preventDefault();
      const action = actionBtn.getAttribute("data-action");
      if (action === "open-update-list" || action === "waitlist") {
        openUpdateListForm();
        return;
      }
    }

    const actionEl = target.closest("a[data-route], a[href^='#']");
    if (actionEl) {
      e.preventDefault();
      const routeAttr = actionEl.getAttribute("data-route");
      const hrefAttr = actionEl.getAttribute("href")?.replace("#", "");
      const targetRoute = routeAttr || hrefAttr || "contact";

      // Map routes to NavView
      let mappedView: NavView = "contact";
      if (targetRoute === "tickets") mappedView = "tickets";
      else if (targetRoute === "event" || targetRoute === "experiences") mappedView = "events";
      else if (targetRoute === "for-women") mappedView = "whychooseus";
      else if (targetRoute === "founders" || targetRoute === "founding") mappedView = "founders";
      else if (targetRoute === "contact") mappedView = "contact";

      onNavigate(mappedView);
    }
  };

  return (
    <>
      {/* FLOATING LAUNCHER BUTTON */}
      <button
        type="button"
        id="miraLauncher"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close WomenPlay Concierge" : "Open WomenPlay Concierge"}
        title={isOpen ? "Close Chat" : "Ask Mira"}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand-pink hover:bg-brand-pink-dark text-white flex items-center justify-center shadow-2xl hover:shadow-brand-pink/50 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer border border-brand-gold/60 group"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white transition-transform duration-200" />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center font-serif font-black text-xl text-white">
            <span>M</span>
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-brand-pink" />
          </div>
        )}
      </button>

      {/* CHAT PANEL */}
      {isOpen && (
        <div
          id="miraPanel"
          aria-hidden={!isOpen}
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[560px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* HEADER */}
          <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-brand-gold/30">
            <div className="flex items-center space-x-3">
              <div className="relative w-9 h-9 rounded-full bg-brand-pink flex items-center justify-center font-serif font-extrabold text-sm text-white shadow-sm border border-brand-gold">
                M
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-extrabold text-xs tracking-wide text-white">Mira</h3>
                  <span className="bg-brand-gold/20 text-brand-gold text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border border-brand-gold/40">Concierge</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">WomenPlay AI Assistant • Online</p>
              </div>
            </div>

            <button
              type="button"
              id="miraClose"
              aria-label="Close Chat"
              title="Close Chat"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MESSAGES AREA */}
          <div
            id="miraMessages"
            className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50"
            onClick={handleBubbleClick}
          >
            {messages.map((m) => (
              <div key={m.id} className={`mira-row ${m.sender === "user" ? "user" : ""}`}>
                {m.sender === "mira" && (
                  <div className="mira-mini-avatar">M</div>
                )}
                
                <div className="space-y-2 max-w-[85%]">
                  <div className="mira-bubble">
                    {m.isHtml ? (
                      <div dangerouslySetInnerHTML={{ __html: m.text }} />
                    ) : (
                      <span>{m.text}</span>
                    )}
                  </div>

                  {/* QUICK OPTIONS CHIPS */}
                  {m.showQuickChips && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10.5px] font-semibold text-slate-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-brand-pink" />
                        <span>Tap a question to explore:</span>
                      </p>
                      <div className="mira-quick">
                        {QUICK_OPTIONS.map((opt, i) => (
                          <button
                            key={i}
                            type="button"
                            className="mira-chip"
                            onClick={() => handleUserMessage(opt)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* INLINE LEAD FORM */}
                  {m.showLeadForm && leadForms[m.id] && (
                    <div className="mira-form">
                      {leadForms[m.id].submitted ? (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs space-y-1.5">
                          <div className="flex items-center space-x-1.5 font-bold text-emerald-900">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>{leadForms[m.id].interest.includes("Update List") ? "You're on the list! 💕" : "Thank you!"}</span>
                          </div>
                          <p className="text-[11px] text-emerald-700 leading-relaxed">
                            {leadForms[m.id].interest.includes("Update List")
                              ? "We’ve added you to the WomenPlay Launch Experience update list. You'll be the very first to receive the date, venue and ticket information when registration opens!"
                              : "Your message has been recorded. A member of the WomenPlay team will follow up using the email address you provided."}
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={(e) => handleLeadSubmit(m.id, e)} className="space-y-2.5">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-100 flex items-center justify-between">
                            <span>{leadForms[m.id].interest.includes("Update List") ? "Join WomenPlay Update List" : "Send Message to WomenPlay"}</span>
                            <span className="text-brand-pink font-semibold text-[9px]">Priority Access</span>
                          </div>

                          {leadForms[m.id].error && (
                            <div className="text-[10px] text-red-600 bg-red-50 p-2 rounded border border-red-100">
                              {leadForms[m.id].error}
                            </div>
                          )}

                          <div className="mira-field">
                            <label>FIRST NAME *</label>
                            <input
                              type="text"
                              required
                              autoComplete="given-name"
                              value={leadForms[m.id].firstName}
                              onChange={(e) =>
                                setLeadForms((prev) => ({
                                  ...prev,
                                  [m.id]: { ...prev[m.id], firstName: e.target.value }
                                }))
                              }
                              placeholder="Your first name"
                            />
                          </div>

                          <div className="mira-field">
                            <label>EMAIL ADDRESS *</label>
                            <input
                              type="email"
                              required
                              autoComplete="email"
                              value={leadForms[m.id].email}
                              onChange={(e) =>
                                setLeadForms((prev) => ({
                                  ...prev,
                                  [m.id]: { ...prev[m.id], email: e.target.value }
                                }))
                              }
                              placeholder="your@email.com"
                            />
                          </div>

                          <div className="mira-field">
                            <label>PHONE NUMBER (OPTIONAL)</label>
                            <input
                              type="tel"
                              autoComplete="tel"
                              value={leadForms[m.id].phone}
                              onChange={(e) =>
                                setLeadForms((prev) => ({
                                  ...prev,
                                  [m.id]: { ...prev[m.id], phone: e.target.value }
                                }))
                              }
                              placeholder="(555) 000-0000"
                            />
                          </div>

                          {!leadForms[m.id].interest.includes("Update List") && (
                            <>
                              <div className="mira-field">
                                <label>AREA OF INTEREST *</label>
                                <select
                                  required
                                  value={leadForms[m.id].interest}
                                  onChange={(e) =>
                                    setLeadForms((prev) => ({
                                      ...prev,
                                      [m.id]: { ...prev[m.id], interest: e.target.value }
                                    }))
                                  }
                                >
                                  <option>{m.leadKind || "General question"}</option>
                                  <option>Event attendance</option>
                                  <option>Membership</option>
                                  <option>Partnership</option>
                                  <option>Sponsorship</option>
                                  <option>Vendor</option>
                                  <option>Volunteer</option>
                                  <option>General question</option>
                                </select>
                              </div>

                              <div className="mira-field">
                                <label>BUSINESS OR ORGANIZATION (IF APPLICABLE)</label>
                                <input
                                  type="text"
                                  value={leadForms[m.id].organization}
                                  onChange={(e) =>
                                    setLeadForms((prev) => ({
                                      ...prev,
                                      [m.id]: { ...prev[m.id], organization: e.target.value }
                                    }))
                                  }
                                  placeholder="Company or group"
                                />
                              </div>

                              <div className="mira-field">
                                <label>YOUR MESSAGE OR PROPOSAL *</label>
                                <textarea
                                  required
                                  rows={2}
                                  value={leadForms[m.id].message}
                                  onChange={(e) =>
                                    setLeadForms((prev) => ({
                                      ...prev,
                                      [m.id]: { ...prev[m.id], message: e.target.value }
                                    }))
                                  }
                                  placeholder="How can we help you?"
                                />
                              </div>
                            </>
                          )}

                          <label className="mira-consent">
                            <input
                              type="checkbox"
                              checked={leadForms[m.id].consent}
                              onChange={(e) =>
                                setLeadForms((prev) => ({
                                  ...prev,
                                  [m.id]: { ...prev[m.id], consent: e.target.checked }
                                }))
                              }
                            />
                            <span>I agree to receive updates about WomenPlay events, experiences and community opportunities.</span>
                          </label>

                          <button
                            type="submit"
                            disabled={leadForms[m.id].submitting}
                            className="mira-submit w-full flex items-center justify-center gap-1.5"
                          >
                            {leadForms[m.id].submitting ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Saving…</span>
                              </>
                            ) : leadForms[m.id].interest.includes("Update List") ? (
                              "KEEP ME IN THE PLAY 💕"
                            ) : (
                              "Send to WomenPlay"
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {isTyping && (
              <div className="mira-row">
                <div className="mira-mini-avatar">M</div>
                <div className="mira-bubble bg-slate-100">
                  <div className="mira-typing">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* PERSISTENT QUESTIONS DRAWER (EXPANDABLE) */}
          {showAllQuestions && (
            <div className="bg-slate-50 border-t border-b border-slate-200/80 p-3 max-h-48 overflow-y-auto space-y-2 shadow-inner animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-pink" />
                  Select Any Question to Ask:
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllQuestions(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                >
                  Close ✕
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_OPTIONS.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    className="mira-chip text-[10.5px] py-1 px-2.5 bg-white hover:bg-brand-pink hover:text-white transition-colors"
                    onClick={() => handleUserMessage(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PERSISTENT QUICK QUESTIONS TOOLBAR */}
          <div className="bg-slate-50/90 border-t border-slate-100 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setShowAllQuestions(!showAllQuestions)}
              className="flex-shrink-0 text-[10px] font-bold bg-brand-pink/10 hover:bg-brand-pink/20 text-brand-pink px-2 py-1 rounded-md border border-brand-pink/30 flex items-center gap-1 cursor-pointer transition-colors"
              title="View all topics"
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>Topics ({QUICK_OPTIONS.length})</span>
            </button>
            <div className="h-4 w-px bg-slate-200 flex-shrink-0" />
            {QUICK_OPTIONS.slice(0, 5).map((opt, i) => (
              <button
                key={i}
                type="button"
                className="flex-shrink-0 text-[10px] font-medium text-slate-600 hover:text-brand-pink bg-white hover:bg-pink-50 border border-slate-200/80 hover:border-brand-pink/40 px-2 py-0.5 rounded-full whitespace-nowrap transition-all cursor-pointer shadow-2xs"
                onClick={() => handleUserMessage(opt)}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* INPUT FOOTER */}
          <div className="p-3 bg-white border-t border-slate-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUserMessage(inputVal);
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                id="miraInput"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask Mira a question or tap a topic above..."
                disabled={isTyping}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
              />
              <button
                type="submit"
                id="miraSend"
                disabled={!inputVal.trim() || isTyping}
                className="bg-brand-pink hover:bg-brand-pink-dark disabled:bg-slate-200 text-white p-2 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
