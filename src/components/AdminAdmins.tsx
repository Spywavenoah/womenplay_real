import React from "react";
import { 
  ShieldCheck, Plus, Search, Edit3, Trash2, UserCheck, UserX, 
  Loader2, Mail, Building, CheckCircle, AlertTriangle, X, RefreshCw, Crown, Sparkles, UserPlus,
  Copy, ExternalLink, Eye, Send, Inbox, Check, FileText
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

  // Provisioning & Email Dispatch Report Modal State
  const [provisionReport, setProvisionReport] = React.useState<{
    user: User;
    confirmationUrl?: string;
    confirmationDelivered?: boolean;
    welcomeDelivered?: boolean;
    smtpError?: string | null;
  } | null>(null);

  // Email Preview Modal State
  const [previewAdmin, setPreviewAdmin] = React.useState<User | null>(null);
  const [previewData, setPreviewData] = React.useState<{
    confirmationEmail?: { subject: string; bodyHtml: string };
    welcomeEmail?: { subject: string; bodyHtml: string };
    confirmationUrl?: string;
  } | null>(null);
  const [previewTab, setPreviewTab] = React.useState<"confirmation" | "welcome">("confirmation");
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [customSendEmail, setCustomSendEmail] = React.useState("");
  const [customSending, setCustomSending] = React.useState(false);
  const [customSendMsg, setCustomSendMsg] = React.useState<string | null>(null);

  // Email Dispatch Logs Modal State
  const [showLogsModal, setShowLogsModal] = React.useState(false);
  const [emailLogs, setEmailLogs] = React.useState<any[]>([]);
  const [logsLoading, setLogsLoading] = React.useState(false);

  // Copied link toast / indicator
  const [copiedLink, setCopiedLink] = React.useState(false);

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

        // Show comprehensive provisioning & email dispatch report
        setProvisionReport({
          user: data.user,
          confirmationUrl: data.confirmationUrl,
          confirmationDelivered: data.confirmationDelivered,
          welcomeDelivered: data.welcomeDelivered,
          smtpError: data.smtpError
        });
      } else {
        setFeedbackMsg({ type: "error", text: data.error || "Failed to create administrator." });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Network error creating administrator." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyActivationLink = async (admin: User) => {
    try {
      const res = await fetch(`/api/admins/${admin.id}/activation-link`);
      const data = await res.json();
      if (res.ok && data.confirmationUrl) {
        await navigator.clipboard.writeText(data.confirmationUrl);
        setFeedbackMsg({ type: "success", text: `Activation link for ${admin.fullName} copied to clipboard!` });
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        setFeedbackMsg({ type: "error", text: data.error || "Could not retrieve activation link." });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Failed to copy activation link." });
    }
  };

  const handleOpenEmailPreview = async (admin: User) => {
    setPreviewAdmin(admin);
    setPreviewLoading(true);
    setCustomSendEmail(admin.email);
    setCustomSendMsg(null);
    try {
      const res = await fetch(`/api/admins/${admin.id}/preview-emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (res.ok) {
        setPreviewData({
          confirmationEmail: data.confirmationEmail,
          welcomeEmail: data.welcomeEmail,
          confirmationUrl: data.confirmationUrl
        });
      }
    } catch (err) {
      console.error("Preview load error:", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSendCustomEmail = async (type: "confirmation" | "welcome") => {
    if (!previewAdmin) return;
    setCustomSending(true);
    setCustomSendMsg(null);
    try {
      const res = await fetch(`/api/admins/${previewAdmin.id}/send-custom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailType: type,
          recipientEmail: customSendEmail
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCustomSendMsg(data.message || `Dispatched to ${customSendEmail}!`);
      } else {
        setCustomSendMsg(`Notice: ${data.error || data.message || "Could not dispatch"}`);
      }
    } catch (err) {
      setCustomSendMsg("Network error sending email.");
    } finally {
      setCustomSending(false);
    }
  };

  const fetchEmailLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch("/api/admins-email-logs");
      if (res.ok) {
        const data = await res.json();
        setEmailLogs(data);
      }
    } catch (err) {
      console.error("Failed to load email logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleResendConfirmation = async (admin: User) => {
    setActionLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch(`/api/admins/${admin.id}/resend-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({ 
          type: data.success ? "success" : "error", 
          text: data.message || `Confirmation email resent to ${admin.email}!` 
        });
        if (data.confirmationUrl) {
          // If SMTP had an issue, let them immediately preview and copy the link
          setProvisionReport({
            user: admin,
            confirmationUrl: data.confirmationUrl,
            confirmationDelivered: data.success,
            smtpError: data.success ? null : data.message
          });
        }
      } else {
        setFeedbackMsg({ type: "error", text: data.error || "Failed to resend confirmation email." });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Network error resending confirmation email." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendWelcome = async (admin: User) => {
    setActionLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch(`/api/admins/${admin.id}/resend-welcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({ 
          type: data.success ? "success" : "error", 
          text: data.message || `Admin welcome email sent to ${admin.email}!` 
        });
      } else {
        setFeedbackMsg({ type: "error", text: data.error || "Failed to send welcome email." });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Network error sending welcome email." });
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
        setShowPromoteModal(false);
        fetchAdminsAndMembers();
        if (onRefreshData) onRefreshData();

        setProvisionReport({
          user: data.user || member,
          confirmationUrl: data.confirmationUrl,
          confirmationDelivered: data.confirmationDelivered,
          welcomeDelivered: data.welcomeDelivered,
          smtpError: data.smtpError
        });
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

  const nonAdminMembers = allMembers.filter(m => m.role !== UserRole.ADMIN && (m.role as any) !== "ADMIN");
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowLogsModal(true);
                fetchEmailLogs();
              }}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="View system SMTP outgoing delivery logs"
            >
              <Inbox className="w-3.5 h-3.5 text-brand-pink" />
              <span>Email Dispatch Logs</span>
            </button>

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

                    <div className="bg-white p-3 rounded-xl border border-slate-200/60 text-[11px] space-y-1.5 text-slate-600">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[10px]">Organization:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[140px]">{admin.company || "WomenPlay"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[10px]">Account Status:</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          admin.membershipStatus === MembershipStatus.ACTIVE
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}>
                          {admin.membershipStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[10px]">Email Status:</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          admin.emailVerified
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {admin.emailVerified ? "Confirmed" : "Pending Confirmation"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[10px]">2FA Status:</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          admin.twoFactorEnabled
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {admin.twoFactorEnabled ? "2FA Configured" : "Pending 1st Login"}
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
                  <div className="flex flex-wrap items-center justify-end gap-1.5 pt-2 border-t border-slate-200/60">
                    {!admin.emailVerified && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCopyActivationLink(admin)}
                          className="px-2.5 py-1.5 rounded-lg border border-brand-pink/30 text-brand-pink hover:bg-pink-50 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Copy direct activation / confirmation link for this administrator"
                        >
                          <Copy className="w-3 h-3 text-brand-pink" />
                          <span>Copy Link</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResendConfirmation(admin)}
                          disabled={actionLoading}
                          className="px-2.5 py-1.5 rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Resend email confirmation link to administrator"
                        >
                          <Mail className="w-3 h-3 text-purple-600" />
                          <span>Resend Confirmation</span>
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => handleResendWelcome(admin)}
                      disabled={actionLoading}
                      className="px-2.5 py-1.5 rounded-lg border border-pink-200 text-pink-700 hover:bg-pink-50 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Send or resend Administrator Welcome email"
                    >
                      <Sparkles className="w-3 h-3 text-pink-600" />
                      <span>Send Welcome</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEmailPreview(admin)}
                      className="px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Preview rendered Welcome and Confirmation emails for this administrator"
                    >
                      <Eye className="w-3 h-3 text-blue-600" />
                      <span>Preview</span>
                    </button>

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

            {/* Email Confirmation Notice */}
            <div className="bg-brand-pink/5 border border-brand-pink/20 rounded-xl p-3 text-slate-600 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-brand-pink">
                <Mail className="w-3.5 h-3.5" />
                <span>Automated Welcome & Confirmation Onboarding</span>
              </div>
              <p className="leading-relaxed text-slate-500">
                The system will automatically send both an <strong>Admin Welcome</strong> email and an <strong>Email Confirmation</strong> email (using the system email templates). Upon email confirmation, user password and 2FA will be configured by the administrator on first login or after confirming email.
              </p>
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

      {/* PROVISION REPORT & EMAIL DISPATCH STATUS MODAL */}
      {provisionReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">Administrator Provisioning & Email Report</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setProvisionReport(null)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin Profile Overview */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center space-x-3.5">
              <img
                src={provisionReport.user.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"}
                alt={provisionReport.user.fullName}
                className="w-12 h-12 rounded-full border-2 border-brand-pink object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-sm">{provisionReport.user.fullName}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-brand-pink/10 text-brand-pink font-extrabold text-[10px] uppercase">
                    Admin
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono">{provisionReport.user.email}</p>
                <p className="text-[11px] text-slate-400 font-medium">
                  {provisionReport.user.title || "Executive Administrator"} &bull; {provisionReport.user.company || "WomenPlay Network"}
                </p>
              </div>
            </div>

            {/* Email Dispatch Status Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Automated Transactional Emails
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Email Confirmation Notice */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-purple-600" />
                      <span>Email Confirmation</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      provisionReport.confirmationDelivered
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {provisionReport.confirmationDelivered ? "Delivered" : "Notice Logged"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Template: <em>Administrator Email Confirmation</em>. Contains the official activation link.
                  </p>
                </div>

                {/* 2. Admin Welcome Letter */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
                      <span>Welcome Letter</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      provisionReport.welcomeDelivered
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {provisionReport.welcomeDelivered ? "Delivered" : "Notice Logged"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Template: <em>Administrator Welcome & Executive Portal Access</em>.
                  </p>
                </div>
              </div>

              {/* SMTP Notice Callout if any */}
              {provisionReport.smtpError && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-900 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>SMTP Transmission Notice:</span>
                  </div>
                  <p className="font-mono text-[11px] bg-white/70 p-2 rounded border border-amber-200/60 break-all text-amber-800">
                    {provisionReport.smtpError}
                  </p>
                  <p className="text-[11px] text-amber-700">
                    Note: If testing with non-existent or internal mailboxes on cPanel, mail servers reject unrouted addresses. You can provide the <strong>Activation Link</strong> directly to the administrator below!
                  </p>
                </div>
              )}
            </div>

            {/* Direct Activation Link Box */}
            {provisionReport.confirmationUrl && (
              <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-purple-700" />
                    <span>One-Click Administrator Activation Link</span>
                  </span>
                  {copiedLink && (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 animate-fadeIn">
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied to Clipboard!</span>
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  The administrator can use this secure link directly to verify their email, set their password, and complete mandatory Two-Factor Authentication (2FA).
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={provisionReport.confirmationUrl}
                    className="w-full bg-white border border-purple-200 px-3 py-2 rounded-lg text-xs font-mono text-purple-950 focus:outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (provisionReport.confirmationUrl) {
                        await navigator.clipboard.writeText(provisionReport.confirmationUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 3000);
                      }
                    }}
                    className="px-3 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                    title="Copy activation link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>

                  <a
                    href={provisionReport.confirmationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg border border-purple-300 text-purple-800 hover:bg-purple-100 font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                    title="Open activation page in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </a>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const targetUser = provisionReport.user;
                  setProvisionReport(null);
                  handleOpenEmailPreview(targetUser);
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Preview Email Renderings</span>
              </button>

              <button
                type="button"
                onClick={() => setProvisionReport(null)}
                className="px-5 py-2 rounded-xl bg-brand-pink hover:bg-brand-pink-dark text-white font-bold text-xs transition cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL PREVIEW & TEST DISPATCH MODAL */}
      {previewAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scaleUp text-left max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-brand-pink" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Email Preview & Dispatch Tool</h3>
                  <p className="text-xs text-slate-500">
                    Recipient: <strong>{previewAdmin.fullName}</strong> ({previewAdmin.email})
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setPreviewAdmin(null);
                  setPreviewData(null);
                }} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Tabs */}
            <div className="flex border-b border-slate-200 shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setPreviewTab("confirmation")}
                className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  previewTab === "confirmation"
                    ? "border-purple-600 text-purple-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Confirmation Notice</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("welcome")}
                className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  previewTab === "welcome"
                    ? "border-brand-pink text-brand-pink"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Admin Welcome Letter</span>
              </button>
            </div>

            {/* Email Preview Body */}
            <div className="flex-1 overflow-y-auto space-y-3 min-h-[220px]">
              {previewLoading ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-pink" />
                  <span className="text-xs font-medium">Rendering transactional email template...</span>
                </div>
              ) : previewData ? (
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
                    <p className="text-slate-500">
                      <strong>Subject:</strong>{" "}
                      <span className="text-slate-900 font-semibold font-sans">
                        {previewTab === "confirmation" 
                          ? previewData.confirmationEmail?.subject 
                          : previewData.welcomeEmail?.subject}
                      </span>
                    </p>
                    <p className="text-slate-500">
                      <strong>Recipient:</strong> <span className="text-slate-800">{previewAdmin.email}</span>
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-inner max-h-[300px] overflow-y-auto">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: previewTab === "confirmation"
                          ? (previewData.confirmationEmail?.bodyHtml || "")
                          : (previewData.welcomeEmail?.bodyHtml || "")
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-xs">Failed to load email preview.</p>
                </div>
              )}
            </div>

            {/* Dispatch / Test Send Box */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2 shrink-0">
              <label className="block text-[11px] font-bold text-slate-700">
                Dispatch / Test Send to Email Address:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={customSendEmail}
                  onChange={(e) => setCustomSendEmail(e.target.value)}
                  placeholder="Enter recipient email..."
                  className="flex-1 bg-white border border-slate-200 p-2 rounded-lg text-xs font-medium focus:outline-none focus:border-brand-pink"
                />
                <button
                  type="button"
                  onClick={() => handleSendCustomEmail(previewTab)}
                  disabled={customSending || !customSendEmail}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {customSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send {previewTab === "confirmation" ? "Confirmation" : "Welcome"}</span>
                </button>
              </div>

              {customSendMsg && (
                <p className="text-[11px] font-bold text-brand-pink animate-fadeIn">
                  {customSendMsg}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setPreviewAdmin(null);
                  setPreviewData(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OUTGOING EMAIL AUDIT LOGS MODAL */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scaleUp text-left max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center space-x-2">
                <Inbox className="w-5 h-5 text-brand-pink" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Outgoing Transactional Email Logs</h3>
                  <p className="text-xs text-slate-500">
                    Live dispatch history for administrator notifications and transactional messages.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchEmailLogs}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                  title="Refresh logs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? "animate-spin text-brand-pink" : ""}`} />
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowLogsModal(false)} 
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 min-h-[260px]">
              {logsLoading ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-pink" />
                  <span className="text-xs font-medium">Fetching email dispatch ledger...</span>
                </div>
              ) : emailLogs.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold">No outgoing email logs recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {emailLogs.map((log: any) => (
                    <div 
                      key={log.id} 
                      className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1.5 text-xs hover:border-slate-300 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-slate-900 truncate">
                          {log.subject}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                          log.status === "sent_via_smtp"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}>
                          {log.status === "sent_via_smtp" ? "Sent via SMTP" : "SMTP Failed / Notice"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono gap-2">
                        <span>To: <strong className="text-slate-700">{log.to}</strong></span>
                        <span>{new Date(log.sentAt).toLocaleString()}</span>
                      </div>

                      {log.error && (
                        <div className="mt-1 p-2 rounded bg-rose-50 border border-rose-200 text-rose-800 font-mono text-[10px] break-all">
                          {log.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowLogsModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
