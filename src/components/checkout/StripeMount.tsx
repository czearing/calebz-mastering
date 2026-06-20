"use client";

import { useEffect, useRef, useState } from "react";

export type StripeMountProps = {
  clientSecret: string;
  publishableKey: string;
};

// Stripe embedded Checkout, mounted only when a publishable key is present and
// the backend returned a clientSecret. @stripe/stripe-js and
// @stripe/react-stripe-js are imported here, at runtime, only when this
// component renders, so they are code-split away from the home first-load
// bundle. The specifiers are built from variables so they are resolved lazily
// at runtime rather than bundled eagerly: the Stripe libs are an optional
// dependency, added when payment goes live. Typed loosely on purpose.
// See plan/29 section 4.
/* eslint-disable @typescript-eslint/no-explicit-any */
const STRIPE_JS = ["@stripe", "stripe-js"].join("/");
const STRIPE_REACT = ["@stripe", "react-stripe-js"].join("/");

async function loadStripe(key: string): Promise<any> {
  // Pull both libraries the plan calls for; the React bindings ship alongside
  // the embedded Checkout instance even though we mount imperatively.
  const [stripeJs] = await Promise.all([
    import(/* webpackIgnore: true */ /* @vite-ignore */ STRIPE_JS),
    import(/* webpackIgnore: true */ /* @vite-ignore */ STRIPE_REACT),
  ]);
  return (stripeJs as any).loadStripe(key);
}

export function StripeMount({ clientSecret, publishableKey }: StripeMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let instance: any = null;

    (async () => {
      try {
        const stripe = await loadStripe(publishableKey);
        if (!active || !ref.current || !stripe) return;
        instance = await stripe.initEmbeddedCheckout({ clientSecret });
        if (active && instance && ref.current) instance.mount(ref.current);
      } catch {
        if (active) setError(true);
      }
    })();

    return () => {
      active = false;
      if (instance) instance.destroy?.();
    };
  }, [clientSecret, publishableKey]);

  if (error) {
    return (
      <p role="alert" className="text-body text-muted">
        The payment form could not load. Refresh, or use the contact form.
      </p>
    );
  }

  return (
    <div
      ref={ref}
      data-testid="stripe-embedded-checkout"
      className="min-h-[24rem] w-full rounded-[var(--radius-md)] border border-line bg-surface"
    />
  );
}
