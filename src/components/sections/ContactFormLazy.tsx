"use client";

import dynamic from "next/dynamic";

// The contact form pulls in react-hook-form and the zod schema. It sits below
// the fold, so it is a dynamic import loaded after first paint to protect the
// home first-load budget (plan/11). ssr:false keeps the validation code off the
// server too; a quiet placeholder holds the space until it hydrates.
const ContactForm = dynamic(
  () => import("./ContactForm").then((m) => m.ContactForm),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden
        className="h-[28rem] w-full rounded-[var(--radius-md)] border border-line bg-surface"
      />
    ),
  },
);

export function ContactFormLazy() {
  return <ContactForm />;
}
