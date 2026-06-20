"use client";

import { useEffect, useRef } from "react";
import { ContactForm } from "@/components/sections/ContactForm";

export type FreeMasterDialogProps = {
  open: boolean;
  onClose: () => void;
};

// The free-first-master invite as a popup on the checkout, not a jump to the
// homepage contact section (which would drop the customer out of the flow they
// are mid-way through). A native <dialog> so it is modal, focus-trapped, and
// Escape-closable for free; clicking the backdrop or Close dismisses it. The
// existing ContactForm is reused so there is one inquiry path. See plan/32.
export function FreeMasterDialog({ open, onClose }: FreeMasterDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-[var(--radius-md)] border border-line bg-bg p-0 text-text backdrop:bg-black/70"
    >
      {/* Mount the form only while open: it stays out of the page's accessible
          tree (and off the render path) until the customer asks for it. */}
      {open ? (
        <div className="flex flex-col gap-[var(--space-5)] p-[var(--space-6)]">
          <div className="flex items-start justify-between gap-[var(--space-4)]">
            <div className="flex flex-col gap-[var(--space-2)]">
              <h2 className="text-h2 font-sans text-text">
                Your first master is free
              </h2>
              <p className="text-body text-muted">
                Send one track and hear it back before you pay for anything. No
                card, no commitment.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 rounded-[var(--radius-sm)] border border-line px-[var(--space-3)] py-[var(--space-2)] text-label font-mono uppercase tracking-[0.06em] text-muted transition-colors hover:border-cyan hover:text-cyan"
            >
              Close
            </button>
          </div>
          <ContactForm />
        </div>
      ) : null}
    </dialog>
  );
}
