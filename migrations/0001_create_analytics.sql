-- Cloudflare D1 Initial Migration: Page Views Analytics Table
CREATE TABLE IF NOT EXISTS analytics_page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS analytics_page_views_created_at_idx
  ON analytics_page_views (created_at DESC);

CREATE INDEX IF NOT EXISTS analytics_page_views_visitor_id_idx
  ON analytics_page_views (visitor_id);
