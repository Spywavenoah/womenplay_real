import React from "react";
import { Search, Calendar, HelpCircle, CalendarDays, Eye, Ticket } from "lucide-react";
import { motion } from "motion/react";
import type { EventItem, EventPackage, User } from "../types";
import HeroBanner from "./HeroBanner";
import EventModal from "./EventModal";

interface EventsViewProps {
  events: EventItem[];
  currentUser?: User | null;
  onOpenAuth?: () => void;
  onRegisterEvent: (eventId: string) => void;
  onSelectPackageForCheckout?: (event: EventItem, pkg: EventPackage) => void;
  onNavigateHome: () => void;
}

const CATEGORY_TABS = ["all", "Conference", "Networking", "Leadership", "Workshop"] as const;
type CategoryTab = (typeof CATEGORY_TABS)[number];

export default function EventsView({
  events,
  currentUser = null,
  onOpenAuth = () => {},
  onRegisterEvent,
  onSelectPackageForCheckout,
  onNavigateHome
}: EventsViewProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<CategoryTab>("all");
  const [selectedEventForModal, setSelectedEventForModal] = React.useState<EventItem | null>(null);

  const filteredEvents = events.filter(e => {
    if (e.status === "deactivated" || e.deactivated) return false;
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || e.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="bg-slate-50 text-left">
      {/* Hero Banner */}
      <HeroBanner
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Upcoming & Previous Sessions
          </span>
        }
        title={
          <>
            Our <em className="gold-text-gradient not-italic">Distinguished Events</em>
          </>
        }
        description="Explore luxury summits, curated dinners, pitch sessions, and professional board workshops. Book premium registration badges directly inside."
        onNavigateHome={onNavigateHome}
      />

      {/* Events Section */}
      <section className="bg-slate-50 py-20" id="events-view-landing">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          {/* Search + Filter Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-slate-200 pb-8">
            <div className="space-y-3 text-left">
              <span className="text-xs uppercase tracking-widest font-extrabold text-brand-pink">EVENTS</span>
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900">
                Find your next <span className="gold-text-gradient">gathering</span>
              </h2>
            </div>

            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events, cities, dates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  id="input-search-events"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink text-sm"
                />
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-start">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                id={`tab-category-${tab}`}
                className={`py-2 px-5 rounded-full text-xs font-semibold tracking-wider uppercase transition ${
                  activeTab === tab
                    ? "bg-brand-pink text-white shadow-md shadow-brand-pink/20"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-brand-pink-light/30"
                }`}
              >
                {tab === "all" ? "All Formats" : tab}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const isUpcoming = event.status === "upcoming";
                return (
                  <motion.div
                    key={event.id}
                    layout
                    id={`event-card-${event.id}`}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-100 luxury-shadow hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image header */}
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        <img
                          src={event.image}
                          alt={event.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm py-1 px-3 rounded-full border border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-sm">
                          {event.category}
                        </div>
                        {event.registeredCount >= event.capacity && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                            <span className="text-white text-xs uppercase tracking-widest font-bold border border-white/40 py-1.5 px-4 rounded-lg">SOLD OUT</span>
                          </div>
                        )}
                      </div>

                      {/* Content block */}
                      <div
                        onClick={() => setSelectedEventForModal(event)}
                        className="p-6 space-y-4 text-left cursor-pointer"
                      >
                        <div className="flex items-center space-x-4 text-xs font-medium text-slate-500">
                          <div className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-brand-gold-dark" />
                            <span>{event.date}</span>
                          </div>
                          <span>•</span>
                          <span>{event.time}</span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2 hover:text-brand-pink transition-colors">
                          {event.title}
                        </h3>

                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                          {event.description}
                        </p>
                      </div>
                    </div>

                    {/* Booking/Status Footer */}
                    <div className="p-6 pt-0 border-t border-slate-50 mt-4 flex items-center justify-between">
                      <div className="text-left cursor-pointer" onClick={() => setSelectedEventForModal(event)}>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Registration Fee</span>
                        <span className="text-sm font-bold text-brand-gold-dark">
                          {event.packages && event.packages.length > 0
                            ? `From $${Math.min(...event.packages.map(p => p.fee))}`
                            : "From $100"}
                        </span>
                      </div>

                      {isUpcoming && event.registeredCount < event.capacity ? (
                        <button
                          onClick={() => setSelectedEventForModal(event)}
                          id={`btn-register-event-${event.id}`}
                          className="py-2 px-4 rounded-xl text-xs font-bold bg-brand-pink hover:bg-brand-pink-dark text-white shadow-md shadow-brand-pink/10 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>View Categories</span>
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 py-2 px-3 bg-slate-50 rounded-lg">
                          {!isUpcoming ? "Past Event" : "Sold Out"}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-100 luxury-shadow">
                <HelpCircle className="w-12 h-12 text-brand-pink-mid mx-auto mb-3" />
                <h4 className="text-lg font-bold text-slate-800">No events matched your search</h4>
                <p className="text-slate-500 text-xs mt-1">Try refining your keyword or category selection.</p>
              </div>
            )}
          </div>

          <div className="text-center pt-8">
            <a
              href="/founders"
              className="inline-flex items-center bg-brand-pink hover:bg-brand-pink-dark text-white font-bold px-8 py-3.5 rounded-full shadow-md shadow-brand-pink/25 transition hover:-translate-y-0.5 text-sm cursor-pointer"
            >
              Become a Member
            </a>
          </div>

        </div>
      </section>

      {/* Event Categories & Pricing Modal */}
      <EventModal
        isOpen={!!selectedEventForModal}
        onClose={() => setSelectedEventForModal(null)}
        event={selectedEventForModal}
        currentUser={currentUser}
        onOpenAuth={onOpenAuth}
        onSelectPackageForCheckout={(event, pkg) => {
          setSelectedEventForModal(null);
          if (onSelectPackageForCheckout) {
            onSelectPackageForCheckout(event, pkg);
          } else {
            onRegisterEvent(event.id);
          }
        }}
      />
    </div>
  );
}
