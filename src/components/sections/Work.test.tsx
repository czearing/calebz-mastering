import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Work } from "./Work";
import { work } from "@/content";
import { mockMatchMedia, mockDialog } from "@/components/work/testEnv";

// Escape regex specials so titles like "Found You (CalebZ Remix)" match literally.
const rx = (s: string) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

// The modal's A/B player loads via next/dynamic; stub it so opening a card does
// not pull the audio engine into the section test.
vi.mock("@/components/audio/ABPlayerLazy", () => ({
  ABPlayerLazy: () => <div data-testid="ab-player" />,
}));

// Reveal needs matchMedia and IntersectionObserver in jsdom; the cards need a
// fine pointer for scrub and the native dialog stubs for the modal.
beforeEach(() => {
  mockMatchMedia({ fine: true });
  mockDialog();
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
afterEach(() => vi.restoreAllMocks());

describe("Work", () => {
  it("renders the section heading", () => {
    render(<Work />);
    expect(
      screen.getByRole("heading", { level: 2, name: work.title }),
    ).toBeInTheDocument();
  });

  it("renders one album-card button per selected track, labelled by title and artist", () => {
    render(<Work />);
    for (const track of work.tracks) {
      expect(
        screen.getByRole("button", {
          name: rx(`${track.title} by ${track.artist}`),
        }),
      ).toBeInTheDocument();
    }
  });

  it("keeps the cards bare: the track title appears only in the modal", async () => {
    const user = userEvent.setup();
    render(<Work />);
    const first = work.tracks[0];
    // Card is just the cover: no visible title text at rest. (Genre can appear
    // in the genre filter pills, which is expected.)
    expect(screen.queryByText(first.title)).not.toBeInTheDocument();
    // Opening the modal reveals the metadata.
    await user.click(
      screen.getByRole("button", { name: rx(`${first.title} by ${first.artist}`) }),
    );
    const dialog = screen.getByRole("dialog", { name: first.title });
    expect(within(dialog).getByText(first.title)).toBeInTheDocument();
    expect(within(dialog).getByText(first.genre)).toBeInTheDocument();
  });

  it("filters the grid by genre", async () => {
    const user = userEvent.setup();
    render(<Work />);
    // Two genres in the placeholder set (Dance, Pop), so the filter shows.
    const pop = work.tracks.filter((t) => t.genre === "Pop");
    const dance = work.tracks.filter((t) => t.genre === "Dance");
    await user.click(screen.getByRole("button", { name: "Pop", pressed: false }));
    // Only Pop cards remain (matched by their accessible label).
    expect(
      screen.getAllByRole("button", { name: /Open before and after/ }).length,
    ).toBe(pop.length);
    await user.click(screen.getByRole("button", { name: "All", pressed: false }));
    expect(
      screen.getAllByRole("button", { name: /Open before and after/ }).length,
    ).toBe(pop.length + dance.length);
  });
});
