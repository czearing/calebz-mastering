import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("renders the wordmark and tagline", () => {
    render(<Footer />);
    expect(screen.getByText("CalebZ")).toBeInTheDocument();
    expect(screen.getByText("Mastering, Seattle")).toBeInTheDocument();
  });

  it("links to the real YouTube channel from content", () => {
    render(<Footer />);
    const yt = screen.getByRole("link", { name: "YouTube" });
    expect(yt).toHaveAttribute("href", "https://www.youtube.com/@CalebZaudio");
  });

  it("renders the artist icon and the fine print", () => {
    const { container } = render(<Footer />);
    const img = container.querySelector("img");
    // next/image reserves width and height to avoid layout shift; in build the
    // unoptimized config serves the raw path. Assert the source resolves to the
    // avatar regardless of whether jsdom sees the optimizer URL.
    expect(img?.getAttribute("src")).toMatch(/calebz\.jpg/);
    expect(img).toHaveAttribute("width");
    expect(img).toHaveAttribute("height");
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });
});
