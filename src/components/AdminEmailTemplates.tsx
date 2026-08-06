import React from "react";
import { 
  FileCode, RotateCcw, CheckCircle, Loader2, Mail, Sparkles, 
  FileText, Copy, Code2, Eye, Send, X 
} from "lucide-react";
import { EmailTemplate } from "../types";

export default function AdminEmailTemplates() {
  const [emailTemplates, setEmailTemplates] = React.useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("registration-confirmation");
  const [templateSubject, setTemplateSubject] = React.useState("");
  const [templateBodyHtml, setTemplateBodyHtml] = React.useState("");
  const [loadingTemplates, setLoadingTemplates] = React.useState(false);
  const [savingTemplate, setSavingTemplate] = React.useState(false);
  const [templateSavedMsg, setTemplateSavedMsg] = React.useState("");
  const [templateTestEmail, setTemplateTestEmail] = React.useState("");
  const [sendingTemplateTest, setSendingTemplateTest] = React.useState(false);
  const [templateTestResult, setTemplateTestResult] = React.useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [templatePreviewMode, setTemplatePreviewMode] = React.useState<"editor" | "preview">("editor");
  const [copiedVar, setCopiedVar] = React.useState<string | null>(null);

  const loadEmailTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch("/api/email-templates");
      if (res.ok) {
        const data: EmailTemplate[] = await res.json();
        setEmailTemplates(data);
        const current = data.find(t => t.id === selectedTemplateId) || data[0];
        if (current) {
          setSelectedTemplateId(current.id);
          setTemplateSubject(current.subject);
          setTemplateBodyHtml(current.bodyHtml);
        }
      }
    } catch (err) {
      console.error("Failed to fetch email templates:", err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  React.useEffect(() => { loadEmailTemplates(); }, []);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = emailTemplates.find(t => t.id === id);
    if (tmpl) {
      setTemplateSubject(tmpl.subject);
      setTemplateBodyHtml(tmpl.bodyHtml);
    }
    setTemplateSavedMsg("");
    setTemplateTestResult(null);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTemplate(true);
    setTemplateSavedMsg("");
    try {
      const res = await fetch(`/api/email-templates/${selectedTemplateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: templateSubject, bodyHtml: templateBodyHtml })
      });
      const data = await res.json();
      if (res.ok) {
        setTemplateSavedMsg(data.message || "Template saved successfully!");
        loadEmailTemplates();
        setTimeout(() => setTemplateSavedMsg(""), 4000);
      } else {
        alert(data.error || "Failed to save template.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error saving email template.");
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleResetTemplate = async () => {
    if (!confirm("Are you sure you want to reset this email template back to the default system layout?")) return;
    try {
      const res = await fetch(`/api/email-templates/${selectedTemplateId}/reset`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.template) {
        setTemplateSubject(data.template.subject);
        setTemplateBodyHtml(data.template.bodyHtml);
        setTemplateSavedMsg("Template reset to system default!");
        loadEmailTemplates();
        setTimeout(() => setTemplateSavedMsg(""), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendTemplateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingTemplateTest(true);
    setTemplateTestResult(null);
    try {
      const res = await fetch(`/api/email-templates/${selectedTemplateId}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail: templateTestEmail })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTemplateTestResult({ success: true, message: data.message });
      } else {
        setTemplateTestResult({ success: false, error: data.error || "Failed to dispatch test template email." });
      }
    } catch (err: any) {
      setTemplateTestResult({ success: false, error: "Network error sending test template." });
    } finally {
      setSendingTemplateTest(false);
    }
  };

  const copyVariableToClipboard = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedVar(tag);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  return (
    <div className="space-y-8" id="admin-email-templates-view">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-display font-extrabold text-slate-900 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-brand-pink" />
              <span>Transactional Email Templates Editor</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Customize the subject lines, layout, and HTML formatting of automated transactional emails dispatched using your saved cPanel SMTP credentials.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleResetTemplate} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer" title="Reset selected template to system default">
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset to Default</span>
            </button>
            <button type="button" onClick={() => handleSaveTemplate({ preventDefault: () => {} } as React.FormEvent)} disabled={savingTemplate} className="px-4 py-1.5 rounded-lg bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm">
              {savingTemplate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {templateSavedMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{templateSavedMsg}</span>
          </div>
        )}

        {loadingTemplates ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-pink" />
            <span className="text-xs font-medium">Loading transactional templates...</span>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Template Selection */}
            <div className="space-y-3 lg:col-span-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>System Templates ({emailTemplates.length})</span>
              </h3>
              <div className="space-y-2">
                {emailTemplates.map((tmpl) => {
                  const isSelected = tmpl.id === selectedTemplateId;
                  return (
                    <div key={tmpl.id} onClick={() => handleSelectTemplate(tmpl.id)} className={`p-4 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between space-y-2 ${isSelected ? "bg-brand-pink-light/20 border-brand-pink shadow-xs" : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900 text-xs leading-snug">{tmpl.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase shrink-0 ${tmpl.category === "Onboarding" ? "bg-purple-100 text-purple-700" : tmpl.category === "Events" ? "bg-amber-100 text-amber-800" : tmpl.category === "Customer Service" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-800"}`}>
                          {tmpl.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 italic font-mono">{tmpl.subject}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100/80">
                        <span>Vars: {tmpl.variables ? tmpl.variables.length : 0}</span>
                        <span>Updated: {tmpl.updatedAt ? new Date(tmpl.updatedAt).toLocaleDateString() : 'Default'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-2 mt-4">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
                  <span>SMTP Synchronization</span>
                </div>
                <p className="leading-relaxed">All templates edited here are rendered on the fly and dispatched through your configured SMTP server when relevant events occur.</p>
              </div>
            </div>

            {/* Right Column: Editor */}
            <div className="lg:col-span-2 space-y-5 text-left">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-brand-pink" />
                    <span>Email Subject Line</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Supports template variables</span>
                </div>
                <input type="text" required value={templateSubject} onChange={(e) => setTemplateSubject(e.target.value)} placeholder="e.g. Welcome to WomenPlay Executive Network, {{userName}}!" className="w-full bg-white border border-slate-200 p-2.5 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-pink" />

                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Insertable Variables (Click to copy):</span>
                    {copiedVar && <span className="text-[10px] text-emerald-600 font-bold">Copied {copiedVar}!</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(emailTemplates.find(t => t.id === selectedTemplateId)?.variables || [
                      "{{userName}}", "{{userEmail}}", "{{recipientName}}", "{{recipientEmail}}", "{{announcementTitle}}", "{{newsletterTitle}}", "{{messageContent}}", "{{membershipTier}}", "{{eventName}}", "{{eventDate}}", "{{eventLocation}}", "{{ticketCode}}", "{{ticketPackage}}", "{{ticketPrice}}", "{{inquirySubject}}", "{{inquiryMessage}}", "{{ticketId}}", "{{ticketCategory}}", "{{ticketSubject}}", "{{ticketDetails}}", "{{appUrl}}"
                    ]).map((v) => (
                      <button key={v} type="button" onClick={() => copyVariableToClipboard(v)} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-mono hover:border-brand-pink hover:text-brand-pink transition cursor-pointer flex items-center gap-1 shadow-2xs" title="Click to copy variable tag">
                        <Copy className="w-2.5 h-2.5 text-slate-400" />
                        <span>{v}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center space-x-2">
                  <button type="button" onClick={() => setTemplatePreviewMode("editor")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${templatePreviewMode === "editor" ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    <Code2 className="w-3.5 h-3.5" />
                    <span>HTML Template Code</span>
                  </button>
                  <button type="button" onClick={() => setTemplatePreviewMode("preview")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${templatePreviewMode === "preview" ? "bg-brand-pink text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Email Preview</span>
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 hidden sm:inline">{templatePreviewMode === "editor" ? "Direct HTML / Inline CSS Styling" : "Sample Live Rendering"}</span>
              </div>

              {templatePreviewMode === "editor" ? (
                <div className="space-y-2">
                  <textarea rows={16} value={templateBodyHtml} onChange={(e) => setTemplateBodyHtml(e.target.value)} className="w-full bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-pink leading-relaxed" placeholder="Enter HTML template markup here..." />
                  <p className="text-[10px] text-slate-400 italic">Tip: Keep CSS styles inline (e.g., style="color: #9d174d; font-family: Arial;") for maximum client compatibility across Gmail, Outlook, and Apple Mail.</p>
                </div>
              ) : (
                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 mb-3 text-xs text-slate-600 space-y-1">
                    <p><strong>From:</strong> WomenPlay Secretariat &lt;notifications@womenplay.org&gt;</p>
                    <p><strong>Subject:</strong> {templateSubject.replace(/\{\{\s*userName\s*\}\}/gi, "Lady Eleanor Vance").replace(/\{\{\s*eventName\s*\}\}/gi, "Annual Leadership Summit").replace(/\{\{\s*ticketCode\s*\}\}/gi, "BADGE-VIP-8892")}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 overflow-x-auto shadow-xs" dangerouslySetInnerHTML={{
                    __html: templateBodyHtml
                      .replace(/\{\{\s*userName\s*\}\}/gi, "Lady Eleanor Vance")
                      .replace(/\{\{\s*userEmail\s*\}\}/gi, templateTestEmail || "e.vance@womenplay.org")
                      .replace(/\{\{\s*recipientName\s*\}\}/gi, "Lady Eleanor Vance")
                      .replace(/\{\{\s*recipientEmail\s*\}\}/gi, templateTestEmail || "e.vance@womenplay.org")
                      .replace(/\{\{\s*announcementTitle\s*\}\}/gi, "Q3 Executive Leadership Summit & Masterclass")
                      .replace(/\{\{\s*newsletterTitle\s*\}\}/gi, "WomenPlay Boardroom Governance Newsletter")
                      .replace(/\{\{\s*messageContent\s*\}\}/gi, "We are delighted to invite all accredited WomenPlay executive members to our upcoming Q3 summit...")
                      .replace(/\{\{\s*membershipTier\s*\}\}/gi, "Elite Boardroom Sponsor")
                      .replace(/\{\{\s*eventName\s*\}\}/gi, "Aura Annual Women in Leadership Summit 2026")
                      .replace(/\{\{\s*eventDate\s*\}\}/gi, "2026-09-15 (09:00 AM - 05:00 PM)")
                      .replace(/\{\{\s*eventLocation\s*\}\}/gi, "Grand Ballroom, The Plaza Hotel")
                      .replace(/\{\{\s*ticketCode\s*\}\}/gi, "BADGE-VIP-8892")
                      .replace(/\{\{\s*ticketPackage\s*\}\}/gi, "VIP Gold Badge Pass")
                      .replace(/\{\{\s*ticketPrice\s*\}\}/gi, "350")
                      .replace(/\{\{\s*inquirySubject\s*\}\}/gi, "Corporate Sponsorship Request")
                      .replace(/\{\{\s*inquiryMessage\s*\}\}/gi, "We would like to partner for the upcoming Q3 Leadership Summit.")
                      .replace(/\{\{\s*ticketId\s*\}\}/gi, "contact-98213")
                      .replace(/\{\{\s*ticketCategory\s*\}\}/gi, "VIP Member Concierge")
                      .replace(/\{\{\s*ticketSubject\s*\}\}/gi, "Boardroom Schedule Request")
                      .replace(/\{\{\s*ticketDetails\s*\}\}/gi, "Requesting schedule confirmation for the upcoming Q3 session.")
                      .replace(/\{\{\s*appUrl\s*\}\}/gi, "https://womenplay.org")
                  }} />
                </div>
              )}

              <form onSubmit={handleSendTemplateTest} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-brand-pink" />
                  <span>Transmit Test Template Email</span>
                </h4>
                <p className="text-[11px] text-slate-500">Send a live formatted test email of this template to your inbox using current SMTP settings.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="email" required placeholder="your-email@example.com" value={templateTestEmail} onChange={(e) => setTemplateTestEmail(e.target.value)} className="flex-1 bg-white border border-slate-200 p-2.5 rounded-lg text-xs focus:outline-none focus:border-brand-pink text-slate-800" />
                  <button type="submit" disabled={sendingTemplateTest} className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-2 shrink-0">
                    {sendingTemplateTest ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Dispatching...</span></>
                    ) : (
                      <><Send className="w-3.5 h-3.5" /><span>Send Test Email</span></>
                    )}
                  </button>
                </div>
                {templateTestResult && (
                  <div className={`p-3 rounded-xl border text-xs font-medium ${templateTestResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                    <div className="flex items-start gap-2">
                      {templateTestResult.success ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                      <div>
                        <p className="font-bold">{templateTestResult.success ? "Template Email Delivered!" : "Template Dispatch Failed"}</p>
                        <p className="text-[11px] opacity-90">{templateTestResult.message || templateTestResult.error}</p>
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
