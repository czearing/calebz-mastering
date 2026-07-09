import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkGrid } from "./WorkGrid";
import { placeholderPair } from "@/content/audio";
import type { Track } from "@/content";
import { mockMatchMedia, mockDialog } from "./testEnv";

const { trackEvent } = vi.hoisted(() => ({ trackEvent: vi.fn() }));
vi.mock("@vercel/analytics", () => ({ track: trackEvent }));

vi.mock("@/components/audio/ABPlayerLazy", () => ({
  ABPlayerLazy: () => <div data-testid="ab-player" />,
}));

const tracks: Track[] = [
  {
    id: "a",
    title: "Alpha",
    artist: "One",
    genres: ["Techno"],
    cover: "/work/for-me.jpg",
    audio: placeholderPair(1),
  },
  {
    id: "b",
    title: "Beta",
    artist: "Two",
    genres: ["House"],
    cover: "/work/i-need-you.jpg",
    audio: placeholderPair(2),
  },
];

beforeEach(() => {
  trackEvent.mockClear();
  mockMatchMedia({ fine: true });
  mockDialog();
});
afterEach(() => vi.restoreAllMocks());

describe("WorkGrid", () => {
  it("renders one card button per track", () => {
    render(<WorkGrid tracks={tracks} />);
    expect(
      screen.getByRole("button", { name: /Alpha\s+One/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Beta\s+Two/i }),
    ).toBeInTheDocument();
  });

  it("opens the modal for the clicked track only", async () => {
    const user = userEvent.setup();
    render(<WorkGrid tracks={tracks} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByRole("button", { name: /Beta\s+Two/i }));
    expect(screen.getByRole("dialog", { name: "Beta" })).toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalledWith("Track Open", { track: "b" });
  });

  it("returns focus to the trigger card when the modal closes", async () => {
    const user = userEvent.setup();
    render(<WorkGrid tracks={tracks} />);
    const trigger = screen.getByRole("button", { name: /Alpha\s+One/i });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("tracks genre changes", async () => {
    const user = userEvent.setup();
    render(<WorkGrid tracks={tracks} />);
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "House",
    );
    expect(trackEvent).toHaveBeenCalledWith("Genre Filter", {
      genre: "House",
    });
  });
});
