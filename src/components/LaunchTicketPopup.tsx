import React, { useState } from "react";
import { X, Sparkles, Calendar, MapPin, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LaunchTicketPopupProps {
  onSecureTicket: () => void;
}

export default function LaunchTicketPopup({ onSecureTicket }: LaunchTicketPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    // Check if the user has already seen and dismissed the pop-up during this session
    try {
      const dismissed = sessionStorage.getItem("womenplay_launch_popup_dismissed");
      if (!dismissed) {
        // Show after a brief natural delay so the page loads smoothly
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    try {
      sessionStorage.setItem("womenplay_launch_popup_dismissed", "true");
    } catch {}
    setIsOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "popup-launch-updates" })
      }).catch(() => {});
    } catch {}
    setSubmitted(true);
    setTimeout(() => {
      handleDismiss();
    }, 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="launch-popup-title"
        >
          {/* Backdrop Click */}
          <div
            className="absolute inset-0"
            onClick={handleDismiss}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 text-left"
          >
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              aria-label="Close notification"
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs shadow-md"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Visual Header Banner */}
            <div className="relative h-44 sm:h-52 w-full bg-slate-950 overflow-hidden">
              <img
                src="/assets/women_tug_war.jpg"
                alt="WomenPlay Launch Experience"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/assets/images/women_tug_war.jpg";
                }}
                className="w-full h-full object-cover object-center opacity-90 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-pink/90 text-white text-[11px] font-bold tracking-wider uppercase shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Inaugural Launch Event</span>
              </div>

              <div className="absolute bottom-4 left-5 right-5 text-white">
                <p className="text-xs uppercase font-extrabold tracking-widest text-brand-gold-light mb-1">
                  Jersey Style · 100 Women Only
                </p>
                <h3
                  id="launch-popup-title"
                  className="text-xl sm:text-2xl font-display font-extrabold leading-tight text-white"
                >
                  WomenPlay Launch Experience
                </h3>
              </div>
            </div>

            {/* Body Content */}
            <div className="p-6 sm:p-7 space-y-5">
              {/* Event Meta Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full text-slate-700 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-brand-pink" />
                  <span>Launch details coming soon</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full text-slate-700 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-brand-pink" />
                  <span>Launch details coming soon</span>
                </div>
              </div>

              {/* Message */}
              <p className="text-slate-600 text-sm leading-relaxed">
                We’re putting the final details together for our first WomenPlay Launch Experience — Jersey Style. Join the priority list to get date, venue, and registration announcements first!
              </p>

              {/* Form / Confirmation */}
              {submitted ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="font-bold text-sm">You're on the priority list!</p>
                  <p className="text-xs text-emerald-700">We'll email you as soon as details are released.</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink"
                    />
                    <button
                      type="submit"
                      className="bg-brand-pink hover:bg-brand-pink-dark text-white font-bold px-5 py-3 rounded-xl shadow-md text-xs cursor-pointer whitespace-nowrap"
                    >
                      KEEP ME IN THE PLAY
                    </button>
                  </div>
                </form>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleDismiss();
                    onSecureTicket();
                  }}
                  className="w-full text-center text-xs font-semibold text-brand-pink hover:underline py-1 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Explore Launch Experience Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
