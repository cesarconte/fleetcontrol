-- =============================================================================
-- Migration: 20260329_008_alerts.sql
-- Description: alerts table — PRD §4.8
-- =============================================================================

CREATE TABLE alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Clasificación (PRD §4.8)
  tipo alert_type NOT NULL,
  severidad alert_severity NOT NULL DEFAULT 'warning',

  -- Contenido
  titulo text NOT NULL,
  mensaje text NOT NULL,

  -- Referencias opcionales (polimórficas)
  vehicle_id uuid REFERENCES vehicles(id),
  driver_id uuid REFERENCES drivers(id),
  route_id uuid REFERENCES routes(id),
  document_id uuid,

  -- Gestión de alerta
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  read_by uuid REFERENCES auth.users(id),
  is_dismissed boolean NOT NULL DEFAULT false,
  dismissed_at timestamptz,
  dismissed_by uuid REFERENCES auth.users(id),
  dismiss_justification text,

  -- Auditoría
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE alerts is 'Sistema de alertas y notificaciones — PRD §4.8';
