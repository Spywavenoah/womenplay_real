import React from "react";
import { 
  Send, Users, Mail, Sparkles, CheckCircle2, AlertCircle, Loader2, 
  Eye, FileText, History, RefreshCw, Layers, Check, Megaphone 
} from "lucide-react";
import type { EmailTemplate, BulkBroadcast } from "../types";

export default function AdminBulkMessaging() {
  const [targetAudience, setTargetAudience] = React.useState<"all-members" | "active-members" | "founders" | "attendees" | "custom">("all-members");
  const [customEmailsText, setCustomEmailsText] = React.useState("");
  const [selectedTemplateId, setSelectedTemplateId] = React.useState("bulk-announcement");
  const [emailTemplates, setEmailTemplates] = React.useState<EmailTemplate[]>([]);
  const [subject, setSubject] = React.useState("[WomenPlay Announcement] Executive Leadership Summit Update");
  const [announcementTitle, setAnnouncementTitle] = React.useState("Official Network Update & Summit Registrations");
  const [messageContent, setMessageContent] = React.useState(
    "We are delighted to announce our upcoming Executive Leadership Summit. Keynote speakers and breakout sessions are now live on the portal. Please log in to confirm your delegate passes."
  );

  const [recipientsCount, setRecipientsCount] = React.useState<number>(0);
  const [recipientsList, setRecipientsList] = React.useState<{ name: string; email: string }[]>([]);
  const [loadingRecipients, setLoadingRecipients] = React.useState(false);

  const [isSending, setIsSending] = React.useState(false);
  const [sendSuccessMsg, setSendSuccessMsg] = React.useState<string | null>(null);
  const [sendErrorMsg, setSendErrorMsg] = React.useState<string | null>(null);

  const [broadcastHistory, setBroadcastHistory] = React.useState<BulkBroadcast[]>([]);
  const [loadingHistory, setLoadingHistory] = React.useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  // Fetch Templates & History
  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/email-templates");
      if (res.ok) {
        const data: EmailTemplate[] = await res.json();
        setEmailTemplates(data);
      }
    } catch (err) {
      console.error("Failed to load email templates:", err);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/bulk-messages/history");
      if (res.ok) {
        const data = await res.json();
        setBroadcastHistory(data);
      }
    } catch (err) {
      console.error("Failed to load broadcast history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  React.useEffect(() => {
    fetchTemplates();
    fetchHistory();
  }, []);

  // Fetch Recipient Preview Count
  const updateRecipientsPreview = async () => {
    setLoadingRecipients(true);
    try {
      const res = await fetch("/api/bulk-messages/preview-recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetAudience,
          customEmails: customEmailsText
            .split(/[\n,;]+/)
            .map(e => e.trim())
            .filter(Boolean)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRecipientsCount(data.count || 0);
        setRecipientsList(data.sampleRecipients || []);
      }
    } catch (err) {
      console.error("Failed to preview recipients:", err);
    } finally {
      setLoadingRecipients(false);
    }
  };

  React.useEffect(() => {
    updateRecipientsPreview();
  }, [targetAudience, customEmailsText]);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = emailTemplates.find(t => t.id === id);
    if (tmpl) {
      setSubject(tmpl.subject.replace("{{announcementTitle}}", announcementTitle).replace("{{newsletterTitle}}", announcementTitle));
    }
  };

  const handleSendBulkBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recipientsCount === 0) {
      alert("No recipients selected for this broadcast. Please check your target audience filter.");
      return;
    }

    const confirmed = confirm(`Are you sure you want to dispatch this bulk message to ${recipientsCount} recipient(s)?`);
    if (!confirmed) return;

    setIsSending(true);
    setSendSuccessMsg(null);
    setSendErrorMsg(null);

    try {
      const res = await fetch("/api/bulk-messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetAudience,
          customEmails: customEmailsText
            .split(/[\n,;]+/)
            .map(e => e.trim())
            .filter(Boolean),
          templateId: selectedTemplateId,
          subject,
          announcementTitle,
          messageContent
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSendSuccessMsg(`Successfully dispatched broadcast to ${data.count} recipient(s)!`);
        fetchHistory();
        setTimeout(() => setSendSuccessMsg(null), 6000);
      } else {
        setSendErrorMsg(data.error || "Failed to send bulk message broadcast.");
      }
    } catch (err) {
      console.error(err);
      setSendErrorMsg("Network error transmitting bulk message broadcast.");
    } finally {
      setIsSending(false);
    }
  };

  // Render HTML preview with sample recipient
  const renderSamplePreviewHtml = () => {
    const sampleRecipient = recipientsList[0] || { name: "Lady Eleanor Vance", email: "e.vance@womenplay.org" };
    const tmpl = emailTemplates.find(t => t.id === selectedTemplateId);
    
    if (!tmpl) {
      return `<div style="padding: 20px; font-family: sans-serif;">
        <h3>${subject}</h3>
        <p>Dear ${sampleRecipient.name},</p>
        <p>${messageContent.replace(/\n/g, '<br/>')}</p>
      </div>`;
    }

    let html = tmpl.bodyHtml;
    const replacements: Record<string, string> = {
      recipientName: sampleRecipient.name,
      recipientEmail: sampleRecipient.email,
      userName: sampleRecipient.name,
      userEmail: sampleRecipient.email,
      announcementTitle: announcementTitle,
      newsletterTitle: announcementTitle,
      messageContent: messageContent.replace(/\n/g, '<br/>'),
      appUrl: window.location.origin
    };

    Object.entries(replacements).forEach(([key, val]) => {
      const reg = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
      html = html.replace(reg, val || '');
    });

    return html;
  };

  return (
    <div className="space-y-8 text-left animate-fadeIn" id="admin-bulk-messaging-view">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-brand-pink/10 text-brand-pink">
              <Megaphone className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-display font-extrabold text-slate-900">
              Bulk Email Broadcast & Messaging Center
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch official announcements, community newsletters, and event updates to specific member groups or email lists.
          </p>
        </div>

        <button
          onClick={() => setIsPreviewOpen(true)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Eye className="w-4 h-4 text-brand-pink" />
          <span>Preview Email Render</span>
        </button>
      </div>

      {/* Main Composer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Target Audience & Template Settings */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Target Audience Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-pink" />
              <span>1. Target Recipient Group</span>
            </h3>

            <div className="space-y-2 text-xs font-semibold">
              <label
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  targetAudience === "all-members" ? "border-brand-pink bg-brand-pink/5 text-slate-900" : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="audience"
                    checked={targetAudience === "all-members"}
                    onChange={() => setTargetAudience("all-members")}
                    className="accent-brand-pink"
                  />
                  <span>All Registered Members</span>
                </div>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">Entire Database</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  targetAudience === "active-members" ? "border-brand-pink bg-brand-pink/5 text-slate-900" : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="audience"
                    checked={targetAudience === "active-members"}
                    onChange={() => setTargetAudience("active-members")}
                    className="accent-brand-pink"
                  />
                  <span>Active / Approved Members</span>
                </div>
                <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full text-emerald-700">Verified</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  targetAudience === "founders" ? "border-brand-pink bg-brand-pink/5 text-slate-900" : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="audience"
                    checked={targetAudience === "founders"}
                    onChange={() => setTargetAudience("founders")}
                    className="accent-brand-pink"
                  />
                  <span>Founding Circle & C-Suite</span>
                </div>
                <span className="text-[10px] bg-brand-gold/20 px-2 py-0.5 rounded-full text-brand-gold-dark">Executives</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  targetAudience === "attendees" ? "border-brand-pink bg-brand-pink/5 text-slate-900" : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="audience"
                    checked={targetAudience === "attendees"}
                    onChange={() => setTargetAudience("attendees")}
                    className="accent-brand-pink"
                  />
                  <span>Registered Event Attendees</span>
                </div>
                <span className="text-[10px] bg-sky-100 px-2 py-0.5 rounded-full text-sky-700">Events</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  targetAudience === "custom" ? "border-brand-pink bg-brand-pink/5 text-slate-900" : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="audience"
                    checked={targetAudience === "custom"}
                    onChange={() => setTargetAudience("custom")}
                    className="accent-brand-pink"
                  />
                  <span>Custom Email List</span>
                </div>
                <span className="text-[10px] bg-purple-100 px-2 py-0.5 rounded-full text-purple-700">Manual</span>
              </label>
            </div>

            {targetAudience === "custom" && (
              <div className="pt-2 space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Comma / Line-separated Emails</label>
                <textarea
                  rows={4}
                  placeholder="e.g. sarah@acme.com, vip@investor.org, founder@womenplay.org"
                  value={customEmailsText}
                  onChange={e => setCustomEmailsText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:bg-white focus:outline-none"
                />
              </div>
            )}

            {/* Recipient Count Summary */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Selected Recipients</p>
                <p className="text-lg font-extrabold text-slate-900">
                  {loadingRecipients ? <Loader2 className="w-4 h-4 animate-spin inline text-brand-pink" /> : `${recipientsCount} Email(s)`}
                </p>
              </div>
              <button
                type="button"
                onClick={updateRecipientsPreview}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg border border-slate-200 bg-white"
                title="Refresh count"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Recipient Sample Names */}
            {recipientsList.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400">Sample Target Recipients</p>
                <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] text-slate-600">
                  {recipientsList.slice(0, 5).map((r, i) => (
                    <div key={i} className="flex justify-between items-center py-0.5 border-b border-slate-100">
                      <span className="font-medium truncate max-w-[120px]">{r.name}</span>
                      <span className="text-slate-400 text-[10px] truncate max-w-[130px]">{r.email}</span>
                    </div>
                  ))}
                  {recipientsCount > 5 && (
                    <p className="text-[10px] text-slate-400 pt-1 italic">+ {recipientsCount - 5} more recipient(s)</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mailing Template Selection Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow space-y-4">
            <h3 className="text-xs font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-pink" />
              <span>2. Choose Mailing Template</span>
            </h3>

            <div className="space-y-2">
              <select
                value={selectedTemplateId}
                onChange={e => handleSelectTemplate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none"
              >
                {emailTemplates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Selected template formats the message with executive header banners, action buttons, and WomenPlay Secretariat footers.
            </p>
          </div>
        </div>

        {/* Right Col: Message Content & Dispatch Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSendBulkBroadcast} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 luxury-shadow space-y-5">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h3 className="text-xs font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-pink" />
                <span>3. Compose Message Content</span>
              </h3>
              <span className="text-[10px] bg-brand-pink/10 text-brand-pink font-extrabold px-2.5 py-0.5 rounded-full">
                HTML & Variable Ready
              </span>
            </div>

            {/* Notification Messages */}
            {sendSuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{sendSuccessMsg}</span>
              </div>
            )}

            {sendErrorMsg && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{sendErrorMsg}</span>
              </div>
            )}

            {/* Subject Field */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Email Subject Line</label>
              <input
                type="text"
                required
                placeholder="E.g. [WomenPlay Announcement] Executive Leadership Summit Details"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-brand-pink outline-none transition"
              />
            </div>

            {/* Headline / Title Field */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Broadcast Banner Headline / Title</label>
              <input
                type="text"
                required
                placeholder="E.g. Official Network Update & Summit Registrations"
                value={announcementTitle}
                onChange={e => setAnnouncementTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-brand-pink outline-none transition"
              />
            </div>

            {/* Main Message Body */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold text-slate-400">Message Content Body</label>
                <span className="text-[10px] text-slate-400">Supports linebreaks and variables: &#123;&#123;recipientName&#125;&#125;</span>
              </div>
              <textarea
                rows={8}
                required
                placeholder="Write your official broadcast message or newsletter update here..."
                value={messageContent}
                onChange={e => setMessageContent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed font-medium text-slate-800 focus:bg-white focus:border-brand-pink outline-none transition"
              />
            </div>

            {/* Dispatch Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold-dark" />
                <span>Ready to dispatch to <strong>{recipientsCount}</strong> verified email inbox(es).</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Preview Layout
                </button>
                <button
                  type="submit"
                  disabled={isSending || recipientsCount === 0}
                  className="px-6 py-2.5 rounded-xl bg-brand-pink hover:bg-brand-pink-dark disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-brand-pink/20 transition flex items-center space-x-2 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Broadcast...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Bulk Message ({recipientsCount})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-xs font-extrabold uppercase text-slate-800 tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-brand-pink" />
            <span>Sent Bulk Message Broadcast History</span>
          </h3>
          <button
            onClick={fetchHistory}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
            title="Refresh history"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {loadingHistory ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-pink" />
            <span>Loading broadcast history...</span>
          </div>
        ) : broadcastHistory.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No previous bulk broadcasts logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-150">
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Target Group</th>
                  <th className="py-2.5 px-3">Recipients</th>
                  <th className="py-2.5 px-3">Sender</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {broadcastHistory.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 whitespace-nowrap text-[11px]">
                      {new Date(b.sentAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 max-w-xs truncate">
                      {b.subject}
                    </td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-slate-500">
                      {b.targetAudience}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {b.recipientCount} emails
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {b.sentBy}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live Email Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden luxury-shadow animate-fade-in flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-brand-pink" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Live Email Layout Render
                </h3>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-100 flex-1">
              <div 
                className="bg-white p-4 rounded-xl shadow border border-slate-200 max-w-xl mx-auto"
                dangerouslySetInnerHTML={{ __html: renderSamplePreviewHtml() }}
              />
            </div>

            <div className="p-4 border-t border-slate-100 text-right bg-white">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
