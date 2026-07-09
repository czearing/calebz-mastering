import type { Footer } from "./types";
import { site } from "./site";

export const footer: Footer = {
  wordmark: "CalebZ",
  tagline: "Electronic / Hip-hop / Pop",
  links: [
    {
      id: "youtube",
      label: "YouTube",
      href: "https://www.youtube.com/@CalebZaudio",
    },
    {
      id: "email",
      label: "Email",
      href: `mailto:${site.contactEmail}`,
    },
  ],
  finePrint: "2026 CalebZ. All rights reserved.",
};
