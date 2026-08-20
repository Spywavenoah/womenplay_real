import React from "react";
import { Plus, Edit3, Trash2, Users, Loader2, Sparkles, Check, AlertCircle, ArrowUpDown, Upload, Image as ImageIcon, Camera, Link as LinkIcon, X } from "lucide-react";
import type { Founder } from "../types";
import { showConfirmDialog, showErrorAlert, showSuccessAlert } from "../lib/swal";

interface AdminFoundersProps {
  onRefreshData?: () => Promise<void>;
}

export default function AdminFounders({ onRefreshData }: AdminFoundersProps) {
  const [founders, setFounders] = React.useState<Founder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");

  // Modal State
  const [showModal, setShowModal] = React.useState(false);
  const [editingFounder, setEditingFounder] = React.useState<Founder | null>(null);
  const [imageMode, setImageMode] = React.useState<"upload" | "url">("upload");

  // Form State
  const [formData, setFormData] = React.useState({
    name: "",
    title: "",
    bio: "",
    image: "",
    order: 1
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError("Selected file is too large. Please select an image under 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchFounders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/founders");
      if (res.ok) {
        const data = await res.json();
        // Sort by order ascending
        const sorted = [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
        setFounders(sorted);
      }
    } catch (err) {
      console.error("Failed to fetch founders:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFounders();
  }, []);

  const handleOpenAddModal = () => {
    setEditingFounder(null);
    setFormData({
      name: "",
      title: "",
      bio: "",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
      order: founders.length + 1
    });
    setError("");
    setShowModal(true);
  };

  const handleOpenEditModal = (founder: Founder) => {
    setEditingFounder(founder);
    setFormData({
      name: founder.name,
      title: founder.title,
      bio: founder.bio || "",
      image: founder.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
      order: founder.order || 1
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.title.trim()) {
      setError("Name and Title are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const isEdit = !!editingFounder;
      const url = isEdit ? `/api/founders/${editingFounder.id}` : "/api/founders";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccessMsg(isEdit ? "Founder profile updated!" : "New founder added successfully!");
        setShowModal(false);
        await fetchFounders();
        if (onRefreshData) await onRefreshData();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        let errorMsg = "Failed to save founder";
        try {
          const data = await res.json();
          if (data && data.error) errorMsg = data.error;
        } catch {
          if (res.status === 413) {
            errorMsg = "Uploaded image payload is too large. Please select an image under 8MB or use an image URL.";
          } else {
            errorMsg = `Server error (${res.status}). Please try again.`;
          }
        }
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error("Error saving founder:", err);
      setError("An unexpected error occurred while saving founder profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await showConfirmDialog(
      "Remove Founder?",
      `Are you sure you want to remove ${name} from the Founders directory?`,
      "Yes, Remove Founder"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/founders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessMsg("Founder deleted successfully.");
        await fetchFounders();
        if (onRefreshData) await onRefreshData();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        showErrorAlert("Error", "Failed to delete founder.");
      }
    } catch (err) {
      console.error("Error deleting founder:", err);
      showErrorAlert("Error", "Error deleting founder.");
    }
  };

  return (
    <div className="space-y-8" id="admin-founders-container">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-brand-pink text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>WomenPlay Leadership Directory</span>
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white">Founders of WomenPlay</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage the distinguished founders and executive board members displayed on the public home page.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          id="btn-add-founder"
          className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-pink to-brand-gold text-white font-bold text-xs hover:opacity-95 shadow-md shadow-brand-pink/20 transition duration-200 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Founder</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-2xl flex items-center space-x-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Founders List / Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-pink" />
          <p className="text-xs font-semibold uppercase tracking-wider">Loading founders directory...</p>
        </div>
      ) : founders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-4 shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Founders Configured</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Get started by adding the founders, directors, and executives who lead WomenPlay.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-brand-pink text-white font-semibold text-xs hover:bg-brand-pink-dark transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Founder</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {founders.map((founder) => (
            <div
              key={founder.id}
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Image & Badge Header */}
              <div className="relative h-64 overflow-hidden bg-slate-100">
                <img
                  src={founder.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300"}
                  alt={founder.name}
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300"; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow">
                  <ArrowUpDown className="w-3 h-3 text-brand-gold" />
                  <span>Order: {founder.order || 1}</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-pink transition-colors">
                    {founder.name}
                  </h3>
                  <span className="text-xs font-semibold text-brand-gold-dark uppercase tracking-wider block mb-2">
                    {founder.title}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {founder.bio || "No description provided."}
                  </p>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenEditModal(founder)}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-brand-pink transition cursor-pointer px-3 py-1.5 rounded-lg hover:bg-slate-50"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-brand-gold-dark" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    onClick={() => handleDelete(founder.id, founder.name)}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition cursor-pointer px-3 py-1.5 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 relative text-left">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingFounder ? "Edit Founder Profile" : "Add New Founder"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure the founder details to display on the public WomenPlay homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="E.g., Eleanor Vance"
                  className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Title / Role <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="E.g., Executive Director & Founder"
                  className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Biography / Summary
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brief summary of their background, accomplishments, and leadership role..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink resize-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Leader Profile Photo <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setImageMode("upload")}
                      className={`px-2 py-0.5 rounded-md transition ${
                        imageMode === "upload" ? "bg-white text-brand-pink shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Upload className="w-3 h-3 inline mr-1" />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`px-2 py-0.5 rounded-md transition ${
                        imageMode === "url" ? "bg-white text-brand-pink shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <LinkIcon className="w-3 h-3 inline mr-1" />
                      Image URL
                    </button>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {imageMode === "upload" ? (
                  <div className="space-y-2">
                    {formData.image ? (
                      <div className="relative rounded-2xl border border-slate-200 p-3 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <img
                            src={formData.image}
                            alt="Founder preview"
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200";
                            }}
                          />
                          <div className="overflow-hidden">
                            <span className="text-xs font-bold text-slate-800 block truncate">Photo Uploaded</span>
                            <span className="text-[10px] text-slate-500 block truncate">Ready to display on public site</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-slate-100 transition"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image: "" })}
                            className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 transition"
                            title="Remove Photo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-brand-pink rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-brand-pink/5 transition cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-full bg-brand-pink/10 text-brand-pink flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition duration-200">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          Click to upload photo or drag & drop
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          PNG, JPG, WEBP or GIF up to 8MB
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-full bg-brand-pink text-white text-xs font-bold hover:bg-brand-pink-dark transition shadow-md shadow-brand-pink/20 flex items-center space-x-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingFounder ? "Save Changes" : "Create Founder"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
