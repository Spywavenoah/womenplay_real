import React from "react";
import { Linkedin, Twitter, Instagram } from "lucide-react";
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
              className="h-12 w-auto object-contain filter drop-shadow-md cursor-pointer"
              onClick={() => onNavigate("home")}
            />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Because life is better when… Women can play too! Private venue experiences where every woman gets her spotlight moment. No judgment — just laughter, singing, and shared joy.
          </p>
          {/* Social Media Connections */}
          <div className="flex items-center space-x-3 pt-2">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-gradient-to-tr hover:from-brand-pink hover:to-brand-gold transition-all duration-300 shadow-md hover:shadow-brand-pink/20"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-gradient-to-tr hover:from-brand-pink hover:to-brand-gold transition-all duration-300 shadow-md hover:shadow-brand-pink/20"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-gradient-to-tr hover:from-brand-pink hover:to-brand-gold transition-all duration-300 shadow-md hover:shadow-brand-pink/20"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-slate-200 uppercase tracking-widest text-[10px]">Explore WomenPlay</h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <a href={VIEW_PATHS.home} onClick={(e) => { e.preventDefault(); onNavigate("home"); }} className="hover:text-brand-pink transition cursor-pointer">Home</a>
            </li>
            <li>
              <a href={VIEW_PATHS.profile} onClick={(e) => { e.preventDefault(); onNavigate("profile"); }} className="hover:text-brand-pink transition cursor-pointer">About WomenPlay</a>
            </li>
            <li>
              <a href={VIEW_PATHS.events} onClick={(e) => { e.preventDefault(); onNavigate("events"); }} className="hover:text-brand-pink transition cursor-pointer">Events & Gatherings</a>
            </li>
            <li>
              <a href={VIEW_PATHS.founders} onClick={(e) => { e.preventDefault(); onNavigate("founders"); }} className="hover:text-brand-pink transition cursor-pointer">Founding Circle</a>
            </li>
            <li>
              <a href={VIEW_PATHS.gallery} onClick={(e) => { e.preventDefault(); onNavigate("gallery"); }} className="hover:text-brand-pink transition cursor-pointer">Media Gallery</a>
            </li>
            <li>
              <a href={VIEW_PATHS.whychooseus} onClick={(e) => { e.preventDefault(); onNavigate("whychooseus"); }} className="hover:text-brand-pink transition cursor-pointer">Why Choose Us</a>
            </li>
          </ul>
        </div>

        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-slate-200 uppercase tracking-widest text-[10px]">Experience & Access</h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <a href={VIEW_PATHS.events} onClick={(e) => { e.preventDefault(); onNavigate("events"); }} className="hover:text-brand-pink transition cursor-pointer">Jersey Launch Experience</a>
            </li>
            <li>
              <a href={VIEW_PATHS.tickets} onClick={(e) => { e.preventDefault(); onNavigate("tickets"); }} className="hover:text-brand-pink transition cursor-pointer">Tickets & Passes</a>
            </li>
            <li>
              <a href={VIEW_PATHS.sponsorship} onClick={(e) => { e.preventDefault(); onNavigate("sponsorship"); }} className="hover:text-brand-pink transition cursor-pointer">Sponsorship & Partnerships</a>
            </li>
            <li>
              <a href={VIEW_PATHS.founders} onClick={(e) => { e.preventDefault(); onNavigate("founders"); }} className="hover:text-brand-pink transition cursor-pointer">Founding Circle</a>
            </li>
            <li>
              <a href={VIEW_PATHS.volunteer} onClick={(e) => { e.preventDefault(); onNavigate("volunteer"); }} className="hover:text-brand-pink transition cursor-pointer">Volunteer Opportunities</a>
            </li>
            <li>
              <a href={VIEW_PATHS.faq} onClick={(e) => { e.preventDefault(); onNavigate("faq"); }} className="hover:text-brand-pink transition cursor-pointer">Frequently Asked Questions</a>
            </li>
          </ul>
        </div>

        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-slate-200 uppercase tracking-widest text-[10px]">Support & Inquiries</h4>
          <p className="text-slate-400 leading-relaxed">
            WomenPlay Community Support<br />
            British Columbia, Canada<br />
            <a href="mailto:womenplay.org@gmail.com" className="text-brand-pink hover:underline font-semibold">womenplay.org@gmail.com</a>
          </p>
          <a
            href={VIEW_PATHS.contact}
            onClick={(e) => { e.preventDefault(); onNavigate("contact"); }}
            className="text-xs text-brand-gold hover:text-white transition font-bold underline cursor-pointer mt-3 block"
          >
            Contact Team →
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-[11px] text-slate-500 gap-4">
        <p>© 2026 WomenPlay. Because life is better when… Women can play too! All Rights Reserved.</p>
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
            Data Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
