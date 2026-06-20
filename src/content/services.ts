import type { Services } from "./types";

// Copy from plan/08-content.md. Turnaround and prices are placeholders.
// TODO: CalebZ to confirm real turnaround days and prices before launch.
export const services: Services = {
  title: "Services",
  intro:
    "Three ways to work. Files delivered in the formats your release needs.",
  tiers: [
    {
      id: "single",
      name: "Single",
      includes: "One track, two revisions, streaming and WAV masters",
      turnaround: "3 days", // TODO: confirm turnaround
      price: "$X", // TODO: set price
      // TODO: paste the Stripe Payment Link for Single here, e.g.
      // paymentUrl: "https://buy.stripe.com/...". Until set, this tier
      // routes to #contact.
    },
    {
      id: "ep",
      name: "EP",
      includes: "Up to 5 tracks, level matched across the set",
      turnaround: "5 days", // TODO: confirm turnaround
      price: "$X", // TODO: set price
      // TODO: paste the Stripe Payment Link for EP here. Until set, this tier
      // routes to #contact.
    },
    {
      id: "album",
      name: "Album",
      includes: "Full record, sequencing and gaps, reference call",
      turnaround: "7 days", // TODO: confirm turnaround
      price: "$X", // TODO: set price
      // TODO: paste the Stripe Payment Link for Album here. Until set, this
      // tier routes to #contact.
    },
  ],
  addOns: "Stem mastering, Dolby Atmos, rush delivery. Ask for a quote.",
  formats:
    "24-bit WAV, streaming-optimized, instrumental and clean versions on request.",
};
