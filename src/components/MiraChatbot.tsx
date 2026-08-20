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
  }, [messages, isTyping, leadForms]);

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
    return `<strong>Our upcoming launch experience is WomenPlay Experience — Jersey Style.</strong>
      <div class="mira-event-card">
        <h4>Jersey Style</h4>
        <p><strong>Date:</strong> Saturday, October 24, 2026</p>
        <p><strong>Schedule:</strong> Afternoon Experience (Exact hours announced closer to launch)</p>
        <p><strong>Location:</strong> Surrey, BC — indoor venue to be confirmed</p>
        <p><strong>Theme:</strong> A high-energy women-only play experience for 100 women</p>
        <p><strong>Ticket prices:</strong> Early Bird $49.99 CAD · Regular $69.99 CAD · Last Call $79.99 CAD</p>
      </div>
      <div class="mira-actions">
        ${siteLink("tickets", "Get Tickets", true)}
        ${siteLink("event", "View Event Details")}
      </div>
      <p style="margin-top:9px">I can also help with dress code, parking, food or accessibility.</p>`;
  };

  const ANSWERS: Record<string, string> = {
    what: `WomenPlay.Org is a women’s lifestyle and experiences community created for connection, joyful play, beautiful gatherings, wellness and shared laughter. Because life is better when… Women can play too! ${siteLink("experiences", "Explore Experiences")}`,
    join: `WomenPlay welcomes women from different backgrounds, walks of life and stages of their journey. Our experiences are created for adult women who want joyful play, connection and memorable moments. ${siteLink("for-women", "See Who It’s For")}`,
    alone: `Absolutely. Many women attend on their own. WomenPlay is designed to feel warm and welcoming, with activities that make it easier to connect naturally—without the pressure of a stuffy networking event.`,
    shy: `Yes. You do not need to be outgoing to enjoy WomenPlay. You can participate at your own pace, and our low-pressure games and shared experiences help conversations happen naturally.`,
    friend: `You may attend with a friend, subject to each guest having a valid registration or ticket. Group-ticket details will be shared on the event registration page when available.`,
    tickets: `Approved ticket prices are Early Bird $49.99 CAD, Regular $69.99 CAD, and Last Call $79.99 CAD. Tickets are capped at 100 women. ${siteLink("tickets", "View Ticket Information", true)}`,
    refund: `The official refund and cancellation policy has not yet been published. Please reach out to our team with any specific questions. ${siteLink("contact", "Contact WomenPlay")}`,
    dress: `The Jersey Style dress code includes sports jerseys, biker shorts or leggings, sneakers and team colours. Comfortable flats and clean sneakers fit the playful, active format. ${siteLink("event", "View Event Details")}`,
    food: `Food and refreshment details have not yet been finalized. The current event concept includes comfort-food vendors, and confirmed information will be posted on the official event page.`,
    photo: `Photography and video may be present at WomenPlay experiences, but the final event policy and consent process will be communicated before the event. Please contact the team if you have a privacy concern. ${siteLink("contact", "Contact the Team")}`,
    parking: `The indoor Surrey venue is still to be confirmed, so parking and transportation details are not yet available. They will be shared once the venue is officially announced.`,
    access: `Accessibility information will be confirmed with the venue details. Please share your specific accessibility question through the contact form so the team can respond accurately.`,
    age: `WomenPlay experiences are designed for adult women. The exact minimum age for each event will be stated on its registration page.`,
    founders: `WomenPlay.Org was created by visionary women who believe adulthood should leave plenty of room for laughter, playful movement, and joy. Full founder spotlights will be unveiled at our official launch on October 24, 2026!`,
    member: `The Founding Circle is the best place to begin. Members receive early access to announcements and priority event information. ${siteLink("founding", "Become a Founding Member", true)}`,
    merch: `WomenPlay merchandise information has not yet been announced. Please join the Founding Circle for approved updates. ${siteLink("founding", "Join the Founding Circle")}`,
    contact: `I’d be happy to help you reach the WomenPlay team at womenplay.org@gmail.com. ${siteLink("contact", "Go to Contact", true)}`
  };

  const classifyQuery = (q: string): string => {
    const s = q.toLowerCase();
    if (/attend an event|next event|upcoming event|when is|event date|where is the event|taking place/.test(s)) return "event";
    if (/make new friends|new to|community/.test(s)) return "friends";
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

  const handleUserMessage = async (text: string) => {
    const q = text.trim();
    if (!q) return;

    // Remove chips from former messages
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

      if (type === "event") {
        replyMsg = {
          id: "mira-" + Date.now(),
          sender: "mira",
          text: getEventAnswer(),
          isHtml: true
        };
      } else if (type === "friends") {
        replyMsg = {
          id: "mira-" + Date.now(),
          sender: "mira",
          text: "WomenPlay is built around genuine connection through shared play and memorable experiences—not forced networking. You can come as you are, meet women naturally and enjoy the moment.",
          isHtml: false
        };
      } else if (type === "partner") {
        replyMsg = {
          id: "mira-" + Date.now(),
          sender: "mira",
          text: "Wonderful. Mira can collect a partnership or sponsorship enquiry for the WomenPlay team. I cannot promise an agreement, discount or special arrangement.",
          isHtml: false,
          showLeadForm: true,
          leadKind: "Partnership or sponsorship"
        };
      } else if (type === "vendor") {
        replyMsg = {
          id: "mira-" + Date.now(),
          sender: "mira",
          text: "Thank you for your interest in becoming a WomenPlay vendor. Please share your business and proposal for the team to review.",
          isHtml: false,
          showLeadForm: true,
          leadKind: "Vendor opportunity"
        };
      } else if (type === "volunteer") {
        replyMsg = {
          id: "mira-" + Date.now(),
          sender: "mira",
          text: "Thank you for wanting to support WomenPlay. Volunteer opportunities have not yet been announced, but I can collect your interest for the team.",
          isHtml: false,
          showLeadForm: true,
          leadKind: "Volunteer opportunity"
        };
      } else if (ANSWERS[type]) {
        replyMsg = {
          id: "mira-" + Date.now(),
          sender: "mira",
          text: ANSWERS[type],
          isHtml: true
        };
      } else {
        // Try production AI
        const aiAnswer = await callProductionAI(q);
        if (aiAnswer) {
          replyMsg = {
            id: "mira-" + Date.now(),
            sender: "mira",
            text: aiAnswer,
            isHtml: false
          };
        } else {
          // Fallback lead form
          replyMsg = {
            id: "mira-" + Date.now(),
            sender: "mira",
            text: "I want to make sure you receive the correct information. Please leave your name, email address and question, and a member of the WomenPlay team will get back to you.",
            isHtml: false,
            showLeadForm: true,
            leadKind: "General question"
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
              message: "",
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
    if (!current.firstName || !current.email || !current.message) {
      setLeadForms((prev) => ({
        ...prev,
        [formId]: { ...prev[formId], error: "First name, email, and message are required." }
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
      message: current.message,
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
          error: "Message could not be sent right now. Please use the website contact section."
        }
      }));
    }
  };

  // Handle action link click delegation in HTML messages
  const handleBubbleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
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
        aria-label="Open WomenPlay Concierge"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gradient-to-r from-brand-pink via-pink-600 to-amber-500 hover:from-brand-pink-dark hover:to-amber-600 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-brand-pink/40 transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/20 group"
      >
        <div className="relative w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-extrabold text-sm border border-white/30">
          <span>M</span>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-brand-pink" />
        </div>
        <div className="flex flex-col text-left pr-1">
          <span className="text-xs font-black tracking-wide leading-tight">Mira Concierge</span>
          <span className="text-[10px] text-amber-100 font-medium opacity-90 group-hover:opacity-100">Ask WomenPlay</span>
        </div>
        <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
      </button>

      {/* CHAT PANEL */}
      {isOpen && (
        <div
          id="miraPanel"
          aria-hidden={!isOpen}
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[560px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* HEADER */}
          <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-amber-500/30">
            <div className="flex items-center space-x-3">
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-brand-pink to-amber-500 flex items-center justify-center font-extrabold text-sm text-white shadow-sm border border-amber-400/40">
                M
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-extrabold text-xs tracking-wide text-white">Mira</h3>
                  <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border border-amber-500/30">Concierge</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">WomenPlay AI Assistant • Online</p>
              </div>
            </div>

            <button
              type="button"
              id="miraClose"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
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
                  )}

                  {/* INLINE LEAD FORM */}
                  {m.showLeadForm && leadForms[m.id] && (
                    <div className="mira-form">
                      {leadForms[m.id].submitted ? (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs space-y-1">
                          <div className="flex items-center space-x-1.5 font-bold text-emerald-900">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>Thank you!</span>
                          </div>
                          <p className="text-[11px] text-emerald-700">
                            Your message has been recorded. A member of the WomenPlay team will follow up using the email address you provided.
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={(e) => handleLeadSubmit(m.id, e)} className="space-y-2">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-100">
                            Send Message to WomenPlay
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
                              placeholder="First name"
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
                            className="mira-submit"
                          >
                            {leadForms[m.id].submitting ? "Sending…" : "Send to WomenPlay"}
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
                placeholder="Ask Mira a question..."
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
