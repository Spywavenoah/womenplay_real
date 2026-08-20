import React from "react";
import { Trash2, Edit3, Plus, Download, FileText, Search, RefreshCw, X, AlertCircle, BookOpen, Clock } from "lucide-react";
import type { BlogArticle } from "../types";
import { showConfirmDialog } from "../lib/swal";

interface AdminBlogsProps {
  blogs: BlogArticle[];
  currentUser: any;
  onRefresh: () => void;
}

export default function AdminBlogs({ blogs, currentUser, onRefresh }: AdminBlogsProps) {
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<"all" | "published" | "draft">("all");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");

  // CRUD States
  const [isCreating, setIsCreating] = React.useState(false);
  const [editingBlog, setEditingBlog] = React.useState<BlogArticle | null>(null);

  // Form States
  const [blogForm, setBlogForm] = React.useState({
    title: "",
    content: "",
    category: "Leadership",
    image: "",
    author: currentUser?.fullName || "Aura Corporate Desk",
    status: "published" as "published" | "draft" | "scheduled"
  });

  // PDF Preview State
  const [pdfData, setPdfData] = React.useState<{ title: string; headers: string[]; rows: string[][] } | null>(null);

  const resetForm = () => {
    setBlogForm({
      title: "",
      content: "",
      category: "Leadership",
      image: "",
      author: currentUser?.fullName || "Aura Corporate Desk",
      status: "published"
    });
    setIsCreating(false);
    setEditingBlog(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...blogForm,
          image: blogForm.image || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Corporate blog article created successfully!");
        onRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to log blog article.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/blogs/${editingBlog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogForm)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Blog article content successfully updated!");
        onRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to update blog article.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmDialog("Retract Article?", "Are you sure you want to completely retract and delete this blog article?", "Yes, Retract Article");
    if (!confirmed) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Blog article successfully deleted.");
        onRefresh();
      } else {
        setError(data.error || "Failed to delete article.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (blog: BlogArticle) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title,
      content: blog.content,
      category: blog.category,
      image: blog.image || "",
      author: blog.author,
      status: blog.status || "published"
    });
    setIsCreating(false);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Article ID", "Title", "Category", "Author", "Status", "Publication Date"];
    const rows = filteredBlogs.map(b => [
      b.id,
      `"${b.title.replace(/"/g, '""')}"`,
      b.category,
      `"${b.author.replace(/"/g, '""')}"`,
      b.status || "Published",
      b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "N/A"
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Published_Blog_Articles_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const exportToPDF = () => {
    const headers = ["Title", "Category", "Author", "Status", "Date"];
    const rows = filteredBlogs.map(b => [
      b.title,
      b.category,
      b.author,
      b.status || "Published",
      b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "N/A"
    ]);
    setPdfData({
      title: "WomenPlay Global Published Editorial Articles Registry",
      headers,
      rows
    });
  };

  const filteredBlogs = blogs.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || 
                        b.author.toLowerCase().includes(search.toLowerCase()) || 
                        b.content.toLowerCase().includes(search.toLowerCase()) || 
                        b.category.toLowerCase().includes(search.toLowerCase());
    
    if (filterStatus === "all") return matchSearch;
    return matchSearch && b.status === filterStatus;
  });

  return (
    <div className="space-y-6" id="panel-admin-blogs">
      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl font-semibold text-xs flex items-center justify-between shadow-xs" id="blogs-success-alert">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-500 hover:text-emerald-700 font-bold">×</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl font-semibold text-xs flex items-center justify-between shadow-xs" id="blogs-error-alert">
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
          <h2 className="text-sm font-bold text-slate-800">Published Blog Articles Administration</h2>
          <p className="text-xs text-slate-500 mt-1">Compose, schedule, edit, and audit professional editorials and media files for high-society insights.</p>
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
            <span>Write Article</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-150 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search blogs by title, category, author, content..."
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
              onClick={() => setFilterStatus("published")}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                filterStatus === "published" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setFilterStatus("draft")}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                filterStatus === "draft" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Drafts
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

      {/* Main Container: Form + List */}
      <div className="space-y-8">
        
        {/* Blog Editor Form */}
        {(isCreating || editingBlog) && (
          <div className="w-full bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow text-left animate-in slide-in-from-top duration-200">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3 mb-4">
              <h3 className="text-xs font-extrabold uppercase text-slate-800 flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-brand-pink" />
                <span>{editingBlog ? "Edit Corporate Column" : "Draft New Editorial"}</span>
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingBlog ? handleUpdate : handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Editorial Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Raising Capital: Elite Strategies"
                    value={blogForm.title}
                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Author Name</label>
                  <input
                    type="text"
                    required
                    value={blogForm.author}
                    onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Category</label>
                  <select
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="Leadership">Leadership</option>
                    <option value="Capital Strategy">Capital Strategy</option>
                    <option value="Executive Lifestyle">Executive Lifestyle</option>
                    <option value="Tech Insights">Tech Insights</option>
                    <option value="Community Gossip">Community Gossip</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Status</label>
                  <select
                    value={blogForm.status}
                    onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Feature Image Upload</label>
                  <div className="flex items-center space-x-2">
                    {blogForm.image ? (
                      <img src={blogForm.image} alt="Feature" className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[9px] text-slate-400 font-bold shrink-0">IMG</div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setBlogForm({ ...blogForm, image: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-brand-pink file:text-white cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Article body (Markdown supported)</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Compose the executive insights here..."
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
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
                  {loading ? "Publishing..." : "Publish Column"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Blogs List Pane */}
        <div className="space-y-4 text-left">
          {filteredBlogs.length > 0 ? (
            <div className="space-y-4">
              {filteredBlogs.map((blog) => (
                <div key={blog.id} className="bg-white p-5 rounded-2xl border border-slate-100 luxury-shadow flex flex-col md:flex-row gap-5" id={`blog-admin-card-${blog.id}`}>
                  {blog.image && (
                    <img
                      src={blog.image}
                      alt={blog.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200"; }}
                      className="w-full md:w-36 h-28 object-cover rounded-xl border border-slate-100 shrink-0 self-center md:self-start"
                    />
                  )}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-1">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-155 text-slate-700 uppercase">
                            {blog.category}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            blog.status === "draft" 
                              ? "bg-slate-50 text-slate-500 border-slate-150" 
                              : "bg-emerald-50 text-emerald-700 border-emerald-150"
                          }`}>
                            {blog.status || "Published"}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">ID: {blog.id}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-800 leading-tight">{blog.title}</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">Author: <strong className="text-slate-600 font-bold">{blog.author}</strong></p>
                      <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">
                        {blog.content}
                      </p>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "Date N/A"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(blog)}
                          id={`btn-edit-blog-${blog.id}`}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                          title="Edit Editorial"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          id={`btn-delete-blog-${blog.id}`}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition"
                          title="Retract Column"
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
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-bold">No editorial columns matched your filter parameters.</p>
              <p className="text-[10px] text-slate-400 font-semibold">Verify keywords spelling or click composition buttons.</p>
            </div>
          )}
        </div>
      </div>

      {/* PDF PRINT PREVIEW MODAL */}
      {pdfData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" id="blogs-pdf-modal">
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
            <div className="p-8 overflow-y-auto space-y-6 text-left flex-1 bg-white" id="blogs-printable-area">
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
                  An audited ledger detailing all active blog articles, composing author signatures, and status parameters.
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
