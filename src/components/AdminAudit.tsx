import { Clipboard } from "lucide-react";
import { AuditLog } from "../types";

export default function AdminAudit({ auditLogs }: { auditLogs: AuditLog[] }) {
  return (
    <div className="space-y-6" id="panel-admin-audit">
      <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center space-x-2">
        <Clipboard className="w-4.5 h-4.5 text-brand-pink" />
        <span>Official Secretariat Audit Trail Logs</span>
      </h2>

      <div className="bg-white rounded-2xl border border-slate-100 luxury-shadow overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6">Timestamp</th>
              <th className="py-4 px-6">Administrator Name</th>
              <th className="py-4 px-6">Action Executed</th>
              <th className="py-4 px-6">Detailed Log Context</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50" id={`audit-log-${log.id}`}>
                <td className="py-4 px-6 font-mono text-slate-500 text-[10px]">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="py-4 px-6 font-semibold text-slate-700">
                  {log.adminName}
                </td>
                <td className="py-4 px-6">
                  <span className="bg-brand-pink-light/60 border border-brand-pink/10 text-brand-pink py-0.5 px-2.5 rounded-full font-bold text-[9px] uppercase tracking-wider">
                    {log.action}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-600 italic">
                  "{log.details}"
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
