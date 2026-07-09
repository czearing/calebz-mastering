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

describe("Contact (commerce on, form)", () => {
  it("anchors the section at id=contact and exposes labeled fields", () => {
    const { container } = render(<Contact commerce />);
    expect(container.querySelector("section#contact")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Project type")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
  });

  it("shows validation errors and does not submit when required fields are empty", async () => {
    render(<Contact commerce />);
    await userEvent.click(
      screen.getByRole("button", { name: /send message/i }),
    );
    expect(await screen.findByText("Tell me your name.")).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  it("submits valid input and shows the confirmation in place", async () => {
    render(<Contact commerce />);
    await userEvent.type(screen.getByLabelText("Name"), "Mara Vance");
    await userEvent.type(screen.getByLabelText("Email"), "mara@studio.com");
    await userEvent.click(
      screen.getByRole("button", { name: /send message/i }),
    );
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent(
      /Thanks\. I'll reply within one business day/i,
    );
  });
});

// Launch default: a single email call to action, no form. The button opens a
// pre-filled mailto.
describe("Contact (commerce off, email)", () => {
  it("renders a pre-filled mailto and no form", () => {
    const { container } = render(<Contact commerce={false} />);
    expect(container.querySelector("section#contact")).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: "Email me" });
    const href = cta.getAttribute("href") ?? "";
    expect(href.startsWith("mailto:calebzofficial@gmail.com?")).toBe(true);
    expect(href).toContain("subject=Mastering%20inquiry");
    expect(href).toContain("body=");
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });
});
