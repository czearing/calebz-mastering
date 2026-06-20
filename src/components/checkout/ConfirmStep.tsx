"use client";

import { Tag } from "@/components/ui";

export type ConfirmStepProps = {
  // The payer's name, to greet them after payment.
  name?: string;
  // The order id, surfaced as a short reference the customer can quote.
  orderId: string;
};

// Final step, after payment. Upload already happened on step 2, so there is no
// dropzone here. Confirm that both the tracks and the payment are in, restate
// the next steps and contact promise, and give a short order reference the
// customer can quote in any reply. See plan/32.
export function ConfirmStep({ name, orderId }: ConfirmStepProps) {
  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <header className="flex flex-col gap-[var(--space-2)]">
        <Tag className="self-start text-cyan">Order confirmed</Tag>
        <h1 className="text-h2 font-sans text-text">
          {name
            ? `Thanks, ${name}. I have your tracks and your payment.`
            : "Thanks. I have your tracks and your payment."}
        </h1>
        <p className="text-body text-muted">
          I email you at your address within one business day, and your master
          arrives through a private delivery link, yours alone and not indexed.
          Turnaround is about three days from now. If anything is unclear, reply
          to that email or reach me through the contact form.
        </p>
      </header>

      <section className="flex flex-col gap-[var(--space-2)]">
        <h2 className="text-label font-mono uppercase tracking-[0.06em] text-muted">
          Order reference
        </h2>
        <p className="text-body font-mono tabular-nums text-text">{orderId}</p>
        <p className="text-label font-mono text-muted">
          Quote this if you need to reach me about your order.
        </p>
      </section>
    </div>
  );
}
