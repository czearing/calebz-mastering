import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Contact } from "./Contact";

// Mock the server action so the form runs without a server. It resolves ok.
const submit = vi.fn(async (input: unknown) => {
  void input;
  return { ok: true as const };
});
vi.mock("@/app/actions/inquiry", () => ({
  submitInquiry: (input: unknown) => submit(input),
}));

// The section loads the form via next/dynamic (ssr:false) to keep it off the
// first-load bundle. Render the real form synchronously in tests so behavior is
// exercised directly, not the loading placeholder.
vi.mock("./ContactFormLazy", async () => {
  const { ContactForm } = await import("./ContactForm");
  return { ContactFormLazy: ContactForm };
});

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

describe("Contact", () => {
  it("anchors the section at id=contact and exposes labeled fields", () => {
    const { container } = render(<Contact />);
    expect(container.querySelector("section#contact")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Project type")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
  });

  it("shows validation errors and does not submit when required fields are empty", async () => {
    render(<Contact />);
    await userEvent.click(screen.getByRole("button", { name: /send one track/i }));
    expect(await screen.findByText("Tell me your name.")).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  it("submits valid input and shows the confirmation in place", async () => {
    render(<Contact />);
    await userEvent.type(screen.getByLabelText("Name"), "Mara Vance");
    await userEvent.type(screen.getByLabelText("Email"), "mara@studio.com");
    await userEvent.click(screen.getByRole("button", { name: /send one track/i }));
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent(/Thanks\. I will get back to you/i);
  });
});
