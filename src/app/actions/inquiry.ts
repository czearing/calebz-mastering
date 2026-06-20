"use server";

import { inquirySchema, type InquiryInput } from "@/lib/inquiry";

export type InquiryResult =
  | { ok: true }
  | { ok: false; message: string };

// Server action for the booking form. Validates with the same schema the client
// uses, so a forged or scripted request is rejected the same way. See plan/10.
export async function submitInquiry(
  input: InquiryInput,
): Promise<InquiryResult> {
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Something looks off. Check the fields and try again." };
  }

  // Honeypot tripped. Pretend success so bots get no signal.
  if (parsed.data.company) return { ok: true };

  // TODO(CalebZ): wire Resend to email this inquiry to you.
  //   1. npm i resend
  //   2. Add RESEND_API_KEY to the environment (never commit it).
  //   3. Replace this block with:
  //        const { Resend } = await import("resend");
  //        const resend = new Resend(process.env.RESEND_API_KEY);
  //        await resend.emails.send({
  //          from: "inquiries@yourdomain.com",
  //          to: "you@yourdomain.com",
  //          replyTo: parsed.data.email,
  //          subject: `New master inquiry: ${parsed.data.projectType}`,
  //          text: `${parsed.data.name} <${parsed.data.email}>\n` +
  //                `Links: ${parsed.data.links || "none"}\n\n` +
  //                `${parsed.data.message || "(no message)"}`,
  //        });
  //   No secrets are added here. Until wired, submissions validate and confirm
  //   but are not delivered.

  return { ok: true };
}
