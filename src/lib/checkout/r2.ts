// Presigned R2 PUT via S3 SigV4, using aws4fetch (Workers-friendly, no
// Node crypto). Bytes never cross the Worker: the browser PUTs straight
// to R2 with the returned URL. Gated entirely on R2 env in server.ts.
//
// See plan/29 section 3 (upload) and plan/17 (R2 is the audio store).

import { AwsClient } from "aws4fetch";
import type { CheckoutEnv } from "./env";

// How long a minted PUT URL stays valid. Long enough for a large upload
// to start; the key is deterministic so a dropped upload can re-presign.
const PRESIGN_TTL_SECONDS = 60 * 60; // 1 hour

// True when every R2 var needed to sign is present.
export function hasR2(env: CheckoutEnv): boolean {
  return Boolean(
    env.R2_ACCOUNT_ID &&
      env.R2_BUCKET &&
      env.R2_ACCESS_KEY_ID &&
      env.R2_SECRET_ACCESS_KEY,
  );
}

// The object key for an order's source upload. Derived from the order id
// so it is stable across retries and never collides between orders.
export function sourceKey(orderId: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return `orders/${orderId}/source-${safe}`;
}

// Mint a presigned PUT URL for the given key. Caller has already checked
// hasR2(env). The R2 S3 endpoint is account-scoped; the bucket is in the
// path. Content-Type is signed so the upload must match what we promised.
export async function presignPut(
  env: CheckoutEnv,
  key: string,
  contentType: string,
): Promise<string> {
  const client = new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY as string,
    service: "s3",
    region: "auto",
  });

  const endpoint = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const url = `${endpoint}/${env.R2_BUCKET}/${key}?X-Amz-Expires=${PRESIGN_TTL_SECONDS}`;

  const signed = await client.sign(url, {
    method: "PUT",
    headers: { "content-type": contentType },
    aws: { signQuery: true },
  });

  return signed.url;
}
