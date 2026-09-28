import React from "react";
import { HelpCircle, ChevronDown, Mail } from "lucide-react";
import HeroBanner from "./HeroBanner";

interface FaqViewProps {
  onNavigateHome: () => void;
  onOpenContact: () => void;
}

const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: "Do I need to be athletic to attend?", a: "No. WomenPlay is about joy, movement, laughter, and connection. You do not need to be athletic." },
  { q: "What should I wear?", a: "Each WomenPlay experience has its own style and atmosphere. The recommended attire will be shared on the event page and in your confirmation email—from jerseys and sneakers for a Play Day to relaxed-chic looks for social hangouts and destination-ready outfits for getaways. Whatever the experience, come comfortable, confident and ready to play, connect and enjoy every moment." },
  { q: "Is this a women-only event?", a: "Yes, WomenPlay experience is created for women." },
  { q: "Will food be provided?", a: "Light refreshments will be included. Additional food or comfort food vendors may be available for purchase." },
  { q: "Is merchandise included with registration?", a: "No. Exclusive WomenPlay merchandise will be available separately in limited quantities." },
  { q: "Where will WomenPlay experiences take place?", a: "WomenPlay experiences will be hosted at thoughtfully selected venues suited to each event. Venue details will be shared on the relevant event page and with registered guests." },
  { q: "When will registration open?", a: "We are putting the final details together. Join our priority update list to receive the date, venue, and registration opening first." },
  { q: "Is WomenPlay only for professionals?", a: "Not at all. WomenPlay welcomes women from all backgrounds, walks of life, and stages of their journey. Our community is for every woman who loves play and wants to relive her girl-child memories." },
  { q: "Do I need a membership to attend WomenPlay experiences?", a: "No. You do not need to be a member to attend most WomenPlay experiences—tickets may be purchased individually when available. As our community grows, we may introduce optional membership opportunities with special benefits, early access and exclusive invitations. Any membership details will be announced through our official channels." },
  { q: "Will there be membership options in the future?", a: "Yes. We plan to introduce optional membership opportunities as the WomenPlay community grows. These may include benefits such as early access, special invitations and exclusive member experiences. Full details will be shared when membership officially launches." },
  { q: "Will WomenPlay experiences only be held in British Columbia?", a: "WomenPlay.Org is beginning in British Columbia, but our vision extends far beyond one location. As our community grows, we look forward to bringing WomenPlay experiences to more cities and destinations. Each event’s location will be clearly shared on its event page and through our official updates." },
  { q: "Are travel experiences available now?", a: "Travel experiences are currently being developed and will be announced to Founding Circle members first. Join the Founding Circle to be among the first to know." },
  { q: "How do I stay informed?", a: "Join the Founding Circle and subscribe to our newsletter. You'll receive invitations, event announcements, travel updates, and exclusive WomenPlay news as we grow." }
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
