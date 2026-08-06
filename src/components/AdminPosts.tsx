import React from "react";
import { Trash2, Edit3, Plus, Download, FileText, Search, RefreshCw, X, Heart, MessageSquare, AlertCircle } from "lucide-react";
import type { Post } from "../types";
import { showConfirmDialog } from "../lib/swal";

interface AdminPostsProps {
  posts: Post[];
  currentUser: any;
  onRefresh: () => void;
}

export default function AdminPosts({ posts, currentUser, onRefresh }: AdminPostsProps) {
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");

  // CRUD States
  const [isCreating, setIsCreating] = React.useState(false);
  const [editingPost, setEditingPost] = React.useState<Post | null>(null);

  // Form States
  const [postForm, setPostForm] = React.useState({
    content: "",
    imageUrl: "",
    userFullName: currentUser?.fullName || "Aura Administrator",
    userTitle: currentUser?.title || "Executive Moderator"
  });

  // PDF Preview State
  const [pdfData, setPdfData] = React.useState<{ title: string; headers: string[]; rows: string[][] } | null>(null);

  const resetForm = () => {
    setPostForm({
      content: "",
      imageUrl: "",
      userFullName: currentUser?.fullName || "Aura Administrator",
      userTitle: currentUser?.title || "Executive Moderator"
    });
    setIsCreating(false);
    setEditingPost(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: postForm.content,
          imageUrl: postForm.imageUrl || undefined,
          userId: currentUser?.id || "admin",
          userFullName: postForm.userFullName,
          userTitle: postForm.userTitle
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Community timeline post published successfully!");
        onRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to create timeline post.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/community/posts/${editingPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: postForm.content,
          imageUrl: postForm.imageUrl
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Timeline post successfully moderated and updated!");
        onRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to update moderated post.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmDialog("Remove Community Post?", "Are you sure you want to remove this post from the timeline? This action is permanent and acts as moderation.", "Yes, Remove Post");
    if (!confirmed) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/community/posts/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Community post deleted from the timeline.");
        onRefresh();
      } else {
        setError(data.error || "Failed to delete timeline post.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (post: Post) => {
    setEditingPost(post);
    setPostForm({
      content: post.content,
      imageUrl: post.imageUrl || "",
      userFullName: post.userFullName,
      userTitle: post.userTitle || "Executive Member"
    });
    setIsCreating(false);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Post ID", "Author Name", "Author Title", "Content", "Likes Count", "Comments Count", "Published Date"];
    const rows = filteredPosts.map(p => [
      p.id,
      `"${p.userFullName.replace(/"/g, '""')}"`,
      `"${(p.userTitle || "Member").replace(/"/g, '""')}"`,
      `"${p.content.replace(/\n/g, " ").slice(0, 150).replace(/"/g, '""')}..."`,
      p.likes?.length || 0,
      p.commentsCount || 0,
      p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A"
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Timeline_Posts_Moderation_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const exportToPDF = () => {
    const headers = ["Author", "Content Snippet", "Likes", "Comments", "Date"];
    const rows = filteredPosts.map(p => [
      p.userFullName,
      p.content.length > 50 ? `${p.content.slice(0, 50)}...` : p.content,
      String(p.likes?.length || 0),
      String(p.commentsCount || 0),
      p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A"
    ]);
    setPdfData({
      title: "WomenPlay Global Timeline Posts Moderation & Audit Ledger",
      headers,
      rows
    });
  };

  // Filtered lists
  const filteredPosts = posts.filter(p => {
    return p.content.toLowerCase().includes(search.toLowerCase()) || 
           p.userFullName.toLowerCase().includes(search.toLowerCase()) ||
           (p.userTitle && p.userTitle.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="space-y-6" id="panel-admin-posts">
      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl font-semibold text-xs flex items-center justify-between" id="posts-success-alert">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-500 hover:text-emerald-700 font-bold">×</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl font-semibold text-xs flex items-center justify-between" id="posts-error-alert">
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
          <h2 className="text-sm font-bold text-slate-800">Timeline Posts Moderation</h2>
          <p className="text-xs text-slate-500 mt-1">Audit executive conversations, edit offensive/incorrect postings, and delete records to maintain network standards.</p>
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
            <span>Publish Post</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-150 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Filter timeline entries by author name, title, or keywords..."
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
          title="Refresh Feed"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Grid: Form + List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Sidebar */}
        {(isCreating || editingPost) && (
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow text-left h-fit animate-in slide-in-from-left duration-200">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3 mb-4">
              <h3 className="text-xs font-extrabold uppercase text-slate-800 flex items-center gap-1">
                <Edit3 className="w-4 h-4 text-brand-pink" />
                <span>{editingPost ? "Moderate Post Content" : "Create Public Post"}</span>
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingPost ? handleUpdate : handleCreate} className="space-y-4">
              {!editingPost && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Author Name</label>
                    <input
                      type="text"
                      required
                      value={postForm.userFullName}
                      onChange={(e) => setPostForm({ ...postForm, userFullName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Author Professional Title</label>
                    <input
                      type="text"
                      required
                      value={postForm.userTitle}
                      onChange={(e) => setPostForm({ ...postForm, userTitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Post Content Text</label>
                <textarea
                  required
                  rows={5}
                  placeholder="What is happening in the network today?"
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Attached Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={postForm.imageUrl}
                  onChange={(e) => setPostForm({ ...postForm, imageUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
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
                  {loading ? "Processing..." : editingPost ? "Apply Moderation" : "Publish"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts List Pane */}
        <div className={`space-y-4 ${isCreating || editingPost ? "lg:col-span-2" : "lg:col-span-3"}`}>
          {filteredPosts.length > 0 ? (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-white p-5 rounded-2xl border border-slate-100 luxury-shadow flex flex-col md:flex-row gap-5 text-left" id={`post-moderation-card-${post.id}`}>
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Timeline Attach"
                      referrerPolicy="no-referrer"
                      className="w-full md:w-36 h-28 object-cover rounded-xl border border-slate-100 shrink-0 self-center md:self-start"
                    />
                  )}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center space-x-2">
                          <span className="w-7 h-7 rounded-full bg-brand-pink/10 text-brand-pink flex items-center justify-center font-bold text-xs">
                            {post.userFullName.charAt(0)}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-800 leading-tight">{post.userFullName}</p>
                            <p className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5">{post.userTitle || "Executive Fellow"}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">ID: {post.id}</span>
                      </div>

                      <p className="text-slate-700 text-xs leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {post.content}
                      </p>

                      {/* Engagement Counters */}
                      <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-bold px-1">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                          <span>{post.likes?.length || 0} Likes</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />
                          <span>{post.commentsCount || 0} Comments</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-mono text-slate-400">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Date N/A"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(post)}
                          id={`btn-edit-post-${post.id}`}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                          title="Moderate Content"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          id={`btn-delete-post-${post.id}`}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition"
                          title="Delete Post"
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
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-bold">No community posts match your filter keywords.</p>
              <p className="text-[10px] text-slate-400 font-semibold">Ensure spelling is correct or click Refresh to fetch latest.</p>
            </div>
          )}
        </div>
      </div>

      {/* PDF PRINT REPORT POPUP MODAL */}
      {pdfData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" id="posts-pdf-modal">
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
            <div className="p-8 overflow-y-auto space-y-6 text-left flex-1 bg-white" id="posts-printable-area">
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
                  An audited high-society registry detailing timeline posts, user engagement metrics, and moderation audits.
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
