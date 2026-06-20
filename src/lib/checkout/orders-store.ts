// D1 persistence and the Resend notification for a paid order. Split out
// of server.ts to keep each file small. Idempotent via processed_events;
// gated on the D1 binding (and Resend env for the email). See plan/29 s5/s7.

import type Stripe from "stripe";
import { getEnv, type CheckoutEnv } from "./env";

// Upsert the paid order into D1 and email CalebZ. Idempotent: the event id
// is the primary key of processed_events, so a Stripe retry is a no-op.
export async function recordOrderPaid(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
): Promise<{ recorded: boolean; emailed: boolean }> {
  const env = await getEnv();
  if (!env.DB) return { recorded: false, emailed: false };

  // Idempotency gate: claim the event id atomically. INSERT OR IGNORE writes
  // exactly once; meta.changes is 1 only for the run that won the claim, so a
  // Stripe retry (changes === 0) returns here and never re-records or re-emails.
  const claim = await env.DB.prepare(
    "INSERT OR IGNORE INTO processed_events (event_id, order_id, created_at) VALUES (?, ?, ?)",
  )
    .bind(event.id, session.metadata?.order_id ?? "", new Date().toISOString())
    .run();
  if (!claim.meta || claim.meta.changes === 0) {
    return { recorded: false, emailed: false };
  }

  const orderId = session.metadata?.order_id ?? "";
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO orders
       (id, email, name, items_json, amount_cents, currency, status, stripe_session_id, source_key, delivery_token, created_at, paid_at, delivered_at)
     VALUES (?, ?, ?, ?, ?, ?, 'paid', ?, NULL, NULL, ?, ?, NULL)
     ON CONFLICT(id) DO UPDATE SET status='paid', paid_at=excluded.paid_at, stripe_session_id=excluded.stripe_session_id`,
  )
    .bind(
      orderId,
      session.customer_details?.email ?? session.customer_email ?? "",
      session.customer_details?.name ?? "",
      JSON.stringify(session.metadata ?? {}),
      session.amount_total ?? 0,
      session.currency ?? "usd",
      session.id,
      now,
      now,
    )
    .run();

  const emailed = await emailOrder(env, orderId, session);
  return { recorded: true, emailed };
}

// Email CalebZ the order summary plus the R2 source-upload prefix. Resend
// via fetch (no SDK). Gated on Resend env; returns false when unconfigured.
async function emailOrder(
  env: CheckoutEnv,
  orderId: string,
  session: Stripe.Checkout.Session,
): Promise<boolean> {
  if (!env.RESEND_API_KEY || !env.ORDER_FROM_EMAIL || !env.ORDER_NOTIFY_EMAIL) {
    return false;
  }
  const dollars = ((session.amount_total ?? 0) / 100).toFixed(2);
  const link = env.R2_BUCKET
    ? `R2: ${env.R2_BUCKET}/orders/${orderId}/`
    : "(R2 not configured)";
  const text =
    `New paid master order ${orderId}\n` +
    `From: ${session.customer_details?.name ?? ""} <${session.customer_details?.email ?? ""}>\n` +
    `Amount: $${dollars} ${session.currency ?? "usd"}\n` +
    `Stripe session: ${session.id}\n` +
    `Source upload prefix: ${link}\n`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.ORDER_FROM_EMAIL,
      to: env.ORDER_NOTIFY_EMAIL,
      subject: `Paid order ${orderId} ($${dollars})`,
      text,
    }),
  });
  return res.ok;
}
