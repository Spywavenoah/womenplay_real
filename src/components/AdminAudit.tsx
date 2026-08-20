import React, { useState, useEffect } from "react";
import { Clipboard, Terminal, RefreshCw, AlertTriangle, Info, AlertCircle, Search, Shield, Filter, Copy, Check } from "lucide-react";
import { motion } from "motion/react";
import { AuditLog } from "../types";

interface SystemLogEntry {
  level: "info" | "warn" | "error";
  message: string;
  timestamp: string;
  requestId?: string;
  context?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
  };
}

export default function AdminAudit({ auditLogs }: { auditLogs: AuditLog[] }) {
  const [activeTab, setActiveTab] = useState<"audit" | "system">("audit");
  const [systemLogs, setSystemLogs] = useState<SystemLogEntry[]>([]);
  const [loadingSystemLogs, setLoadingSystemLogs] = useState(false);
  const [levelFilter, setLevelFilter] = useState<"all" | "info" | "warn" | "error">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchSystemLogs = async () => {
    setLoadingSystemLogs(true);
    try {
      const res = await fetch("/api/admin/system-logs?limit=200");
      if (res.ok) {
        const data = await res.json();
        setSystemLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch structured system logs:", err);
    } finally {
      setLoadingSystemLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === "system") {
      fetchSystemLogs();
    }
  }, [activeTab]);

  const filteredSystemLogs = systemLogs.filter((log) => {
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.requestId && log.requestId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      JSON.stringify(log.context || {}).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const handleCopyRequestId = (reqId: string) => {
    navigator.clipboard.writeText(reqId);
    setCopiedId(reqId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 text-left" id="panel-admin-audit">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 luxury-shadow">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <Clipboard className="w-4.5 h-4.5 text-brand-pink" />
            <span>Governance & Structured System Telemetry</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Audit administrative modifications, inspect request traces, and track checkout and webhook events.</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            aria-label="View Audit Trail Logs"
            className={`min-h-[44px] px-4 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === "audit"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("system")}
            aria-label="View Structured System JSON Logs"
            className={`min-h-[44px] px-4 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === "system"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-brand-pink" />
            <span>Structured Logs ({systemLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Audit Trail */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-2xl border border-slate-100 luxury-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Administrator Name</th>
                  <th className="py-4 px-6">Action Executed</th>
                  <th className="py-4 px-6">Detailed Log Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition" id={`audit-log-${log.id}`}>
                      <td className="py-4 px-6 font-mono text-slate-500 text-[10px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-700">
                        {log.adminName}
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-brand-pink-light/60 border border-brand-pink/10 text-brand-pink py-1 px-2.5 rounded-full font-bold text-[9px] uppercase tracking-wider">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 italic">
                        "{log.details}"
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                      No administrative audit records logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Structured JSON Logs with Request IDs */}
      {activeTab === "system" && (
        <div className="space-y-4">
          {/* Controls toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-150 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search logs by message, Request ID, or JSON key..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-pink"
              />
            </div>

            {/* Level filters & refresh */}
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                {(["all", "info", "warn", "error"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevelFilter(lvl)}
                    className={`min-h-[44px] px-3 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                      levelFilter === lvl
                        ? "bg-white text-slate-900 shadow-xs font-black"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={fetchSystemLogs}
                disabled={loadingSystemLogs}
                aria-label="Refresh structured system logs"
                className="min-h-[44px] px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSystemLogs ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </motion.button>
            </div>
          </div>

          {/* Structured Logs Container */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-[10px] text-slate-400 uppercase tracking-widest font-sans font-bold">
              <span>Structured JSON Event Stream</span>
              <span>Showing {filteredSystemLogs.length} events</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredSystemLogs.length > 0 ? (
                filteredSystemLogs.map((entry, idx) => {
                  const isError = entry.level === "error";
                  const isWarn = entry.level === "warn";

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition ${
                        isError
                          ? "bg-rose-950/20 border-rose-900/40 text-rose-300"
                          : isWarn
                          ? "bg-amber-950/20 border-amber-900/40 text-amber-300"
                          : "bg-slate-900/60 border-slate-800/80 text-slate-300"
                      }`}
                    >
                      {/* Log Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] mb-1.5 pb-1.5 border-b border-slate-800/60">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${
                              isError
                                ? "bg-rose-500 text-white"
                                : isWarn
                                ? "bg-amber-500 text-slate-950"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {entry.level}
                          </span>
                          <span className="text-slate-400">
                            {new Date(entry.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              fractionalSecondDigits: 3
                            })}
                          </span>
                        </div>

                        {entry.requestId && (
                          <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[9px] text-slate-400">
                            <span>req: {entry.requestId.slice(0, 12)}...</span>
                            <button
                              type="button"
                              onClick={() => handleCopyRequestId(entry.requestId!)}
                              title="Copy Request ID"
                              className="text-slate-500 hover:text-brand-pink transition"
                            >
                              {copiedId === entry.requestId ? (
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Log Message */}
                      <p className="font-semibold text-xs text-white leading-relaxed">{entry.message}</p>

                      {/* Structured Context Metadata */}
                      {entry.context && Object.keys(entry.context).length > 0 && (
                        <div className="mt-2 bg-slate-950/80 p-2 rounded-lg border border-slate-800 text-[10px] text-slate-400 overflow-x-auto">
                          <pre>{JSON.stringify(entry.context, null, 2)}</pre>
                        </div>
                      )}

                      {/* Error Stack */}
                      {entry.error && (
                        <div className="mt-2 bg-rose-950/40 p-2 rounded-lg border border-rose-900/50 text-[10px] text-rose-300 overflow-x-auto">
                          <p className="font-bold">{entry.error.message}</p>
                          {entry.error.stack && (
                            <pre className="mt-1 text-[9px] text-rose-400/80">{entry.error.stack}</pre>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-500 font-sans text-xs">
                  {loadingSystemLogs ? "Loading telemetry records..." : "No structured logs match the current filters."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
