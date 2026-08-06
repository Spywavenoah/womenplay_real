import React from "react";
import { Check, Trash2, Edit3, Plus, Download, FileText, Search, Filter, RefreshCw, X, AlertCircle, Clock } from "lucide-react";
import type { SuccessStory } from "../types";
import { showConfirmDialog } from "../lib/swal";

interface AdminStoriesProps {
  stories: SuccessStory[];
  currentUser: any;
  onRefresh: () => void;
}

export default function AdminStories({ stories, currentUser, onRefresh }: AdminStoriesProps) {
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<"all" | "pending" | "approved">("pending");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");

  // CRUD States
  const [isCreating, setIsCreating] = React.useState(false);
  const [editingStory, setEditingStory] = React.useState<SuccessStory | null>(null);
  
  // Form States
  const [storyForm, setStoryForm] = React.useState({
    title: "",
    content: "",
    imageUrl: "",
    userFullName: currentUser?.fullName || "Anonymous Fellow",
    approved: false
  });

  // PDF Preview State
  const [pdfData, setPdfData] = React.useState<{ title: string; headers: string[]; rows: string[][] } | null>(null);

  const resetForm = () => {
    setStoryForm({
      title: "",
      content: "",
      imageUrl: "",
      userFullName: currentUser?.fullName || "Anonymous Fellow",
      approved: false
    });
    setIsCreating(false);
    setEditingStory(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/success-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: storyForm.title,
          content: storyForm.content,
          imageUrl: storyForm.imageUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
          userId: currentUser?.id || "admin",
          userFullName: storyForm.userFullName,
          approved: storyForm.approved
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Success story created successfully!");
        onRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to create success story.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/success-stories/${editingStory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: storyForm.title,
          content: storyForm.content,
          imageUrl: storyForm.imageUrl,
          userFullName: storyForm.userFullName,
          approved: storyForm.approved
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Success story updated successfully!");
        onRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to update success story.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/success-stories/${id}/approve`, {
        method: "PUT"
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Story approved successfully!");
        onRefresh();
      } else {
        setError(data.error || "Failed to approve story.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmDialog("Delete Success Story?", "Are you sure you want to delete this success story?", "Yes, Delete Story");
    if (!confirmed) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/success-stories/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Story deleted successfully!");
        onRefresh();
      } else {
        setError(data.error || "Failed to delete story.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (story: SuccessStory) => {
    setEditingStory(story);
    setStoryForm({
      title: story.title,
      content: story.content,
      imageUrl: story.imageUrl || "",
      userFullName: story.userFullName,
      approved: story.approved
    });
    setIsCreating(false);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Story ID", "Author Name", "Title", "Content", "Approved", "Submission Date"];
    const rows = filteredStories.map(s => [
      s.id,
      `"${s.userFullName.replace(/"/g, '""')}"`,
      `"${s.title.replace(/"/g, '""')}"`,
      `"${s.content.replace(/\n/g, " ").slice(0, 150).replace(/"/g, '""')}..."`,
      s.approved ? "Approved" : "Pending",
      s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "N/A"
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Pending_Success_Stories_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF (Virtual preview)
  const exportToPDF = () => {
    const headers = ["Author", "Title", "Status", "Date"];
    const rows = filteredStories.map(s => [
      s.userFullName,
      s.title,
      s.approved ? "Approved" : "Pending",
      s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "N/A"
    ]);
    setPdfData({
      title: "WomenPlay Global Pending & Success Stories Approvals Ledger",
      headers,
      rows
    });
  };

  // Filtered list
  const filteredStories = stories.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                        s.userFullName.toLowerCase().includes(search.toLowerCase()) || 
                        s.content.toLowerCase().includes(search.toLowerCase());
    
    if (filterStatus === "pending") return matchSearch && !s.approved;
    if (filterStatus === "approved") return matchSearch && s.approved;
    return matchSearch;
  });

  return (
    <div className="space-y-6" id="panel-admin-stories">
      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl font-semibold text-xs flex items-center justify-between" id="stories-success-alert">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-500 hover:text-emerald-700 font-bold">×</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl font-semibold text-xs flex items-center justify-between" id="stories-error-alert">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            {error}
          </span>
          <button onClick={() => setError("")} className="text-rose-500 hover:text-rose-700 font-bold">×</button>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 luxury-shadow">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Pending Success Story Approvals</h2>
          <p className="text-xs text-slate-500 mt-1">Review, modify, approve, and authorize inspirational narratives for the public frontpage.</p>
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
            <span>Add Story</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-150 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search stories by title, author, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
          <div className="flex bg-slate-100 rounded-xl p-0.5 border border-slate-200">
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                filterStatus === "pending" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Pending Approval
            </button>
            <button
              onClick={() => setFilterStatus("approved")}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                filterStatus === "approved" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                filterStatus === "all" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              All Stories
            </button>
          </div>
          <button
            onClick={() => {
              setSearch("");
              onRefresh();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Form + List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Story Form Sidebar */}
        {(isCreating || editingStory) && (
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow text-left h-fit animate-in slide-in-from-left duration-200">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3 mb-4">
              <h3 className="text-xs font-extrabold uppercase text-slate-800 flex items-center gap-1">
                <Edit3 className="w-4 h-4 text-brand-pink" />
                <span>{editingStory ? "Modify Success Story" : "Draft Public Story"}</span>
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingStory ? handleUpdate : handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Contributor Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Smith"
                  value={storyForm.userFullName}
                  onChange={(e) => setStoryForm({ ...storyForm, userFullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Story Title</label>
                <input
                  type="text"
                  required
                  placeholder="Breaking Glass Ceilings in Tech"
                  value={storyForm.title}
                  onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Featured Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={storyForm.imageUrl}
                  onChange={(e) => setStoryForm({ ...storyForm, imageUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Narrative Content</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Type the full inspirational executive summary here..."
                  value={storyForm.content}
                  onChange={(e) => setStoryForm({ ...storyForm, content: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                <input
                  type="checkbox"
                  id="story-approved"
                  checked={storyForm.approved}
                  onChange={(e) => setStoryForm({ ...storyForm, approved: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-pink focus:ring-brand-pink border-slate-300"
                />
                <label htmlFor="story-approved" className="text-xs font-semibold text-slate-700 select-none">
                  Authorize & Approve Instantly
                </label>
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
                  {loading ? "Saving..." : "Save Story"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stories List Pane */}
        <div className={`space-y-4 ${isCreating || editingStory ? "lg:col-span-2" : "lg:col-span-3"}`}>
          {filteredStories.length > 0 ? (
            <div className="space-y-4">
              {filteredStories.map((story) => (
                <div key={story.id} className="bg-white p-5 rounded-2xl border border-slate-100 luxury-shadow flex flex-col md:flex-row gap-5 text-left" id={`story-card-${story.id}`}>
                  {story.imageUrl && (
                    <img
                      src={story.imageUrl}
                      alt={story.title}
                      referrerPolicy="no-referrer"
                      className="w-full md:w-32 h-24 object-cover rounded-xl border border-slate-100 shrink-0 self-center md:self-start"
                    />
                  )}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-4">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          story.approved 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-150" 
                            : "bg-amber-50 text-amber-700 border-amber-150"
                        }`}>
                          {story.approved ? "Approved" : "Pending Action"}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">ID: {story.id}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">{story.title}</h3>
                      <p className="text-[10px] text-slate-500 font-semibold">Submitted by: <span className="text-slate-700 font-bold">{story.userFullName}</span></p>
                      <p className="text-slate-600 text-xs line-clamp-3 italic leading-relaxed">"{story.content}"</p>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-mono text-slate-400">
                        {story.createdAt ? new Date(story.createdAt).toLocaleDateString() : "Date N/A"}
                      </span>
                      <div className="flex items-center gap-1">
                        {!story.approved && (
                          <button
                            onClick={() => handleApprove(story.id)}
                            id={`btn-approve-story-${story.id}`}
                            className="py-1 px-2.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Approve</span>
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(story)}
                          id={`btn-edit-story-${story.id}`}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                          title="Edit Story"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(story.id)}
                          id={`btn-delete-story-${story.id}`}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition"
                          title="Delete Story"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white py-12 text-center rounded-2xl border border-slate-150 space-y-2">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-bold">No success stories match the selected criteria.</p>
              <p className="text-[10px] text-slate-400">Try adjusting your filters or search keywords above.</p>
            </div>
          )}
        </div>
      </div>

      {/* PDF PRINT REPORT POPUP MODAL */}
      {pdfData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" id="stories-pdf-modal">
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
            <div className="p-8 overflow-y-auto space-y-6 text-left flex-1 bg-white" id="stories-printable-area">
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
                  An audited high-society ledger detailing pending and approved success stories from outstanding corporate leaders.
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
