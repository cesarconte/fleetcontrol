-- =============================================================================
-- Migration: 20260329_010_rls.sql
-- Description: Row Level Security — ENABLE + scoped policies for all tables
-- =============================================================================
-- Strategy:
--   SELECT: open for authenticated (all company users see all data)
--   INSERT: WITH CHECK ((select auth.uid()) = created_by)
--   UPDATE: USING ((select auth.uid()) = created_by)
--   DELETE: USING ((select auth.uid()) = created_by)
--   profiles: special — scoped by id (profile id = auth user id)
-- =============================================================================

-- ── profiles ───────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY profiles_insert ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY profiles_update ON public.profiles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id);

-- ── company_settings ───────────────────────────────────────
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_settings_select ON public.company_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY company_settings_insert ON public.company_settings
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY company_settings_update ON public.company_settings
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

-- ── vehicles ───────────────────────────────────────────────
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY vehicles_select ON public.vehicles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY vehicles_insert ON public.vehicles
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY vehicles_update ON public.vehicles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY vehicles_delete ON public.vehicles
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);

-- ── drivers ────────────────────────────────────────────────
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY drivers_select ON public.drivers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY drivers_insert ON public.drivers
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY drivers_update ON public.drivers
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY drivers_delete ON public.drivers
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);

-- ── routes ─────────────────────────────────────────────────
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY routes_select ON public.routes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY routes_insert ON public.routes
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY routes_update ON public.routes
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY routes_delete ON public.routes
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);

-- ── maintenance_records ────────────────────────────────────
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY maintenance_select ON public.maintenance_records
  FOR SELECT TO authenticated USING (true);

CREATE POLICY maintenance_insert ON public.maintenance_records
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY maintenance_update ON public.maintenance_records
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY maintenance_delete ON public.maintenance_records
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);

-- ── fuel_records ───────────────────────────────────────────
ALTER TABLE fuel_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY fuel_select ON public.fuel_records
  FOR SELECT TO authenticated USING (true);

CREATE POLICY fuel_insert ON public.fuel_records
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY fuel_update ON public.fuel_records
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY fuel_delete ON public.fuel_records
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);

-- ── cargo_records ──────────────────────────────────────────
ALTER TABLE cargo_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY cargo_select ON public.cargo_records
  FOR SELECT TO authenticated USING (true);

CREATE POLICY cargo_insert ON public.cargo_records
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY cargo_update ON public.cargo_records
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY cargo_delete ON public.cargo_records
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);

-- ── alerts ─────────────────────────────────────────────────
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY alerts_select ON public.alerts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY alerts_insert ON public.alerts
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY alerts_update ON public.alerts
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY alerts_delete ON public.alerts
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);

-- ── vehicle_documents ──────────────────────────────────────
ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY vehicle_docs_select ON public.vehicle_documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY vehicle_docs_insert ON public.vehicle_documents
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY vehicle_docs_update ON public.vehicle_documents
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY vehicle_docs_delete ON public.vehicle_documents
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);

-- ── driver_documents ───────────────────────────────────────
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY driver_docs_select ON public.driver_documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY driver_docs_insert ON public.driver_documents
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY driver_docs_update ON public.driver_documents
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY driver_docs_delete ON public.driver_documents
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);

-- ── tachograph_records ─────────────────────────────────────
ALTER TABLE tachograph_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY tachograph_select ON public.tachograph_records
  FOR SELECT TO authenticated USING (true);

CREATE POLICY tachograph_insert ON public.tachograph_records
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY tachograph_update ON public.tachograph_records
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY tachograph_delete ON public.tachograph_records
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);
