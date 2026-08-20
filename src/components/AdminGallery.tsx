import React from "react";
import { Trash2, Edit3, Plus, Download, FileText, Search, RefreshCw, X, AlertCircle, Image as ImageIcon, Star, StarOff } from "lucide-react";
import type { GalleryItem } from "../types";
import { showConfirmDialog } from "../lib/swal";

interface AdminGalleryProps {
  gallery: GalleryItem[];
  onRefresh: () => void;
}

const CATEGORIES = ["General", "Summits", "Networking", "Socials", "Milestones"];

export default function AdminGallery({ gallery, onRefresh }: AdminGalleryProps) {
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("ALL");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");

  // CRUD States
  const [isCreating, setIsCreating] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<GalleryItem | null>(null);

  // Form States
  const [form, setForm] = React.useState({
    title: "",
    caption: "",
    category: "General",
    image: "",
    featured: false
  });

  // PDF Preview State
  const [pdfData, setPdfData] = React.useState<{ title: string; headers: string[]; rows: string[][] } | null>(null);

  const resetForm = () => {
    setForm({ title: "", caption: "", category: "General", image: "", featured: false });
    setIsCreating(false);
    setEditingItem(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Gallery item published successfully!");
        onRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to create gallery item.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/gallery/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Gallery item updated successfully.");
        onRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to update gallery item.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmDialog("Delete Gallery Item?", "Are you sure you want to remove this image from the public gallery?", "Yes, Delete Item");
    if (!confirmed) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Gallery item successfully removed.");
        onRefresh();
      } else {
        setError(data.error || "Failed to delete gallery item.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (item: GalleryItem) => {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/gallery/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          caption: item.caption || "",
          category: item.category,
          image: item.image,
          featured: !item.featured
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(item.featured ? "Item removed from featured highlights." : "Item marked as featured!");
        onRefresh();
      } else {
        setError(data.error || "Failed to update featured flag.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      caption: item.caption || "",
      category: item.category || "General",
      image: item.image || "",
      featured: !!item.featured
    });
    setIsCreating(false);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Item ID", "Title", "Caption", "Category", "Image URL", "Featured"];
    const rows = filteredItems.map(s => [
      s.id,
      `"${s.title.replace(/"/g, '""')}"`,
      `"${(s.caption || "").replace(/\n/g, " ").replace(/"/g, '""')}"`,
      `"${s.category.replace(/"/g, '""')}"`,
      `"${(s.image || "").replace(/"/g, '""')}"`,
      s.featured ? "Yes" : "No"
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `WomenPlay_Gallery_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const exportToPDF = () => {
    const headers = ["Title", "Category", "Caption", "Featured"];
    const rows = filteredItems.map(s => [
      s.title,
      s.category,
      s.caption || "",
      s.featured ? "Yes" : "No"
    ]);
    setPdfData({
      title: "WomenPlay Public Gallery Registry",
      headers,
      rows
    });
  };

  const filteredItems = (gallery || []).filter(s => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.caption || "").toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="panel-admin-gallery">
      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl font-semibold text-xs flex items-center justify-between shadow-xs" id="gallery-success-alert">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-500 hover:text-emerald-700 font-bold">×</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl font-semibold text-xs flex items-center justify-between shadow-xs" id="gallery-error-alert">
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
          <h2 className="text-sm font-bold text-slate-800">Public Gallery Manager</h2>
          <p className="text-xs text-slate-500 mt-1">Curate the images and moments displayed on the About Us → Gallery page.</p>
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
            <span>Add Photo</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-150 flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search gallery by title, caption, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none text-slate-700"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearch("");
              setCategoryFilter("ALL");
              onRefresh();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition shrink-0"
            title="Refresh Gallery"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Container: Form + List */}
      <div className="space-y-8">

        {/* Gallery Editor Form */}
        {(isCreating || editingItem) && (
          <div className="w-full bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow text-left animate-in slide-in-from-top duration-200">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3 mb-4">
              <h3 className="text-xs font-extrabold uppercase text-slate-800 flex items-center gap-1">
                <ImageIcon className="w-4 h-4 text-brand-pink" />
                <span>{editingItem ? "Edit Gallery Photo" : "Add New Gallery Photo"}</span>
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingItem ? handleUpdate : handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Photo Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Sunset Networking Cocktail"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none text-slate-700"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Photo Upload</label>
                <div className="flex items-center space-x-3">
                  {form.image ? (
                    <img src={form.image} alt="Cover Preview" className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold shrink-0">IMG</div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setForm({ ...form, image: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-pink file:text-white cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Caption / Description</label>
                <textarea
                  rows={3}
                  placeholder="A short description of the moment captured..."
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Feature this photo</label>
                  <p className="text-[10px] text-slate-400 mt-0.5">Featured items are highlighted at the top of the public Gallery page.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, featured: !form.featured })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    form.featured ? "bg-brand-pink" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      form.featured ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
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
                  {loading ? "Processing..." : "Save Photo"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Gallery List Pane */}
        <div className="space-y-4 text-left">
          {filteredItems.length > 0 ? (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 luxury-shadow flex flex-col md:flex-row gap-5" id={`gallery-card-${item.id}`}>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200"; }}
                      className="w-full md:w-44 h-32 object-cover rounded-xl border border-slate-100 shrink-0 self-center md:self-start shadow-sm"
                    />
                  )}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-2">
                          <span className="bg-brand-pink-light/60 text-brand-pink px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider">
                            {item.category}
                          </span>
                          {item.featured && (
                            <span className="bg-brand-gold-light/60 text-brand-gold-dark px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Featured
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">ID: {item.id}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-800 leading-tight">{item.title}</h3>
                      {item.caption && (
                        <p className="text-slate-600 text-xs leading-relaxed italic">
                          "{item.caption}"
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end items-center border-t border-slate-100 pt-3 gap-1">
                      <button
                        onClick={() => handleToggleFeatured(item)}
                        id={`btn-featured-${item.id}`}
                        className={`p-1.5 rounded-lg border transition ${
                          item.featured
                            ? "text-brand-gold-dark bg-brand-gold-light/40 border-brand-gold/30 hover:bg-brand-gold-light"
                            : "text-slate-500 hover:bg-slate-100 border-slate-200"
                        }`}
                        title={item.featured ? "Unfeature this photo" : "Feature this photo"}
                      >
                        {item.featured ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => startEdit(item)}
                        id={`btn-edit-gallery-${item.id}`}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                        title="Edit Photo"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        id={`btn-delete-gallery-${item.id}`}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white py-12 text-center rounded-2xl border border-slate-150 space-y-2">
              <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-bold">No gallery items found.</p>
              <p className="text-[10px] text-slate-400 font-semibold">Click "Add Photo" above to begin curating the public gallery.</p>
            </div>
          )}
        </div>
      </div>

      {/* PDF PRINT PREVIEW MODAL */}
      {pdfData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" id="gallery-pdf-modal">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-brand-pink" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Gallery Registry Preview</span>
              </div>
              <button onClick={() => setPdfData(null)} className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6 text-left flex-1 bg-white" id="gallery-printable-area">
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="font-display font-black text-lg text-slate-900 tracking-tight uppercase">WomenPlay Corporate</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Gallery Registry</p>
                </div>
                <div className="text-right text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  <p>Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-brand-pink font-extrabold text-[8px]">STRICTLY CONFIDENTIAL</p>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">{pdfData.title}</h2>
                <p className="text-[10px] text-slate-500 leading-normal mt-1">
                  An audited registry of the curated public gallery images and their publication metadata.
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
                <span>Print Registry</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
