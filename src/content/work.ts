import type { Work } from "./types";
import { workAudio } from "./workAudio";

// Real, full-length before/after work (whole songs, not excerpts). "↓" (Jexn
// Bxptiste): before = the artist's pre-master streaming upload, after = CalebZ's
// finished master. "Found You (CalebZ Remix)" and "Bad Dream (CalebZ Remix)":
// before = CalebZ's raw mix, after = the refmaster engine (czearing/mix-tool)
// auto-selecting a reference from the library and mastering toward it (Found You
// -> Kygo "Higher Love"; Bad Dream -> Dabin "Alive"). See workAudio.ts.
export const work: Work = {
  title: "Selected work",
  line: "Before and after, real masters. Use headphones.",
  tracks: [
    {
      id: "down",
      title: "↓",
      artist: "Jexn Bxptiste",
      genres: ["Hip-Hop"],
      cover: "/work/down.jpg",
      audio: workAudio["down"],
    },
    {
      id: "found-you",
      title: "Found You (CalebZ Remix)",
      artist: "CalebZ",
      genres: ["Dance", "Tropical House"],
      cover: "/work/found-you-calebz-remix.jpg",
      audio: workAudio["found-you"],
    },
    {
      id: "bad-dream",
      title: "Bad Dream (CalebZ Remix)",
      artist: "CalebZ",
      genres: ["Dubstep", "Trap"],
      cover: "/work/bad-dream.jpg",
      audio: workAudio["bad-dream"],
    },
  ],
};
