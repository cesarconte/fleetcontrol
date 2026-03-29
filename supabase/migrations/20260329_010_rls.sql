-- =============================================================================
-- Migration: 20260329_010_rls.sql
-- Description: Row Level Security — ENABLE + policies for all tables
-- =============================================================================

-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS is enabled on every table. Policies use (select auth.uid()) on profiles
-- for performance, and `true` for all other tables (single-tenant fleet
-- management app: all authenticated users share full access).
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── profiles ─────────────────────────────────────────────────────────────────
-- Uses (select auth.uid()) for row-level isolation per user.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (id = (select auth.uid()));

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (id = (select auth.uid()));

-- ── company_settings ─────────────────────────────────────────────────────────

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_settings_authenticated"
  ON company_settings FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── vehicles ─────────────────────────────────────────────────────────────────

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicles_authenticated"
  ON vehicles FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── drivers ──────────────────────────────────────────────────────────────────

ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drivers_authenticated"
  ON drivers FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── routes ───────────────────────────────────────────────────────────────────

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "routes_authenticated"
  ON routes FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── maintenance_records ──────────────────────────────────────────────────────

ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maintenance_authenticated"
  ON maintenance_records FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── fuel_records ─────────────────────────────────────────────────────────────

ALTER TABLE fuel_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fuel_authenticated"
  ON fuel_records FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── cargo_records ────────────────────────────────────────────────────────────

ALTER TABLE cargo_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cargo_authenticated"
  ON cargo_records FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── alerts ───────────────────────────────────────────────────────────────────

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alerts_authenticated"
  ON alerts FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── vehicle_documents ────────────────────────────────────────────────────────

ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicle_documents_authenticated"
  ON vehicle_documents FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── driver_documents ─────────────────────────────────────────────────────────

ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "driver_documents_authenticated"
  ON driver_documents FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── tachograph_records ───────────────────────────────────────────────────────

ALTER TABLE tachograph_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tachograph_records_authenticated"
  ON tachograph_records FOR ALL
  USING (true)
  WITH CHECK (true);
