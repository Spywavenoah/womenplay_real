import React from "react";
import { Scale, ShieldCheck, FileText, AlertCircle, CheckCircle2, Award } from "lucide-react";
import HeroBanner from "./HeroBanner";

interface TermsViewProps {
  onNavigateHome: () => void;
}

export default function TermsView({ onNavigateHome }: TermsViewProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-left" id="terms-conditions-view">
      {/* Hero Banner */}
      <HeroBanner
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Network Legal Governance
          </span>
        }
        title="Terms & Conditions"
        description={
          <>
            Governing agreement, membership charter, summit admittance regulations, and code of conduct for all members, delegates, and corporate sponsors of WomenPlay Executive Network.
            <br />
            <span className="text-xs text-slate-400 font-mono block mt-2">
              Effective Date: January 1, 2026 • Executive Secretariat Counsel
            </span>
          </>
        }
        onNavigateHome={onNavigateHome}
      />

      <div className="max-w-4xl mx-auto space-y-10 py-12 px-6 md:px-12">

        {/* Content Body */}
        <div className="space-y-8 bg-white p-8 md:p-12 rounded-3xl border border-slate-100 luxury-shadow">
          
          {/* Section 1 */}
          <section className="space-y-3" id="terms-section-1">
            <div className="flex items-center space-x-3 text-slate-900 font-bold text-lg">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
                <Award className="w-5 h-5 text-brand-gold" />
              </div>
              <h2>1. Executive Membership Eligibility & Verification</h2>
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed pl-11">
              Membership within WomenPlay is reserved for executive leaders, corporate directors, founders, and distinguished professionals. The Secretariat reserves the right to audit credentials and revoke memberships that fail to align with network standards.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* Section 2 */}
          <section className="space-y-3" id="terms-section-2">
            <div className="flex items-center space-x-3 text-slate-900 font-bold text-lg">
              <div className="p-2 rounded-xl bg-brand-pink/10 text-brand-pink">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2>2. Code of Conduct & Confidentiality</h2>
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed pl-11">
              All member communications, board candidacy referrals, and private networking discussions occurring at WomenPlay summits or within the digital portal are governed by strict executive confidentiality (Chatham House Rule).
            </p>
            <ul className="pl-16 text-xs md:text-sm text-slate-600 space-y-2 list-disc">
              <li>Unsolicited commercial spam or predatory solicitation is strictly prohibited.</li>
              <li>Respectful, inclusive, and professional conduct is required at all times.</li>
              <li>Breaches of confidentiality may result in immediate revocation of membership without refund.</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          {/* Section 3 */}
          <section className="space-y-3" id="terms-section-3">
            <div className="flex items-center space-x-3 text-slate-900 font-bold text-lg">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <FileText className="w-5 h-5" />
              </div>
              <h2>3. Summit Registrations, Passes & Refunds</h2>
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed pl-11">
              Event registrations, seat allocations, and VIP packages secured via WomenPlay are verified by encrypted badge hashes. Attendance passes may be transferred to accredited colleagues up to 72 hours prior to the event by contacting concierge support.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* Section 4 */}
          <section className="space-y-3" id="terms-section-4">
            <div className="flex items-center space-x-3 text-slate-900 font-bold text-lg">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h2>4. Intellectual Property & Brand Emblem</h2>
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed pl-11">
              The WomenPlay trademark, emblem, digital badge assets, and fellowship curriculum materials are proprietary assets protected by global copyright and trademark laws. Unauthorized replication or commercial misuse is prohibited.
            </p>
          </section>

          {/* Governance Footer note */}
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 space-y-2">
            <p className="font-bold text-slate-800">Governing Jurisdiction</p>
            <p>
              These terms are governed by and construed in accordance with the laws of San Francisco, CA & London, UK. For legal inquiries, contact <span className="font-semibold text-slate-700">legal@womenplay.org</span>.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
