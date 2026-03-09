// ============================================================
//  SmartHome — Professional Email Templates
//  Fully Responsive: Mobile (350px min) · Tablet · Desktop
//  Theme: Dark Navy · Cyan Accent · Tech/Intelligent Living
// ============================================================

// ─────────────────────────────────────────────
//  RESPONSIVE STYLES (injected into every email)
// ─────────────────────────────────────────────

const responsiveStyles = `
<style type="text/css">
  /* ── Reset ── */
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }

  /* ── Mobile: max 600px ── */
  @media only screen and (max-width: 600px) {
    .email-wrapper  { padding: 16px 10px !important; }
    .email-table    { width: 100% !important; min-width: unset !important; }
    .email-header   { padding: 22px 18px 18px !important; border-radius: 12px 12px 0 0 !important; }
    .logo-icon      { width: 50px !important; height: 50px !important; line-height: 50px !important; }
    .logo-icon span { font-size: 22px !important; }
    .logo-title     { font-size: 20px !important; }
    .email-body     { padding: 22px 16px !important; }
    .email-footer   { padding: 16px 16px !important; border-radius: 0 0 12px 12px !important; }
    .badge-bar      { padding: 9px 16px !important; }
    .email-title    { font-size: 17px !important; line-height: 1.35 !important; }
    .email-para     { font-size: 13px !important; }
    .otp-code       { font-size: 30px !important; letter-spacing: 8px !important; }
    .otp-box        { padding: 20px 14px !important; }
    .cta-btn        { display: block !important; text-align: center !important; padding: 13px 16px !important; font-size: 13px !important; }
    .info-table     { padding: 12px 14px !important; }
    .info-label     { font-size: 11px !important; }
    .info-value     { font-size: 12px !important; }
    .alert-box td   { padding: 13px 14px !important; }
    .alert-text     { font-size: 12px !important; }
    .feature-td     { display: block !important; width: 100% !important; padding: 10px 0 !important;
                      border-left: none !important; border-right: none !important;
                      border-bottom: 1px solid #1e2d3d !important; }
    .feature-last   { border-bottom: none !important; }
    .sent-by-right  { display: none !important; }
    .subject-box    { padding: 11px 12px !important; }
    .subject-text   { font-size: 13px !important; }
    .body-box       { padding: 14px 12px !important; }
    .body-text      { font-size: 13px !important; }
    .greeting-name  { font-size: 18px !important; }
    .total-label    { font-size: 13px !important; padding: 12px 14px !important; }
    .total-amount   { font-size: 17px !important; padding: 12px 14px !important; }
    .list-item      { font-size: 12px !important; }
  }

  /* ── Small mobile: max 380px ── */
  @media only screen and (max-width: 380px) {
    .email-wrapper  { padding: 10px 6px !important; }
    .email-body     { padding: 18px 12px !important; }
    .email-header   { padding: 18px 12px 14px !important; }
    .logo-title     { font-size: 18px !important; }
    .email-title    { font-size: 15px !important; }
    .otp-code       { font-size: 24px !important; letter-spacing: 5px !important; }
    .cta-btn        { padding: 12px 10px !important; font-size: 12px !important; }
    .greeting-name  { font-size: 16px !important; }
    .subject-text   { font-size: 12px !important; }
    .body-text      { font-size: 12px !important; }
    .total-amount   { font-size: 15px !important; }
  }

  /* ── Tablet: 601–900px ── */
  @media only screen and (min-width: 601px) and (max-width: 900px) {
    .email-table    { width: 95% !important; }
    .email-body     { padding: 30px 28px !important; }
    .email-header   { padding: 28px 28px 22px !important; }
  }
</style>`;

// ─────────────────────────────────────────────
//  LAYOUT HELPERS
// ─────────────────────────────────────────────

const baseWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  ${responsiveStyles}
</head>
<body style="margin:0;padding:0;background:#0b0f1a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;min-width:320px;">
  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
    style="background:#0b0f1a;padding:40px 20px;">
    <tr><td align="center">
      <table class="email-table" width="600" cellpadding="0" cellspacing="0" border="0" role="presentation"
        style="max-width:600px;width:100%;min-width:320px;">
        ${header()}
        ${content}
        ${footer()}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const header = () => `
<tr>
  <td class="email-header" style="background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);border-radius:16px 16px 0 0;padding:34px 40px 28px;text-align:center;">
    <div class="logo-icon" style="display:inline-block;background:rgba(0,212,255,0.12);border:1.5px solid rgba(0,212,255,0.3);border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;margin-bottom:14px;">
      <span style="font-size:30px;">🏠</span>
    </div>
    <h1 class="logo-title" style="margin:0;font-size:24px;font-weight:700;color:#fff;letter-spacing:0.5px;">
      Smart<span style="color:#00d4ff;">Home</span>
    </h1>
    <p style="margin:5px 0 0;font-size:11px;color:#8ab4c4;letter-spacing:2.5px;text-transform:uppercase;">
      Intelligent Living System
    </p>
  </td>
</tr>`;

