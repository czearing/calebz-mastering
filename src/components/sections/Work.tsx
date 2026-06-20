import { Section, Reveal } from "@/components/ui";
import { WorkGrid } from "@/components/work";
import { work as defaultWork } from "@/content";
import type { Work as WorkContent } from "@/content";

export type WorkProps = {
  content?: WorkContent;
};

// Selected work: a grid of album cards that preview the master pass on hover and
// morph into a before/after modal on open (plan/24 B, C). The heading and line
// read first; WorkGrid owns the cards, the scrub-to-preview, and the modal.
export function Work({ content = defaultWork }: WorkProps) {
  return (
    <Section id="work" heading={content.title}>
      <Reveal>
        <p className="mb-[var(--space-7)] max-w-[var(--max-reading)] text-body text-muted">
          {content.line}
        </p>
      </Reveal>
      <WorkGrid tracks={content.tracks} />
    </Section>
  );
}
