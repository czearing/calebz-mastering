"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ACCEPT_ATTR, useUpload, type UploadItem } from "./useUpload";
import { UploadFileRow } from "./UploadFileRow";

export type DropzoneProps = {
  orderId: string;
  // True when the cart includes stem mastering: several files per track, so the
  // count and guidance must not imply one-file-per-track. See plan/32.
  needsStems?: boolean;
  // Tracks paid for, so the zone can show how the upload matches the order.
  expected?: number;
  onCountChange?: (count: number) => void;
  // Optional lifted controller so the file list survives stepping back; falls
  // back to its own hook standalone (tests, stories). See plan/32.
  items?: UploadItem[];
  onAdd?: (files: FileList | File[]) => void;
  onRemove?: (id: string) => void;
  onRename?: (id: string, name: string) => void;
};

// One full-width drop target (drag-and-drop OR click) and the files as clean
// rows with the spec we read off each. Any heads-up sits on the specific file's
// own row (see UploadFileRow), so it is always clear which track is hot/clipped.
// The prep specs live in a quiet disclosure instead of a wall of always-on text.
// Keyboard operable: the zone is a real button. See brain e3d9621c, plan/29 s3.
export function Dropzone({
  orderId,
  needsStems = false,
  expected,
  onCountChange,
  items: extItems,
  onAdd,
  onRemove,
  onRename,
}: DropzoneProps) {
  const own = useUpload(orderId);
  const items = extItems ?? own.items;
  const add = onAdd ?? own.add;
  const remove = onRemove ?? own.remove;
  const rename = onRename ?? own.rename;
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  useEffect(() => {
    onCountChange?.(items.length);
  }, [items.length, onCountChange]);

  const countLine =
    expected && expected > 0
      ? needsStems
        ? `${items.length} ${items.length === 1 ? "file" : "files"} for your ${expected} ${expected === 1 ? "track" : "tracks"}`
        : `${items.length} of ${expected} ${expected === 1 ? "track" : "tracks"} added`
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
          "flex min-h-[12rem] w-full flex-col items-center justify-center gap-[var(--space-3)] rounded-[var(--radius-md)] border border-dashed p-[var(--space-6)] text-center transition-colors",
          over ? "border-cyan bg-cyan/[0.04]" : "border-line bg-surface hover:border-cyan-dim",
        )}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={over ? "text-cyan" : "text-muted"}>
          <path d="M12 16V4M8 8l4-4 4 4" />
          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        <span className="text-body text-text">Drop your tracks, or browse</span>
        <span className="text-label font-mono text-muted">WAV or AIFF</span>
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
        <p className="text-label font-mono text-muted" aria-live="polite">
          {countLine}
        </p>
      ) : null}

      {items.length > 0 ? (
        <ul className="flex flex-col gap-[var(--space-2)]">
          {items.map((item) => (
            <UploadFileRow
              key={item.id}
              item={item}
              onRemove={remove}
              onRename={rename}
            />
          ))}
        </ul>
      ) : null}

      <details className="text-label">
        <summary className="cursor-pointer list-none font-mono uppercase tracking-[0.06em] text-muted transition-colors hover:text-text">
          What&apos;s an ideal upload?
        </summary>
        <p className="mt-[var(--space-2)] text-muted">
          {needsStems
            ? "WAV or AIFF. Send the stems for each track, grouped together. Multiple files per track is expected. Native rate, 24-bit, peaks around -3 to -6 dBFS. No clipping, no master-bus limiter."
            : "WAV or AIFF. One file per track. Native rate, 24-bit, peaks around -3 to -6 dBFS. No clipping, no master-bus limiter."}
        </p>
      </details>
    </div>
  );
}
