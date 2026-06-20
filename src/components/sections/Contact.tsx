import { Section } from "@/components/ui";
import { hero as defaultHero } from "@/content";
import type { Hero as HeroContent } from "@/content";
import { ContactFormLazy } from "./ContactFormLazy";

export type ContactProps = {
  title?: string;
  line?: string;
  // The free-first-master offer (plan/22) and response time fill the left
  // column with proof so it reads as a balanced column, not an empty void.
  offer?: HeroContent["offer"];
  response?: string;
};

// Make booking effortless. One screen, the form does the work. The left column
// carries the proof: the invite, the free first master, and the response time.
// The form on the right carries validation and the risk-reversal line.
// See plan/07, plan/08, plan/10, plan/22.
export function Contact({
  title = "Send one track, mastered free",
  line = "Tell me about the track.",
  offer = defaultHero.offer,
  response = "I reply within one business day.",
}: ContactProps) {
  return (
    <Section id="contact" heading={title}>
      <div className="grid gap-[var(--space-7)] md:grid-cols-[1fr_minmax(0,32rem)]">
        <div className="flex max-w-[var(--max-reading)] flex-col gap-[var(--space-4)]">
          <p className="text-body text-text">{line}</p>
          <p className="text-body text-muted">{offer}</p>
          <p className="text-label font-mono uppercase tracking-[0.06em] text-muted">
            {response}
          </p>
        </div>
        <ContactFormLazy />
      </div>
    </Section>
  );
}
