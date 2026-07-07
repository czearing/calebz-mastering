import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutFlow, SEEDED_FLOW } from "@/components/checkout";
import { nav } from "@/content";
import { buildHydrationCart, parseQuery } from "@/lib/checkout";
import { flags } from "@/lib/flags";

export const metadata: Metadata = {
  title: "Start a master | CalebZ Mastering",
  description:
    "Review your configured release, send your tracks, then pay on site. Per-track pricing, no fixed tiers.",
};

type SearchParams = Record<string, string | string[] | undefined>;

// The focused checkout surface. Its own minimal page: no site header, footer,
// or smooth scroll, so the artist stays on the task. A single quiet link back
// home is the only chrome. See plan/30 A.
//
// The Services section is the only configurator, so /start always arrives
// seeded. When the URL carries its params (tracks=..&stems=.. and so on),
// parse them, rebuild the exact configured Cart with buildHydrationCart, and
// run the short upload-first flow (Review, Send your tracks, Pay, Confirm),
// numbered "of 4". A direct visit with no params has nothing to review, so it
// redirects back to /#services rather than rendering an empty builder.
export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  // On-site checkout is gated by the commerce flight. With it off there is no
  // cart, so this route has nothing to fulfill: send visitors home to the
  // email-based contact flow instead of rendering an empty checkout.
  if (!flags.commerce) redirect("/#contact");
  if (!("tracks" in params)) redirect("/#services");

  const { trackCount, addons } = parseQuery(params);
  const initialCart = buildHydrationCart(trackCount, addons);

  return (
    <div className="flex min-h-dvh w-full flex-col">
      {/* A real header bar, mirroring the home Header to the pixel: same
          --header-h row, same border-b hairline, same nested structure (border
          box outer, h-full padded wrapper, max-width column inner) and the same
          text-h2 wordmark. Border-box trims the centering area to 71px exactly
          as on home, so the mark lands at the same top, left, and size. The
          checkout stays otherwise chrome-light: no nav, no Book button, just
          this one link home. */}
      <header className="h-[var(--header-h)] border-b border-line">
        <div className="h-full px-[var(--space-5)]">
          <div className="mx-auto flex h-full w-full max-w-[var(--max-content)] items-center">
            <Link
              href="/"
              className="text-h2 font-sans text-text transition-colors hover:text-cyan"
            >
              {nav.wordmark}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-[var(--space-5)] pb-[var(--space-7)]">
        <CheckoutFlow initialCart={initialCart} flow={SEEDED_FLOW} persist />
      </main>
    </div>
  );
}
