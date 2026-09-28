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
      name: "Event Access Pass & Ticket Badge",
      category: "Events",
      subject: "Your Event Access Pass & QR Badge for {{eventName}} [{{ticketCode}}]",
      bodyHtml: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; color: #1e293b;">
  <!-- Header / Brand -->
  <div style="text-align: center; margin-bottom: 24px;">
    <div style="display: inline-block; background: #fdf2f8; color: #9d174d; padding: 5px 16px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">Official Event Access Pass</div>
    <h1 style="color: #0f172a; margin: 0 0 6px 0; font-size: 24px; font-weight: 800; line-height: 1.3;">{{eventName}}</h1>
    <p style="color: #64748b; font-size: 13px; margin: 0; font-weight: 500;">{{eventDate}} &bull; {{eventLocation}}</p>
  </div>

  <!-- Digital Badge with QR Code -->
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #ffffff; padding: 24px 20px; border-radius: 16px; text-align: center; margin: 24px 0; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.25); border: 1px solid #312e81;">
    <div style="text-transform: uppercase; font-size: 10px; font-weight: 800; letter-spacing: 2px; color: #f472b6; margin-bottom: 6px;">Executive Entry Badge</div>
    <div style="font-size: 26px; font-family: 'Courier New', Courier, monospace; font-weight: 800; letter-spacing: 3px; color: #ffffff; margin-bottom: 16px;">{{ticketCode}}</div>
    
    <!-- Scannable High-Contrast QR Code -->
    <div style="background: #ffffff; padding: 14px; border-radius: 14px; display: inline-block; box-shadow: 0 6px 16px rgba(0,0,0,0.3); line-height: 0;">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&color=0f172a&data={{ticketCode}}" alt="Event Access QR Code" width="190" height="190" style="display: block; border-radius: 6px; width: 190px; height: 190px;" />
    </div>

    <p style="margin: 14px 0 0 0; color: #cbd5e1; font-size: 11px; font-weight: 500; letter-spacing: 0.5px;">Present this digital QR badge on your mobile device at reception for instant check-in</p>
  </div>

  <p style="font-size: 15px; color: #1e293b; line-height: 1.6;">Hello <strong>{{userName}}</strong>,</p>
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">
    Your ticket reservation for <strong>{{eventName}}</strong> has been confirmed. Your official access badge is ready above.
  </p>

  <!-- Ticket & Payment Summary -->
  <div style="background: #f8fafc; padding: 18px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
      <tr>
        <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Attendee Name:</td>
        <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #0f172a;">{{userName}}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Attendee Email:</td>
        <td style="padding: 6px 0; text-align: right; color: #0f172a;">{{userEmail}}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Ticket Package:</td>
        <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #9d174d;">{{ticketPackage}}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Amount Paid:</td>
        <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #059669;">\${{ticketPrice}} CAD</td>
      </tr>
    </table>
  </div>

  <div style="text-align: center; margin: 28px 0;">
    <a href="{{appUrl}}" style="background: #9d174d; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(157, 23, 77, 0.25);">View Ticket in Portal</a>
  </div>

  <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
  <p style="font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5; margin: 0;">WomenPlay Events &bull; Official Digital Access System &bull; Please keep this pass for entry</p>
