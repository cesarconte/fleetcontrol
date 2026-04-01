-- =============================================================================
-- Migration: 20260401_023_financial_indexes.sql
-- Description: Performance indexes for financial queries — PRD §4.9
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_routes_financial
  ON routes(status, departure_date)
  WHERE status = 'completed';

CREATE INDEX IF NOT EXISTS idx_routes_vehicle_date
  ON routes(vehicle_id, departure_date);

CREATE INDEX IF NOT EXISTS idx_routes_driver_date
  ON routes(driver_id, departure_date);

CREATE INDEX IF NOT EXISTS idx_routes_revenue
  ON routes(revenue_eur)
  WHERE revenue_eur IS NOT NULL;
