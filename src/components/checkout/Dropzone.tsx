"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ACCEPT_ATTR, useUpload, type UploadItem } from "./useUpload";

export type DropzoneProps = {
  orderId: string;
  // True when the cart includes stem mastering. Stem orders are multiple files
  // per track (the grouped stems), so the guidance must not say "one file per
  // track", which contradicts what the customer paid for. See plan/32.
  needsStems?: boolean;
  // The number of tracks the order was paid for, so the zone can show how the
  // upload matches the order ("2 of 6 tracks added") instead of letting a buyer
  // send three files for a six-track order with no signal. See plan/32.
  expected?: number;
  // Reports how many files have been added, so the upload step can require at
  // least one before continuing to payment. See plan/32.
  onCountChange?: (count: number) => void;
  // Optional lifted controller: when the flow owns the upload state (so the
  // file list survives stepping back to this step), it passes the list and the
  // add/remove handlers in. Standalone (tests, stories) it falls back to its
  // own hook. See plan/32.
  items?: UploadItem[];
  onAdd?: (files: FileList | File[]) => void;
  onRemove?: (id: string) => void;
};

// The format line under the zone, switched on whether stems were ordered.
const STEM_HINT =
  "WAV or AIFF. Send the stems for each track, grouped together. Multiple files per track is expected.";
const FLAT_HINT = "WAV or AIFF. One file per track.";

const statusLabel: Record<string, string> = {
  queued: "Queued",
  uploading: "Uploading",
  done: "Uploaded",
  ready: "Ready once storage is connected",
  error: "Failed, drop it again",
};

// Drag-and-drop plus browse. Keyboard operable: the zone is a real button so
// Enter or Space opens the file picker, and a visible focus ring lands on it.
// WAV or AIFF only, with per-file progress and a remove control on each file.
// The prep guidance sits right at the dropzone. See plan/29 section 3, plan/13.
export function Dropzone({
  orderId,
  needsStems = false,
  expected,
  onCountChange,
  items: extItems,
  onAdd,
  onRemove,
}: DropzoneProps) {
  const own = useUpload(orderId);
  const items = extItems ?? own.items;
  const add = onAdd ?? own.add;
  const remove = onRemove ?? own.remove;
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  useEffect(() => {
    onCountChange?.(items.length);
  }, [items.length, onCountChange]);

  // How the upload maps to the paid order. For stems the file count is not the
  // track count (several files per track), so it counts files against tracks
  // rather than implying a one-to-one match.
  const countLine =
    expected && expected > 0
      ? needsStems
        ? `${items.length} ${items.length === 1 ? "file" : "files"} added for your ${expected} ${expected === 1 ? "track" : "tracks"}.`
        : `${items.length} of ${expected} ${expected === 1 ? "track" : "tracks"} added.`
      : null;

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          add(e.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-[12rem] w-full flex-col items-center justify-center gap-[var(--space-2)] rounded-[var(--radius-md)] border border-dashed p-[var(--space-6)] text-center transition-colors",
          over ? "border-cyan bg-surface" : "border-line bg-surface hover:border-cyan-dim",
        )}
      >
        <span className="text-body text-text">Drop your tracks, or browse</span>
        <span className="text-label font-mono text-muted">
          {needsStems ? STEM_HINT : FLAT_HINT}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTR}
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => {
          if (e.target.files) add(e.target.files);
          e.target.value = "";
        }}
      />

      {countLine ? (
        <p className="text-label font-mono text-text" aria-live="polite">
          {countLine}
        </p>
      ) : null}

      <p className="text-label font-mono text-muted">
        Native rate, 24-bit. Peaks around -3 to -6 dBFS. No clipping, no
        master-bus limiter.
      </p>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-[var(--space-2)]">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-sm)] border border-line bg-surface px-[var(--space-3)] py-[var(--space-2)]"
            >
              <span className="min-w-0 flex-1 truncate text-body text-text">
                {item.name}
              </span>
              <span
                className="shrink-0 text-label font-mono text-muted"
                aria-live="polite"
              >
                {statusLabel[item.status]}
                {item.status === "uploading"
                  ? ` ${Math.round(item.progress * 100)}%`
                  : ""}
              </span>
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.name}`}
                className="shrink-0 rounded-[var(--radius-sm)] border border-line px-[var(--space-2)] py-[2px] text-label font-mono uppercase tracking-[0.06em] text-muted transition-colors hover:border-error hover:text-error"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
