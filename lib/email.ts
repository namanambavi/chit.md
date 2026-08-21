import { Resend } from "resend";

export function emailDeliveryConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendAuthEmail(input: { to: string; subject: string; intro: string; action: string; url: string }) {
  if (!emailDeliveryConfigured()) throw new Error("Email delivery is not configured.");
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!, to: input.to, subject: input.subject,
    text: `${input.intro}\n\n${input.action}: ${input.url}\n\nIf you did not request this, you can ignore this email.`,
    html: `<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:auto;padding:32px;color:#171717"><h1 style="font-size:24px;margin:0 0 16px">chit.md</h1><p style="font-size:16px;line-height:1.6">${input.intro}</p><p style="margin:28px 0"><a href="${input.url}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">${input.action}</a></p><p style="color:#666;font-size:13px;line-height:1.5">If you did not request this, you can ignore this email.</p></div>`,
  });
  if (error) throw new Error(error.message);
}
