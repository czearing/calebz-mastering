import { cn } from "@/lib/cn";
import { nav as defaultNav } from "@/content";
import type { Nav } from "@/content";

export type HeaderProps = {
  content?: Nav;
};

// Thin fixed header (plan/07): wordmark left, anchor links centre-right, one
// Book button right. Anchors are real links so scroll works with no JS and is
// keyboard reachable. On mobile the links collapse and only wordmark plus Book
// remain, both thumb-reachable. The bar sits above the motif but never traps
// focus; the global cyan focus ring stays visible via scroll-margin on targets.
const book =
  "inline-flex items-center justify-center rounded-[var(--radius-sm)] " +
  "bg-cyan px-[var(--space-4)] py-[var(--space-2)] text-bg " +
  "text-label font-mono uppercase tracking-[0.06em] transition-colors " +
  "hover:bg-cyan-dim hover:text-text min-h-[var(--space-6)]";

const linkClass =
  "inline-flex min-h-[var(--space-5)] items-center " +
  "text-label font-mono uppercase tracking-[0.06em] text-muted " +
  "transition-colors hover:text-cyan";

export function Header({ content = defaultNav }: HeaderProps) {
  const { wordmark, links, book: bookLink } = content;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[var(--header-h)] w-full",
        "border-b border-line bg-bg/85 backdrop-blur",
      )}
    >
      {/* Padding lives on the outer wrapper and the max-width column sits inside
          it, exactly like the Section primitive, so the wordmark left edge lines
          up to the pixel with the page content below. The bar is pinned to
          --header-h and the row fills it (h-full) with content centered, so the
          height stays constant and anchor scroll-margin always matches. */}
      <div className="h-full px-[var(--space-5)]">
        <div
          className={cn(
            "mx-auto flex h-full w-full max-w-[var(--max-content)] items-center",
            "justify-between gap-[var(--space-4)]",
          )}
        >
          <a
            href="#hero"
            className="text-h2 font-sans text-text transition-colors hover:text-cyan"
          >
            {wordmark}
          </a>

          <nav aria-label="Primary" className="flex items-center gap-[var(--space-5)]">
            <ul className="hidden items-center gap-[var(--space-5)] md:flex">
              {links.map((link) => (
                <li key={link.id}>
                  <a href={link.href} className={cn(linkClass)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <a href={bookLink.href} className={cn(book)}>
              {bookLink.label}
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
