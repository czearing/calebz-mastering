// Server-only checkout helpers. Every network-facing function is gated
// on env and degrades to { configured: false } (or null) when keys are
// missing, mirroring the Resend stub in src/app/actions/inquiry.ts, so
// the site builds and runs with no secrets. The one invariant that keeps
// this safe: the amount is ALWAYS recomputed from the catalog here; the
// client total is never read. See plan/29 sections 4 to 6.
//
// Required env (CalebZ sets these as Cloudflare Pages secrets / bindings
// in the dashboard, or in .dev.vars for local `wrangler pages dev`):
//   STRIPE_SECRET_KEY       Stripe secret (sk_live_... / sk_test_...)
//   STRIPE_WEBHOOK_SECRET   webhook signing secret (whsec_...)
//   R2_ACCOUNT_ID           Cloudflare account id (R2 S3 endpoint host)
//   R2_BUCKET               R2 bucket name for source uploads
//   R2_ACCESS_KEY_ID        R2 S3 API access key id
//   R2_SECRET_ACCESS_KEY    R2 S3 API secret access key
//   DB                      D1 binding (wrangler.toml [[d1_databases]])
//   RESEND_API_KEY          Resend API key for the paid-order email
//   ORDER_FROM_EMAIL        verified Resend sender (e.g. orders@domain)
//   ORDER_NOTIFY_EMAIL      where CalebZ receives the order summary
//   SITE_URL                site origin, used to build the return_url

import type Stripe from "stripe";
import { cartTotalCents, lineItems } from "./catalog";
import type { Cart } from "./types";
import { getEnv, type CheckoutEnv } from "./env";
import { hasR2, presignPut, sourceKey } from "./r2";

// The paid-order persistence/notification lives in orders-store.ts to keep
// this file small. Re-exported so route handlers import it from one place.
export { recordOrderPaid } from "./orders-store";

export interface Contact {
  email: string;
  name: string;
}

export interface CheckoutResult {
  clientSecret?: string;
  orderId?: string;
  configured: boolean;
}

// Lazily build a Stripe client configured for the Workers fetch runtime.
// Returns null when STRIPE_SECRET_KEY is unset so callers degrade.
export async function getStripe(env?: CheckoutEnv): Promise<Stripe | null> {
  const e = env ?? (await getEnv());
  if (!e.STRIPE_SECRET_KEY) return null;
  const { default: Stripe } = await import("stripe");
  return new Stripe(e.STRIPE_SECRET_KEY, {
    // Workers has no Node http; use the fetch-based HTTP client and the
    // SubtleCrypto provider so the SDK runs on the edge.
    httpClient: Stripe.createFetchHttpClient(),
  });
}

// A short, unguessable order id. Used as Stripe metadata.order_id, the
// R2 key prefix, and the D1 primary key. nanoid is already a dependency.
async function newOrderId(): Promise<string> {
  const { nanoid } = await import("nanoid");
  return nanoid(16);
}

// Create an embedded Checkout Session. The amount is recomputed from the
// catalog here via cartTotalCents/lineItems; the request carries no total
// we would trust. Price lives in the Session, defeating amount tampering.
export async function createCheckoutSession(
  cart: Cart,
  contact: Contact,
): Promise<CheckoutResult> {
  const env = await getEnv();
  const stripe = await getStripe(env);
  if (!stripe) return { configured: false };

  const orderId = await newOrderId();
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = lineItems(
    cart,
  ).map((item) => ({
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: item.amountCents, // recomputed server-side, not client
      product_data: { name: item.label },
    },
  }));

  const returnUrl = `${env.SITE_URL ?? ""}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`;
  const session = await stripe.checkout.sessions.create({
    // "embedded_page" is the SDK literal for the on-site embedded
    // Checkout (ui_mode embedded + Payment Element). See plan/29 s4.
    ui_mode: "embedded_page",
    mode: "payment",
    line_items,
    customer_email: contact.email,
    metadata: { order_id: orderId, total_cents: String(cartTotalCents(cart)) },
    return_url: returnUrl,
  });

  return {
    clientSecret: session.client_secret ?? undefined,
    orderId,
    configured: true,
  };
}

export interface PresignResult {
  url?: string;
  key?: string;
  configured: boolean;
}

// True only when the order exists in D1 and is marked paid. When D1 is not
// configured we cannot verify, so we treat it as not paid and refuse to sign.
async function orderPaid(env: CheckoutEnv, orderId: string): Promise<boolean> {
  if (!env.DB) return false;
  const row = await env.DB.prepare("SELECT status FROM orders WHERE id = ?")
    .bind(orderId)
    .first<{ status: string }>();
  return row?.status === "paid";
}

// Presigned R2 PUT for an order's source file. Gated on R2 env, and never
// minted unless the order is a real paid order, so a forged or unpaid order id
// cannot obtain a signed write URL into the bucket (plan/29 s6).
export async function presignUpload(
  orderId: string,
  filename: string,
  contentType: string,
): Promise<PresignResult> {
  const env = await getEnv();
  if (!hasR2(env)) return { configured: false };
  if (!(await orderPaid(env, orderId))) return { configured: false };
  const key = sourceKey(orderId, filename);
  const url = await presignPut(env, key, contentType);
  return { url, key, configured: true };
}

// Verify a Stripe webhook using the Workers SubtleCrypto provider and the
// raw request body. Returns null when no client or secret is configured.
export async function verifyWebhook(
  rawBody: string,
  sig: string,
): Promise<Stripe.Event | null> {
  const env = await getEnv();
  const stripe = await getStripe(env);
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) return null;
  const provider = (await import("stripe")).default.createSubtleCryptoProvider();
  return stripe.webhooks.constructEventAsync(
    rawBody,
    sig,
    env.STRIPE_WEBHOOK_SECRET,
    undefined,
    provider,
  );
}
