import { Tag } from "@/components/ui";

export type StepHeaderProps = {
  // 1-based position and total, for "Step 2 of 4".
  index: number;
  count: number;
  title: string;
  hint?: string;
};

// The title row every step shares: a mono step counter, the step title, and
// an optional one-line hint. The counter doubles as a quiet progress read so
// the artist always knows where they are. See plan/29, plan/04.
export function StepHeader({ index, count, title, hint }: StepHeaderProps) {
  return (
    <header className="flex flex-col gap-[var(--space-2)]">
      <Tag className="self-start">
        Step {index} of {count}
      </Tag>
      <h1 className="text-h2 font-sans text-text">{title}</h1>
      {hint ? <p className="text-body text-muted">{hint}</p> : null}
    </header>
  );
}
