import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field } from "./Field";

describe("Field", () => {
  it("associates the label with the control", () => {
    render(<Field label="Email" type="email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("uses a 16px control font so iOS Safari does not zoom on focus", () => {
    render(<Field label="Email" />);
    expect(screen.getByLabelText("Email")).toHaveClass("text-[16px]");
  });

  it("marks the control invalid and describes it by the error when present", () => {
    render(<Field label="Email" error="Enter a valid email address." />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const error = screen.getByRole("alert");
    expect(error).toHaveTextContent("Enter a valid email address.");
    expect(input.getAttribute("aria-describedby")).toContain(error.id);
  });

  it("is not invalid and has no error region when no error is set", () => {
    render(<Field label="Email" />);
    expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders a textarea when as is textarea and accepts typing", async () => {
    render(<Field as="textarea" label="Notes" />);
    const area = screen.getByLabelText("Notes");
    expect(area.tagName).toBe("TEXTAREA");
    await userEvent.type(area, "Master my track");
    expect(area).toHaveValue("Master my track");
  });
});
