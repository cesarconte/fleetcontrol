-- =============================================================================
-- Migration: 20260329_006_fuel.sql
-- Description: fuel_records table — PRD §4.7
-- =============================================================================

CREATE TABLE fuel_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referencia
  vehicle_id uuid NOT NULL REFERENCES vehicles(id),
  route_id uuid REFERENCES routes(id),

  -- Registro de repostaje (PRD §4.7)
  fecha timestamptz NOT NULL DEFAULT now(),
  km_al_momento numeric(12, 2) NOT NULL,
  litros_kg numeric(8, 2) NOT NULL,
  precio_por_litro_eur numeric(6, 3) NOT NULL,
  importe_total_eur numeric(12, 2) NOT NULL,
  estacion_servicio text,

  -- Cálculos automáticos
  consumo_real_l100km numeric(5, 2),
  emisiones_co2_kg numeric(8, 2),
  desviacion_sobre_media_pct numeric(6, 2),

  -- Auditoría
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_fuel_updated_at
  BEFORE UPDATE ON fuel_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE fuel_records is 'Registro de repostajes y consumo de combustible — PRD §4.7';
