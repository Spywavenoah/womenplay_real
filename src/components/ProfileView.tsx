import React from "react";
import { Heart, Target, Users, Handshake, ShieldCheck, Sparkles, Quote } from "lucide-react";
import type { Founder } from "../types";
import HeroBanner from "./HeroBanner";
import womenTugLawnImg from "../assets/images/women_hard.png";

interface ProfileViewProps {
  onNavigate?: (view: "privacy" | "terms" | "sponsorship" | "founders" | "events" | "contact" | "profile") => void;
  onNavigateHome: () => void;
}

function MeaningfulConnectionIcon({ className = "w-11 h-11", color = "#cc677e" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* 3 Radiating tick marks at top */}
      <line x1="26" y1="6" x2="26" y2="10.5" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <line x1="19" y1="7.5" x2="21.5" y2="11.5" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <line x1="33" y1="7.5" x2="30.5" y2="11.5" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      
      {/* Left heart-shaped speech bubble */}
      <path
        d="M23 20 C21 16.5 16.5 16 13.5 19 C10 22.5 10.5 27.5 14.5 32 L12 37.5 L18.5 35 C20.5 35.8 22.5 35.5 24 34.5"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right overlapping heart-shaped speech bubble */}
      <path
        d="M29 20 C31 16.5 35.5 16 38.5 19 C42 22.5 41.5 27.5 37.5 32 L40 37.5 L33.5 35 C31 36 28 35.5 25.5 34 C21.5 31.5 19.5 27.5 21 23.5 C22 20.5 24.5 18.5 27 19.5"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function JoyfulPlayIcon({ className = "w-11 h-11", color = "#cf7153" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Top 4-point sparkle star */}
      <path
        d="M26 5 Q26 9.5 30.5 9.5 Q26 9.5 26 14 Q26 9.5 21.5 9.5 Q26 9.5 26 5 Z"
        fill={color}
      />
      {/* Left 4-point sparkle star */}
      <path
        d="M13 22 Q13 25.5 16.5 25.5 Q13 25.5 13 29 Q13 25.5 9.5 25.5 Q13 25.5 13 22 Z"
        fill={color}
      />
      {/* Right 4-point sparkle star */}
      <path
        d="M39 22 Q39 25.5 42.5 25.5 Q39 25.5 39 29 Q39 25.5 35.5 25.5 Q39 25.5 39 22 Z"
        fill={color}
      />
      {/* Figure head */}
      <circle cx="26" cy="19" r="3" stroke={color} strokeWidth="1.9" />
      {/* Raised celebratory arms */}
      <path
        d="M16 21 C19 25.5 23 26 26 26 C29 26 33 25.5 36 21"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      {/* Flowing legs/body */}
      <path
        d="M26 26 C24 31 22 35 19 39"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M26 26 C28 31 30 35 33 39"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ElevatedExperiencesIcon({ className = "w-11 h-11", color = "#c28c3e" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* 5 Radiating sunburst rays above crown */}
      <line x1="26" y1="7" x2="26" y2="12" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <line x1="19" y1="9" x2="21.5" y2="13.5" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <line x1="33" y1="9" x2="30.5" y2="13.5" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <line x1="13" y1="13.5" x2="16.5" y2="17" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <line x1="39" y1="13.5" x2="35.5" y2="17" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      
      {/* Crown base and 5 peaks */}
      <path
        d="M12 37 L14.5 23.5 L20.5 29.5 L26 19 L31.5 29.5 L37.5 23.5 L40 37 Z"
        stroke={color}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottom base band */}
      <line x1="12" y1="37" x2="40" y2="37" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

