import React, { useState } from "react";
import { Search, Sparkles, ArrowRight, CheckCircle2, X, Quote, Gamepad2, Users, Heart } from "lucide-react";
import type { EventItem, EventPackage, User } from "../types";
import { WomensEscapesSection } from "./WomensEscapesSection";

interface EventsViewProps {
  events?: EventItem[];
  currentUser?: User | null;
  onOpenAuth?: () => void;
  onRegisterEvent?: (eventId: string) => void;
  onSelectPackageForCheckout?: (event: EventItem, pkg: EventPackage) => void;
  onNavigateHome: () => void;
  onNavigateFounders?: () => void;
  onNavigateTickets?: () => void;
}

type FilterCategory = "all" | "play_days" | "social_hangouts" | "getaways_travel" | "special_experiences";

export default function EventsView({
  currentUser = null,
  onOpenAuth = () => {},
  onRegisterEvent = () => {},
  onSelectPackageForCheckout,
  onNavigateHome,
  onNavigateFounders,
  onNavigateTickets
}: EventsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [updatesModalOpen, setUpdatesModalOpen] = useState(false);
  const [updatesEmail, setUpdatesEmail] = useState("");
  const [updatesSubmitted, setUpdatesSubmitted] = useState(false);
  const [comingSoonModal, setComingSoonModal] = useState<{ title: string; desc: string } | null>(null);

  const handleUpdatesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatesEmail) return;
    setUpdatesSubmitted(true);
    setTimeout(() => {
      setUpdatesSubmitted(false);
      setUpdatesModalOpen(false);
      setUpdatesEmail("");
    }, 2500);
  };

  const handleExploreLaunch = () => {
    if (onNavigateTickets) {
      onNavigateTickets();
    } else if (onRegisterEvent) {
      onRegisterEvent("launch-2026");
    }
  };

  const handleJoinFoundingCircle = () => {
    if (onNavigateFounders) {
      onNavigateFounders();
    } else {
      window.location.href = "#founders";
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-left text-slate-800 selection:bg-[#b04a68]/20 selection:text-[#b04a68]" id="womenplay-events-page">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 px-6 md:px-12 lg:px-16 max-w-5xl mx-auto text-center">
        
        {/* Soft decorative background circles and minimalist curves */}
        <div className="absolute -top-12 -left-12 w-80 h-80 rounded-full bg-pink-100/40 blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-10 -right-12 w-80 h-80 rounded-full bg-amber-100/50 blur-3xl pointer-events-none -z-10" />

        {/* Minimalist Line-Art Woman Profile Sketch & Fluid Arcs matching mockup */}
        <div className="absolute left-0 top-2 sm:left-4 md:left-8 w-48 sm:w-64 md:w-80 h-72 md:h-96 pointer-events-none opacity-25 -z-10 select-none">
          <svg viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full stroke-[#b04a68]">
            <path
              d="M120 40 C 90 60, 60 110, 60 160 C 60 190, 75 220, 85 240 C 88 246, 85 255, 78 260 C 65 270, 70 290, 85 295 C 92 297, 98 305, 95 315 C 90 330, 105 345, 120 348 C 145 352, 170 375, 185 400"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Hair flow curves */}
            <path
              d="M110 45 C 160 40, 220 70, 240 130 C 255 175, 250 240, 260 300 C 265 330, 275 360, 290 390"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M135 60 C 180 80, 210 130, 215 190 C 220 250, 225 310, 240 370"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            {/* Eyelash & brow soft line */}
            <path
              d="M82 170 Q 95 165 105 172"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M80 185 Q 92 182 98 188"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Lips accent */}
            <path
              d="M74 265 Q 85 264 92 268"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Top Right Decorative Fluid Circle & Arc */}
        <div className="absolute right-2 top-0 sm:right-6 md:right-12 w-48 sm:w-64 h-64 pointer-events-none opacity-30 -z-10 select-none">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="140" cy="60" r="50" fill="#fbcfe8" fillOpacity="0.4" />
            <path
              d="M20 180 C 60 120, 120 60, 190 40"
              stroke="#b4804d"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M50 190 C 90 140, 140 90, 200 70"
              stroke="#b04a68"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          </svg>
        </div>

        {/* Top Eyebrow */}
        <div className="text-[11px] md:text-xs font-semibold tracking-[0.24em] text-[#b04a68] uppercase font-sans mb-4">
          WOMENPLAY EXPERIENCES
        </div>

        {/* Main Display Heading */}
        <h1 className="font-serif text-[#261f22] font-semibold text-4xl sm:text-5xl md:text-6xl lg:text-[68px] leading-[1.08] tracking-tight">
          Come <span className="italic text-[#b4804d] font-serif font-normal">Play</span><br />
          With Us
        </h1>

        {/* Description Paragraph */}
        <p className="mt-6 max-w-xl mx-auto text-xs sm:text-sm md:text-[15px] text-slate-700 leading-relaxed font-sans">
          Explore playful gatherings, social hangouts, travel experiences and unforgettable moments created for women to step away from the everyday, reconnect with themselves and simply have fun.
        </p>

        {/* Tagline Accent */}
        <p className="mt-4 font-serif italic text-xl sm:text-2xl text-[#b04a68] tracking-wide">
          Play. Connect. Play Again!
        </p>

      </section>

      {/* 2. EXPLORE EXPERIENCES SECTION (HEADER, SEARCH, FILTER PILLS) */}
      <section className="py-8 md:py-12 px-6 md:px-12 lg:px-16 max-w-6xl mx-auto space-y-6">
        
        {/* Section Header with 2 columns */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-1">
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#b04a68] uppercase font-sans">
              EXPLORE EXPERIENCES
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-[34px] text-[#261f22] font-semibold leading-tight">
              Find Your Next <br className="hidden sm:inline" />
              <span className="italic text-[#b04a68]">WomenPlay</span> <span className="text-[#b4804d]">Experience</span>
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md md:text-right leading-relaxed font-sans">
            From game days and relaxed hangouts to getaways and special experiences—there is always another reason to play.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search experiences, activities or themes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-full pl-11 pr-5 py-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#b04a68] focus:ring-1 focus:ring-[#b04a68] shadow-xs transition"
          />
        </div>

        {/* Filter Tabs / Pills */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition cursor-pointer ${
              activeFilter === "all"
                ? "bg-[#b04a68] text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:border-[#b04a68] hover:text-[#b04a68]"
            }`}
          >
            All Experiences
          </button>

          <button
            onClick={() => setActiveFilter("play_days")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition cursor-pointer ${
              activeFilter === "play_days"
                ? "bg-[#b04a68] text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:border-[#b04a68] hover:text-[#b04a68]"
            }`}
          >
            Play Days
          </button>

          <button
            onClick={() => setActiveFilter("social_hangouts")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition cursor-pointer ${
              activeFilter === "social_hangouts"
                ? "bg-[#b04a68] text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:border-[#b04a68] hover:text-[#b04a68]"
            }`}
          >
            Social Hangouts
          </button>

          <button
            onClick={() => setActiveFilter("getaways_travel")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition cursor-pointer ${
              activeFilter === "getaways_travel"
                ? "bg-[#b04a68] text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:border-[#b04a68] hover:text-[#b04a68]"
            }`}
          >
            Getaways &amp; Travel
          </button>

          <button
            onClick={() => setActiveFilter("special_experiences")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition cursor-pointer ${
              activeFilter === "special_experiences"
                ? "bg-[#b04a68] text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:border-[#b04a68] hover:text-[#b04a68]"
            }`}
          >
            Special Experiences
          </button>
        </div>

      </section>
      

      {/* 3. WOMENPLAY.ORG LAUNCH EXPERIENCE (EXACT MATCH TO DESIGN) */}
      {(activeFilter === "all" || activeFilter === "play_days") && (
        <section className="py-8 sm:py-12 px-4 sm:px-8 lg:px-12 max-w-12xl mx-auto">
            
            {/* Top Banner: Split Image + Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch bg-[#fcf5f1]">
              
              {/* Left Column: Image (Exact photo: women in pink & black jerseys playing Giant Jenga) */}
              <div className="lg:col-span-7 relative overflow-hidden min-h-[340px] sm:min-h-[420px] lg:min-h-[500px]">
                <img
                  src="/assets/images/event_4.jpeg"
                  alt="Women in pink and black jerseys laughing and playing giant wooden block tower jenga"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/assets/images/events_launch_hero.jpg";
                  }}
                  className="w-full h-full object-cover object-left sm:object-center transform hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
                {/* Soft gradient blend into the blush background on right */}
                <div className="hidden lg:block absolute inset-y-0 right-0 w-28 sm:w-36 bg-gradient-to-r from-transparent via-[#fcf5f1]/70 to-[#fcf5f1] pointer-events-none" />
                <div className="lg:hidden absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#fcf5f1] to-transparent pointer-events-none" />
              </div>

              {/* Right Column: Hero Copy */}
              <div className="lg:col-span-5 relative p-7 sm:p-10 lg:p-11 xl:p-12 flex flex-col justify-center bg-[#fcf5f1]">
                
                {/* Decorative top-right watercolor brush effect */}
               

                <div className="relative z-10 space-y-5 sm:space-y-6">
                  
                  {/* Eyebrow */}
                  <div className="text-[#6c5952] text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase">
                    A WOMENPLAY EXPERIENCE.
                  </div>

                  {/* Headline */}
                  <h3 className="font-serif text-3xl sm:text-4xl lg:text-[40px] xl:text-[44px] text-[#221a1d] font-bold leading-[1.12] tracking-tight">
                    Play. Connect. <span className="italic font-serif font-normal text-[#a6425a]">Play Again.</span>
                  </h3>

                  {/* Value Prop 1 */}
                  <div className="space-y-1">
                    <h4 className="font-serif text-lg sm:text-[20px] font-bold text-[#221a1d] tracking-tight leading-snug">
                      100 women. One playground.
                    </h4>
                    <p className="text-[#594d48] text-xs sm:text-[14.5px] leading-relaxed">
                      A one-of-a-kind day of games, laughter, connection and unforgettable experiences.
                    </p>
                  </div>

                  {/* Value Prop 2 */}
                  <div className="space-y-1 pt-1">
                    <h4 className="font-serif text-lg sm:text-[20px] font-bold text-[#221a1d] tracking-tight leading-snug">
                      Put on your sneakers and jerseys.
                    </h4>
                    <p className="text-[#594d48] text-xs sm:text-[14.5px] leading-relaxed">
                      Activate your girl-child again and simply PLAY.
                    </p>
                  </div>

                  {/* CTA & Handwritten Signature */}
                  <div className="pt-3 flex flex-wrap items-center gap-4 sm:gap-6">
                    <button
                      onClick={() => setUpdatesModalOpen(true)}
                      className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#9f455c] hover:bg-[#88364b] text-white text-xs sm:text-sm font-medium tracking-wide shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                    >
                      <span>More Details Coming Soon</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>

                    {/* Handwritten Script: Good Women Brighter Days ♡ */}
                    <div className="flex items-center gap-1.5 select-none pt-1">
                      <div className="font-script text-[#9f455c] text-xl sm:text-2xl font-bold leading-[1.05] text-right transform -rotate-3">
                        <div>Good Women</div>
                        <div>Brighter Days</div>
                      </div>
                      <span className="font-script text-[#9f455c] text-2xl sm:text-3xl font-bold leading-none self-end pb-0.5">
                        ♡
                      </span>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* Middle Bar: 4 Highlight Categories */}
            <div className="bg-white border-t border-[#ebdcd5] px-6 sm:px-10 py-6 sm:py-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0">
                
                {/* 1. FUN GAMES */}
                <div className="flex items-center gap-4 lg:pr-5 lg:border-r lg:border-[#eddcd5]">
                  <div className="w-12 h-12 rounded-full bg-[#fae8e6] text-[#a8445f] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(168,68,95,0.08)]">
                    <Gamepad2 className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <div>
                    <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#a8445f]">
                      FUN GAMES
                    </div>
                    <div className="text-xs sm:text-[13px] text-[#5e534f] mt-0.5">
                      Play without limits
                    </div>
                  </div>
                </div>

                {/* 2. REAL CONNECTIONS */}
                <div className="flex items-center gap-4 lg:px-5 lg:border-r lg:border-[#eddcd5]">
                  <div className="w-12 h-12 rounded-full bg-[#fae8e6] text-[#a8445f] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(168,68,95,0.08)]">
                    <Users className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <div>
                    <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#a8445f]">
                      REAL CONNECTIONS
                    </div>
                    <div className="text-xs sm:text-[13px] text-[#5e534f] mt-0.5">
                      Meet amazing women
                    </div>
                  </div>
                </div>

                {/* 3. GREAT VIBES */}
                <div className="flex items-center gap-4 lg:px-5 lg:border-r lg:border-[#eddcd5]">
                  <div className="w-12 h-12 rounded-full bg-[#fae8e6] text-[#a8445f] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(168,68,95,0.08)]">
                    <Heart className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <div>
                    <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#a8445f]">
                      GREAT VIBES
                    </div>
                    <div className="text-xs sm:text-[13px] text-[#5e534f] mt-0.5">
                      Laughter, joy, belonging
                    </div>
                  </div>
                </div>

                {/* 4. LASTING MEMORIES */}
                <div className="flex items-center gap-4 lg:pl-5">
                  <div className="w-12 h-12 rounded-full bg-[#fae8e6] text-[#a8445f] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(168,68,95,0.08)]">
                    <Sparkles className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <div>
                    <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#a8445f]">
                      LASTING MEMORIES
                    </div>
                    <div className="text-xs sm:text-[13px] text-[#5e534f] mt-0.5">
                      Experiences that stay with you
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Tagline Ribbon */}
            <div className="bg-[#fbf4ef] border-t border-[#ebdcd5] px-6 sm:px-10 py-4 sm:py-4.5 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
              
              {/* Brand Domain */}
              <span className="text-[#a8445f] font-semibold tracking-[0.22em] text-xs sm:text-[13px] uppercase select-none">
                WOMENPLAY.ORG
              </span>

              {/* Dividing Hairline 1 */}
              <div className="hidden md:block flex-1 h-[1px] bg-[#dfcbc1]/70 mx-4 max-w-[120px] lg:max-w-[160px]" />

              {/* Tagline */}
              <span className="text-[#6d5c56] text-[10.5px] sm:text-[11.5px] tracking-[0.16em] uppercase font-medium text-center select-none">
                ONE WOMAN. EVERY WOMAN. ENDLESS PLAY-BILITIES.
              </span>

              {/* Dividing Hairline 2 */}
              <div className="hidden md:block flex-1 h-[1px] bg-[#dfcbc1]/70 mx-4 max-w-[120px] lg:max-w-[160px]" />

              {/* Handwritten Farewell */}
              <div className="flex items-center gap-1.5 text-[#a8445f] font-script text-xl sm:text-2xl font-bold whitespace-nowrap select-none">
                <span>See you at the playground!</span>
                <span className="text-[#a8445f] text-base leading-none">♥</span>
              </div>

            </div>

        </section>
      )}

      {/* 4. MORE WAYS TO PLAY (EXACT DESIGN MATCHING SPEC) */}
      {(activeFilter === "all" ||
        activeFilter === "social_hangouts" ||
        activeFilter === "getaways_travel" ||
        activeFilter === "special_experiences") && (
        <section className="relative isolate py-12 md:py-20 px-6 md:px-12 lg:px-16 max-w-6xl mx-auto space-y-10">
          
          {/* Soft botanical leaf shadows in background matching attached design */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10">
            {/* Top Left Botanical Shadow */}
            <svg 
              className="absolute -top-12 -left-12 w-80 md:w-96 h-80 md:h-96 opacity-[0.14] blur-[2px] text-[#4a3a30]" 
              viewBox="0 0 400 400" 
              fill="currentColor"
            >
              <path d="M-40,-40 C40,20 120,100 180,220 C140,170 100,130 50,100 C150,150 220,230 260,330 C210,270 170,210 110,170 C210,210 270,290 310,390 C260,320 200,250 150,210 Z" />
              <ellipse cx="60" cy="90" rx="90" ry="35" transform="rotate(-30 60 90)" />
              <ellipse cx="140" cy="160" rx="100" ry="32" transform="rotate(-25 140 160)" />
              <ellipse cx="210" cy="230" rx="90" ry="28" transform="rotate(-20 210 230)" />
              <ellipse cx="90" cy="190" rx="75" ry="26" transform="rotate(-45 90 190)" />
            </svg>

            {/* Bottom Left Leaf Shadow */}
            <svg 
              className="absolute -bottom-16 -left-10 w-72 md:w-88 h-72 md:h-88 opacity-[0.12] blur-[2px] text-[#4a3a30]" 
              viewBox="0 0 400 400" 
              fill="currentColor"
            >
              <path d="M-20,420 C50,340 110,270 190,190 C140,230 90,280 30,330 C140,250 210,170 280,90 C220,160 160,230 100,290 Z" />
              <ellipse cx="90" cy="310" rx="80" ry="30" transform="rotate(35 90 310)" />
              <ellipse cx="160" cy="240" rx="90" ry="28" transform="rotate(30 160 240)" />
            </svg>

            {/* Bottom Right Palm Leaf Shadow */}
            <svg 
              className="absolute -bottom-20 -right-16 w-80 md:w-96 h-80 md:h-96 opacity-[0.13] blur-[2px] text-[#4a3a30]" 
              viewBox="0 0 400 400" 
              fill="currentColor"
            >
              <path d="M420,420 C340,340 260,250 180,150 C230,200 270,250 320,290 C200,210 140,130 90,30 C150,110 210,180 270,240 Z" />
              <ellipse cx="320" cy="310" rx="95" ry="35" transform="rotate(-35 320 310)" />
              <ellipse cx="240" cy="230" rx="90" ry="30" transform="rotate(-30 240 230)" />
              <ellipse cx="160" cy="160" rx="80" ry="25" transform="rotate(-25 160 160)" />
            </svg>
          </div>

          {/* Section Heading with subtle flanking divider lines matching design */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 my-2 select-none">
            <div className="h-[1px] w-10 sm:w-16 md:w-24 bg-[#cfbead]/80" />
            <h2 className="font-serif text-3xl sm:text-4xl md:text-[42px] text-center text-[#241f20] font-normal tracking-tight">
              More Ways to <span className="italic text-[#a96858] font-serif">Play</span>
            </h2>
            <div className="h-[1px] w-10 sm:w-16 md:w-24 bg-[#cfbead]/80" />
          </div>

          {/* Cards Grid */}
          <div className={`grid grid-cols-1 gap-6 lg:gap-8 ${
            activeFilter === "all" ? "md:grid-cols-3" : "max-w-md mx-auto"
          }`}>
            
            {/* Card 1: Social Hangouts */}
            {(activeFilter === "all" || activeFilter === "social_hangouts") && (
              <div 
                onClick={() => setComingSoonModal({
                  title: "Social Hangouts",
                  desc: "Relaxed gatherings, great vibes and real connections. We are curating monthly brunch dates, wine evenings, and picnic game days."
                })}
                className="bg-white rounded-[26px] sm:rounded-[28px] p-3.5 sm:p-4 shadow-[0_4px_25px_rgba(40,30,20,0.035)] border border-[#ede3d8]/70 transition-all duration-300 hover:shadow-[0_16px_36px_rgba(40,30,20,0.07)] hover:-translate-y-1 group flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Image Container with Inset Radius */}
                  <div className="relative rounded-[18px] sm:rounded-[20px] overflow-hidden aspect-[4/3.1] bg-[#f5efe8]">
                    <img
                      src="/assets/images/event_2.jpeg"
                      alt="Social Hangouts - Women laughing and dining outdoors"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/roop.jpeg";
                      }}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                    <span className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 bg-white/80 backdrop-blur-md text-[#6c5548] text-[11px] sm:text-xs font-normal tracking-wide px-3.5 py-1 sm:py-1.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-white/60 select-none">
                      Coming Soon
                    </span>
                  </div>

                  {/* Card Copy */}
                  <div className="text-center pt-6 sm:pt-7 pb-6 px-4 sm:px-6">
                    <h3 className="font-serif text-2xl sm:text-[26px] font-normal text-[#241f20] tracking-tight leading-snug">
                      Social Hangouts
                    </h3>
                    <p className="text-[#5d5653] text-[13.5px] sm:text-[14.5px] font-normal leading-relaxed mt-2.5 max-w-[270px] mx-auto">
                      Relaxed gatherings, great vibes and real connections.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Card 2: Getaways & Travel (Exact white yacht party image) */}
            {(activeFilter === "all" || activeFilter === "getaways_travel") && (
              <div 
                onClick={() => {
                  setComingSoonModal({
                    title: "Getaways & Travel",
                    desc: "Escape, explore and experience more together. Curated escapes and future retreats designed for women to explore, unwind, and bond in breathtaking locations."
                  });
                }}
                className="bg-white rounded-[26px] sm:rounded-[28px] p-3.5 sm:p-4 shadow-[0_4px_25px_rgba(40,30,20,0.035)] border border-[#ede3d8]/70 transition-all duration-300 hover:shadow-[0_16px_36px_rgba(40,30,20,0.07)] hover:-translate-y-1 group flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Image Container with Inset Radius */}
                  <div className="relative rounded-[18px] sm:rounded-[20px] overflow-hidden aspect-[4/3.1] bg-[#f5efe8]">
                    <img
                      src="/assets/images/event_3.jpeg"
                      alt="Getaways & Travel - Women in white dresses celebrating on yacht at sunset"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/bali.webp";
                      }}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                    <span className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 bg-white/80 backdrop-blur-md text-[#6c5548] text-[11px] sm:text-xs font-normal tracking-wide px-3.5 py-1 sm:py-1.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-white/60 select-none">
                      Coming Soon
                    </span>
                  </div>

                  {/* Card Copy */}
                  <div className="text-center pt-6 sm:pt-7 pb-6 px-4 sm:px-6">
                    <h3 className="font-serif text-2xl sm:text-[26px] font-normal text-[#241f20] tracking-tight leading-snug">
                      Getaways &amp; Travel
                    </h3>
                    <p className="text-[#5d5653] text-[13.5px] sm:text-[14.5px] font-normal leading-relaxed mt-2.5 max-w-[270px] mx-auto">
                      Escape, explore and experience more together.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Card 3: Special Experiences */}
            {(activeFilter === "all" || activeFilter === "special_experiences") && (
              <div 
                onClick={() => setComingSoonModal({
                  title: "Special Experiences",
                  desc: "Unique moments that celebrate us in unforgettable ways. Gala evenings, holiday sparkler celebrations, and creative gatherings."
                })}
                className="bg-white rounded-[26px] sm:rounded-[28px] p-3.5 sm:p-4 shadow-[0_4px_25px_rgba(40,30,20,0.035)] border border-[#ede3d8]/70 transition-all duration-300 hover:shadow-[0_16px_36px_rgba(40,30,20,0.07)] hover:-translate-y-1 group flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Image Container with Inset Radius */}
                  <div className="relative rounded-[18px] sm:rounded-[20px] overflow-hidden aspect-[4/3.1] bg-[#f5efe8]">
                    <img
                      src="/assets/images/event_1.jpeg"
                      alt="Special Experiences - Women with sparklers celebrating"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/jessy.jpeg";
                      }}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                    <span className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 bg-white/80 backdrop-blur-md text-[#6c5548] text-[11px] sm:text-xs font-normal tracking-wide px-3.5 py-1 sm:py-1.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-white/60 select-none">
                      Coming Soon
                    </span>
                  </div>

                  {/* Card Copy */}
                  <div className="text-center pt-6 sm:pt-7 pb-6 px-4 sm:px-6">
                    <h3 className="font-serif text-2xl sm:text-[26px] font-normal text-[#241f20] tracking-tight leading-snug">
                      Special Experiences
                    </h3>
                    <p className="text-[#5d5653] text-[13.5px] sm:text-[14.5px] font-normal leading-relaxed mt-2.5 max-w-[270px] mx-auto">
                      Unique moments that celebrate us in unforgettable ways.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Detailed Travel & Retreats Section when Getaways & Travel is active */}
          {activeFilter === "getaways_travel" && (
            <div className="pt-8 animate-fadeIn">
              <WomensEscapesSection
                onExploreClick={() => {
                  const el = document.getElementById("future-destinations-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                onReserveClick={() => setUpdatesModalOpen(true)}
              />
            </div>
          )}

        </section>
      )}

      {/* 5. BE PART OF WHAT WE'RE BUILDING (JOIN FOUNDING CIRCLE - EXACT MATCH TO DESIGN) */}
      <section className="py-10 sm:py-14 lg:py-18 px-4 sm:px-8 lg:px-12 max-w-6xl mx-auto">
        <div className="bg-[#fffdfb] border border-[#ede5dd] rounded-[28px] sm:rounded-[36px] p-5 sm:p-7 lg:p-9 shadow-[0_12px_45px_rgba(40,25,20,0.06)] hover:shadow-[0_16px_50px_rgba(40,25,20,0.08)] transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 flex flex-col justify-between py-2 sm:py-4 pl-2 sm:pl-4 lg:pl-6 pr-2">
              
              {/* Eyebrow with hairline rule */}
              <div className="flex items-center gap-3.5 mb-6 sm:mb-8">
                <div className="w-9 h-[1.5px] bg-[#6e584f]" />
                <span className="text-[10px] sm:text-[11px] lg:text-[11.5px] font-semibold tracking-[0.24em] text-[#6e584f] uppercase font-sans">
                  BE PART OF WHAT WE'RE BUILDING
                </span>
              </div>

              {/* Main Heading */}
              <div className="space-y-1 sm:space-y-1.5 mb-5 sm:mb-6">
                <div className="font-serif text-3xl sm:text-4xl lg:text-[46px] xl:text-[50px] font-normal text-[#1f191b] leading-[1.08] tracking-tight">
                  Join the
                </div>
                <div className="font-serif italic text-3xl sm:text-4xl lg:text-[48px] xl:text-[54px] font-normal text-[#9e6744] leading-[1.08] tracking-tight">
                  Founding Circle
                </div>
              </div>

              {/* Description */}
              <p className="text-[#4a3f3a] text-sm sm:text-[15px] lg:text-[16px] leading-[1.65] font-sans max-w-md mb-7 sm:mb-8">
                Be among the women helping shape the earliest WomenPlay experiences, connections and memories.
              </p>

              {/* CTA Button */}
              <div className="mb-5 sm:mb-6">
                <button
                  onClick={handleJoinFoundingCircle}
                  className="inline-flex items-center justify-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#a25965] hover:bg-[#8e4854] text-white text-xs sm:text-[13px] font-medium tracking-[0.14em] uppercase shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                >
                  <span>JOIN THE FOUNDING CIRCLE</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {/* Secondary Value Lines */}
              <div className="text-[#6d5e56] text-xs sm:text-[13.5px] leading-relaxed font-sans space-y-0.5 mb-8 sm:mb-10">
                <p>Early access. Special invitations.</p>
                <p>A place in the WomenPlay story.</p>
              </div>

              {/* Bottom Signoff with hairline rule */}
              <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-[1.5px] bg-[#9e8f86]" />
                <span className="text-[9.5px] sm:text-[10.5px] tracking-[0.24em] text-[#7a6b63] uppercase font-medium font-sans">
                  MORE WOMEN &nbsp;•&nbsp; BRIGHTER JOURNEYS
                </span>
              </div>

            </div>

            {/* Right Image (Exact photo: 5 women arm-in-arm at sunset overlooking the ocean) */}
            <div className="lg:col-span-6">
              <div className="relative rounded-[22px] sm:rounded-[28px] overflow-hidden aspect-[4/3] sm:aspect-[4/3.2] lg:aspect-auto lg:h-[480px] xl:h-[510px] w-full shadow-sm bg-[#f7efe9]">
                <img
                  src="/assets/images/events_founding_sunset.jpg"
                  alt="Founding Circle members arm-in-arm overlooking golden ocean sunset"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/assets/fonders.jpg";
                  }}
                  className="w-full h-full object-cover object-center transform hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. TRAVEL & RETREATS - WOMEN'S ESCAPES */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto" id="travel">
        <WomensEscapesSection
          onExploreClick={() => {
            const el = document.getElementById("future-destinations-section");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            } else {
              setUpdatesModalOpen(true);
            }
          }}
          onReserveClick={() => setUpdatesModalOpen(true)}
          onJoinFoundingCircle={handleJoinFoundingCircle}
        />

        {/* Founding Member Action */}
        <div className="text-center pt-10 pb-4">
          <button
            onClick={handleJoinFoundingCircle}
            className="inline-flex items-center justify-center gap-2 bg-[#b04a68] hover:bg-[#963b54] active:scale-[0.98] text-white font-bold px-8 py-3.5 sm:py-4 rounded-full shadow-md shadow-[#b04a68]/20 transition-all text-xs sm:text-sm tracking-wider uppercase cursor-pointer"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Become A Founding Member
          </button>
        </div>
      </section>

      {/* MODAL: Get Event Updates */}
      {updatesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl relative animate-fadeIn text-left">
            <button
              onClick={() => setUpdatesModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {updatesSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xl font-bold text-slate-900">You're on the list!</h4>
                <p className="text-xs text-slate-600">
                  We'll send exclusive updates about the WomenPlay Launch Experience right to your inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleUpdatesSubmit} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#b04a68] uppercase tracking-wider">Stay in the Loop</span>
                  <h4 className="font-serif text-2xl font-bold text-slate-900">Get Launch Event Updates</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Be the first to receive date, venue details, and registration announcements for the WomenPlay launch.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={updatesEmail}
                    onChange={(e) => setUpdatesEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#b04a68] focus:ring-1 focus:ring-[#b04a68]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#b04a68] hover:bg-[#963b54] text-white font-semibold text-xs tracking-wider uppercase shadow-sm transition"
                >
                  Notify Me
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Coming Soon Info */}
      {comingSoonModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl relative animate-fadeIn text-left space-y-4">
            <button
              onClick={() => setComingSoonModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-block px-3 py-1 rounded-full bg-pink-50 text-[#b04a68] text-[10px] font-bold uppercase tracking-wider">
              Experience Preview
            </div>

            <h4 className="font-serif text-2xl font-bold text-slate-900">{comingSoonModal.title}</h4>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {comingSoonModal.desc}
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setComingSoonModal(null)}
                className="px-6 py-2.5 rounded-full bg-[#b04a68] text-white font-medium text-xs tracking-wider uppercase hover:bg-[#963b54] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