</div>`,
      variables: ["{{userName}}", "{{userEmail}}", "{{eventName}}", "{{eventDate}}", "{{eventLocation}}", "{{ticketCode}}", "{{ticketPackage}}", "{{ticketPrice}}", "{{appUrl}}"],
      updatedAt: new Date().toISOString()
    },
    {
      id: "account-activation",
      name: "Account Activation & Password Setup",
      category: "Onboarding",
      subject: "Activate Your WomenPlay Account — Ticket & Member Portal Access",
      bodyHtml: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; color: #1e293b;">
  <div style="text-align: center; margin-bottom: 24px;">
    <div style="display: inline-block; background: #fdf2f8; color: #9d174d; padding: 5px 16px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">Account Setup</div>
    <h1 style="color: #0f172a; margin: 0 0 6px 0; font-size: 24px; font-weight: 800;">Welcome to WomenPlay</h1>
    <p style="color: #64748b; font-size: 13px; margin: 0;">Activate Your Member Portal Account</p>
  </div>
  <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
  <p style="font-size: 15px; color: #1e293b; line-height: 1.6;">Dear <strong>{{userName}}</strong>,</p>
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">
    Thank you for securing your ticket to <strong>{{eventName}}</strong>! We have established an executive member account for your email (<strong>{{userEmail}}</strong>).
  </p>
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">
    Please activate your account and create a secure password to access your digital entry badge, review your billing transactions, and connect with fellow executives:
  </p>
  <div style="text-align: center; margin: 28px 0;">
    <a href="{{activationUrl}}" style="background: #9d174d; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(157, 23, 77, 0.3);">Activate Account & Set Password</a>
  </div>
  <div style="background: #f8fafc; padding: 16px; border-radius: 10px; border: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; color: #475569;">If the button above does not work, copy and paste this link into your browser:</p>
    <a href="{{activationUrl}}" style="color: #9d174d; font-size: 12px; word-break: break-all; text-decoration: underline;">{{activationUrl}}</a>
  </div>
  <div style="background: #fdf2f8; padding: 16px; border-radius: 10px; border-left: 4px solid #9d174d; margin: 20px 0;">
    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; color: #9d174d;">Your Account Benefits:</p>
    <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #475569; line-height: 1.6;">
      <li>Instant access to your digital QR check-in badge anytime</li>
      <li>Itemized transaction receipts in your personal billing ledger</li>
      <li>Networking directory & updates for {{eventName}}</li>
    </ul>
  </div>
  <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
  <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">WomenPlay Secretariat &bull; Automated Account Onboarding Dispatch</p>
</div>`,
      variables: ["{{userName}}", "{{userEmail}}", "{{eventName}}", "{{activationUrl}}", "{{appUrl}}"],
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
    },
    {
      id: "admin-confirmation",
      name: "Administrator Email Confirmation & Security Onboarding",
      category: "Administration",
      subject: "Action Required: Confirm Your WomenPlay Administrator Account, {{userName}}",
      bodyHtml: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; color: #1e293b;">
  <div style="text-align: center; margin-bottom: 24px;">
    <div style="display: inline-block; background: #fdf2f8; color: #9d174d; padding: 5px 16px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">Executive Administration</div>
    <h1 style="color: #0f172a; margin: 0 0 6px 0; font-size: 24px; font-weight: 800;">Administrator Email Confirmation</h1>
    <p style="color: #64748b; font-size: 13px; margin: 0;">Official Administrator Provisioning Notice</p>
  </div>
  <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
  <p style="font-size: 15px; color: #1e293b; line-height: 1.6;">Dear <strong>{{userName}}</strong>,</p>
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">
    You have been provisioned as an <strong>Executive Administrator</strong> for the WomenPlay Network with the role of <strong>{{title}}</strong> ({{company}}).
  </p>
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">
    To activate your administrative privileges and access the executive portal, please confirm your email address by clicking the link below:
  </p>
  <div style="text-align: center; margin: 28px 0;">
    <a href="{{confirmationUrl}}" style="background: #9d174d; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(157, 23, 77, 0.3);">Confirm Email & Activate Administrator Account</a>
  </div>
  <div style="background: #f8fafc; padding: 16px; border-radius: 10px; border: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; color: #475569;">If the button above does not work, copy and paste this confirmation URL into your browser:</p>
    <a href="{{confirmationUrl}}" style="color: #9d174d; font-size: 12px; word-break: break-all; text-decoration: underline;">{{confirmationUrl}}</a>
  </div>
  <div style="background: #fdf2f8; padding: 18px; border-radius: 12px; border-left: 4px solid #9d174d; margin: 20px 0;">
    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #9d174d;">Security Onboarding Sequence:</p>
    <ol style="margin: 0; padding-left: 18px; font-size: 12px; color: #475569; line-height: 1.7;">
      <li><strong>Confirm Email:</strong> Click the confirmation link above to verify your account email (<strong>{{userEmail}}</strong>).</li>
      <li><strong>Configure Password:</strong> After confirmation or on first login, you will create your secure administrative password.</li>
      <li><strong>Mandatory 2FA Setup:</strong> You will configure Two-Factor Authentication (authenticator app or email OTP) upon your first login to ensure maximum portal security.</li>
    </ol>
  </div>
  <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
  <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">WomenPlay Secretariat &bull; Global Executive Administration &bull; Automated Provisioning Dispatch</p>
</div>`,
      variables: ["{{userName}}", "{{userEmail}}", "{{title}}", "{{company}}", "{{confirmationUrl}}", "{{appUrl}}"],
      updatedAt: new Date().toISOString()
    },
    {
      id: "admin-welcome",
      name: "Administrator Welcome & Executive Portal Access",
      category: "Administration",
      subject: "Welcome to WomenPlay Executive Secretariat, {{userName}}!",
      bodyHtml: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; color: #1e293b;">
  <div style="text-align: center; margin-bottom: 24px;">
    <div style="display: inline-block; background: #fdf2f8; color: #9d174d; padding: 5px 16px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">Executive Leadership</div>
    <h1 style="color: #0f172a; margin: 0 0 6px 0; font-size: 24px; font-weight: 800;">Welcome to the Executive Secretariat</h1>
    <p style="color: #64748b; font-size: 13px; margin: 0;">Official WomenPlay Administrator Appointment</p>
  </div>
  <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
  <p style="font-size: 15px; color: #1e293b; line-height: 1.6;">Dear <strong>{{userName}}</strong>,</p>
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">
    It is our distinct privilege to officially welcome you as an <strong>Executive Administrator</strong> of the <strong>WomenPlay Global Network</strong>. Your administrative profile has been designated as <strong>{{title}}</strong> ({{company}}).
  </p>
  <div style="background: #f8fafc; padding: 18px; border-radius: 12px; border-left: 4px solid #9d174d; margin: 20px 0;">
    <p style="margin: 0 0 8px 0; font-size: 13px; color: #334155;"><strong>Executive Account Profile:</strong></p>
    <p style="margin: 0 0 6px 0; font-size: 13px; color: #475569;">&bull; <strong>Name:</strong> {{userName}}</p>
    <p style="margin: 0 0 6px 0; font-size: 13px; color: #475569;">&bull; <strong>Official Email:</strong> {{userEmail}}</p>
    <p style="margin: 0 0 6px 0; font-size: 13px; color: #475569;">&bull; <strong>Executive Role:</strong> {{title}}</p>
    <p style="margin: 0; font-size: 13px; color: #475569;">&bull; <strong>Chapter / Entity:</strong> {{company}}</p>
  </div>
  <p style="font-size: 14px; color: #334155; line-height: 1.6;">
    As an administrator, you hold elevated governance capabilities across our event registries, member directories, ticket pass management, and operational communications.
  </p>
  <div style="text-align: center; margin: 28px 0;">
    <a href="{{portalUrl}}" style="background: #0f172a; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.25);">Launch Administrator Dashboard</a>
  </div>
  <div style="background: #fdf2f8; padding: 16px; border-radius: 10px; border: 1px solid #fce7f3; margin: 20px 0;">
    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; color: #9d174d;">Administrative Security Notice:</p>
    <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">
      All executive access requires two-factor authentication (2FA). Never share your credentials or 2FA codes. All administrative transactions are logged in the immutable audit ledger.
    </p>
  </div>
  <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
  <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">WomenPlay Secretariat &bull; Global Executive Governance &bull; Confidential Executive Dispatch</p>
</div>`,
      variables: ["{{userName}}", "{{userEmail}}", "{{title}}", "{{company}}", "{{portalUrl}}", "{{appUrl}}"],
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