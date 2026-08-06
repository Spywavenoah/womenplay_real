import React from "react";

// ---------------------------------------------------------------------------
// Small, stateless UI atoms reused across AdminDashboard. These take only
// props (no state) so they can be shared safely between dashboard tabs.
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  sublabel?: React.ReactNode;
  icon?: React.ReactNode;
  iconClassName?: string;
  valueClassName?: string;
  sublabelClassName?: string;
}

export function StatCard({
  label,
  value,
  sublabel,
  icon,
  iconClassName = "text-brand-pink/60",
  valueClassName = "text-slate-800",
  sublabelClassName = "text-[9px] text-slate-400",
}: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow flex items-center justify-between">
      <div className="space-y-1">
        <span className="text-[10px] uppercase font-bold text-slate-400">{label}</span>
        <p className={`text-2xl font-bold ${valueClassName}`}>{value}</p>
        {sublabel && <span className={`text-[9px] font-bold ${sublabelClassName}`}>{sublabel}</span>}
      </div>
      {icon && <span className={iconClassName}>{icon}</span>}
    </div>
  );
}

interface SectionTitleProps {
  children: React.ReactNode;
  accent?: boolean;
}

export function SectionTitle({ children, accent = false }: SectionTitleProps) {
  return (
    <h3 className={`text-xs font-extrabold uppercase ${accent ? "text-brand-pink" : "text-slate-800"} flex items-center gap-1`}>
      {children}
    </h3>
  );
}

interface BadgePillProps {
  children: React.ReactNode;
  className?: string;
}

// Small uppercase status pill (green/amber/red/slate variants via className).
export function BadgePill({ children, className = "bg-slate-100 text-slate-600" }: BadgePillProps) {
  return (
    <span className={`py-0.5 px-2 rounded-full text-[8px] font-bold uppercase ${className}`}>
      {children}
    </span>
  );
}