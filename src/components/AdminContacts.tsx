import React, { useState, useMemo } from "react";
import { 
  Mail, Inbox, MessageSquare, Send, CheckCircle2, Trash2, Search, Filter, 
  Clock, User, Phone, Download, RefreshCw, X, AlertCircle, Sparkles, Eye, Archive
} from "lucide-react";
import type { ContactMessage } from "../types";
import { showConfirmDialog, showErrorAlert, showSuccessAlert } from "../lib/swal";

interface AdminContactsProps {
  contacts: ContactMessage[];
  onRefreshData?: () => Promise<void>;
}

export default function AdminContacts({ contacts = [], onRefreshData }: AdminContactsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "read" | "replied" | "archived">("all");
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const nameStr = c.firstName || c.fullName || "";
      const matchesSearch = 
        nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.interest || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.organization || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.message.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [contacts, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = contacts.length;
    const newCount = contacts.filter(c => c.status === "new").length;
    const readCount = contacts.filter(c => c.status === "read").length;
    const repliedCount = contacts.filter(c => c.status === "replied").length;
    const archivedCount = contacts.filter(c => c.status === "archived").length;
    return { total, newCount, readCount, repliedCount, archivedCount };
  }, [contacts]);

  // Handle Refresh
  const handleRefresh = async () => {
    if (onRefreshData) {
      setLoading(true);
      try {
        await onRefreshData();
      } finally {
        setLoading(false);
      }
    }
  };

  // Delete message
  const handleDelete = async (id: string, name: string) => {
    const confirmed = await showConfirmDialog(
      "Delete Contact Message?",
      `Are you sure you want to permanently delete the inquiry from ${name}?`,
      "Yes, Delete Message"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/contact-messages/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        showSuccessAlert("Deleted", data.message || "Contact message deleted.");
        if (selectedContact?.id === id) setSelectedContact(null);
        if (onRefreshData) await onRefreshData();
      } else {
        showErrorAlert("Error", data.error || "Failed to delete contact message.");
      }
    } catch (err) {
      console.error(err);
      showErrorAlert("Error", "Network error deleting contact message.");
    }
  };

  // Update Status
  const handleStatusChange = async (contact: ContactMessage, newStatus: "new" | "read" | "replied" | "archived") => {
    setUpdatingStatusId(contact.id);
    try {
      const res = await fetch(`/api/contact-messages/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        if (selectedContact?.id === contact.id) {
          setSelectedContact(prev => prev ? { ...prev, status: newStatus } : null);
        }
        if (onRefreshData) await onRefreshData();
      } else {
        showErrorAlert("Error", data.error || "Failed to update message status.");
      }
    } catch (err) {
      console.error(err);
      showErrorAlert("Error", "Network error updating message status.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Send Reply via Email
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !replyText.trim()) return;

    setSendingReply(true);
    try {
      const res = await fetch(`/api/contact-messages/${selectedContact.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyText,
          senderName: "WomenPlay Executive Secretariat"
        })
      });
      const data = await res.json();
      if (res.ok) {
        showSuccessAlert("Reply Sent!", data.message || `Reply dispatched to ${selectedContact.email} via SMTP.`);
        setReplyText("");
        if (data.contact) {
          setSelectedContact(data.contact);
        }
        if (onRefreshData) await onRefreshData();
      } else {
        showErrorAlert("Failed to Send", data.error || "Error dispatching email reply.");
      }
    } catch (err) {
      console.error(err);
      showErrorAlert("Error", "Network error sending email reply.");
    } finally {
      setSendingReply(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (contacts.length === 0) return;
    const headers = ["ID", "First Name", "Email", "Phone", "Area of Interest", "Organization", "Subject", "Message", "Status", "Submitted At"];
    const rows = contacts.map(c => [
      c.id,
      `"${(c.firstName || c.fullName || "").replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${(c.phone || "").replace(/"/g, '""')}"`,
      `"${(c.interest || "").replace(/"/g, '""')}"`,
      `"${(c.organization || "").replace(/"/g, '""')}"`,
      `"${(c.subject || "").replace(/"/g, '""')}"`,
      `"${(c.message || "").replace(/"/g, '""')}"`,
      c.status,
      c.createdAt
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `WomenPlay_Contact_Messages_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8" id="admin-contacts-container">
      {/* Top Header & Refresh Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-brand-pink/10 text-brand-pink rounded-xl">
              <Inbox className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold font-display text-slate-900">Website Contact Submissions</h2>
          </div>
          <p className="text-slate-500 text-xs pl-9">
            View, track, and directly respond via SMTP to website inquiries from prospective partners and members.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-pink" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-brand-gold" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div 
          onClick={() => setStatusFilter("all")}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === "all" ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium mb-1 opacity-80">
            <span>Total Messages</span>
            <Inbox className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-display">{stats.total}</div>
        </div>

        <div 
          onClick={() => setStatusFilter("new")}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === "new" ? "bg-amber-500 text-white border-amber-500 shadow-md" : "bg-amber-50/50 border-amber-200 text-amber-900 hover:bg-amber-100/50"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium mb-1 opacity-80">
            <span>New / Unread</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-display">{stats.newCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter("read")}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === "read" ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-blue-50/50 border-blue-200 text-blue-900 hover:bg-blue-100/50"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium mb-1 opacity-80">
            <span>Read / Reviewed</span>
            <Eye className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-display">{stats.readCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter("replied")}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === "replied" ? "bg-emerald-600 text-white border-emerald-600 shadow-md" : "bg-emerald-50/50 border-emerald-200 text-emerald-900 hover:bg-emerald-100/50"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium mb-1 opacity-80">
            <span>Replied</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-display">{stats.repliedCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter("archived")}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === "archived" ? "bg-slate-600 text-white border-slate-600 shadow-md" : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium mb-1 opacity-80">
            <span>Archived</span>
            <Archive className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-display">{stats.archivedCount}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Filter:</span>
          {(["all", "new", "read", "replied", "archived"] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider text-[10px] transition cursor-pointer capitalize ${
                statusFilter === f 
                  ? "bg-brand-pink text-white shadow-sm" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredContacts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No Contact Messages Found</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              {searchTerm || statusFilter !== "all" 
                ? "No contact submissions match your current search criteria or filter." 
                : "Messages submitted via the main website Contact form will appear here automatically."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Sender Details</th>
                  <th className="py-4 px-6">Subject / Inquiry</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date Submitted</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map(c => {
                  const isNew = c.status === "new";
                  return (
                    <tr 
                      key={c.id} 
                      className={`hover:bg-slate-50/80 transition ${isNew ? "bg-amber-50/30 font-semibold" : ""}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-xs ${
                            isNew ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-700"
                          }`}>
                            {(c.firstName || c.fullName || "U").charAt(0)}
                          </div>
                          <div>
                            <div className="text-slate-900 font-bold flex items-center space-x-1.5">
                              <span>{c.firstName || c.fullName}</span>
                              {isNew && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                            </div>
                            <div className="text-slate-500 text-[11px] flex items-center space-x-2">
                              <span>{c.email}</span>
                              {c.phone && <span>• {c.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="max-w-xs space-y-0.5">
                          <div className="text-slate-900 font-medium truncate flex items-center gap-1.5">
                            {c.interest && (
                              <span className="bg-brand-pink/10 text-brand-pink text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0">
                                {c.interest}
                              </span>
                            )}
                            <span className="truncate">{c.subject || c.interest || "Website General Inquiry"}</span>
                          </div>
                          <div className="text-slate-400 text-[11px] truncate">{c.message}</div>
                          {c.organization && (
                            <div className="text-slate-500 text-[10px] italic">Org: {c.organization}</div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          c.status === "new" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                          c.status === "read" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                          c.status === "replied" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                          "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}>
                          {c.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-500 text-[11px] whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedContact(c);
                              if (c.status === "new") handleStatusChange(c, "read");
                            }}
                            className="p-2 bg-slate-100 hover:bg-brand-pink hover:text-white text-slate-700 rounded-xl transition cursor-pointer"
                            title="View & Reply"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(c.id, c.fullName)}
                            className="p-2 bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-700 rounded-xl transition cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Contact View / Reply Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-pink/20 text-brand-pink flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-display">{selectedContact.subject || "Website Inquiry"}</h3>
                  <p className="text-slate-400 text-xs">Submitted on {new Date(selectedContact.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              {/* Sender Info Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                    <User className="w-4 h-4 text-brand-pink" />
                    <span>{selectedContact.firstName || selectedContact.fullName}</span>
                    {selectedContact.interest && (
                      <span className="bg-brand-pink/10 text-brand-pink text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {selectedContact.interest}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-500 text-xs flex items-center space-x-3 pl-6">
                    <a href={`mailto:${selectedContact.email}`} className="hover:underline text-brand-pink">
                      {selectedContact.email}
                    </a>
                    {selectedContact.phone && (
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{selectedContact.phone}</span>
                      </span>
                    )}
                  </div>
                  {selectedContact.organization && (
                    <div className="text-slate-600 text-xs pl-6 pt-0.5 font-medium">
                      Organization: <span className="text-slate-900 font-bold">{selectedContact.organization}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500">Status:</span>
                  <select
                    value={selectedContact.status}
                    onChange={(e) => handleStatusChange(selectedContact, e.target.value as any)}
                    disabled={updatingStatusId === selectedContact.id}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Inquiry Message */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Inquiry Message</h4>
                <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200 text-slate-800 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedContact.message}
                </div>
              </div>

              {/* Previous Replies History */}
              {selectedContact.replies && selectedContact.replies.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-brand-pink" />
                    <span>Reply History</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedContact.replies.map(r => (
                      <div key={r.id} className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                          <span>{r.senderName}</span>
                          <span className="text-slate-400 font-normal">{new Date(r.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{r.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Send className="w-3.5 h-3.5 text-brand-pink" />
                    <span>Send SMTP Email Reply to {selectedContact.fullName}</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Dispatched via configured Admin SMTP</span>
                </div>

                <textarea
                  required
                  rows={4}
                  placeholder={`Dear ${selectedContact.fullName},\n\nThank you for reaching out to WomenPlay Secretariat...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                />

                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedContact(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-brand-pink hover:bg-brand-pink-dark disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingReply ? "Dispatching Email..." : "Send Email Reply"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
