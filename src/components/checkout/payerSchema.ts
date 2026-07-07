import { z } from "zod";

// Collected on the details step. Name and email are required to open a Stripe
// Session and email CalebZ the order; notes is an optional free-text brief
// (reference tracks, deadlines, how loud they want it). The cart is re-priced
// server-side, so nothing else is trusted here. See plan/29-services-checkout.md.
export const payerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tell me your name.")
    .max(80, "That name is too long."),
  email: z.string().trim().email("Enter a valid email address."),
  notes: z.string().trim().max(1000, "Keep it under 1000 characters.").optional(),
});

export type PayerInput = z.infer<typeof payerSchema>;

export const payerDefaults: PayerInput = { name: "", email: "", notes: "" };
