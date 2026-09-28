import React from "react";

interface WomensEscapesSectionProps {
  onExploreClick?: () => void;
  onReserveClick?: () => void;
  onJoinFoundingCircle?: () => void;
  showDestinations?: boolean;
}

export const WomensEscapesSection: React.FC<WomensEscapesSectionProps> = ({
  onExploreClick,
  onReserveClick,
  onJoinFoundingCircle,
  showDestinations = true,
}) => {
  const destinations = [
    {
      city: "Santorini",
      ctry: "GREECE",
      tagline: "Culture · Beauty · Connection",
      img: "/dest_santorini.jpg",
      fallback: "/assets/santorini.webp",
    },
    {
      city: "Zanzibar",
      ctry: "TANZANIA",
      tagline: "Sun · Sisterhood · Escape",
      img: "/dest_zanzibar.jpg",
      fallback: "/assets/sanziba.webp",
    },
    {
      city: "Bali",
      ctry: "INDONESIA",
      tagline: "Wellness · Adventure · Belonging",
      img: "/dest_bali.jpg",
      fallback: "/assets/bali.webp",
    },
    {
      city: "Dubai",
      ctry: "UAE",
      tagline: "Luxury · Wonder · Skyline",
      img: "/assets/dubai.webp",
      fallback: "/assets/images/dubai.webp",
    },
    {
      city: "Tulum",
      ctry: "MEXICO",
      tagline: "Boho · Wellness · Sanctuary",
      img: "/assets/tulum.webp",
      fallback: "/assets/images/tulum.webp",
    },
    {
      city: "Cape Town",
      ctry: "SOUTH AFRICA",
      tagline: "Coastlines · Vibrance · Majesty",
      img: "/assets/captown.webp",
      fallback: "/assets/images/captown.webp",
    },
  ];

  const handleDestinationClick = () => {
    if (onReserveClick) {
      onReserveClick();
    } else if (onExploreClick) {
      onExploreClick();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12" id="womens-escapes-container">
      {/* UNIFIED LUXURY ESCAPES COMPONENT - EXACT MATCH TO ATTACHED DESIGN */}
      <div className="rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-[0_20px_60px_rgba(20,15,10,0.12)] border border-[#e8ded3] bg-white transition-all duration-300">
        
        {/* TOP HERO BANNER */}
        <div className="relative w-full min-h-[440px] sm:min-h-[480px] md:min-h-[520px] lg:min-h-[560px] overflow-hidden bg-[#181a1e] flex flex-col justify-between">
          {/* Background Hero Image */}
          <img
            src="/assets/images/womens_escapes_hero.jpg"
            alt="Women's Escapes - Friends celebrating on boat along the Mediterranean coast"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== window.location.origin + "/womens_escapes_hero.jpg") {
                target.src = "/womens_escapes_hero.jpg";
              } else {
                target.src = "/assets/images/events_getaways_travel.jpg";
              }
            }}
            className="absolute inset-0 w-full h-full object-cover object-[center_35%] transform scale-[1.01]"
          />

          {/* Left Dark Scrim / Gradient for crisp typography contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent w-full md:w-[68%] lg:w-[58%] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25 pointer-events-none" />

          {/* Top Right Cursive Script Accent ("More Places More Stories More Us ♡") */}
          <div className="absolute top-6 sm:top-8 md:top-10 right-6 sm:right-10 md:right-14 text-right text-white select-none pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] z-10">
            <div className="font-['Caveat',cursive] text-2xl sm:text-3xl md:text-4xl lg:text-[42px] text-white/95 leading-[1.08] tracking-wide rotate-[-3.5deg] text-shadow">
              <div className="italic">More</div>
              <div className="italic">Places</div>
              <div className="italic">More Stories</div>
              <div className="italic flex items-center justify-end gap-1.5">
                <span>More Us</span>
                <span className="text-xl sm:text-2xl md:text-3xl font-sans not-italic font-light">♡</span>
              </div>
            </div>
          </div>

          {/* Hero Content Container */}
          <div className="relative z-10 p-7 sm:p-10 md:p-14 lg:p-16 max-w-2xl text-left my-auto">
            {/* Eyebrow */}
            <div className="inline-block text-[10px] sm:text-[11.5px] font-bold tracking-[0.26em] text-[#d4a373] uppercase font-sans mb-3 sm:mb-4">
              TRAVEL &amp; RETREATS
            </div>

            {/* Title with two-line layout and gold ochre period */}
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-normal text-white leading-[1.04] tracking-tight mb-3 sm:mb-4">
              Women's<br />
              <span className="text-[#d7a868] font-normal">Escapes.</span>
            </h2>

            {/* Tagline */}
            <p className="font-serif italic text-white/95 text-base sm:text-lg md:text-xl font-normal mb-4 sm:mb-5 tracking-wide">
              Explore. Discover. Connect.
            </p>

            {/* Body Copy */}
            <p className="text-white/90 text-xs sm:text-[13.5px] md:text-[15px] leading-relaxed max-w-[460px] font-light mb-7 sm:mb-9 drop-shadow-sm">
              From local getaways to international adventures, WomenPlay is creating future travel experiences designed to bring women together through exploration, culture, wellness, celebration and unforgettable memories.
            </p>

            {/* Call to action button */}
            <div>
              <button
                type="button"
                onClick={onExploreClick}
                id="btn-explore-future-trips"
                className="group inline-flex items-center gap-2.5 bg-[#d7a868] hover:bg-[#c99958] active:scale-[0.98] text-[#241a12] font-extrabold text-[11px] sm:text-xs tracking-[0.14em] uppercase px-7 sm:px-8 py-3.5 sm:py-4 rounded-full shadow-[0_8px_20px_rgba(215,168,104,0.3)] transition-all duration-200 cursor-pointer"
              >
                <span>EXPLORE FUTURE TRIPS</span>
                <span className="text-sm font-bold transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM 4-COLUMN CATEGORIES STRIP */}
        <div className="bg-[#faf8f5] border-t border-[#ede3d8]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#ebe1d5]">
            
            {/* 1. Weekend Getaways */}
            <div className="p-6 sm:p-7 md:p-8 text-center flex flex-col items-center justify-start hover:bg-[#f6f2ec]/60 transition-colors duration-200" id="cat-weekend-getaways">
              {/* Circular Badge */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-[#dca3ab] bg-[#fbf5f4] flex items-center justify-center mb-4 sm:mb-5 shadow-[0_2px_10px_rgba(220,163,171,0.18)]">
                {/* Palm Trees Outline SVG */}
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#b25668]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21v-8" />
                  <path d="M12 13c-2-3-5-4-8-3 0 3 2 6 5 6" />
                  <path d="M12 13c2-3 5-4 8-3 0 3-2 6-5 6" />
                  <path d="M12 9c-1.5-2.5-4-3-6-2.5 0 2.5 1.5 4.5 4 4.5" />
                  <path d="M12 9c1.5-2.5 4-3 6-2.5 0 2.5-1.5 4.5-4 4.5" />
                  <path d="M12 6c0-2-1.5-3-3-3s-2.5 1.5-2 3" />
                  <path d="M12 6c0-2 1.5-3 3-3s2.5 1.5 2 3" />
                </svg>
              </div>
              <h3 className="font-serif text-lg sm:text-[19px] font-bold text-[#1f2430] mb-2 tracking-tight">
                Weekend Getaways
              </h3>
              <p className="text-[#5e5854] text-xs sm:text-[13px] leading-relaxed max-w-[230px] mx-auto font-normal">
                Local and regional escapes for rest, laughter, exploration and connection.
              </p>
            </div>

            {/* 2. Girls' Trips */}
            <div className="p-6 sm:p-7 md:p-8 text-center flex flex-col items-center justify-start hover:bg-[#f6f2ec]/60 transition-colors duration-200" id="cat-girls-trips">
              {/* Circular Badge */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-[#dca3ab] bg-[#fbf5f4] flex items-center justify-center mb-4 sm:mb-5 shadow-[0_2px_10px_rgba(220,163,171,0.18)]">
                {/* 3 Women Figures Outline SVG */}
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#b25668]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {/* Center figure */}
                  <circle cx="12" cy="7" r="2.2" />
                  <path d="M9 20v-5a3 3 0 0 1 6 0v5" />
                  {/* Left figure */}
                  <circle cx="6.5" cy="8.5" r="1.8" />
                  <path d="M4 20v-4a2.5 2.5 0 0 1 5 0v4" />
                  {/* Right figure */}
                  <circle cx="17.5" cy="8.5" r="1.8" />
                  <path d="M15 20v-4a2.5 2.5 0 0 1 5 0v4" />
                </svg>
              </div>
              <h3 className="font-serif text-lg sm:text-[19px] font-bold text-[#1f2430] mb-2 tracking-tight">
                Girls' Trips
              </h3>
              <p className="text-[#5e5854] text-xs sm:text-[13px] leading-relaxed max-w-[230px] mx-auto font-normal">
                Group experiences designed to explore, unwind, bond and make memories.
              </p>
            </div>

            {/* 3. International Retreats */}
            <div className="p-6 sm:p-7 md:p-8 text-center flex flex-col items-center justify-start hover:bg-[#f6f2ec]/60 transition-colors duration-200" id="cat-international-retreats">
              {/* Circular Badge */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-[#dca3ab] bg-[#fbf5f4] flex items-center justify-center mb-4 sm:mb-5 shadow-[0_2px_10px_rgba(220,163,171,0.18)]">
                {/* Globe / World Outline SVG */}
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#b25668]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3.6 9h16.8" />
                  <path d="M3.6 15h16.8" />
                  <path d="M12 3a14 14 0 0 1 4 9 14 14 0 0 1-4 9 14 14 0 0 1-4-9 14 14 0 0 1 4-9z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg sm:text-[19px] font-bold text-[#1f2430] mb-2 tracking-tight">
                International Retreats
              </h3>
              <p className="text-[#5e5854] text-xs sm:text-[13px] leading-relaxed max-w-[230px] mx-auto font-normal">
                Future destination experiences centred on connection, discovery, play and shared experiences.
              </p>
            </div>

            {/* 4. Luxury Experiences */}
            <div className="p-6 sm:p-7 md:p-8 text-center flex flex-col items-center justify-start hover:bg-[#f6f2ec]/60 transition-colors duration-200" id="cat-luxury-experiences">
              {/* Circular Badge */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-[#dca3ab] bg-[#fbf5f4] flex items-center justify-center mb-4 sm:mb-5 shadow-[0_2px_10px_rgba(220,163,171,0.18)]">
                {/* Diamond / Gem Outline SVG */}
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#b25668]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h12l4 6-10 12L2 9z" />
                  <path d="M2 9h20" />
                  <path d="M10 3l-2 6 4 12 4-12-2-6" />
                </svg>
              </div>
              <h3 className="font-serif text-lg sm:text-[19px] font-bold text-[#1f2430] mb-2 tracking-tight">
                Luxury Experiences
              </h3>
              <p className="text-[#5e5854] text-xs sm:text-[13px] leading-relaxed max-w-[230px] mx-auto font-normal">
                Premium curated travel moments designed with comfort, elegance and memorable experiences in mind.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* FUTURE DESTINATIONS & COMMUNITY RESERVATION - EXACT MATCH TO ATTACHED SCREENSHOT */}
      {showDestinations && (
        <div className="pt-6 sm:pt-10 space-y-10 sm:space-y-12" id="future-destinations-section">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#ebdcd0]/70">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.24em] text-[#1e293b] uppercase font-sans inline-block mb-1.5">
                FEATURED DESTINATIONS
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-[42px] font-bold text-[#1e293b] tracking-tight leading-tight">
                Future Destinations Being Explored
              </h2>
            </div>
            <div className="flex items-center gap-3 md:text-right shrink-0">
              <div className="w-12 sm:w-16 h-[1.5px] bg-[#d7a868]" />
              <div className="text-[9.5px] sm:text-[10.5px] tracking-[0.2em] uppercase font-sans font-bold leading-tight">
                <span className="text-[#1e293b]">EXTRAORDINARY </span>
                <span className="text-slate-400 font-semibold">PLACES.</span>
                <br />
                <span className="text-[#1e293b]">EVEN BETTER COMPANY.</span>
              </div>
            </div>
          </div>

          {/* 6 Destination Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
            {destinations.map((dest, idx) => (
              <div
                key={idx}
                onClick={handleDestinationClick}
                className="group relative rounded-[24px] sm:rounded-[28px] overflow-hidden aspect-[3/3.8] sm:aspect-[3/4] shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition-all duration-300 border border-slate-200/80 bg-slate-900 cursor-pointer"
              >
                {/* Background Image */}
                <img
                  src={dest.img}
                  alt={`${dest.city}, ${dest.ctry}`}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (dest.fallback && target.src !== window.location.origin + dest.fallback) {
                      target.src = dest.fallback;
                    }
                  }}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Gradient Scrim for maximum text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />

                {/* Destination Details & Arrow at Bottom */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex items-end justify-between gap-3 text-left">
                  <div className="space-y-1">
                    <h3 className="text-white text-2xl sm:text-[28px] font-serif font-bold tracking-tight leading-tight drop-shadow-sm">
                      {dest.city}
                    </h3>
                    <div className="text-[#d7a868] text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase font-sans">
                      {dest.ctry}
                    </div>
                    <div className="text-white/95 text-xs sm:text-[13px] font-serif italic tracking-wide">
                      {dest.tagline}
                    </div>
                  </div>

                  {/* Circular Gold Outline with Arrow */}
                  <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#d7a868]/90 flex items-center justify-center text-[#d7a868] group-hover:bg-[#d7a868] group-hover:text-[#241a12] group-hover:scale-105 transition-all duration-200 shadow-sm">
                    <svg
                      className="w-4 h-4 sm:w-4.5 sm:h-4.5 transform transition-transform duration-200 group-hover:translate-x-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sub-Card Notice & "GET TRAVEL UPDATES →" Button */}
          <div className="text-center max-w-xl mx-auto space-y-4 pt-2">
            <p className="text-slate-700 text-xs sm:text-sm md:text-[14.5px] leading-relaxed font-normal">
              Travel experiences are currently in development. Founding Circle members receive first access to future announcements and opportunities.
            </p>
            <div>
              <button
                type="button"
                onClick={onReserveClick}
                id="btn-get-travel-updates"
                className="group inline-flex items-center justify-center gap-2.5 bg-[#ad5569] hover:bg-[#963c54] active:scale-[0.98] text-white font-extrabold text-[11px] sm:text-xs tracking-[0.14em] uppercase px-8 sm:px-9 py-3.5 sm:py-4 rounded-full shadow-[0_6px_20px_rgba(173,85,105,0.3)] transition-all duration-200 cursor-pointer"
              >
                <span>GET TRAVEL UPDATES</span>
                <span className="text-sm font-bold transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>

          {/* THE WOMENPLAY PROMISE BANNER - EXACT MATCH TO ATTACHED SCREENSHOT */}
          <div className="relative w-full rounded-[28px] sm:rounded-[36px] overflow-hidden min-h-[420px] sm:min-h-[460px] md:min-h-[500px] shadow-[0_20px_50px_rgba(0,0,0,0.14)] border border-[#ede3d8] flex items-center bg-[#181a1e]">
            {/* Background Image: Joyful beach party with hula hoop */}
            <img
              src="/promise_beach_party.jpg"
              alt="The WomenPlay Promise - Joyful women dancing on beach"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== window.location.origin + "/assets/images/promise_beach_party.jpg") {
                  target.src = "/assets/images/promise_beach_party.jpg";
                } else {
                  target.src = "/assets/images/events_travel_beach.jpg";
                }
              }}
              className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
            />

            {/* Left Vignette & Gradient Scrim for clear readable typography */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent w-full md:w-[68%] lg:w-[58%] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25 pointer-events-none" />

            {/* Banner Text Content */}
            <div className="relative z-10 p-7 sm:p-10 md:p-14 lg:p-16 max-w-xl text-left">
              {/* Eyebrow */}
              <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.24em] text-[#d4a373] uppercase font-sans mb-3 sm:mb-4">
                THE WOMENPLAY PROMISE
              </div>

              {/* Main Quote */}
              <blockquote className="font-serif italic text-2xl sm:text-3xl md:text-[38px] lg:text-[42px] font-normal text-white leading-[1.18] tracking-tight mb-4 sm:mb-5">
                “Every woman deserves to feel like a kid again — with the confidence of a grown woman.”
              </blockquote>

              {/* Horizontal Gold Line */}
              <div className="w-12 sm:w-16 h-[2px] bg-[#d7a868] mb-4 sm:mb-5" />

              {/* Cursive script */}
              <div className="font-['Caveat',cursive] text-2xl sm:text-3xl md:text-4xl text-white/95 tracking-wide rotate-[-1deg] select-none">
                Play Connect Explore Belong <span className="font-sans not-italic text-xl sm:text-2xl ml-1">♡</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
