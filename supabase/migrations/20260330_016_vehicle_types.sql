-- =============================================================================
-- Migration: 20260330_016_vehicle_types.sql
-- Description: Vehicle restructuring — EU category + body type columns
--              EU Homologation Categories + RD 2822/1998 Annex II
--              New enum types (eu_category, body_type) use English values.
-- =============================================================================

-- ── 1. Create new enums (English values) ─────────────────────────────────────

CREATE TYPE eu_category AS ENUM (
  'N1', 'N2', 'N3',
  'O1', 'O2', 'O3', 'O4'
);

CREATE TYPE body_type AS ENUM (
  'open_box', 'curtain', 'closed_box', 'refrigerated', 'insulated',
  'heated', 'tanker', 'silo', 'dump', 'car_carrier',
  'container_carrier', 'cage', 'livestock', 'padded', 'coil_carrier',
  'open_platform', 'delivery_truck', 'van', 'crane', 'hopper',
  'special'
);

-- ── 2. Add new columns (nullable temporarily) ───────────────────────────────

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS eu_category eu_category,
  ADD COLUMN IF NOT EXISTS body_type body_type;

-- ── 3. Migrate existing data from vehicle_type ──────────────────────────────
-- Map existing vehicle_type values → body_type + eu_category.
-- vehicle_type column is preserved (represents physical structure).
-- NOTE: vehicle_type enum values are in Spanish (migration 001).

DO $$
BEGIN
  -- tractora → special body, N3
  UPDATE vehicles SET body_type = 'special', eu_category = 'N3'
  WHERE vehicle_type = 'tractora' AND body_type IS NULL;

  -- vehiculo_rigido → closed_box, N3
  UPDATE vehicles SET body_type = 'closed_box', eu_category = 'N3'
  WHERE vehicle_type = 'vehiculo_rigido' AND body_type IS NULL;

  -- semirremolque → curtain, O4
  UPDATE vehicles SET body_type = 'curtain', eu_category = 'O4'
  WHERE vehicle_type = 'semirremolque' AND body_type IS NULL;

  -- remolque → open_box, O3
  UPDATE vehicles SET body_type = 'open_box', eu_category = 'O3'
  WHERE vehicle_type = 'remolque' AND body_type IS NULL;

  -- cisterna → tanker, N3
  UPDATE vehicles SET body_type = 'tanker', eu_category = 'N3'
  WHERE vehicle_type = 'cisterna' AND body_type IS NULL;

  -- frigorifico → refrigerated, N3
  UPDATE vehicles SET body_type = 'refrigerated', eu_category = 'N3'
  WHERE vehicle_type = 'frigorifico' AND body_type IS NULL;

  -- basculante → dump, N3
  UPDATE vehicles SET body_type = 'dump', eu_category = 'N3'
  WHERE vehicle_type = 'basculante' AND body_type IS NULL;

  -- lona → curtain, N3
  UPDATE vehicles SET body_type = 'curtain', eu_category = 'N3'
  WHERE vehicle_type = 'lona' AND body_type IS NULL;

  -- caja_cerrada → closed_box, N3
  UPDATE vehicles SET body_type = 'closed_box', eu_category = 'N3'
  WHERE vehicle_type = 'caja_cerrada' AND body_type IS NULL;

  -- especial → special, N3
  UPDATE vehicles SET body_type = 'special', eu_category = 'N3'
  WHERE vehicle_type = 'especial' AND body_type IS NULL;

  -- Any remaining NULL → special, N3 (fallback)
  UPDATE vehicles SET body_type = 'special', eu_category = 'N3'
  WHERE body_type IS NULL;

  RAISE NOTICE 'Data migration from vehicle_type completed';
END $$;

-- ── 4. Set NOT NULL after migration ──────────────────────────────────────────

DO $$
DECLARE
  null_count int;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM vehicles
  WHERE eu_category IS NULL OR body_type IS NULL;

  IF null_count > 0 THEN
    RAISE EXCEPTION '% vehicles with eu_category or body_type NULL', null_count;
  END IF;
END $$;

ALTER TABLE vehicles
  ALTER COLUMN eu_category SET NOT NULL,
  ALTER COLUMN body_type SET NOT NULL;

-- ── 5. Comments ──────────────────────────────────────────────────────────────

COMMENT ON COLUMN vehicles.eu_category IS
  'EU homologation category by mass (N1-N3, O1-O4). Reg. (UE) 2018/858.';
COMMENT ON COLUMN vehicles.body_type IS
  'Body type / utilization criterion. RD 2822/1998 Annex II.';

-- ── 6. Indexes ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_vehicles_eu_category ON vehicles(eu_category);
CREATE INDEX IF NOT EXISTS idx_vehicles_body_type ON vehicles(body_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_cat_body ON vehicles(eu_category, body_type);
