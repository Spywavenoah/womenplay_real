import React from "react";
import { Plus, Search, RefreshCw, Globe, ExternalLink, Edit2, Trash2, Eye, Shield, Building2, Check, X, AlertCircle } from "lucide-react";
import type { Sponsor } from "../types";

interface AdminSponsorsProps {
  onRefreshData?: () => void;
}

export default function AdminSponsors({ onRefreshData }: AdminSponsorsProps) {
  const [sponsors, setSponsors] = React.useState<Sponsor[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMsg, setSuccessMsg] = React.useState("");
  const [search, setSearch] = React.useState("");

  // Modals state
  const [viewingSponsor, setViewingSponsor] = React.useState<Sponsor | null>(null);
  const [editingSponsor, setEditingSponsor] = React.useState<Sponsor | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // Form State
  const [formState, setFormState] = React.useState({
    name: "",
    tier: "Gold Sponsor",
    logoUrl: "",
    website: "",
    description: ""
  });
  const [submitting, setSubmitting] = React.useState(false);

  // Fetch Sponsors
  const loadSponsors = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sponsors");
      if (res.ok) {
        const data = await res.json();
        setSponsors(data);
      } else {
        setError("Failed to load sponsors list.");
      }
    } catch (e) {
      console.error(e);
      setError("Network error fetching sponsors.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSponsors();
  }, [loadSponsors]);

  const resetForm = () => {
    setFormState({
      name: "",
      tier: "Gold Sponsor",
      logoUrl: "",
      website: "",
      description: ""
    });
    setIsCreating(false);
    setEditingSponsor(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreating(true);
  };

  const openEditModal = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setFormState({
      name: sponsor.name || "",
      tier: sponsor.tier || "Gold Sponsor",
      logoUrl: sponsor.logoUrl || "",
      website: sponsor.website || "",
      description: sponsor.description || ""
    });
    setIsCreating(false);
  };

  // Create Sponsor
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Sponsor "${data.name}" added successfully.`);
        resetForm();
        loadSponsors();
        onRefreshData?.();
      } else {
        setError(data.error || "Failed to add sponsor.");
      }
    } catch (e) {
      console.error(e);
      setError("Server error creating sponsor.");
    } finally {
      setSubmitting(false);
    }
  };

  // Update Sponsor
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSponsor) return;
    setSubmitting(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/sponsors/${editingSponsor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Sponsor "${data.name}" updated successfully.`);
        resetForm();
        loadSponsors();
        onRefreshData?.();
      } else {
        setError(data.error || "Failed to update sponsor.");
      }
    } catch (e) {
      console.error(e);
      setError("Server error updating sponsor.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Sponsor
  const handleDelete = async (id: string) => {
    setSubmitting(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/sponsors/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setSuccessMsg("Sponsor removed successfully.");
        setDeletingId(null);
        loadSponsors();
        onRefreshData?.();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete sponsor.");
      }
    } catch (e) {
      console.error(e);
      setError("Server error deleting sponsor.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSponsors = sponsors.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.tier.toLowerCase().includes(search.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-left animate-fade-in" id="admin-sponsors-view">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow">
        <div>
          <h2 className="text-xl font-display font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-pink" />
            <span>Sponsors & Strategic Partners</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Manage corporate sponsors, title partners, and strategic alliances displayed across the WomenPlay network.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadSponsors}
            disabled={loading}
            className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Sponsor</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-4 rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 luxury-shadow flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          placeholder="Filter sponsors by name, tier, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-brand-pink"
        />
      </div>

      {/* Sponsors Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 luxury-shadow overflow-hidden">
        {loading && sponsors.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading sponsors...
          </div>
        ) : filteredSponsors.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No sponsors found.</p>
            <p className="text-slate-400">Click "Add New Sponsor" to record a strategic corporate partner.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Sponsor Partner</th>
                  <th className="p-4">Sponsorship Tier</th>
                  <th className="p-4">Official Website</th>
                  <th className="p-4">Added Date</th>
                  <th className="p-4 text-right">Actions (RUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSponsors.map((sponsor) => (
                  <tr key={sponsor.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {sponsor.logoUrl ? (
                          <img
                            src={sponsor.logoUrl}
                            alt={sponsor.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white p-0.5 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-brand-pink/10 text-brand-pink font-bold flex items-center justify-center shrink-0">
                            {sponsor.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{sponsor.name}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">{sponsor.description || "No description specified"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-gold/15 text-brand-gold-dark border border-brand-gold/30">
                        {sponsor.tier}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {sponsor.website ? (
                        <a
                          href={sponsor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-brand-pink hover:underline font-medium"
                        >
                          <span>{sponsor.website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">
                      {sponsor.createdAt ? new Date(sponsor.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* READ / VIEW */}
                        <button
                          onClick={() => setViewingSponsor(sponsor)}
                          className="p-1.5 text-slate-500 hover:text-brand-pink bg-slate-100 hover:bg-brand-pink/10 rounded-lg transition cursor-pointer"
                          title="Read Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* UPDATE / EDIT */}
                        <button
                          onClick={() => openEditModal(sponsor)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                          title="Update Sponsor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => setDeletingId(sponsor.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete Sponsor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: READ SPONSOR DETAILS */}
      {viewingSponsor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 luxury-shadow animate-fade-in relative text-left">
            <button
              onClick={() => setViewingSponsor(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              {viewingSponsor.logoUrl ? (
                <img
                  src={viewingSponsor.logoUrl}
                  alt={viewingSponsor.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 bg-white p-1"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-brand-pink/10 text-brand-pink font-bold text-xl flex items-center justify-center">
                  {viewingSponsor.name.charAt(0)}
                </div>
              )}
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold-dark border border-brand-gold/30">
                  {viewingSponsor.tier}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{viewingSponsor.name}</h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Description & Mission</label>
                <p className="text-slate-700 leading-relaxed mt-1 bg-slate-50 p-3 rounded-xl border border-slate-150">
                  {viewingSponsor.description || "No detailed description provided."}
                </p>
              </div>

              {viewingSponsor.website && (
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Website URL</label>
                  <p className="mt-1">
                    <a
                      href={viewingSponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-pink hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{viewingSponsor.website}</span>
                    </a>
                  </p>
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Record Created</label>
                <p className="text-slate-600 font-mono mt-0.5">
                  {viewingSponsor.createdAt ? new Date(viewingSponsor.createdAt).toLocaleString() : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setViewingSponsor(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE OR UPDATE SPONSOR */}
      {(isCreating || editingSponsor) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 luxury-shadow animate-fade-in relative text-left">
            <button
              onClick={resetForm}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                {editingSponsor ? "Update Sponsor Details" : "Add New Corporate Sponsor"}
              </h3>
              <p className="text-slate-500 text-xs">
                Fill in the official partner details to display in the WomenPlay sponsors directory.
              </p>
            </div>

            <form onSubmit={editingSponsor ? handleUpdate : handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Sponsor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Goldman Sachs Leadership Alliance"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Sponsorship Tier *</label>
                <select
                  value={formState.tier}
                  onChange={(e) => setFormState({ ...formState, tier: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink"
                >
                  <option value="Title Sponsor">Title Sponsor ($50,000+)</option>
                  <option value="Platinum Sponsor">Platinum Sponsor ($25,000)</option>
                  <option value="Gold Sponsor">Gold Sponsor ($10,000)</option>
                  <option value="Executive Chapter Sponsor">Executive Chapter Sponsor ($5,000)</option>
                  <option value="Media & Technology Partner">Media & Technology Partner</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Logo Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formState.logoUrl}
                  onChange={(e) => setFormState({ ...formState, logoUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Website URL</label>
                <input
                  type="text"
                  placeholder="https://company.com"
                  value={formState.website}
                  onChange={(e) => setFormState({ ...formState, website: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Description & Mission</label>
                <textarea
                  rows={3}
                  placeholder="Key partnership details, fellowship contributions, and sponsorship scope..."
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingSponsor ? "Save Changes" : "Create Sponsor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 luxury-shadow text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Sponsor</h3>
              <p className="text-slate-500 text-xs mt-1">
                Are you sure you want to remove this sponsor from the directory? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={submitting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                {submitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
