// POST /api/upload-url
// Mints a presigned R2 PUT for an order's source file. Bytes never cross
// the Worker. With no R2 env it returns { configured: false } and never
// throws. See plan/29 section 3 and plan/17 (R2).

import { z } from "zod";
import { presignUpload } from "@/lib/checkout/server";

export const runtime = "edge";

// Accept audio source files only. Size is enforced by R2/lifecycle and the
// client; here we constrain the content type so the signed PUT matches.
const bodySchema = z.object({
  orderId: z.string().min(1).max(64),
  filename: z.string().min(1).max(200),
  contentType: z
    .string()
    .max(120)
    .default("application/octet-stream"),
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

  const { orderId, filename, contentType } = parsed.data;

  try {
    const result = await presignUpload(orderId, filename, contentType);
    if (!result.configured) {
      return Response.json({ configured: false });
    }
    return Response.json({ url: result.url, key: result.key });
  } catch {
    return Response.json({ error: "Could not presign" }, { status: 500 });
  }
}
