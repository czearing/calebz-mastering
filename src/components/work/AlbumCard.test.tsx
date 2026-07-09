import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlbumCard } from "./AlbumCard";
import { placeholderPair } from "@/content/audio";
import type { Track } from "@/content";
import { mockMatchMedia } from "./testEnv";

const track: Track = {
  id: "first-light",
  title: "First Light",
  artist: "Kessler",
  genres: ["Techno"],
  cover: "/work/for-me.jpg",
  audio: placeholderPair(1),
};

beforeEach(() => mockMatchMedia({ fine: true }));
afterEach(() => vi.restoreAllMocks());

describe("AlbumCard", () => {
  it("is a real button labelled by the track", () => {
    render(<AlbumCard track={track} onOpen={() => {}} />);
    expect(
      screen.getByRole("button", { name: /First Light by Kessler/i }),
    ).toBeInTheDocument();
  });

  it("shows the track identity below the cover", () => {
    render(<AlbumCard track={track} onOpen={() => {}} />);
    expect(screen.getByText("First Light")).toBeInTheDocument();
    expect(screen.getByText("Kessler")).toBeInTheDocument();
    expect(screen.queryByText("Techno")).not.toBeInTheDocument();
  });

  it("shows genre on the lead card", () => {
    render(<AlbumCard track={track} featured onOpen={() => {}} />);
    expect(screen.getByText("Techno")).toBeInTheDocument();
  });

  it("opens on click and on keyboard (Enter, Space)", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<AlbumCard track={track} onOpen={onOpen} />);
    const button = screen.getByRole("button");
    await user.click(button);
    button.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onOpen).toHaveBeenCalledTimes(3);
  });
});
