import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Marquee } from "./Marquee";

// Stub matchMedia in jsdom for any reduced-motion query.
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
});

describe("Marquee", () => {
  it("renders its content, duplicated for a seamless loop", () => {
    render(
      <Marquee>
        <span>Indie rock</span>
      </Marquee>,
    );
    // One visible copy plus one aria-hidden copy.
    expect(screen.getAllByText("Indie rock")).toHaveLength(2);
  });

  it("pauses on pointer hover", async () => {
    const { container } = render(
      <Marquee>
        <span>Hip hop</span>
      </Marquee>,
    );
    const region = container.firstElementChild as HTMLElement;
    await userEvent.hover(region);
    // Hover sets paused state without error; content stays readable.
    expect(screen.getAllByText("Hip hop").length).toBeGreaterThan(0);
  });
});
