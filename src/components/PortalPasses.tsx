import React from "react";
import { User, Registration, EventItem } from "../types";
import DigitalBadge from "./DigitalBadge";

interface PortalPassesProps {
  selectedBadge: Registration | null;
  onSelectBadge: (badge: Registration | null) => void;
  registrations: Registration[];
  events: EventItem[];
  currentUser: User;
}

export default function PortalPasses({
  selectedBadge,
  onSelectBadge,
  registrations,
  events,
  currentUser
}: PortalPassesProps) {
  if (selectedBadge) {
    const ev = events.find(e => e.id === selectedBadge.eventId);
    return (
      <div className="space-y-4 text-center">
        <button
          onClick={() => onSelectBadge(null)}
          id="btn-back-to-badges-list"
          className="text-xs font-semibold text-brand-pink hover:text-brand-pink-dark flex items-center justify-center mx-auto"
        >
          ← Back to Passes List
        </button>
        <DigitalBadge
          attendeeName={currentUser.fullName}
          badgeType={selectedBadge.packageName}
          eventTitle={ev?.title || "Leadership Event"}
          eventDate={ev?.date || "TBD"}
          eventLocation={ev?.location || "TBD"}
          badgeCode={selectedBadge.badgeCode}
          seat={selectedBadge.seat}
        />
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl space-y-3">
        <p>You have not registered for any upcoming WomenPlay sessions yet.</p>
        <p className="text-brand-pink font-semibold">Visit the homepage to view outstanding summit itineraries!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {registrations.map((reg) => {
        const ev = events.find(e => e.id === reg.eventId);
        return (
          <div key={reg.id} className="border border-brand-gold/30 gold-gradient p-5 rounded-2xl flex flex-col justify-between" id={`pass-item-${reg.id}`}>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] uppercase tracking-wider bg-brand-gold-dark text-white px-2 py-0.5 rounded-full font-bold">
                  {reg.packageName}
                </span>
                {(ev?.status === "deactivated" || ev?.deactivated) && (
                  <span className="text-[9px] uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full font-extrabold">
                    Session Closed
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{ev?.title || "Registered Session"}</h3>
              <p className="text-[11px] text-slate-500 font-medium">Code: {reg.badgeCode}</p>
              {ev && (
                <div className="text-[10px] text-slate-600 space-y-0.5">
                  <p><strong>Date:</strong> {ev.date} ({ev.time})</p>
                  <p><strong>Location:</strong> {ev.location}</p>
                </div>
              )}
              {reg.seat && (
                <p className="text-xs font-bold text-brand-pink mt-1">
                  Reserved Seat: {reg.seat}
                </p>
              )}
            </div>

            <button
              onClick={() => onSelectBadge(reg)}
              id={`btn-view-pass-${reg.id}`}
              className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-xs transition"
            >
              Display Digital Badge
            </button>
          </div>
        );
      })}
    </div>
  );
}
