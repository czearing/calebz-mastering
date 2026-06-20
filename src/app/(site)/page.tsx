import { Header } from "@/components/ui";
import { ScrollProvider } from "@/components/ScrollProvider";
import { PageAudioField } from "@/components/audio/PageAudioField";
import {
  Hero,
  About,
  Work,
  Services,
  Process,
  Testimonials,
  Contact,
  Footer,
  MobileBookBar,
} from "@/components/sections";

// The home page: one scroll, one master pass (plan/07, plan/23). Server
// component; it only composes. The sections own their own client boundaries
// (Hero is client for audio and the motif; the rest are server or client as
// authored). ScrollProvider is a thin client wrapper that drives smooth scroll
// where appropriate without changing the markup the server renders.
//
// The scroll = playhead morph: ScrollProvider runs Lenis as a root instance, so
// window.scrollY stays the scroll source of truth. The Hero motif reads global
// scroll through useScrollSignal (which samples window.scrollY on rAF), so as
// Lenis advances the scroll the motif morphs the before shape toward the after
// shape. With smooth scroll disabled the same signal still reads native scroll,
// so the morph works either way.
export default function HomePage() {
  return (
    <ScrollProvider>
      {/* Full-bleed audio-reactive background, behind everything (plan/28). */}
      <PageAudioField />
      <Header />
      <main className="pt-[var(--space-8)]">
        <Hero />
        <About />
        <Work />
        <Process />
        <Testimonials />
        <Services />
        <Contact />
      </main>
      <Footer />
      <MobileBookBar watchIds={["services", "contact"]} />
    </ScrollProvider>
  );
}
