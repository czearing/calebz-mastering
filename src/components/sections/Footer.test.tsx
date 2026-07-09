import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("renders the wordmark without a tagline", () => {
    render(<Footer />);
    expect(screen.getByText("CalebZ")).toBeInTheDocument();
    expect(
      screen.queryByText("Electronic / Hip-hop / Pop"),
    ).not.toBeInTheDocument();
  });

  it("links to the real music profiles", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "YouTube" })).toHaveAttribute(
      "href",
      "https://www.youtube.com/@CalebZaudio",
    );
    expect(screen.getByRole("link", { name: "Spotify" })).toHaveAttribute(
      "href",
      "https://open.spotify.com/artist/564lyz9Wk0PY0XT6P6pnCk",
    );
    expect(screen.getByRole("link", { name: "Tidal" })).toHaveAttribute(
      "href",
      "https://tidal.com/artist/22376230",
    );
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
