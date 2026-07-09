import type { Process } from "./types";

// Copy from plan/08-content.md. Final process steps.
export const process: Process = {
  title: "How it works",
  steps: [
    {
      id: "step-1",
      step: 1,
      text: "Send a WAV with about 6 dB of headroom and no limiter on the master bus.",
    },
    {
      id: "step-2",
      step: 2,
      text: "I master the track against your references.",
    },
    {
      id: "step-3",
      step: 3,
      text: "I send a private link so you can hear the full master.",
    },
    {
      id: "step-4",
      step: 4,
      text: "Two revisions are included. I deliver the final files after approval.",
    },
  ],
};
