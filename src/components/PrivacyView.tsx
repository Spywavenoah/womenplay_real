import React from "react";
import { ShieldCheck, Lock, Eye, FileText, UserCheck, Mail, CheckCircle2 } from "lucide-react";
import HeroBanner from "./HeroBanner";

interface PrivacyViewProps {
  onNavigateHome: () => void;
}

export default function PrivacyView({ onNavigateHome }: PrivacyViewProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-left" id="privacy-policy-view">
      {/* Hero Banner */}
      <HeroBanner
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Data Protection Standard
          </span>
        }
        title="Data Privacy Protocol"
        description={
          <>
            At WomenPlay Executive Network, we enforce rigorous cryptographic data protection, non-disclosure compliance, and absolute privacy for all executive members, board candidates, and summit delegates.
            <br />
            <span className="text-xs text-slate-400 font-mono block mt-2">
              Last Revised: July 2026 • Global Secretariat Compliance Office
            </span>
          </>
        }
        onNavigateHome={onNavigateHome}
      />

      <div className="max-w-4xl mx-auto space-y-10 py-12 px-6 md:px-12">

        {/* Content Cards */}
        <div className="space-y-8 bg-white p-8 md:p-12 rounded-3xl border border-slate-100 luxury-shadow">
          
          {/* Section 1 */}
          <section className="space-y-3" id="privacy-section-1">
            <div className="flex items-center space-x-3 text-slate-900 font-bold text-lg">
              <div className="p-2 rounded-xl bg-brand-pink/10 text-brand-pink">
                <Lock className="w-5 h-5" />
              </div>
              <h2>1. Information We Collect</h2>
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed pl-11">
              WomenPlay collects executive profile information required for board matching, summit credentialing, and network verification. This includes:
            </p>
            <ul className="pl-16 text-xs md:text-sm text-slate-600 space-y-2 list-disc">
              <li>Full Name, Corporate Email Address, Title, and Corporate Affiliation.</li>
              <li>Executive Biography, LinkedIn Credentials, and Board Readiness Certifications.</li>
              <li>Summit registrations, attendance check-in QR hashes, and transaction billing history.</li>
              <li>Peer networking connections and concierge support logs.</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* Section 2 */}
          <section className="space-y-3" id="privacy-section-2">
            <div className="flex items-center space-x-3 text-slate-900 font-bold text-lg">
              <div className="p-2 rounded-xl bg-brand-gold/10 text-brand-gold-dark">
                <Eye className="w-5 h-5" />
              </div>
              <h2>2. How We Protect & Use Your Data</h2>
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed pl-11">
              Your data is stored within encrypted cloud infrastructure. We never sell, monetize, or publicly disclose executive contact information to third-party brokers. Data is processed strictly for:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-11 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <p className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Executive Matchmaking</span>
                </p>
                <p className="text-[11px] text-slate-500">Connecting fellowship candidates with board seats and corporate sponsors.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <p className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Summit Access Control</span>
                </p>
                <p className="text-[11px] text-slate-500">Generating encrypted QR badges for VIP reception entry and badge scanning.</p>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 3 */}
          <section className="space-y-3" id="privacy-section-3">
            <div className="flex items-center space-x-3 text-slate-900 font-bold text-lg">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2>3. Member Privacy Controls & Granular Visibility</h2>
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed pl-11">
              Each member retains full ownership of their directory visibility. Within the Member Portal, you may configure whether your contact card is discoverable across the global directory, visible only to verified chapter members, or strictly confidential to executive administrators.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* Section 4 */}
          <section className="space-y-3" id="privacy-section-4">
            <div className="flex items-center space-x-3 text-slate-900 font-bold text-lg">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <h2>4. Data Erasure & Export Rights</h2>
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed pl-11">
              In accordance with international data protection mandates (GDPR & CCPA), executive members may request a complete export of their profile data or invoke the "Right to be Forgotten" by contacting our Secretariat Privacy Desk at <span className="font-semibold text-slate-800">privacy@womenplay.org</span>.
            </p>
          </section>

          {/* Contact Box */}
          <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Data Protection Secretariat</h3>
              <p className="text-xs text-slate-400">Questions regarding data compliance or executive non-disclosure?</p>
            </div>
            <a
              href="mailto:privacy@womenplay.org"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-pink text-white text-xs font-bold hover:bg-brand-pink-dark transition shadow"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Privacy Officer</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
