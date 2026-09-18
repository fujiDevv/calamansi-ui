-- Cloudflare D1 Migration: Mascot poke counter
-- One row per poke of the Calamansi mascot. The header count is COUNT(*).
CREATE TABLE IF NOT EXISTS mascot_pokes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS mascot_pokes_created_at_idx
  ON mascot_pokes (created_at DESC);

CREATE INDEX IF NOT EXISTS mascot_pokes_visitor_id_idx
  ON mascot_pokes (visitor_id);
