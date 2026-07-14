import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrackModal } from "./TrackModal";
import { placeholderPair } from "@/content/audio";
import type { Track } from "@/content";
import { mockDialog } from "./testEnv";

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));

// Keep audio out of the modal test; assert the proof slot renders.
vi.mock("@/components/audio/ABPlayerLazy", () => ({
  ABPlayerLazy: ({ title }: { title?: string }) => (
    <div data-testid="ab-player">{title}</div>
  ),
}));

const track: Track = {
  id: "first-light",
  title: "First Light",
  artist: "Kessler",
  genres: ["Techno"],
  cover: "/work/for-me.jpg",
  audio: placeholderPair(1),
  links: [
    {
      platform: "soundcloud",
      url: "https://soundcloud.com/example/first-light",
    },
  ],
  caseStudy: {
    issue: "The mix lacked density.",
    change: "Tightened the dynamics.",
    result: "The master gained 3 LUFS.",
  },
};

beforeEach(() => mockDialog());
afterEach(() => vi.restoreAllMocks());

describe("TrackModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <TrackModal
        track={track}
        open={false}
        triggerRect={null}
        onClose={() => {}}
      />,
    );
    expect(container.querySelector("dialog")).toBeNull();
  });

  it("opens the native dialog with showModal and is labelled by the title", () => {
    render(
      <TrackModal track={track} open triggerRect={null} onClose={() => {}} />,
    );
    const dialog = screen.getByRole("dialog");
    expect(window.HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    const titled = screen.getByRole("dialog", { name: "First Light" });
    expect(titled).toBe(dialog);
  });

  it("carries the before/after player", () => {
    render(
      <TrackModal track={track} open triggerRect={null} onClose={() => {}} />,
    );
    expect(screen.getByTestId("ab-player")).toBeInTheDocument();
  });

  it("hides internal case notes and shows the platform link", () => {
    render(
      <TrackModal track={track} open triggerRect={null} onClose={() => {}} />,
    );
    expect(screen.queryByText("Issue")).not.toBeInTheDocument();
    expect(
      screen.queryByText("The mix lacked density."),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Listen on SoundCloud" }),
    ).toHaveAttribute("href", "https://soundcloud.com/example/first-light");
  });

  it("calls onClose from the Close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <TrackModal track={track} open triggerRect={null} onClose={onClose} />,
    );
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("locks page scroll while open and restores it on close (accessibility)", () => {
    const { rerender } = render(
      <TrackModal track={track} open triggerRect={null} onClose={() => {}} />,
    );
    expect(document.documentElement.style.overflow).toBe("hidden");
    rerender(
      <TrackModal
        track={track}
        open={false}
        triggerRect={null}
        onClose={() => {}}
      />,
    );
    expect(document.documentElement.style.overflow).not.toBe("hidden");
  });
});
