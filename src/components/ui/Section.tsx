import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SectionProps = HTMLAttributes<HTMLElement> & {
  // Optional heading slot. Rendered inside the constrained content column.
  heading?: ReactNode;
};

// Semantic section wrapper. Owns vertical rhythm and the content max width,
// so sections never repeat spacing or width math. See plan/06-components.md.
const base =
  "w-full px-[var(--space-5)] py-[var(--space-9)] md:py-[var(--space-10)]";
const inner = "mx-auto w-full max-w-[var(--max-content)]";

export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  { heading, className, children, ...rest },
  ref,
) {
  return (
    <section ref={ref} className={cn(base, className)} {...rest}>
      <div className={inner}>
        {heading ? (
          <h2 className="text-h2 font-sans mb-[var(--space-8)]">{heading}</h2>
        ) : null}
        {children}
      </div>
    </section>
  );
});
