import { describe, it, expect, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { PageAudioField } from "./PageAudioField";
import { publishAudio } from "@/lib/audioReactive";

afterEach(() => publishAudio(null, false));

describe("PageAudioField", () => {
  it("renders a decorative, non-interactive layer hidden from assistive tech", () => {
    const { container } = render(<PageAudioField />);
    const layer = container.firstElementChild as HTMLElement;
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer.className).toContain("pointer-events-none");
  });

  it("is transparent until a track plays", () => {
    const { container } = render(<PageAudioField />);
    const layer = container.firstElementChild as HTMLElement;
    expect(layer.style.opacity).toBe("0");
  });
});
