import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// next/dynamic pulls in the R3F canvas chunk. The motif is decorative and the
// page must read without it, so stub the dynamic loader to render nothing here.
vi.mock("next/dynamic", () => ({
  default: () => function MockMotif() {
    return null;
  },
}));

// The hero loads the A/B player via next/dynamic (ssr:false) to keep audio off
// the first-load bundle. Render the real player synchronously in tests so the
// play behavior is exercised, not the static fallback.
vi.mock("@/components/audio/ABPlayerLazy", async () => {
  const { ABPlayer } = await import("@/components/audio/ABPlayer");
  return { ABPlayerLazy: ABPlayer };
});

import { Hero } from "./Hero";
import { hero } from "@/content";
import { installAudioStub } from "@/components/audio/testAudio";

// jsdom lacks matchMedia and IntersectionObserver, which framer-motion (Reveal)
// reads for reduced motion and whileInView. Stub both.
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
  class MockIO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  Object.defineProperty(globalThis, "IntersectionObserver", {
    writable: true,
    value: MockIO,
  });
});

beforeEach(() => installAudioStub());
afterEach(() => vi.restoreAllMocks());

describe("Hero", () => {
  it("renders the signature headline as the level-one heading", () => {
    render(<Hero />);
    expect(
      screen.getByRole("heading", { level: 1, name: hero.headline }),
    ).toBeInTheDocument();
  });

  it("offers one primary action that anchors to the services console", () => {
    render(<Hero />);
    const cta = screen.getByRole("link", { name: hero.primaryAction });
    expect(cta).toHaveAttribute("href", "#services");
  });

  it("no longer carries the founder note; it moved to the About section", () => {
    render(<Hero />);
    // The founder note lives in the "Meet CalebZ" section now (plan/25), so the
    // hero stays the statement plus the A/B proof and never duplicates it.
    expect(screen.queryByText(hero.founderNote)).not.toBeInTheDocument();
  });

  it("prompts the first play but never autoplays", async () => {
    render(<Hero />);
    expect(screen.getByText(hero.playPrompt)).toBeInTheDocument();
    expect(window.Audio).not.toHaveBeenCalled();
    // The play affordance names the action, not the headline, so the H1 copy
    // is said once on the page.
    const playLabel = `Play, ${hero.beforeLabel} and ${hero.afterLabel}`;
    await userEvent.click(screen.getByRole("button", { name: playLabel }));
    expect(window.Audio).toHaveBeenCalled();
  });

  it("does not echo the headline inside the hero player", () => {
    render(<Hero />);
    // "Hear the difference." is the H1 only. The player card titles the
    // comparison, never the headline, so the line is said once.
    const titles = screen.getAllByText(hero.headline);
    expect(titles.length).toBe(1);
  });
});
