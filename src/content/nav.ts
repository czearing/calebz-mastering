import type { Nav } from "./types";

// Header navigation and the persistent primary CTA (plan/30). Anchor links
// only, so scroll works with no JS. The wordmark mirrors the footer mark.
// "Start a master" and Services are one destination: the console at #services.
export const nav: Nav = {
  wordmark: "CalebZ",
  // A first-timer must reach Work, Services, and pricing fast (plan/07).
  links: [
    { id: "work", label: "Work", href: "#work" },
    { id: "services", label: "Services", href: "#services" },
    { id: "contact", label: "Contact", href: "#contact" },
  ],
  book: { id: "book", label: "Start a master", href: "#services" },
};
