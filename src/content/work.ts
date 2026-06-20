import type { Work } from "./types";
import { workAudio } from "./workAudio";

// Real covers, titles, and audio pulled from the artist's SoundCloud
// (soundcloud.com/caleb_z) as placeholders for the Work cards (plan/24). Each
// track's before/after is a real 32s excerpt: the master, and a degraded version
// (quieter, narrower, duller) so the comparison is audible (see workAudio.ts).
// TODO: CalebZ to replace each pair with the real raw mix and finished master.
export const work: Work = {
  title: "Selected work",
  line: "Before and after, real excerpts. Use headphones.",
  tracks: [
    {
      id: "we-should-go-back",
      title: "We Should Go Back",
      artist: "CalebZ",
      genre: "Dance",
      cover: "/work/we-should-go-back.jpg",
      audio: workAudio["we-should-go-back"],
    },
    {
      id: "i-need-you",
      title: "I Need You",
      artist: "CalebZ",
      genre: "Dance",
      cover: "/work/i-need-you.jpg",
      audio: workAudio["i-need-you"],
    },
    {
      id: "for-me",
      title: "For Me",
      artist: "CalebZ",
      genre: "Dance",
      cover: "/work/for-me.jpg",
      audio: workAudio["for-me"],
    },
    {
      id: "found-you",
      title: "Found You (CalebZ Remix)",
      artist: "CalebZ",
      genre: "Dance",
      cover: "/work/found-you-calebz-remix.jpg",
      audio: workAudio["found-you"],
    },
    {
      id: "tell-me-im-pretty",
      title: "Tell Me I'm Pretty (CalebZ Remix)",
      artist: "CalebZ",
      genre: "Pop",
      cover: "/work/tell-me-im-pretty-icona-pop-version-calebz-remix.jpg",
      audio: workAudio["tell-me-im-pretty"],
    },
  ],
};
