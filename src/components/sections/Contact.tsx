import { Section } from "@/components/ui";
import { ContactFormLazy } from "./ContactFormLazy";
import { ContactDirect } from "./ContactDirect";
import { flags } from "@/lib/flags";

export type ContactProps = {
  title?: string;
  line?: string;
  response?: string;
  // Whether on-site booking exists. Defaults to the commerce flight. When off
  // (launch default) the section is a single email call to action; when on it
  // is the questions form that sits beside the cart.
  commerce?: boolean;
};

// Contact is for reaching out. With commerce off (launch) there is no cart and
// no working form pipeline, so it is one simple email call to action
// (ContactDirect). With commerce on, booking lives in the cart at #services and
// this is the plain questions form beside it. See plan/07, plan/22.
export function Contact({
  title = "Have a question?",
  line = "Ask about a project, turnaround, or anything else.",
  response = "I reply within one business day.",
  commerce = flags.commerce,
}: ContactProps) {
  if (!commerce) return <ContactDirect />;

  return (
    <Section id="contact" heading={title}>
      <div className="grid gap-[var(--space-7)] md:grid-cols-[1fr_minmax(0,32rem)]">
        <div className="flex max-w-[var(--max-reading)] flex-col gap-[var(--space-4)]">
          <p className="text-body text-text">{line}</p>
          <p className="text-body text-muted">
            Ready to book?{" "}
            <a
              href="#services"
              className="text-cyan underline-offset-4 hover:underline"
            >
              Start a master
            </a>
            . Your first one is free.
          </p>
          <p className="text-label font-mono uppercase tracking-[0.06em] text-muted">
            {response}
          </p>
        </div>
        <ContactFormLazy />
      </div>
    </Section>
  );
}
