import React from "react";
import { Mail, Loader2, CheckCircle, X, Server, ToggleLeft, Send } from "lucide-react";
import { SmtpSettings } from "../types";

export default function AdminSmtp() {
  const [smtpForm, setSmtpForm] = React.useState<SmtpSettings>({
    host: "mail.womenplay.org",
    port: 465,
    user: "notifications@womenplay.org",
    pass: "",
    secure: true,
    fromEmail: "notifications@womenplay.org",
    fromName: "WomenPlay Secretariat",
    enableAlerts: true,
    alertOnRegistration: true,
    alertOnEventBooking: true,
    alertOnContactInquiry: true,
    alertOnSupportTicket: true
  });
  const [loadingSmtp, setLoadingSmtp] = React.useState(false);
  const [savingSmtp, setSavingSmtp] = React.useState(false);
  const [smtpSavedMsg, setSmtpSavedMsg] = React.useState("");
  const [smtpTestEmail, setSmtpTestEmail] = React.useState("");
  const [testingSmtp, setTestingSmtp] = React.useState(false);
  const [smtpTestResult, setSmtpTestResult] = React.useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  const loadSmtpSettings = async () => {
    setLoadingSmtp(true);
    try {
      const res = await fetch("/api/smtp");
      if (res.ok) {
        const data = await res.json();
        setSmtpForm(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSmtp(false);
    }
  };

  React.useEffect(() => { loadSmtpSettings(); }, []);

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSmtp(true);
    setSmtpSavedMsg("");
    try {
      const res = await fetch("/api/smtp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smtpForm)
      });
      const data = await res.json();
      if (res.ok) {
        setSmtpSavedMsg("SMTP settings and alert rules saved successfully!");
        setTimeout(() => setSmtpSavedMsg(""), 4000);
      } else {
        alert(data.error || "Failed to update SMTP settings");
      }
    } catch (err) {
      console.error(err);
      alert("Network error updating SMTP settings");
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleTestSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingSmtp(true);
    setSmtpTestResult(null);
    try {
      const res = await fetch("/api/smtp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...smtpForm, recipientEmail: smtpTestEmail || smtpForm.fromEmail })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSmtpTestResult({ success: true, message: data.message });
      } else {
        setSmtpTestResult({ success: false, error: data.error || "SMTP test failed" });
      }
    } catch (err: any) {
      setSmtpTestResult({ success: false, error: "Network error testing SMTP server" });
    } finally {
      setTestingSmtp(false);
    }
  };

  return (
    <div className="space-y-8" id="admin-smtp-settings-view">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-display font-extrabold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-brand-pink" />
              <span>SMTP Outgoing Server & Automated Alerts</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure your cPanel webmail, SendGrid, Mailgun, or Amazon SES credentials to send outgoing notifications for new member registrations, event ticket purchases, contact form submissions, and concierge support tickets.
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${smtpForm.enableAlerts ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>
            {smtpForm.enableAlerts ? "● Outgoing Alerts Active" : "○ Alerts Paused"}
          </span>
        </div>

        {smtpSavedMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{smtpSavedMsg}</span>
          </div>
        )}

        {loadingSmtp ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-pink" />
            <span className="text-xs font-medium">Retrieving SMTP credentials...</span>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <form onSubmit={handleSaveSmtp} className="space-y-4 text-xs text-left">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Server className="w-4 h-4 text-slate-600" />
                  <span>SMTP Host Connection</span>
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="font-bold text-slate-600">SMTP Host Server</label>
                    <input type="text" required placeholder="e.g. mail.womenplay.org" value={smtpForm.host} onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })} className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-brand-pink font-mono text-slate-800" />
                    <span className="text-[10px] text-slate-400">cPanel Host: mail.domain.com</span>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">Port</label>
                    <input type="number" required placeholder="465" value={smtpForm.port} onChange={(e) => setSmtpForm({ ...smtpForm, port: parseInt(e.target.value) || 465 })} className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-brand-pink font-mono text-slate-800" />
                    <span className="text-[10px] text-slate-400">465 (SSL) / 587</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">SMTP Account Username</label>
                    <input type="text" placeholder="notifications@womenplay.org" value={smtpForm.user} onChange={(e) => setSmtpForm({ ...smtpForm, user: e.target.value })} className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-brand-pink text-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">SMTP Password</label>
                    <input type="password" placeholder="••••••••••••" value={smtpForm.pass} onChange={(e) => setSmtpForm({ ...smtpForm, pass: e.target.value })} className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-brand-pink text-slate-800" />
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Use SSL / TLS Encryption</span>
                    <span className="text-[10px] text-slate-400">Recommended for cPanel port 465</span>
                  </div>
                  <button type="button" onClick={() => setSmtpForm({ ...smtpForm, secure: !smtpForm.secure })} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${smtpForm.secure ? "bg-brand-pink" : "bg-slate-200"}`}>
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${smtpForm.secure ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-600" />
                  <span>From Sender Identity</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">From Email Address</label>
                    <input type="email" required placeholder="notifications@womenplay.org" value={smtpForm.fromEmail} onChange={(e) => setSmtpForm({ ...smtpForm, fromEmail: e.target.value })} className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-brand-pink text-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">From Display Name</label>
                    <input type="text" required placeholder="WomenPlay Secretariat" value={smtpForm.fromName} onChange={(e) => setSmtpForm({ ...smtpForm, fromName: e.target.value })} className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-brand-pink text-slate-800" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={savingSmtp} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-3.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2">
                {savingSmtp ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving SMTP Configuration...</span></>
                ) : (
                  <span>Save SMTP Settings & Alert Rules</span>
                )}
              </button>
            </form>

            {/* Right Column */}
            <div className="space-y-6 text-xs text-left">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <ToggleLeft className="w-4 h-4 text-slate-600" />
                  <span>Outgoing Alert Trigger Rules</span>
                </h3>

                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-900 block">Master Switch: Enable Outgoing Email Dispatch</span>
                    <span className="text-[10px] text-slate-400">Master control to pause or resume all automated email alerts</span>
                  </div>
                  <button type="button" onClick={() => setSmtpForm({ ...smtpForm, enableAlerts: !smtpForm.enableAlerts })} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${smtpForm.enableAlerts ? "bg-emerald-600" : "bg-slate-200"}`}>
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${smtpForm.enableAlerts ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  {[
                    { key: "alertOnRegistration", label: "Alert on New Member Registration", desc: "Notify admin when executive registers" },
                    { key: "alertOnEventBooking", label: "Alert on Event Ticket Booking", desc: "Notify admin when event ticket is purchased" },
                    { key: "alertOnContactInquiry", label: "Alert on Contact Us Form Submission", desc: "Send immediate email for website inquiries" },
                    { key: "alertOnSupportTicket", label: "Alert on Support Desk Ticket Created", desc: "Notify support team for newly opened tickets" }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">{item.label}</span>
                        <span className="text-[10px] text-slate-400">{item.desc}</span>
                      </div>
                      <button type="button" onClick={() => setSmtpForm({ ...smtpForm, [item.key]: !(smtpForm as any)[item.key] })} className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${(smtpForm as any)[item.key] ? "bg-brand-pink" : "bg-slate-200"}`}>
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${(smtpForm as any)[item.key] ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleTestSmtp} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h3 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Send className="w-4 h-4 text-brand-pink" />
                  <span>SMTP Connection Test</span>
                </h3>
                <p className="text-[11px] text-slate-500">Send a diagnostic test email to verify your cPanel / SMTP credentials, handshake, and authentication.</p>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Test Recipient Email Address</label>
                  <input type="email" placeholder={smtpForm.fromEmail || "your-email@example.com"} value={smtpTestEmail} onChange={(e) => setSmtpTestEmail(e.target.value)} className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-brand-pink text-slate-800" />
                </div>

                <button type="submit" disabled={testingSmtp} className="w-full bg-brand-pink hover:bg-brand-pink-dark text-white font-bold p-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2">
                  {testingSmtp ? (
                    <><Loader2 className="w-4 h-4 animate-spin text-white" /><span>Testing SMTP Connection...</span></>
                  ) : (
                    <><Send className="w-4 h-4" /><span>Transmit Test Email</span></>
                  )}
                </button>

                {smtpTestResult && (
                  <div className={`p-3.5 rounded-xl border text-xs font-medium ${smtpTestResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                    <div className="flex items-start gap-2">
                      {smtpTestResult.success ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                      <div className="space-y-1">
                        <p className="font-bold">{smtpTestResult.success ? "SMTP Validation Successful!" : "SMTP Transmission Failed"}</p>
                        <p className="text-[11px] opacity-90">{smtpTestResult.message || smtpTestResult.error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
