-- =============================================================================
-- Migration: 20260401_019_route_financials.sql
-- Description: Add financial/revenue columns to routes table — PRD §4.9
-- =============================================================================

-- Revenue
ALTER TABLE routes ADD COLUMN IF NOT EXISTS
  revenue_eur numeric(12, 2);

COMMENT ON COLUMN routes.revenue_eur IS
  'Precio cobrado al cliente por este transporte (EUR).';

-- Variable costs (additional to fuel_cost_eur and toll_cost_eur)
ALTER TABLE routes ADD COLUMN IF NOT EXISTS
  driver_cost_eur numeric(12, 2) DEFAULT 0;

COMMENT ON COLUMN routes.driver_cost_eur IS
  'Coste conductor asignado a esta ruta: salario prorrateado + dietas + alojamiento.';

ALTER TABLE routes ADD COLUMN IF NOT EXISTS
  other_variable_cost_eur numeric(12, 2) DEFAULT 0;

COMMENT ON COLUMN routes.other_variable_cost_eur IS
  'Otros costes variables: aparcamiento, lavado, gestiones, etc.';

-- Allocated fixed costs (computed by allocation function)
ALTER TABLE routes ADD COLUMN IF NOT EXISTS
  allocated_fixed_cost_eur numeric(12, 2) DEFAULT 0;

COMMENT ON COLUMN routes.allocated_fixed_cost_eur IS
  'Coste fijo asignado a esta ruta (proporcional a km mediante función de allocation).';

-- Client billing info
ALTER TABLE routes ADD COLUMN IF NOT EXISTS
  client_name text;

ALTER TABLE routes ADD COLUMN IF NOT EXISTS
  client_tax_id text;

ALTER TABLE routes ADD COLUMN IF NOT EXISTS
  invoice_number text;

ALTER TABLE routes ADD COLUMN IF NOT EXISTS
  invoice_date date;

-- Computed: variable total (fuel + tolls + driver + other)
ALTER TABLE routes ADD COLUMN IF NOT EXISTS
  total_variable_cost_eur numeric(12, 2) GENERATED ALWAYS AS (
    COALESCE(fuel_cost_eur, 0) +
    COALESCE(toll_cost_eur, 0) +
    COALESCE(driver_cost_eur, 0) +
    COALESCE(other_variable_cost_eur, 0)
  ) STORED;

-- Computed: gross margin (revenue - variable costs)
ALTER TABLE routes ADD COLUMN IF NOT EXISTS
  gross_margin_eur numeric(12, 2) GENERATED ALWAYS AS (
    COALESCE(revenue_eur, 0) -
    COALESCE(fuel_cost_eur, 0) -
    COALESCE(toll_cost_eur, 0) -
    COALESCE(driver_cost_eur, 0) -
    COALESCE(other_variable_cost_eur, 0)
  ) STORED;

-- Computed: net margin (revenue - variable - fixed)
ALTER TABLE routes ADD COLUMN IF NOT EXISTS
  net_margin_eur numeric(12, 2) GENERATED ALWAYS AS (
    COALESCE(revenue_eur, 0) -
    COALESCE(fuel_cost_eur, 0) -
    COALESCE(toll_cost_eur, 0) -
    COALESCE(driver_cost_eur, 0) -
    COALESCE(other_variable_cost_eur, 0) -
    COALESCE(allocated_fixed_cost_eur, 0)
  ) STORED;

-- Incidents count (for routes report)
ALTER TABLE routes ADD COLUMN IF NOT EXISTS
  incidents_count integer DEFAULT 0;

COMMENT ON COLUMN routes.incidents_count IS
  'Número de incidencias registradas en esta ruta (retrasos, averías, etc.).';