const footer = () => `
<tr>
  <td class="email-footer" style="background:#0d1520;border-radius:0 0 16px 16px;border:1px solid #1e2d3d;border-top:none;padding:22px 40px;text-align:center;">
    <p style="margin:0 0 6px;font-size:11px;color:#3a5a6a;">© 2025 SmartHome Intelligent Living System. All rights reserved.</p>
    <p style="margin:0;font-size:11px;color:#2a4a5a;">
      <a href="#" style="color:#00d4ff;text-decoration:none;">Privacy Policy</a>&nbsp;·&nbsp;
      <a href="#" style="color:#00d4ff;text-decoration:none;">Support</a>&nbsp;·&nbsp;
      <a href="#" style="color:#00d4ff;text-decoration:none;">Unsubscribe</a>
    </p>
  </td>
</tr>`;

const bodyWrap = (inner: string) => `
<tr>
  <td class="email-body" style="background:#111927;padding:36px 40px;border-left:1px solid #1e2d3d;border-right:1px solid #1e2d3d;">
    ${inner}
  </td>
</tr>`;

const badge = (label: string, color = '#00d4ff') => `
<p style="margin:0 0 10px;font-size:11px;color:${color};text-transform:uppercase;letter-spacing:2px;font-weight:600;">${label}</p>`;

const title = (text: string) => `
<h2 class="email-title" style="margin:0 0 18px;font-size:21px;color:#e8f4f8;font-weight:600;line-height:1.3;">${text}</h2>`;

const para = (text: string) => `
<p class="email-para" style="margin:0 0 20px;font-size:14px;color:#7a9bae;line-height:1.75;">${text}</p>`;

const divider = () =>
  `<div style="height:1px;background:linear-gradient(90deg,transparent,#1e2d3d,transparent);margin:24px 0;"></div>`;

const ctaButton = (label: string, href = '#', color = '#00d4ff') => `
<div style="text-align:center;margin:28px 0 10px;">
  <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${href}" style="height:44px;v-text-anchor:middle;width:220px;" arcsize="18%" fillcolor="${color}"><w:anchorlock/><center style="color:#0b0f1a;font-family:sans-serif;font-size:14px;font-weight:700;">${label}</center></v:roundrect><![endif]-->
  <!--[if !mso]><!-->
  <a class="cta-btn" href="${href}"
    style="background:linear-gradient(135deg,${color},#0099bb);color:#0b0f1a;text-decoration:none;font-weight:700;padding:13px 34px;border-radius:8px;font-size:14px;display:inline-block;letter-spacing:0.3px;mso-hide:all;">
    ${label}
  </a>
  <!--<![endif]-->
</div>`;

const alertBox = (icon: string, text: string, borderColor = '#00d4ff') => `
<table class="alert-box" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
  <tr>
    <td style="background:#0d1824;border-radius:10px;padding:16px 20px;border-left:3px solid ${borderColor};">
      <p class="alert-text" style="margin:0;font-size:13px;color:#5a8a9a;line-height:1.65;">${icon}&nbsp; ${text}</p>
    </td>
  </tr>
</table>`;

const infoRow = (label: string, value: string) => `
<tr>
  <td class="info-label" style="padding:9px 0;border-bottom:1px solid #1e2d3d;font-size:12px;color:#4a7a8a;text-transform:uppercase;letter-spacing:1px;">${label}</td>
  <td class="info-value" style="padding:9px 0;border-bottom:1px solid #1e2d3d;text-align:right;font-size:13px;color:#e8f4f8;font-weight:600;word-break:break-word;max-width:200px;">${value}</td>
</tr>`;

const infoTable = (rows: string) => `
<table class="info-table" width="100%" cellpadding="0" cellspacing="0" border="0"
  style="background:#0d1824;border-radius:10px;padding:18px 20px;margin-bottom:20px;">
  ${rows}
</table>`;

// ============================================================
//  🔐  AUTH & ACCOUNT TEMPLATES
// ============================================================

/** 1. OTP Verification */
export const otpVerificationEmail = (otp: string, userName?: string) =>
  baseWrapper(
    bodyWrap(`
    ${badge('Security Verification')}
    ${title(userName ? `Hi ${userName}, verify your identity` : 'Verify your identity')}
    ${para('Your SmartHome account requires a one-time verification code. Enter it below to authenticate your session and keep your home secure.')}

    <div class="otp-box" style="background:linear-gradient(135deg,#0d1f2d,#162535);border:1px solid rgba(0,212,255,0.3);border-radius:12px;padding:28px 20px;text-align:center;margin-bottom:24px;">
      <div style="height:2px;background:linear-gradient(90deg,transparent,#00d4ff,transparent);margin:-28px -20px 22px;border-radius:12px 12px 0 0;"></div>
      <p style="margin:0 0 10px;font-size:11px;color:#4a7a8a;text-transform:uppercase;letter-spacing:3px;">One-Time Password</p>
      <div class="otp-code" style="font-size:40px;font-weight:800;letter-spacing:14px;color:#00d4ff;font-family:'Courier New',monospace;text-shadow:0 0 20px rgba(0,212,255,0.4);padding:8px 0;">${otp}</div>
      <p style="margin:12px 0 0;font-size:12px;color:#4a7a8a;">⏱ Expires in <strong style="color:#ff6b6b;">10 minutes</strong></p>
    </div>

    ${alertBox('🔒', '<strong style="color:#8ab4c4;">Security Notice:</strong> SmartHome will <strong style="color:#e8f4f8;">never</strong> ask for this code via phone or chat. Do not share it with anyone.')}
  `),
  );

