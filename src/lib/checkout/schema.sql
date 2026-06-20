-- D1 schema for the mastering checkout backend. See plan/29 section 5 and
-- plan/17 (D1 data model). Apply with wrangler once the binding exists:
--   npx wrangler d1 execute <DB_NAME> --file src/lib/checkout/schema.sql
-- CalebZ: create the database and bind it as DB in wrangler.toml, e.g.
--   [[d1_databases]]
--   binding = "DB"
--   database_name = "calebz-mastering"
--   database_id = "<from `wrangler d1 create`>"

-- One row per order. Created (or upserted) when its paid webhook lands.
-- Money is integer cents; currency is an ISO code. Lifecycle status moves
-- pending -> paid -> in_progress -> delivered. The delivery_token backs
-- the private /t/[token] share (plan/09); source_key is the R2 object key.
CREATE TABLE IF NOT EXISTS orders (
  id                TEXT PRIMARY KEY,
  email             TEXT NOT NULL,
  name              TEXT NOT NULL DEFAULT '',
  items_json        TEXT NOT NULL DEFAULT '{}',
  amount_cents      INTEGER NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'usd',
  status            TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  source_key        TEXT,
  delivery_token    TEXT,
  created_at        TEXT NOT NULL,
  paid_at           TEXT,
  delivered_at      TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_session ON orders (stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

-- Webhook idempotency. event_id is the Stripe event id; inserting it is the
-- gate that makes a retried checkout.session.completed a no-op (plan/29 s7).
CREATE TABLE IF NOT EXISTS processed_events (
  event_id   TEXT PRIMARY KEY,
  order_id   TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