const RESONANCE_CARDS = [
  {
    mark: "01",
    numColor: "text-[#cc677e]",
    bgColor: "bg-[#fcedf0]",
    borderColor: "border-[#f7d0d9]",
    icon: MeaningfulConnectionIcon,
    iconColor: "#cc677e",
    title: "Meaningful Connection",
    text: "Genuine conversations, new friendships and a welcoming community where women feel they belong."
  },
  {
    mark: "02",
    numColor: "text-[#cf7153]",
    bgColor: "bg-[#fdeee4]",
    borderColor: "border-[#f7d4c2]",
    icon: JoyfulPlayIcon,
    iconColor: "#cf7153",
    title: "Joyful Play",
    text: "A chance to laugh, move, dress up, loosen up and enjoy life—without pressure to perform or be perfect."
  },
  {
    mark: "03",
    numColor: "text-[#c28c3e]",
    bgColor: "bg-[#fdf4e4]",
    borderColor: "border-[#f6e0bf]",
    icon: ElevatedExperiencesIcon,
    iconColor: "#c28c3e",
    title: "Elevated Experiences",
    text: "Beautifully curated gatherings, travel, wellness, culture and playful moments designed to feel special from beginning to end."
  }
];

const PILLARS = [
  { icon: Heart, title: "Play With Abandon", text: "We exists so women can laugh, move, compete, and create without the pressure of performing or being judged." },
  { icon: Users, title: "Connect Deeply", text: "We build circles where genuine friendship, belonging, and shared joy flourish beyond stale networking." },
  { icon: Handshake, title: "Celebrate Girlhood", text: "Every gathering helps women reconnect with the carefree, bold, playful version of themselves." },
  { icon: ShieldCheck, title: "A Judgment-Free Space", text: "A community designed for women to be silly, bold, and fully themselves in every way." }
];

