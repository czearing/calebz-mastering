"use client";

import { cn } from "@/lib/cn";
import { formatUsd, type ConsoleAddonState } from "@/lib/checkout";
import { addonUnitCents } from "@/lib/checkout";

export type AddOnsLedgerProps = {
  addons: ConsoleAddonState;
  onChange: (next: ConsoleAddonState) => void;
  // When true the whole ledger is locked (native fieldset disable cascades to
  // every control), e.g. a free first master takes no paid add-ons.
  disabled?: boolean;
};

const row =
  "flex min-h-[44px] w-full items-center justify-between gap-[var(--space-3)] " +
  "border-b border-line py-[var(--space-3)] text-left transition-colors";

const miniStep =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-[var(--radius-sm)] " +
  "border border-line text-text hover:border-cyan hover:text-cyan disabled:opacity-40";

// Quiet right-aligned ledger of add-ons (Stripe's unit-price column). Per-track
// toggles (stems, rush, extra revision) flip on/off; per-item rows (alt version,
// extra format) carry a small +/- count; Atmos is quote-gated, rendered as a
// toggle that sets a flag and never adds to the total. Each active row leaves a
// faint cyan tick. Prices read from the catalog, never hardcoded.
export function AddOnsLedger({ addons, onChange, disabled = false }: AddOnsLedgerProps) {
  function setFlag(key: "stems" | "rush" | "extraRevision", on: boolean) {
    onChange({ ...addons, [key]: on });
  }
  function setCount(key: "altVersion" | "extraFormat", n: number) {
    onChange({ ...addons, [key]: Math.max(0, n) });
  }

  return (
    <fieldset
      disabled={disabled}
      className={cn("flex flex-col", disabled && "opacity-40")}
    >
      <legend className="mb-[var(--space-2)] text-label font-mono uppercase tracking-[0.06em] text-muted">
        Add-ons
      </legend>

      {(["stems", "rush", "extraRevision"] as const).map((key) => {
        const on = addons[key];
        const meta = TRACK_META[key];
        return (
          <button
            key={key}
            type="button"
            aria-pressed={on}
            onClick={() => setFlag(key, !on)}
            className={cn(row, on ? "text-text" : "text-muted")}
          >
            <span className="flex items-center gap-[var(--space-2)]">
              <Tick on={on} />
              <span className="text-body">{meta.label}</span>
            </span>
            <span className="text-label font-mono text-cyan">
              +{formatUsd(addonUnitCents(meta.id))}
              <span className="text-muted">/track</span>
            </span>
          </button>
        );
      })}

      {(["altVersion", "extraFormat"] as const).map((key) => {
        const n = addons[key];
        const meta = ITEM_META[key];
        return (
          <div key={key} className={cn(row, n > 0 ? "text-text" : "text-muted")}>
            <span className="flex items-center gap-[var(--space-2)]">
              <Tick on={n > 0} />
              <span className="text-body">{meta.label}</span>
            </span>
            <span className="flex items-center gap-[var(--space-3)]">
              <span className="text-label font-mono text-cyan">
                +{formatUsd(addonUnitCents(meta.id))}
                <span className="text-muted"> each</span>
              </span>
              <span className="flex items-center gap-[var(--space-2)]">
                <button
                  type="button"
                  className={miniStep}
                  aria-label={`Remove one ${meta.label}`}
                  disabled={n <= 0}
                  onClick={() => setCount(key, n - 1)}
                >
                  <span aria-hidden="true">-</span>
                </button>
                <span
                  className="min-w-[2ch] text-center text-body font-mono text-text tabular-nums"
                  aria-live="polite"
                  aria-label={`${n} ${meta.label}`}
                >
                  {n}
                </span>
                <button
                  type="button"
                  className={miniStep}
                  aria-label={`Add one ${meta.label}`}
                  onClick={() => setCount(key, n + 1)}
                >
                  <span aria-hidden="true">+</span>
                </button>
              </span>
            </span>
          </div>
        );
      })}

      <button
        type="button"
        aria-pressed={addons.atmos}
        onClick={() => onChange({ ...addons, atmos: !addons.atmos })}
        className={cn(row, addons.atmos ? "text-text" : "text-muted")}
      >
        <span className="flex items-center gap-[var(--space-2)]">
          <Tick on={addons.atmos} />
          <span className="text-body">Dolby Atmos</span>
        </span>
        <span className="text-label font-mono text-cyan">
          {addons.atmos ? "Quote requested" : "Request a quote"}
        </span>
      </button>

      {addons.atmos ? (
        <p
          className="pt-[var(--space-2)] text-label font-mono text-muted"
          role="status"
        >
          We will quote Atmos and add it as a note at checkout. It is not in the
          total below.
        </p>
      ) : null}
    </fieldset>
  );
}

const TRACK_META = {
  stems: { id: "stems", label: "Stem mastering" },
  rush: { id: "rush", label: "Rush, 24 to 48h" },
  extraRevision: { id: "extraRevision", label: "Extra revision round" },
} as const;

const ITEM_META = {
  altVersion: { id: "altVersion", label: "Alternate version" },
  extraFormat: { id: "extraFormat", label: "Extra format" },
} as const;

// A small square that fills cyan when its row is active, so add-on state is
// readable without relying on the price color alone.
function Tick({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-3 w-3 rounded-[1px] border transition-colors duration-150",
        on ? "border-cyan bg-cyan" : "border-line bg-transparent",
      )}
    />
  );
}
