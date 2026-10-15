-- Tzhvzhik Cloudflare D1 schema.
-- Apply once to the D1 database bound as DB before accepting orders.
CREATE TABLE IF NOT EXISTS store_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  revision INTEGER NOT NULL DEFAULT 0,
  data TEXT NOT NULL
);
