// Server-only env access for the checkout backend. Reads a single var
// without ever throwing, so the site builds and runs with no keys set.
// On Cloudflare Pages (next-on-pages) secrets and bindings live on the
// per-request context; locally and in `next build` they live on
// process.env. We try the request context first, then fall back.
//
// Nothing here is imported by client code. See plan/29 and plan/17.
// (No "server-only" import so the pure re-price path stays unit-testable;
// this module is only ever imported by route handlers and server.ts.)

// The bindings the checkout backend may use. All optional: a missing
// value just degrades the matching endpoint to { configured: false }.
export interface CheckoutEnv {
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  R2_ACCOUNT_ID?: string;
  R2_BUCKET?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  RESEND_API_KEY?: string;
  ORDER_FROM_EMAIL?: string;
  ORDER_NOTIFY_EMAIL?: string;
  SITE_URL?: string;
  // D1 is a binding (an object), not a string. Present only on Cloudflare.
  DB?: D1LikeDatabase;
}

// The result shape of a D1 write. `meta.changes` is the row count, which
// the idempotency claim reads to tell the winning INSERT (changes === 1)
// from a deduped Stripe retry (changes === 0).
export interface D1RunResult {
  meta?: { changes?: number };
}

// The slice of the D1 binding we use. Kept local so this file needs no
// Cloudflare type packages. See plan/17 data model and schema.sql.
export interface D1LikeDatabase {
  prepare(query: string): {
    bind(...values: unknown[]): {
      run(): Promise<D1RunResult>;
      first<T = unknown>(): Promise<T | null>;
    };
  };
  batch?(statements: unknown[]): Promise<unknown>;
}

// Read the Cloudflare request context env if we are on Pages. The import
// is dynamic and guarded so it is a no-op (not a crash) anywhere else,
// including `next build` and vitest.
async function cloudflareEnv(): Promise<Record<string, unknown> | null> {
  try {
    const mod = await import("@cloudflare/next-on-pages");
    const ctx = mod.getRequestContext?.();
    return (ctx?.env as Record<string, unknown> | undefined) ?? null;
  } catch {
    return null;
  }
}

// Resolve the merged env once per call. process.env is the fallback so
// local dev (.dev.vars / .env) and the build both work with no context.
export async function getEnv(): Promise<CheckoutEnv> {
  const cf = await cloudflareEnv();
  const base = process.env as unknown as Record<string, unknown>;
  return { ...base, ...(cf ?? {}) } as CheckoutEnv;
}
