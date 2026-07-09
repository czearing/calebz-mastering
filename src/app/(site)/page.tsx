import { Header } from "@/components/ui";
import { ScrollProvider } from "@/components/providers/ScrollProvider";
import { flags } from "@/lib/flags";
import { nav } from "@/content";
import {
  Hero,
  About,
  Work,
  Services,
  Process,
  Testimonials,
  Contact,
  Footer,
} from "@/components/sections";

// The home page: one scroll, one master pass (plan/07, plan/23). Server
// component; it only composes. The sections own their own client boundaries
// (Hero is client for audio and the motif; the rest are server or client as
// authored). ScrollProvider is a thin client wrapper that drives smooth scroll
// where appropriate without changing the markup the server renders.
//
// The scroll = playhead morph: ScrollProvider runs Lenis as a root instance, so
// window.scrollY stays the scroll source of truth. The Hero motif samples global
// scroll with readProgress() inside its R3F frame loop, so as Lenis advances the
// scroll the motif morphs the before shape toward the after shape, with no React
// re-render per frame. With smooth scroll disabled the same read still reflects
// native scroll, so the morph works either way.
export default function HomePage() {
  // With commerce off, the header action points to contact.
  const book = flags.commerce
    ? nav.book
    : { ...nav.book, label: "Get in touch", href: "#contact" };
  // With the Services section dark at launch, drop its nav link so nothing
  // points at a section that isn't rendered.
  const links = flags.commerce
    ? nav.links
    : nav.links.filter((link) => link.id !== "services");

  return (
    <ScrollProvider>
      {/* The audio-reactive stereo field now lives as a contained panel beside
          each player (ABPlayer), not as a full-page layer behind the content. */}
      <Header content={{ ...nav, links, book }} />
      <main className="pt-[var(--header-h)]">
        <Hero />
        <About />
        <Work />
        <Process />
        {flags.testimonials && <Testimonials />}
        {flags.commerce && <Services />}
        <Contact />
      </main>
      <Footer />
    </ScrollProvider>
  );
}
