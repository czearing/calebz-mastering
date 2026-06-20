import { Section } from "@/components/ui";
import { ServicesConsole } from "./console/ServicesConsole";

export type ServicesProps = {
  // Where the CTA serializes the configured order. Defaults to the checkout.
  startHref?: string;
};

// The Services section is one live console order builder (see the services
// redesign brief, "The Console"), not a list of static tier cards. The free
// first master is its own thing: it lives in the Contact section (the form is
// literally the free-master request), so it is not repeated here. A static
// header (no scroll reveal) keeps the heading from jumping in. The tiers emerge
// from the stepper math, and the CTA carries the configuration into /start.
export function Services({ startHref = "/start" }: ServicesProps) {
  return (
    <Section id="services">
      <div className="mb-[var(--space-8)] flex flex-col gap-[var(--space-3)]">
        <h2 className="text-h2 font-sans text-text">
          Pay per track. The math does the rest.
        </h2>
        <p className="max-w-[var(--max-reading)] text-body text-muted">
          The per-track rate drops as the release grows.
        </p>
      </div>
      <ServicesConsole startHref={startHref} />
    </Section>
  );
}
