-- =============================================================================
-- Migration: 20260329_005_maintenance.sql
-- Description: maintenance_records table — PRD §4.5
-- =============================================================================

CREATE TABLE maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referencia
  vehicle_id uuid NOT NULL REFERENCES vehicles(id),

  -- Tipo y estado (PRD §4.5)
  tipo maintenance_type NOT NULL,
  status maintenance_status NOT NULL DEFAULT 'pendiente',

  -- Descripción
  descripcion text NOT NULL,
  diagnostico text,
  intervencion_realizada text,

  -- Fechas y km
  fecha_programada date,
  fecha_inicio date,
  fecha_fin date,
  km_al_momento numeric(12, 2),

  -- Taller
  taller_nombre text,
  taller_responsable text,

  -- Costes (PRD §4.5.1, §4.5.2)
  coste_mano_obra_eur numeric(12, 2) DEFAULT 0,
  coste_recambios_eur numeric(12, 2) DEFAULT 0,
  coste_total_eur numeric(12, 2) DEFAULT 0,

  -- Recambios utilizados (PRD §4.5.2)
  recambios jsonb DEFAULT '[]'::jsonb,

  -- Tiempo de inmovilización (PRD §4.5.2)
  inmovilizacion_horas numeric(8, 2),

  -- Auditoría
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_maintenance_updated_at
  BEFORE UPDATE ON maintenance_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE maintenance_records is 'Registros de mantenimiento preventivo y correctivo — PRD §4.5';
