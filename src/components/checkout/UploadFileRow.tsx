"use client";

import { cn } from "@/lib/cn";
import { formatSpec } from "./audioCheck";
import type { UploadItem } from "./useUpload";

export type UploadFileRowProps = {
  item: UploadItem;
  onRemove: (id: string) => void;
  // Rename the track's label. The name starts as the file name and is editable.
  onRename: (id: string, name: string) => void;
};

// Short, human progress words. No raw states leaking to the customer.
const statusLabel: Record<string, string> = {
  queued: "Queued",
  uploading: "Sending",
  done: "Sent",
  ready: "Ready",
  error: "Retry",
};

// One uploaded track: name, the spec badge we read off the file (24-bit · 48 kHz),
// the send state, and a remove control. When this specific file tripped a check,
// its heads-up sits right under its own name, so with nine tracks it is always
// clear WHICH one is hot or clipped, never a vague banner.
export function UploadFileRow({ item, onRemove, onRename }: UploadFileRowProps) {
  const spec = item.analysis ? formatSpec(item.analysis) : null;
  const warnings = item.analysis?.warnings ?? [];
  const flagged = warnings.length > 0;
  const status =
    item.status === "uploading"
      ? `Sending ${Math.round(item.progress * 100)}%`
      : statusLabel[item.status];

  return (
    <li
      className={cn(
        "flex flex-col gap-[var(--space-2)] rounded-[var(--radius-md)] border bg-surface px-[var(--space-4)] py-[var(--space-3)]",
        flagged ? "border-warn/40" : "border-line",
      )}
    >
      <div className="flex items-center gap-[var(--space-3)]">
        <span
          aria-hidden
          className={cn(
            "h-[8px] w-[8px] shrink-0 rounded-full",
            flagged ? "bg-warn" : "bg-cyan/60",
          )}
        />
        <input
          value={item.name}
          onChange={(e) => onRename(item.id, e.target.value)}
          aria-label={`Rename ${item.name}`}
          spellCheck={false}
          className="min-w-0 flex-1 truncate rounded-[var(--radius-sm)] border border-transparent bg-transparent px-[var(--space-1)] py-[2px] text-body text-text outline-none transition-colors hover:border-line focus:border-cyan"
        />
        {spec ? (
          <span className="hidden shrink-0 font-mono text-label text-muted sm:inline">
            {spec}
          </span>
        ) : null}
        <span className="shrink-0 font-mono text-label text-muted" aria-live="polite">
          {status}
        </span>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name}`}
          className="shrink-0 rounded-[var(--radius-sm)] p-[4px] text-muted transition-colors hover:text-error"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>

      {flagged ? (
        <div className="flex flex-col gap-[var(--space-1)] pl-[calc(8px+var(--space-3))]">
          {warnings.map((w) => (
            <p key={w.id} className="text-label">
              <span className="font-mono uppercase tracking-[0.06em] text-warn">
                {w.title}.
              </span>{" "}
              <span className="text-muted">{w.detail}</span>
            </p>
          ))}
        </div>
      ) : null}
    </li>
  );
}
