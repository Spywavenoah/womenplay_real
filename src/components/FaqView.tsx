import React from "react";
import { HelpCircle, ChevronDown, Mail } from "lucide-react";
import HeroBanner from "./HeroBanner";

interface FaqViewProps {
  onNavigateHome: () => void;
  onOpenContact: () => void;
}

const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: "Do I need to be athletic to attend?", a: "No. WomenPlay is about joy, movement, laughter, and connection. You do not need to be athletic." },
  { q: "What should I wear?", a: "Jersey Style: sports jersey, biker shorts or leggings, sneakers, and team colours. Come comfortable and photo-ready." },
  { q: "Is this a women-only event?", a: "Yes. This launch experience is created for women." },
  { q: "Will food be provided?", a: "Light refreshments will be included. Additional food or comfort food vendors may be available for purchase." },
  { q: "Is merchandise included in my ticket?", a: "No. Merchandise will be sold separately in limited quantities." },
  { q: "Where is the venue?", a: "The launch will take place in Surrey, BC. The final venue will be announced soon." },
  { q: "Can I get a refund?", a: "Tickets are limited and event costs are committed in advance. The refund policy should be clearly displayed at checkout." },
  { q: "Is WomenPlay only for professionals?", a: "Not at all. WomenPlay welcomes women from all backgrounds, walks of life, and stages of their journey. Our community is for every woman who loves play and wants to relive her girl-child memories." },
  { q: "Do I need to become a member?", a: "Not right now. WomenPlay is currently welcoming women into the Founding Circle during its pre-launch phase — completely free. Membership options will be introduced after launch." },
  { q: "Will events only be in Surrey?", a: "Our initial focus is British Columbia, with plans to expand across BC and beyond over time. Travel and retreat experiences will extend further afield." },
  { q: "Are travel experiences available now?", a: "Travel experiences are currently being developed and will be announced to Founding Circle members first. Join the Founding Circle to be among the first to know." },
  { q: "How do I stay informed?", a: "Join the Founding Circle and subscribe to our newsletter. You'll receive invitations, event announcements, travel updates, and exclusive WomenPlay news as we grow." },
  { q: "Will there be membership options in the future?", a: "Yes. Membership opportunities are being thoughtfully developed and will be announced at a later stage. Founding Circle members will have first access." }
];

export default function FaqView({ onNavigateHome, onOpenContact }: FaqViewProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <div className="min-h-screen bg-slate-50 text-left" id="faq-view">
      {/* Hero Banner */}
      <HeroBanner
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Common Questions
          </span>
        }
        title={
          <>
            Your Questions, <em className="gold-text-gradient not-italic">Answered.</em>
          </>
        }
        description="Everything you need to know about WomenPlay experiences, events, membership, and more."
        onNavigateHome={onNavigateHome}
      />

      <div className="max-w-5xl mx-auto space-y-10 py-12 px-6 md:px-12">

        {/* FAQ Accordion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start" id="faq-accordion">
          {FAQ_ITEMS.map((item, i) => {
            const open = openIndex === i;
            return (
              <div
                key={i}
                className={`bg-white border rounded-2xl luxury-shadow overflow-hidden transition duration-300 ${
                  open ? "border-brand-pink/30" : "border-slate-100 hover:border-brand-pink/20"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
                  id={`faq-item-${i}`}
                >
                  <span className={`text-sm md:text-base font-bold leading-snug ${open ? "text-brand-pink" : "text-slate-800"}`}>
                    {item.q}
                  </span>
                  <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition duration-300 ${
                    open ? "bg-brand-pink text-white rotate-180" : "bg-brand-pink-light text-brand-pink"
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>
                {open && (
                  <div className="px-6 pb-5 -mt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100 luxury-shadow text-center space-y-4">
          <h3 className="text-lg md:text-xl font-display font-extrabold text-slate-900">Have another question?</h3>
          <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
            Our concierge team would be delighted to help you further.
          </p>
          <button
            onClick={onOpenContact}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold shadow-md shadow-brand-pink/20 transition"
            id="btn-faq-contact"
          >
            <Mail className="w-4 h-4" />
            <span>Reach Out to Us Directly</span>
          </button>
        </div>

      </div>
    </div>
  );
}
