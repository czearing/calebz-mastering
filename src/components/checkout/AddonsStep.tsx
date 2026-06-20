"use client";

import { ADDONS, type AddonId, type Cart } from "@/lib/checkout";
import { StepHeader } from "./StepHeader";
import { StepNav } from "./StepNav";
import { AddonChip } from "./AddonChip";

export type AddonsStepProps = {
  cart: Cart;
  index: number;
  count: number;
  // Set one add-on quantity across the whole order (every track).
  onSetAddon: (trackId: string, addonId: AddonId, qty: number) => void;
  onBack: () => void;
  onNext: () => void;
};

// The order-level quantity for an add-on: the max set on any track, so a chip
// reflects what is applied even if tracks differ. Toggling re-applies to all.
function orderQty(cart: Cart, id: AddonId): number {
  return cart.tracks.reduce((max, t) => Math.max(max, t.addons[id] ?? 0), 0);
}

// Step 2, skippable. The add-on menu as accessible chips; each choice applies
// across every track so the artist configures the whole release at once. See
// plan/29 section 2.
export function AddonsStep({
  cart,
  index,
  count,
  onSetAddon,
  onBack,
  onNext,
}: AddonsStepProps) {
  function setAll(id: AddonId, qty: number) {
    for (const track of cart.tracks) onSetAddon(track.id, id, qty);
  }

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <StepHeader
        index={index}
        count={count}
        title="Add-ons"
        hint="Optional. Skip any you do not need."
      />

      <ul className="flex flex-col gap-[var(--space-3)]">
        {ADDONS.map((addon) => (
          <li key={addon.id}>
            <AddonChip
              addon={addon}
              qty={orderQty(cart, addon.id)}
              onChange={(qty) => setAll(addon.id, qty)}
            />
          </li>
        ))}
      </ul>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}
