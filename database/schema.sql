-- SymbioTech PostgreSQL Schema
-- Run with: psql -U postgres -d kasainuma -f schema.sql
CREATE TABLE IF NOT EXISTS industries (
  id                   SERIAL PRIMARY KEY,
  company_name         TEXT    NOT NULL,
  industry_type        TEXT,
  location             TEXT,
  contact_email        TEXT    NOT NULL UNIQUE,
  contact_phone        TEXT,
  password_hash        TEXT    NOT NULL,
  transport_radius_km  INTEGER DEFAULT 100,
  website              TEXT,
  sustainability_score INTEGER DEFAULT 50,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS waste_listings (
  id             SERIAL PRIMARY KEY,
  industry_id    INTEGER NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
  material_type  TEXT    NOT NULL,
  description    TEXT,
  quantity       NUMERIC NOT NULL,
  unit           TEXT    NOT NULL,
  location       TEXT,
  available_from DATE,
  status         TEXT    DEFAULT 'available',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resource_requests (
  id              SERIAL PRIMARY KEY,
  industry_id     INTEGER NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
  material_needed TEXT    NOT NULL,
  description     TEXT,
  quantity        NUMERIC NOT NULL,
  unit            TEXT    NOT NULL,
  industry_sector TEXT,
  location        TEXT,
  required_by     DATE,
  status          TEXT    DEFAULT 'active',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
  id                  SERIAL PRIMARY KEY,
  waste_listing_id    INTEGER NOT NULL REFERENCES waste_listings(id)    ON DELETE CASCADE,
  resource_request_id INTEGER NOT NULL REFERENCES resource_requests(id) ON DELETE CASCADE,
  match_score         NUMERIC,
  status              TEXT    DEFAULT 'pending',
  co2_reduction_tons  NUMERIC DEFAULT 0,
  cost_savings        NUMERIC DEFAULT 0,
  logistics_cost      NUMERIC DEFAULT 0,
  logistics_details   TEXT,
  accepted_at         TIMESTAMP,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS impact_metrics (
  id                      SERIAL PRIMARY KEY,
  industry_id             INTEGER NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
  co2_reduced_tons        NUMERIC DEFAULT 0,
  waste_diverted_tons     NUMERIC DEFAULT 0,
  water_saved_liters      NUMERIC DEFAULT 0,
  energy_saved_mwh        NUMERIC DEFAULT 0,
  raw_material_saved_tons NUMERIC DEFAULT 0,
  recorded_date           DATE    DEFAULT CURRENT_DATE,
  UNIQUE (industry_id, recorded_date)
);

-- ─── Trade-Matching Columns (additive, safe for existing data) ───────────────
-- Price per unit for economic scoring in AI trade recommendations
ALTER TABLE waste_listings    ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC DEFAULT 0;
ALTER TABLE waste_listings    ADD COLUMN IF NOT EXISTS category       TEXT;
ALTER TABLE resource_requests ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC DEFAULT 0;
ALTER TABLE resource_requests ADD COLUMN IF NOT EXISTS category       TEXT;

-- Trade requests (inter-company trade flow: pending → accepted/rejected)
CREATE TABLE IF NOT EXISTS trade_requests (
  id                SERIAL PRIMARY KEY,
  waste_listing_id  INTEGER NOT NULL REFERENCES waste_listings(id) ON DELETE CASCADE,
  sender_id         INTEGER NOT NULL REFERENCES industries(id)     ON DELETE CASCADE,
  receiver_id       INTEGER NOT NULL REFERENCES industries(id)     ON DELETE CASCADE,
  quantity_requested NUMERIC NOT NULL,
  message            TEXT,
  status             TEXT    DEFAULT 'pending',
  ai_match_score     NUMERIC,
  responded_at       TIMESTAMP,
  price_per_unit     NUMERIC DEFAULT 0,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Safe additive migration (run on existing DBs)
ALTER TABLE trade_requests ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC DEFAULT 0;

-- Transactions (recorded after a trade request is accepted)
CREATE TABLE IF NOT EXISTS transactions (
  id                  SERIAL PRIMARY KEY,
  trade_request_id    INTEGER NOT NULL REFERENCES trade_requests(id) ON DELETE CASCADE,
  waste_listing_id    INTEGER NOT NULL REFERENCES waste_listings(id) ON DELETE CASCADE,
  seller_id           INTEGER NOT NULL REFERENCES industries(id)     ON DELETE CASCADE,
  buyer_id            INTEGER NOT NULL REFERENCES industries(id)     ON DELETE CASCADE,
  quantity            NUMERIC NOT NULL,
  total_value         NUMERIC DEFAULT 0,
  co2_reduction_tons  NUMERIC DEFAULT 0,
  water_saved_liters  NUMERIC DEFAULT 0,
  energy_saved_mwh    NUMERIC DEFAULT 0,
  waste_diverted_tons NUMERIC DEFAULT 0,
  completed_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications (in-app notification store)
CREATE TABLE IF NOT EXISTS notifications (
  id           SERIAL PRIMARY KEY,
  industry_id  INTEGER NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
  type         TEXT    NOT NULL,
  title        TEXT    NOT NULL,
  message      TEXT,
  reference_id INTEGER,
  is_read      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_waste_industry ON waste_listings(industry_id);
CREATE INDEX IF NOT EXISTS idx_waste_status ON waste_listings(status);
CREATE INDEX IF NOT EXISTS idx_waste_material ON waste_listings(material_type);
CREATE INDEX IF NOT EXISTS idx_waste_category ON waste_listings(category);
CREATE INDEX IF NOT EXISTS idx_resource_industry ON resource_requests(industry_id);
CREATE INDEX IF NOT EXISTS idx_resource_status ON resource_requests(status);
CREATE INDEX IF NOT EXISTS idx_resource_category ON resource_requests(category);
CREATE INDEX IF NOT EXISTS idx_matches_waste ON matches(waste_listing_id);
CREATE INDEX IF NOT EXISTS idx_matches_resource ON matches(resource_request_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_impact_industry ON impact_metrics(industry_id);
CREATE INDEX IF NOT EXISTS idx_trade_req_sender ON trade_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_trade_req_receiver ON trade_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_trade_req_status ON trade_requests(status);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_industry ON notifications(industry_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
