import type { Footer } from "./types";
import { site } from "./site";

// Copy from plan/08-content.md. YouTube link is real. Others are placeholders.
// TODO: CalebZ to confirm whether Instagram is used.
export const footer: Footer = {
  wordmark: "CalebZ",
  tagline: "Mastering, Seattle",
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
    {
      id: "instagram",
      label: "Instagram",
      href: "https://instagram.com/", // TODO: confirm if used, else remove
    },
  ],
  finePrint: "2026 CalebZ. All rights reserved.", // TODO: confirm year on launch
};
