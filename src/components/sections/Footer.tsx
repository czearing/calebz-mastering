import Image from "next/image";
import { footer as footerContent } from "@/content";
import type { Footer as FooterContent } from "@/content";

export type FooterProps = {
  content?: FooterContent;
  icon?: string;
};

// Links, credits, and the artist mark. Last beat of the scroll: easy to follow.
// See plan/07, plan/08.
export function Footer({
  content = footerContent,
  icon = "/calebz.jpg",
}: FooterProps) {
  const { wordmark, links, finePrint } = content;

  return (
    <footer className="w-full border-t border-line px-[var(--space-5)] py-[var(--space-8)]">
      <div className="mx-auto flex w-full max-w-[var(--max-content)] flex-col gap-[var(--space-6)] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-[var(--space-4)]">
          <Image
            src={icon}
            alt=""
            width={48}
            height={48}
            className="h-[var(--space-7)] w-[var(--space-7)] rounded-full object-cover"
          />
          <span className="text-h2 font-sans text-text">{wordmark}</span>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-[var(--space-5)]">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    link.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="inline-flex min-h-[var(--space-5)] items-center text-label font-mono uppercase text-muted hover:text-cyan"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="mx-auto mt-[var(--space-6)] w-full max-w-[var(--max-content)] text-label font-mono text-muted">
        {finePrint}
      </p>
    </footer>
  );
}
