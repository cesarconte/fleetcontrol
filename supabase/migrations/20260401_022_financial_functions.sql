-- =============================================================================
-- Migration: 20260401_022_financial_functions.sql
-- Description: Allocation function + financial views — PRD §4.9
-- =============================================================================

-- Function: allocate annual fixed costs to a route (by km)
CREATE OR REPLACE FUNCTION calculate_route_fixed_cost(p_route_id uuid)
RETURNS numeric(12, 2)
LANGUAGE plpgsql STABLE
SET search_path = public
AS $$
DECLARE
  v_vehicle_id uuid;
  v_year integer;
  v_route_km numeric;
  v_annual_km numeric;
  v_fixed_total numeric;
BEGIN
  SELECT r.vehicle_id,
         EXTRACT(YEAR FROM r.departure_date)::integer,
         COALESCE(r.distance_covered_km, r.distance_total_km, 0)
    INTO v_vehicle_id, v_year, v_route_km
    FROM routes r WHERE r.id = p_route_id;

  IF v_vehicle_id IS NULL THEN RETURN 0; END IF;

  SELECT COALESCE(vac.total_fixed_cost_eur, 0),
         COALESCE(vac.planned_annual_km, 120000)
    INTO v_fixed_total, v_annual_km
    FROM vehicle_annual_costs vac
   WHERE vac.vehicle_id = v_vehicle_id AND vac.fiscal_year = v_year;

  IF v_fixed_total IS NULL OR v_fixed_total = 0 THEN RETURN 0; END IF;

  RETURN ROUND((v_route_km / NULLIF(v_annual_km, 0)) * v_fixed_total, 2);
END;
$$;

COMMENT ON FUNCTION calculate_route_fixed_cost IS
  'Asigna coste fijo anual del vehículo a una ruta proporcionalmente por km.';

-- View: complete financial summary per route
CREATE OR REPLACE VIEW v_route_financials AS
SELECT
  r.id AS route_id,
  r.vehicle_id,
  r.driver_id,
  v.plate,
  d.full_name AS driver_name,
  r.origin_city,
  r.destination_city,
  r.departure_date,
  r.distance_covered_km,
  r.distance_total_km,
  r.status,

  -- Revenue
  COALESCE(r.revenue_eur, 0) AS revenue_eur,

  -- Variable costs
  COALESCE(r.fuel_cost_eur, 0) AS fuel_cost,
  COALESCE(r.toll_cost_eur, 0) AS toll_cost,
  COALESCE(r.driver_cost_eur, 0) AS driver_cost,
  COALESCE(r.other_variable_cost_eur, 0) AS other_variable_cost,
  COALESCE(r.total_variable_cost_eur, 0) AS total_variable_cost,

  -- Fixed
  COALESCE(r.allocated_fixed_cost_eur, 0) AS allocated_fixed_cost,

  -- Margins
  COALESCE(r.gross_margin_eur, 0) AS gross_margin,
  COALESCE(r.net_margin_eur, 0) AS net_margin,

  -- Margin %
  CASE WHEN COALESCE(r.revenue_eur, 0) > 0
    THEN ROUND(r.gross_margin_eur / r.revenue_eur * 100, 2)
    ELSE NULL
  END AS gross_margin_pct,

  CASE WHEN COALESCE(r.revenue_eur, 0) > 0
    THEN ROUND(r.net_margin_eur / r.revenue_eur * 100, 2)
    ELSE NULL
  END AS net_margin_pct,

  -- Per-km
  CASE WHEN COALESCE(r.distance_covered_km, 0) > 0
    THEN ROUND(r.revenue_eur / r.distance_covered_km, 3)
    ELSE NULL
  END AS revenue_per_km,

  CASE WHEN COALESCE(r.distance_covered_km, 0) > 0
    THEN ROUND(r.total_variable_cost_eur / r.distance_covered_km, 3)
    ELSE NULL
  END AS variable_cost_per_km,

  CASE WHEN COALESCE(r.distance_covered_km, 0) > 0
    THEN ROUND(r.fuel_cost_eur / r.distance_covered_km, 3)
    ELSE NULL
  END AS fuel_cost_per_km,

  -- Fuel efficiency
  CASE WHEN COALESCE(r.distance_covered_km, 0) > 0
    THEN ROUND(r.fuel_consumption_l / r.distance_covered_km * 100, 2)
    ELSE NULL
  END AS consumption_l_100km,

  -- Incidents
  COALESCE(r.incidents_count, 0) AS incidents_count

FROM routes r
LEFT JOIN vehicles v ON r.vehicle_id = v.id
LEFT JOIN drivers d ON r.driver_id = d.id
WHERE r.status = 'completed';

COMMENT ON VIEW v_route_financials IS 'Vista de resumen financiero por ruta completada.';
