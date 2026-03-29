-- =============================================================================
-- Migration: 20260329_007_cargo.sql
-- Description: cargo_records table — PRD §4.6
-- =============================================================================

CREATE TABLE cargo_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referencia
  route_id uuid NOT NULL REFERENCES routes(id),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id),

  -- Descripción de la carga (PRD §4.6)
  descripcion text NOT NULL,
  tipo cargo_type NOT NULL DEFAULT 'general',
  peso_kg numeric(10, 2) NOT NULL,
  volumen_m3 numeric(8, 2),

  -- Mercancías peligrosas (PRD §4.6 — ADR 2025)
  adr_clase text,
  adr_numero_onu text,
  adr_grupo_embalaje text,

  -- Validación de peso
  peso_validado boolean DEFAULT false,
  peso_vs_mma_pct numeric(6, 2),
  sobrepeso_alerta boolean DEFAULT false,

  -- CMR digital (Convenio CMR — PRD §4.6)
  cmr_remitente text,
  cmr_destinatario text,
  cmr_lugar_entrega text,
  cmr_documentos_adjuntos text,

  -- Auditoría
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_cargo_updated_at
  BEFORE UPDATE ON cargo_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE cargo_records is 'Registros de cargas/mercancías por ruta — PRD §4.6';
