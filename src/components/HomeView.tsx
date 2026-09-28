import React from "react";
import {
  ArrowRight,
  Sparkles,
  Quote,
  Calendar,
  MapPin,
  Ticket,
  Heart,
  Smile,
  Users,
  Compass,
  Handshake,
  HelpCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { BlogArticle, SuccessStory, Founder } from "../types";
import type { NavView } from "./Header";

interface HomeViewProps {
  blogs: BlogArticle[];
  successStories: SuccessStory[];
  onOpenAuth: () => void;
  currentUser: any;
  onNavigate?: (view: NavView) => void;
  founders?: Founder[];
}

export default function HomeView({
  blogs,
  successStories,
  onOpenAuth,
  currentUser,
  onNavigate,
}: HomeViewProps) {
  // Default Carousel Slides matching exact WomenPlay mockups
  const defaultSlides = [
    {
      id: "slide-1",
      image: "/assets/images/carousel_jenga_game.jpg",
      eyebrow: "BECAUSE LIFE IS BETTER\nWHEN WOMEN CAN PLAY TOO!",
      title: "Remember the girl\nwho loved to play?",
      highlight: "She's still in there.",
      suffix: "Come out and play.",
      hasDivider: true,
      description: "WomenPlay creates intentional spaces for women to reconnect with carefree joy through games, laughter, movement and shared experiences.",
      overlayColor: "rgba(0,0,0,0.4)"
    },
    {
      id: "slide-2",
      image: "/assets/images/carousel_tea_party_1789553555002.jpg",
      eyebrow: "MEANINGFUL CONNECTIONS",
      title: "Play. Connect.\nPlay Again.",
      hasDivider: false,
      description: "Because life is better when women can play too. WomenPlay is a judgment-free space to let your guard down, connect authentically and simply have fun.",
      overlayColor: "rgba(0,0,0,0.4)"
    },
    {
      id: "slide-3",
      image: "/assets/images/carousel_yacht_party_1789553569691.jpg",
      eyebrow: "EXPERIENCES BEYOND THE EVERYDAY",
      title: "Who said we had\nto outgrow play?",
      highlight: "Growing up doesn't mean\nwe have to stop playing.",
      hasDivider: true,
      description: "At WomenPlay, we create joyful experiences that help women reconnect, explore and play again.",
      overlayColor: "rgba(0,0,0,0.4)"
    }
  ];

  // Carousel States
  const [slides, setSlides] = React.useState<any[]>(defaultSlides);
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);

  // Fetch Slides
  React.useEffect(() => {
    fetch("/api/carousel")
      .then((res) => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setSlides(data);
        }
      })
      .catch((err) => console.warn("Notice: Carousel slides unavailable:", err));
  }, []);

  // Slide rotation interval
  React.useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [slides]);

  // Slide content renderer matching exact mockup styling
  const renderSlideContent = (slide: any, idx: number) => {
    const isOriginalSlide1 = (idx === 0 || slide.id === "slide-1") && (!slide.title || slide.title.includes("Remember the girl"));
    const isOriginalSlide2 = (idx === 1 || slide.id === "slide-2") && (!slide.title || slide.title.includes("Play. Connect."));
    const isOriginalSlide3 = (idx === 2 || slide.id === "slide-3") && (!slide.title || slide.title.includes("Who said we had"));

    if (isOriginalSlide1) {
      return {
        eyebrow: (
          <div className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] text-[#dfc09f] uppercase font-sans leading-tight">
            BECAUSE LIFE IS BETTER<br />WHEN WOMEN CAN PLAY TOO!
          </div>
        ),
        title: (
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-normal leading-[1.12] tracking-tight text-white">
            Remember the girl<br />
            who loved to play?<br />
            <span className="italic text-[#dba08d]">She&apos;s still in there.</span><br />
            Come out and play.
          </h1>
        ),
        hasDivider: true,
        description: slide.description || "WomenPlay creates intentional spaces for women to reconnect with carefree joy through games, laughter, movement and shared experiences."
      };
    }

    if (isOriginalSlide2) {
      return {
        eyebrow: (
          <div className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] text-[#dfc09f] uppercase font-sans leading-tight">
            MEANINGFUL CONNECTIONS
          </div>
        ),
        title: (
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-normal leading-[1.12] tracking-tight text-white">
            Play. Connect.<br />
            Play Again.
          </h1>
        ),
        hasDivider: false,
        description: slide.description || "Because life is better when women can play too. WomenPlay is a judgment-free space to let your guard down, connect authentically and simply have fun."
      };
    }

    if (isOriginalSlide3) {
      return {
        eyebrow: (
          <div className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] text-[#dfc09f] uppercase font-sans leading-tight">
            EXPERIENCES BEYOND THE EVERYDAY
          </div>
        ),
        title: (
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-normal leading-[1.12] tracking-tight text-white">
            Who said we had<br />
            to outgrow play?<br />
            <span className="italic text-[#dba08d]">Growing up doesn&apos;t mean</span><br />
            <span className="italic text-[#dba08d]">we have to stop playing.</span>
          </h1>
        ),
        hasDivider: true,
        description: slide.description || "At WomenPlay, we create joyful experiences that help women reconnect, explore and play again."
      };
    }

    return {
      eyebrow: slide.eyebrow ? (
        <div className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] text-[#dfc09f] uppercase font-sans leading-tight whitespace-pre-line">
          {slide.eyebrow}
        </div>
      ) : (
        <div className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] text-[#dfc09f] uppercase font-sans leading-tight">
          WOMENPLAY MOMENTS
        </div>
      ),
      title: (
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-normal leading-[1.12] tracking-tight text-white whitespace-pre-line">
          {slide.title}
        </h1>
      ),
      hasDivider: Boolean(slide.hasDivider),
      description: slide.description
    };
  };

  // Approved success stories
  const defaultStories: SuccessStory[] = [
    {
      id: "story-1",
      userId: "member-tara",
      userFullName: "Tara M.",
      userAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      title: "Reconnecting with pure, uninhibited laughter",
      content: "Attending the pilot games evening reminded me how much I missed just laughing until my stomach hurt. No awkward small talk or work pressure — just genuine warmth, playful games, and incredible women who welcomed me with open arms.",
      approved: true,
      createdAt: "2026-07-15T00:00:00.000Z"
    },
    {
      id: "story-2",
      userId: "member-kimberly",
      userFullName: "Kimberly S.",
      userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      title: "A space where you can fully be yourself",
      content: "WomenPlay is completely different from any traditional women's group I've experienced. The atmosphere is vibrant, warm, and judgment-free. I left the gathering feeling deeply energized and with lifelong friends I can actually be silly with.",
      approved: true,
      createdAt: "2026-07-22T00:00:00.000Z"
    },
    {
      id: "story-3",
      userId: "member-amina",
      userFullName: "Amina K.",
      userAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
      title: "Laughter, connection, and spotlight moments",
      content: "From the team game stations to the tea party conversations, every single detail made each woman feel seen, celebrated, and valued. You don't need permission to be bold here. I cannot wait for the Jersey Style launch!",
      approved: true,
      createdAt: "2026-08-05T00:00:00.000Z"
    },
    {
      id: "story-4",
      userId: "member-danielle",
      userFullName: "Danielle R.",
      userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
      title: "Collecting memories, not just attending events",
      content: "As a busy professional and mother, I needed a space to unwind and just play. WomenPlay gave me permission to feel carefree again with the confidence of who I am today. It's the most refreshing community in BC.",
      approved: true,
      createdAt: "2026-08-12T00:00:00.000Z"
    }
  ];

  const approvedStories = successStories.filter((s) => s.approved);
  const displayStories = approvedStories.length > 0 ? approvedStories : defaultStories;

  return (
    <div className="w-full bg-slate-50 min-h-screen text-left" id="home-view-container">
      {/* 1. Hero / Carousel Banner Section */}
      <section
        className="relative w-full min-h-[580px] sm:min-h-[620px] md:h-[660px] lg:h-[700px] overflow-hidden bg-slate-950 flex items-center text-white border-b border-brand-gold/30"
        id="home-carousel-container"
      >
        {slides.length > 0 ? (
          <AnimatePresence mode="wait">
            {slides.map((slide, idx) => {
              if (idx !== currentSlideIndex) return null;
              const content = renderSlideContent(slide, idx);
              return (
                <motion.div
                  key={slide.id || idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full flex items-center bg-cover bg-center md:bg-[center_top]"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  {/* Backdrop Overlay - darker on the left where text sits, fading toward the right so smiling women stay luminous */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 sm:via-black/45 to-black/20 md:to-transparent" />

                  {/* Content Container (Left-Aligned, max-w-7xl) */}
                  <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 md:px-16 lg:px-24 flex flex-col justify-center h-full py-16">
                    <div className="max-w-xl md:max-w-2xl text-left space-y-4 sm:space-y-5">
                      {/* Eyebrow */}
                      <motion.div
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15, duration: 0.5 }}
                      >
                        {content.eyebrow}
                      </motion.div>

                      {/* Headline */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.25, duration: 0.6 }}
                      >
                        {content.title}
                      </motion.div>

                      {/* Subtle thin warm divider line (Slides 1 & 3) */}
                      {content.hasDivider && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.35, duration: 0.4 }}
                          className="w-16 sm:w-20 h-[1.5px] bg-[#dba08d]/70 origin-left my-2 sm:my-3"
                        />
                      )}

                      {/* Description Paragraph */}
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.35, duration: 0.6 }}
                        className="text-xs sm:text-sm md:text-[15px] text-white/90 font-sans max-w-lg leading-relaxed pt-1"
                      >
                        {content.description}
                      </motion.p>

                      {/* Action Buttons */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.45, duration: 0.6 }}
                        className="flex flex-wrap gap-3 sm:gap-4 pt-3 sm:pt-4 items-center"
                      >
                        <button
                          type="button"
                          onClick={() => onNavigate?.("events" as any)}
                          id="hero-cta-events"
                          className="px-6 sm:px-7 py-3 rounded-full bg-[#cd7f6c] hover:bg-[#ba6d5b] text-white font-sans text-xs sm:text-[13px] font-semibold tracking-wide shadow-md transition-all duration-200 inline-flex items-center gap-2 cursor-pointer hover:-translate-y-0.5"
                        >
                          <span>Explore Events & Gatherings</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onNavigate?.("founders" as any)}
                          id="hero-cta-founders"
                          className="px-6 sm:px-7 py-3 rounded-full bg-black/25 hover:bg-white/15 backdrop-blur-xs border border-white/50 text-white font-sans text-xs sm:text-[13px] font-semibold tracking-wide transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
                        >
                          Join the Founding Circle
                        </button>
                      </motion.div>

                      {/* Bottom-left Counter (01 / 03) and Dots */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55, duration: 0.4 }}
                        className="flex items-center gap-3 pt-5 sm:pt-7"
                      >
                        <span className="text-xs sm:text-[13px] text-white/75 font-mono tracking-widest font-medium">
                          {String(idx + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                        </span>
                        <div className="flex items-center gap-2">
                          {slides.map((_, dotIdx) => (
                            <button
                              key={dotIdx}
                              type="button"
                              onClick={() => setCurrentSlideIndex(dotIdx)}
                              className={`transition-all duration-300 rounded-full cursor-pointer ${
                                dotIdx === currentSlideIndex
                                  ? "w-2.5 h-2.5 bg-[#cd7f6c]"
                                  : "w-2 h-2 bg-white/35 hover:bg-white/60"
                              }`}
                              aria-label={`Go to slide ${dotIdx + 1}`}
                            />
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="text-slate-400 py-24 text-center w-full">Loading WomenPlay experiences...</div>
        )}

        {/* Carousel Arrow Controls (subtle side navigators) */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/30 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center backdrop-blur-xs transition hover:scale-105 cursor-pointer shadow-lg opacity-60 hover:opacity-100"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % slides.length)}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/30 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center backdrop-blur-xs transition hover:scale-105 cursor-pointer shadow-lg opacity-60 hover:opacity-100"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </section>

      {/* 2. Brand Core & Pillars (The Heart of WomenPlay) */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto text-center space-y-12">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-dark">
            OUR PURPOSE & SPIRIT
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900">
            Where Women Come Together to <em className="gold-text-gradient not-italic">Play & Connect</em>
          </h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            WomenPlay was created to bring adult women together for joyful play, uninhibited laughter,
            warm friendships, and uplifting shared moments in private, beautiful venues.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Smile,
              title: "Play & Pure Joy",
              desc: "Relive carefree girlhood memories and laugh until your stomach hurts without any pressure or judgment."
            },
            {
              icon: Users,
              title: "Warm Connection",
              desc: "Make real friends easily through shared games and conversations rather than stuffy corporate networking."
            },
            {
              icon: Sparkles,
              title: "Spotlight Moments",
              desc: "Curated experiences where every woman gets her spotlight moment to shine, sing, play, and celebrate."
            },
            {
              icon: Heart,
              title: "Safe & Judgment-Free",
              desc: "A warm, inclusive space where adult women can be bold, silly, and 100% authentically themselves."
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-7 rounded-3xl border border-slate-200/80 luxury-shadow hover:border-brand-pink/30 hover:shadow-lg transition-all duration-300 text-left space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-pink/10 text-brand-pink border border-brand-pink/20 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Signature Experiences Teaser */}
      <section className="py-20 px-6 md:px-12 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-dark">
              SIGNATURE GATHERINGS
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900">
              Curated Gatherings. <em className="gold-text-gradient not-italic">Memorable Moments.</em>
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Curated experiences designed to help women unwind, laugh, explore, connect, and enjoy life together.
            </p>
          </div>

          {/* 4 Clean Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              {
                emoji: "🌸",
                title: "Brunch & Bloom",
                desc: "Elegant dining experiences with beautiful tablescapes, vibrant conversation, and morning warmth."
              },
              {
                emoji: "🎤",
                title: "Karaoke Socials",
                desc: "Private venue sing-alongs where every woman gets her spotlight moment without any judgment."
              },
              {
                emoji: "🎲",
                title: "Games Nights",
                desc: "Laughter-filled nights of interactive trivia, board classics, and playful friendly competition."
              },
              {
                emoji: "🌴",
                title: "Travel & Retreats",
                desc: "Curated weekend getaways, wellness escapes, and travel experiences designed for women to explore, recharge, and connect."
              }
            ].map((exp, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-6 sm:p-7 rounded-3xl border border-slate-200/70 hover:border-brand-pink/40 hover:shadow-md transition-all duration-300 space-y-3"
              >
                <span className="text-3xl block">{exp.emoji}</span>
                <h3 className="text-lg font-bold text-slate-900">{exp.title}</h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{exp.desc}</p>
              </div>
            ))}
          </div>

          <div>
            <button
              type="button"
              onClick={() => onNavigate?.("events" as any)}
              id="btn-home-explore-events"
              className="inline-flex items-center gap-2 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white font-bold px-8 py-3.5 rounded-full transition hover:-translate-y-0.5 text-sm cursor-pointer"
            >
              <span>Explore All Events & Gatherings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Founding Member Teaser (Replacing long form) */}
      <section className="py-16 px-6 md:px-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border-t border-brand-gold/30">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Founding Circle</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-white">
            Join the <em className="gold-text-gradient not-italic">Founding Circle</em>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Join our initial circle of women shaping the future of WomenPlay.
            Founding members receive priority invitations to WomenPlay experiences, early ticket access, exclusive gatherings,
            and special community recognition.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 justify-center">
            <button
              type="button"
              onClick={() => onNavigate?.("founders" as any)}
              id="btn-home-founding-circle"
              className="bg-brand-pink hover:bg-brand-pink-dark text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-brand-pink/25 transition hover:-translate-y-0.5 text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Join the Founding Circle</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Clean White Community & Next Steps Section */}
      <section className="py-20 px-6 md:px-12 bg-white border-t border-slate-200/80 text-slate-900 text-left" id="community-get-involved-section">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-dark">
              CONNECT & COLLABORATE
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900">
              More Ways to <em className="gold-text-gradient not-italic">Get Involved</em>
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Whether you want to sponsor our gatherings, volunteer your talents, host an experience, or have questions about our upcoming events, we would love to connect.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Sponsor & Partner Card */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 hover:border-brand-pink/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-pink/10 text-brand-pink border border-brand-pink/20 flex items-center justify-center">
                  <Handshake className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Partnerships & Sponsorships</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Bring your brand to life within a growing community of women through playful experiences, thoughtful activations and memorable partnerships.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate?.("sponsorship" as any)}
                id="btn-home-partner-cta"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-pink hover:text-brand-pink-dark transition cursor-pointer"
              >
                <span>Explore Partnerships</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Volunteer & Team Card */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 hover:border-brand-gold/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-gold/15 text-brand-gold-dark border border-brand-gold/30 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Volunteer With WomenPlay</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Help bring WomenPlay experiences to life- from welcoming guests and supporting activities to creating fun, memorable moments.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate?.("volunteer" as any)}
                id="btn-home-volunteer-cta"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-gold-dark hover:text-slate-900 transition cursor-pointer uppercase tracking-wider text-xs"
              >
                <span>EXPLORE VOLUNTEER OPPORTUNITIES</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* FAQ & Support Card */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 hover:border-brand-pink/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Have questions about WomenPlay, upcoming experiences or attending solo? Find answers or chat with Mira.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate?.("faq" as any)}
                id="btn-home-faq-cta"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-800 hover:text-brand-pink transition cursor-pointer"
              >
                <span>Explore FAQs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
