import React from "react";
import { Check, Trash2, Edit3, Plus, Download, FileText, Search, RefreshCw, X, AlertCircle, Calendar, MapPin, Clock, Users, QrCode, UploadCloud, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import type { EventItem, EventPackage } from "../types";
import { showConfirmDialog } from "../lib/swal";

interface AdminEventsProps {
  events: EventItem[];
  onRefresh: () => void;
}

export default function AdminEvents({ events, onRefresh }: AdminEventsProps) {
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");

  // Selection
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);
  const [scannerEventId, setScannerEventId] = React.useState<string | null>(null);
  const [eventRegistrations, setEventRegistrations] = React.useState<any[]>([]);
  const [loadingRegs, setLoadingRegs] = React.useState(false);
  const [attendanceRecords, setAttendanceRecords] = React.useState<any[]>([]);
  const [loadingAttendance, setLoadingAttendance] = React.useState(false);

  // Live QR Simulator State
  const [scannedBadgeCode, setScannedBadgeCode] = React.useState("");
  const [checkInMsg, setCheckInMsg] = React.useState("");
  const [checkInError, setCheckInError] = React.useState("");
  const [scannerEnabled, setScannerEnabled] = React.useState(true);

  // CRUD States
  const [isCreating, setIsCreating] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<EventItem | null>(null);

  // Form States
  const [eventForm, setEventForm] = React.useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    image: "",
    category: "Leadership" as any,
    capacity: 100,
    packages: [
      { id: "pkg-std", name: "Standard Badge", fee: 100, benefits: ["All sessions"], description: "General Entry" },
      { id: "pkg-vip", name: "VIP Pass", fee: 250, benefits: ["Front-row, Speaker lunch"], description: "VIP Gold Access" }
    ] as EventPackage[]
  });

  // PDF Preview State
  const [pdfData, setPdfData] = React.useState<{ title: string; headers: string[]; rows: string[][] } | null>(null);

  // Load Event Registrations
  const loadRegistrations = React.useCallback(async (eventId: string) => {
    setLoadingRegs(true);
    setCheckInMsg("");
    setCheckInError("");
    try {
      const res = await fetch(`/api/events/${eventId}/registrations`);
      if (res.ok) {
        const data = await res.json();
        setEventRegistrations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRegs(false);
    }
  }, []);

  const loadAttendance = React.useCallback(async (eventId: string) => {
    setLoadingAttendance(true);
    try {
      const res = await fetch(`/api/events/${eventId}/attendance`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceRecords(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAttendance(false);
    }
  }, []);

  React.useEffect(() => {
    if (selectedEventId) {
      loadRegistrations(selectedEventId);
      loadAttendance(selectedEventId);
    } else {
      setEventRegistrations([]);
      setAttendanceRecords([]);
    }
  }, [selectedEventId, loadRegistrations, loadAttendance]);

  const resetForm = () => {
    setEventForm({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      image: "",
      category: "Leadership" as any,
      capacity: 100,
      packages: [
        { id: "pkg-std", name: "Standard Badge", fee: 100, benefits: ["All sessions"], description: "General Entry" },
        { id: "pkg-vip", name: "VIP Pass", fee: 250, benefits: ["Front-row, Speaker lunch"], description: "VIP Gold Access" }
      ]
    });
    setIsCreating(false);
    setEditingEvent(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventForm)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Executive Event scheduled and listed successfully!");
        onRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to schedule event.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventForm.title,
          description: eventForm.description,
          date: eventForm.date,
          time: eventForm.time,
          location: eventForm.location,
          image: eventForm.image,
          category: eventForm.category,
          capacity: eventForm.capacity,
          packages: eventForm.packages
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Event details updated successfully!");
        onRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to update event details.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmDialog("Cancel & Delete Event?", "Are you sure you want to cancel and delete this event listing? All registrations will be archived.", "Yes, Delete Event");
    if (!confirmed) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Event successfully removed from public schedule.");
        if (selectedEventId === id) setSelectedEventId(null);
        onRefresh();
      } else {
        setError(data.error || "Failed to delete event.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDeactivate = async (event: EventItem) => {
    const isDeactivated = event.status === "deactivated" || Boolean(event.deactivated);
    const newDeactivated = !isDeactivated;
    const confirmMsg = newDeactivated
      ? `Are you sure you want to close and deactivate "${event.title}"? Deactivated events will not appear on the website, but members who bought tickets can still view details in their membership portal.`
      : `Reactivate "${event.title}" and make it visible on the public website?`;

    const confirmed = await showConfirmDialog(
      newDeactivated ? "Deactivate Event?" : "Reactivate Event?",
      confirmMsg,
      newDeactivated ? "Yes, Deactivate" : "Yes, Reactivate"
    );
    if (!confirmed) return;

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/events/${event.id}/deactivate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deactivated: newDeactivated })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(newDeactivated ? `Event "${event.title}" closed & deactivated.` : `Event "${event.title}" reactivated!`);
        onRefresh();
      } else {
        setError(data.error || "Failed to update event status.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBadgeCheckIn = async (codeToSubmit?: string) => {
    const code = codeToSubmit || scannedBadgeCode;
    if (!selectedEventId || !code.trim()) return;

    setCheckInMsg("");
    setCheckInError("");

    try {
      const res = await fetch(`/api/events/${selectedEventId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeCode: code.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.alreadyCheckedIn) {
          setCheckInMsg(data.message);
        } else {
          setCheckInMsg(data.message);
          setScannedBadgeCode("");
        }
        loadRegistrations(selectedEventId);
        loadAttendance(selectedEventId);
      } else {
        setCheckInError(data.error || "Failed to process check-in.");
      }
    } catch (err) {
      setCheckInError("Server error verifying credentials.");
    }
  };

  const simulateFastScan = () => {
    if (!selectedEventId) return;
    if (eventRegistrations.length === 0) {
      setCheckInError("No registrations are logged for this event.");
      return;
    }
    const unChecked = eventRegistrations.filter(r => !r.attended);
    if (unChecked.length === 0) {
      setCheckInMsg("All registered attendees are checked-in!");
      return;
    }
    const randomReg = unChecked[Math.floor(Math.random() * unChecked.length)];
    setScannedBadgeCode(randomReg.badgeCode);
    handleBadgeCheckIn(randomReg.badgeCode);
  };

  const closeScanner = () => {
    setScannerEventId(null);
    setCheckInMsg("");
    setCheckInError("");
    setScannedBadgeCode("");
  };

  const startEdit = (event: EventItem) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time || "",
      location: event.location,
      image: event.image || "",
      category: event.category,
      capacity: event.capacity,
      packages: event.packages || []
    });
    setIsCreating(false);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Event ID", "Category", "Title", "Date", "Location", "Capacity", "Registered Count"];
    const rows = filteredEvents.map(e => [
      e.id,
      e.category,
      `"${e.title.replace(/"/g, '""')}"`,
      e.date,
      `"${e.location.replace(/"/g, '""')}"`,
      e.capacity,
      e.registeredCount
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `WomenPlay_Events_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF (Virtual preview)
  const exportToPDF = () => {
    const headers = ["Title", "Category", "Date", "Location", "Capacity", "Registered"];
    const rows = filteredEvents.map(e => [
      e.title,
      e.category,
      e.date,
      e.location,
      String(e.capacity),
      `${e.registeredCount} / ${e.capacity}`
    ]);
    setPdfData({
      title: "WomenPlay Scheduled Executive Events Ledger",
      headers,
      rows
    });
  };

  // Export Attendance Ledger to CSV
  const exportAttendanceCSV = () => {
    if (!selectedEventId) return;
    const ev = events.find(e => e.id === selectedEventId);
    const headers = ["Full Name", "Email Address", "Event Access Code", "Event Name", "Event ID", "Checked-In At"];
    const rows = attendanceRecords.map(rec => [
      `"${(rec.fullName || "").replace(/"/g, '""')}"`,
      `"${(rec.email || "").replace(/"/g, '""')}"`,
      rec.accessCode,
      `"${(rec.eventName || "").replace(/"/g, '""')}"`,
      rec.eventId,
      rec.scannedAt
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `WomenPlay_Event_Attendance_${ev ? ev.title.replace(/\s+/g, "_") : "Report"}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Attendance Ledger to PDF (Virtual preview + print download)
  const exportAttendancePDF = () => {
    if (!selectedEventId) return;
    const ev = events.find(e => e.id === selectedEventId);
    const headers = ["Full Name", "Email", "Access Code", "Event Name", "Event ID", "Checked-In At"];
    const rows = attendanceRecords.map(rec => [
      rec.fullName || "",
      rec.email || "",
      rec.accessCode,
      rec.eventName || "",
      rec.eventId,
      new Date(rec.scannedAt).toLocaleString()
    ]);
    setPdfData({
      title: `Attendance Ledger — ${ev ? ev.title : "Event"}`,
      headers,
      rows
    });
  };

  const filteredEvents = events.filter(e => {
    return e.title.toLowerCase().includes(search.toLowerCase()) || 
           e.category.toLowerCase().includes(search.toLowerCase()) || 
           e.location.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6" id="panel-admin-events">
      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl font-semibold text-xs flex items-center justify-between shadow-xs" id="events-success-alert">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-500 hover:text-emerald-700 font-bold">×</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl font-semibold text-xs flex items-center justify-between shadow-xs" id="events-error-alert">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {error}
          </span>
          <button onClick={() => setError("")} className="text-rose-500 hover:text-rose-700 font-bold">×</button>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 luxury-shadow">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Active Event Listings & Check-in</h2>
          <p className="text-xs text-slate-500 mt-1">Schedule summits, assign ticket tiers, track high-society subscribers, and scanning attendance.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={exportToCSV}
            className="flex-1 sm:flex-initial py-1.5 px-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 flex items-center justify-center gap-1 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportToPDF}
            className="flex-1 sm:flex-initial py-1.5 px-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 flex items-center justify-center gap-1 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
            className="flex-1 sm:flex-initial py-1.5 px-3 bg-brand-pink text-white rounded-xl font-bold text-xs hover:bg-brand-pink-dark flex items-center justify-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Summit</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-150 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search events by title, location, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink"
          />
        </div>
        <button
          onClick={() => {
            setSearch("");
            onRefresh();
          }}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition shrink-0"
          title="Refresh Events"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Container */}
      <div className="space-y-8">
        
      {/* Full Width Create or Edit Event Form */}
      {(isCreating || editingEvent) && (
        <div className="w-full bg-white p-6 md:p-8 rounded-3xl border border-slate-100 luxury-shadow animate-in slide-in-from-top duration-300 mb-8 text-left space-y-6">
          <div className="flex justify-between items-center border-b border-slate-150 pb-4">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-pink" />
                <span>{editingEvent ? "Modify Summit Details & Ticket Tiers" : "Schedule New Executive Summit"}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Fill in summit details, cover image, venue capacity, and custom ticket packages below.</p>
            </div>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-50 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={editingEvent ? handleUpdate : handleCreate} className="space-y-6">
            
            {/* Top Grid: Title, Category, Date, Time, Venue, Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1 lg:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">Summit Title</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Global Female Founders Summit 2026"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-brand-pink focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Category</label>
                <select
                  value={eventForm.category}
                  onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-brand-pink focus:outline-none"
                >
                  <option value="Conference">Conference</option>
                  <option value="Networking">Networking</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Social">Social</option>
                  <option value="Workshop">Workshop</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Date</label>
                <input
                  type="date"
                  required
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-brand-pink focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Time</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., 2:00 PM - 6:00 PM EST"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-brand-pink focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Location Venue</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Park Lane Hotel, NYC / Virtual Ballroom"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-brand-pink focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Venue Capacity</label>
                <input
                  type="number"
                  required
                  value={eventForm.capacity}
                  onChange={(e) => setEventForm({ ...eventForm, capacity: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-brand-pink focus:outline-none"
                />
              </div>
            </div>

            {/* Description & Cover Image Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Event Overview & Agenda Description</label>
                <textarea
                  rows={6}
                  placeholder="Overview, keynote speakers, agenda highlights, panel discussions..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:bg-white focus:border-brand-pink focus:outline-none"
                />
              </div>

              {/* Cover Image Upload Area */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Summit Cover Banner Image</label>
                
                {eventForm.image ? (
                  <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 h-40 flex items-center justify-center">
                    <img 
                      src={eventForm.image} 
                      alt="Cover Preview" 
                      className="w-full h-full object-cover group-hover:opacity-75 transition duration-300" 
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center gap-3">
                      <label 
                        htmlFor="event-image-file-input"
                        className="px-3 py-1.5 bg-white text-slate-900 rounded-xl font-bold text-xs cursor-pointer shadow hover:bg-slate-100 transition flex items-center gap-1"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-brand-pink" />
                        <span>Change File</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setEventForm({ ...eventForm, image: "" })}
                        className="p-1.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition cursor-pointer"
                        title="Remove Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label 
                    htmlFor="event-image-file-input"
                    className="border-2 border-dashed border-slate-200 hover:border-brand-pink rounded-2xl p-6 h-40 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-brand-pink/5 transition text-center group"
                  >
                    <div className="p-3 rounded-full bg-white border border-slate-200 group-hover:scale-110 transition shadow-sm mb-2">
                      <UploadCloud className="w-6 h-6 text-brand-pink" />
                    </div>
                    <p className="text-xs font-extrabold text-slate-800">Click to upload event banner or drag & drop</p>
                    <p className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, WEBP (Max 5MB)</p>
                  </label>
                )}

                <input 
                  type="file"
                  id="event-image-file-input"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        alert("File size exceeds 5MB limit. Please upload a smaller image.");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEventForm(prev => ({ ...prev, image: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                {/* Optional URL input fallback */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-400 shrink-0 font-bold uppercase">Or Image URL:</span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={eventForm.image}
                    onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Ticket Category Packages Section */}
            <div className="space-y-4 pt-4 border-t border-slate-150">
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-xs font-extrabold uppercase text-slate-900 block">Ticket Categories & Pricing Packages</label>
                  <p className="text-[11px] text-slate-500">Define ticket tiers (VIP Pass, General Delegate, Corporate Table) and their fee & perks.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newPkg: EventPackage = {
                      id: `pkg-${Date.now()}`,
                      name: "Delegate Pass",
                      fee: 150,
                      description: "Access to main sessions",
                      benefits: ["General Sessions", "Networking Cocktail"]
                    };
                    setEventForm({ ...eventForm, packages: [...eventForm.packages, newPkg] });
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold bg-brand-pink/10 text-brand-pink hover:bg-brand-pink/20 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Ticket Package</span>
                </button>
              </div>

              {eventForm.packages.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No custom ticket packages created yet. Click "Add Ticket Package" above.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-1">
                  {eventForm.packages.map((pkg, index) => (
                    <div key={pkg.id || index} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative group hover:border-slate-300 transition">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = eventForm.packages.filter((_, i) => i !== index);
                          setEventForm({ ...eventForm, packages: updated });
                        }}
                        className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition"
                        title="Remove Package"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-2 gap-2 pr-6">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Category Tier Name</label>
                          <input
                            type="text"
                            required
                            value={pkg.name}
                            onChange={(e) => {
                              const updated = [...eventForm.packages];
                              updated[index] = { ...updated[index], name: e.target.value };
                              setEventForm({ ...eventForm, packages: updated });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                            placeholder="E.g. VIP Gold Badge"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Fee ($ USD)</label>
                          <input
                            type="number"
                            required
                            value={pkg.fee}
                            onChange={(e) => {
                              const updated = [...eventForm.packages];
                              updated[index] = { ...updated[index], fee: Number(e.target.value) };
                              setEventForm({ ...eventForm, packages: updated });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Package Description</label>
                        <input
                          type="text"
                          value={pkg.description || ""}
                          onChange={(e) => {
                            const updated = [...eventForm.packages];
                            updated[index] = { ...updated[index], description: e.target.value };
                            setEventForm({ ...eventForm, packages: updated });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                          placeholder="Brief summary of tier inclusions..."
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Benefits (comma-separated)</label>
                        <input
                          type="text"
                          value={Array.isArray(pkg.benefits) ? pkg.benefits.join(", ") : pkg.benefits || ""}
                          onChange={(e) => {
                            const updated = [...eventForm.packages];
                            const benefitsArr = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                            updated[index] = { ...updated[index], benefits: benefitsArr };
                            setEventForm({ ...eventForm, packages: updated });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                          placeholder="VIP Lounge Access, Speaker Dinner Pass, Swag Bag"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-150 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="py-2.5 px-5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="py-2.5 px-8 bg-brand-pink hover:bg-brand-pink-dark text-white rounded-xl text-xs font-bold shadow-md shadow-brand-pink/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? "Saving Summit..." : "Save Summit Details"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List Pane */}
      {!selectedEventId && (
        <div className="space-y-4 col-span-full">
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredEvents.map((event) => {
                const isSelected = selectedEventId === event.id;
                const progressPct = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

                return (
                  <div key={event.id} className={`bg-white p-5 rounded-2xl border luxury-shadow flex flex-col md:flex-row gap-5 text-left transition ${
                    isSelected ? "border-brand-pink ring-1 ring-brand-pink/20" : "border-slate-100"
                  }`} id={`event-listing-card-${event.id}`}>
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.title}
                        referrerPolicy="no-referrer"
                        className="w-full md:w-36 h-24 object-cover rounded-xl border border-slate-100 shrink-0 self-center md:self-start"
                      />
                    )}
                    <div className="flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-150 uppercase shrink-0">
                              {event.category}
                            </span>
                            {event.status === "deactivated" || event.deactivated ? (
                              <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 uppercase shrink-0 flex items-center gap-1">
                                Deactivated / Closed
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase shrink-0">
                                Active / Public
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-mono text-slate-400">ID: {event.id}</span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-800 leading-tight">{event.title}</h3>
                        
                        {/* Summary details */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-slate-500 font-semibold pt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{event.date}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{event.time || "Executive Hours"}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{event.location}</span>
                          </span>
                        </div>

                        {/* Capacity progress */}
                        <div className="space-y-1 pt-1 max-w-sm">
                          <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                            <span>REGISTRATION FILL RATE</span>
                            <span>{event.registeredCount} / {event.capacity} SEATS</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                            <div className="bg-brand-pink h-full transition-all" style={{ width: `${progressPct}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end items-center border-t border-slate-100 pt-3 gap-2">
                        <button
                          onClick={() => handleToggleDeactivate(event)}
                          id={`btn-toggle-deactivate-${event.id}`}
                          className={`py-1.5 px-3 rounded-lg font-bold text-[11px] transition flex items-center gap-1 border ${
                            event.status === "deactivated" || event.deactivated
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                              : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                          }`}
                          title={event.status === "deactivated" || event.deactivated ? "Enable Event" : "Deactivate & Close Event"}
                        >
                          <span>{event.status === "deactivated" || event.deactivated ? "Enable" : "Deactivate / Close"}</span>
                        </button>
                        <button
                          onClick={() => setSelectedEventId(isSelected ? null : event.id)}
                          id={`btn-view-event-attendance-${event.id}`}
                          className={`py-1.5 px-3 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
                            isSelected 
                              ? "bg-brand-pink text-white" 
                              : "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700"
                          }`}
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{isSelected ? "Active Ledger" : "View Attendance"}</span>
                        </button>
                        <button
                          onClick={() => { setSelectedEventId(event.id); setScannerEventId(event.id); }}
                          id={`btn-start-scanning-${event.id}`}
                          className="py-1.5 px-3 rounded-lg font-bold text-[11px] transition flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Start Scanning</span>
                        </button>
                        <button
                          onClick={() => startEdit(event)}
                          id={`btn-edit-event-${event.id}`}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                          title="Edit Summit Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          id={`btn-delete-event-${event.id}`}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition"
                          title="Cancel Summit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white py-12 text-center rounded-2xl border border-slate-150 space-y-2">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-bold">No executive forums match the current filter.</p>
              <p className="text-[10px] text-slate-400 font-semibold">Spelling is correct or click "New Summit" to host.</p>
            </div>
          )}
        </div>
        )}
      </div>

      {/* FULL WIDTH ATTENDANCE LIST VIEWPORT WHEN EVENT SELECTED */}
      {selectedEventId && (() => {
        const ev = events.find(e => e.id === selectedEventId);
        if (!ev) return null;
        return (
          <div className="w-full bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow space-y-6 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-brand-pink-light/80 text-brand-pink py-0.5 px-2.5 rounded-full font-bold uppercase tracking-wider">{ev.category}</span>
                  <span className="text-xs text-slate-400 font-mono">ID: {ev.id}</span>
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg mt-1">{ev.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">📅 {ev.date} at {ev.time} • 📍 {ev.location}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={exportAttendanceCSV}
                  className="py-1.5 px-3 rounded-xl font-bold text-[11px] uppercase flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
                <button
                  onClick={exportAttendancePDF}
                  className="py-1.5 px-3 rounded-xl font-bold text-[11px] uppercase flex items-center gap-1.5 bg-brand-pink-light/60 hover:bg-brand-pink-light text-brand-pink border border-brand-pink/20 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Download Report
                </button>
                <button 
                  onClick={() => setSelectedEventId(null)} 
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 transition"
                >
                  <X className="w-4 h-4" />
                  <span>Close</span>
                </button>
              </div>
            </div>

            {/* ATTENDANCE LEDGER (Attendance module) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Event Attendance List ({attendanceRecords.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Attendees verified & checked-in for this event via access pass scanning.
                  </p>
                </div>
              </div>

              {loadingAttendance ? (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  Loading attendance records...
                </div>
              ) : attendanceRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] tracking-wider border-y border-slate-200">
                        <th className="p-3">Full Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3 font-mono">Event Access Code</th>
                        <th className="p-3">Event Name</th>
                        <th className="p-3 font-mono">Event ID</th>
                        <th className="p-3">Checked-In At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendanceRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-brand-pink-light/60 text-brand-pink font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                                {(rec.fullName || "A").slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-800">{rec.fullName}</span>
                            </div>
                          </td>
                          <td className="p-3 text-slate-500">{rec.email}</td>
                          <td className="p-3 font-mono text-slate-800 font-bold">
                            <span className="bg-slate-100 px-2 py-1 rounded text-[10px] border border-slate-200 text-slate-800">
                              {rec.accessCode}
                            </span>
                          </td>
                          <td className="p-3 text-slate-700 font-semibold">{rec.eventName}</td>
                          <td className="p-3 font-mono text-slate-500 text-[10px]">{rec.eventId}</td>
                          <td className="p-3 text-slate-500">{new Date(rec.scannedAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-slate-200">
                  No attendance records for this event yet. Scan access passes to check attendees in.
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* PDF PRINT PREVIEW MODAL */}
      {pdfData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" id="events-pdf-modal">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-brand-pink" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Aura Document Preview</span>
              </div>
              <button onClick={() => setPdfData(null)} className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6 text-left flex-1 bg-white" id="events-printable-area">
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="font-display font-black text-lg text-slate-900 tracking-tight uppercase">WomenPlay Corporate</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">High-Society Executive Registry</p>
                </div>
                <div className="text-right text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  <p>Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-brand-pink font-extrabold text-[8px]">STRICTLY CONFIDENTIAL</p>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">{pdfData.title}</h2>
                <p className="text-[10px] text-slate-500 leading-normal mt-1">
                  An audited high-society ledger detailing scheduled forums, corporate summits, and check-in registrations.
                </p>
              </div>

              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-[9px]">
                    {pdfData.headers.map((h, i) => (
                      <th key={i} className="py-2 px-1">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pdfData.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2.5 px-1 font-medium text-slate-700">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase">
                <span>© {new Date().getFullYear()} WomenPlay Inc. All rights reserved.</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setPdfData(null)}
                className="py-1.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-white transition"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="py-1.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center gap-1 shadow"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Print Ledger</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR SCANNER POPUP MODAL */}
      {scannerEventId && (() => {
        const ev = events.find(e => e.id === scannerEventId);
        if (!ev) return null;
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="p-4 sm:p-5 bg-slate-900 text-slate-100 flex justify-between items-center gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-brand-pink/20 flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5 text-brand-pink" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-mono tracking-wider font-extrabold uppercase text-slate-100">
                      QR Scanner Popup
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{ev.title}</p>
                  </div>
                </div>
                <button
                  onClick={closeScanner}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0"
                  aria-label="Close scanner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scanner Body */}
              <div className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${scannerEnabled ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                    <span className="text-xs font-bold text-slate-700">
                      {scannerEnabled ? "Scanner Active" : "Scanner Disabled"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScannerEnabled(!scannerEnabled)}
                    className={`py-1.5 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
                      scannerEnabled
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {scannerEnabled ? "Disable Scanner" : "Enable Scanner"}
                  </button>
                </div>

                {/* Viewport Display */}
                {scannerEnabled ? (
                  <div className="h-52 bg-black rounded-xl relative flex flex-col items-center justify-center border border-slate-800 overflow-hidden">
                    <div className="absolute inset-x-10 top-1/2 h-[2px] bg-brand-pink shadow-[0_0_12px_#DB2777] animate-bounce"></div>
                    <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-brand-pink"></div>
                    <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-brand-pink"></div>
                    <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-brand-pink"></div>
                    <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-brand-pink"></div>

                    <QrCode className="w-12 h-12 text-slate-600 animate-pulse" />
                    <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-widest mt-2">
                      Position QR Code / Access Pass within frame
                    </span>
                  </div>
                ) : (
                  <div className="h-28 bg-slate-100 rounded-xl flex flex-col items-center justify-center border border-slate-200 text-slate-500 text-xs font-medium gap-2">
                    <span>QR Code Scanner is currently disabled.</span>
                    <button
                      onClick={() => setScannerEnabled(true)}
                      className="py-1 px-3 bg-brand-pink text-white rounded-lg text-xs font-bold hover:bg-brand-pink-dark transition"
                    >
                      Enable Scanner
                    </button>
                  </div>
                )}

                {/* Manual Code Input & Quick Simulator */}
                <div className="space-y-2 text-xs">
                  <label className="text-slate-700 font-bold block">Enter or Scan Member Access Pass Code:</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="E.g. AURA-EVT-8923 or Pass Token..."
                      value={scannedBadgeCode}
                      onChange={(e) => setScannedBadgeCode(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-pink"
                    />
                    <button
                      onClick={() => handleBadgeCheckIn()}
                      className="bg-brand-pink hover:bg-brand-pink-dark text-white font-bold px-4 py-2 rounded-xl transition text-xs uppercase shrink-0"
                    >
                      Verify Pass Code
                    </button>
                    <button
                      type="button"
                      onClick={simulateFastScan}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-2 rounded-xl transition text-xs uppercase shrink-0"
                    >
                      Simulate Scan
                    </button>
                  </div>
                </div>

                {checkInMsg && <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200 font-bold">{checkInMsg}</p>}
                {checkInError && <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 font-bold">{checkInError}</p>}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
