import React, { useState } from "react";
import { ArrowRight, Check, CheckCircle2, Sparkles, Calendar, MapPin, Clock, Mail, Heart } from "lucide-react";
import HeroBanner from "./HeroBanner";

interface TicketsViewProps {
  onNavigateHome?: () => void;
}

export default function TicketsView({ onNavigateHome }: TicketsViewProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    notes: ""
  });
  const [processing, setProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please provide a valid email address.");
      return;
    }

    setProcessing(true);
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.fullName,
          phone: formData.phone,
          city: formData.city,
          notes: formData.notes,
          source: "launch-update-list-page"
        }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-left" id="launch-experience-page">
      {/* Header */}
      <HeroBanner
        eyebrow="WomenPlay Launch Experience"
        title={
          <>
            WomenPlay Launch Experience<br />
            <em className="gold-text-gradient not-italic">Jersey Style</em>
          </>
        }
        description="Launch details coming soon. We're finalizing the date, venue, and registration schedule for our inaugural 100-women launch experience."
        onNavigateHome={onNavigateHome}
      />

      {/* Main Content Area */}
      <div className="px-6 md:px-12 py-16 max-w-7xl mx-auto space-y-16">
        
        {/* Event Quick Info Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 luxury-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-pink/10 text-brand-pink text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inaugural Event · 100 Women Only</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900">
              WomenPlay Launch Experience · Jersey Style
            </h2>
            <div className="flex flex-wrap gap-4 text-xs md:text-sm text-slate-600 font-medium pt-1">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-pink" />
                Launch details coming soon
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-pink" />
                Launch details coming soon
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-pink" />
                Launch details coming soon
              </span>
            </div>
          </div>

          <a
            href="#update-form"
            className="shrink-0 bg-brand-pink hover:bg-brand-pink-dark text-white font-bold px-6 py-3.5 rounded-xl shadow-md shadow-brand-pink/25 transition hover:-translate-y-0.5 text-sm inline-flex items-center gap-2"
          >
            <span>KEEP ME IN THE PLAY</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Experience Highlights Box */}
        <div className="bg-gradient-to-br from-brand-gold/15 via-brand-gold/10 to-transparent border border-brand-gold/40 rounded-3xl p-8 md:p-10 max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-brand-gold-dark" />
            <h4 className="text-slate-900 font-bold text-lg md:text-xl">What to Expect at the Launch Experience:</h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {[
              "100 women coming together in a joyful, judgment-free play space",
              "Interactive play stations and playful team challenges",
              "Official WomenPlay Launch Passport & Activity Tracker",
              "Live DJ music, vibrant rhythm, and uplifting celebration",
              "Professional photo captures & candid memory moments",
              "Local food vendors, refreshing treats, and surprise gifts",
              "Dress code: Jersey Style (sports jerseys, sneakers, team colours)"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                <Check className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-brand-gold/20 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-600 gap-2">
            <span>* Full game line-up, venue reveal, and registration schedule will be announced soon.</span>
            <span className="font-bold text-slate-800">Capacity strictly limited to 100 women.</span>
          </div>
        </div>

        {/* Priority Update Form */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/80 luxury-shadow max-w-3xl mx-auto" id="update-form">
          <div className="space-y-2 mb-8">
            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-dark">STAY IN THE LOOP</span>
            <h3 className="text-3xl font-display font-extrabold text-slate-900">
              Join the Launch Update List
            </h3>
            <p className="text-xs md:text-sm text-slate-500">
              Be the first to receive the confirmed date, venue location, and registration announcements when they open.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-3 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-display font-bold text-xl text-slate-900">You&apos;re On the List!</h4>
              <p className="text-sm text-slate-700 max-w-md mx-auto">
                Thank you for your interest in WomenPlay. We&apos;ll notify you with all launch details and priority access as soon as registration opens.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="inline-flex items-center gap-2 text-xs font-bold text-brand-pink hover:underline uppercase tracking-wider"
                >
                  <span>Return to Home</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold p-4 rounded-xl">
                  {error}
                </div>
              )}

              {/* Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition text-sm bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition text-sm bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Phone & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(604) 555-0199"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition text-sm bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">City / Region (Optional)</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Surrey, Vancouver"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition text-sm bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Optional Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">What games or play moments are you most excited about? (Optional)</label>
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Tell us what playful experiences you love..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition text-sm bg-slate-50/50 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                id="btn-join-update-list"
                className="w-full bg-brand-pink hover:bg-brand-pink-dark text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-brand-pink/25 flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-60"
              >
                <Mail className="w-5 h-5" />
                <span>KEEP ME IN THE PLAY</span>
              </button>

              <p className="text-center text-xs text-slate-500">
                We respect your privacy and will only send meaningful WomenPlay announcements.
              </p>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
