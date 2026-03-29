-- =============================================================================
-- Migration: 20260329_003_drivers.sql
-- Description: drivers table — PRD §4.3
-- =============================================================================

CREATE TABLE drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Datos personales (PRD §4.3)
  nombre_completo text NOT NULL,
  nif_nie text NOT NULL UNIQUE,
  fecha_nacimiento date,
  nacionalidad text,
  direccion text,
  ciudad text,
  provincia text,
  codigo_postal text,
  telefono text,
  email text,
  foto_url text,

  -- Datos laborales
  fecha_incorporacion date NOT NULL,
  status driver_status NOT NULL DEFAULT 'activo',

  -- Carné de conducir (PRD §4.3 — RDL 6/2015)
  carnet_clase text,
  carnet_numero text,
  carnet_fecha_expedicion date,
  carnet_fecha_vencimiento date,

  -- CAP — Certificado de Aptitud Profesional (RD 1032/2007)
  cap_numero text,
  cap_fecha_vencimiento date,
  cap_horas_formacion integer DEFAULT 35,

  -- Tarjeta de conductor — tacógrafo digital (Reg. UE 165/2014)
  tarjeta_tacografo_numero text,
  tarjeta_tacografo_vencimiento date,

  -- Reconocimiento médico (RD 818/2009)
  reconocimiento_medico_fecha date,
  reconocimiento_medico_vencimiento date,

  -- Certificado ADR (ADR 2025 + RD 97/2014)
  adr_certificado boolean DEFAULT false,
  adr_numero text,
  adr_fecha_vencimiento date,

  -- Control de tiempos de conducción (Reg. CE 561/2006)
  conduccion_diaria_min integer DEFAULT 0,
  conduccion_semanal_min integer DEFAULT 0,
  conduccion_bisemanal_min integer DEFAULT 0,
  ultimo_descanso_inicio timestamptz,
  ultimo_descanso_fin timestamptz,
  descanso_semanal_inicio timestamptz,
  descanso_semanal_fin timestamptz,

  -- Auditoría
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE drivers is 'Ficha completa de conductores — PRD §4.3';
