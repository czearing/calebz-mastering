// Server helper tests for the env-gated checkout backend. These run with
// NO Stripe / R2 / D1 / Resend env, asserting graceful degradation and
// that the quote-gating short-circuits before any network code. The pure
// re-price (cartTotalCents / lineItems) is exercised by catalog.test.ts;
// here we prove the server path honors { configured: false }. See plan/29.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getStripe,
  createCheckoutSession,
  presignUpload,
  verifyWebhook,
  recordOrderPaid,
} from "./server";
import { quoteOnly } from "./catalog";
import { emptyCart, addTrack, setAddon } from "./cart";

const KEYS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "R2_ACCOUNT_ID",
  "R2_BUCKET",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "RESEND_API_KEY",
  "ORDER_FROM_EMAIL",
  "ORDER_NOTIFY_EMAIL",
];

const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  // Ensure a fully unconfigured environment regardless of the host.
  for (const k of KEYS) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
});

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  vi.restoreAllMocks();
});

const contact = { email: "artist@example.com", name: "Artist" };

describe("getStripe", () => {
  it("returns null when STRIPE_SECRET_KEY is unset", async () => {
    expect(await getStripe()).toBeNull();
  });
});

describe("createCheckoutSession", () => {
  it("degrades to { configured: false } with no Stripe key", async () => {
    const cart = addTrack(emptyCart(), "Song A");
    const result = await createCheckoutSession(cart, contact);
    expect(result).toEqual({ configured: false });
  });
});

describe("quoteOnly gating", () => {
  it("flags Atmos carts so the route can short-circuit before Stripe", () => {
    let cart = addTrack(emptyCart(), "Song A");
    expect(quoteOnly(cart)).toBe(false);
    cart = setAddon(cart, "track-1", "atmos", 1);
    expect(quoteOnly(cart)).toBe(true);
  });
});

describe("presignUpload", () => {
  it("degrades to { configured: false } with no R2 env", async () => {
    const result = await presignUpload("order-1", "mix.wav", "audio/wav");
    expect(result).toEqual({ configured: false });
  });
});

describe("verifyWebhook", () => {
  it("returns null when no Stripe / webhook secret is set", async () => {
    expect(await verifyWebhook("{}", "sig")).toBeNull();
  });
});

describe("recordOrderPaid", () => {
  it("degrades to not-recorded with no D1 binding", async () => {
    const event = { id: "evt_1", type: "checkout.session.completed" } as never;
    const session = { id: "cs_1", metadata: {} } as never;
    const result = await recordOrderPaid(event, session);
    expect(result).toEqual({ recorded: false, emailed: false });
  });
});
