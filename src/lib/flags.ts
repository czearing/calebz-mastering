// Feature flags ("flights") let us ship the site with parts of it dark until
// they're ready, and flip them on per deploy without a code change. Each flag
// reads a NEXT_PUBLIC_ env var so the same value is inlined on the server and in
// the browser, and falls back to a launch-safe default when the var is unset.
//
// Launch defaults (both off) make `next build` publish a site that takes
// inquiries by email instead of payment, and hides the testimonials grid until
// real quotes exist. Set the matching env var to turn a flight on:
//   NEXT_PUBLIC_FLAG_COMMERCE=on      # live order console + on-site checkout
//   NEXT_PUBLIC_FLAG_TESTIMONIALS=on  # the "What artists say" section

const TRUE = new Set(["1", "true", "on", "yes"]);
const FALSE = new Set(["0", "false", "off", "no"]);

function readFlag(value: string | undefined, fallback: boolean): boolean {
  const v = value?.trim().toLowerCase();
  if (!v) return fallback;
  if (TRUE.has(v)) return true;
  if (FALSE.has(v)) return false;
  return fallback;
}

export const flags = {
  // The live order console, cart, and on-site checkout (/start). Off at launch:
  // booking happens by email instead of taking payment on site.
  commerce: readFlag(process.env.NEXT_PUBLIC_FLAG_COMMERCE, false),
  // The "What artists say" testimonials grid. Off until real quotes are in.
  testimonials: readFlag(process.env.NEXT_PUBLIC_FLAG_TESTIMONIALS, false),
} as const;

export type Flags = typeof flags;
