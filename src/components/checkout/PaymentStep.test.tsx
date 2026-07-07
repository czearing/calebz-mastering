import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addTrack, emptyCart } from "@/lib/checkout";
import { PaymentStep } from "./PaymentStep";

const cart = addTrack(emptyCart(), "Night Drive");
const payer = { name: "Ada", email: "ada@studio.com" };

function mockCheckout(body: unknown, ok = true) {
  return vi.fn(async () =>
    ({ ok, json: async () => body }) as unknown as Response,
  );
}

async function pay() {
  await userEvent.click(screen.getByRole("button", { name: /^Pay/ }));
}

function renderStep(onPaid = vi.fn()) {
  render(
    <PaymentStep
      cart={cart}
      payer={payer}      onBack={() => {}}
      onPaid={onPaid}
    />,
  );
  return { onPaid };
}

describe("PaymentStep", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("no longer renders name or email fields (collected at upload)", () => {
    vi.stubGlobal("fetch", mockCheckout({ configured: false }));
    renderStep();
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
  });

  it("posts the threaded payer as contact when Pay is clicked", async () => {
    const fetchMock = mockCheckout({ configured: false });
    vi.stubGlobal("fetch", fetchMock);
    renderStep();
    await pay();
    const [, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    const body = JSON.parse(init.body as string);
    expect(body.contact).toEqual(payer);
  });

  it("notes that payment is secured by Stripe, in one plain line", () => {
    vi.stubGlobal("fetch", mockCheckout({ configured: false }));
    renderStep();
    expect(
      screen.getByText(/Payments are secured by Stripe\./),
    ).toBeInTheDocument();
    // The defensive identity bio that used to ride on this line is gone; the
    // page wordmark carries identity now.
    expect(
      screen.queryByText(/mastering engineer in Seattle/),
    ).not.toBeInTheDocument();
  });

  it("keeps the pay step to two plain lines, no wall of reassurance", () => {
    vi.stubGlobal("fetch", mockCheckout({ configured: false }));
    renderStep();
    // What happens next, stated plainly: work starts after payment.
    expect(
      screen.getByText(/Once you pay, I get started/),
    ).toBeInTheDocument();
    // The free-first-master invite and the "until you are happy" line live
    // earlier, on Review, not stacked up at the point of paying.
    expect(
      screen.queryByText(/Your first master is free/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/we keep going until you are happy/),
    ).not.toBeInTheDocument();
  });

  it("routes a quoteOnly cart to request a quote", async () => {
    vi.stubGlobal("fetch", mockCheckout({ quoteOnly: true }));
    renderStep();
    await pay();
    const link = await screen.findByRole("link", { name: "Request a quote" });
    expect(link).toHaveAttribute("href", "/#contact");
  });

  it("shows the not-yet-connected state on configured:false", async () => {
    vi.stubGlobal("fetch", mockCheckout({ configured: false }));
    const { onPaid } = renderStep();
    await pay();
    expect(
      await screen.findByText(/Checkout activates once payment is connected/),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "See the demo" }));
    expect(onPaid).toHaveBeenCalledOnce();
  });

  it("falls back to continue when a clientSecret returns without a key", async () => {
    vi.stubGlobal("fetch", mockCheckout({ clientSecret: "cs_test_123" }));
    const { onPaid } = renderStep();
    await pay();
    await userEvent.click(
      await screen.findByRole("button", { name: "Continue" }),
    );
    expect(onPaid).toHaveBeenCalledOnce();
  });

  it("surfaces a failure alert when the checkout request is not ok", async () => {
    vi.stubGlobal("fetch", mockCheckout({ error: "boom" }, false));
    const { onPaid } = renderStep();
    await pay();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That did not go through",
    );
    expect(onPaid).not.toHaveBeenCalled();
  });
});
