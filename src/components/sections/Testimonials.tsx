import { Section, Reveal } from "@/components/ui";
import { reviews as reviewsContent } from "@/content";
import type { Reviews as ReviewsContent } from "@/content";
import { ReviewCard } from "./ReviewCard";

export type TestimonialsProps = {
  content?: ReviewsContent;
};

// Social proof from real artists. A static, reduced-motion-safe grid: full name,
// project, and a specific quote build trust. If there are no reviews, render
// nothing rather than an empty shell. See plan/16-reviews, plan/22.
export function Testimonials({ content = reviewsContent }: TestimonialsProps) {
  const { title, items } = content;
  if (items.length === 0) return null;

  return (
    <Section id="testimonials" heading={title}>
      <ul className="grid gap-[var(--space-5)] sm:grid-cols-2 lg:grid-cols-3">
        {items.map((review, i) => (
          <Reveal as="li" key={review.id} index={i} className="h-full">
            <ReviewCard review={review} />
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
