import { cn } from "@/lib/cn";

export type CheckoutStepsProps = {
  // Short labels for the steps in order, e.g. ["Review","Details","Upload","Pay"].
  // The final confirmation step is not shown here.
  labels: string[];
  // Zero-based index of the current step within labels.
  current: number;
};

// A horizontal progress bar for the checkout, in the same playhead spirit as the
// "how it works" rail: a numbered dot per step joined by a hairline that fills
// cyan up to where you are, with the current step lit. It replaces the verbose
// "Step 3 of 4" text and gives the flow a guided, premium read. Labels collapse
// to dots on narrow screens; the step's own title carries the name there.
export function CheckoutSteps({ labels, current }: CheckoutStepsProps) {
  return (
    <ol
      aria-label="Checkout progress"
      className="flex w-full items-center"
    >
      {labels.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === labels.length - 1;
        return (
          <li
            key={label}
            className={cn("flex items-center", !last && "flex-1")}
          >
            <span className="flex items-center gap-[var(--space-2)]">
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full border text-label font-mono tabular-nums transition-colors",
                  active
                    ? "border-cyan bg-cyan text-bg"
                    : done
                      ? "border-cyan text-cyan"
                      : "border-line text-muted",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={cn(
                  "hidden whitespace-nowrap text-label font-mono uppercase tracking-[0.06em] sm:inline",
                  active ? "text-text" : done ? "text-cyan" : "text-muted",
                )}
              >
                {label}
              </span>
            </span>
            {!last ? (
              <span
                aria-hidden
                className={cn(
                  "mx-[var(--space-3)] h-px flex-1 transition-colors",
                  done ? "bg-cyan" : "bg-line",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
