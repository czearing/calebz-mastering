// Typed shapes for all site content. Sections receive these as props.
// No hardcoded strings in JSX. See plan/03-architecture.md.

// One audio source as authored in content: a streamable url, its precomputed
// peak envelope (0..1, baked offline, never live FFT), and the loudness
// readout for the sound-off proof (plan/13). Flat by design so data files
// stay terse. The page adapts this into the audio module shape.
export type AudioSource = {
  src: string;
  peaks: number[];
  // Integrated loudness in LUFS, for example -14.0.
  lufs: number;
  // True peak in dBTP, for example -1.0.
  truePeak: number;
};

// A before/after pair: the raw mix and the finished master of one track.
export type AudioPair = {
  before: AudioSource;
  after: AudioSource;
};

export type Hero = {
  headline: string;
  sub: string;
  primaryAction: string;
  founderNote: string;
  portrait: string;
};

export type ServiceTier = {
  id: string;
  name: string;
  includes: string;
  turnaround: string;
  price: string;
  // Optional Stripe Payment Link or booking URL. When set, the tier action
  // pays or books directly; otherwise it routes to #contact (plan/03).
  paymentUrl?: string;
};

export type Services = {
  title: string;
  intro: string;
  tiers: ServiceTier[];
  addOns: string;
  formats: string;
};

// A streaming-platform destination for a track, shown as an icon button on the
// modal cover so a listener can open the full track where it lives.
export type TrackLink = {
  platform: "soundcloud" | "spotify" | "apple" | "youtube";
  url: string;
};

export type TrackCaseStudy = {
  issue: string;
  change: string;
  result: string;
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  // One or more genre tags for the Work card and genre filter (plan/24).
  genres: string[];
  // Album cover art for the Work card (plan/24). Placeholder covers pulled
  // from the artist's SoundCloud; the user replaces with final art.
  cover: string;
  // The per-track A/B sources: raw mix and finished master (plan/07, plan/23).
  audio: AudioPair;
  // Optional "listen on" links, rendered as icon buttons on the modal cover.
  links?: TrackLink[];
  caseStudy?: TrackCaseStudy;
};

export type Work = {
  title: string;
  line: string;
  tracks: Track[];
};

export type Review = {
  id: string;
  quote: string;
  name: string;
  project: string;
};

export type Reviews = {
  title: string;
  items: Review[];
};

export type ProcessStep = {
  id: string;
  step: number;
  text: string;
};

export type Process = {
  title: string;
  steps: ProcessStep[];
};

export type FooterLink = {
  id: string;
  label: string;
  href: string;
};

// One anchor link in the header or the persistent Book affordance.
export type NavLink = {
  id: string;
  label: string;
  href: string;
};

export type Nav = {
  wordmark: string;
  links: NavLink[];
  book: NavLink;
};

export type Footer = {
  wordmark: string;
  tagline: string;
  links: FooterLink[];
  finePrint: string;
};