/** 2. Welcome Email */
export const welcomeEmail = (userName: string) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;margin-bottom:12px;">🏠✅</div>
      ${badge('Account Activated', '#22c55e')}
    </div>
    ${title(`Welcome aboard, ${userName}!`)}
    ${para('Your email has been verified and your SmartHome account is now active. Control your lights, security, climate, and more — from anywhere in the world.')}

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 28px;">
      <tr>
        <td class="feature-td" width="33%" style="text-align:center;padding:14px 8px;">
          <div style="font-size:24px;margin-bottom:6px;">💡</div>
          <p style="margin:0;font-size:11px;color:#4a7a8a;">Smart Lighting</p>
        </td>
        <td class="feature-td" width="33%" style="text-align:center;padding:14px 8px;border-left:1px solid #1e2d3d;border-right:1px solid #1e2d3d;">
          <div style="font-size:24px;margin-bottom:6px;">🔐</div>
          <p style="margin:0;font-size:11px;color:#4a7a8a;">Smart Security</p>
        </td>
        <td class="feature-td feature-last" width="33%" style="text-align:center;padding:14px 8px;">
          <div style="font-size:24px;margin-bottom:6px;">🌡️</div>
          <p style="margin:0;font-size:11px;color:#4a7a8a;">Climate Control</p>
        </td>
      </tr>
    </table>
    ${ctaButton('Go to Dashboard →')}
  `),
  );

/** 3. Password Changed */
export const passwordChangedEmail = (
  userName: string,
  changedAt: string,
  ipAddress?: string,
) =>
  baseWrapper(
    bodyWrap(`
    ${badge('Account Security', '#f59e0b')}
    ${title(`Password changed, ${userName}`)}
    ${para('Your SmartHome account password was successfully updated. If you made this change, no further action is needed.')}
    ${infoTable(infoRow('Changed At', changedAt) + (ipAddress ? infoRow('IP Address', ipAddress) : ''))}
    ${alertBox('⚠️', '<strong style="color:#f59e0b;">Not you?</strong> If you did not make this change, please <a href="#" style="color:#ff6b6b;text-decoration:none;">reset your password immediately</a> and contact support.', '#f59e0b')}
    ${ctaButton('Secure My Account', '#', '#f59e0b')}
  `),
  );

/** 4. Account Suspended */
export const accountSuspendedEmail = (userName: string, reason?: string) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:20px;font-size:44px;">🚫</div>
    ${badge('Account Notice', '#ef4444')}
    ${title(`Your account has been suspended, ${userName}`)}
    ${para('Access to your SmartHome account has been temporarily suspended. All your device automations and schedules have been paused.')}
    ${reason ? alertBox('📋', `<strong style="color:#8ab4c4;">Reason:</strong> <span style="color:#e8f4f8;">${reason}</span>`, '#ef4444') : ''}
    ${para('If you believe this is a mistake or wish to appeal, please contact our support team.')}
    ${ctaButton('Contact Support', '#', '#ef4444')}
  `),
  );

/** 5. Account Reactivated */
export const accountReactivatedEmail = (userName: string) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:20px;font-size:44px;">✅</div>
    ${badge('Account Restored', '#22c55e')}
    ${title(`Great news, ${userName} — you're back!`)}
    ${para('Your SmartHome account has been reactivated. All your devices, automations, and settings are exactly as you left them.')}
    ${ctaButton('Back to Dashboard →', '#', '#22c55e')}
  `),
  );

/** 6. New Login Alert */
export const newLoginAlertEmail = (
  userName: string,
  device: string,
  location: string,
  time: string,
) =>
  baseWrapper(
    bodyWrap(`
    ${badge('Security Alert', '#f59e0b')}
    ${title(`New login detected, ${userName}`)}
    ${para('We noticed a new sign-in to your SmartHome account. Here are the details:')}
    ${infoTable(infoRow('Device', device) + infoRow('Location', location) + infoRow('Time', time))}
    ${alertBox('⚠️', 'If this was <strong style="color:#e8f4f8;">not you</strong>, please <a href="#" style="color:#ff6b6b;text-decoration:none;">secure your account immediately</a>.', '#f59e0b')}
    ${ctaButton('Review Activity', '#', '#f59e0b')}
  `),
  );

// ============================================================
//  👤  USER LIFECYCLE TEMPLATES
// ============================================================

/** 7. Profile Updated */
export const profileUpdatedEmail = (
  userName: string,
  updatedFields: string[],
) =>
  baseWrapper(
    bodyWrap(`
    ${badge('Profile Update')}
    ${title(`Profile updated, ${userName}`)}
    ${para('The following information on your SmartHome account was recently updated:')}
    <ul style="margin:0 0 20px;padding-left:20px;">
      ${updatedFields.map(f => `<li class="list-item" style="font-size:13px;color:#8ab4c4;margin-bottom:6px;">${f}</li>`).join('')}
    </ul>
    ${alertBox('ℹ️', 'If you did not make these changes, please <a href="#" style="color:#ff6b6b;text-decoration:none;">contact support</a> immediately.')}
  `),
  );

/** 8. Account Deletion Warning */
export const accountDeletionWarningEmail = (
  userName: string,
  deletionDate: string,
) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:20px;font-size:44px;">⚠️</div>
    ${badge('Account Deletion Warning', '#ef4444')}
    ${title(`${userName}, your account is scheduled for deletion`)}
    ${para(`Your SmartHome account will be permanently deleted on <strong style="color:#ef4444;">${deletionDate}</strong>. All your device configurations, automations, and data will be lost forever.`)}
    ${para('If you wish to keep your account, please log in before the deadline.')}
    ${ctaButton('Keep My Account', '#', '#22c55e')}
    ${divider()}
    ${para('<span style="font-size:12px;color:#4a7a8a;">If you requested this deletion, no action is needed.</span>')}
  `),
  );

