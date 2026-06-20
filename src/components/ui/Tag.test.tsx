import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tag } from "./Tag";

describe("Tag", () => {
  it("renders its label text", () => {
    render(<Tag>Hip hop</Tag>);
    expect(screen.getByText("Hip hop")).toBeInTheDocument();
  });

  it("merges a custom className with the base classes", () => {
    render(<Tag className="custom-chip">-14 LUFS</Tag>);
    const el = screen.getByText("-14 LUFS");
    expect(el).toHaveClass("custom-chip");
    expect(el).toHaveClass("font-mono");
  });
});
