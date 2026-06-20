import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MobileBookBar } from "./MobileBookBar";
import { nav } from "@/content";

// Capture the IntersectionObserver callback so the test can drive whether the
// watched section is in view, then assert the bar shows or hides accordingly.
let trigger: ((isIntersecting: boolean) => void) | null = null;

beforeEach(() => {
  trigger = null;
  class MockIO {
    constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
      trigger = (isIntersecting: boolean) => cb([{ isIntersecting }]);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  Object.defineProperty(globalThis, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIO,
  });
});

afterEach(() => vi.restoreAllMocks());

describe("MobileBookBar", () => {
  it("offers the primary CTA link from content", () => {
    render(
      <>
        <section id="contact" />
        <MobileBookBar />
      </>,
    );
    const link = screen.getByRole("link", { name: nav.book.label });
    expect(link).toHaveAttribute("href", nav.book.href);
  });

  it("hides itself when the contact section is in view", () => {
    const { container } = render(
      <>
        <section id="contact" />
        <MobileBookBar />
      </>,
    );
    const bar = container.querySelector("div[aria-hidden]");
    expect(bar).toHaveAttribute("aria-hidden", "false");

    act(() => trigger?.(true));
    expect(bar).toHaveAttribute("aria-hidden", "true");

    act(() => trigger?.(false));
    expect(bar).toHaveAttribute("aria-hidden", "false");
  });
});