/** 9. Account Deleted */
export const accountDeletedEmail = (userName: string) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:20px;font-size:44px;">🗑️</div>
    ${badge('Account Deleted', '#ef4444')}
    ${title(`Goodbye, ${userName}`)}
    ${para('Your SmartHome account has been permanently deleted. All associated data, device configurations, and automations have been removed from our systems.')}
    ${para("We're sorry to see you go. If you ever change your mind, you're always welcome to create a new account.")}
    ${divider()}
    ${para('<span style="font-size:12px;color:#4a7a8a;">If you did not request this deletion, please contact our support team immediately.</span>')}
    ${ctaButton('Contact Support', '#', '#00d4ff')}
  `),
  );

/** 10. Inactivity Reminder */
export const inactivityReminderEmail = (
  userName: string,
  daysSinceLogin: number,
) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:20px;font-size:44px;">👋</div>
    ${badge('We Miss You!')}
    ${title(`${userName}, your smart home is waiting`)}
    ${para(`It's been <strong style="color:#00d4ff;">${daysSinceLogin} days</strong> since you last logged in. Your devices are still running, but your home could be smarter with your attention.`)}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 28px;">
      <tr>
        <td class="feature-td" style="text-align:center;padding:14px 8px;">
          <div style="font-size:24px;margin-bottom:6px;">📊</div>
          <p style="margin:0;font-size:11px;color:#4a7a8a;">Check usage reports</p>
        </td>
        <td class="feature-td" style="text-align:center;padding:14px 8px;border-left:1px solid #1e2d3d;border-right:1px solid #1e2d3d;">
          <div style="font-size:24px;margin-bottom:6px;">⚙️</div>
          <p style="margin:0;font-size:11px;color:#4a7a8a;">Update automations</p>
        </td>
        <td class="feature-td feature-last" style="text-align:center;padding:14px 8px;">
          <div style="font-size:24px;margin-bottom:6px;">🔒</div>
          <p style="margin:0;font-size:11px;color:#4a7a8a;">Review security</p>
        </td>
      </tr>
    </table>
    ${ctaButton('Log Back In →')}
  `),
  );

// ============================================================
//  📢  ADMIN → BULK MAIL TEMPLATES
// ============================================================

/** 11. System Announcement */
export const systemAnnouncementEmail = (
  title_: string,
  message: string,
  ctaLabel?: string,
  ctaLink?: string,
) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:20px;font-size:44px;">📢</div>
    ${badge('System Announcement')}
    ${title(title_)}
    ${para(message)}
    ${ctaLabel ? ctaButton(ctaLabel, ctaLink) : ''}
  `),
  );

/** 12. Maintenance Alert */
export const maintenanceAlertEmail = (
  startTime: string,
  endTime: string,
  affectedServices: string[],
) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:20px;font-size:44px;">🛠️</div>
    ${badge('Scheduled Maintenance', '#f59e0b')}
    ${title('Planned maintenance window')}
    ${para('SmartHome services will be temporarily unavailable during the following window. Please plan accordingly.')}
    ${infoTable(infoRow('Start', startTime) + infoRow('End', endTime))}
    <p style="margin:0 0 10px;font-size:12px;color:#4a7a8a;text-transform:uppercase;letter-spacing:1px;">Affected Services</p>
    <ul style="margin:0 0 20px;padding-left:20px;">
      ${affectedServices.map(s => `<li class="list-item" style="font-size:13px;color:#8ab4c4;margin-bottom:5px;">${s}</li>`).join('')}
    </ul>
    ${alertBox('ℹ️', 'All your existing automations and schedules will resume automatically once maintenance is complete.')}
  `),
  );

/** 13. New Feature Launch */
export const newFeatureEmail = (
  featureName: string,
  description: string,
  highlights: string[],
) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:20px;font-size:44px;">🚀</div>
    ${badge('New Feature', '#22c55e')}
    ${title(`Introducing: ${featureName}`)}
    ${para(description)}
    <p style="margin:0 0 10px;font-size:12px;color:#4a7a8a;text-transform:uppercase;letter-spacing:1px;">What's New</p>
    <ul style="margin:0 0 24px;padding-left:20px;">
      ${highlights.map(h => `<li class="list-item" style="font-size:13px;color:#8ab4c4;margin-bottom:6px;">✦ ${h}</li>`).join('')}
    </ul>
    ${ctaButton('Try It Now →', '#', '#22c55e')}
  `),
  );

