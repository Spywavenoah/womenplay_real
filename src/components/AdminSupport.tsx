import React from "react";
import { Trash2, Edit3, Plus, Download, FileText, Search, RefreshCw, X, AlertCircle, MessageSquare, Send, CheckCircle2, Inbox } from "lucide-react";
import type { SupportTicket } from "../types";
import { showConfirmDialog } from "../lib/swal";

interface AdminSupportProps {
  tickets: SupportTicket[];
  currentUser: any;
  onRefresh: () => void;
}

export default function AdminSupport({ tickets, currentUser, onRefresh }: AdminSupportProps) {
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<"all" | "open" | "in_progress" | "resolved">("all");
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");

  // CRUD States
  const [isCreating, setIsCreating] = React.useState(false);
  const [editingTicket, setEditingTicket] = React.useState<SupportTicket | null>(null);

  // Form States
  const [ticketForm, setTicketForm] = React.useState({
    subject: "",
    message: "",
    category: "Membership",
    status: "open" as "open" | "in_progress" | "resolved",
    userFullName: currentUser?.fullName || "Aura Member",
    email: currentUser?.email || "aura-member@example.com"
  });

  // Reply States
  const [replyText, setReplyText] = React.useState("");

  // PDF Preview State
  const [pdfData, setPdfData] = React.useState<{ title: string; headers: string[]; rows: string[][] } | null>(null);

  // Auto-select first ticket if none selected
  React.useEffect(() => {
    if (tickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId]);

  const resetForm = () => {
    setTicketForm({
      subject: "",
      message: "",
      category: "Membership",
      status: "open",
      userFullName: currentUser?.fullName || "Aura Member",
      email: currentUser?.email || "aura-member@example.com"
    });
    setIsCreating(false);
    setEditingTicket(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: ticketForm.subject,
          message: ticketForm.message,
          category: ticketForm.category,
          userFullName: ticketForm.userFullName,
          email: ticketForm.email,
          userId: currentUser?.id || "guest",
          status: ticketForm.status
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Support ticket registered successfully!");
        onRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to log support ticket.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/tickets/${editingTicket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: ticketForm.subject,
          message: ticketForm.message,
          category: ticketForm.category,
          status: ticketForm.status
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Support ticket details updated successfully.");
        onRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to update support ticket.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmDialog("Delete Concierge Record?", "Are you sure you want to delete this concierge support record permanently?", "Yes, Delete Record");
    if (!confirmed) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Support ticket successfully purged.");
        if (selectedTicketId === id) setSelectedTicketId(null);
        onRefresh();
      } else {
        setError(data.error || "Failed to delete support ticket.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyText.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/tickets/${selectedTicketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "ADMIN",
          message: replyText.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReplyText("");
        onRefresh();
      } else {
        setError(data.error || "Failed to send response.");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: "open" | "in_progress" | "resolved") => {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/support/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Ticket status set to ${status.replace("_", " ")}`);
        onRefresh();
      } else {
        setError(data.error || "Failed to change status.");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (ticket: SupportTicket) => {
    setEditingTicket(ticket);
    setTicketForm({
      subject: ticket.subject,
      message: ticket.message,
      category: ticket.category,
      status: ticket.status,
      userFullName: ticket.userFullName,
      email: ticket.email
    });
    setIsCreating(false);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Ticket ID", "Category", "User", "Email", "Subject", "Status", "Latest Reply Count"];
    const rows = filteredTickets.map(t => [
      t.id,
      t.category,
      `"${t.userFullName.replace(/"/g, '""')}"`,
      `"${t.email.replace(/"/g, '""')}"`,
      `"${t.subject.replace(/"/g, '""')}"`,
      t.status,
      t.responses?.length || 0
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Concierge_Support_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const exportToPDF = () => {
    const headers = ["User", "Subject", "Category", "Status", "Replies"];
    const rows = filteredTickets.map(t => [
      t.userFullName,
      t.subject,
      t.category,
      t.status,
      String(t.responses?.length || 0)
    ]);
    setPdfData({
      title: "WomenPlay Concierge Support & complaints Desk Register",
      headers,
      rows
    });
  };

  const filteredTickets = tickets.filter(t => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || 
                        t.userFullName.toLowerCase().includes(search.toLowerCase()) || 
                        t.message.toLowerCase().includes(search.toLowerCase()) || 
                        t.category.toLowerCase().includes(search.toLowerCase());
    
    if (filterStatus === "all") return matchSearch;
    return matchSearch && t.status === filterStatus;
  });

  const activeTicket = tickets.find(t => t.id === selectedTicketId);

  return (
    <div className="space-y-6" id="panel-admin-support">
      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl font-semibold text-xs flex items-center justify-between shadow-xs" id="support-success-alert">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-500 hover:text-emerald-700 font-bold">×</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl font-semibold text-xs flex items-center justify-between shadow-xs" id="support-error-alert">
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
          <h2 className="text-sm font-bold text-slate-800">Concierge Support & Complaints Desk</h2>
          <p className="text-xs text-slate-500 mt-1">Manage private inquiries, complaints, and billing disputes. Transmit official responses instantly.</p>
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
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-150 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tickets by user, subject, category, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
          <div className="flex bg-slate-100 rounded-xl p-0.5 border border-slate-200">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                filterStatus === "all" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("open")}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                filterStatus === "open" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setFilterStatus("in_progress")}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                filterStatus === "in_progress" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus("resolved")}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                filterStatus === "resolved" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Resolved
            </button>
          </div>
          <button
            onClick={() => {
              setSearch("");
              onRefresh();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Three Column/Split Panel View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CREATE / EDIT FORM (WHEN ACTIVE) */}
        {(isCreating || editingTicket) && (
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow text-left h-fit animate-in slide-in-from-left duration-200">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3 mb-4">
              <h3 className="text-xs font-extrabold uppercase text-slate-800 flex items-center gap-1">
                <Edit3 className="w-4 h-4 text-brand-pink" />
                <span>{editingTicket ? "Modify Support Ticket" : "Register Manual Inquiry"}</span>
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingTicket ? handleUpdate : handleCreate} className="space-y-4">
              {!editingTicket && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Reporter Name</label>
                    <input
                      type="text"
                      required
                      value={ticketForm.userFullName}
                      onChange={(e) => setTicketForm({ ...ticketForm, userFullName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Reporter Email</label>
                    <input
                      type="email"
                      required
                      value={ticketForm.email}
                      onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Inquiry Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Billing discrepancy / Account lock"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="Membership">Membership</option>
                    <option value="Billing">Billing</option>
                    <option value="Events">Events</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Initial Status</label>
                  <select
                    value={ticketForm.status}
                    onChange={(e) => setTicketForm({ ...ticketForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Message description</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Detail the query parameters or incident description..."
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2 px-3 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-3 bg-brand-pink hover:bg-brand-pink-dark text-white rounded-lg text-xs font-bold transition flex items-center justify-center"
                >
                  {loading ? "Saving..." : "Save Ticket"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TICKET LIST PANE */}
        <div className={`space-y-4 lg:max-h-[600px] overflow-y-auto pr-1 text-left ${
          isCreating || editingTicket ? "lg:col-span-3" : "lg:col-span-5"
        }`}>
          <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider mb-2">Support Tickets ({filteredTickets.length})</span>
          {filteredTickets.length > 0 ? (
            <div className="space-y-3">
              {filteredTickets.map((t) => {
                const isSelected = selectedTicketId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer text-xs space-y-2 relative overflow-hidden ${
                      isSelected 
                        ? "bg-brand-pink-light/20 border-brand-pink shadow-xs" 
                        : "bg-white border-slate-100 hover:bg-slate-50"
                    }`}
                    id={`support-ticket-item-${t.id}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="bg-brand-pink text-white px-2 py-0.5 rounded-full font-bold text-[8px] uppercase tracking-wider">{t.category}</span>
                      <span className={`py-0.5 px-2 rounded-full text-[8px] font-bold uppercase ${
                        t.status === "open" 
                          ? "bg-blue-50 text-blue-700 border border-blue-100" 
                          : t.status === "in_progress" 
                          ? "bg-amber-50 text-amber-700 border border-amber-100" 
                          : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      }`}>{t.status.replace("_", " ")}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 line-clamp-1">{t.subject}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">By: {t.userFullName}</p>
                    </div>

                    <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed italic">"{t.message}"</p>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100/60 text-[9px] font-semibold text-slate-400">
                      <span>{t.responses?.length || 0} responses</span>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(t);
                          }}
                          className="p-1 hover:bg-slate-100 rounded border border-slate-200 text-slate-500"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(t.id);
                          }}
                          className="p-1 hover:bg-red-50 rounded border border-red-100 text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white py-12 text-center rounded-2xl border border-slate-150 space-y-2">
              <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-bold">No tickets found.</p>
            </div>
          )}
        </div>

        {/* CHAT FORMAT CONVERSATION THREAD */}
        <div className={`flex flex-col bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden h-[550px] ${
          isCreating || editingTicket ? "lg:col-span-5" : "lg:col-span-7"
        }`}>
          {activeTicket ? (
            <div className="flex flex-col h-full">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">{activeTicket.category}</span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">#{activeTicket.id}</span>
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm line-clamp-1">{activeTicket.subject}</h3>
                  <p className="text-[10px] text-slate-500 font-semibold">User: <span className="text-slate-700 font-bold">{activeTicket.userFullName}</span> ({activeTicket.email})</p>
                </div>
                
                {/* Header action controls */}
                <div className="flex gap-1.5 self-start sm:self-center shrink-0">
                  {activeTicket.status !== "resolved" ? (
                    <button
                      onClick={() => handleUpdateStatus(activeTicket.id, "resolved")}
                      id={`btn-resolve-chat-${activeTicket.id}`}
                      className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[9px] uppercase tracking-wider flex items-center gap-1 transition"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Resolve & Close</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(activeTicket.id, "open")}
                      className="py-1 px-2.5 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg text-[9px] uppercase tracking-wider transition"
                    >
                      Reopen Ticket
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Thread Messages scrolling pane */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50 text-left">
                {/* Initial Query Message (User) */}
                <div className="flex items-start gap-2.5 max-w-[85%]">
                  <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-extrabold text-xs shrink-0 select-none">
                    {activeTicket.userFullName.charAt(0)}
                  </span>
                  <div className="space-y-1">
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-2xs text-xs text-slate-700 space-y-1">
                      <p className="font-bold text-slate-900">{activeTicket.userFullName}</p>
                      <p className="leading-relaxed font-medium">"{activeTicket.message}"</p>
                    </div>
                    <span className="text-[8px] font-bold text-slate-400 block px-1 uppercase tracking-wider">Inquiry Initiation</span>
                  </div>
                </div>

                {/* Response messages */}
                {activeTicket.responses && activeTicket.responses.map((rep, idx) => {
                  const isAdmin = rep.sender === "ADMIN";
                  return (
                    <div key={idx} className={`flex items-start gap-2.5 max-w-[85%] ${
                      isAdmin ? "ml-auto flex-row-reverse" : ""
                    }`}>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 select-none ${
                        isAdmin 
                          ? "bg-brand-pink text-white" 
                          : "bg-slate-200 text-slate-600"
                      }`}>
                        {isAdmin ? "C" : activeTicket.userFullName.charAt(0)}
                      </span>
                      <div className="space-y-1">
                        <div className={`p-3 rounded-2xl text-xs space-y-1 ${
                          isAdmin 
                            ? "bg-brand-pink text-white rounded-tr-none shadow-2xs" 
                            : "bg-white text-slate-700 rounded-tl-none border border-slate-200 shadow-2xs"
                        }`}>
                          <p className={`font-bold ${isAdmin ? "text-brand-pink-light/30 text-right" : "text-slate-900"}`}>
                            {isAdmin ? "Concierge Desk" : activeTicket.userFullName}
                          </p>
                          <p className="leading-relaxed font-semibold">{rep.message}</p>
                        </div>
                        <span className={`text-[8px] font-bold text-slate-400 block px-1 uppercase tracking-wider ${isAdmin ? "text-right" : ""}`}>
                          {rep.createdAt ? new Date(rep.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Delivered"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Reply Area */}
              {activeTicket.status !== "resolved" ? (
                <form onSubmit={handleReply} className="p-3 border-t border-slate-100 bg-white flex gap-2" id="support-chat-input-form">
                  <input
                    type="text"
                    required
                    placeholder="Type official reply to member..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading || !replyText.trim()}
                    className="p-2.5 bg-brand-pink hover:bg-brand-pink-dark disabled:bg-slate-300 text-white rounded-2xl transition shrink-0 flex items-center justify-center"
                    title="Transmit Reply"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-emerald-50 border-t border-emerald-100 text-center text-xs font-bold text-emerald-800">
                  This concierge ticket is resolved and closed. Reopen to send additional transmissions.
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-2 text-slate-400 bg-slate-50">
              <MessageSquare className="w-12 h-12 text-slate-300 animate-pulse" />
              <p className="text-sm font-bold text-slate-500">No Concierge Conversation Selected</p>
              <p className="text-xs">Select any incoming support inquiry from the left pane to initialize real-time secure communication.</p>
            </div>
          )}
        </div>
      </div>

      {/* PDF PRINT PREVIEW MODAL */}
      {pdfData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" id="support-pdf-modal">
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
            <div className="p-8 overflow-y-auto space-y-6 text-left flex-1 bg-white" id="support-printable-area">
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
                  An audited ledger tracking administrative inquiries, concierge complaints, and billing dispute communications.
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
    </div>
  );
}
