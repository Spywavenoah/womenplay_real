import React from "react";
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, Clock, 
  Search, Filter, Ticket, Sparkles, CheckCircle2, Info, ArrowUpRight
} from "lucide-react";
import type { EventItem, Registration, User } from "../types";

interface EventCalendarProps {
  events: EventItem[];
  registrations: Registration[];
  currentUser: User;
  onRefreshData: () => Promise<void>;
  onViewPasses: () => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function EventCalendar({
  events,
  registrations,
  currentUser,
  onRefreshData,
  onViewPasses
}: EventCalendarProps) {
  // Navigation State
  const [currentDate, setCurrentDate] = React.useState(new Date(2026, 7, 1)); // Default to August 2026 as per sample event data
  const [selectedDateStr, setSelectedDateStr] = React.useState<string>("2026-08-05"); // Default selected date based on popular events
  const [filterCategory, setFilterCategory] = React.useState<string>("All");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [viewMode, setViewMode] = React.useState<"all" | "registered">("all");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper to change month
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate Calendar Days (42 cells: 6 weeks * 7 days)
  const days = React.useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 is Sunday, 1 is Monday...
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const result: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }[] = [];
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // Previous month filler days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = month === 0 ? 11 : month - 1;
      const y = month === 0 ? year - 1 : year;
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      result.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      result.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr
      });
    }

    // Next month filler days
    const remainingCells = 42 - result.length;
    for (let i = 1; i <= remainingCells; i++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      result.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr
      });
    }

    return result;
  }, [year, month]);

  // Set default selected date string when month changes if none is set
  React.useEffect(() => {
    const defaultDateStr = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    // Only update if current selected is not in viewed month
    const selectedMonth = parseInt(selectedDateStr.split("-")[1], 10) - 1;
    const selectedYear = parseInt(selectedDateStr.split("-")[0], 10);
    if (selectedMonth !== month || selectedYear !== year) {
      // Find the first date with an event in the new month if possible, otherwise first day
      const eventInMonth = events.find(e => {
        const ePart = e.date.split("-");
        return parseInt(ePart[0], 10) === year && (parseInt(ePart[1], 10) - 1) === month;
      });
      if (eventInMonth) {
        setSelectedDateStr(eventInMonth.date);
      } else {
        setSelectedDateStr(`${year}-${String(month + 1).padStart(2, "0")}-01`);
      }
    }
  }, [currentDate, events]);

  // Registered Event IDs lookup
  const registeredEventIds = React.useMemo(() => {
    return new Set(registrations.map(r => r.eventId));
  }, [registrations]);

  // Filter events based on search, category and viewMode (registered vs all)
  const filteredEvents = React.useMemo(() => {
    return events.filter(event => {
      // Date matches
      const categoryMatch = filterCategory === "All" || event.category === filterCategory;
      const searchMatch = searchQuery.trim() === "" || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const registrationMatch = viewMode === "all" || registeredEventIds.has(event.id);

      return categoryMatch && searchMatch && registrationMatch;
    });
  }, [events, filterCategory, searchQuery, viewMode, registeredEventIds]);

  // Group events by date for calendar day rendering lookup
  const eventsByDate = React.useMemo(() => {
    const groups: { [key: string]: EventItem[] } = {};
    filteredEvents.forEach(event => {
      if (!groups[event.date]) {
        groups[event.date] = [];
      }
      groups[event.date].push(event);
    });
    return groups;
  }, [filteredEvents]);

  // Get active event details for selected date
  const selectedDateEvents = React.useMemo(() => {
    return filteredEvents.filter(e => e.date === selectedDateStr);
  }, [filteredEvents, selectedDateStr]);

  // Format display date for detail panel header
  const formattedSelectedDate = React.useMemo(() => {
    if (!selectedDateStr) return "";
    const [y, m, d] = selectedDateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }, [selectedDateStr]);

  // Helper to color-code event categories
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Leadership":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          badge: "bg-gradient-to-r from-amber-500 to-yellow-600 text-white"
        };
      case "Workshop":
        return {
          bg: "bg-pink-50 text-pink-700 border-pink-200",
          dot: "bg-brand-pink",
          badge: "bg-gradient-to-r from-pink-500 to-rose-600 text-white"
        };
      case "Networking":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
          badge: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
        };
      case "Conference":
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          dot: "bg-purple-500",
          badge: "bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white"
        };
      default:
        return {
          bg: "bg-slate-50 text-slate-700 border-slate-200",
          dot: "bg-slate-500",
          badge: "bg-gradient-to-r from-slate-500 to-slate-600 text-white"
        };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="portal-calendar-panel">
      {/* Upper Title and Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-display font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand-pink" />
            <span>Executive Scheduled Calendar</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">Visualize high-society board retreats, interactive corporate workshops, and VIP summits on your platform timeline.</p>
        </div>

        {/* Dynamic View Filters Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-auto shrink-0">
          <button
            onClick={() => setViewMode("all")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              viewMode === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            All Scheduled Events
          </button>
          <button
            onClick={() => setViewMode("registered")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
              viewMode === "registered"
                ? "bg-brand-pink text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>My Registered Only ({registrations.length})</span>
          </button>
        </div>
      </div>

      {/* Control Actions Panel (Search, Filters, Month Switcher) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Month Selector */}
        <div className="md:col-span-4 flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2.5">
          <button 
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-brand-pink transition cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-display font-extrabold text-slate-800 text-sm">
            {MONTHS[month]} {year}
          </span>
          <button 
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-brand-pink transition cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search workshops or summits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3 relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition appearance-none"
          >
            <option value="All">All Categories</option>
            <option value="Leadership">Leadership Only</option>
            <option value="Workshop">Workshops Only</option>
            <option value="Conference">Conferences Only</option>
            <option value="Networking">Networking Only</option>
            <option value="Social">Social Events</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Calendar left, Sidebar details right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Calendar Grid Panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-5 luxury-shadow flex flex-col space-y-4">
          
          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((day) => (
              <span key={day} className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid cells */}
          <div className="grid grid-cols-7 gap-1 bg-slate-100/50 p-1 rounded-xl">
            {days.map((cell, idx) => {
              const cellEvents = eventsByDate[cell.dateStr] || [];
              const isSelected = selectedDateStr === cell.dateStr;
              const isToday = cell.isToday;

              // Check if any of the events on this day is registered
              const hasRegisteredEvent = cellEvents.some(ev => registeredEventIds.has(ev.id));

              return (
                <button
                  key={`${cell.dateStr}-${idx}`}
                  type="button"
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[72px] p-1.5 rounded-lg text-left flex flex-col justify-between transition relative border-2 ${
                    cell.isCurrentMonth ? "bg-white" : "bg-slate-50/40 text-slate-300"
                  } ${
                    isSelected 
                      ? "border-brand-pink shadow-md shadow-brand-pink/5" 
                      : isToday 
                        ? "border-slate-800" 
                        : "border-transparent hover:border-slate-200"
                  }`}
                >
                  {/* Top Day Number & Badges */}
                  <div className="flex justify-between items-center w-full">
                    <span className={`text-[11px] font-bold ${
                      isSelected 
                        ? "text-brand-pink text-xs" 
                        : isToday 
                          ? "text-slate-900 bg-slate-150 p-0.5 rounded px-1 text-[10px]" 
                          : cell.isCurrentMonth ? "text-slate-700" : "text-slate-300"
                    }`}>
                      {cell.dayNum}
                    </span>

                    {/* Small Green Badge if they are attending on this day */}
                    {hasRegisteredEvent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Registered Event Today" />
                    )}
                  </div>

                  {/* Render inline short visual indicators of events (desktop-only feel) */}
                  <div className="w-full space-y-1 mt-1 flex-1 flex flex-col justify-end">
                    {cellEvents.slice(0, 2).map((ev) => {
                      const colors = getCategoryColor(ev.category);
                      const isRegistered = registeredEventIds.has(ev.id);
                      return (
                        <div 
                          key={ev.id} 
                          className={`text-[8px] font-semibold py-0.5 px-1 rounded-sm border truncate text-left max-w-full leading-tight flex items-center gap-0.5 ${colors.bg}`}
                          title={`${ev.title} (${ev.category})`}
                        >
                          <span className={`w-1 h-1 rounded-full ${colors.dot} shrink-0`} />
                          <span className="truncate flex-1">{ev.title}</span>
                          {isRegistered && <CheckCircle2 className="w-1.5 h-1.5 text-emerald-500 shrink-0" />}
                        </div>
                      );
                    })}
                    {cellEvents.length > 2 && (
                      <p className="text-[7px] text-slate-400 font-extrabold italic text-right">
                        +{cellEvents.length - 2} more
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Calendar Indicators Guide */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-medium text-slate-400 pt-2 border-t border-slate-50">
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Leadership</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-brand-pink" />
                <span>Workshop</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Conference</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Networking</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Attending Event</span>
            </div>
          </div>

        </div>

        {/* Right Side: Event details panel for selection */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex-1 flex flex-col justify-between">
            
            <div className="space-y-4">
              <div className="border-b border-slate-200/60 pb-3">
                <p className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Date Overview</p>
                <h3 className="text-sm font-extrabold text-slate-800 mt-1">{formattedSelectedDate}</h3>
              </div>

              {/* No events on selected day */}
              {selectedDateEvents.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-3 flex-1 flex flex-col justify-center items-center">
                  <Info className="w-8 h-8 text-slate-300" />
                  <p className="text-xs max-w-xs">There are no matching events or leadership workshops scheduled on this date.</p>
                  <p className="text-[10px] italic text-slate-400">Select another date with visual indicators on the monthly grid to view details.</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-[380px] overflow-y-auto pr-2">
                  {selectedDateEvents.map((event) => {
                    const isRegistered = registeredEventIds.has(event.id);
                    const colors = getCategoryColor(event.category);
                    
                    return (
                      <div key={event.id} className="bg-white p-5 rounded-2xl border border-slate-100 luxury-shadow space-y-4 text-left">
                        {/* Event Heading with Category */}
                        <div className="flex justify-between items-start gap-2">
                          <span className={`text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${colors.badge}`}>
                            {event.category}
                          </span>
                          
                          {isRegistered ? (
                            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Registered</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-slate-400 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-full">
                              <span>Available</span>
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-display font-extrabold text-slate-800 text-sm leading-snug">{event.title}</h4>
                          <p className="text-slate-500 text-[11px] leading-relaxed mt-1.5">{event.description}</p>
                        </div>

                        {/* Metas */}
                        <div className="grid grid-cols-1 gap-2 pt-3 border-t border-slate-50 text-[11px] text-slate-500 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate" title={event.location}>{event.location}</span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        {isRegistered ? (
                          <button
                            type="button"
                            onClick={onViewPasses}
                            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 border border-emerald-200"
                          >
                            <Ticket className="w-4 h-4 text-emerald-600" />
                            <span>Display Pass / Access Badge</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <div className="bg-brand-gold-light/20 border border-brand-gold/30 p-3 rounded-xl text-[11px] text-slate-600 space-y-1">
                            <p className="font-bold flex items-center gap-1 text-slate-800">
                              <Sparkles className="w-3.5 h-3.5 text-brand-gold-dark animate-pulse" />
                              <span>RSVP Open</span>
                            </p>
                            <p>To register or upgrade to VIP package for this {event.category.toLowerCase()}, please return to the Network Homepage and book your ticket.</p>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Quick General Metrics */}
            <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span className="flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5 text-brand-pink" />
                <span>My Registered Activities: <strong>{registrations.length}</strong></span>
              </span>
              <span>Network Base Events: {events.length}</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
