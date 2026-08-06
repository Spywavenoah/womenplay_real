import React from "react";
import { Download, FileText, Users, Calendar } from "lucide-react";
import { User, MembershipStatus, EventItem, Registration } from "../types";

interface AdminMembersProps {
  members: User[];
  onRefreshData: () => Promise<void>;
  onLoadAdminData: () => Promise<void>;
  onOpenReportModal: () => void;
  events: EventItem[];
  allRegistrations: Registration[];
  currentUser: User;
}

const AdminMembers: React.FC<AdminMembersProps> = ({
  members,
  onRefreshData,
  onLoadAdminData,
  onOpenReportModal,
  events,
  allRegistrations,
  currentUser
}) => {
  // Export Member List to CSV
  const exportToCSV = (filename?: string, customHeaders?: string[], customRows?: any[][]) => {
    let headers = [
      "Member ID", 
      "Full Name", 
      "Email Address", 
      "Executive Title", 
      "Corporate Entity", 
      "Membership Tier", 
      "Account Status", 
      "Join Date", 
      "Total Registrations", 
      "Attended EventsCount", 
      "Scheduled Registrations History"
    ];
    
    let rows: any[][];
    if (customHeaders && customRows) {
      headers = customHeaders;
      rows = customRows;
    } else {
      rows = members.map(m => {
        const memberRegs = allRegistrations.filter(r => r.userId === m.id);
        const attendedCount = memberRegs.filter(r => r.attended).length;
        const registeredEventsStr = memberRegs.map(r => {
          const event = events.find(e => e.id === r.eventId);
          const eventTitle = event ? event.title : "Unknown Event";
          const dateStr = event ? event.date : "";
          const status = r.attended ? "Attended" : "Registered";
          return `${eventTitle} (${dateStr} - ${status})`;
        }).join("; ");

        return [
          m.id,
          `"${m.fullName.replace(/"/g, '""')}"`,
          `"${m.email.replace(/"/g, '""')}"`,
          `"${(m.title || "Elite Professional").replace(/"/g, '""')}"`,
          `"${(m.company || "WomenPlay Corporate").replace(/"/g, '""')}"`,
          `"${m.membershipTier}"`,
          `"${m.membershipStatus}"`,
          `"${m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "N/A"}"`,
          memberRegs.length,
          attendedCount,
          `"${registeredEventsStr.replace(/"/g, '""')}"`
        ];
      });
    }

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename || `WomenPlay_Platform_Members_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Approve/Suspend member status
  const handleUpdateMemberStatus = async (memberId: string, status: MembershipStatus) => {
    try {
      const res = await fetch(`/api/members/${memberId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminId: currentUser.id,
          adminName: currentUser.fullName
        })
      });
      if (res.ok) {
        onRefreshData();
        onLoadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

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
            onClick={() => exportToCSV()}
            className="py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
            title="Download spreadsheet report"
            id="btn-export-csv"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV Report</span>
          </button>
          
          <button
            type="button"
            onClick={onOpenReportModal}
            className="py-2 px-4 bg-brand-pink hover:bg-brand-pink/90 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
            title="Generate high-fidelity PDF report"
            id="btn-export-pdf"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export PDF Report</span>
          </button>
        </div>
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
            {members.map((m) => (
              <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/50" id={`member-row-${m.id}`}>
                <td className="py-4 px-6 flex items-center space-x-3">
                  <img src={m.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} alt={m.fullName} className="w-9 h-9 rounded-full object-cover border border-brand-gold" />
                  <div>
                    <p className="font-bold text-slate-800">{m.fullName}</p>
                    <span className="text-[10px] text-slate-400">{m.email}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p className="font-medium text-slate-700">{m.title || "Elite Professional"}</p>
                  <span className="text-[10px] text-slate-400">{m.company || "WomenPlay Corporate"}</span>
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
                  {m.membershipStatus !== MembershipStatus.ACTIVE && (
                    <button
                      onClick={() => handleUpdateMemberStatus(m.id, MembershipStatus.ACTIVE)}
                      id={`btn-approve-member-${m.id}`}
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition"
                    >
                      Approve
                    </button>
                  )}
                  {m.membershipStatus !== MembershipStatus.SUSPENDED && (
                    <button
                      onClick={() => handleUpdateMemberStatus(m.id, MembershipStatus.SUSPENDED)}
                      id={`btn-suspend-member-${m.id}`}
                      className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold transition"
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
};

export default AdminMembers;
