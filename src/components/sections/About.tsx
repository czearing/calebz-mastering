import Image from "next/image";
import { Section } from "@/components/ui";
import { hero as defaultHero } from "@/content";
import type { Hero as HeroContent } from "@/content";

export type AboutProps = {
  content?: HeroContent;
};

// Informative portrait: it identifies the founder and is not described by the
// surrounding copy, so it carries real alt text (plan/25 Accessibility).
const PORTRAIT_ALT =
  "CalebZ, mastering engineer, in a dark sweater against a stone column.";

// Restrained editorial profile: portrait, identity, and direct founder copy.
export function About({ content = defaultHero }: AboutProps) {
  return (
    <Section
      id="about"
      aria-labelledby="about-title"
      className="overflow-hidden !py-[var(--space-9)] md:!py-[var(--space-10)]"
    >
      <div className="border-t border-line pt-4">
        <div className="mb-8 flex items-center justify-between font-mono text-label uppercase tracking-[0.12em]">
          <span className="text-cyan">About</span>
          <span className="text-muted">Seattle, WA</span>
        </div>

        <div className="grid items-end gap-8 md:grid-cols-12 md:gap-10">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-md)] border border-line md:col-span-7">
            <Image
              src={content.portrait}
              alt={PORTRAIT_ALT}
              fill
              sizes="(max-width: 768px) 92vw, 620px"
              className="object-cover saturate-[0.72]"
            />
          </div>

          <div className="md:col-span-5 md:pb-8">
            <h2
              id="about-title"
              className="font-sans text-[clamp(2.75rem,6vw,4.75rem)] leading-[0.9] tracking-[-0.055em] text-text"
            >
              Caleb Zearing
            </h2>
            <p className="mt-4 font-mono text-label uppercase tracking-[0.1em] text-cyan">
              Producer and mastering engineer
            </p>
            <p className="mt-8 text-body leading-relaxed text-muted">
              {content.founderNote}
            </p>
            <p className="mt-10 border-t border-line pt-4 font-mono text-label uppercase tracking-[0.1em] text-muted">
              Seattle, Washington
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
