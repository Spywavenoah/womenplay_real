import React from "react";
import { Sparkles, Calendar, ArrowRight, Camera, Heart, Users, Compass, PartyPopper } from "lucide-react";
import HeroBanner from "./HeroBanner";
import { VIEW_PATHS } from "../router";

interface GalleryViewProps {
  onNavigateHome: () => void;
  onNavigate?: (view: any) => void;
}

const GALLERY_CATEGORIES = [
  { id: "ALL", name: "All Moments", icon: Sparkles, desc: "A living collection of genuine WomenPlay memories as they happen." },
  { id: "Play in Action", name: "Play in Action", icon: Heart, desc: "High-energy games, team challenges, tug-of-war, and joyful sports." },
  { id: "Social Spark", name: "Social Spark", icon: Users, desc: "Relaxed hangouts, brunch socials, patio mixers, and deep conversations." },
  { id: "Away We Go", name: "Away We Go", icon: Compass, desc: "Weekend getaways, beach escapes, road trips, and international retreats." },
  { id: "Milestone Magic", name: "Milestone Magic", icon: PartyPopper, desc: "Launch celebrations, founding circle gatherings, and special tributes." }
];

export default function GalleryView({ onNavigateHome, onNavigate }: GalleryViewProps) {
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");

  const handleExploreEvents = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (onNavigate) {
      onNavigate("events");
    } else {
      window.location.href = "/events";
    }
  };

  const currentCategoryInfo = React.useMemo(() => {
    return GALLERY_CATEGORIES.find((c) => c.id === selectedCategory) || GALLERY_CATEGORIES[0];
  }, [selectedCategory]);

  return (
    <div className="bg-[#faf8f5] text-left min-h-screen" id="gallery-view">
      {/* Hero Banner */}
      <HeroBanner
        eyebrow={
          <span className="inline-flex items-center gap-2 tracking-[0.2em]">
            <Camera className="w-4 h-4 text-brand-gold" />
            MOMENTS &amp; MEMORIES
          </span>
        }
        title={
          <>
            The <em className="gold-text-gradient not-italic">WomenPlay Gallery</em>
          </>
        }
        description="Authentic moments captured across WomenPlay experiences — celebration, wellness, connection, and play."
        onNavigateHome={onNavigateHome}
      />

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-12 space-y-10">
        {/* Category Navigation Bar */}
        <div className="flex flex-wrap gap-2 justify-center border-b border-[#ebdcd0] pb-6">
          {GALLERY_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-2 px-5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-brand-pink text-white shadow-md shadow-brand-pink/25 font-bold"
                    : "bg-white border border-slate-200 text-slate-700 hover:border-brand-pink/40 hover:text-brand-pink"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Clean, Premium Coming Soon Section */}
        <section className="bg-white border border-[#f0e8dc] rounded-3xl md:rounded-[32px] p-8 sm:p-12 md:p-16 text-center space-y-8 luxury-shadow relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-brand-pink/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -top-16 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            {/* Category Eyebrow & Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-pink-light/30 border border-brand-pink/20 px-4 py-1.5 rounded-full text-[11px] font-extrabold tracking-[0.18em] uppercase text-brand-pink">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MOMENTS &amp; MEMORIES</span>
            </div>

            {/* Header Titles */}
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-400 font-sans">
                The WomenPlay Gallery
              </p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                The Fun Is Just <span className="text-brand-pink italic">Getting Started…</span>
              </h2>
            </div>

            {/* Category Context (if filtered) */}
            {selectedCategory !== "ALL" && (
              <div className="bg-[#faf8f5] border border-[#ebdcd0] rounded-xl py-2 px-4 inline-block text-xs font-semibold text-brand-gold-dark">
                Viewing: <span className="font-bold text-slate-800">{currentCategoryInfo.name}</span> — {currentCategoryInfo.desc}
              </div>
            )}

            {/* Main Copy */}
            <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
              <p className="font-medium text-slate-700">
                As WomenPlay experiences unfold, this gallery will come alive with moments of play, laughter, connection, celebration and adventure—all created and shared by our community.
              </p>
              <p className="text-slate-500 font-serif italic text-base sm:text-lg text-[#b4804d]">
                Watch this space. The memories are about to begin.
              </p>
              <p className="font-semibold text-slate-800 text-sm sm:text-base">
                You might just be in the next picture.
              </p>
            </div>

            {/* CTA Action Button */}
            <div className="pt-4">
              <a
                href={VIEW_PATHS.events}
                onClick={handleExploreEvents}
                className="inline-flex items-center justify-center gap-2 bg-brand-pink hover:bg-brand-pink-dark text-white font-sans font-bold text-xs sm:text-sm tracking-wider uppercase px-8 py-4 rounded-full shadow-lg shadow-brand-pink/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>EXPLORE UPCOMING EXPERIENCES</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Curated Albums Category Cards */}
          <div className="relative z-10 pt-10 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {GALLERY_CATEGORIES.filter((c) => c.id !== "ALL").map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-2xl p-5 text-left space-y-2.5 transition-all duration-200 cursor-pointer border ${
                      isSelected
                        ? "bg-white border-brand-pink shadow-md"
                        : "bg-[#faf8f5] border-[#f0e8dc] hover:border-brand-pink/30 hover:bg-white"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-brand-pink/10 text-brand-pink flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm font-display text-slate-800">{cat.name}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