/** 14. Policy Update */
export const policyUpdateEmail = (
  policyName: string,
  effectiveDate: string,
  summaryPoints: string[],
) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:20px;font-size:44px;">📄</div>
    ${badge('Policy Update', '#8b5cf6')}
    ${title(`Update to our ${policyName}`)}
    ${para(`We've made updates to our ${policyName}, effective <strong style="color:#00d4ff;">${effectiveDate}</strong>. Here's a summary of the key changes:`)}
    <ul style="margin:0 0 24px;padding-left:20px;">
      ${summaryPoints.map(p => `<li class="list-item" style="font-size:13px;color:#8ab4c4;margin-bottom:6px;">${p}</li>`).join('')}
    </ul>
    ${ctaButton('Read Full Policy', '#', '#8b5cf6')}
    ${divider()}
    ${para('<span style="font-size:12px;color:#4a7a8a;">By continuing to use SmartHome after the effective date, you agree to the updated policy.</span>')}
  `),
  );

// ============================================================
//  🏠  SMART HOME SPECIFIC TEMPLATES
// ============================================================

/** 15. Device Added */
export const deviceAddedEmail = (
  userName: string,
  deviceName: string,
  deviceType: string,
  addedAt: string,
) =>
  baseWrapper(
    bodyWrap(`
    ${badge('Device Connected', '#22c55e')}
    ${title('New device added to your home')}
    ${para(`A new device has been successfully connected to your SmartHome network, ${userName}.`)}
    ${infoTable(infoRow('Device Name', deviceName) + infoRow('Device Type', deviceType) + infoRow('Added At', addedAt))}
    ${alertBox('ℹ️', 'If you did not add this device, please <a href="#" style="color:#ff6b6b;text-decoration:none;">review your account security</a> immediately.', '#22c55e')}
    ${ctaButton('Manage Devices →')}
  `),
  );

/** 16. Device Removed */
export const deviceRemovedEmail = (
  userName: string,
  deviceName: string,
  removedAt: string,
) =>
  baseWrapper(
    bodyWrap(`
    ${badge('Device Removed', '#ef4444')}
    ${title('Device disconnected from your home')}
    ${para(`The device <strong style="color:#e8f4f8;">${deviceName}</strong> has been removed from your SmartHome network, ${userName}. Any automations linked to this device have been paused.`)}
    ${infoTable(infoRow('Device', deviceName) + infoRow('Removed At', removedAt))}
    ${alertBox('⚠️', 'If you did not remove this device, please <a href="#" style="color:#ff6b6b;text-decoration:none;">secure your account</a> immediately.', '#ef4444')}
    ${ctaButton('View My Devices')}
  `),
  );

/** 17. Security Alert */
export const unusualActivityAlertEmail = (
  userName: string,
  event: string,
  location: string,
  time: string,
) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:20px;font-size:44px;">🚨</div>
    ${badge('Security Alert', '#ef4444')}
    ${title(`Unusual activity detected, ${userName}`)}
    ${para('Our system has flagged unusual activity in or around your smart home. Please review the details below.')}
    ${infoTable(infoRow('Event', event) + infoRow('Location', location) + infoRow('Time', time))}
    ${alertBox('🚨', '<strong style="color:#ef4444;">Immediate action recommended.</strong> If this activity seems suspicious, lock down your home remotely right now.', '#ef4444')}
    ${ctaButton('🔒 Lock Down Home', '#', '#ef4444')}
  `),
  );

/** 18. Device Offline */
export const deviceOfflineEmail = (
  userName: string,
  deviceName: string,
  offlineSince: string,
) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:20px;font-size:44px;">📡</div>
    ${badge('Device Offline', '#f59e0b')}
    ${title(`${deviceName} is offline`)}
    ${para(`Hey ${userName}, we noticed your device <strong style="color:#e8f4f8;">${deviceName}</strong> has been offline since <strong style="color:#f59e0b;">${offlineSince}</strong> and is not responding.`)}
    ${alertBox('💡', 'Try restarting the device or check your home Wi-Fi connection. If the issue persists, visit our support center.', '#f59e0b')}
    ${ctaButton('View Device Status', '#', '#f59e0b')}
  `),
  );

/** 19. Monthly Report */
export const monthlyReportEmail = (
  userName: string,
  month: string,
  stats: {
    energySaved: string;
    automationsRun: number;
    devicesActive: number;
    topDevice: string;
  },
) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:20px;font-size:44px;">📊</div>
    ${badge('Monthly Report')}
    ${title(`Your ${month} SmartHome Report`)}
    ${para(`Here's a summary of how your smart home performed this month, ${userName}.`)}
    ${infoTable(
      infoRow('⚡ Energy Saved', stats.energySaved) +
        infoRow('⚙️ Automations Run', stats.automationsRun.toString()) +
        infoRow('📱 Active Devices', stats.devicesActive.toString()) +
        infoRow('🏆 Top Device', stats.topDevice),
    )}
    ${para('<span style="color:#22c55e;font-weight:600;">Great job!</span> Your smart home is running efficiently. Check the full report for detailed insights.')}
    ${ctaButton('View Full Report →')}
  `),
  );

/** 20. Firmware Update */
export const firmwareUpdateEmail = (
  userName: string,
  deviceName: string,
  version: string,
  improvements: string[],
) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:20px;font-size:44px;">⬆️</div>
    ${badge('Firmware Update Available', '#8b5cf6')}
    ${title(`Update available for ${deviceName}`)}
    ${para(`Hi ${userName}, a new firmware version <strong style="color:#00d4ff;">v${version}</strong> is available for your <strong style="color:#e8f4f8;">${deviceName}</strong>.`)}
    <p style="margin:0 0 10px;font-size:12px;color:#4a7a8a;text-transform:uppercase;letter-spacing:1px;">What's Improved</p>
    <ul style="margin:0 0 24px;padding-left:20px;">
      ${improvements.map(i => `<li class="list-item" style="font-size:13px;color:#8ab4c4;margin-bottom:6px;">✦ ${i}</li>`).join('')}
    </ul>
    ${ctaButton('Update Now →', '#', '#8b5cf6')}
    ${divider()}
    ${para('<span style="font-size:12px;color:#4a7a8a;">The update takes approximately 2 minutes. Your device will restart automatically.</span>')}
  `),
  );

