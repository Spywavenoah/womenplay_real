import { EmailTemplate } from "./src/types";

// ---------------------------------------------------------------------------
// Email template definitions + pure renderer (no DB / app state).
// Stored/custom templates are passed in by the caller; the provided defaults
// are the fallback and the seed set for the admin template editor.
// ---------------------------------------------------------------------------

export function getDefaultEmailTemplates(): EmailTemplate[] {
  return [
    {
      id: "registration-confirmation",
      name: "Registration Confirmation",
      category: "Onboarding",
      subject: "Welcome to WomenPlay Executive Network, {{userName}}!",
      bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #9d174d; margin: 0; font-size: 24px; font-weight: 800;">WomenPlay Executive Secretariat</h1>
    <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Empowering Female Executives & Founders Globally</p>
  </div>
  <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
  <p style="font-size: 16px; color: #1e293b;">Dear <strong>{{userName}}</strong>,</p>
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">
    Welcome to the <strong>WomenPlay Executive Network</strong>. Your membership account has been successfully initialized and granted <strong>{{membershipTier}}</strong> status.
  </p>
  <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #9d174d; margin: 20px 0;">
    <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569;"><strong>Account Email:</strong> {{userEmail}}</p>
    <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569;"><strong>Membership Tier:</strong> {{membershipTier}}</p>
    <p style="margin: 0; font-size: 13px; color: #475569;"><strong>Tier Benefits:</strong> VIP Executive Salons, Global Directories, & Annual Summit Passes</p>
  </div>
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">
    You can now sign in to your executive portal to explore exclusive networking circles, register for upcoming summits, and connect with global leaders.
  </p>
  <div style="text-align: center; margin: 28px 0;">
    <a href="{{appUrl}}" style="background: #9d174d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Access Executive Portal</a>
  </div>
  <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
  <p style="font-size: 11px; color: #94a3b8; text-align: center;">WomenPlay Secretariat &bull; Global Executive Network &bull; Automated Transactional Dispatch</p>
</div>`,
      variables: ["{{userName}}", "{{userEmail}}", "{{membershipTier}}", "{{appUrl}}"],
      updatedAt: new Date().toISOString()
    },
    {
      id: "event-access-pass",
      name: "Event Access Pass & Ticket",
      category: "Events",
      subject: "Your Access Pass for {{eventName}} [Badge: {{ticketCode}}]",
      bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="text-align: center; margin-bottom: 20px;">
    <span style="background: #fdf2f8; color: #9d174d; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">Official Event Access Pass</span>
    <h1 style="color: #0f172a; margin: 12px 0 4px 0; font-size: 22px;">{{eventName}}</h1>
    <p style="color: #64748b; font-size: 14px; margin: 0;">{{eventDate}} &bull; {{eventLocation}}</p>
  </div>
  <div style="background: #0f172a; color: #ffffff; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
    <p style="margin: 0; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; color: #f472b6;">Unique Executive Badge Code</p>
    <p style="margin: 6px 0 0 0; font-size: 28px; font-family: monospace; font-weight: bold; letter-spacing: 3px; color: #ffffff;">{{ticketCode}}</p>
  </div>
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">Hello <strong>{{userName}}</strong>,</p>
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">
    Your ticket reservation for <strong>{{eventName}}</strong> has been confirmed. Please present your badge code at the venue reception desk for priority fast-track entry.
  </p>
  <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Package Badge:</strong> {{ticketPackage}}</p>
    <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Fee Paid:</strong> \${{ticketPrice}}</p>
    <p style="margin: 0; font-size: 13px;"><strong>Attendee Account:</strong> {{userEmail}}</p>
  </div>
  <div style="text-align: center; margin: 24px 0;">
    <a href="{{appUrl}}" style="background: #9d174d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">View Ticket in Portal</a>
  </div>
  <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
  <p style="font-size: 11px; color: #94a3b8; text-align: center;">WomenPlay Events &bull; Official Digital Ticketing Service</p>
</div>`,
      variables: ["{{userName}}", "{{userEmail}}", "{{eventName}}", "{{eventDate}}", "{{eventLocation}}", "{{ticketCode}}", "{{ticketPackage}}", "{{ticketPrice}}", "{{appUrl}}"],
      updatedAt: new Date().toISOString()
    },
    {
      id: "contact-acknowledgment",
      name: "Contact Form Acknowledgment",
      category: "Customer Service",
      subject: "We received your inquiry, {{userName}} - WomenPlay Secretariat",
      bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <h2 style="color: #9d174d; margin-top: 0;">Thank You for Reaching Out</h2>
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">Dear <strong>{{userName}}</strong>,</p>
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">
    Thank you for contacting the WomenPlay Executive Secretariat. We have received your message regarding "<strong>{{inquirySubject}}</strong>".
  </p>
  <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #9d174d; margin: 20px 0;">
    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; color: #64748b;">Summary of Your Message:</p>
    <p style="margin: 0; font-size: 13px; color: #1e293b; white-space: pre-wrap;">{{inquiryMessage}}</p>
  </div>
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">An executive representative is reviewing your message and will get back to you shortly.</p>
  <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
  <p style="font-size: 11px; color: #94a3b8; text-align: center;">WomenPlay Executive Secretariat &bull; Automated Inquiry Receiver</p>
</div>`,
      variables: ["{{userName}}", "{{userEmail}}", "{{inquirySubject}}", "{{inquiryMessage}}", "{{appUrl}}"],
      updatedAt: new Date().toISOString()
    },
    {
      id: "support-ticket-confirmation",
      name: "Support Desk Ticket Receipt",
      category: "Support Desk",
      subject: "[Ticket #{{ticketId}}] Support Ticket Received: {{ticketSubject}}",
      bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <h2 style="color: #0f172a; margin-top: 0;">Concierge Support Ticket Created</h2>
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">Hello <strong>{{userName}}</strong>,</p>
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">
    Your support ticket <strong>#{{ticketId}}</strong> has been logged into our queue under <strong>{{ticketCategory}}</strong>.
  </p>
  <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Ticket Reference:</strong> #{{ticketId}}</p>
    <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Category:</strong> {{ticketCategory}}</p>
    <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Subject:</strong> {{ticketSubject}}</p>
    <p style="margin: 0; font-size: 13px;"><strong>Message:</strong> {{ticketDetails}}</p>
  </div>
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">Our support team will post updates directly to your executive dashboard portal.</p>
  <div style="text-align: center; margin: 24px 0;">
    <a href="{{appUrl}}" style="background: #0f172a; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">View Ticket Status</a>
  </div>
  <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
  <p style="font-size: 11px; color: #94a3b8; text-align: center;">WomenPlay Concierge Support Desk</p>
</div>`,
      variables: ["{{userName}}", "{{userEmail}}", "{{ticketId}}", "{{ticketCategory}}", "{{ticketSubject}}", "{{ticketDetails}}", "{{appUrl}}"],
      updatedAt: new Date().toISOString()
    },
    {
      id: "bulk-announcement",
      name: "Bulk Announcement & Official Broadcast",
      category: "Broadcasting & Announcements",
      subject: "[WomenPlay Announcement] {{announcementTitle}}",
      bodyHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
  <div style="text-align: center; margin-bottom: 24px;">
    <span style="background: #fdf2f8; color: #9d174d; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">WomenPlay Network Broadcast</span>
    <h1 style="color: #0f172a; margin: 16px 0 8px 0; font-size: 24px; font-weight: 800;">{{announcementTitle}}</h1>
    <p style="color: #64748b; font-size: 13px; margin: 0;">Recipient: {{recipientName}} ({{recipientEmail}})</p>
  </div>
  <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
  <p style="font-size: 15px; color: #1e293b; line-height: 1.6;">Dear <strong>{{recipientName}}</strong>,</p>
  <div style="font-size: 14px; color: #334155; line-height: 1.7; margin: 20px 0; background: #fafafa; padding: 20px; border-radius: 12px; border-left: 4px solid #9d174d;">
    {{messageContent}}
  </div>
  <div style="text-align: center; margin: 28px 0;">
    <a href="{{appUrl}}" style="background: #9d174d; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Open WomenPlay Portal</a>
  </div>
  <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
  <p style="font-size: 11px; color: #94a3b8; text-align: center;">You are receiving this official broadcast because you are a registered member or partner of the WomenPlay Executive Network.</p>
</div>`,
      variables: ["{{recipientName}}", "{{recipientEmail}}", "{{announcementTitle}}", "{{messageContent}}", "{{appUrl}}"],
      updatedAt: new Date().toISOString()
    },
    {
      id: "executive-newsletter",
      name: "Executive Community Digest Newsletter",
      category: "Broadcasting & Announcements",
      subject: "WomenPlay Executive Digest: {{newsletterTitle}}",
      bodyHtml: `<div style="font-family: Georgia, serif; max-width: 600px; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #9d174d; margin: 0; font-size: 26px; font-weight: 800;">WomenPlay Executive Digest</h1>
    <p style="color: #64748b; font-size: 12px; font-family: Arial, sans-serif; margin-top: 6px; text-transform: uppercase; letter-spacing: 1px;">Curated Leadership Insights & Network Highlights</p>
  </div>
  <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
  <p style="font-size: 15px; color: #1e293b; font-family: Arial, sans-serif;">Hello <strong>{{recipientName}}</strong>,</p>
  <div style="font-size: 14px; color: #334155; line-height: 1.7; font-family: Arial, sans-serif; margin: 20px 0;">
    {{messageContent}}
  </div>
  <div style="text-align: center; margin: 28px 0;">
    <a href="{{appUrl}}" style="background: #0f172a; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; font-family: Arial, sans-serif; display: inline-block;">Explore Executive Network</a>
  </div>
  <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
  <p style="font-size: 11px; color: #94a3b8; font-family: Arial, sans-serif; text-align: center;">WomenPlay Secretariat &bull; Global Female Leadership Network</p>
</div>`,
      variables: ["{{recipientName}}", "{{recipientEmail}}", "{{newsletterTitle}}", "{{messageContent}}", "{{appUrl}}"],
      updatedAt: new Date().toISOString()
    }
  ];
}

export function renderEmailTemplate(
  templateId: string,
  replacements: Record<string, string>,
  storedTemplates: EmailTemplate[] = []
) {
  const tmpl = storedTemplates.find(t => t.id === templateId)
    || getDefaultEmailTemplates().find(t => t.id === templateId);

  if (!tmpl) return null;

  let subject = tmpl.subject;
  let bodyHtml = tmpl.bodyHtml;

  const finalReplacements = {
    appUrl: "https://womenplay.org",
    ...replacements
  };

  Object.entries(finalReplacements).forEach(([key, val]) => {
    const reg = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
    subject = subject.replace(reg, val || '');
    bodyHtml = bodyHtml.replace(reg, val || '');
  });

  return { subject, bodyHtml, name: tmpl.name };
}