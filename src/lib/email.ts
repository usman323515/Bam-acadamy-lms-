import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "BAM Academy <noreply@bamacademy.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function wrapper(title: string, bodyHtml: string) {
  return `
  <div style="font-family:Arial,sans-serif;background:#0a0f1e;padding:32px;color:#e5e7eb;">
    <div style="max-width:520px;margin:0 auto;background:#141d2e;border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,0.08);">
      <div style="font-size:20px;font-weight:800;color:#4ade80;margin-bottom:20px;">BAM Academy</div>
      <h1 style="font-size:18px;color:#fff;margin:0 0 16px;">${title}</h1>
      <div style="font-size:14px;line-height:1.6;color:#94a3b8;">${bodyHtml}</div>
      <div style="margin-top:28px;font-size:12px;color:#64748b;">— MM Empire Academy</div>
    </div>
  </div>`;
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const url = `${APP_URL}/verify-email?token=${token}`;
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your BAM Academy account",
    html: wrapper(
      `Welcome, ${name}!`,
      `Please confirm your email address to activate your account.<br/><br/>
       <a href="${url}" style="display:inline-block;background:#22c55e;color:#0a0f1e;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;">Verify Email</a>
       <br/><br/>This link expires in 24 hours. If you didn't create this account, you can ignore this email.`
    ),
  });
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your BAM Academy password",
    html: wrapper(
      `Hi ${name},`,
      `We received a request to reset your password.<br/><br/>
       <a href="${url}" style="display:inline-block;background:#3b82f6;color:#fff;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;">Reset Password</a>
       <br/><br/>This link expires in 60 minutes. If you didn't request this, you can safely ignore this email.`
    ),
  });
}

export async function sendAnnouncementEmail(to: string, title: string, message: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Announcement: ${title}`,
    html: wrapper(title, message.replace(/\n/g, "<br/>")),
  });
}
