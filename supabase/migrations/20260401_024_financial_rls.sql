-- =============================================================================
-- Migration: 20260401_024_financial_rls.sql
-- Description: Fix RLS policies — use created_by = auth.uid() instead of true
-- =============================================================================

-- driver_compensation: restrictive policies
DROP POLICY IF EXISTS driver_compensation_delete ON driver_compensation;
CREATE POLICY driver_compensation_delete ON driver_compensation
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS driver_compensation_update ON driver_compensation;
CREATE POLICY driver_compensation_update ON driver_compensation
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS driver_compensation_insert ON driver_compensation;
CREATE POLICY driver_compensation_insert ON driver_compensation
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

-- vehicle_annual_costs: restrictive policies
DROP POLICY IF EXISTS vehicle_annual_costs_delete ON vehicle_annual_costs;
CREATE POLICY vehicle_annual_costs_delete ON vehicle_annual_costs
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS vehicle_annual_costs_update ON vehicle_annual_costs;
CREATE POLICY vehicle_annual_costs_update ON vehicle_annual_costs
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS vehicle_annual_costs_insert ON vehicle_annual_costs;
CREATE POLICY vehicle_annual_costs_insert ON vehicle_annual_costs
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
