import { Section } from "@/components/ui";
import { process as processContent } from "@/content";
import type { Process as ProcessContent } from "@/content";
import { ProcessFlow } from "./ProcessFlow";

export type ProcessProps = {
  content?: ProcessContent;
};

// How a track moves through mastering, drawn as a signal flowing down the
// chain: a cyan playhead sits at your reading line and travels as you scroll,
// filling each step's dot as it passes (ProcessFlow). Positions are measured so
// the playhead lands exactly on each dot. Reduced-motion safe. See plan/07.
export function Process({ content = processContent }: ProcessProps) {
  return (
    <Section id="process" heading={content.title}>
      <ProcessFlow steps={content.steps} />
    </Section>
  );
}
