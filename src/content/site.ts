// Site-wide contact details. With on-site checkout dark at launch (see
// src/lib/flags.ts), email is the primary inbound channel, so the Services and
// Contact sections and the footer all point here. The inquiry template
// pre-fills the artist's mail client so a tap gives them a structured starting
// point instead of a blank message.
export const site = {
  contactEmail: "calebzofficial@gmail.com",
  inquiry: {
    subject: "Mastering inquiry",
    body: [
      "Hi Caleb,",
      "",
      "Artist / project:",
      "Number of tracks:",
      "Deadline:",
      "Reference tracks or links:",
      "",
      "A bit about the release:",
      "",
    ].join("\n"),
  },
} as const;
