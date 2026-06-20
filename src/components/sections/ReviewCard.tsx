import Image from "next/image";
import type { Review } from "@/content";

// One quote with attribution. Photo is optional; the type may not carry one yet,
// so we read it defensively and only render the image when present.
export type ReviewCardProps = {
  review: Review & { photo?: string };
};

export function ReviewCard({ review }: ReviewCardProps) {
  const { quote, name, project, photo } = review;

  return (
    <figure className="flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-md)] border border-line bg-surface p-[var(--space-5)]">
      <blockquote className="text-body text-text">{quote}</blockquote>
      <figcaption className="mt-auto flex items-center gap-[var(--space-3)]">
        {photo ? (
          <Image
            src={photo}
            alt=""
            width={32}
            height={32}
            className="h-[var(--space-6)] w-[var(--space-6)] rounded-full object-cover"
          />
        ) : null}
        <span className="flex flex-col">
          <span className="text-label font-sans text-text">{name}</span>
          <span className="text-label font-mono uppercase text-muted">
            {project}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
