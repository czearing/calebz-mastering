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
    {
      id: "hollywood-perfect",
      title: "Hollywood Perfect (CalebZ Remix)",
      artist: "CalebZ",
      genres: ["Trap", "Hip-Hop"],
      cover: "/work/hollywood-perfect.jpg",
      audio: workAudio["hollywood-perfect"],
    },
    {
      id: "forest",
      title: "Forest",
      artist: "CalebZ",
      genres: ["Progressive House", "EDM"],
      cover: "/work/forest.jpg",
      audio: workAudio["forest"],
    },
    {
      id: "tell-me-im-pretty",
      title: "Tell Me I'm Pretty (CalebZ Remix)",
      artist: "CalebZ",
      genres: ["Pop", "Bass House"],
      cover: "/work/tell-me-im-pretty.jpg",
      audio: workAudio["tell-me-im-pretty"],
    },
    {
      id: "down",
      title: "↓",
      artist: "Jexn Bxptiste",
      genres: ["Hip-Hop"],
      cover: "/work/down.jpg",
      audio: workAudio["down"],
    },
  ],
};
