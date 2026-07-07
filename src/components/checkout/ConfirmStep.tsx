"use client";

import { Tag } from "@/components/ui";
import { SuccessCheck } from "./SuccessCheck";

export type ConfirmStepProps = {
  // The payer's name, to greet them after payment.
  name?: string;
  // The order id, surfaced as a short reference the customer can quote.
  orderId: string;
  // First-master-free mode: no payment to confirm, so the copy drops it.
  free?: boolean;
  // Where "Start another master" points (the Services configurator).
  startOverHref?: string;
  // Clears the persisted order so a fresh checkout can begin. Fired on the
  // start-over link before it navigates away.
  onStartOver?: () => void;
};

// The success moment, after payment (or a free claim). An animated check makes it
// land as done, then it says plainly what happens next and gives a short order
// reference. Upload already happened, so there is no dropzone here. See plan/32.
export function ConfirmStep({
  name,
  orderId,
  free = false,
  startOverHref,
  onStartOver,
}: ConfirmStepProps) {
  const heading = name ? `You're all set, ${name}.` : "You're all set.";
  const next = free
    ? "Your tracks are submitted and your first master is on me. I'll email you within a day, and it's usually back in about three days."
    : "Your tracks are submitted and your payment went through. I'll email you within a day, and your master is usually back in about three days.";

  return (
    <div className="flex flex-col items-center gap-[var(--space-5)] py-[var(--space-6)] text-center">
      <SuccessCheck />
      <Tag className="text-cyan">Order placed</Tag>
      <h1 className="text-h2 font-sans text-text">{heading}</h1>
      <p className="max-w-[var(--max-reading)] text-body text-muted">{next}</p>

      <div className="mt-[var(--space-2)] flex flex-col items-center gap-[var(--space-1)] rounded-[var(--radius-md)] border border-line bg-surface px-[var(--space-6)] py-[var(--space-4)]">
        <span className="text-label font-mono uppercase tracking-[0.06em] text-muted">
          Order reference
        </span>
        <span className="text-body font-mono tabular-nums text-text">{orderId}</span>
      </div>
      <p className="text-label font-mono text-muted">
        Quote that if you need to reach me about your order.
      </p>

      {startOverHref ? (
        <a
          href={startOverHref}
          onClick={onStartOver}
          className="mt-[var(--space-2)] text-label font-mono uppercase tracking-[0.06em] text-muted transition-colors hover:text-cyan"
        >
          Start another master
        </a>
      ) : null}
    </div>
  );
}
