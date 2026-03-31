-- =============================================================================
-- Migration: 20260330_015_cargo_taxonomia.sql
-- Description: Cargo taxonomy — subcategoria_id + expand vehicle_type enum
--              PRD §4.6, Phases 1-3 of implementation plan
-- =============================================================================

-- ── 1. Expand vehicle_type enum with additional types (English) ──────────────

ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'livestock';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'insulated';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'mega';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'open_platform';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'gondola';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'container_carrier';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'hopper';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'crane';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'mixed';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'van';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'delivery_truck';

-- ── 2. Add subcategoria_id to cargo_records ──────────────────────────────────

ALTER TABLE cargo_records
  ADD COLUMN IF NOT EXISTS subcategoria_id text;

COMMENT ON COLUMN cargo_records.subcategoria_id IS
  'Cargo subcategory ID (kebab-case). References src/constants/cargo-categories.js.';

-- ── 3. Index for subcategory queries ─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_cargo_subcategoria
  ON cargo_records (subcategoria_id)
  WHERE subcategoria_id IS NOT NULL;
