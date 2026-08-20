import React from "react";
import { Download, FileText } from "lucide-react";
import { MembershipStatus } from "../../types";
import type { User } from "../../types";

type MemberFilter = "ALL" | "ACTIVE" | "PENDING" | "SUSPENDED";

interface AdminMembersProps {
  members: User[];
  memberFilterStatus: MemberFilter;
  setMemberFilterStatus: (s: MemberFilter) => void;
  onUpdateStatus: (memberId: string, status: MembershipStatus) => void;
  onReset2FA: (memberId: string, memberName: string) => void;
  onExportCSV: (filename?: string, customHeaders?: string[], customRows?: any[][]) => void;
  onExportPDF: () => void;
}

export default function AdminMembers({
  members,
  memberFilterStatus,
  setMemberFilterStatus,
  onUpdateStatus,
  onReset2FA,
  onExportCSV,
  onExportPDF,
}: AdminMembersProps) {
  return (
    <div className="space-y-6" id="panel-admin-members">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Registered Members & Approval Controls</h2>
          <p className="text-xs text-slate-400 mt-1">Manage network access requests, active tiers, and download high-society directory reports.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onExportCSV()}
            className="py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
            title="Download spreadsheet report"
            id="btn-export-csv"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV Report</span>
          </button>

          <button
            type="button"
            onClick={onExportPDF}
            className="py-2 px-4 bg-brand-pink hover:bg-brand-pink/90 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
            title="Generate high-fidelity PDF report"
            id="btn-export-pdf"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "ALL", name: "All Members", count: members.length },
          { id: "ACTIVE", name: "Active Members", count: members.filter(m => m.membershipStatus === MembershipStatus.ACTIVE).length },
          { id: "PENDING", name: "Pending Approval", count: members.filter(m => m.membershipStatus === MembershipStatus.PENDING).length },
          { id: "SUSPENDED", name: "Deactivated / Suspended", count: members.filter(m => m.membershipStatus === MembershipStatus.SUSPENDED).length }
        ].map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => setMemberFilterStatus(st.id as MemberFilter)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 ${
              memberFilterStatus === st.id
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>{st.name}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${
              memberFilterStatus === st.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}>{st.count}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 luxury-shadow overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6">Member Details</th>
              <th className="py-4 px-6">Executive Title / Corporate</th>
              <th className="py-4 px-6">Membership Tier</th>
              <th className="py-4 px-6">Account Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members
              .filter((m) => {
                if (memberFilterStatus === "ALL") return true;
                return m.membershipStatus === memberFilterStatus;
              })
              .map((m) => (
              <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/50" id={`member-row-${m.id}`}>
                <td className="py-4 px-6 flex items-center space-x-3">
                  <img src={m.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} alt={m.fullName} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"; }} className="w-9 h-9 rounded-full object-cover border border-brand-gold" />
                  <div>
                    <p className="font-bold text-slate-800">{m.fullName}</p>
                    <span className="text-[10px] text-slate-400">{m.email}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p className="font-medium text-slate-700">{m.title || "Elite Professional"}</p>
                  <span className="text-slate-400 text-[10px]">{m.company || "WomenPlay Corporate"}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="font-bold text-brand-pink text-[11px]">{m.membershipTier}</span>
                </td>
                <td className="py-4 px-6">
                  <span className={`py-1 px-3 rounded-full text-[9px] font-bold uppercase ${
                    m.membershipStatus === MembershipStatus.ACTIVE
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : m.membershipStatus === MembershipStatus.PENDING
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}>{m.membershipStatus}</span>
                </td>
                <td className="py-4 px-6 text-right space-x-2">
                  <button
                    onClick={() => onReset2FA(m.id, m.fullName)}
                    id={`btn-reset-2fa-${m.id}`}
                    className="py-1.5 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold transition cursor-pointer"
                    title="Reset 2FA authentication settings"
                  >
                    Reset 2FA
                  </button>
                  {m.membershipStatus !== MembershipStatus.ACTIVE && (
                    <button
                      onClick={() => onUpdateStatus(m.id, MembershipStatus.ACTIVE)}
                      id={`btn-approve-member-${m.id}`}
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition cursor-pointer"
                    >
                      Approve
                    </button>
                  )}
                  {m.membershipStatus !== MembershipStatus.SUSPENDED && (
                    <button
                      onClick={() => onUpdateStatus(m.id, MembershipStatus.SUSPENDED)}
                      id={`btn-suspend-member-${m.id}`}
                      className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold transition cursor-pointer"
                    >
                      Suspend
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}