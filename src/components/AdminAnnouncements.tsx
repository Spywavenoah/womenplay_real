import React from "react";
import { Trash2, Edit3, Plus, Download, FileText, Search, RefreshCw, X, AlertCircle, Megaphone, ToggleLeft, ToggleRight } from "lucide-react";
import type { Announcement } from "../types";
import { showConfirmDialog } from "../lib/swal";

interface AdminAnnouncementsProps {
  announcements: Announcement[];
  onRefresh: () => void;
}

export default function AdminAnnouncements({ announcements, onRefresh }: AdminAnnouncementsProps) {
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");

  // CRUD States
  const [isCreating, setIsCreating] = React.useState(false);
  const [editingAnnounce, setEditingAnnounce] = React.useState<Announcement | null>(null);

  // Form States
  const [announceForm, setAnnounceForm] = React.useState({
    title: "",
    content: "",
    priority: "low" as "low" | "medium" | "high",
    active: true
  });

  // PDF Preview State
  const [pdfData, setPdfData] = React.useState<{ title: string; headers: string[]; rows: string[][] } | null>(null);

  const resetForm = () => {
    setAnnounceForm({
      title: "",
      content: "",
      priority: "low",
      active: true
    });
    setIsCreating(false);
    setEditingAnnounce(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(announceForm)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Global announcement banner posted successfully!");
        onRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to log announcement.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnounce) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/announcements/${editingAnnounce.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(announceForm)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Announcement details updated successfully.");
        onRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to update announcement.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/announcements/${id}/toggle`, {
        method: "PUT"
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Announcement toggle updated successfully.");
        onRefresh();
      } else {
        setError(data.error || "Failed to toggle announcement banner status.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmDialog("Erase Announcement?", "Are you sure you want to completely erase this announcement banner from the platform?", "Yes, Erase Banner");
    if (!confirmed) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Announcement successfully deleted.");
        onRefresh();
      } else {
        setError(data.error || "Failed to delete announcement.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (announce: Announcement) => {
    setEditingAnnounce(announce);
    setAnnounceForm({
      title: announce.title,
      content: announce.content,
      priority: announce.priority || "low",
      active: announce.active
    });
    setIsCreating(false);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Announcement ID", "Title", "Content", "Priority", "Active", "Created Date"];
    const rows = filteredAnnouncements.map(a => [
      a.id,
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.content.replace(/\n/g, " ").replace(/"/g, '""')}"`,
      a.priority,
      a.active ? "Active" : "Inactive",
      a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "N/A"
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Global_Announcements_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const exportToPDF = () => {
    const headers = ["Title", "Priority", "Active Status", "Date"];
    const rows = filteredAnnouncements.map(a => [
      a.title,
      a.priority,
      a.active ? "Active" : "Inactive",
      a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "N/A"
    ]);
    setPdfData({
      title: "WomenPlay Global System Announcements Ledger",
      headers,
      rows
    });
  };

  const filteredAnnouncements = announcements.filter(a => {
    return a.title.toLowerCase().includes(search.toLowerCase()) || 
           a.content.toLowerCase().includes(search.toLowerCase()) || 
           a.priority.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6" id="panel-admin-announcements">
      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl font-semibold text-xs flex items-center justify-between shadow-xs" id="announce-success-alert">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-500 hover:text-emerald-700 font-bold">×</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl font-semibold text-xs flex items-center justify-between shadow-xs" id="announce-error-alert">
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
          <h2 className="text-sm font-bold text-slate-800">Global Announcement Banners</h2>
          <p className="text-xs text-slate-500 mt-1">Configure global notification ribbons, push high-importance broadcasts, and toggle visual banners.</p>
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
            <span>Post Ribbon</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-150 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search announcement content, priority headers, tags..."
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
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Container: Form + List */}
      <div className="space-y-8">
        
        {/* Editor Form */}
        {(isCreating || editingAnnounce) && (
          <div className="w-full bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow text-left animate-in slide-in-from-top duration-200">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3 mb-4">
              <h3 className="text-xs font-extrabold uppercase text-slate-800 flex items-center gap-1">
                <Megaphone className="w-4 h-4 text-brand-pink" />
                <span>{editingAnnounce ? "Edit Announcement" : "Draft Global Ribbon"}</span>
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingAnnounce ? handleUpdate : handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Ribbon Header</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., System Maintenance Schedule"
                    value={announceForm.title}
                    onChange={(e) => setFormValue("title", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Priority Tier</label>
                    <select
                      value={announceForm.priority}
                      onChange={(e) => setFormValue("priority", e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="low">Low (Slate Blue)</option>
                      <option value="medium">Medium (Amber Gold)</option>
                      <option value="high">High (Rose Crimson)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Publish State</label>
                    <div className="flex items-center h-8 space-x-2">
                      <input
                        type="checkbox"
                        id="announce-active"
                        checked={announceForm.active}
                        onChange={(e) => setFormValue("active", e.target.checked)}
                        className="w-4 h-4 rounded text-brand-pink focus:ring-brand-pink border-slate-300"
                      />
                      <label htmlFor="announce-active" className="text-xs font-semibold text-slate-700 select-none">
                        Active Online
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Content Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Type message to broadcast to all members..."
                  value={announceForm.content}
                  onChange={(e) => setFormValue("content", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="py-2 px-4 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="py-2 px-6 bg-brand-pink hover:bg-brand-pink-dark text-white rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer"
                >
                  {loading ? "Processing..." : "Commit Ribbon"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Announcement List Pane */}
        <div className="space-y-4 text-left">
          {filteredAnnouncements.length > 0 ? (
            <div className="space-y-4">
              {filteredAnnouncements.map((announce) => {
                const priorityColor = 
                  announce.priority === "high" 
                    ? "bg-rose-50 text-rose-800 border-rose-200" 
                    : announce.priority === "medium"
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-slate-50 text-slate-800 border-slate-200";

                return (
                  <div key={announce.id} className="bg-white p-5 rounded-2xl border border-slate-100 luxury-shadow flex flex-col md:flex-row gap-5" id={`announce-card-${announce.id}`}>
                    <div className="flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${priorityColor}`}>
                              {announce.priority} priority
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                              announce.active 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-150" 
                                : "bg-red-50 text-red-700 border-red-150"
                            }`}>
                              {announce.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-400">ID: {announce.id}</span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-800 leading-tight flex items-center gap-1.5">
                          <Megaphone className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{announce.title}</span>
                        </h3>
                        <p className="text-slate-600 text-xs leading-relaxed font-semibold italic">
                          "{announce.content}"
                        </p>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                        <span className="text-[10px] font-mono text-slate-400">
                          {announce.createdAt ? new Date(announce.createdAt).toLocaleDateString() : "Date N/A"}
                        </span>
                        <div className="flex items-center gap-2">
                          {/* Fast toggle switch */}
                          <button
                            onClick={() => handleToggleActive(announce.id)}
                            className="p-1 hover:bg-slate-50 rounded text-slate-600"
                            title="Toggle Activation"
                          >
                            {announce.active ? (
                              <ToggleRight className="w-6 h-6 text-emerald-500" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-slate-300" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => startEdit(announce)}
                            id={`btn-edit-announce-${announce.id}`}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                            title="Edit Ribbon"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(announce.id)}
                            id={`btn-delete-announce-${announce.id}`}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition"
                            title="Delete Ribbon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white py-12 text-center rounded-2xl border border-slate-150 space-y-2">
              <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-bold">No announcement ribbons logged.</p>
              <p className="text-[10px] text-slate-400 font-semibold">Click "Post Ribbon" above to schedule a broadcast.</p>
            </div>
          )}
        </div>
      </div>

      {/* PDF PRINT PREVIEW MODAL */}
      {pdfData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" id="announcements-pdf-modal">
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
            <div className="p-8 overflow-y-auto space-y-6 text-left flex-1 bg-white" id="announcements-printable-area">
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
                  An audited ledger detailing all registered global announcements, priority categorizations, and active statuses.
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

  function setFormValue(key: string, val: any) {
    setAnnounceForm(prev => ({ ...prev, [key]: val }));
  }
}
