import { formatUsd, type ReviewSummary } from "@/lib/checkout";

export function SummaryOrderCard({ summary }: { summary: ReviewSummary }) {
  const tracksWord = summary.trackCount === 1 ? "track" : "tracks";

  return (
    <div className="flex flex-col rounded-[var(--radius-md)] border border-line bg-surface">
      <div className="flex items-baseline justify-between gap-[var(--space-4)] border-b border-line px-[var(--space-5)] py-[var(--space-4)]">
        <div className="flex flex-col gap-[var(--space-1)]">
          <span className="text-h2 font-sans text-text">{summary.tier}</span>
          <span className="text-label font-mono uppercase tracking-[0.06em] text-muted">
            {summary.trackCount} {tracksWord},{" "}
            {formatUsd(summary.perTrackCents)} per track
          </span>
        </div>
        <span className="text-body font-mono tabular-nums text-text">
          {formatUsd(summary.tracksSubtotalCents)}
        </span>
      </div>

      {summary.addons.length > 0 ? (
        <ul className="flex flex-col divide-y divide-line">
          {summary.addons.map((addon) => (
            <li
              key={addon.id}
              className="flex items-center justify-between gap-[var(--space-4)] px-[var(--space-5)] py-[var(--space-3)]"
            >
              <span className="text-body text-muted">
                {addon.label}
                {addon.qty > 1 ? ` x${addon.qty}` : ""}
              </span>
              <span className="text-body font-mono tabular-nums text-text">
                {addon.quoteOnly ? "Quoted" : formatUsd(addon.amountCents)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-[var(--space-5)] py-[var(--space-3)] text-body text-muted">
          No add-ons. Just a clean master.
        </p>
      )}
    </div>
  );
}
