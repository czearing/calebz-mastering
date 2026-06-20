"use client";

import { useEffect } from "react";
import { cartHasAddon, cartToConsole, toQueryString, type Cart } from "@/lib/checkout";
import { useCheckout, FULL_FLOW, type Step } from "./useCheckout";
import { usePersisted } from "./usePersisted";
import { useUpload } from "./useUpload";
import { PackageStep } from "./PackageStep";
import { AddonsStep } from "./AddonsStep";
import { TracksStep } from "./TracksStep";
import { SummaryStep } from "./SummaryStep";
import { UploadStep } from "./UploadStep";
import { PaymentStep } from "./PaymentStep";
import { ConfirmStep } from "./ConfirmStep";
import { payerDefaults, type PayerInput } from "./payerSchema";

export type CheckoutFlowProps = {
  // Seed cart, for stories and tests. Defaults to empty.
  initialCart?: Cart;
  // The ordered steps to page through. A seeded hand-off passes the short
  // Review, Send your tracks, Pay, Confirm flow (SEEDED_FLOW) so numbering
  // reads "of 4" and the builder steps never reappear. Defaults to the full
  // flow.
  flow?: Step[];
  // Where quote-only and fallback CTAs route. The contact section on home.
  contactHref?: string;
  // The order id the upload keys against. Real flow gets it from the paid
  // session; the demo passes a stable placeholder.
  orderId?: string;
  // Persist progress so a reload or stepping back does not lose it: the payer
  // is mirrored to localStorage and in-place order edits are mirrored to the
  // URL (the cart's source of truth on /start). Off for stories and tests so
  // they stay hermetic. See plan/32.
  persist?: boolean;
};

// The one client flow: a shell holding cart state and the current step, paging
// through the steps in its flow. Each step is its own component; this shell only
// routes between them and owns the cross-step state (payer and the uploaded
// files) so stepping back never wipes it. The step counter ("Step N of M")
// derives from the flow length, so a seeded 4-step flow reads "of 4". See
// plan/32.
export function CheckoutFlow({
  initialCart,
  flow: steps = FULL_FLOW,
  contactHref = "/#contact",
  orderId = "demo-order",
  persist = false,
}: CheckoutFlowProps) {
  const flow = useCheckout(initialCart, steps);
  const upload = useUpload(orderId);
  const [payer, setPayer] = usePersisted<PayerInput>(
    persist ? `cz-checkout-payer-${orderId}` : undefined,
    payerDefaults,
  );
  const stepNumber = flow.index + 1;

  // Mirror in-place order edits to the URL, so a reload rebuilds the edited
  // cart (the URL is what /start parses). Only when persisting, and guarded for
  // SSR. Replace, not push, so Back does not walk through every edit.
  const { cart } = flow;
  useEffect(() => {
    if (!persist || typeof window === "undefined") return;
    const cfg = cartToConsole(cart);
    const qs = toQueryString(cfg.trackCount, cfg.addons);
    window.history.replaceState(null, "", `${window.location.pathname}?${qs}`);
  }, [persist, cart]);

  return (
    <div className="mx-auto flex w-full max-w-[var(--max-reading)] flex-col">
      {flow.step === "package" ? (
        <PackageStep
          trackCount={flow.trackCount}
          totalCents={flow.totalCents}
          index={stepNumber}
          count={flow.stepCount}
          onAddTrack={() => flow.addTrack()}
          onRemoveLast={() => {
            const last = flow.cart.tracks.at(-1);
            if (last) flow.removeTrack(last.id);
          }}
          onNext={flow.next}
        />
      ) : null}

      {flow.step === "addons" ? (
        <AddonsStep
          cart={flow.cart}
          index={stepNumber}
          count={flow.stepCount}
          onSetAddon={flow.setAddon}
          onBack={flow.back}
          onNext={flow.next}
        />
      ) : null}

      {flow.step === "tracks" ? (
        <TracksStep
          cart={flow.cart}
          index={stepNumber}
          count={flow.stepCount}
          onRename={flow.renameTrack}
          onRemove={flow.removeTrack}
          onAddTrack={() => flow.addTrack()}
          onBack={flow.back}
          onNext={flow.next}
        />
      ) : null}

      {flow.step === "summary" ? (
        <SummaryStep
          summary={flow.review}
          totalCents={flow.totalCents}
          isQuote={flow.isQuote}
          cart={flow.cart}
          hasStems={cartHasAddon(flow.cart, "stems")}
          index={stepNumber}
          count={flow.stepCount}
          onEditCart={flow.setCart}
          onBack={flow.index > 0 ? flow.back : undefined}
          onNext={flow.next}
        />
      ) : null}

      {flow.step === "upload" ? (
        <UploadStep
          cart={flow.cart}
          summary={flow.review}
          totalCents={flow.totalCents}
          index={stepNumber}
          count={flow.stepCount}
          orderId={orderId}
          payer={payer}
          onPayerChange={setPayer}
          items={upload.items}
          onAddFiles={upload.add}
          onRemoveFile={upload.remove}
          onBack={flow.back}
          onContinue={flow.next}
        />
      ) : null}

      {flow.step === "payment" ? (
        <PaymentStep
          cart={flow.cart}
          payer={payer}
          index={stepNumber}
          count={flow.stepCount}
          contactHref={contactHref}
          onBack={flow.back}
          onPaid={() => flow.next()}
        />
      ) : null}

      {flow.step === "confirm" ? (
        <ConfirmStep name={payer.name} orderId={orderId} />
      ) : null}
    </div>
  );
}
