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
      links: [
        {
          platform: "soundcloud",
          url: "https://soundcloud.com/caleb_z/found-you-calebz-remix",
        },
      ],
      caseStudy: {
        issue: "The raw mix sat 5.4 LUFS below the master.",
        change: "Raised level and matched the tonal balance.",
        result: "-10.2 LUFS. Peak +0.1 dBTP.",
      },
    },
    {
      id: "bad-dream",
      title: "Bad Dream (CalebZ Remix)",
      artist: "CalebZ",
      genres: ["Dubstep", "Trap"],
      cover: "/work/bad-dream.jpg",
      audio: workAudio["bad-dream"],
      links: [
        {
          platform: "soundcloud",
          url: "https://soundcloud.com/caleb_z/bad-dream-calebz-remix",
        },
      ],
      caseStudy: {
        issue: "The intro sat low. The drop carried too much crest.",
        change: "Lifted the intro and tightened the drop.",
        result: "-7.3 LUFS. Crest 14.9 to 9.9 dB.",
      },
    },
    {
      id: "hollywood-perfect",
      title: "Hollywood Perfect (CalebZ Remix)",
      artist: "CalebZ",
      genres: ["Trap", "Hip-Hop"],
      cover: "/work/hollywood-perfect.jpg",
      audio: workAudio["hollywood-perfect"],
      links: [
        {
          platform: "soundcloud",
          url: "https://soundcloud.com/caleb_z/hollywood-perfect-calebz-remix",
        },
      ],
      caseStudy: {
        issue: "The 808 needed focus without excess midrange.",
        change: "Kept the low end and tightened the mids.",
        result: "-10.2 LUFS. LRA 7.4 to 4.7.",
      },
    },
    {
      id: "forest",
      title: "Forest",
      artist: "CalebZ",
      genres: ["Progressive House", "EDM"],
      cover: "/work/forest.jpg",
      audio: workAudio["forest"],
      links: [
        {
          platform: "soundcloud",
          url: "https://soundcloud.com/caleb_z/forest",
        },
      ],
      caseStudy: {
        issue: "High LRA and tonal drift between repeated verses.",
        change: "Used warm references. Both drops match Silhouettes.",
        result: "-11.1 LUFS. LRA 14.5 to 6.4.",
      },
    },
    {
      id: "tell-me-im-pretty",
      title: "Tell Me I'm Pretty (CalebZ Remix)",
      artist: "CalebZ",
      genres: ["Pop", "Bass House"],
      cover: "/work/tell-me-im-pretty.jpg",
      audio: workAudio["tell-me-im-pretty"],
      links: [
        {
          platform: "soundcloud",
          url: "https://soundcloud.com/caleb_z/tell-me-im-pretty-icona-pop-version-calebz-remix",
        },
      ],
      caseStudy: {
        issue: "LRA 12.3. Peak +0.5 dBTP.",
        change: "Tightened dynamics. Kept the bass-house bounce.",
        result: "LRA 6.6. Peak 0.0 dBTP.",
      },
    },
    {
      id: "down",
      title: "↓",
      artist: "Jexn Bxptiste",
      genres: ["Hip-Hop"],
      cover: "/work/down.jpg",
      audio: workAudio["down"],
      caseStudy: {
        issue: "The source was already close to finished.",
        change: "Used small finishing moves.",
        result: "-9.4 to -9.3 LUFS.",
      },
    },
  ],
};
