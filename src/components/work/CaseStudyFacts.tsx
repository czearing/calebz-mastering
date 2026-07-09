import type { TrackCaseStudy } from "@/content";

export function CaseStudyFacts({ study }: { study: TrackCaseStudy }) {
  const facts = [
    ["Issue", study.issue],
    ["Change", study.change],
    ["Result", study.result],
  ];

  return (
    <dl className="shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-line text-label sm:grid sm:grid-cols-3">
      {facts.map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-[3.75rem_1fr] gap-2 border-b border-line p-2.5 last:border-b-0 sm:block sm:border-b-0 sm:border-r sm:p-3 sm:last:border-r-0"
        >
          <dt className="font-mono uppercase tracking-[0.06em] text-cyan">
            {label}
          </dt>
          <dd className="leading-relaxed text-muted sm:mt-1">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
