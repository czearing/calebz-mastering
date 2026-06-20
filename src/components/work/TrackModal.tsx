"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import Image from "next/image";
import { Button, Tag } from "@/components/ui";
import { cn } from "@/lib/cn";
import { ABPlayerLazy } from "@/components/audio/ABPlayerLazy";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { toAudioSource, type Track } from "@/content";

export type TrackModalProps = {
  track: Track;
  open: boolean;
  // The clicked card's rect, so the modal grows out of it (plan/26).
  triggerRect: DOMRect | null;
  onClose: () => void;
};

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function reduced(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

// The keyframe that maps the dialog onto the clicked card: a uniform scale and
// a translate from the card centre to the dialog centre, plus a fade.
function fromCard(dialog: HTMLElement, card: DOMRect): Keyframe {
  const d = dialog.getBoundingClientRect();
  const scale = Math.max(0.1, card.width / d.width);
  const tx = card.left + card.width / 2 - (d.left + d.width / 2);
  const ty = card.top + card.height / 2 - (d.top + d.height / 2);
  return { transform: `translate(${tx}px, ${ty}px) scale(${scale})`, opacity: 0 };
}

// Native <dialog> for the focus trap, Escape, backdrop, and ARIA. The wow is a
// Web Animations entrance: the modal visibly grows out of the clicked card and
// shrinks back on close (plan/26). Reliable in every browser, no View
// Transitions or top-layer timing fragility. Focus returns to the trigger card.
export function TrackModal({ track, open, triggerRect, onClose }: TrackModalProps) {
  const ref = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();

  // Lock the page while open so the background cannot scroll or be interacted
  // with (accessibility). Unlocks on close or unmount.
  useEffect(() => {
    if (!open) return;
    lockScroll();
    return () => unlockScroll();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open || dialog.open) return;
    dialog.showModal();
    if (triggerRect && !reduced() && typeof dialog.animate === "function") {
      dialog.animate([fromCard(dialog, triggerRect), { transform: "none", opacity: 1 }], {
        duration: 420,
        easing: EASE,
      });
    }
  }, [open, triggerRect]);

  const requestClose = useCallback(() => {
    const dialog = ref.current;
    if (!dialog) return onClose();
    if (triggerRect && !reduced() && typeof dialog.animate === "function") {
      // Close snappier than open: it should feel quick and get out of the way.
      const anim = dialog.animate(
        [{ transform: "none", opacity: 1 }, fromCard(dialog, triggerRect)],
        { duration: 180, easing: EASE },
      );
      anim.onfinish = () => {
        dialog.close();
        onClose();
      };
    } else {
      dialog.close();
      onClose();
    }
  }, [onClose, triggerRect]);

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) requestClose();
      }}
      className={cn(
        "m-auto w-[min(92vw,640px)] overflow-hidden rounded-[var(--radius-md)]",
        "border border-line bg-surface p-0 text-text backdrop:bg-bg/45",
      )}
    >
      <div className="relative aspect-[2.6] w-full">
        <Image src={track.cover} alt="" fill sizes="640px" className="object-cover" />
        <Button
          variant="ghost"
          onClick={requestClose}
          aria-label="Close"
          className="absolute right-[var(--space-3)] top-[var(--space-3)] bg-bg/70"
        >
          Close
        </Button>
      </div>

      <div className="flex flex-col gap-[var(--space-5)] p-[var(--space-5)]">
        <header className="flex flex-col gap-[var(--space-2)]">
          <h2 id={titleId} className="text-h2 font-sans text-text">
            {track.title}
          </h2>
          <span className="flex items-center gap-[var(--space-3)]">
            <span className="text-body text-muted">{track.artist}</span>
            <Tag>{track.genre}</Tag>
          </span>
        </header>

        <ABPlayerLazy
          before={toAudioSource(track.audio.before)}
          after={toAudioSource(track.audio.after)}
          title={`Before and after, ${track.title}`}
          playLabel={`Play ${track.title}`}
        />
      </div>
    </dialog>
  );
}
