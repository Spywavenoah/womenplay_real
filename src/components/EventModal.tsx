import React from "react";
import { X, Calendar, Clock, MapPin, Users, CheckCircle2, Ticket, Lock, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import type { EventItem, EventPackage, User } from "../types";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
  currentUser: User | null;
  onOpenAuth: () => void;
  onSelectPackageForCheckout: (event: EventItem, pkg: EventPackage) => void;
}

export default function EventModal({
  isOpen,
  onClose,
  event,
  currentUser,
  onOpenAuth,
  onSelectPackageForCheckout
}: EventModalProps) {
  if (!isOpen || !event) return null;

  const isUpcoming = event.status === "upcoming" || !event.status;
  const packagesList = event.packages && event.packages.length > 0 ? event.packages : [
    { id: "pkg-std", name: "Standard Delegate Pass", fee: 100, benefits: ["Access to all keynote sessions", "Networking refreshment breaks", "Digital attendee pass"], description: "General Entry Access" },
    { id: "pkg-vip", name: "VIP Executive Gold Pass", fee: 250, benefits: ["Front-row reserved seating", "Exclusive Speaker & Board Dinner", "1-on-1 networking concierge", "VIP Gold Badge"], description: "Full VIP All-Access" }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto luxury-shadow animate-fade-in relative text-left my-8">
        
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white bg-slate-900/50 hover:bg-slate-900/80 p-2 rounded-full transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image / Banner */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-900 overflow-hidden">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover opacity-85"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-brand-pink-dark to-slate-800 flex items-center justify-center">
              <Ticket className="w-16 h-16 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-brand-pink text-white uppercase tracking-wider">
                {event.category}
              </span>
              {isUpcoming ? (
                <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-500 text-white uppercase tracking-wider">
                  Active Event
                </span>
              ) : (
                <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-slate-700 text-slate-200 uppercase tracking-wider">
                  Past Event
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display leading-tight">{event.title}</h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Key Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-150 text-xs">
            <div className="flex items-center space-x-3 text-slate-700">
              <Calendar className="w-4 h-4 text-brand-pink shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Date</p>
                <p className="font-semibold">{event.date}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-slate-700">
              <Clock className="w-4 h-4 text-brand-pink shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Time</p>
                <p className="font-semibold">{event.time}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-slate-700">
              <MapPin className="w-4 h-4 text-brand-pink shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Venue</p>
                <p className="font-semibold truncate max-w-[140px]" title={event.location}>{event.location}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Summit Overview & Description</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              {event.description || "Join distinguished executives, industry founders, and corporate leaders for this high-impact WomenPlay leadership gathering."}
            </p>
          </div>

          {/* Guest Notice Alert */}
          {!currentUser && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3 text-xs text-amber-900">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Sign up or Log in required for ticket purchases</p>
                <p className="text-amber-800 text-[11px]">
                  Guests must create an account or sign in to reserve seats, receive digital passes, and access attendee networking features.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand-pink hover:underline cursor-pointer"
                >
                  <span>Sign Up / Log In Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Ticket Categories & Pricing Packages */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Available Ticket Categories & Packages</h3>
                <p className="text-xs text-slate-500">Select your preferred delegate tier to proceed with registration.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packagesList.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white border border-slate-200 hover:border-brand-pink/50 rounded-2xl p-5 luxury-shadow flex flex-col justify-between space-y-4 transition"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-brand-pink/10 text-brand-pink border border-brand-pink/20">
                          {pkg.name}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-2">{pkg.name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-extrabold text-slate-900">${pkg.fee}</span>
                        <span className="text-[10px] text-slate-400 block font-semibold">USD</span>
                      </div>
                    </div>

                    {pkg.description && (
                      <p className="text-xs text-slate-500 leading-relaxed">{pkg.description}</p>
                    )}

                    {pkg.benefits && pkg.benefits.length > 0 && (
                      <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        {pkg.benefits.map((b, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Action Button */}
                  {currentUser ? (
                    <button
                      onClick={() => {
                        onClose();
                        onSelectPackageForCheckout(event, pkg);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-brand-pink hover:bg-brand-pink-dark text-white shadow-md shadow-brand-pink/15 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Select {pkg.name} (${pkg.fee})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAuth();
                      }}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Sign Up to Reserve (${pkg.fee})</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
