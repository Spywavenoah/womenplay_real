import React from "react";
import { MapPin, Calendar, Clock, Ticket, ChevronRight } from "lucide-react";
import HeroBanner from "./HeroBanner";

export default function LaunchView({ onNavigateHome, onNavigateTickets }: { onNavigateHome: () => void; onNavigateTickets: () => void }) {
  const [countdown, setCountdown] = React.useState({
    days: 47,
    hours: 3,
    minutes: 27,
    seconds: 57
  });

  // Countdown Timer Logic
  React.useEffect(() => {
    const launchDate = new Date("2026-09-19T13:00:00").getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };

    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-brand-pink/5 to-brand-gold/5">
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
          <div className="space-y-8 order-2 lg:order-1">
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
                    <p className="text-slate-900 font-semibold">Saturday, September 19, 2026</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-brand-pink flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Time</p>
                    <p className="text-slate-900 font-semibold">1:00 PM â€“ 6:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-pink flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Location</p>
                    <p className="text-slate-900 font-semibold">Surrey, BC</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-lg leading-relaxed md:text-xl">
              A high-energy women-only play experience for 100 women â€” created as an exciting launch for the WomenPlay.Org brand.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={onNavigateTickets}
                className="inline-flex items-center justify-center gap-2 bg-brand-pink hover:bg-brand-pink-dark text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-brand-pink/25 transition-all hover:-translate-y-1 text-base font-display"
              >
                <Ticket className="w-5 h-5" />
                <span>Register Now</span>
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("event-details");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center gap-2 border-2 border-slate-300 hover:border-brand-pink text-slate-900 hover:text-brand-pink font-bold px-8 py-3 rounded-full transition-all text-base font-display"
              >
                <span>View Details</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Note */}
            <p className="text-sm text-slate-500 italic pt-2">
              The launch is a featured WomenPlay experience â€” not the full story of the brand.
            </p>
          </div>

          {/* Right Visual */}
          <div className="order-1 lg:order-2 relative h-96 md:h-[500px] rounded-2xl overflow-hidden group luxury-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/20 via-brand-gold/10 to-transparent z-10"></div>
            <img
              src="/assets/jessy.jpeg"
              alt="WomenPlay Launch Jersey Style Event"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent z-20 flex items-end p-6 md:p-8">
              <div className="text-white text-left">
                <p className="text-3xl md:text-4xl font-display font-bold">Jersey Style</p>
                <p className="text-sm text-white/80 mt-2">September 19 Â· Surrey, BC</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section
        className="py-20 px-6 md:px-12 max-w-7xl mx-auto"
        id="countdown"
      >
        <div className="bg-gradient-to-br from-brand-pink/10 via-white to-brand-gold/10 border border-brand-pink/20 rounded-3xl p-8 md:p-12 text-center space-y-8 luxury-shadow">
          {/* Header */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900">
              Countdown to Launch Day
            </h2>
            <p className="text-slate-600 text-lg md:text-xl">
              September 19, 2026 | 1:00 PM â€“ 6:00 PM
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { value: countdown.days, label: "Days" },
              { value: countdown.hours, label: "Hours" },
              { value: countdown.minutes, label: "Minutes" },
              { value: countdown.seconds, label: "Seconds" }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 text-center space-y-3 hover:border-brand-pink hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl md:text-5xl font-display font-extrabold text-brand-pink">
                  {formatTime(item.value)}
                </div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {/* Subtext */}
          <p className="text-slate-700 text-base md:text-lg font-medium pt-4">
            The first WomenPlay experience is almost here.
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
      <section className="py-16 px-6 md:px-12 bg-gradient-to-r from-brand-pink/10 to-brand-gold/10 border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900">
            Ready to Play?
          </h2>
          <p className="text-slate-600 text-lg">
            Limited spots available for the WomenPlay Launch Experience. Secure your place now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
<button
                onClick={onNavigateTickets}
                className="inline-flex items-center justify-center gap-2 bg-brand-pink hover:bg-brand-pink-dark text-white font-bold px-10 py-4 rounded-full shadow-lg shadow-brand-pink/25 transition-all hover:-translate-y-1 text-base font-display"
              >
                <Ticket className="w-5 h-5" />
                <span>Get Your Ticket</span>
              </button>
              <button
                onClick={onNavigateHome}
              className="inline-flex items-center justify-center gap-2 border-2 border-slate-300 hover:border-brand-pink text-slate-900 hover:text-brand-pink font-bold px-10 py-3 rounded-full transition-all text-base font-display"
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
          <div className="space-y-6 order-2 lg:order-1">
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
                { label: "Date", val: "Saturday, September 19, 2026" },
                { label: "Time", val: "1:00 PM – 6:00 PM" },
                { label: "Venue", val: "Surrey, BC — indoor venue to be confirmed" },
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
              Venue Reveal + Details Coming Soon
            </span>
            <p className="relative text-3xl md:text-4xl font-display font-bold text-white">
              “Play. Connect. Play Again.”
            </p>
          </div>
        </div>
      </section>

      {/* Play Stations Section */}
      <section className="py-20 px-6 md:px-12 bg-gradient-to-br from-slate-900 via-brand-pink-dark/90 to-slate-900" id="games">
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
