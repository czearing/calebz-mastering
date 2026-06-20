import type { Hero } from "./types";
import { workAudio } from "./workAudio";

// Copy from plan/08-content.md. Final hero and founder note.
export const hero: Hero = {
  eyebrow: "Mastering, Seattle",
  headline: "Hear the difference.",
  sub: "Independent mastering for electronic music. Loud, clean, and translatable from club systems to phone speakers.",
  beforeLabel: "Before",
  afterLabel: "After",
  primaryAction: "Start a master",
  playPrompt: "Press play, then switch",
  founderNote:
    "I'm CalebZ. I produce electronic music in Seattle, and I started mastering because my own tracks never hit as hard as the records I looked up to. Now I master so other artists' music holds up on club systems and phone speakers alike.",
  founderIcon: "/calebz.jpg",
  portrait: "/calebz-portrait.jpg",
  offer:
    "Send me one track. I'll master it so you can hear the result before you pay for anything. One per artist.",
  // The hero showcase plays a real stereo master so the A/B is audible and the
  // page goniometer has true stereo width to bloom: "For Me" before sits narrow
  // (side ~-37 dBFS) and the master opens roughly 3x wider (side ~-20 dBFS),
  // measured with ffmpeg. Swap to a different track by changing the key.
  audio: workAudio["for-me"],
};
