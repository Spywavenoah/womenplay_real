import React from "react";
import { Camera, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { GalleryItem } from "../types";
import HeroBanner from "./HeroBanner";

interface GalleryViewProps {
  onNavigateHome: () => void;
}

export default function GalleryView({ onNavigateHome }: GalleryViewProps) {
  const [items, setItems] = React.useState<GalleryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [category, setCategory] = React.useState("ALL");
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetch("/api/gallery")
      .then(res => res.json())
      .then((data: GalleryItem[]) => setItems(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error loading gallery:", err))
      .finally(() => setLoading(false));
  }, []);

  const categories = React.useMemo(() => {
    const set = new Set(items.map(i => i.category).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [items]);

  const filtered = React.useMemo(() => {
    if (category === "ALL") return items;
    return items.filter(i => i.category === category);
  }, [items, category]);

  const featured = React.useMemo(() => items.filter(i => i.featured), [items]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const moveLightbox = (dir: number) => {
    if (lightboxIndex === null || filtered.length === 0) return;
    setLightboxIndex((lightboxIndex + dir + filtered.length) % filtered.length);
  };

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") moveLightbox(-1);
      if (e.key === "ArrowRight") moveLightbox(1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, filtered.length]);

  const lightboxItem = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  return (
    <div className="bg-slate-50 text-left">
      {/* Hero Banner */}
      <HeroBanner
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Moments & Memories
          </span>
        }
        title={
          <>
            The <em className="gold-text-gradient not-italic">WomenPlay Gallery</em>
          </>
        }
        description="Beautiful moments captured across WomenPlay experiences — celebration, wellness, connection, and play."
        onNavigateHome={onNavigateHome}
      />

      {/* Category Filters */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-12">
        <div className="flex flex-wrap gap-2 justify-center border-b border-slate-100 pb-6 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`py-2 px-5 rounded-full text-xs font-semibold tracking-wider uppercase transition ${
                category === cat
                  ? "bg-brand-pink text-white shadow-md shadow-brand-pink/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-brand-pink-light/30"
              }`}
            >
              {cat === "ALL" ? "All Moments" : cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-pink" />
            <span className="text-xs font-semibold">Curating gallery moments...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => openLightbox(idx)}
                className="group relative rounded-2xl overflow-hidden luxury-shadow border border-slate-100 bg-white text-left cursor-pointer hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-64 overflow-hidden bg-slate-100">
                  <img src={item.image} alt={item.title} onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200"; }} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-brand-pink">{item.category}</span>
                    {item.featured && <span className="text-[9px] font-bold text-brand-gold-dark bg-brand-gold-light/60 px-2 py-0.5 rounded-full">★ Featured</span>}
                  </div>
                  <h3 className="font-bold text-slate-800 mt-1.5 leading-snug">{item.title}</h3>
                  {item.caption && <p className="text-slate-500 text-xs mt-1 leading-relaxed line-clamp-2">{item.caption}</p>}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-3xl border border-slate-100 luxury-shadow space-y-2">
            <Camera className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-500">No gallery moments in this category yet.</p>
            <p className="text-xs text-slate-400">New photos are added as WomenPlay creates more beautiful memories.</p>
          </div>
        )}
      </section>

      {/* Lightbox */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4" onClick={closeLightbox} id="gallery-lightbox">
          <button className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition" onClick={closeLightbox}>
            <X className="w-5 h-5" />
          </button>
          <button
            className="absolute left-4 md:left-8 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            onClick={(e) => { e.stopPropagation(); moveLightbox(-1); }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            className="absolute right-4 md:right-8 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            onClick={(e) => { e.stopPropagation(); moveLightbox(1); }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxItem.image} alt={lightboxItem.title} className="w-full max-h-[75vh] object-contain rounded-2xl" referrerPolicy="no-referrer" />
            <div className="mt-5 text-center text-white space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-gold-light">{lightboxItem.category}</span>
              <h3 className="text-xl font-bold">{lightboxItem.title}</h3>
              {lightboxItem.caption && <p className="text-slate-300 text-sm">{lightboxItem.caption}</p>}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="py-16 px-6 md:px-12 border-t border-slate-100 bg-white">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900">Want to be part of the next moment?</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Join WomenPlay and experience these gatherings first-hand — from karaoke socials and games evenings to luxury summits and boardroom masterclasses.
          </p>
          <a
              href="/events"
              className="inline-flex items-center bg-brand-pink hover:bg-brand-pink-dark text-white font-bold px-8 py-3.5 rounded-full shadow-md shadow-brand-pink/25 transition hover:-translate-y-0.5 text-sm"
            >Explore Events & Membership</a>
            
        </div>
      </section>
    </div>
  );
}
