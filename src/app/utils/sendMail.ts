import nodemailer from 'nodemailer';

// ======================== OTP EMAIL ========================
export const generateOtpEmail = (otp: string, userName?: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SmartHome OTP Verification</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0f1a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0f1a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);border-radius:16px 16px 0 0;padding:40px 40px 30px;text-align:center;">
              
              <!-- Logo / Icon Area -->
              <div style="display:inline-block;background:rgba(0,212,255,0.12);border:1.5px solid rgba(0,212,255,0.35);border-radius:50%;width:72px;height:72px;line-height:72px;text-align:center;margin-bottom:18px;">
                <span style="font-size:34px;">🏠</span>
              </div>

              <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">
                Smart<span style="color:#00d4ff;">Home</span>
              </h1>
              <p style="margin:6px 0 0;font-size:13px;color:#8ab4c4;letter-spacing:2px;text-transform:uppercase;">
                Intelligent Living System
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#111927;padding:40px;border-left:1px solid #1e2d3d;border-right:1px solid #1e2d3d;">

              <p style="margin:0 0 10px;font-size:15px;color:#8ab4c4;text-transform:uppercase;letter-spacing:1.5px;">
                Security Verification
              </p>
              <h2 style="margin:0 0 20px;font-size:22px;color:#e8f4f8;font-weight:600;">
                ${userName ? `Hi ${userName}, verify` : 'Verify'} your identity
              </h2>
              <p style="margin:0 0 30px;font-size:15px;color:#7a9bae;line-height:1.7;">
                Your SmartHome account requires a one-time verification code to proceed. 
                Enter the code below to authenticate your session and keep your home secure.
              </p>

              <!-- OTP BOX -->
              <div style="background:linear-gradient(135deg,#0d1f2d,#162535);border:1px solid rgba(0,212,255,0.3);border-radius:12px;padding:30px;text-align:center;margin-bottom:30px;position:relative;">
                
                <!-- Decorative top line -->
                <div style="height:2px;background:linear-gradient(90deg,transparent,#00d4ff,transparent);margin:-30px -30px 25px;border-radius:12px 12px 0 0;"></div>

                <p style="margin:0 0 12px;font-size:12px;color:#4a7a8a;text-transform:uppercase;letter-spacing:3px;">
                  One-Time Password
                </p>
                <div style="font-size:42px;font-weight:800;letter-spacing:14px;color:#00d4ff;font-family:'Courier New',monospace;text-shadow:0 0 20px rgba(0,212,255,0.4);padding:10px 0;">
                  ${otp}
                </div>
                <p style="margin:14px 0 0;font-size:13px;color:#4a7a8a;">
                  ⏱&nbsp; Expires in <strong style="color:#ff6b6b;">10 minutes</strong>
                </p>
              </div>

              <!-- DEVICE / SECURITY INFO -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#0d1824;border-radius:10px;padding:18px 20px;border-left:3px solid #00d4ff;">
                    <p style="margin:0;font-size:13px;color:#5a8a9a;line-height:1.6;">
                      🔒 &nbsp;<strong style="color:#8ab4c4;">Security Notice:</strong> SmartHome will <strong style="color:#e8f4f8;">never</strong> ask for this code via phone or chat. 
                      Do not share it with anyone. If you didn't request this, please 
                      <a href="#" style="color:#00d4ff;text-decoration:none;">secure your account</a> immediately.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- FEATURES REMINDER -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="text-align:center;padding:14px 8px;">
                    <div style="font-size:22px;margin-bottom:6px;">💡</div>
                    <p style="margin:0;font-size:11px;color:#4a7a8a;line-height:1.5;">Smart<br/>Lighting</p>
                  </td>
                  <td width="33%" style="text-align:center;padding:14px 8px;border-left:1px solid #1e2d3d;border-right:1px solid #1e2d3d;">
                    <div style="font-size:22px;margin-bottom:6px;">🔐</div>
                    <p style="margin:0;font-size:11px;color:#4a7a8a;line-height:1.5;">Smart<br/>Security</p>
                  </td>
                  <td width="33%" style="text-align:center;padding:14px 8px;">
                    <div style="font-size:22px;margin-bottom:6px;">🌡️</div>
                    <p style="margin:0;font-size:11px;color:#4a7a8a;line-height:1.5;">Climate<br/>Control</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#0d1520;border-radius:0 0 16px 16px;border:1px solid #1e2d3d;border-top:none;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#3a5a6a;">
                © 2025 SmartHome Intelligent Living System. All rights reserved.
              </p>
              <p style="margin:0;font-size:11px;color:#2a4a5a;">
                <a href="#" style="color:#00d4ff;text-decoration:none;">Privacy Policy</a>
                &nbsp;·&nbsp;
                <a href="#" style="color:#00d4ff;text-decoration:none;">Support</a>
                &nbsp;·&nbsp;
                <a href="#" style="color:#00d4ff;text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
};

// ======================== WELCOME EMAIL ========================
export const generateWelcomeEmail = (userName: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background-color:#0b0f1a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f1a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);border-radius:16px 16px 0 0;padding:40px;text-align:center;">
              <div style="font-size:40px;margin-bottom:14px;">🏠✅</div>
              <h1 style="margin:0;font-size:24px;color:#ffffff;">Welcome to Smart<span style="color:#00d4ff;">Home</span></h1>
              <p style="margin:8px 0 0;color:#8ab4c4;font-size:13px;">Your smart living journey begins now</p>
            </td>
          </tr>
          <tr>
            <td style="background:#111927;padding:40px;border:1px solid #1e2d3d;border-top:none;border-radius:0 0 16px 16px;">
              <p style="color:#e8f4f8;font-size:16px;">Hi <strong>${userName}</strong>,</p>
              <p style="color:#7a9bae;font-size:15px;line-height:1.7;">
                Your account has been successfully verified. You now have full access to your SmartHome dashboard — 
                control your lights, security cameras, climate, and more from anywhere in the world.
              </p>
              <div style="text-align:center;margin:30px 0;">
                <a href="#" style="background:linear-gradient(135deg,#00d4ff,#0099bb);color:#0b0f1a;text-decoration:none;font-weight:700;padding:14px 36px;border-radius:8px;font-size:15px;display:inline-block;">
                  Go to Dashboard →
                </a>
              </div>
              <p style="color:#4a7a8a;font-size:13px;text-align:center;">
                © 2025 SmartHome · <a href="#" style="color:#00d4ff;text-decoration:none;">Support</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// ======================== EMAIL SENDER ========================
const emailSender = async (
  to: string,
  html: string,
  subject: string,
): Promise<string> => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.OWN_MAIL!,
        pass: process.env.OWN_MAIL_PASS!,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: '"SmartHome Security" <barkatullah585464@gmail.com>',
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    return info.messageId;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email. Please try again later.');
  }
};

// const emailSender = async (to: string, html: string, subject: string) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: 'smtp-relay.brevo.com',
//       port: 2525,
//       secure: false,
//       auth: {
//         user: process.env.BREVO_MAIL!,
//         pass: process.env.BREVO_MAIL_PASS!,
//       },
//     });
//     const mailOptions = {
//       from: '<akonhasan680@gmail.com>',
//       to,
//       subject,
//       text: html.replace(/<[^>]+>/g, ''),
//       html,
//     };
//     // Send the email
//     const info = await transporter.sendMail(mailOptions);
//     return info.messageId;
//   } catch (error) {
//     throw new Error('Failed to send email. Please try again later.');
//   }
// };
export default emailSender;
