-- =============================================================================
-- Migration: 20260329_011_indexes.sql
-- Description: Performance indexes + dashboard KPI function + doc expiry check
-- =============================================================================

-- ═══════════════════════════════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── vehicles ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_matricula ON vehicles(matricula);
CREATE INDEX idx_vehicles_tipo ON vehicles(tipo_vehiculo);
CREATE INDEX idx_vehicles_conductor ON vehicles(conductor_asignado_id);

-- ── drivers ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_nif ON drivers(nif_nie);

-- ── routes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_routes_vehicle ON routes(vehicle_id);
CREATE INDEX idx_routes_driver ON routes(driver_id);
CREATE INDEX idx_routes_fecha_salida ON routes(fecha_salida);
CREATE INDEX idx_routes_status_fecha ON routes(status, fecha_salida);

-- ── maintenance_records ──────────────────────────────────────────────────────
CREATE INDEX idx_maintenance_vehicle ON maintenance_records(vehicle_id);
CREATE INDEX idx_maintenance_status ON maintenance_records(status);
CREATE INDEX idx_maintenance_tipo ON maintenance_records(tipo);
CREATE INDEX idx_maintenance_fecha_programada ON maintenance_records(fecha_programada);

-- ── fuel_records ─────────────────────────────────────────────────────────────
CREATE INDEX idx_fuel_vehicle ON fuel_records(vehicle_id);
CREATE INDEX idx_fuel_fecha ON fuel_records(fecha);
CREATE INDEX idx_fuel_route ON fuel_records(route_id);

-- ── cargo_records ────────────────────────────────────────────────────────────
CREATE INDEX idx_cargo_route ON cargo_records(route_id);
CREATE INDEX idx_cargo_vehicle ON cargo_records(vehicle_id);
CREATE INDEX idx_cargo_tipo ON cargo_records(tipo);

-- ── alerts ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_alerts_tipo ON alerts(tipo);
CREATE INDEX idx_alerts_severidad ON alerts(severidad);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_vehicle ON alerts(vehicle_id);
CREATE INDEX idx_alerts_driver ON alerts(driver_id);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

-- ── vehicle_documents ────────────────────────────────────────────────────────
CREATE INDEX idx_vehicle_documents_vehicle ON vehicle_documents(vehicle_id);
CREATE INDEX idx_vehicle_documents_tipo ON vehicle_documents(tipo_documento);
CREATE INDEX idx_vehicle_documents_status ON vehicle_documents(status);
CREATE INDEX idx_vehicle_documents_vencimiento ON vehicle_documents(fecha_vencimiento);

-- ── driver_documents ─────────────────────────────────────────────────────────
CREATE INDEX idx_driver_documents_driver ON driver_documents(driver_id);
CREATE INDEX idx_driver_documents_tipo ON driver_documents(tipo_documento);
CREATE INDEX idx_driver_documents_status ON driver_documents(status);
CREATE INDEX idx_driver_documents_vencimiento ON driver_documents(fecha_vencimiento);

-- ── tachograph_records ───────────────────────────────────────────────────────
CREATE INDEX idx_tachograph_driver ON tachograph_records(driver_id);
CREATE INDEX idx_tachograph_vehicle ON tachograph_records(vehicle_id);
CREATE INDEX idx_tachograph_infracciones ON tachograph_records(tiene_infracciones);

-- ═══════════════════════════════════════════════════════════════════════════════
-- Function: get_dashboard_kpis()
-- Returns key KPIs for the main dashboard (PRD §4.1).
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_dashboard_kpis()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  total_vehicles integer;
  vehicles_on_route integer;
  active_drivers integer;
  total_drivers integer;
  vehicles_in_maintenance integer;
  routes_completed_today integer;
  active_alerts integer;
  tachograph_violations integer;
BEGIN
  -- Total vehicles (excluding dado_de_baja)
  SELECT count(*) INTO total_vehicles
  FROM vehicles WHERE status != 'dado_de_baja';

  -- Vehicles currently on route
  SELECT count(*) INTO vehicles_on_route
  FROM vehicles WHERE status = 'en_ruta';

  -- Active drivers
  SELECT count(*) INTO active_drivers
  FROM drivers WHERE status = 'activo';

  -- Total drivers
  SELECT count(*) INTO total_drivers
  FROM drivers;

  -- Vehicles in maintenance
  SELECT count(*) INTO vehicles_in_maintenance
  FROM vehicles WHERE status = 'en_mantenimiento';

  -- Routes completed today
  SELECT count(*) INTO routes_completed_today
  FROM routes
  WHERE status = 'completada'
    AND fecha_llegada_real::date = current_date;

  -- Active (unread) alerts
  SELECT count(*) INTO active_alerts
  FROM alerts
  WHERE is_read = false AND is_dismissed = false;

  -- Tachograph violations pending
  SELECT count(*) INTO tachograph_violations
  FROM tachograph_records
  WHERE tiene_infracciones = true;

  RETURN jsonb_build_object(
    'total_vehicles', total_vehicles,
    'vehicles_on_route', vehicles_on_route,
    'active_drivers', active_drivers,
    'total_drivers', total_drivers,
    'vehicles_in_maintenance', vehicles_in_maintenance,
    'routes_completed_today', routes_completed_today,
    'active_alerts', active_alerts,
    'tachograph_violations', tachograph_violations,
    'generated_at', now()
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Function: check_document_expiry()
-- Updates document_status on vehicle_documents and driver_documents based on
-- current date vs. fecha_vencimiento. Returns count of affected rows.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION check_document_expiry()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  affected integer := 0;
BEGIN
  -- vehicle_documents
  UPDATE vehicle_documents
  SET status = CASE
    WHEN fecha_vencimiento IS NULL THEN 'en_regla'::document_status
    WHEN fecha_vencimiento < current_date THEN 'vencido'::document_status
    WHEN fecha_vencimiento <= current_date + interval '7 days' THEN 'critico'::document_status
    WHEN fecha_vencimiento <= current_date + (alerta_dias_anticipacion || ' days')::interval THEN 'proximo_a_vencer'::document_status
    ELSE 'en_regla'::document_status
  END,
  updated_at = now()
  WHERE status != 'no_aplica';

  GET DIAGNOSTICS affected = ROW_COUNT;

  -- driver_documents
  UPDATE driver_documents
  SET status = CASE
    WHEN fecha_vencimiento IS NULL THEN 'en_regla'::document_status
    WHEN fecha_vencimiento < current_date THEN 'vencido'::document_status
    WHEN fecha_vencimiento <= current_date + interval '7 days' THEN 'critico'::document_status
    WHEN fecha_vencimiento <= current_date + (alerta_dias_anticipacion || ' days')::interval THEN 'proximo_a_vencer'::document_status
    ELSE 'en_regla'::document_status
  END,
  updated_at = now()
  WHERE status != 'no_aplica';

  GET DIAGNOSTICS affected = affected + ROW_COUNT;

  RETURN affected;
END;
$$;
