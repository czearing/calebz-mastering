import { z } from "zod";

// Single source of truth for the booking form. Client (react-hook-form) and the
// server action both validate against this schema. See plan/10-contact-booking.
export const projectTypes = ["Single", "EP", "Album", "Other"] as const;
export type ProjectType = (typeof projectTypes)[number];

export const inquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tell me your name.")
    .max(80, "That name is too long."),
  email: z.string().trim().email("Enter a valid email address."),
  projectType: z.enum(projectTypes, { message: "Pick a project type." }),
  links: z.string().trim().max(500, "That is too long.").optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .max(1500, "Keep it under 1500 characters.")
    .optional()
    .or(z.literal("")),
  // Honeypot. Real users never see or fill this. Bots do.
  company: z.literal("").optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export const inquiryDefaults: InquiryInput = {
  name: "",
  email: "",
  projectType: "Single",
  links: "",
  message: "",
  company: "",
};
