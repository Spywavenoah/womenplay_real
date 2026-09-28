import React from "react";

interface LogoProps {
  className?: string;
  height?: string;
  variant?: "full" | "icon" | "dark" | "light";
  onClick?: () => void;
}

export default function Logo({ className = "", height = "h-14 md:h-16", variant = "full", onClick }: LogoProps) {
  const [loadFailed, setLoadFailed] = React.useState(false);
  const [triedAlt, setTriedAlt] = React.useState(false);

  if (variant === "icon") {
    if (loadFailed) {
      return (
        <div
          onClick={onClick}
          className={`inline-flex items-center justify-center cursor-pointer select-none font-serif font-bold text-brand-gold text-2xl tracking-tighter ${className}`}
          id="app-logo-icon-fallback"
        >
          WP
        </div>
      );
    }
    return (
      <div 
        onClick={onClick} 
        className={`inline-flex items-center justify-center cursor-pointer select-none group ${className}`}
        id="app-logo-icon"
      >
        <img 
          src={triedAlt ? "/logo.png" : "/assets/womenplay_icon.png"} 
          alt="WomenPlay Monogram Icon" 
          onError={() => {
            if (!triedAlt) setTriedAlt(true);
            else setLoadFailed(true);
          }}
          className={`${height} w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-sm`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center space-x-1.5 cursor-pointer select-none ${className}`}
        id="app-logo-full-fallback"
      >
        <span className="font-serif font-bold text-2xl text-slate-900 tracking-tight">
          Women<span className="text-brand-pink">Play</span>
        </span>
      </div>
    );
  }

  const logoSrc = triedAlt ? "/logo.png" : "/assets/logo.png";

  return (
    <div 
      onClick={onClick} 
      className={`inline-flex items-center space-x-2.5 cursor-pointer select-none group ${className}`}
      id="app-logo-full"
    >
      <img 
        src={logoSrc} 
        alt="WomenPlay Logo" 
        onError={() => {
          if (!triedAlt) setTriedAlt(true);
          else setLoadFailed(true);
        }}
        className={`${height} w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-sm`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
