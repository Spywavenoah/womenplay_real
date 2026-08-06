import React from "react";

interface LogoProps {
  className?: string;
  height?: string;
  variant?: "full" | "icon" | "dark";
  onClick?: () => void;
}

export default function Logo({ className = "", height = "h-11", variant = "full", onClick }: LogoProps) {
  if (variant === "icon") {
    return (
      <div 
        onClick={onClick} 
        className={`inline-flex items-center justify-center cursor-pointer select-none ${className}`}
        id="app-logo-icon"
      >
        <svg viewBox="0 0 120 120" className={`${height} w-auto drop-shadow-xs`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="iconGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="30%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
            <linearGradient id="iconPink" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF5C8A" />
              <stop offset="50%" stopColor="#E11D48" />
              <stop offset="100%" stopColor="#9F1239" />
            </linearGradient>
          </defs>
          <g transform="translate(10, 10) scale(0.42)">
            {/* W Ribbon */}
            <path d="M 20 160 C 15 110, 35 40, 70 30 C 55 60, 50 110, 75 160 L 52 160 C 40 120, 34 80, 20 160 Z" fill="url(#iconPink)" />
            <path d="M 40 30 L 68 30 C 80 70, 100 120, 120 160 C 140 120, 158 70, 170 30 L 195 30 C 175 90, 145 170, 125 195 C 110 195, 95 170, 75 120 L 50 195 L 25 195 Z" fill="url(#iconPink)" />

            {/* P Loop */}
            <path d="M 160 35 C 215 0, 295 25, 285 90 C 275 140, 205 155, 155 150 C 195 145, 250 135, 255 90 C 260 45, 205 25, 160 35 Z" fill="url(#iconGold)" />

            {/* Woman's Silhouette Face & Hair Profile */}
            <path d="M 175 40 C 190 55, 205 75, 205 100 C 205 120, 195 140, 170 165 C 185 140, 210 125, 218 110 C 225 100, 232 90, 228 82 C 225 78, 215 78, 218 72 C 220 68, 225 65, 222 58 C 218 52, 205 50, 195 45 Z" fill="url(#iconPink)" />
            <path d="M 205 50 C 218 40, 240 55, 230 70 C 238 72, 248 85, 240 98 C 235 105, 225 115, 215 125 C 228 110, 238 98, 235 85 C 238 80, 230 75, 232 70 C 228 62, 215 55, 205 50 Z" fill="url(#iconGold)" />
          </g>
        </svg>
      </div>
    );
  }

  const logoSrc = variant === "dark" ? "/assets/logo.png" : "/assets/logo.png";

  return (
    <div 
      onClick={onClick} 
      className={`inline-flex items-center space-x-2.5 cursor-pointer select-none group ${className}`}
      id="app-logo-full"
    >
      <img 
        src={logoSrc} 
        alt="WomenPlay Executive Network Logo" 
        className={`${height} w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-sm`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