// ============================================================
//  💳  TRANSACTIONAL TEMPLATES
// ============================================================

/** 21. Payment Successful */
export const paymentSuccessEmail = (
  userName: string,
  amount: string,
  plan: string,
  date: string,
  transactionId: string,
) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:20px;font-size:44px;">✅</div>
    ${badge('Payment Successful', '#22c55e')}
    ${title(`Payment received, ${userName}`)}
    ${para('Your payment has been processed successfully. Thank you for your continued trust in SmartHome.')}
    ${infoTable(infoRow('Plan', plan) + infoRow('Amount', amount) + infoRow('Date', date) + infoRow('Transaction ID', transactionId))}
    ${ctaButton('Download Invoice', '#', '#22c55e')}
  `),
  );

/** 22. Payment Failed */
export const paymentFailedEmail = (
  userName: string,
  amount: string,
  reason: string,
  retryDate: string,
) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:20px;font-size:44px;">❌</div>
    ${badge('Payment Failed', '#ef4444')}
    ${title(`Payment unsuccessful, ${userName}`)}
    ${para(`We were unable to process your payment of <strong style="color:#ef4444;">${amount}</strong>. Please update your payment method to avoid service interruption.`)}
    ${infoTable(infoRow('Amount', amount) + infoRow('Reason', reason) + infoRow('Next Retry', retryDate))}
    ${ctaButton('Update Payment Method', '#', '#ef4444')}
  `),
  );

/** 23. Subscription Renewed */
export const subscriptionRenewedEmail = (
  userName: string,
  plan: string,
  nextBillingDate: string,
  amount: string,
) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:20px;font-size:44px;">🔄</div>
    ${badge('Subscription Renewed', '#22c55e')}
    ${title(`Your ${plan} plan has been renewed`)}
    ${para(`Hi ${userName}, your SmartHome subscription has been automatically renewed. Your smart home features will continue without interruption.`)}
    ${infoTable(infoRow('Plan', plan) + infoRow('Amount Charged', amount) + infoRow('Next Billing Date', nextBillingDate))}
    ${ctaButton('Manage Subscription')}
  `),
  );

/** 24. Subscription Expiry Warning */
export const subscriptionExpiryEmail = (
  userName: string,
  plan: string,
  expiryDate: string,
) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:20px;font-size:44px;">⏳</div>
    ${badge('Subscription Expiring Soon', '#f59e0b')}
    ${title(`Your plan expires soon, ${userName}`)}
    ${para(`Your <strong style="color:#e8f4f8;">${plan}</strong> subscription is set to expire on <strong style="color:#f59e0b;">${expiryDate}</strong>. Renew now to avoid losing access to your smart home controls.`)}
    ${alertBox('⚠️', 'After expiry, your device automations and remote access will be paused until you renew.', '#f59e0b')}
    ${ctaButton('Renew Now →', '#', '#f59e0b')}
  `),
  );

