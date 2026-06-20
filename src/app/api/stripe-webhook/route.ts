// POST /api/stripe-webhook
// Verifies the Stripe signature against the RAW body (never a parsed copy)
// and, on checkout.session.completed, records the paid order in D1 and
// emails CalebZ. Returns 2xx fast; 400 on a bad signature; 503 when the
// backend is unconfigured. Idempotent via processed_events. See plan/29
// sections 5 and 7.

import { verifyWebhook, recordOrderPaid } from "@/lib/checkout/server";
import type Stripe from "stripe";

export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  const sig = req.headers.get("stripe-signature");
  // Read the raw body as text BEFORE any parsing so the bytes match what
  // Stripe signed. Do not call req.json() first.
  const rawBody = await req.text();

  if (!sig) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event | null;
  try {
    event = await verifyWebhook(rawBody, sig);
  } catch {
    // Bad signature or malformed payload: reject so Stripe does not retry
    // a forged event as if it were a transient failure.
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  // No Stripe/webhook secret configured: acknowledge as unavailable so the
  // dashboard shows it is not wired, without leaking a 2xx success.
  if (!event) {
    return new Response("Webhook not configured", { status: 503 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await recordOrderPaid(event, session);
    } catch {
      // Persisting failed: 500 so Stripe retries. The event id dedup makes
      // the retry safe (no double order, no double email).
      return Response.json({ error: "Record failed" }, { status: 500 });
    }
  }

  // Acknowledge fast for every handled or ignored event type.
  return Response.json({ received: true });
}
