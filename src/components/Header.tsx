import React from "react";
import { Award, Menu, X, LogIn, User as UserIcon, LayoutDashboard, LogOut, Radio, ChevronDown, ShieldCheck, Scale, Sparkles } from "lucide-react";
import { UserRole } from "../types";
import type { User } from "../types";
import { VIEW_PATHS } from "../router";

export type NavView = "home" | "portal" | "admin" | "privacy" | "terms" | "sponsorship" | "faq" | "profile" | "gallery" | "whychooseus" | "launch" | "tickets" | "founders" | "events" | "contact" | "volunteer";

interface HeaderProps {
  currentUser: User | null;
  onNavigate: (view: NavView) => void;
  currentView: NavView;
  onLogout: () => void;
  onOpenAuth: () => void;
  announcements?: string[];
}

export default function Header({
  currentUser,
  onNavigate,
  currentView,
  onLogout,
  onOpenAuth,
  announcements
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = React.useState(false);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#top-right-user-nav")) {
        setUserDropdownOpen(false);
      }
      if (!target.closest("#about-nav-dropdown")) {
        setAboutDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full" id="aura-header">
      {/* Top Announcement Marquee */}
      {announcements && announcements.length > 0 && (
        <div className="bg-gradient-to-r from-brand-pink via-brand-gold-dark to-brand-pink text-white text-xs font-medium py-2 relative shadow-inner overflow-hidden marquee-track" id="announcement-marquee">
          <div className="flex w-max animate-marquee">
            {[...announcements, ...announcements].map((title, i) => (
              <span key={i} className="flex items-center space-x-3 px-6 shrink-0">
                <Radio className="w-3.5 h-3.5 text-brand-gold-light shrink-0" />
                <span className="truncate">{title}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Luxury Nav */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 py-3.5 px-4 md:px-10 flex justify-between items-center luxury-shadow">
        
        {/* Left Section: Brand Logo */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <a
            href={VIEW_PATHS.home}
            onClick={(e) => { e.preventDefault(); onNavigate("home"); }}
            className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
            id="brand-logo-nav"
          >
            <img 
              src="/assets/logo.png" 
              alt="WomenPlay Logo" 
              onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }}
              className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </a>
        </div>

        {/* Center Section: Desktop Links */}
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          <a
            href={VIEW_PATHS.home}
            onClick={(e) => { e.preventDefault(); onNavigate("home"); }}
            id="nav-link-home"
            className={`font-medium text-xs md:text-sm transition-all relative py-1 ${
              currentView === "home" 
                ? "text-brand-pink font-bold" 
                : "text-slate-600 hover:text-brand-pink"
            }`}
          >
            Home
            {currentView === "home" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-pink rounded-full" />
            )}
          </a>

          <a
            href={VIEW_PATHS.events}
            onClick={(e) => {
              e.preventDefault();
              onNavigate("events");
            }}
            id="nav-link-events"
            className={`font-medium text-xs md:text-sm transition-all relative py-1 ${
              currentView === "events"
                ? "text-brand-pink font-bold"
                : "text-slate-600 hover:text-brand-pink"
            }`}
          >
            Events
            {currentView === "events" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-pink rounded-full" />
            )}
          </a>

          <div className="relative" id="about-nav-dropdown">
            <button
              onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
              id="nav-link-about"
              className="flex items-center space-x-1 text-slate-600 hover:text-brand-pink font-medium text-xs md:text-sm transition cursor-pointer py-1"
              aria-haspopup="true"
              aria-expanded={aboutDropdownOpen}
            >
              <span>About Us</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${aboutDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {aboutDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-left"
                id="about-nav-dropdown-menu"
              >
                <a
                  href={VIEW_PATHS.profile}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("profile");
                    setAboutDropdownOpen(false);
                  }}
                  id="about-dropdown-item-profile"
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-brand-pink hover:bg-slate-50 flex items-center space-x-2.5 transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-brand-gold" />
                  <span>Profile</span>
                </a>
                <a
                  href={VIEW_PATHS.gallery}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("gallery");
                    setAboutDropdownOpen(false);
                  }}
                  id="about-dropdown-item-gallery"
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-brand-pink hover:bg-slate-50 flex items-center space-x-2.5 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-brand-pink" />
                  <span>Gallery</span>
                </a>
                <a
                  href={VIEW_PATHS.whychooseus}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("whychooseus");
                    setAboutDropdownOpen(false);
                  }}
                  id="about-dropdown-item-why"
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-brand-pink hover:bg-slate-50 flex items-center space-x-2.5 transition cursor-pointer"
                >
                  <Scale className="w-4 h-4 text-brand-gold-dark" />
                  <span>Why Choose Us</span>
                </a>
              </div>
            )}
          </div>

          <a
            href={VIEW_PATHS.faq}
            onClick={(e) => { e.preventDefault(); onNavigate("faq"); }}
            id="nav-link-faq"
            className={`font-medium text-xs md:text-sm transition-all relative py-1 ${
              currentView === "faq" 
                ? "text-brand-pink font-bold" 
                : "text-slate-600 hover:text-brand-pink"
            }`}
          >
            FAQ
            {currentView === "faq" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-pink rounded-full" />
            )}
          </a>

          <a
            href={VIEW_PATHS.sponsorship}
            onClick={(e) => { e.preventDefault(); onNavigate("sponsorship"); }}
            id="nav-link-sponsorship"
            className={`font-medium text-xs md:text-sm transition-all relative py-1 ${
              currentView === "sponsorship" 
                ? "text-brand-pink font-bold" 
                : "text-slate-600 hover:text-brand-pink"
            }`}
          >
            Sponsorship
            {currentView === "sponsorship" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-pink rounded-full" />
            )}
          </a>

          <a
            href={VIEW_PATHS.volunteer}
            onClick={(e) => { e.preventDefault(); onNavigate("volunteer"); }}
            id="nav-link-volunteer"
            className={`font-medium text-xs md:text-sm transition-all relative py-1 ${
              currentView === "volunteer" 
                ? "text-brand-pink font-bold" 
                : "text-slate-600 hover:text-brand-pink"
            }`}
          >
            Volunteer
            {currentView === "volunteer" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-pink rounded-full" />
            )}
          </a>

          <a
            href={VIEW_PATHS.contact}
            onClick={(e) => {
              e.preventDefault();
              onNavigate("contact");
            }}
            id="nav-link-contact"
            className={`font-medium text-xs md:text-sm transition-all relative py-1 ${
              currentView === "contact"
                ? "text-brand-pink font-bold"
                : "text-slate-600 hover:text-brand-pink"
            }`}
          >
            Contact Us
            {currentView === "contact" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-pink rounded-full" />
            )}
          </a>
        </div>

        {/* Right Section: User Dropdown List / Sign In */}
        <div className="flex items-center space-x-3">
          <div className="relative" id="top-right-user-nav">
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserDropdownOpen(!userDropdownOpen);
                  }}
                  id="user-dropdown-toggle-btn"
                  className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 py-1.5 px-3 rounded-full transition text-left cursor-pointer shadow-xs hover:border-brand-pink/30"
                >
                  <img 
                    src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                    alt={currentUser.fullName} 
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"; }}
                    className="w-7 h-7 rounded-full border border-brand-gold object-cover shrink-0"
                  />
                  <div className="leading-tight hidden sm:block max-w-[120px] truncate">
                    <p className="text-xs font-bold text-slate-800 truncate">{currentUser.fullName}</p>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-brand-gold-dark block truncate">
                      {currentUser.membershipTier}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu showing Dashboard, Logout */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 left-auto mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-left"
                    id="user-nav-dropdown-menu"
                  >
                    <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                      <p className="text-xs font-bold text-slate-800 truncate">{currentUser.fullName}</p>
                      <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                    </div>

                    <div className="py-1">
                      <a
                        href={VIEW_PATHS.portal}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate("portal");
                          setUserDropdownOpen(false);
                        }}
                        id="dropdown-item-dashboard"
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:text-brand-pink hover:bg-slate-50 flex items-center space-x-2.5 transition cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4 text-brand-gold" />
                        <span>Dashboard</span>
                      </a>

                      {currentUser.role === UserRole.ADMIN && (
                        <a
                          href={VIEW_PATHS.admin}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate("admin");
                            setUserDropdownOpen(false);
                          }}
                          id="dropdown-item-admin"
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:text-brand-pink hover:bg-slate-50 flex items-center space-x-2.5 transition cursor-pointer"
                        >
                          <Award className="w-4 h-4 text-brand-pink" />
                          <span>Admin Dashboard</span>
                        </a>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onLogout();
                          setUserDropdownOpen(false);
                        }}
                        id="dropdown-item-logout"
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2.5 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                id="top-right-signin-btn"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-brand-pink hover:bg-brand-pink-dark text-white font-semibold transition text-xs shadow-md shadow-brand-pink/20 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Portal Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="lg:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              id="btn-mobile-menu-toggle"
              className="p-2 rounded-lg text-slate-600 hover:text-brand-pink transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer - Slide-in from left overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute top-0 left-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300 text-left">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
              <img src="/assets/logo.png" alt="WomenPlay Logo" className="h-9 w-auto object-contain" referrerPolicy="no-referrer" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-lg text-slate-600 hover:text-brand-pink transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col space-y-3 px-6 py-4">
          <a
            href={VIEW_PATHS.home}
            onClick={(e) => {
              e.preventDefault();
              onNavigate("home");
              setMobileMenuOpen(false);
            }}
            className={`text-left py-2 text-sm font-semibold ${currentView === "home" ? "text-brand-pink" : "text-slate-700"}`}
          >
            Home
          </a>

          <a
            href={VIEW_PATHS.events}
            onClick={(e) => {
              e.preventDefault();
              onNavigate("events");
              setMobileMenuOpen(false);
            }}
            className={`text-left py-2 text-sm font-semibold ${currentView === "events" ? "text-brand-pink" : "text-slate-700"}`}
          >
            Events
          </a>

          <div className="text-left">
            <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 py-1">About Us</p>
            <div className="space-y-1 border-l-2 border-slate-100 pl-3">
              <a
                href={VIEW_PATHS.profile}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("profile");
                  setMobileMenuOpen(false);
                }}
                className={`block py-1.5 text-sm font-semibold ${currentView === "profile" ? "text-brand-pink" : "text-slate-700 hover:text-brand-pink"}`}
              >
                Profile
              </a>
              <a
                href={VIEW_PATHS.gallery}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("gallery");
                  setMobileMenuOpen(false);
                }}
                className={`block py-1.5 text-sm font-semibold ${currentView === "gallery" ? "text-brand-pink" : "text-slate-700 hover:text-brand-pink"}`}
              >
                Gallery
              </a>
              <a
                href={VIEW_PATHS.whychooseus}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("whychooseus");
                  setMobileMenuOpen(false);
                }}
                className={`block py-1.5 text-sm font-semibold ${currentView === "whychooseus" ? "text-brand-pink" : "text-slate-700 hover:text-brand-pink"}`}
              >
                Why Choose Us
              </a>
            </div>
          </div>

          <a
            href={VIEW_PATHS.faq}
            onClick={(e) => {
              e.preventDefault();
              onNavigate("faq");
              setMobileMenuOpen(false);
            }}
            className={`text-left py-2 text-sm font-semibold ${currentView === "faq" ? "text-brand-pink" : "text-slate-700"}`}
          >
            FAQ
          </a>

          <a
            href={VIEW_PATHS.sponsorship}
            onClick={(e) => {
              e.preventDefault();
              onNavigate("sponsorship");
              setMobileMenuOpen(false);
            }}
            className={`text-left py-2 text-sm font-semibold ${currentView === "sponsorship" ? "text-brand-pink" : "text-slate-700"}`}
          >
            Sponsorship
          </a>

          <a
            href={VIEW_PATHS.volunteer}
            onClick={(e) => {
              e.preventDefault();
              onNavigate("volunteer");
              setMobileMenuOpen(false);
            }}
            className={`text-left py-2 text-sm font-semibold ${currentView === "volunteer" ? "text-brand-pink" : "text-slate-700"}`}
          >
            Volunteer
          </a>

          <a
            href={VIEW_PATHS.contact}
            onClick={(e) => {
              e.preventDefault();
              onNavigate("contact");
              setMobileMenuOpen(false);
            }}
            className={`text-left py-2 text-sm font-semibold ${currentView === "contact" ? "text-brand-pink" : "text-slate-700"}`}
          >
            Contact Us
          </a>

          {currentUser ? (
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <a
                href={VIEW_PATHS.portal}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("portal");
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-xl bg-slate-50 text-slate-800 font-bold text-xs flex items-center space-x-2"
              >
                <LayoutDashboard className="w-4 h-4 text-brand-gold" />
                <span>Go to Dashboard</span>
              </a>

              {currentUser.role === UserRole.ADMIN && (
                <a
                  href={VIEW_PATHS.admin}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("admin");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-xl bg-slate-50 text-slate-800 font-bold text-xs flex items-center space-x-2"
                >
                  <Award className="w-4 h-4 text-brand-pink" />
                  <span>Admin Dashboard</span>
                </a>
              )}

              <button 
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }} 
                className="w-full text-left py-2 px-3 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout ({currentUser.fullName})</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-full bg-brand-pink text-white font-bold text-sm shadow-lg shadow-brand-pink/20 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Portal Login</span>
            </button>
            )}
          </nav>
          </aside>
        </div>
      )}
    </header>
  );
}