/** 25. Invoice */
export const invoiceEmail = (
  userName: string,
  invoiceNumber: string,
  items: { label: string; amount: string }[],
  total: string,
  date: string,
) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:20px;font-size:44px;">🧾</div>
    ${badge('Invoice')}
    ${title(`Invoice #${invoiceNumber}`)}
    ${para(`Hi ${userName}, here is your invoice for the billing period ending ${date}.`)}
    ${infoTable(items.map(i => infoRow(i.label, i.amount)).join(''))}
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.2);border-radius:10px;margin-bottom:24px;">
      <tr>
        <td class="total-label" style="font-size:14px;color:#8ab4c4;font-weight:600;padding:16px 20px;">Total</td>
        <td class="total-amount" style="text-align:right;font-size:20px;color:#00d4ff;font-weight:800;padding:16px 20px;">${total}</td>
      </tr>
    </table>
    ${ctaButton('Download PDF Invoice')}
  `),
  );

/** 26. Plan Upgrade */
export const planUpgradeEmail = (
  userName: string,
  oldPlan: string,
  newPlan: string,
  effectiveDate: string,
) =>
  baseWrapper(
    bodyWrap(`
    <div style="text-align:center;margin-bottom:20px;font-size:44px;">⬆️🏠</div>
    ${badge('Plan Upgraded', '#22c55e')}
    ${title(`You've upgraded to ${newPlan}!`)}
    ${para(`Congratulations ${userName}! You've successfully upgraded from <strong style="color:#8ab4c4;">${oldPlan}</strong> to <strong style="color:#00d4ff;">${newPlan}</strong>. Enjoy your expanded SmartHome experience.`)}
    ${infoTable(infoRow('Previous Plan', oldPlan) + infoRow('New Plan', newPlan) + infoRow('Effective From', effectiveDate))}
    ${ctaButton('Explore New Features →', '#', '#22c55e')}
  `),
  );

// ============================================================
//  📩  ADMIN → USER CUSTOM EMAIL
// ============================================================

export interface IAdminMailPayload {
  toName: string;
  toEmail: string;
  subject: string;
  body: string;
  adminName?: string;
  priority?: 'normal' | 'important' | 'urgent';
}

export const generateAdminCustomEmail = (
  payload: IAdminMailPayload,
): string => {
  const {
    toName,
    subject,
    body,
    adminName = 'SmartHome Admin',
    priority = 'normal',
  } = payload;

  const priorityConfig = {
    normal: { label: 'Message from Admin', color: '#00d4ff', icon: '📩' },
    important: { label: 'Important Notice', color: '#f59e0b', icon: '⚠️' },
    urgent: { label: 'Urgent — Action Required', color: '#ef4444', icon: '🚨' },
  };

  const { label, color, icon } = priorityConfig[priority];

  const formattedBody = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  ${responsiveStyles}
</head>
<body style="margin:0;padding:0;background:#0b0f1a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;min-width:320px;">
  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
    style="background:#0b0f1a;padding:40px 20px;">
    <tr><td align="center">
      <table class="email-table" width="600" cellpadding="0" cellspacing="0" border="0" role="presentation"
        style="max-width:600px;width:100%;min-width:320px;">

        <!-- HEADER -->
        <tr>
          <td class="email-header" style="background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);border-radius:16px 16px 0 0;padding:34px 40px 28px;text-align:center;">
            <div class="logo-icon" style="display:inline-block;background:rgba(0,212,255,0.12);border:1.5px solid rgba(0,212,255,0.3);border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;margin-bottom:14px;">
              <span style="font-size:28px;">🏠</span>
            </div>
            <h1 class="logo-title" style="margin:0;font-size:24px;font-weight:700;color:#fff;letter-spacing:0.5px;">
              Smart<span style="color:#00d4ff;">Home</span>
            </h1>
            <p style="margin:5px 0 0;font-size:11px;color:#8ab4c4;letter-spacing:2.5px;text-transform:uppercase;">
              Intelligent Living System
            </p>
          </td>
        </tr>

        <!-- PRIORITY BADGE -->
        <tr>
          <td class="badge-bar" style="background:${color}18;border-left:1px solid #1e2d3d;border-right:1px solid #1e2d3d;padding:12px 40px;border-bottom:1px solid ${color}30;">
            <p style="margin:0;font-size:11px;color:${color};text-transform:uppercase;letter-spacing:2px;font-weight:600;">
              ${icon}&nbsp;&nbsp;${label}
            </p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td class="email-body" style="background:#111927;padding:36px 40px;border-left:1px solid #1e2d3d;border-right:1px solid #1e2d3d;">

            <p style="margin:0 0 6px;font-size:13px;color:#4a7a8a;">Dear,</p>
            <h2 class="greeting-name" style="margin:0 0 24px;font-size:22px;color:#e8f4f8;font-weight:700;">${toName}</h2>

            <div style="height:1px;background:linear-gradient(90deg,${color}60,transparent);margin-bottom:24px;"></div>

            <p style="margin:0 0 6px;font-size:10px;color:#3a6a7a;text-transform:uppercase;letter-spacing:2px;">Subject</p>
            <div class="subject-box" style="background:#0d1824;border-radius:8px;padding:13px 18px;margin-bottom:24px;border-left:3px solid ${color};">
              <p class="subject-text" style="margin:0;font-size:15px;color:#e8f4f8;font-weight:600;word-break:break-word;">${subject}</p>
            </div>

            <p style="margin:0 0 8px;font-size:10px;color:#3a6a7a;text-transform:uppercase;letter-spacing:2px;">Message</p>
            <div class="body-box" style="background:#0d1824;border-radius:10px;padding:22px;margin-bottom:28px;border:1px solid #1e2d3d;">
              <p class="body-text" style="margin:0;font-size:14px;color:#8ab4c4;line-height:1.85;word-break:break-word;">${formattedBody}</p>
            </div>

            <div style="height:1px;background:linear-gradient(90deg,transparent,#1e2d3d,transparent);margin-bottom:24px;"></div>

            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:middle;">
                  <span style="font-size:18px;vertical-align:middle;margin-right:8px;">👤</span>
                  <span style="font-size:13px;color:#5a8a9a;vertical-align:middle;">Sent by&nbsp;</span>
                  <span style="font-size:13px;color:#00d4ff;font-weight:600;vertical-align:middle;">${adminName}</span>
                </td>
                <td class="sent-by-right" style="text-align:right;vertical-align:middle;">
                  <span style="font-size:11px;color:#2a4a5a;background:#0d1520;padding:4px 12px;border-radius:20px;border:1px solid #1e2d3d;">
                    SmartHome Admin Panel
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td class="email-footer" style="background:#0d1520;border-radius:0 0 16px 16px;border:1px solid #1e2d3d;border-top:none;padding:22px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;color:#3a5a6a;">© 2025 SmartHome Intelligent Living System. All rights reserved.</p>
            <p style="margin:0;font-size:11px;color:#2a4a5a;">
              <a href="#" style="color:#00d4ff;text-decoration:none;">Privacy Policy</a>&nbsp;·&nbsp;
              <a href="#" style="color:#00d4ff;text-decoration:none;">Support</a>&nbsp;·&nbsp;
              <a href="#" style="color:#00d4ff;text-decoration:none;">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

export const welcomeEmailTemplate = ({
  fullName,
  email,
  password,
  role,
  createdByName,
}: {
  fullName: string;
  email: string;
  password: string;
  role: string;
  createdByName: string;
}) =>
  baseWrapper(`
    <!-- ── BADGE BAR ── -->
    <tr>
      <td class="badge-bar" style="background:rgba(0,212,255,0.07);border-left:1px solid #1e2d3d;border-right:1px solid #1e2d3d;padding:12px 40px;border-bottom:1px solid rgba(0,212,255,0.15);">
        <p style="margin:0;font-size:11px;color:#00d4ff;text-transform:uppercase;letter-spacing:2px;font-weight:600;">
          👤&nbsp;&nbsp;New Account Created — ${role}
        </p>
      </td>
    </tr>

    <!-- ── BODY ── -->
    <tr>
      <td class="email-body" style="background:#111927;padding:36px 40px;border-left:1px solid #1e2d3d;border-right:1px solid #1e2d3d;">

        <p style="margin:0 0 4px;font-size:13px;color:#4a7a8a;">Welcome,</p>
        <h2 class="greeting-name" style="margin:0 0 24px;font-size:22px;color:#e8f4f8;font-weight:700;">
          ${fullName} 👋
        </h2>

        <div style="height:1px;background:linear-gradient(90deg,#00d4ff60,transparent);margin-bottom:24px;"></div>

        <p class="email-para" style="margin:0 0 20px;font-size:14px;color:#7a9bae;line-height:1.75;">
          <strong style="color:#e8f4f8;">${createdByName}</strong> has added you as a
          <strong style="color:#00d4ff;">${role}</strong> on the SmartHome platform.
          Your account is ready — use the credentials below to log in and get started.
        </p>

        <!-- Credentials Box -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="background:#0d1824;border-radius:10px;margin-bottom:24px;overflow:hidden;">
          <tr>
            <td colspan="2" style="background:rgba(0,212,255,0.08);padding:12px 20px;border-bottom:1px solid #1e2d3d;">
              <p style="margin:0;font-size:10px;color:#4a7a8a;text-transform:uppercase;letter-spacing:2px;font-weight:700;">
                🔐 Your Login Credentials
              </p>
            </td>
          </tr>
          <tr>
            <td class="info-label" style="padding:14px 20px;border-bottom:1px solid #1e2d3d;font-size:12px;color:#4a7a8a;text-transform:uppercase;letter-spacing:1px;width:100px;vertical-align:middle;">
              📧 Email
            </td>
            <td class="info-value" style="padding:14px 20px;border-bottom:1px solid #1e2d3d;font-size:14px;color:#00d4ff;font-weight:700;word-break:break-word;vertical-align:middle;">
              ${email}
            </td>
          </tr>
          <tr>
            <td class="info-label" style="padding:14px 20px;font-size:12px;color:#4a7a8a;text-transform:uppercase;letter-spacing:1px;width:100px;vertical-align:middle;">
              🔑 Password
            </td>
            <td class="info-value" style="padding:14px 20px;font-size:14px;color:#00d4ff;font-weight:700;font-family:'Courier New',monospace;vertical-align:middle;">
              ${password}
            </td>
          </tr>
        </table>

        <!-- Warning -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
          <tr>
            <td style="background:#0d1824;border-radius:10px;padding:16px 20px;border-left:3px solid #f59e0b;">
              <p style="margin:0;font-size:13px;color:#5a8a9a;line-height:1.65;">
                ⚠️&nbsp;
                <strong style="color:#f59e0b;">Security Notice:</strong>
                <span style="color:#8ab4c4;">Please change your password immediately after your first login to keep your account secure.</span>
              </p>
            </td>
          </tr>
        </table>

        <!-- CTA -->
        <div style="text-align:center;margin:0 0 28px;">
          <a class="cta-btn" href="${process.env.FRONTEND_URL}/login"
            style="background:linear-gradient(135deg,#00d4ff,#0099bb);color:#0b0f1a;text-decoration:none;font-weight:700;padding:13px 34px;border-radius:8px;font-size:14px;display:inline-block;letter-spacing:0.3px;">
            Login to SmartHome →
          </a>
        </div>

        <div style="height:1px;background:linear-gradient(90deg,transparent,#1e2d3d,transparent);margin-bottom:24px;"></div>

        <!-- Sent by -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:middle;">
              <span style="font-size:18px;vertical-align:middle;margin-right:8px;">👤</span>
              <span style="font-size:13px;color:#5a8a9a;vertical-align:middle;">Added by&nbsp;</span>
              <span style="font-size:13px;color:#00d4ff;font-weight:600;vertical-align:middle;">${createdByName}</span>
            </td>
            <td style="text-align:right;vertical-align:middle;">
              <span style="font-size:11px;color:#2a4a5a;background:#0d1520;padding:4px 12px;border-radius:20px;border:1px solid #5a8a9a;">
                SmartHome Platform
              </span>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  `);