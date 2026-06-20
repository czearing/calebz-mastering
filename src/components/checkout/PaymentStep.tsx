"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui";
import { cartTotalCents, formatUsd, type Cart } from "@/lib/checkout";
import type { PayerInput } from "./payerSchema";
import { StepHeader } from "./StepHeader";
import { StepNav } from "./StepNav";

// Anchors styled as actions: the settled-state CTAs navigate to contact, so
// they are real links, not buttons.
const linkBtn =
  "inline-flex min-h-[44px] items-center justify-center gap-2 self-start " +
  "rounded-[var(--radius-sm)] bg-cyan px-5 py-3 text-label font-mono uppercase " +
  "tracking-[0.06em] text-bg transition-colors hover:bg-cyan-dim";
const linkGhost =
  "inline-flex min-h-[44px] items-center justify-center gap-2 self-start " +
  "rounded-[var(--radius-sm)] border border-line px-5 py-3 text-label font-mono " +
  "uppercase tracking-[0.06em] text-text transition-colors hover:border-cyan hover:text-cyan";

// Stripe is heavy, split off the bundle. ssr off.
const StripeMount = dynamic(
  () => import("./StripeMount").then((m) => m.StripeMount),
  { ssr: false },
);

// The three shapes /api/checkout can return, by contract. See plan/29.
type CheckoutResponse =
  | { clientSecret: string }
  | { quoteOnly: true }
  | { configured: false };

export type PaymentStepProps = {
  cart: Cart;
  // The payer collected on the upload step, threaded in. No form here anymore.
  payer: PayerInput;
  index: number;
  count: number;
  onBack: () => void;
  // Called once settled (paid, or the configured:false demo) to reveal confirm.
  onPaid: (payer: PayerInput) => void;
  contactHref?: string;
};

const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export function PaymentStep({
  cart,
  payer,
  index,
  count,
  onBack,
  onPaid,
  contactHref = "/#contact",
}: PaymentStepProps) {
  const [result, setResult] = useState<CheckoutResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function pay() {
    setFailed(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, contact: payer }), // contract: { cart, contact }
      });
      if (!res.ok) {
        setFailed(true);
        return;
      }
      setResult((await res.json()) as CheckoutResponse);
    } catch {
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  }

  // Atmos and any quote-gated cart route to the contact form for a quote.
  if (result && "quoteOnly" in result) {
    return (
      <Settled title="Request a quote">
        <p className="text-body text-muted">
          This order includes Dolby Atmos, which is priced per project. Send the
          details and you get a quote back.
        </p>
        <a href={contactHref} className={linkBtn}>
          Request a quote
        </a>
      </Settled>
    );
  }

  // Stripe not connected yet: a tasteful holding state, payment-ready later.
  if (result && "configured" in result) {
    return (
      <Settled title="Checkout activates once payment is connected">
        <p className="text-body text-muted">
          Card payment is being set up. Your tracks are in and your order is
          ready. Send it through the contact form and pay when checkout goes
          live, or preview what happens next.
        </p>
        <div className="flex items-center gap-[var(--space-3)]">
          <Button onClick={() => onPaid(payer)}>See the demo</Button>
          <a href={contactHref} className={linkGhost}>
            Send via contact
          </a>
        </div>
      </Settled>
    );
  }

  // Paid path: a clientSecret came back. Mount Stripe only if we also have a
  // publishable key in the client env; otherwise fall back to the demo reveal.
  if (result && "clientSecret" in result) {
    return (
      <Settled title="Pay">
        {pubKey ? (
          <StripeMount clientSecret={result.clientSecret} publishableKey={pubKey} />
        ) : (
          <Button onClick={() => onPaid(payer)}>Continue</Button>
        )}
      </Settled>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <StepHeader index={index} count={count} title="Pay" />
      <p className="flex items-baseline justify-between border-b border-line pb-[var(--space-3)] font-mono text-label uppercase tracking-[0.06em] text-muted">
        <span>Order total</span>
        <span className="text-h2 normal-case tracking-normal text-text">
          {formatUsd(cartTotalCents(cart))}
        </span>
      </p>

      {/* Two plain lines, not a wall of reassurance: what happens next, and who
          is being paid. The free-first-master invite and the revisions promise
          live earlier, on Review. */}
      <p className="text-body text-text">
        Your tracks are in. I email you within one business day and master to
        your reference, usually about three days.
      </p>
      <p className="text-body text-muted">
        You are paying CalebZ, an independent mastering engineer in Seattle.
        Payment runs through Stripe.
      </p>

      {failed ? (
        <p role="alert" className="text-label font-mono text-error">
          That did not go through. Try again in a moment.
        </p>
      ) : null}

      <StepNav onBack={onBack}>
        <Button onClick={pay} disabled={submitting}>
          Pay
        </Button>
      </StepNav>
    </div>
  );
}

// Shared frame for the three settled (non-form) outcomes.
function Settled(props: { title: string; children: React.ReactNode }) {
  const { title, children } = props;
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <h1 className="text-h2 font-sans text-text">{title}</h1>
      {children}
    </div>
  );
}
