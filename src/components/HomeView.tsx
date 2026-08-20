import React from "react";
import { 
  ArrowRight, Star, Check,
  Sparkles, Quote, ChevronRight, ChevronLeft,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { BlogArticle, SuccessStory, Founder } from "../types";
// import mentorImg from "../assets/images/executive_tea_party_1785235353940.jpg";
import FoundingCircle from "./FoundingCircle";

interface HomeViewProps {
  blogs: BlogArticle[];
  successStories: SuccessStory[];
  onOpenAuth: () => void;
  currentUser: any;
  onNavigate?: (view: "privacy" | "terms" | "sponsorship" | "founders" | "events" | "contact" | "profile") => void;
  founders?: Founder[];
}

export default function HomeView({
  blogs,
  successStories,
  onOpenAuth,
  currentUser,
  onNavigate,
  founders
}: HomeViewProps) {
  // Carousel States
  const [slides, setSlides] = React.useState<any[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);

  // States
  const [selectedBlog, setSelectedBlog] = React.useState<BlogArticle | null>(null);

  React.useEffect(() => {
    fetch("/api/carousel")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setSlides(data);
        }
      })
      .catch((err) => console.error("Error loading carousel slides:", err));
  }, []);

  // Slide rotation interval
  React.useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000); // Rotate every 6 seconds
    return () => clearInterval(interval);
  }, [slides]);

  // Approved success stories & slider state
  const approvedStories = successStories.filter(s => s.approved);
  const [activeStoryIndex, setActiveStoryIndex] = React.useState(0);
  const [isStoryPaused, setIsStoryPaused] = React.useState(false);

  React.useEffect(() => {
    if (approvedStories.length <= 1 || isStoryPaused) return;
    const storyTimer = setInterval(() => {
      setActiveStoryIndex(prev => (prev + 1) % approvedStories.length);
    }, 5500);
    return () => clearInterval(storyTimer);
  }, [approvedStories.length, isStoryPaused]);

  return (
    <div className="w-full bg-slate-50 min-h-screen" id="home-view-container">
      {/* 1. Hero / Carousel Banner Section */}
      <section className="relative w-full h-[650px] overflow-hidden bg-slate-950 flex items-center justify-center text-white border-b border-brand-gold/30" id="home-carousel-container">
        {slides.length > 0 ? (
          <AnimatePresence mode="wait">
            {slides.map((slide, idx) => {
              if (idx !== currentSlideIndex) return null;
              return (
                <motion.div
                  key={slide.id || idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 w-full h-full flex items-center justify-center bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  {/* Luxury Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-slate-950/90" />
                  
                  {/* Content Container */}
                  <div className="relative z-10 max-w-4xl px-6 md:px-16 text-center space-y-6 flex flex-col items-center">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="inline-flex items-center space-x-2 bg-brand-gold-dark/20 border border-brand-gold/40 py-1.5 px-4 rounded-full shadow-xs"
                    >
                      <Sparkles className="w-4 h-4 text-brand-gold animate-pulse" />
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-gold">WomenPlay Community</span>
                    </motion.div>

                    <motion.h1
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="text-4xl md:text-6xl font-display font-light leading-[1.1] tracking-tight text-white max-w-3xl"
                    >
                      {slide.title}
                    </motion.h1>

                    <motion.p
                      initial={{ y: 35, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className="text-base md:text-lg text-slate-200 max-w-2xl leading-relaxed"
                    >
                      {slide.description}
                    </motion.p>

                    <motion.div
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="flex flex-wrap gap-4 pt-4 justify-center"
                    >
                      {currentUser ? (
                        <a
                          href="/events"
                          onClick={(e) => { e.preventDefault(); onNavigate?.("events"); }}
                          className="gold-button-gradient shadow-lg shadow-brand-gold/20 text-slate-900 font-bold px-8 py-3.5 rounded-xl hover:opacity-90 transition transform hover:-translate-y-0.5 text-sm flex items-center space-x-2"
                        >
                          <span>Register for Events</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      ) : (
                        <>
                         <a
              href="/founders"
              className="inline-flex items-center bg-brand-pink hover:bg-brand-pink-dark text-white font-bold px-8 py-3.5 rounded-full shadow-md shadow-brand-pink/25 transition hover:-translate-y-0.5 text-sm"
            >Apply for Membership</a>
                          {/* <button
                            onClick={onOpenAuth}
                            className="bg-brand-pink text-white hover:bg-brand-pink-dark px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition transform hover:-translate-y-0.5 flex items-center space-x-2"
                          >
                            <span>Apply for Membership</span>
                            <ArrowRight className="w-4 h-4" />
                          </button> */}

                           <a
              href="/profile"
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/20 transition"
            >Learn More</a>
                          {/* <button
                            onClick={() => {
                              const el = document.getElementById("about-section-landing");
                              el?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/20 transition"
                          >
                            Learn More
                          </button> */}
                        </>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          // Static Fallback while loading
          <div className="text-slate-500">Loading premium corporate slides...</div>
        )}

        {/* Previous / Next Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)}
              className="absolute left-4 z-20 p-3 rounded-full bg-slate-900/40 hover:bg-slate-900/70 text-white/80 hover:text-white transition duration-200 border border-white/10 flex items-center justify-center cursor-pointer"
              aria-label="Previous slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % slides.length)}
              className="absolute right-4 z-20 p-3 rounded-full bg-slate-900/40 hover:bg-slate-900/70 text-white/80 hover:text-white transition duration-200 border border-white/10 flex items-center justify-center cursor-pointer"
              aria-label="Next slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Carousel Indicators / Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 z-20 flex space-x-2.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlideIndex 
                    ? "w-8 bg-brand-pink" 
                    : "w-2.5 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. For Women — Who We're For */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto text-center space-y-14" id="about-section-landing">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-dark">PLAY • CONNECT • PLAY AGAIN</span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900">
            WomenPlay Is For Women <em className="gold-text-gradient not-italic">Who...</em>
          </h2>
        </div>

        {/* For Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[
            "Want to play, connect, and play again",
            "Want to relive their girl-child memories",
            "Don't need permission to be silly, bold, and fully themselves",
            "Are tired of networking events that feel like work",
            "Want to play without worrying about being judged",
            "Want to feel like a kid again — with the confidence of a grown woman",
            "Want to laugh until their stomach hurts",
            "Want to reconnect with the carefree version of themselves",
            "Want to collect memories instead of just attending another event"
          ].map((line, i) => (
            <div
              key={i}
              className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 luxury-shadow hover:border-brand-pink/30 hover:shadow-lg transition duration-300 flex items-center gap-4 text-left"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-full bg-gradient-to-br from-brand-pink to-brand-gold text-white flex items-center justify-center shadow-md shadow-brand-pink/20">
                <Check className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <span className="text-slate-700 text-sm md:text-base font-semibold leading-snug">{line}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-6">
          <p className="text-slate-600 text-sm md:text-base font-medium">
            If any of these feel true for you, WomenPlay was made with you in mind.
          </p>
          <a
            href="/founders"
            className="inline-flex items-center space-x-2 bg-brand-pink hover:bg-brand-pink-dark text-white font-bold px-8 py-3.5 rounded-full shadow-md shadow-brand-pink/25 transition hover:-translate-y-0.5 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Become A Founding Member</span>
          </a>
        </div>
      </section>

      {/* Founding Circle Signup */}
      <FoundingCircle />

      {/* Signature Experiences */}
      <section className="py-20 px-6 md:px-12 bg-gradient-to-b from-white via-brand-pink-light/40 to-slate-50 border-t border-slate-100" id="experiences-section-landing">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-dark">Signature Experiences</span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900">
              Curated Gatherings. <em className="gold-text-gradient not-italic">Beautiful Moments.</em>
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Curated gatherings designed to help women unwind, laugh, celebrate, explore, connect, and enjoy life through beautiful shared experiences.
            </p>
          </div>

          {/* Experience Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: "🌸", name: "Brunch & Bloom", txt: "Elegant dining experiences with beautiful tablescapes, conversation, laughter, and the kind of connection that makes mornings memorable." },
              { icon: "🎤", name: "Karaoke Socials", txt: "Private venue experiences where every woman gets her spotlight moment. No judgment — just laughter, singing, and shared joy." },
              { icon: "🎲", name: "Games Evenings", txt: "Laughter-filled nights designed for fun, ease, and genuine connection. Great company, good drinks, and playful competition." },
              { icon: "🧘🏾‍♀️", name: "Wellness Moments", txt: "Restorative experiences focused on peace, self-care, reflection, beauty, and renewal. Because every woman deserves to exhale." },
              { icon: "🫖", name: "Themed Socials", txt: "Seasonal gatherings, tea parties, cultural experiences, celebration nights, and elevated social events designed to delight and inspire." },
              { icon: "🥂", name: "Networking & Lifestyle Mixers", txt: "Stylish gatherings where women connect, share ideas, build meaningful relationships, and enjoy memorable conversations." }
            ].map((exp, i) => (
              <div
                key={i}
                className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 luxury-shadow hover:border-brand-pink/30 hover:shadow-lg transition duration-300 text-center"
              >
                <span className="text-3xl md:text-4xl block mb-4">{exp.icon}</span>
                <div className="text-slate-900 font-bold text-base md:text-lg mb-2">{exp.name}</div>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{exp.txt}</p>
              </div>
            ))}
          </div>

          {/* Coming Soon Note */}
          <div className="max-w-3xl mx-auto">
            <p className="text-xs md:text-sm text-slate-500 bg-white/70 border border-slate-100 rounded-full px-6 py-3 luxury-shadow inline-block">
              <strong className="text-brand-pink">Coming Soon:</strong> Our first signature experience will be announced soon. Founding Circle members receive priority access to all event registration.
            </p>
          </div>

          {/* CTA Row */}
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/tickets"
              className="inline-flex items-center space-x-2 bg-brand-pink hover:bg-brand-pink-dark text-white font-bold px-8 py-3.5 rounded-full shadow-md shadow-brand-pink/25 transition hover:-translate-y-0.5 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Get Early Access</span>
            </a>
            <a
              href="/events"
              onClick={(e) => { e.preventDefault(); onNavigate?.("events"); }}
              className="inline-flex items-center space-x-2 border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white font-bold px-8 py-3 rounded-full transition hover:-translate-y-0.5 text-sm"
            >
              <span>Explore Events</span>
            </a>
          </div>
        </div>
      </section>

      {/* 4. Interactive Community Voices & Gatherings Section */}
      <section className="py-20 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-stretch" id="stories-section-landing">
        
        {/* Left Column: Community Testimonials (col-md-5) */}
        <div className="md:col-span-5 col-md-5 space-y-6 text-left flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-dark">COMMUNITY VOICES</span>
              <span className="px-2 py-0.5 rounded-full bg-brand-pink-light/30 text-brand-pink text-[10px] font-extrabold uppercase">
                WomenPlay Circle
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900">Joyful Moments & Playful Connections</h2>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
              We aren’t a stuffy networking club. Expect laughter, games, and playful moments that genuinely lift your spirit.
            </p>
          </div>

          {/* Interactive Sliding Track */}
          <div 
            className="relative overflow-hidden min-h-[280px] rounded-3xl my-2"
            onMouseEnter={() => setIsStoryPaused(true)}
            onMouseLeave={() => setIsStoryPaused(false)}
          >
            {approvedStories.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStoryIndex}
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="grid grid-cols-1 gap-6"
                >
                  {[approvedStories[activeStoryIndex]].map((story, i) => (
                    <div 
                      key={story.id + "-" + i} 
                      className="bg-white p-6 md:p-7 rounded-2xl border border-slate-100 luxury-shadow flex flex-col justify-between relative group hover:border-brand-gold/40 transition-all duration-300 min-h-[260px]"
                    >
                      <Quote className="w-8 h-8 text-brand-pink/15 absolute top-5 right-5 pointer-events-none" />
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3.5">
                          <img 
                            src={story.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                            alt={story.userFullName} 
                            loading="lazy"
                            decoding="async"
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"; }}
                            className="w-12 h-12 rounded-full border-2 border-brand-gold object-cover shadow-xs"
                          />
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <h4 className="text-xs font-black text-slate-900">{story.userFullName}</h4>
                              <Star className="w-3 h-3 text-brand-gold fill-brand-gold shrink-0" />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-gold-dark block">
                              WomenPlay Community
                            </span>
                          </div>
                        </div>

                        <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                          "{story.title}"
                        </h3>

                        <p className="text-slate-600 text-xs leading-relaxed line-clamp-5 italic">
                          "{story.content}"
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-slate-400">
                          {new Date(story.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                          Community Joy
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center py-16 space-y-2">
                <Quote className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-slate-500 text-xs font-semibold">Because life is better when… Women can play too!</p>
              </div>
            )}
          </div>

          {/* Slides Control UNDER the Stories */}
          {approvedStories.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100/80">
              {/* Pagination Dots */}
              <div className="flex items-center space-x-1.5">
                {approvedStories.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveStoryIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeStoryIndex 
                        ? "w-6 bg-brand-pink shadow-xs" 
                        : "w-2 bg-slate-200 hover:bg-slate-300"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Prev/Next Buttons + Counter */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveStoryIndex(prev => (prev === 0 ? approvedStories.length - 1 : prev - 1))}
                  className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-brand-pink transition cursor-pointer shadow-xs"
                  aria-label="Previous Story"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-600 min-w-[45px] text-center font-mono">
                  {activeStoryIndex + 1} / {approvedStories.length}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveStoryIndex(prev => (prev + 1) % approvedStories.length)}
                  className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-brand-pink transition cursor-pointer shadow-xs"
                  aria-label="Next Story"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Signature Gatherings & Socials Card (col-md-7) */}
        <div className="md:col-span-7 col-md-7 bg-slate-900 rounded-3xl border border-slate-800 luxury-shadow overflow-hidden flex flex-col justify-between text-left relative group min-h-[440px] h-full" id="signature-gatherings-card">
          <div className="relative h-full w-full overflow-hidden flex flex-col justify-end">
            <img 
              src="/assets/executive_tea_party_1785235353940-DMMx34TC.jpg"
              alt="Joyful Gatherings & Play Moments" 
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            <div className="absolute top-4 left-4 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-brand-gold/40 text-brand-gold-light text-[10px] font-bold uppercase tracking-widest shadow">
              <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
              <span>Signature Gatherings</span>
            </div>

            <div className="relative z-10 p-6 md:p-8 space-y-3 text-white">
              <h3 className="text-2xl md:text-3xl font-display font-extrabold text-white">Curated Play & Social Gatherings</h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl">
                Private venue experiences where every woman gets her spotlight moment. No judgment — just laughter, singing, and shared joy.
              </p>
              <button
                onClick={() => onNavigate?.("events" as any)}
                className="mt-4 inline-flex items-center space-x-2 text-xs md:text-sm font-bold text-brand-pink-light hover:text-white transition group/btn cursor-pointer bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full"
              >
                <span>Explore Events & Gatherings</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Blog & Community Stories Section */}
      <section className="py-20 max-w-7xl mx-auto px-6 md:px-12 space-y-12 text-left" id="blog-section-landing">
        <div className="space-y-3">
          <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-dark font-display">WOMENPLAY STORIES</span>
          <h2 className="text-3xl font-display font-extrabold text-slate-900">Inspiration, Play & Community News</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map((blog) => (
            <div 
              key={blog.id} 
              onClick={() => setSelectedBlog(blog)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 luxury-shadow hover:border-brand-pink/20 cursor-pointer transition-all hover:scale-[1.01] duration-300 flex flex-col md:flex-row group"
            >
              <div className="w-full md:w-1/3 h-48 md:h-full bg-slate-100 shrink-0 overflow-hidden">
                <img 
                  src={blog.image} 
                  alt={blog.title} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="p-6 w-full md:w-2/3 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-brand-pink">
                    <span>{blog.category}</span>
                    <span className="text-slate-400 font-medium">{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 line-clamp-2 group-hover:text-brand-pink transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">{blog.content}</p>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <div className="text-[10px] text-slate-400 font-semibold">By: {blog.author}</div>
                  <span className="text-[10px] font-extrabold uppercase text-brand-pink group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    <span>Read Article</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blog Reading Modal Overlay */}
      <AnimatePresence>
        {selectedBlog && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-100 animate-fade-in" id="blog-reader-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden border border-slate-100 shadow-2xl flex flex-col max-h-[85vh] text-left"
            >
              {/* Header Cover Banner */}
              <div className="h-64 md:h-80 w-full relative shrink-0">
                <img src={selectedBlog.image} alt={selectedBlog.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-slate-950/50" />
                
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedBlog(null)}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-xs transition cursor-pointer"
                  title="Close Article"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Cover Meta Data */}
                <div className="absolute bottom-6 left-6 right-6 space-y-2">
                  <span className="text-[9px] font-extrabold uppercase bg-brand-pink text-white px-2.5 py-0.5 rounded-full tracking-wider">
                    {selectedBlog.category}
                  </span>
                  <h1 className="text-xl md:text-3xl font-display font-extrabold text-white leading-tight">
                    {selectedBlog.title}
                  </h1>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-slate-700">
                {/* Meta details */}
                <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-600">By: {selectedBlog.author}</span>
                  </div>
                  <span>Published on {new Date(selectedBlog.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Article text */}
                <div className="text-sm md:text-base leading-relaxed text-slate-600 space-y-4 whitespace-pre-wrap font-sans">
                  {selectedBlog.content}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                <button 
                  onClick={() => setSelectedBlog(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition cursor-pointer"
                >
                  Close Article
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Coming Soon Section */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto" id="coming-soon">
        <div className="space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-dark">What&apos;s Next</span>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900">
              Coming <em className="gold-text-gradient not-italic">Soon.</em>
            </h2>
            <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              Full details will be released closer to launch on Saturday, October 24, 2026.
            </p>
          </div>

          {/* Coming Soon Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: "Venue Reveal", subtitle: "Surrey, BC" },
              { title: "Game Line-Up", subtitle: "6 exciting play stations" },
              { title: "Merch Collection", subtitle: "Limited quantities" },
              { title: "Vendor Village", subtitle: "Food + lifestyle" },
              { title: "Official Teams", subtitle: "Classy Queens 👑, Tomboy Tribe 🏀, Simple Souls ✨, Free Spirits 🦋, Fearless 🔥, Wildflowers 🌸" },
              { title: "Founding Membership", subtitle: "Brand community" },
              { title: "Future Events Calendar", subtitle: "Beyond launch" },
              { title: "Full Vendor + Prize List", subtitle: "Coming closer to launch" }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white border border-slate-100 rounded-2xl p-6 luxury-shadow hover:border-brand-pink/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left group"
              >
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-pink transition-colors mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 font-medium">{item.subtitle}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center pt-8">
            <p className="text-slate-600 text-sm md:text-base mb-6">
              Stay tuned for exciting announcements and exclusive previews.
            </p>
            <a
              href="/contact"
              onClick={(e) => { e.preventDefault(); onNavigate?.("contact"); }}
              className="inline-flex items-center space-x-2 bg-brand-pink hover:bg-brand-pink-dark text-white font-bold px-8 py-3.5 rounded-full shadow-md shadow-brand-pink/25 transition hover:-translate-y-0.5 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Subscribe for Updates</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
