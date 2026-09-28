import React from "react";
import { Check, Sparkles, Star, ThumbsUp, Baby, Laugh, Users, Calendar, ArrowRight } from "lucide-react";
import HeroBanner from "./HeroBanner";
import { VIEW_PATHS } from "../router";

interface WhyChooseUsViewProps {
  onNavigateHome: () => void;
  onNavigate?: (view: any) => void;
}

const REASONS = [
  { icon: Laugh, title: "Real Joy, Zero Pressure", text: "We aren't a stuffy networking club. Expect laughter, games, karaoke, and moments that genuinely lift your spirit." },
  { icon: Baby, title: "Relive Your Girl-Child Memories", text: "From hopscotch to hide-and-seek, we create experiences that take you back to the carefree magic of childhood." },
  { icon: Users, title: "Judgment-Free Sisterhood", text: "Be silly, be bold, be fully yourself. Our community exists so you never need permission to play." },
  { icon: Star, title: "Beautiful Shared Moments", text: "Elegant socials, themed parties, wellness retreats, and gatherings designed to be photographed and remembered." },
  { icon: ThumbsUp, title: "For Every Woman", text: "No athletic ability, corporate title, or prior experience required. If you want to play, you belong here." },
  { icon: Check, title: "A Space That's Truly Yours", text: "A community by women, for women — created to help you reconnect with the carefree version of yourself." }
];

const FOR_WHOM = [
  "Are ready to play, connect and play again",
  "Want to activate their girl-child again and relive those carefree memories",
  "Don’t need permission to be silly, bold and fully themselves",
  "Are tired of networking events that feel like another day at work",
  "Want to laugh until their stomachs hurt- and then laugh some more",
  "Want to feel like a kid again, with the confidence of a grown woman",
  "Would rather collect unforgettable memories than simply attend another event"
];

export default function WhyChooseUsView({ onNavigateHome, onNavigate }: WhyChooseUsViewProps) {
  const handleExploreEvents = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (onNavigate) {
      onNavigate("events");
    } else {
      window.location.href = "/events";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-left" id="why-choose-us-view">
      {/* Hero Banner */}
      <HeroBanner
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Why WomenPlay
          </span>
        }
        title={
          <>
            Why Choose <em className="gold-text-gradient not-italic">WomenPlay?</em>
          </>
        }
        description="Because play is not a luxury—it’s a necessity. Here’s why WomenPlay is creating more ways for women to play, connect and feel alive again."
        onNavigateHome={onNavigateHome}
      />

      <div className="max-w-6xl mx-auto space-y-14 py-12 px-6 md:px-12">

        {/* For Whom Section */}
        <section className="bg-white rounded-3xl border border-slate-100 luxury-shadow p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-8">
            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-dark">PLAY • CONNECT • PLAY AGAIN</span>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900">
              WomenPlay Is for Women <em className="gold-text-gradient not-italic">Who…</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FOR_WHOM.map((line, i) => (
              <div
                key={i}
                className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4 text-left hover:border-brand-pink/30 transition"
              >
                <div className="w-9 h-9 shrink-0 rounded-full bg-brand-pink text-white border border-brand-gold/40 flex items-center justify-center shadow-md shadow-brand-pink/20">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-slate-700 text-sm font-semibold leading-snug">{line}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-slate-700 text-sm sm:text-base mt-8 font-medium">
            If any of these sound like you, WomenPlay was made with you in mind.
          </p>
        </section>

        {/* Reason Cards */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-pink">The Difference</span>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900">Why Women Love WomenPlay</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {REASONS.map((reason, i) => {
              const Icon = reason.icon;
              return (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow hover:border-brand-pink/30 hover:shadow-lg transition duration-300 text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-pink-light/40 border border-brand-pink/10 text-brand-pink flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">{reason.title}</h3>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed">{reason.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pb-6 space-y-4">
          <p className="text-slate-600 text-sm md:text-base font-medium">
            Ready to laugh, play, and connect with women who get it?
          </p>
          <div>
            <a
              href={VIEW_PATHS.events}
              onClick={handleExploreEvents}
              className="inline-flex items-center justify-center gap-2 bg-brand-pink hover:bg-brand-pink-dark text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-brand-pink/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 text-xs sm:text-sm tracking-wider uppercase cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>EXPLORE UPCOMING EXPERIENCES</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

