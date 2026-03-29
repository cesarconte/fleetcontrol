-- ============================================================
-- FleetControl: Fix RLS Policies — scope by created_by
-- Resolves: rls_policy_always_true warnings
-- Strategy: SELECT open for authenticated, INSERT/UPDATE/DELETE
--           scoped to records where created_by = auth.uid()
-- ============================================================

-- ── Drop old permissive policies ───────────────────────────
DROP POLICY IF EXISTS vehicles_insert ON public.vehicles;
DROP POLICY IF EXISTS vehicles_update ON public.vehicles;
DROP POLICY IF EXISTS vehicles_delete ON public.vehicles;

DROP POLICY IF EXISTS drivers_insert ON public.drivers;
DROP POLICY IF EXISTS drivers_update ON public.drivers;
DROP POLICY IF EXISTS drivers_delete ON public.drivers;

DROP POLICY IF EXISTS routes_insert ON public.routes;
DROP POLICY IF EXISTS routes_update ON public.routes;
DROP POLICY IF EXISTS routes_delete ON public.routes;

DROP POLICY IF EXISTS maintenance_insert ON public.maintenance_records;
DROP POLICY IF EXISTS maintenance_update ON public.maintenance_records;
DROP POLICY IF EXISTS maintenance_delete ON public.maintenance_records;

DROP POLICY IF EXISTS fuel_insert ON public.fuel_records;
DROP POLICY IF EXISTS fuel_update ON public.fuel_records;
DROP POLICY IF EXISTS fuel_delete ON public.fuel_records;

DROP POLICY IF EXISTS cargo_insert ON public.cargo_records;
DROP POLICY IF EXISTS cargo_update ON public.cargo_records;
DROP POLICY IF EXISTS cargo_delete ON public.cargo_records;

DROP POLICY IF EXISTS alerts_insert ON public.alerts;
DROP POLICY IF EXISTS alerts_update ON public.alerts;
DROP POLICY IF EXISTS alerts_delete ON public.alerts;

DROP POLICY IF EXISTS vehicle_docs_insert ON public.vehicle_documents;
DROP POLICY IF EXISTS vehicle_docs_update ON public.vehicle_documents;
DROP POLICY IF EXISTS vehicle_docs_delete ON public.vehicle_documents;

DROP POLICY IF EXISTS driver_docs_insert ON public.driver_documents;
DROP POLICY IF EXISTS driver_docs_update ON public.driver_documents;
DROP POLICY IF EXISTS driver_docs_delete ON public.driver_documents;

DROP POLICY IF EXISTS tachograph_insert ON public.tachograph_records;
DROP POLICY IF EXISTS tachograph_update ON public.tachograph_records;
DROP POLICY IF EXISTS tachograph_delete ON public.tachograph_records;

DROP POLICY IF EXISTS company_settings_insert ON public.company_settings;
DROP POLICY IF EXISTS company_settings_update ON public.company_settings;

-- ── Recreate scoped policies ───────────────────────────────

-- Vehicles
CREATE POLICY vehicles_insert ON public.vehicles
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY vehicles_update ON public.vehicles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY vehicles_delete ON public.vehicles
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);

-- Drivers
CREATE POLICY drivers_insert ON public.drivers
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY drivers_update ON public.drivers
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY drivers_delete ON public.drivers
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);

-- Routes
CREATE POLICY routes_insert ON public.routes
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY routes_update ON public.routes
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY routes_delete ON public.routes
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);

-- Maintenance
CREATE POLICY maintenance_insert ON public.maintenance_records
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY maintenance_update ON public.maintenance_records
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY maintenance_delete ON public.maintenance_records
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);

-- Fuel
CREATE POLICY fuel_insert ON public.fuel_records
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY fuel_update ON public.fuel_records
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY fuel_delete ON public.fuel_records
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);

-- Cargo
CREATE POLICY cargo_insert ON public.cargo_records
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY cargo_update ON public.cargo_records
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY cargo_delete ON public.cargo_records
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);

-- Alerts
CREATE POLICY alerts_insert ON public.alerts
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY alerts_update ON public.alerts
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY alerts_delete ON public.alerts
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);

-- Vehicle documents
CREATE POLICY vehicle_docs_insert ON public.vehicle_documents
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY vehicle_docs_update ON public.vehicle_documents
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY vehicle_docs_delete ON public.vehicle_documents
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);

-- Driver documents
CREATE POLICY driver_docs_insert ON public.driver_documents
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY driver_docs_update ON public.driver_documents
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY driver_docs_delete ON public.driver_documents
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);

-- Tachograph records
CREATE POLICY tachograph_insert ON public.tachograph_records
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY tachograph_update ON public.tachograph_records
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY tachograph_delete ON public.tachograph_records
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = created_by);

-- Company settings
CREATE POLICY company_settings_insert ON public.company_settings
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY company_settings_update ON public.company_settings
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);
