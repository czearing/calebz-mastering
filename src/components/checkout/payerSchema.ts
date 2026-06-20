import { z } from "zod";

// The two fields collected at the pay step. Name and email are all the
// backend needs to open a Stripe Session and email CalebZ the order. The
// cart itself is re-priced server-side, so nothing else is trusted here.
// See plan/29-services-checkout.md.
export const payerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tell me your name.")
    .max(80, "That name is too long."),
  email: z.string().trim().email("Enter a valid email address."),
});

export type PayerInput = z.infer<typeof payerSchema>;

export const payerDefaults: PayerInput = { name: "", email: "" };
