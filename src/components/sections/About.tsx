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

// "Meet CalebZ": its own calm section after the hero proof and before Work
// (plan/25). The founder note moved here out of the hero so the first viewport
// stays a single A/B statement. Desktop is two columns on a 12-col grid: the
// portrait left (cols 1 to 5) spanning both rows, the words right (cols 7 to
// 12) as note over offer, the photo centered to the text block. The eye lands
// on the face, then reads the note (F-pattern, plan/25). Mobile stacks in a
// single column: eyebrow plus note first (the words carry the trust), then the
// portrait, then the offer and Book action. The three blocks are direct grid
// children placed with `order` (mobile) and explicit row/column (desktop), so
// one DOM order serves both layouts. Tokens only; reads hero.portrait,
// hero.founderNote, hero.offer from content.
export function About({ content = defaultHero }: AboutProps) {
  return (
    <Section id="about" aria-labelledby="about-eyebrow">
      <div className="grid grid-cols-1 items-center gap-[var(--space-8)] md:grid-cols-12 md:gap-x-[var(--space-7)] md:gap-y-[var(--space-6)]">
        {/* Portrait. Desktop cols 1 to 5, spanning both text rows, vertically
            centered to the words. Mobile second, 4:5, full width. */}
        <div className="order-2 md:order-none md:col-span-5 md:row-span-2 md:self-center">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-md)] border border-line">
            <Image
              src={content.portrait}
              alt={PORTRAIT_ALT}
              fill
              sizes="(max-width: 768px) 92vw, 560px"
              className="object-cover"
            />
          </div>
        </div>

        {/* Eyebrow plus founder note. Desktop top-right (cols 7 to 12, row 1),
            mobile first. The note is capped near a 60ch reading column. */}
        <div className="order-1 flex flex-col gap-[var(--space-4)] md:order-none md:col-span-6 md:col-start-7 md:row-start-1 md:self-end">
          <p
            id="about-eyebrow"
            className="text-label font-mono uppercase tracking-[0.06em] text-cyan"
          >
            Meet CalebZ
          </p>
          <p className="max-w-[var(--max-reading)] text-body text-muted">
            {content.founderNote}
          </p>
        </div>

        {/* The free-master offer: a quiet --surface callout with the primary
            Book affordance beneath it. Desktop bottom-right (row 2), mobile
            last, after the portrait. */}
        <div className="order-3 flex flex-col gap-[var(--space-4)] rounded-[var(--radius-md)] border border-line bg-surface p-[var(--space-5)] md:order-none md:col-span-6 md:col-start-7 md:row-start-2 md:self-start">
          <p className="max-w-[var(--max-reading)] text-body text-text">
            {content.offer}
          </p>
          <a
            href="#services"
            className="inline-flex items-center justify-center gap-2 self-start rounded-[var(--radius-sm)] bg-cyan px-5 py-3 text-bg text-label font-mono uppercase tracking-[0.06em] transition-colors hover:bg-cyan-dim hover:text-text"
          >
            {content.primaryAction}
          </a>
        </div>
      </div>
    </Section>
  );
}
