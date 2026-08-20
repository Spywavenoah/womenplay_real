import React from "react";
import { Heart, Target, Users, Handshake, ShieldCheck, Sparkles, Quote } from "lucide-react";
import type { Founder } from "../types";
import HeroBanner from "./HeroBanner";

interface ProfileViewProps {
  onNavigate?: (view: "privacy" | "terms" | "sponsorship" | "founders" | "events" | "contact" | "profile") => void;
  onNavigateHome: () => void;
}

const PILLARS = [
  { icon: Heart, title: "Play With Abandon", text: "WomenPlay exists so women can laugh, move, compete, and create without the pressure of performing or being judged." },
  { icon: Users, title: "Connect Deeply", text: "We build circles where genuine friendship, belonging, and shared joy flourish — beyond stale networking." },
  { icon: Handshake, title: "Celebrate Girlhood", text: "Every gathering helps women reconnect with the carefree, bold, playful version of themselves." },
  { icon: ShieldCheck, title: "A Judgment-Free Space", text: "A community designed for women to be silly, bold, and fully themselves in every way." }
];

export default function ProfileView({ onNavigateHome }: ProfileViewProps) {
  const [founders, setFounders] = React.useState<Founder[]>([]);

  React.useEffect(() => {
    fetch("/api/founders")
      .then(res => res.json())
      .then((data: Founder[]) => setFounders(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error loading founders:", err));
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

      <div className="bg-slate-50 text-left px-6 md:px-12 py-12">

        {/* Mission / Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 luxury-shadow">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-brand-pink" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Our Mission</h2>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              To create joyful, judgment-free play experiences that help women reconnect with themselves, laugh until their stomachs hurt, and build meaningful friendships — one beautiful shared moment at a time.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 luxury-shadow">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-5 h-5 text-brand-gold-dark" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Why We Exist</h2>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Networking events that feel like work aren't enough. Women want to play without permission, be silly without judgment, and collect memories instead of merely attending another event.
            </p>
          </div>
        </div>

        {/* Why WomenPlay Resonates */}
        <section className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 luxury-shadow space-y-10" id="voices">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-dark inline-block">
              Why WomenPlay Resonates
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 leading-tight">
              Designed for Women Who Want <em className="gold-text-gradient not-italic">More Than Routine.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { mark: "01", title: "Meaningful Connection", text: "Thoughtfully curated spaces for real conversations, new friendships, and community that feels warm, grown, and intentional." },
              { mark: "02", title: "Joyful Play", text: "A reason to laugh, move, dress up, loosen up, and enjoy life again — without pressure to perform or be perfect." },
              { mark: "03", title: "Elevated Experiences", text: "Beautiful gatherings, future travel, wellness, culture, and lifestyle moments designed to feel special from start to finish." }
            ].map((card, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-8 space-y-5 hover:border-brand-pink/30 hover:shadow-lg transition duration-300 luxury-shadow group">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl md:text-5xl font-display font-extrabold text-brand-pink/20 group-hover:text-brand-pink/40 transition-colors">
                    {card.mark}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base md:text-lg">{card.title}</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{card.text}</p>
              </div>
            ))}
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
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-brand-pink to-brand-gold text-white flex items-center justify-center shadow-md shadow-brand-pink/20 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">{pillar.title}</h3>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed">{pillar.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why We Exist */}
        <section className="py-20 px-6 md:px-12 bg-gradient-to-br from-slate-900 via-brand-pink-dark/80 to-slate-900 text-white rounded-3xl p-8 md:p-12 border border-slate-800 luxury-shadow">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold inline-block">
              WHY WE EXIST
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white leading-tight">
              Why WomenPlay.Org <em className="gold-text-gradient not-italic">Exists.</em>
            </h2>
            <div className="space-y-4 text-left text-lg leading-relaxed text-white/90">
              <p>Women work hard.</p>
              <p>They build careers, raise families, run businesses, support others, lead communities, and carry countless responsibilities.</p>
              <p>Yet there are surprisingly few spaces intentionally created for women to play and simply enjoy life together.</p>
              <p>WomenPlay was created to change that.</p>
              <p>We bring women together through beautifully curated experiences that inspire unique play time, connection, exploration, laughter, and memories.</p>
              <p>From brunches and social gatherings to retreats, travel experiences, themed events, and unforgettable moments, WomenPlay.Org creates opportunities for women to pause, reconnect, and enjoy meaningful experiences alongside other incredible women.</p>
            </div>
            <p className="text-brand-gold text-lg font-bold font-display pt-4">
              Because life is better when… Women can play too!
            </p>
          </div>
        </section>

        {/* Travel & Retreats */}
        <section className="py-20 px-6 md:px-12 bg-gradient-to-br from-white via-brand-pink/5 to-brand-gold/5" id="travel">
          <div className="bg-gradient-to-br from-slate-900 via-brand-pink-dark/80 to-slate-900 text-white rounded-3xl p-8 md:p-12 border border-slate-800 luxury-shadow">
            <div className="space-y-4 text-center max-w-2xl mx-auto">
              <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold inline-block">
                Travel & Retreats
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white leading-tight">
                Women's <em className="gold-text-gradient not-italic">Escapes.</em>
              </h2>
              <p className="text-white/60 font-display italic text-base md:text-lg">
                Explore. Discover. Connect.
              </p>
              <p className="text-white/80 text-base md:text-lg leading-relaxed">
                From local getaways to international adventures, WomenPlay is creating future travel experiences designed to bring women together through exploration, culture, wellness, celebration, and unforgettable memories.
              </p>
            </div>

            {/* Travel Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              {[
                { icon: "🏡", name: "Weekend Getaways", sub: "Local and regional escapes designed for rest, laughter, exploration, and connection." },
                { icon: "👯", name: "Girls' Trips", sub: "Group experiences for women who want to explore, unwind, bond, and make memories." },
                { icon: "🌍", name: "International Retreats", sub: "Future destination experiences in beautiful places around the world." },
                { icon: "💎", name: "Luxury Experiences", sub: "Premium curated travel moments designed with comfort, elegance, and community." }
              ].map((cat, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-6 text-center hover:bg-white/15 hover:border-brand-gold/60 transition-all duration-300 luxury-shadow group">
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <div className="text-lg font-bold font-display text-white mb-2">{cat.name}</div>
                  <p className="text-white/75 text-sm leading-relaxed">{cat.sub}</p>
                </div>
              ))}
            </div>

            {/* Future Destinations */}
            <div className="space-y-6 pt-6">
              <p className="text-center text-white/60 font-medium">
                Future <span className="text-brand-gold font-bold">Destinations Being Explored</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { city: "Santorini", ctry: "Greece", bg: "/santorini.webp" },
                  { city: "Dubai", ctry: "UAE", bg: "/dubai.webp" },
                  { city: "Zanzibar", ctry: "Tanzania", bg: "/sanziba.webp" },
                  { city: "Tulum", ctry: "Mexico", bg: "/tulum.webp" },
                  { city: "Cape Town", ctry: "South Africa", bg: "/captown.webp" },
                  { city: "Bali", ctry: "Indonesia", bg: "/bali.webp" }
                ].map((dest, idx) => (
                  <div key={idx} className="group relative rounded-2xl overflow-hidden aspect-[4/3] luxury-shadow">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${dest.bg})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent group-hover:from-slate-950/90 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-end p-6 text-left">
                      <div>
                        <div className="text-white text-2xl font-display font-bold">{dest.city}</div>
                        <div className="text-brand-gold text-sm font-semibold tracking-wider uppercase">{dest.ctry}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-center text-white/75 text-sm md:text-base leading-relaxed pt-2">
                Travel experiences are currently in development. Founding Circle members will receive first access to future retreat announcements and travel opportunities as they are confirmed.
              </p>

              <div className="text-center pt-4">
                <a
                  href="/founding"
                  className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-slate-900 font-bold px-8 py-3.5 rounded-full shadow-lg gold-shadow transition hover:-translate-y-0.5 text-sm"
                >
                  Reserve Your Spot For Travel Updates
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Quote */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 border border-slate-800 luxury-shadow text-center relative overflow-hidden">
          <Quote className="w-8 h-8 text-brand-pink/40 mx-auto mb-4" />
          <p className="text-lg md:text-2xl font-display font-bold max-w-3xl mx-auto leading-relaxed">
            "Every woman deserves to feel like a kid again — with the confidence of a grown woman."
          </p>
          <p className="text-brand-gold-light text-xs uppercase tracking-widest font-extrabold mt-4">The WomenPlay Promise</p>
        </div>

        {/* CTA */}
        <div className="text-center pb-6">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center bg-brand-pink hover:bg-brand-pink-dark text-white font-bold px-8 py-3.5 rounded-full shadow-md shadow-brand-pink/25 transition hover:-translate-y-0.5 text-sm"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Become A Founding Member
          </button>
        </div>
      </div>
    </div>
  );
}
