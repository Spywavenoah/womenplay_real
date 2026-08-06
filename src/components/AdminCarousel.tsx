import React from "react";
import { Trash2, Edit3, Plus, Download, FileText, Search, RefreshCw, X, AlertCircle, Image as ImageIcon } from "lucide-react";
import type { CarouselSlide } from "../types";
import { showConfirmDialog } from "../lib/swal";

interface AdminCarouselProps {
  slides: CarouselSlide[];
  onRefresh: () => void;
}

export default function AdminCarousel({ slides, onRefresh }: AdminCarouselProps) {
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");

  // CRUD States
  const [isCreating, setIsCreating] = React.useState(false);
  const [editingSlide, setEditingSlide] = React.useState<CarouselSlide | null>(null);

  // Form States
  const [slideForm, setSlideForm] = React.useState({
    title: "",
    description: "",
    image: "",
    overlayColor: "rgba(0,0,0,0.4)"
  });

  // PDF Preview State
  const [pdfData, setPdfData] = React.useState<{ title: string; headers: string[]; rows: string[][] } | null>(null);

  const resetForm = () => {
    setSlideForm({
      title: "",
      description: "",
      image: "",
      overlayColor: "rgba(0,0,0,0.4)"
    });
    setIsCreating(false);
    setEditingSlide(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: slideForm.title,
          description: slideForm.description,
          image: slideForm.image || "https://images.unsplash.com/photo-1542744094-2ab25be78b90?auto=format&fit=crop&w=1200&q=80",
          overlayColor: slideForm.overlayColor
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Carousel slider settings saved successfully!");
        onRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to log carousel slide settings.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/carousel/${editingSlide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slideForm)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Carousel slide settings successfully updated.");
        onRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to update slide settings.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmDialog("Delete Slide?", "Are you sure you want to delete this homepage slider carousel settings record?", "Yes, Delete Slide");
    if (!confirmed) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/carousel/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Slider carousel settings successfully removed.");
        onRefresh();
      } else {
        setError(data.error || "Failed to delete slider carousel.");
      }
    } catch (err) {
      setError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (slide: CarouselSlide) => {
    setEditingSlide(slide);
    setSlideForm({
      title: slide.title,
      description: slide.description,
      image: slide.image || "",
      overlayColor: slide.overlayColor || "rgba(0,0,0,0.4)"
    });
    setIsCreating(false);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Slide ID", "Title", "Description", "Image URL", "Overlay Color"];
    const rows = filteredSlides.map(s => [
      s.id,
      `"${s.title.replace(/"/g, '""')}"`,
      `"${s.description.replace(/\n/g, " ").replace(/"/g, '""')}"`,
      `"${(s.image || "").replace(/"/g, '""')}"`,
      `"${(s.overlayColor || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Slider_Carousel_Settings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const exportToPDF = () => {
    const headers = ["Title", "Description", "Overlay Color"];
    const rows = filteredSlides.map(s => [
      s.title,
      s.description,
      s.overlayColor || "rgba(0,0,0,0.4)"
    ]);
    setPdfData({
      title: "WomenPlay Global Homepage Carousel Settings Registry",
      headers,
      rows
    });
  };

  const filteredSlides = (slides || []).filter(s => {
    return s.title.toLowerCase().includes(search.toLowerCase()) || 
           s.description.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6" id="panel-admin-carousel">
      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl font-semibold text-xs flex items-center justify-between shadow-xs" id="carousel-success-alert">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-500 hover:text-emerald-700 font-bold">×</button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl font-semibold text-xs flex items-center justify-between shadow-xs" id="carousel-error-alert">
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
          <h2 className="text-sm font-bold text-slate-800">Homepage Slider Carousel Settings</h2>
          <p className="text-xs text-slate-500 mt-1">Design homepage slides, configure dark scrim overlay opacity, and schedule announcements.</p>
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
            <span>Add Slide</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-150 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search slider settings by title or descriptions..."
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
          title="Refresh Carousel"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Container: Form + List */}
      <div className="space-y-8">
        
        {/* Slide Editor Form */}
        {(isCreating || editingSlide) && (
          <div className="w-full bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow text-left animate-in slide-in-from-top duration-200">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3 mb-4">
              <h3 className="text-xs font-extrabold uppercase text-slate-800 flex items-center gap-1">
                <ImageIcon className="w-4 h-4 text-brand-pink" />
                <span>{editingSlide ? "Edit Carousel Slide" : "Design Carousel Slide"}</span>
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingSlide ? handleUpdate : handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Slide Heading</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Raising Seed Capital Summit"
                    value={slideForm.title}
                    onChange={(e) => setFormValue("title", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Dark Scrim Overlay (CSS color)</label>
                  <input
                    type="text"
                    required
                    placeholder="rgba(0,0,0,0.4)"
                    value={slideForm.overlayColor}
                    onChange={(e) => setFormValue("overlayColor", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Image Cover Upload</label>
                <div className="flex items-center space-x-3">
                  {slideForm.image ? (
                    <img src={slideForm.image} alt="Cover Preview" className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold shrink-0">IMG</div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormValue("image", reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-pink file:text-white cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Description text</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Type a captivating executive description..."
                  value={slideForm.description}
                  onChange={(e) => setFormValue("description", e.target.value)}
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
                  {loading ? "Processing..." : "Save Slide"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Slide List Pane */}
        <div className="space-y-4 text-left">
          {filteredSlides.length > 0 ? (
            <div className="space-y-4">
              {filteredSlides.map((slide) => (
                <div key={slide.id} className="bg-white p-5 rounded-2xl border border-slate-100 luxury-shadow flex flex-col md:flex-row gap-5" id={`carousel-card-${slide.id}`}>
                  {slide.image && (
                    <img
                      src={slide.image}
                      alt={slide.title}
                      referrerPolicy="no-referrer"
                      className="w-full md:w-44 h-32 object-cover rounded-xl border border-slate-100 shrink-0 self-center md:self-start shadow-sm"
                    />
                  )}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                          Overlay: {slide.overlayColor || "rgba(0,0,0,0.4)"}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">ID: {slide.id}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-800 leading-tight">{slide.title}</h3>
                      <p className="text-slate-600 text-xs leading-relaxed italic">
                        "{slide.description}"
                      </p>
                    </div>

                    <div className="flex justify-end items-center border-t border-slate-100 pt-3 gap-1">
                      <button
                        onClick={() => startEdit(slide)}
                        id={`btn-edit-slide-${slide.id}`}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                        title="Edit Slide"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(slide.id)}
                        id={`btn-delete-slide-${slide.id}`}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition"
                        title="Delete Slide"
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
              <p className="text-xs text-slate-500 font-bold">No carousel slides registered.</p>
              <p className="text-[10px] text-slate-400 font-semibold">Click "Add Slide" above to configure your slider views.</p>
            </div>
          )}
        </div>
      </div>

      {/* PDF PRINT PREVIEW MODAL */}
      {pdfData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" id="carousel-pdf-modal">
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
            <div className="p-8 overflow-y-auto space-y-6 text-left flex-1 bg-white" id="carousel-printable-area">
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
                  An audited ledger tracking homepage slides, overlay scram opacities, and public announcements.
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
    setSlideForm(prev => ({ ...prev, [key]: val }));
  }
}
