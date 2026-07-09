"use client";

import { useEffect } from "react";
import { cartHasAddon, cartToConsole, toQueryString } from "@/lib/checkout";
import { useCheckout, FULL_FLOW, type Step } from "./useCheckout";
import { usePersisted } from "./usePersisted";
import { useUpload } from "./useUpload";
import { PackageStep } from "./PackageStep";
import { AddonsStep } from "./AddonsStep";
import { TracksStep } from "./TracksStep";
import { SummaryStep } from "./SummaryStep";
import { DetailsStep } from "./DetailsStep";
import { UploadStep } from "./UploadStep";
import { NotesStep } from "./NotesStep";
import { PaymentStep } from "./PaymentStep";
import { ConfirmStep } from "./ConfirmStep";
import { CheckoutSteps } from "./CheckoutSteps";
import { payerDefaults, type PayerInput } from "./payerSchema";
import { useFreeMaster } from "./useFreeMaster";
import { STEP_LABELS, type CheckoutFlowProps } from "./checkoutFlowConfig";

export type { CheckoutFlowProps } from "./checkoutFlowConfig";

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
  // Once an order is placed, the confirmation is durable: the "done" flag is
  // persisted per order, so a reload or coming back to /start lands on the
  // order-completed screen instead of restarting checkout. Starting a new order
  // clears it. See plan/32.
  const [done, setDone] = usePersisted<boolean>(
    persist ? `cz-checkout-done-${orderId}` : undefined,
    false,
  );
  const [free, setFree] = useFreeMaster(flow.cart, flow.setCart);

  // The horizontal step bar: every step except the final confirmation, with the
  // current one lit. Hidden on the confirmation screen, which is its own moment.
  const barSteps: Step[] = steps.filter((s) => s !== "confirm");
  const barCurrent = barSteps.findIndex((s) => s === flow.step);

  // A placed order is terminal: if the persisted "done" flag hydrates true (a
  // reload or a return visit), jump straight to the confirmation rather than
  // showing checkout again. Guarded so it never fights the user mid-flow.
  const { goTo, step: currentStep } = flow;
  useEffect(() => {
    if (done && currentStep !== "confirm") goTo("confirm");
  }, [done, currentStep, goTo]);

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
    <div className="mx-auto flex w-full max-w-[var(--max-reading)] flex-col gap-[var(--space-8)]">
      {flow.step !== "confirm" ? (
        <CheckoutSteps
          labels={barSteps.map((s) => STEP_LABELS[s])}
          current={barCurrent}
        />
      ) : null}

      {flow.step === "package" ? (
        <PackageStep
          trackCount={flow.trackCount}
          totalCents={flow.totalCents}
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
          onSetAddon={flow.setAddon}
          onBack={flow.back}
          onNext={flow.next}
        />
      ) : null}

      {flow.step === "tracks" ? (
        <TracksStep
          cart={flow.cart}
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
          free={free}
          onSetFree={setFree}
          onEditCart={flow.setCart}
          onBack={flow.index > 0 ? flow.back : undefined}
          onNext={flow.next}
        />
      ) : null}

      {flow.step === "details" ? (
        <DetailsStep
          payer={payer}
          onPayerChange={setPayer}
          onBack={flow.back}
          onNext={flow.next}
        />
      ) : null}

      {flow.step === "upload" ? (
        <UploadStep
          cart={flow.cart}
          summary={flow.review}
          totalCents={flow.totalCents}
          free={free}
          orderId={orderId}
          items={upload.items}
          onAddFiles={upload.add}
          onRemoveFile={upload.remove}
          onRenameFile={upload.rename}
          onBack={flow.back}
          onContinue={flow.next}
        />
      ) : null}

      {flow.step === "notes" ? (
        <NotesStep
          payer={payer}
          onPayerChange={setPayer}
          onBack={flow.back}
          onNext={flow.next}
        />
      ) : null}

      {flow.step === "payment" ? (
        <PaymentStep
          cart={flow.cart}
          payer={payer}
          free={free}
          contactHref={contactHref}
          onBack={flow.back}
          onPaid={() => {
            setDone(true);
            flow.next();
          }}
        />
      ) : null}

      {flow.step === "confirm" ? (
        <ConfirmStep
          name={payer.name}
          orderId={orderId}
          free={free}
          startOverHref="/#services"
          onStartOver={() => setDone(false)}
        />
      ) : null}
    </div>
  );
}
