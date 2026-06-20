import type { Reviews } from "./types";

// Copy from plan/08-content.md. Two seeded placeholders.
// TODO: CalebZ to collect 4 to 6 real quotes. No invented names at launch.
export const reviews: Reviews = {
  title: "What artists say",
  items: [
    {
      id: "review-1",
      quote: "Placeholder quote about the sound and reliability.", // TODO: real quote
      name: "Artist Name", // TODO: real name
      project: "Project or label", // TODO: real project
    },
    {
      id: "review-2",
      quote: "Placeholder quote about translation across systems.", // TODO: real quote
      name: "Artist Name", // TODO: real name
      project: "Project or label", // TODO: real project
    },
  ],
};
