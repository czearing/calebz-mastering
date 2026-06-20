// POST /api/checkout
// Validates the request, re-prices nothing it does not own, and either
// quote-gates the cart (Atmos) or creates an embedded Stripe Checkout
// Session. With no Stripe key it returns { configured: false } and never
// throws, so the site runs unconfigured. See plan/29 sections 4 and 6.

import { z } from "zod";
import { quoteOnly } from "@/lib/checkout";
import { createCheckoutSession } from "@/lib/checkout/server";

// Run on the edge runtime so it deploys to Cloudflare Pages Functions.
export const runtime = "edge";

// Validate only the shape we depend on. The amount is never accepted from
// the client; any total field would be ignored. The cart is re-priced
// server-side from the catalog.
const addonsSchema = z.record(z.string(), z.number()).optional().default({});
const cartSchema = z.object({
  tracks: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        addons: addonsSchema,
      }),
    )
    .max(50),
});
const bodySchema = z.object({
  cart: cartSchema,
  contact: z.object({
    email: z.string().email(),
    name: z.string().min(1).max(200),
  }),
});

export async function POST(req: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { cart, contact } = parsed.data;

  // Atmos and other quote-only add-ons are configurable but not directly
  // payable. Short-circuit before touching Stripe.
  if (quoteOnly(cart)) {
    return Response.json({ quoteOnly: true });
  }

  if (cart.tracks.length === 0) {
    return Response.json({ error: "Cart is empty" }, { status: 400 });
  }

  try {
    const result = await createCheckoutSession(cart, contact);
    if (!result.configured) {
      return Response.json({ configured: false });
    }
    return Response.json({
      clientSecret: result.clientSecret,
      orderId: result.orderId,
    });
  } catch {
    return Response.json({ error: "Checkout failed" }, { status: 500 });
  }
}
