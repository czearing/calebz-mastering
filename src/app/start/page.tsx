import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutFlow, SEEDED_FLOW } from "@/components/checkout";
import { buildHydrationCart, parseQuery } from "@/lib/checkout";

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
  if (!("tracks" in params)) redirect("/#services");

  const { trackCount, addons } = parseQuery(params);
  const initialCart = buildHydrationCart(trackCount, addons);

  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center px-[var(--space-5)] py-[var(--space-7)]">
      <div className="flex w-full max-w-[var(--max-content)] flex-col gap-[var(--space-7)]">
        <Link
          href="/"
          className="self-start text-label font-mono uppercase tracking-[0.06em] text-muted transition-colors hover:text-cyan"
        >
          CalebZ Mastering
        </Link>
        <CheckoutFlow initialCart={initialCart} flow={SEEDED_FLOW} persist />
      </div>
    </main>
  );
}
