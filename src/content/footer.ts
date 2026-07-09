import type { Footer } from "./types";
import { site } from "./site";

export const footer: Footer = {
  wordmark: "CalebZ",
  links: [
    {
      id: "youtube",
      label: "YouTube",
      href: "https://www.youtube.com/@CalebZaudio",
    },
    {
      id: "spotify",
      label: "Spotify",
      href: "https://open.spotify.com/artist/564lyz9Wk0PY0XT6P6pnCk",
    },
    {
      id: "tidal",
      label: "Tidal",
      href: "https://tidal.com/artist/22376230",
    },
    {
      id: "email",
      label: "Email",
      href: `mailto:${site.contactEmail}`,
    },
  ],
  finePrint: "2026 CalebZ. All rights reserved.",
};
