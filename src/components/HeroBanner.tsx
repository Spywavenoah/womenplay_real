import React from "react";
import { ArrowLeft } from "lucide-react";

interface HeroBannerProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  backgroundImage?: string;
  onNavigateHome?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export default function HeroBanner({
  eyebrow,
  title,
  description,
  backgroundImage = "/ship.jpg",
  onNavigateHome,
  children,
  className = "",
}: HeroBannerProps) {
  return (
    <section
      className={`relative overflow-hidden bg-slate-950 text-white py-20 md:py-24 px-6 md:px-12 border-b border-brand-gold/30 ${className}`}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
      <div className="relative z-10 max-w-7xl mx-auto text-center space-y-4">
        {eyebrow && (
          <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-light inline-flex items-center gap-2 justify-center">
            {eyebrow}
          </span>
        )}
        <h1 className="text-3xl md:text-5xl font-display font-extrabold">{title}</h1>
        {description && (
          <p className="text-sm text-slate-300 max-w-3xl mx-auto leading-relaxed">{description}</p>
        )}
        {children}
        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center space-x-2 text-xs font-semibold text-brand-gold-light hover:text-white transition mt-2 mx-auto cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        )}
      </div>
    </section>
  );
}