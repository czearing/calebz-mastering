"use client";

import { track } from "@vercel/analytics";
import { Section } from "@/components/ui";
import { site } from "@/content";
import { buildMailto } from "@/lib/mailto";

export type ContactDirectProps = {
  email?: string;
};

// The launch contact surface (commerce off): one clear way in. No form — the
// previous one only validated and confirmed, it never actually delivered — so
// this is a real mailto that opens the artist's own mail client pre-filled with
// a short template (see site.inquiry). The address is also shown as plain text
// for anyone who'd rather copy it.
const primaryCta =
  "inline-flex items-center justify-center gap-2 self-start " +
  "rounded-[var(--radius-sm)] bg-cyan px-5 py-4 " +
  "text-label font-mono uppercase tracking-[0.06em] text-bg " +
  "transition-colors hover:bg-cyan-dim hover:text-text";

export function ContactDirect({
  email = site.contactEmail,
}: ContactDirectProps) {
  const href = buildMailto(email, site.inquiry);

  return (
    <Section id="contact" heading="Get in touch">
      <div className="flex max-w-[var(--max-reading)] flex-col gap-[var(--space-5)]">
        <p className="text-body text-text">
          Email me with your references, track count, and deadline. I usually
          reply the same day.
        </p>
        <a
          href={href}
          className={primaryCta}
          onClick={() => track("Contact Click", { source: "primary" })}
        >
          Email me
        </a>
      </div>
    </Section>
  );
}
