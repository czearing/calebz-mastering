"use client";

import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import { track as trackEvent } from "@vercel/analytics";
import { Button, Tag } from "@/components/ui";
import { cn } from "@/lib/cn";
import { ABPlayerLazy } from "@/components/audio/ABPlayerLazy";
import { PlatformIcon, platformLabel } from "./PlatformIcon";
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
  return {
    transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
    opacity: 0,
  };
}

// Native <dialog> for the focus trap, Escape, backdrop, and ARIA. The wow is a
// Web Animations entrance: the modal visibly grows out of the clicked card and
// shrinks back on close (plan/26). Reliable in every browser, no View
// Transitions or top-layer timing fragility. Focus returns to the trigger card.
export function TrackModal({
  track,
  open,
  triggerRect,
  onClose,
}: TrackModalProps) {
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
      dialog.animate(
        [fromCard(dialog, triggerRect), { transform: "none", opacity: 1 }],
        {
          duration: 420,
          easing: EASE,
        },
      );
    }
  }, [open, triggerRect]);

  const requestClose = () => {
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
  };

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
        "m-auto flex max-h-[92dvh] w-[min(92vw,640px)] flex-col overflow-hidden rounded-[var(--radius-md)]",
        "border border-line bg-surface p-0 text-text backdrop:bg-bg/45",
      )}
    >
      <div className="relative aspect-[2.6] max-h-[22dvh] w-full shrink-0">
        <Image
          src={track.cover}
          alt=""
          fill
          sizes="640px"
          className="object-cover"
        />

        {/* "Listen on" links: transparent icon buttons stacked on the cover's
            left, so a listener can open the full track on its platform. */}
        {track.links && track.links.length > 0 ? (
          <div className="absolute left-[var(--space-3)] top-[var(--space-3)] flex flex-col gap-[var(--space-2)]">
            {track.links.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Listen on ${platformLabel(link.platform)}`}
                onClick={() =>
                  trackEvent("Platform Click", {
                    track: track.id,
                    platform: link.platform,
                  })
                }
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  "bg-bg/45 text-text backdrop-blur-sm transition-colors",
                  "hover:bg-bg/70 hover:text-cyan focus-visible:text-cyan",
                )}
              >
                <PlatformIcon
                  platform={link.platform}
                  className="h-[18px] w-[18px]"
                />
              </a>
            ))}
          </div>
        ) : null}

        <Button
          variant="ghost"
          onClick={requestClose}
          aria-label="Close"
          className="absolute right-[var(--space-3)] top-[var(--space-3)] bg-bg/70"
        >
          Close
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-[clamp(0.5rem,1.7dvh,1.25rem)] overflow-y-auto overscroll-contain p-[clamp(0.7rem,2dvh,1.25rem)]">
        <header className="flex flex-col gap-[var(--space-2)]">
          <h2
            id={titleId}
            className="text-[clamp(1.1rem,3.2dvh,2.75rem)] font-sans leading-[1.1] text-text"
          >
            {track.title}
          </h2>
          <span className="flex flex-wrap items-center gap-[var(--space-3)]">
            <span className="text-body text-muted">{track.artist}</span>
            {track.genres.map((g) => (
              <Tag key={g}>{g}</Tag>
            ))}
          </span>
        </header>

        <ABPlayerLazy
          before={toAudioSource(track.audio.before)}
          after={toAudioSource(track.audio.after)}
          title={`Before and after, ${track.title}`}
          playLabel={`Play ${track.title}`}
          analyticsId={track.id}
          autoFocusPlay
        />
      </div>
    </dialog>
  );
}
