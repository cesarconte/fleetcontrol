-- =============================================================================
-- Migration: 20260329_009_documents.sql
-- Description: vehicle_documents, driver_documents, tachograph_records — PRD §4.2.2, §4.3
-- =============================================================================

-- ── Documentos de Vehículo (PRD §4.2.2) ──────────────────────────────────────

CREATE TABLE vehicle_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,

  -- Documento
  tipo_documento text NOT NULL,
  numero_referencia text,
  fecha_expedicion date,
  fecha_vencimiento date,
  alerta_dias_anticipacion integer NOT NULL DEFAULT 30,

  -- Estado calculado
  status document_status NOT NULL DEFAULT 'en_regla',

  -- Archivo
  archivo_url text,
  archivo_nombre text,
  archivo_tipo text,

  -- Notas
  notas text,

  -- Auditoría
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_vehicle_documents_updated_at
  BEFORE UPDATE ON vehicle_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE vehicle_documents is 'Documentación obligatoria del vehículo — PRD §4.2.2';

-- ── Documentos de Conductor (PRD §4.3) ───────────────────────────────────────

CREATE TABLE driver_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  driver_id uuid NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,

  -- Documento
  tipo_documento text NOT NULL,
  numero_referencia text,
  categoria text,
  fecha_expedicion date,
  fecha_vencimiento date,
  alerta_dias_anticipacion integer NOT NULL DEFAULT 30,

  -- Estado calculado
  status document_status NOT NULL DEFAULT 'en_regla',

  -- Archivo
  archivo_url text,
  archivo_nombre text,
  archivo_tipo text,

  -- Notas
  notas text,

  -- Auditoría
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_driver_documents_updated_at
  BEFORE UPDATE ON driver_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE driver_documents is 'Documentación obligatoria del conductor — PRD §4.3';

-- ── Registros de Tacógrafo (PRD §4.6.6 / Reg. UE 165/2014) ──────────────────

CREATE TABLE tachograph_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  driver_id uuid NOT NULL REFERENCES drivers(id),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id),

  -- Descarga DDD
  fecha_descarga timestamptz NOT NULL DEFAULT now(),
  archivo_ddd_url text,

  -- Análisis conducción/descanso (Reg. CE 561/2006)
  periodo_inicio timestamptz NOT NULL,
  periodo_fin timestamptz NOT NULL,
  conduccion_total_min integer,
  conduccion_diaria_max_min integer,
  descanso_diario_min_min integer,
  descanso_semanal_min_min integer,
  pausas_realizadas integer,

  -- Infracciones detectadas
  infracciones jsonb DEFAULT '[]'::jsonb,
  tiene_infracciones boolean DEFAULT false,

  -- Auditoría
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_tachograph_records_updated_at
  BEFORE UPDATE ON tachograph_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE tachograph_records is 'Descargas y análisis de tacógrafos — Reg. UE 165/2014';
