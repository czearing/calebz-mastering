import { Section } from "@/components/ui";
import { ServicesConsole } from "./console/ServicesConsole";
import { flags } from "@/lib/flags";

export type ServicesProps = {
  // Where the CTA serializes the configured order. Defaults to the checkout.
  startHref?: string;
  // Whether the live console + on-site checkout are live. Defaults to the
  // commerce flight; the page leaves it unset so the flag decides. Tests pass it
  // explicitly to exercise either face without depending on env.
  commerce?: boolean;
};

const INCLUDED = [
  "Two revisions included",
  "WAV plus MP3 delivery",
  "About a 3 day turnaround",
];

// The Services section is one live console order builder (see the services
// redesign brief, "The Console"), not a list of static tier cards. A static
// header (no scroll reveal) keeps the heading from jumping in. The tiers emerge
// from the stepper math, and the CTA carries the configuration into /start.
//
// With commerce off (the launch default) there is no cart, so the section just
// states the offering and what every master includes, then points to the
// Contact section to start. It does not repeat the email or the form: those
// live once, in Contact.
export function Services({
  startHref = "/start",
  commerce = flags.commerce,
}: ServicesProps) {
  return (
    <Section id="services">
      <div className="mb-[var(--space-8)] flex flex-col gap-[var(--space-3)]">
        <h2 className="text-h2 font-sans text-text">
          {commerce
            ? "Pay per track. The math does the rest."
            : "Per-track mastering"}
        </h2>
        <p className="max-w-[var(--max-reading)] text-body text-muted">
          The per-track rate drops as the release grows.
        </p>
      </div>
      {commerce ? (
        <ServicesConsole startHref={startHref} />
      ) : (
        <div className="flex flex-col gap-[var(--space-6)]">
          <ul className="flex flex-col gap-[var(--space-2)]">
            {INCLUDED.map((line) => (
              <li
                key={line}
                className="flex items-center gap-[var(--space-2)] text-body text-muted"
              >
                <span aria-hidden="true" className="text-cyan">
                  {"+"}
                </span>
                {line}
              </li>
            ))}
          </ul>
          <p className="max-w-[var(--max-reading)] text-body text-text">
            Your first master is free.{" "}
            <a
              href="#contact"
              className="text-cyan underline-offset-4 hover:underline"
            >
              Send a track
            </a>{" "}
            and hear it before you pay.
          </p>
        </div>
      )}
    </Section>
  );
}
