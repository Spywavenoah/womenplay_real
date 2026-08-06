import React from "react";
import { 
  ShieldCheck, Plus, Search, Edit3, Trash2, UserCheck, UserX, 
  Loader2, Mail, Building, CheckCircle, AlertTriangle, X, RefreshCw, Crown, Sparkles, UserPlus
} from "lucide-react";
import { UserRole, MembershipStatus, MembershipTier } from "../types";
import type { User } from "../types";
import { showConfirmDialog } from "../lib/swal";

interface AdminAdminsProps {
  currentUser: User | null;
  onRefreshData?: () => void;
}

export default function AdminAdmins({ currentUser, onRefreshData }: AdminAdminsProps) {
  const [admins, setAdmins] = React.useState<User[]>([]);
  const [allMembers, setAllMembers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showPromoteModal, setShowPromoteModal] = React.useState(false);
  const [editingAdmin, setEditingAdmin] = React.useState<User | null>(null);

  // Form state for creating new admin
  const [newAdminForm, setNewAdminForm] = React.useState({
    fullName: "",
    email: "",
    title: "Executive Administrator",
    company: "WomenPlay Executive Network",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
  });

  // Promote search
  const [promoteSearch, setPromoteSearch] = React.useState("");

  const [actionLoading, setActionLoading] = React.useState(false);
  const [feedbackMsg, setFeedbackMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchAdminsAndMembers = async () => {
    setLoading(true);
    try {
      const [resAdmins, resMembers] = await Promise.all([
        fetch("/api/admins"),
        fetch("/api/members")
      ]);
      if (resAdmins.ok) {
        const data = await resAdmins.json();
        setAdmins(data);
      }
      if (resMembers.ok) {
        const data = await resMembers.json();
        setAllMembers(data);
      }
    } catch (err) {
      console.error("Failed to load admins:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAdminsAndMembers();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAdminForm,
          adminId: currentUser?.id,
          adminName: currentUser?.fullName
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({ type: "success", text: data.message || "Admin created successfully!" });
        setShowAddModal(false);
        setNewAdminForm({
          fullName: "",
          email: "",
          title: "Executive Administrator",
          company: "WomenPlay Executive Network",
          avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
        });
        fetchAdminsAndMembers();
        if (onRefreshData) onRefreshData();
      } else {
        setFeedbackMsg({ type: "error", text: data.error || "Failed to create administrator." });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Network error creating administrator." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setActionLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch(`/api/admins/${editingAdmin.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: editingAdmin.fullName,
          email: editingAdmin.email,
          title: editingAdmin.title,
          company: editingAdmin.company,
          avatarUrl: editingAdmin.avatarUrl,
          membershipStatus: editingAdmin.membershipStatus,
          adminId: currentUser?.id,
          adminName: currentUser?.fullName
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({ type: "success", text: data.message || "Admin updated!" });
        setEditingAdmin(null);
        fetchAdminsAndMembers();
        if (onRefreshData) onRefreshData();
      } else {
        setFeedbackMsg({ type: "error", text: data.error || "Failed to update administrator." });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Network error updating admin." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDemoteAdmin = async (admin: User) => {
    const confirmed = await showConfirmDialog(
      "Demote Administrator?",
      `Are you sure you want to demote Administrator "${admin.fullName}" to a Standard Member?`,
      "Yes, Demote Admin"
    );
    if (!confirmed) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admins/${admin.id}/demote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: currentUser?.id,
          adminName: currentUser?.fullName
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({ type: "success", text: data.message });
        fetchAdminsAndMembers();
        if (onRefreshData) onRefreshData();
      } else {
        setFeedbackMsg({ type: "error", text: data.error || "Failed to demote admin." });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Error demoting administrator." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAdmin = async (admin: User) => {
    const confirmed = await showConfirmDialog(
      "Delete Administrator Account?",
      `DANGER: Are you sure you want to PERMANENTLY DELETE administrator account "${admin.fullName}" (${admin.email})? This action cannot be undone.`,
      "Yes, Delete Account"
    );
    if (!confirmed) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admins/${admin.id}?actionType=delete&adminId=${currentUser?.id}&adminName=${encodeURIComponent(currentUser?.fullName || "")}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({ type: "success", text: data.message });
        fetchAdminsAndMembers();
        if (onRefreshData) onRefreshData();
      } else {
        setFeedbackMsg({ type: "error", text: data.error || "Failed to delete admin." });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Error deleting admin account." });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromoteMember = async (member: User) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: member.fullName,
          email: member.email,
          title: member.title || "Executive Administrator",
          company: member.company || "WomenPlay Network",
          avatarUrl: member.avatarUrl,
          adminId: currentUser?.id,
          adminName: currentUser?.fullName
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({ type: "success", text: `Successfully promoted ${member.fullName} to Administrator!` });
        setShowPromoteModal(false);
        fetchAdminsAndMembers();
        if (onRefreshData) onRefreshData();
      } else {
        setFeedbackMsg({ type: "error", text: data.error || "Failed to promote member." });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Network error promoting member." });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAdmins = admins.filter(a => 
    a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.title && a.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const nonAdminMembers = allMembers.filter(m => m.role !== UserRole.ADMIN && m.role !== "ADMIN");
  const filteredPromoteMembers = nonAdminMembers.filter(m =>
    m.fullName.toLowerCase().includes(promoteSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(promoteSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn text-left" id="admin-admins-view">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-pink shrink-0" />
            <h2 className="text-xl font-display font-extrabold text-slate-900">
              Admin & Governance Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Provision, manage, update, and revoke administrative privileges for platform executives and chapter directors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowPromoteModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-brand-gold-dark" />
            <span>Promote Member</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Administrator</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between gap-2 animate-fadeIn ${
          feedbackMsg.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === "success" ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button type="button" onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 luxury-shadow flex items-center space-x-4">
          <div className="p-3 bg-brand-pink-light/30 text-brand-pink rounded-xl">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Administrators</span>
            <h3 className="text-2xl font-black text-slate-900">{admins.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 luxury-shadow flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Status</span>
            <h3 className="text-2xl font-black text-slate-900">
              {admins.filter(a => a.membershipStatus === MembershipStatus.ACTIVE).length}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 luxury-shadow flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-800 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Members Platform-Wide</span>
            <h3 className="text-2xl font-black text-slate-900">{allMembers.length}</h3>
          </div>
        </div>
      </div>

      {/* Main Admin List Section */}
      <div className="bg-white rounded-2xl border border-slate-100 luxury-shadow p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search administrators by name, email, title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-pink"
            />
          </div>

          <button
            type="button"
            onClick={fetchAdminsAndMembers}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Refresh admin accounts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-pink" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-pink" />
            <span className="text-xs font-medium">Loading administrator personnel...</span>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <UserX className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold">No administrators matched your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAdmins.map((admin) => {
              const isSelf = admin.id === currentUser?.id;
              return (
                <div 
                  key={admin.id}
                  className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition flex flex-col justify-between space-y-4 relative group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <img
                        src={admin.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"}
                        alt={admin.fullName}
                        className="w-12 h-12 rounded-full border-2 border-brand-pink object-cover shrink-0 shadow-xs"
                      />
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-extrabold text-slate-900 truncate">{admin.fullName}</h4>
                          {isSelf && (
                            <span className="px-1.5 py-0.2 rounded bg-brand-pink text-white text-[9px] font-black uppercase">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 font-mono">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{admin.email}</span>
                        </p>
                        <p className="text-[10px] text-brand-gold-dark font-extrabold uppercase tracking-wide truncate">
                          {admin.title || "Executive Administrator"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/60 text-[11px] space-y-1 text-slate-600">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[10px]">Organization:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[140px]">{admin.company || "WomenPlay"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[10px]">Status:</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          admin.membershipStatus === MembershipStatus.ACTIVE
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}>
                          {admin.membershipStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[10px]">Provisioned:</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "System"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setEditingAdmin({ ...admin })}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3 text-slate-500" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDemoteAdmin(admin)}
                      disabled={actionLoading}
                      className="px-2.5 py-1.5 rounded-lg border border-amber-200 text-amber-800 hover:bg-amber-50 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Demote to standard member"
                    >
                      <UserX className="w-3 h-3 text-amber-600" />
                      <span>Demote</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteAdmin(admin)}
                      disabled={actionLoading}
                      className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Permanently remove admin account"
                    >
                      <Trash2 className="w-3 h-3 text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE NEW ADMIN MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-brand-pink" />
                <h3 className="text-base font-extrabold text-slate-900">Provision New Administrator</h3>
              </div>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newAdminForm.fullName}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, fullName: e.target.value })}
                  placeholder="e.g. Dr. Victoria Sterling"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newAdminForm.email}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                  placeholder="e.g. v.sterling@womenplay.org"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Executive Title</label>
                  <input
                    type="text"
                    value={newAdminForm.title}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, title: e.target.value })}
                    placeholder="e.g. Director of Operations"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:border-brand-pink"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Chapter</label>
                  <input
                    type="text"
                    value={newAdminForm.company}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, company: e.target.value })}
                    placeholder="e.g. WomenPlay Global"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:border-brand-pink"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Avatar Image Upload</label>
                <div className="flex items-center space-x-3">
                  {newAdminForm.avatarUrl ? (
                    <img src={newAdminForm.avatarUrl} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-brand-pink" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">IMG</div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewAdminForm({ ...newAdminForm, avatarUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-pink file:text-white hover:file:bg-brand-pink-dark cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-brand-pink hover:bg-brand-pink-dark text-white font-bold transition flex items-center space-x-2 cursor-pointer shadow-sm"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Provision Administrator</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ADMIN MODAL */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-brand-pink" />
                <h3 className="text-base font-extrabold text-slate-900">Edit Administrator Details</h3>
              </div>
              <button type="button" onClick={() => setEditingAdmin(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAdmin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingAdmin.fullName}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingAdmin.email}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Executive Title</label>
                  <input
                    type="text"
                    value={editingAdmin.title || ""}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:border-brand-pink"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Chapter</label>
                  <input
                    type="text"
                    value={editingAdmin.company || ""}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, company: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:border-brand-pink"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Membership Status</label>
                <select
                  value={editingAdmin.membershipStatus}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, membershipStatus: e.target.value as MembershipStatus })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:border-brand-pink"
                >
                  <option value={MembershipStatus.ACTIVE}>ACTIVE</option>
                  <option value={MembershipStatus.SUSPENDED}>SUSPENDED</option>
                  <option value={MembershipStatus.PENDING}>PENDING</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={editingAdmin.avatarUrl || ""}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, avatarUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-brand-pink hover:bg-brand-pink-dark text-white font-bold transition flex items-center space-x-2 cursor-pointer shadow-sm"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>Save Administrator Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMOTE EXISTING MEMBER MODAL */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-brand-gold-dark" />
                <h3 className="text-base font-extrabold text-slate-900">Promote Member to Administrator</h3>
              </div>
              <button type="button" onClick={() => setShowPromoteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-500">
                Search among standard network members and grant them administrative access with one click.
              </p>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search members by name or email..."
                  value={promoteSearch}
                  onChange={(e) => setPromoteSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-pink"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
                {filteredPromoteMembers.length === 0 ? (
                  <p className="text-slate-400 text-center py-6">No eligible members found.</p>
                ) : (
                  filteredPromoteMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={member.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                          alt={member.fullName}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{member.fullName}</p>
                          <p className="text-[10px] text-slate-500 truncate">{member.email}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePromoteMember(member)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg bg-brand-pink text-white font-bold text-[11px] hover:bg-brand-pink-dark transition cursor-pointer shrink-0"
                      >
                        Promote
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPromoteModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
