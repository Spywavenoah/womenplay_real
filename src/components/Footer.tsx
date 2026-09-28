import React from "react";
import { Linkedin, Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import type { NavView } from "./Header";
import { VIEW_PATHS } from "../router";

interface FooterProps {
  onNavigate: (view: NavView) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-850 py-12 px-6 md:px-12 text-left" id="womenplay-footer">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <img
              src="/assets/logo.png"
              alt="WomenPlay Logo"
              onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }}
              className="h-16 md:h-20 w-auto object-contain filter drop-shadow-md cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => onNavigate("home")}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-xs text-slate-400 leading-relaxed space-y-2">
            <p>
              WomenPlay creates experiences where every woman gets her spotlight moment. No judgment- just laughter, connection and shared joy.
            </p>
            <p className="text-brand-pink font-medium italic">
              Because life is better when… women can play too!
            </p>
            <p className="font-bold text-slate-300 tracking-wide">
              Play. Connect. Play Again!
            </p>
          </div>
          {/* Social Media Connections */}
          <div className="pt-2">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-300 mb-2.5">
              Connect With Us
            </p>
            <div className="flex items-center flex-wrap gap-2.5">
              <a
                href="https://www.facebook.com/profile.php?id=61591292890238"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] transition-all duration-200 shadow-sm hover:scale-110 cursor-pointer"
                aria-label="Facebook - WomenPlay"
                title="Follow WomenPlay on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/womenplay_org/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:border-transparent transition-all duration-200 shadow-sm hover:scale-110 cursor-pointer"
                aria-label="Instagram - WomenPlay"
                title="Follow WomenPlay on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@womenplay?lang=en"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-black hover:border-slate-600 transition-all duration-200 shadow-sm hover:scale-110 cursor-pointer"
                aria-label="TikTok - WomenPlay"
                title="Follow WomenPlay on TikTok"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 1.603A6.338 6.338 0 0 0 3 15.672a6.335 6.335 0 0 0 6.34 6.328 6.335 6.335 0 0 0 6.34-6.328V9.124a8.17 8.17 0 0 0 4.909 1.623V7.27a4.84 4.84 0 0 1-1-.584z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@WomenPlayOrg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#FF0000] hover:border-[#FF0000] transition-all duration-200 shadow-sm hover:scale-110 cursor-pointer"
                aria-label="YouTube - WomenPlay"
                title="Subscribe to WomenPlay on YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              {/* LinkedIn and Twitter Social Media Buttons (Commented out)
              <a
                href="https://www.linkedin.com/company/womenplay"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#0077B5] hover:border-[#0077B5] transition-all duration-200 shadow-sm hover:scale-110 cursor-pointer"
                aria-label="LinkedIn - WomenPlay"
                title="Follow WomenPlay on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/womenplay"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-black hover:border-slate-600 transition-all duration-200 shadow-sm hover:scale-110 cursor-pointer"
                aria-label="X (formerly Twitter) - WomenPlay"
                title="Follow WomenPlay on X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              */}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-slate-200 uppercase tracking-widest text-[10px]">Explore WomenPlay</h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <a href={VIEW_PATHS.home} onClick={(e) => { e.preventDefault(); onNavigate("home"); }} className="hover:text-brand-pink transition cursor-pointer">Home</a>
            </li>
            <li>
              <a href={VIEW_PATHS.profile} onClick={(e) => { e.preventDefault(); onNavigate("profile"); }} className="hover:text-brand-pink transition cursor-pointer">About Us</a>
            </li>
            <li>
              <a href={VIEW_PATHS.events} onClick={(e) => { e.preventDefault(); onNavigate("events"); }} className="hover:text-brand-pink transition cursor-pointer">Experiences</a>
            </li>
            <li>
              <a href={VIEW_PATHS.gallery} onClick={(e) => { e.preventDefault(); onNavigate("gallery"); }} className="hover:text-brand-pink transition cursor-pointer">Gallery</a>
            </li>
            <li>
              <a href={VIEW_PATHS.whychooseus} onClick={(e) => { e.preventDefault(); onNavigate("whychooseus"); }} className="hover:text-brand-pink transition cursor-pointer">Why Choose WomenPlay</a>
            </li>
            <li>
              <a href={VIEW_PATHS.founders} onClick={(e) => { e.preventDefault(); onNavigate("founders"); }} className="hover:text-brand-pink transition cursor-pointer">Founding Circle</a>
            </li>
          </ul>
        </div>

        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-slate-200 uppercase tracking-widest text-[10px]">Connect & Participate</h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <a href={VIEW_PATHS.tickets} onClick={(e) => { e.preventDefault(); onNavigate("tickets"); }} className="hover:text-brand-pink transition cursor-pointer">Launch Experience</a>
            </li>
            <li>
              <a href={VIEW_PATHS.sponsorship} onClick={(e) => { e.preventDefault(); onNavigate("sponsorship"); }} className="hover:text-brand-pink transition cursor-pointer">Sponsorship & Partnerships</a>
            </li>
            <li>
              <a href={VIEW_PATHS.volunteer} onClick={(e) => { e.preventDefault(); onNavigate("volunteer"); }} className="hover:text-brand-pink transition cursor-pointer">Volunteer Opportunities</a>
            </li>
            <li>
              <a href={VIEW_PATHS.faq} onClick={(e) => { e.preventDefault(); onNavigate("faq"); }} className="hover:text-brand-pink transition cursor-pointer">Frequently Asked Questions</a>
            </li>
            <li>
              <a href={VIEW_PATHS.contact} onClick={(e) => { e.preventDefault(); onNavigate("contact"); }} className="hover:text-brand-pink transition cursor-pointer">Contact Us</a>
            </li>
          </ul>
        </div>

        <div className="space-y-3 text-xs">
          <h4 className="font-bold text-slate-200 uppercase tracking-widest text-[10px]">Support & Inquiries</h4>
          <p className="text-slate-400 leading-relaxed">
            Have a question?<br />
            We’d love to hear from you.
          </p>
          <div className="text-slate-400 space-y-1">
            <p><a href="mailto:hello@womenplay.org" className="text-brand-pink hover:underline font-semibold">hello@womenplay.org</a></p>
            <p>British Columbia, Canada</p>
          </div>
          <a
            href={VIEW_PATHS.contact}
            onClick={(e) => { e.preventDefault(); onNavigate("contact"); }}
            className="inline-flex items-center text-xs text-brand-gold hover:text-white transition font-bold underline cursor-pointer pt-1"
          >
            Contact the WomenPlay Team →
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-[11px] text-slate-500 gap-4">
        <p>© 2026 WomenPlay.Org. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-6">
          <a
            href={VIEW_PATHS.contact}
            onClick={(e) => { e.preventDefault(); onNavigate("contact"); }}
            className="hover:text-brand-pink transition cursor-pointer"
            id="footer-link-contact"
          >
            Contact Us
          </a>
          <a
            href={VIEW_PATHS.sponsorship}
            onClick={(e) => { e.preventDefault(); onNavigate("sponsorship"); }}
            className="hover:text-brand-pink transition cursor-pointer"
            id="footer-link-sponsorship"
          >
            Sponsorship
          </a>
          <a
            href={VIEW_PATHS.volunteer}
            onClick={(e) => { e.preventDefault(); onNavigate("volunteer"); }}
            className="hover:text-brand-pink transition cursor-pointer"
            id="footer-link-volunteer"
          >
            Volunteer
          </a>
          <a
            href={VIEW_PATHS.terms}
            onClick={(e) => { e.preventDefault(); onNavigate("terms"); }}
            className="hover:text-brand-pink transition cursor-pointer"
            id="footer-link-terms"
          >
            Terms & Conditions
          </a>
          <a
            href={VIEW_PATHS.privacy}
            onClick={(e) => { e.preventDefault(); onNavigate("privacy"); }}
            className="hover:text-brand-pink transition cursor-pointer"
            id="footer-link-privacy"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
