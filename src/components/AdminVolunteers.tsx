import React from "react";
import { Users, Loader2, Check, X, Eye, Edit3, Trash2, KeyRound, Search, AlertCircle, ShieldCheck, Mail, Phone, Clock, Sparkles } from "lucide-react";
import type { Volunteer } from "../types";
import { showConfirmDialog, showErrorAlert, showSuccessAlert } from "../lib/swal";

interface AdminVolunteersProps {
  onRefreshData?: () => Promise<void>;
}

export default function AdminVolunteers({ onRefreshData }: AdminVolunteersProps) {
  const [volunteers, setVolunteers] = React.useState<Volunteer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "pending" | "approved" | "disabled">("ALL");
  const [successMsg, setSuccessMsg] = React.useState("");
  const [error, setError] = React.useState("");

  const [selected, setSelected] = React.useState<Volunteer | null>(null);
  const [showDetail, setShowDetail] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(false);

  const [enablingId, setEnablingId] = React.useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = React.useState({
    role: "",
    status: "pending"
  });

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/volunteers");
      if (res.ok) {
        const data = await res.json();
        setVolunteers(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch volunteers:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchVolunteers();
  }, []);

  const filtered = volunteers.filter(v => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term
      || v.fullName.toLowerCase().includes(term)
      || v.email.toLowerCase().includes(term)
      || (v.role || "").toLowerCase().includes(term);
    const matchesStatus = statusFilter === "ALL" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = volunteers.filter(v => v.status === "pending").length;
  const enabledCount = volunteers.filter(v => v.enabled).length;

  const handleEnable = async (volunteer: Volunteer) => {
    const confirmed = await showConfirmDialog(
      "Enable Volunteer Login?",
      `This will approve ${volunteer.fullName}, create their volunteer portal account, and email them a link to set their password and secure two-factor authentication (2FA).`,
      "Yes, Enable & Email"
    );
    if (!confirmed) return;

    setEnablingId(volunteer.id);
    setError("");
    try {
      const res = await fetch(`/api/volunteers/${volunteer.id}/enable`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showSuccessAlert("Volunteer Enabled", data.message || "Activation email sent.");
        await fetchVolunteers();
        if (onRefreshData) await onRefreshData();
      } else {
        showErrorAlert("Error", data.error || "Failed to enable volunteer.");
      }
    } catch (err) {
      console.error(err);
      showErrorAlert("Error", "Network error enabling volunteer.");
    } finally {
      setEnablingId(null);
    }
  };

  const handleDisable = async (volunteer: Volunteer) => {
    const confirmed = await showConfirmDialog(
      "Disable Volunteer Login?",
      `Volunteer login access will be revoked for ${volunteer.fullName}.`,
      "Yes, Disable"
    );
    if (!confirmed) return;

    setEnablingId(volunteer.id);
    try {
      const res = await fetch(`/api/volunteers/${volunteer.id}/disable`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showSuccessAlert("Volunteer Disabled", data.message || "Login access revoked.");
        await fetchVolunteers();
        if (onRefreshData) await onRefreshData();
      } else {
        showErrorAlert("Error", data.error || "Failed to disable volunteer.");
      }
    } catch (err) {
      console.error(err);
      showErrorAlert("Error", "Network error disabling volunteer.");
    } finally {
      setEnablingId(null);
    }
  };

  const openEdit = (volunteer: Volunteer) => {
    setSelected(volunteer);
    setEditForm({ role: volunteer.role || "", status: volunteer.status });
    setError("");
    setShowEdit(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    setError("");
    try {
      const res = await fetch(`/api/volunteers/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok) {
        showSuccessAlert("Updated", "Volunteer application updated successfully.");
        setShowEdit(false);
        setShowDetail(false);
        await fetchVolunteers();
        if (onRefreshData) await onRefreshData();
      } else {
        setError(data.error || "Failed to update volunteer.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error updating volunteer.");
    }
  };

  const handleDelete = async (volunteer: Volunteer) => {
    const confirmed = await showConfirmDialog(
      "Delete Volunteer Application?",
      `Are you sure you want to permanently delete ${volunteer.fullName}'s application? This cannot be undone.`,
      "Yes, Delete"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/volunteers/${volunteer.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        showSuccessAlert("Deleted", "Volunteer application deleted successfully.");
        setShowDetail(false);
        await fetchVolunteers();
        if (onRefreshData) await onRefreshData();
      } else {
        showErrorAlert("Error", data.error || "Failed to delete volunteer.");
      }
    } catch (err) {
      console.error(err);
      showErrorAlert("Error", "Network error deleting volunteer.");
    }
  };

  const statusBadge = (v: Volunteer) => {
    if (v.enabled) {
      return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><Check className="w-3 h-3" />Enabled</span>;
    }
    if (v.status === "disabled") {
      return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200"><X className="w-3 h-3" />Disabled</span>;
    }
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
  };

  return (
    <div className="space-y-8" id="admin-volunteers-container">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center space-x-2 text-brand-pink text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Founding Volunteer Program · Class of 2026</span>
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white">Volunteer Applications</h2>
          <p className="text-xs text-slate-400 mt-1">
            Review applications, assign roles, and enable volunteer portal logins. Enabling a volunteer emails them a link to set their password and secure 2FA.
          </p>
        </div>
        <button
          onClick={fetchVolunteers}
          id="btn-refresh-volunteers"
          className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-pink to-brand-gold text-white font-bold text-xs hover:opacity-95 shadow-md shadow-brand-pink/20 transition duration-200 shrink-0 cursor-pointer"
        >
          <Loader2 className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stat Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 luxury-shadow">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Applications</p>
          <p className="text-3xl font-display font-extrabold text-slate-900 mt-1">{volunteers.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 luxury-shadow">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</p>
          <p className="text-3xl font-display font-extrabold text-amber-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 luxury-shadow">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Login Enabled</p>
          <p className="text-3xl font-display font-extrabold text-emerald-600 mt-1">{enabledCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 luxury-shadow">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Roles</p>
          <p className="text-3xl font-display font-extrabold text-brand-pink mt-1">{volunteers.filter(v => v.role).length}</p>
        </div>
      </div>

      {/* Success / Error */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-2xl flex items-center space-x-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs px-4 py-3 rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white rounded-2xl border border-slate-100 p-4 luxury-shadow">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
          />
        </div>
        <div className="flex items-center space-x-2">
          {(["ALL", "pending", "approved", "disabled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer ${statusFilter === s ? "bg-brand-pink text-white shadow-md shadow-brand-pink/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {s === "ALL" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-pink" />
          <p className="text-xs font-semibold uppercase tracking-wider">Loading volunteer applications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-4 shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Volunteer Applications</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Applications submitted through the public Volunteer page will appear here for review.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 luxury-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                  <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Roles / Availability</th>
                  <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition" id={`volunteer-row-${v.id}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-pink to-brand-gold text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {v.fullName.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{v.fullName}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
                            {v.role ? `Assigned: ${v.role}` : "Role not yet assigned"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="flex items-center gap-1.5 text-slate-600"><Mail className="w-3 h-3 text-slate-400" />{v.email}</p>
                      <p className="flex items-center gap-1.5 text-slate-600 mt-1"><Phone className="w-3 h-3 text-slate-400" />{v.phone}</p>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <p className="flex items-center gap-1.5 text-slate-600 mb-1"><Clock className="w-3 h-3 text-slate-400" />{v.availability}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{v.roles.join(", ") || "No roles selected"}</p>
                    </td>
                    <td className="px-5 py-4">{statusBadge(v)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setSelected(v); setShowDetail(true); }}
                          title="View Application"
                          className="p-2 rounded-lg bg-slate-100 hover:bg-brand-pink/10 hover:text-brand-pink text-slate-600 transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(v)}
                          title="Edit"
                          className="p-2 rounded-lg bg-slate-100 hover:bg-brand-pink/10 hover:text-brand-pink text-slate-600 transition cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {!v.enabled ? (
                          <button
                            onClick={() => handleEnable(v)}
                            disabled={enablingId === v.id}
                            title="Enable Login & Send Setup Email"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition disabled:opacity-50 cursor-pointer"
                          >
                            {enablingId === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                            Enable
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDisable(v)}
                            disabled={enablingId === v.id}
                            title="Disable Login"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition disabled:opacity-50 cursor-pointer"
                          >
                            {enablingId === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                            Disable
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(v)}
                          title="Delete"
                          className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 relative text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-display font-extrabold text-slate-900">{selected.fullName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selected.email} · Applied {new Date(selected.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setShowDetail(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">✕</button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {statusBadge(selected)}
              {selected.role && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-pink/10 text-brand-pink border border-brand-pink/20">Assigned: {selected.role}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Phone</p><p className="text-sm text-slate-800">{selected.phone || "—"}</p></div>
              <div className="bg-slate-50 rounded-2xl p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">LinkedIn</p><p className="text-sm text-slate-800 break-all">{selected.linkedin || "—"}</p></div>
              <div className="bg-slate-50 rounded-2xl p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Availability</p><p className="text-sm text-slate-800">{selected.availability || "—"}</p></div>
              <div className="bg-slate-50 rounded-2xl p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">T-shirt Size</p><p className="text-sm text-slate-800">{selected.shirtSize || "—"}</p></div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Roles of Interest</p>
              <div className="flex flex-wrap gap-2">
                {selected.roles.length > 0 ? selected.roles.map((r, i) => (
                  <span key={i} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-brand-pink/10 text-brand-pink border border-brand-pink/20">{r}</span>
                )) : <span className="text-xs text-slate-400">None selected</span>}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Skills, Experience & Certifications</p>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-2xl p-4">{selected.skills || "—"}</p>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Why They Want to Volunteer</p>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-2xl p-4">{selected.why || "—"}</p>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Emergency Contact</p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-2xl p-4">{selected.emergencyContact || "—"}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-end gap-3">
              <button onClick={() => handleDelete(selected)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 transition">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <button onClick={() => openEdit(selected)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              {!selected.enabled && (
                <button onClick={() => handleEnable(selected)} disabled={enablingId === selected.id} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50">
                  {enablingId === selected.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                  Enable Login & Email
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 relative text-left">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-display font-extrabold text-slate-900">Edit Volunteer</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selected.fullName}</p>
              </div>
              <button onClick={() => setShowEdit(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">✕</button>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Role</label>
                <input
                  type="text"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  placeholder="E.g., Guest Experience Ambassador"
                  className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink"
                />
                <p className="text-[10px] text-slate-400 mt-1">Used on the volunteer's certificate and orientation details.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Application Status</label>
                <div className="flex items-center space-x-2">
                  {(["pending", "approved", "disabled"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, status: s })}
                      className={`px-3.5 py-2 rounded-xl text-[11px] font-bold transition cursor-pointer ${editForm.status === s ? "bg-brand-pink text-white shadow-md shadow-brand-pink/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-full bg-brand-pink text-white text-xs font-bold hover:bg-brand-pink-dark transition shadow-md shadow-brand-pink/20">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
