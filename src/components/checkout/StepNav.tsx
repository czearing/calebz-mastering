import { Button } from "@/components/ui";

export type StepNavProps = {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  // Disable the forward action until the step is valid (no tracks yet, etc.).
  nextDisabled?: boolean;
  // Right-side slot for a step that owns its own forward control (the pay
  // step submits a form rather than calling onNext).
  children?: React.ReactNode;
};

// The back/continue row at the foot of a step. Back is a ghost so the cyan
// stays on the single forward action. Both are real buttons, keyboard
// operable, with the global cyan focus ring. See plan/13.
export function StepNav({
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled,
  children,
}: StepNavProps) {
  return (
    <div className="flex items-center justify-between gap-[var(--space-4)]">
      {onBack ? (
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
      ) : (
        <span />
      )}
      {children ??
        (onNext ? (
          <Button onClick={onNext} disabled={nextDisabled}>
            {nextLabel}
          </Button>
        ) : null)}
    </div>
  );
}
