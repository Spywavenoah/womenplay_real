import React, { useState } from "react";
import { MapPin, Calendar, Clock, Sparkles, CheckCircle2, ArrowRight, ChevronRight, Mail } from "lucide-react";
import HeroBanner from "./HeroBanner";

export default function LaunchView({ onNavigateHome, onNavigateTickets }: { onNavigateHome: () => void; onNavigateTickets?: () => void }) {
  const [updateEmail, setUpdateEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateEmail.trim()) return;
    try {
      fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: updateEmail, source: "launch-experience-page" })
      }).catch(() => {});
    } catch {}
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <HeroBanner
        eyebrow="WomenPlay.Org Presents"
        title={
          <>
            WomenPlay <em className="gold-text-gradient not-italic">Launch</em> Experience
          </>
        }
        description="A high-energy women-only play experience for 100 women — created as an exciting launch for the WomenPlay.Org brand."
        onNavigateHome={onNavigateHome}
      />

      {/* Hero Launch Callout Section */}
      <section className="py-12 md:py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 order-2 lg:order-1 text-left">
            {/* Header */}
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-dark block">
                Jersey Style Launch Event
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 leading-tight">
                WomenPlay <em className="gold-text-gradient not-italic">Launch</em> Experience<br />
                <span className="text-3xl md:text-4xl">Jersey Style</span>
              </h2>
            </div>

            {/* Event Meta */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 space-y-4 luxury-shadow">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-brand-pink flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Date</p>
                    <p className="text-slate-900 font-semibold">Launch details coming soon</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-brand-pink flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Schedule</p>
                    <p className="text-slate-900 font-semibold">Launch details coming soon</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-pink flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Location</p>
                    <p className="text-slate-900 font-semibold">Launch details coming soon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-lg leading-relaxed md:text-xl">
              A high-energy women-only play experience for 100 women — created as an exciting launch for the WomenPlay.Org brand.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href="#launch-updates"
                className="inline-flex items-center justify-center gap-2 bg-brand-pink hover:bg-brand-pink-dark text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-brand-pink/25 transition-all hover:-translate-y-1 text-base font-display cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                <span>Keep Me in the Play</span>
              </a>
              <button
                onClick={() => {
                  const el = document.getElementById("event-details");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center gap-2 border-2 border-slate-300 hover:border-brand-pink text-slate-900 hover:text-brand-pink font-bold px-8 py-3 rounded-full transition-all text-base font-display cursor-pointer"
              >
                <span>What to Expect</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Note */}
            <p className="text-sm text-slate-500 italic pt-1">
              The launch is a featured WomenPlay experience &mdash; not the full story of the brand.
            </p>
          </div>

          {/* Right Visual */}
          <div className="order-1 lg:order-2 relative h-96 md:h-[500px] rounded-2xl overflow-hidden group luxury-shadow">
            <div className="absolute inset-0 bg-brand-pink/10 z-10"></div>
            <img
              src="/assets/images/events_launch_hero.jpg"
              alt="WomenPlay Launch Jersey Style Event"
              referrerPolicy="no-referrer"
              onError={(e) => { (e.target as HTMLImageElement).src = "/assets/images/events_jersey_launch_1787392928539.jpg"; }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent z-20 flex items-end p-6 md:p-8">
              <div className="text-white text-left">
                <span className="inline-block px-3 py-1 rounded-full bg-brand-pink text-white text-xs uppercase tracking-wider font-bold mb-2">
                  Launch details coming soon
                </span>
                <p className="text-3xl md:text-4xl font-display font-bold">Jersey Style</p>
                <p className="text-sm text-white/80 mt-1">Surrey, BC Venue & Date Announcement Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Priority Update List Section (Replaces countdown) */}
      <section
        className="py-16 px-6 md:px-12 max-w-7xl mx-auto"
        id="launch-updates"
      >
        <div className="bg-white border-2 border-brand-pink/20 rounded-3xl p-8 md:p-12 text-center space-y-8 luxury-shadow max-w-4xl mx-auto">
          {/* Header */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-pink/10 text-brand-pink text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Priority Launch Updates
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900">
              Be the First to Receive Launch Details
            </h2>
            <p className="text-slate-600 text-base md:text-lg">
              We’re putting the final details together for our first WomenPlay Launch Experience — Jersey Style. Join the list to get the confirmed date, venue, and registration opening before anyone else.
            </p>
          </div>

          {/* Form */}
          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 max-w-md mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-display font-bold text-lg">You're In The Play!</h4>
              <p className="text-xs text-emerald-700">
                We'll notify you as soon as the launch date, venue, and registration details go live.
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdateSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={updateEmail}
                onChange={(e) => setUpdateEmail(e.target.value)}
                className="flex-1 px-5 py-3.5 rounded-full border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink"
              />
              <button
                type="submit"
                className="bg-brand-pink hover:bg-brand-pink-dark text-white font-bold px-8 py-3.5 rounded-full shadow-md shadow-brand-pink/20 transition text-sm cursor-pointer whitespace-nowrap"
              >
                KEEP ME IN THE PLAY
              </button>
            </form>
          )}

          {/* Subtext */}
          <p className="text-slate-500 text-xs md:text-sm pt-2">
            Strictly 100 spots available for this inaugural launch experience.
          </p>
        </div>
      </section>

      {/* Event Details Section */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto" id="event-details">
        <div className="space-y-12">
          <div className="space-y-4 text-center max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900">
              What to Expect
            </h2>
            <p className="text-slate-600 text-lg">
              Get ready for a high-energy celebration of women, play, and community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: "Jersey-Inspired Gameplay",
                description: "Competitive games, team challenges, and playful competitions designed to celebrate athleticism and fun."
              },
              {
                title: "Women-Only Community",
                description: "100 women connecting, supporting, and celebrating each other in a judgment-free, joyful space."
              },
              {
                title: "Exclusive Experience",
                description: "Your invitation to the first official WomenPlay experience and the beginning of something bigger."
              },
              {
                title: "Vendor Village",
                description: "Local food vendors, lifestyle brands, and community partners celebrating alongside us."
              },
              {
                title: "Merch Launch",
                description: "Exclusive WomenPlay merchandise and limited edition launch day collectibles."
              },
              {
                title: "Network & Connect",
                description: "Build genuine connections with inspiring women from across the region."
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 space-y-3 hover:border-brand-pink hover:shadow-lg transition-all duration-300 text-left group"
              >
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-pink transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-16 px-6 md:px-12 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900">
            Ready to Play?
          </h2>
          <p className="text-slate-600 text-lg">
            Limited spots available for the WomenPlay Launch Experience. Join our list to receive registration access first.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href="#launch-updates"
              className="inline-flex items-center justify-center gap-2 bg-brand-pink hover:bg-brand-pink-dark text-white font-bold px-10 py-4 rounded-full shadow-lg shadow-brand-pink/25 transition-all hover:-translate-y-1 text-base font-display cursor-pointer"
            >
              <Mail className="w-5 h-5" />
              <span>KEEP ME IN THE PLAY</span>
            </a>
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center justify-center gap-2 border-2 border-slate-300 hover:border-brand-pink text-slate-900 hover:text-brand-pink font-bold px-10 py-3 rounded-full transition-all text-base font-display cursor-pointer"
            >
              <span>Learn More About WomenPlay</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Event Snapshot Section */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto" id="event">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center bg-white border border-slate-100 rounded-3xl p-8 md:p-12 luxury-shadow">
          {/* Copy */}
          <div className="space-y-6 order-2 lg:order-1 text-left">
            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-dark">
              Event Snapshot
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 leading-tight">
              The First <em className="gold-text-gradient not-italic">WomenPlay Experience.</em>
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed md:text-xl">
              A high-energy women-only play experience for 100 women — created as an exciting launch for the
              WomenPlay.Org brand.
            </p>
            <p className="text-slate-600 text-lg leading-relaxed md:text-xl">
              The event blends playful competitive games, cultural play, comfort food vendors, music, sporty
              dress code, team energy, and meaningful connection in a fun, low-pressure environment.
            </p>

            {/* Facts */}
            <div className="grid grid-cols-1 gap-4 pt-2">
              {[
                { label: "Event Name", val: "WomenPlay Experience — Jersey Style" },
                { label: "Date", val: "Launch details coming soon" },
                { label: "Schedule", val: "Launch details coming soon" },
                { label: "Venue", val: "Launch details coming soon" },
                { label: "Attendance Cap", val: "100 women" },
                { label: "Dress Code", val: "Jersey Style — sports jerseys, biker shorts/leggings, sneakers, team colours" },
                { label: "Format", val: "Field-day-style social with games, music, vendors, prizes, and connection moments" },
                { label: "Primary Goal", val: "Launch WomenPlay.Org, build buzz, and create a founding customer community" }
              ].map((fact, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border-b border-slate-100 pb-3 last:border-0"
                >
                  <span className="text-xs uppercase tracking-wider font-bold text-brand-pink sm:w-44 sm:flex-shrink-0 sm:pt-0.5">
                    {fact.label}
                  </span>
                  <span className="text-slate-800 font-medium text-sm md:text-base">
                    {fact.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="order-1 lg:order-2 relative flex flex-col items-center justify-center gap-8 min-h-[300px] md:min-h-[420px] rounded-2xl p-8 md:p-12 text-center luxury-shadow overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url(/assets/roop.jpeg)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-slate-950/40" />
            <span className="relative inline-flex items-center rounded-full bg-brand-pink text-white text-xs uppercase tracking-widest font-bold px-4 py-2 shadow-lg shadow-brand-pink/25">
              Launch details coming soon
            </span>
            <p className="relative text-3xl md:text-4xl font-display font-bold text-white">
              “Play. Connect. Play Again.”
            </p>
          </div>
        </div>
      </section>

      {/* Play Stations Section */}
      <section className="py-20 px-6 md:px-12 bg-slate-900 border-y-2 border-brand-pink/30" id="games">
        <div className="max-w-7xl mx-auto space-y-14">
          {/* Header */}
          <div className="space-y-4 text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold inline-block">
              Play Stations
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white leading-tight">
              6 Play Stations. 100 Women.<br />
              <em className="gold-text-gradient not-italic">One Unforgettable Launch.</em>
            </h2>
            <p className="text-white/80 text-lg leading-relaxed" style={{ maxWidth: 720, margin: "18px auto 0" }}>
              The full game line-up will be revealed closer to launch. Expect movement, laughter, team challenges,
              nostalgic games, cultural play, music, and surprise moments designed for women who are ready to play
              again.
            </p>
          </div>

          {/* Play Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: "🏃🏾‍♀️", name: "Movement", txt: "Light, playful activity — no athletic pressure." },
              { icon: "🌍", name: "Culture", txt: "Play moments that feel familiar, warm, and joyful." },
              { icon: "🤝", name: "Team Challenges", txt: "Cheer, collect points, and build team energy." },
              { icon: "🎈", name: "Nostalgia", txt: "A grown-woman return to simple fun." },
              { icon: "🎶", name: "Dance", txt: "Music, rhythm, and moments that move the room." },
              { icon: "✨", name: "Surprise Play", txt: "A few details are staying secret for now." }
            ].map((card, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl p-8 text-center space-y-4 hover:bg-white/15 hover:border-brand-gold/60 hover:-translate-y-1 transition-all duration-300 luxury-shadow group"
              >
                <div className="text-5xl">{card.icon}</div>
                <div className="text-lg font-bold font-display text-white">{card.name}</div>
                <p className="text-white/75 text-sm leading-relaxed">{card.txt}</p>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="text-center space-y-3 pt-2">
            <span className="inline-flex items-center rounded-full bg-brand-gold text-slate-900 text-xs uppercase tracking-widest font-bold px-4 py-2 shadow-lg gold-shadow">
              Game Line-Up Coming Soon
            </span>
            <p className="text-white/75 text-base font-medium">
              Keeping a little mystery is part of the fun.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
