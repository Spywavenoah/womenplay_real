import React from "react";
import { Trash2, Edit3, Plus, Download, FileText, Search, RefreshCw, X, AlertCircle, Image as ImageIcon, Upload, CheckCircle2, Loader2, Link as LinkIcon } from "lucide-react";
import type { CarouselSlide } from "../types";
import { showConfirmDialog } from "../lib/swal";

interface AdminCarouselProps {
  slides: CarouselSlide[];
  onRefresh: () => void;
}

// Client-side image compression helper to ensure uploads succeed regardless of input size
function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 1920;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
          const quality = mimeType === "image/png" ? 0.9 : 0.85;
          resolve(canvas.toDataURL(mimeType, quality));
        } catch (_) {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminCarousel({ slides, onRefresh }: AdminCarouselProps) {
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");

  // CRUD States
  const [isCreating, setIsCreating] = React.useState(false);
  const [editingSlide, setEditingSlide] = React.useState<CarouselSlide | null>(null);

  // Upload States
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Form States
  const [slideForm, setSlideForm] = React.useState({
    title: "",
    eyebrow: "",
    highlight: "",
    suffix: "",
    description: "",
    image: "",
    overlayColor: "rgba(0,0,0,0.4)",
    hasDivider: true
  });

  // PDF Preview State
  const [pdfData, setPdfData] = React.useState<{ title: string; headers: string[]; rows: string[][] } | null>(null);

  const resetForm = () => {
    setSlideForm({
      title: "",
      eyebrow: "",
      highlight: "",
      suffix: "",
      description: "",
      image: "",
      overlayColor: "rgba(0,0,0,0.4)",
      hasDivider: true
    });
    setIsCreating(false);
    setEditingSlide(null);
    setUploadSuccess(false);
    setUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const setFormValue = (key: string, value: any) => {
    setSlideForm(prev => ({ ...prev, [key]: value }));
  };

  // Upload processing
  const handleProcessFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    setUploadingImage(true);
    setError("");
    setUploadSuccess(false);

    try {
      // 1. Client-side compress to ensure immediate lightweight processing
      const compressedData = await compressImageFile(file);
      // Immediately set preview so user sees it right away
      setFormValue("image", compressedData);

      // 2. Upload to server upload endpoint for persistent storage
      const token = localStorage.getItem("wp_token");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ image: compressedData, prefix: "carousel" })
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setFormValue("image", data.url);
        setUploadSuccess(true);
      } else {
        console.warn("Upload fallback to compressed data URL:", data.error);
        // Fallback: the compressedData is already set and will be persisted on slide save
        setUploadSuccess(true);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      // Keep local preview if available
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideForm.title.trim()) {
      setError("Please provide a slide title.");
      return;
    }
    if (!slideForm.image.trim()) {
      setError("Please upload an image or provide an image URL.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("wp_token");
      const res = await fetch("/api/carousel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: slideForm.title,
          eyebrow: slideForm.eyebrow,
          highlight: slideForm.highlight,
          suffix: slideForm.suffix,
          description: slideForm.description,
          image: slideForm.image,
          imageUrl: slideForm.image,
          overlayColor: slideForm.overlayColor,
          hasDivider: slideForm.hasDivider
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Carousel slide created and persisted successfully!");
        onRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to create carousel slide.");
      }
    } catch (err) {
      setError("Server communication failed. Please check network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    if (!slideForm.title.trim()) {
      setError("Please provide a slide title.");
      return;
    }
    if (!slideForm.image.trim()) {
      setError("Please upload an image or provide an image URL.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("wp_token");
      const res = await fetch(`/api/carousel/${editingSlide.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: slideForm.title,
          eyebrow: slideForm.eyebrow,
          highlight: slideForm.highlight,
          suffix: slideForm.suffix,
          description: slideForm.description,
          image: slideForm.image,
          imageUrl: slideForm.image,
          overlayColor: slideForm.overlayColor,
          hasDivider: slideForm.hasDivider
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Carousel slide settings successfully updated and saved.");
        onRefresh();
        resetForm();
      } else {
        setError(data.error || "Failed to update slide settings.");
      }
    } catch (err) {
      setError("Server communication failed. Please check network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmDialog("Delete Slide?", "Are you sure you want to delete this homepage slider carousel slide?", "Yes, Delete Slide");
    if (!confirmed) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("wp_token");
      const res = await fetch(`/api/carousel/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Slider carousel slide successfully removed.");
        onRefresh();
      } else {
        setError(data.error || "Failed to delete slider carousel slide.");
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
      title: slide.title || "",
      eyebrow: slide.eyebrow || "",
      highlight: slide.highlight || "",
      suffix: slide.suffix || "",
      description: slide.description || "",
      image: slide.image || "",
      overlayColor: slide.overlayColor || "rgba(0,0,0,0.4)",
      hasDivider: slide.hasDivider !== false
    });
    setIsCreating(false);
    setUploadSuccess(false);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Slide ID", "Title", "Eyebrow", "Highlight", "Suffix", "Description", "Image URL", "Overlay Color"];
    const rows = filteredSlides.map(s => [
      s.id,
      `"${(s.title || "").replace(/"/g, '""')}"`,
      `"${(s.eyebrow || "").replace(/"/g, '""')}"`,
      `"${(s.highlight || "").replace(/"/g, '""')}"`,
      `"${(s.suffix || "").replace(/"/g, '""')}"`,
      `"${(s.description || "").replace(/\n/g, " ").replace(/"/g, '""')}"`,
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
    return (s.title || "").toLowerCase().includes(search.toLowerCase()) || 
           (s.description || "").toLowerCase().includes(search.toLowerCase()) ||
           (s.eyebrow || "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6" id="panel-admin-carousel">
      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl font-semibold text-xs flex items-center justify-between shadow-xs" id="carousel-success-alert">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMsg}
          </span>
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
          <p className="text-xs text-slate-500 mt-1">Upload high-resolution slide imagery, configure typography and scrim overlay opacity, and manage carousel slides.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={exportToCSV}
            className="flex-1 sm:flex-initial py-1.5 px-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportToPDF}
            className="flex-1 sm:flex-initial py-1.5 px-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
            className="flex-1 sm:flex-initial py-1.5 px-3 bg-brand-pink text-white rounded-xl font-bold text-xs hover:bg-brand-pink-dark flex items-center justify-center gap-1 transition cursor-pointer shadow-sm"
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
            placeholder="Search slider settings by title, eyebrow, or description..."
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
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition shrink-0 cursor-pointer"
          title="Refresh Carousel"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Container: Form + List */}
      <div className="space-y-8">
        
        {/* Slide Editor Form */}
        {(isCreating || editingSlide) && (
          <div className="w-full bg-white p-6 rounded-2xl border border-slate-200 luxury-shadow text-left animate-in slide-in-from-top duration-200">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3 mb-4">
              <h3 className="text-xs font-extrabold uppercase text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-pink" />
                <span>{editingSlide ? "Edit Carousel Slide" : "Design New Carousel Slide"}</span>
              </h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingSlide ? handleUpdate : handleCreate} className="space-y-5">
              
              {/* IMAGE UPLOAD / URL SECTION */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] uppercase font-bold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-brand-pink" />
                    <span>Slide Background Image *</span>
                  </label>
                  {uploadSuccess && (
                    <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Image Saved to Server
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Image Preview */}
                  <div className="md:col-span-4 flex flex-col items-center">
                    {slideForm.image ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-900 group shadow-sm">
                        <img
                          src={slideForm.image}
                          alt="Slide Cover Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80"; }}
                        />
                        {/* Overlay Simulation */}
                        <div 
                          className="absolute inset-0 pointer-events-none transition"
                          style={{ backgroundColor: slideForm.overlayColor || "rgba(0,0,0,0.4)" }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormValue("image", "");
                            setUploadSuccess(false);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer text-xs flex items-center gap-1"
                          title="Remove image"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-1.5 left-2 right-2 text-[9px] text-white/90 truncate font-mono bg-black/60 px-2 py-0.5 rounded">
                          {slideForm.image.startsWith("data:") ? "Local Compressed Data" : slideForm.image}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                        <ImageIcon className="w-8 h-8 text-slate-300 mb-1" />
                        <span className="text-[11px] font-semibold text-slate-500">No Image Selected</span>
                        <span className="text-[9px] text-slate-400 mt-0.5">Upload a photo or paste a URL</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="md:col-span-8 space-y-3">
                    {/* Drag & Drop Box */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleProcessFile(file);
                      }}
                      className={`border-2 border-dashed rounded-xl p-4 transition text-center cursor-pointer ${
                        isDragging 
                          ? "border-brand-pink bg-brand-pink/5" 
                          : "border-slate-300 bg-white hover:border-brand-pink/60 hover:bg-slate-50"
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleProcessFile(file);
                        }}
                        className="hidden"
                      />
                      {uploadingImage ? (
                        <div className="flex flex-col items-center justify-center py-2 space-y-1">
                          <Loader2 className="w-6 h-6 text-brand-pink animate-spin" />
                          <p className="text-xs font-bold text-slate-700">Compressing & uploading image...</p>
                          <p className="text-[10px] text-slate-400">Optimizing for fast high-resolution web loading</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-1">
                          <div className="w-9 h-9 rounded-full bg-brand-pink/10 flex items-center justify-center text-brand-pink mb-1.5">
                            <Upload className="w-4 h-4" />
                          </div>
                          <p className="text-xs font-bold text-slate-700">
                            Click to upload image or drag & drop here
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Supports PNG, JPG, WebP. High-res images are automatically optimized.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Direct Image URL input */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase">
                        <LinkIcon className="w-3 h-3 text-slate-400" />
                        <span>Or Paste Image URL</span>
                      </div>
                      <input
                        type="text"
                        placeholder="https://... or /assets/images/..."
                        value={slideForm.image}
                        onChange={(e) => {
                          setFormValue("image", e.target.value);
                          setUploadSuccess(false);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SLIDE CONTENT FIELDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Eyebrow (Header Accent)</label>
                  <input
                    type="text"
                    placeholder="E.g., BECAUSE LIFE IS BETTER WHEN WOMEN CAN PLAY TOO!"
                    value={slideForm.eyebrow}
                    onChange={(e) => setFormValue("eyebrow", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Slide Heading *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Remember the girl who loved to play?"
                    value={slideForm.title}
                    onChange={(e) => setFormValue("title", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Highlight Text (Italic Accent)</label>
                  <input
                    type="text"
                    placeholder="E.g., She's still in there."
                    value={slideForm.highlight}
                    onChange={(e) => setFormValue("highlight", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink italic"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Suffix Text</label>
                  <input
                    type="text"
                    placeholder="E.g., Come out and play."
                    value={slideForm.suffix}
                    onChange={(e) => setFormValue("suffix", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Dark Scrim Overlay (CSS color)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder="rgba(0,0,0,0.4)"
                      value={slideForm.overlayColor}
                      onChange={(e) => setFormValue("overlayColor", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-pink"
                    />
                    <div 
                      className="w-8 h-8 rounded-lg border border-slate-200 shrink-0" 
                      style={{ backgroundColor: slideForm.overlayColor || "rgba(0,0,0,0.4)" }} 
                      title="Overlay color preview"
                    />
                  </div>
                  <p className="text-[9px] text-slate-400">Controls background darkness for readable white text.</p>
                </div>

                <div className="space-y-1 flex flex-col justify-center">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Display Options</label>
                  <label className="flex items-center gap-2 py-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slideForm.hasDivider}
                      onChange={(e) => setFormValue("hasDivider", e.target.checked)}
                      className="rounded text-brand-pink focus:ring-brand-pink w-4 h-4"
                    />
                    <span className="text-xs text-slate-700 font-medium">Show decorative gold separator bar</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Description Text</label>
                <textarea
                  rows={3}
                  placeholder="Type a captivating description for this slide..."
                  value={slideForm.description}
                  onChange={(e) => setFormValue("description", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-150">
                <button
                  type="button"
                  onClick={resetForm}
                  className="py-2 px-4 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="py-2 px-6 bg-brand-pink hover:bg-brand-pink-dark text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Slide...</span>
                    </>
                  ) : (
                    <span>{editingSlide ? "Update Slide" : "Save Slide"}</span>
                  )}
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
                    <div className="relative w-full md:w-52 h-36 rounded-xl overflow-hidden border border-slate-200 shrink-0 self-center md:self-start shadow-xs bg-slate-950">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80"; }}
                        className="w-full h-full object-cover"
                      />
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{ backgroundColor: slide.overlayColor || "rgba(0,0,0,0.4)" }}
                      />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-4">
                        {slide.eyebrow ? (
                          <span className="text-[9px] font-bold text-brand-gold uppercase tracking-wider">
                            {slide.eyebrow}
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                            Overlay: {slide.overlayColor || "rgba(0,0,0,0.4)"}
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-slate-400">ID: {slide.id}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-800 leading-tight whitespace-pre-line">{slide.title}</h3>
                      {slide.highlight && (
                        <p className="text-xs italic text-brand-pink font-serif">{slide.highlight}</p>
                      )}
                      {slide.description && (
                        <p className="text-slate-600 text-xs leading-relaxed italic">
                          "{slide.description}"
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end items-center border-t border-slate-100 pt-3 gap-1">
                      <button
                        onClick={() => startEdit(slide)}
                        id={`btn-edit-slide-${slide.id}`}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition cursor-pointer"
                        title="Edit Slide"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(slide.id)}
                        id={`btn-delete-slide-${slide.id}`}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition cursor-pointer"
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
              <button onClick={() => setPdfData(null)} className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer">
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
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-800">{pdfData.title}</h2>
                <table className="w-full text-xs text-slate-600 border border-slate-200">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      {pdfData.headers.map((h, i) => (
                        <th key={i} className="p-2.5 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {pdfData.rows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2.5">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() => window.print()}
                className="py-1.5 px-4 bg-brand-pink text-white rounded-xl text-xs font-bold hover:bg-brand-pink-dark transition cursor-pointer shadow-xs"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