export default function ProfileView({ onNavigateHome }: ProfileViewProps) {
  const [founders, setFounders] = React.useState<Founder[]>([]);

  React.useEffect(() => {
    fetch("/api/founders")
      .then(res => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((data: Founder[]) => setFounders(Array.isArray(data) ? data : []))
      .catch(err => console.warn("Notice: Founders unavailable:", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-left" id="profile-view">
      {/* Hero Banner */}
      <HeroBanner
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Who We Are
          </span>
        }
        title={
          <>
            The <em className="gold-text-gradient not-italic">WomenPlay Story</em>
          </>
        }
        description="WomenPlay was born from a simple belief: women deserve a space to play, connect, and relive the carefree joy of their girl-child memories — with the confidence and wisdom of the women they've become."
        onNavigateHome={onNavigateHome}
      />

      <div className="bg-slate-50 text-left px-6 md:px-12 py-12 space-y-16 md:space-y-20">

        {/* Mission / Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 luxury-shadow">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-brand-pink" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Our Mission</h2>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              To create joyful, judgment-free experiences where women can play freely, reconnect with themselves, build meaningful friendships, and create beautiful memories together.
             </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 luxury-shadow">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-5 h-5 text-brand-gold-dark" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Our Vision</h2>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              A world where women never outgrow play.
Where women reconnect with their girl-child, explore, connect, and create unforgettable memories - 
because life is better when women can play too!
</p>
          </div>
        </div>

        {/* Why WomenPlay Resonates */}
        <section className="bg-[#fdfbf9] rounded-3xl p-8 sm:p-12 md:p-14 border border-stone-200/70 shadow-sm" id="voices">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[46px] tracking-tight leading-[1.18]">
              <span className="text-[#241c21] block">Designed for Women Who Want</span>
              <span className="text-[#b8824f] block mt-1 sm:mt-2">More Than Routine.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto">
            {RESONANCE_CARDS.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className={`${card.bgColor} ${card.borderColor} border rounded-2xl md:rounded-[22px] p-7 sm:p-8 lg:p-9 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`font-serif font-bold text-3xl sm:text-4xl ${card.numColor}`}>
                        {card.mark}
                      </span>
                      <Icon className="w-11 h-11" color={card.iconColor} />
                    </div>

                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#241c21] mt-7 mb-3 tracking-tight">
                      {card.title}
                    </h3>

                    <p className="font-sans text-xs sm:text-sm md:text-[15px] text-[#3d383b] leading-relaxed">
                      {card.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pillars */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-dark">What We Stand For</span>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900">The WomenPlay Pillars</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow hover:border-brand-pink/30 hover:shadow-lg transition duration-300 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-brand-pink text-white border border-brand-gold/40 flex items-center justify-center shadow-md shadow-brand-pink/20 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">{pillar.title}</h3>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed">{pillar.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why We Exist / Women Work Hard (EXACT MATCH TO ATTACHED DESIGN) */}
        <section
          id="why-we-exist"
          className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] lg:rounded-[36px] bg-[#faf6f0] border border-[#e8dfd5] shadow-xl shadow-stone-900/5 my-10 sm:my-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[560px] lg:min-h-[640px]">
            
            {/* Left Column: Full-bleed exact tug-of-war outdoor garden photograph */}
            <div className="lg:col-span-6 relative w-full min-h-[380px] sm:min-h-[460px] lg:min-h-full overflow-hidden bg-stone-200">
              <img
                src={womenTugLawnImg}
                alt="Diverse group of joyful women laughing and playing tug of war outdoors on a lush garden lawn"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/images/women_hard.png";
                }}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center lg:absolute lg:inset-0 transform hover:scale-[1.02] transition-transform duration-700 ease-out"
              />
            </div>

            {/* Right Column: Editorial typography and copy exact match to design */}
            <div className="lg:col-span-6 flex flex-col justify-center p-8 sm:p-10 md:p-12 lg:p-14 xl:p-16 text-left bg-[#faf6f0]">
              
              {/* Eyebrow: WHY WE EXIST with horizontal rule */}
              <div className="mb-5 sm:mb-6">
                <p className="text-[12px] sm:text-[13px] font-bold tracking-[0.25em] text-[#a67444] uppercase font-sans">
                  WHY WE EXIST
                </p>
                <div className="w-12 h-[1.5px] bg-[#a67444] mt-2.5" />
              </div>

              {/* Display Headline: Women Work Hard. */}
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-[52px] xl:text-[58px] font-bold leading-[1.08] tracking-tight mb-5 sm:mb-6">
                <span className="text-[#192333]">Women </span>
                <span className="text-[#a67444]">Work Hard.</span>
              </h2>

              {/* First Paragraph */}
              <p className="text-[#374151] text-[15px] sm:text-[16px] leading-[1.7] font-sans mb-6 sm:mb-7">
                They build careers, raise families, run businesses, support others, lead communities and carry countless responsibilities. Yet there are surprisingly few spaces intentionally created for women to simply play, connect, explore, laugh and enjoy life together.
              </p>

              {/* Secondary Headline in Rich Berry Serif */}
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#b04a68] tracking-tight leading-snug mb-5 sm:mb-6">
                WomenPlay was created to change that.
              </h3>

              {/* Second Paragraph */}
              <p className="text-[#374151] text-[15px] sm:text-[16px] leading-[1.7] font-sans mb-4 sm:mb-5">
                We bring women together through beautifully curated experiences that create space for play, connection, exploration, laughter and unforgettable memories.
              </p>

              {/* Third Paragraph */}
              <p className="text-[#374151] text-[15px] sm:text-[16px] leading-[1.7] font-sans mb-6 sm:mb-8">
                From social gatherings and playful experiences to retreats, travel, themed events and more, WomenPlay gives women room to pause, reconnect and enjoy meaningful moments alongside other incredible women.
              </p>

              {/* Bottom Accent Rule and Tagline in Italic Serif */}
              <div className="pt-1">
                <div className="w-12 h-[1.5px] bg-[#a67444] mb-4" />
                <p className="font-serif italic text-lg sm:text-xl lg:text-[22px] text-[#a67444] font-normal leading-relaxed">
                  Because life is better when women can play too.
                </p>
              </div>

            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
