-- =============================================================================
-- Migration: 20260329_004_routes.sql
-- Description: routes table — PRD §4.4
-- =============================================================================

CREATE TABLE routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referencias
  vehicle_id uuid NOT NULL REFERENCES vehicles(id),
  driver_id uuid NOT NULL REFERENCES drivers(id),

  -- Origen y destino (PRD §4.4.2)
  origen_municipio text NOT NULL,
  origen_provincia text,
  origen_pais text NOT NULL DEFAULT 'España',
  destino_municipio text NOT NULL,
  destino_provincia text,
  destino_pais text NOT NULL DEFAULT 'España',

  -- Fechas
  fecha_salida timestamptz NOT NULL,
  fecha_llegada_prevista timestamptz,
  fecha_llegada_real timestamptz,

  -- Distancia y duración
  distancia_total_km numeric(10, 2),
  distancia_recorrida_km numeric(10, 2),
  duracion_prevista_min integer,
  duracion_real_min integer,

  -- Carga (PRD §4.4.2, §4.6)
  tipo_carga cargo_type,
  descripcion_carga text,
  peso_carga_kg numeric(10, 2),
  volumen_carga_m3 numeric(8, 2),

  -- Consumo y costes (PRD §4.4.2)
  consumo_combustible_l numeric(8, 2),
  coste_combustible_eur numeric(12, 2),
  coste_peajes_eur numeric(12, 2),
  coste_total_eur numeric(12, 2),

  -- Documentación
  cmr_numero text,
  albaran_numero text,

  -- Estado y resultado (PRD §4.4.2)
  status route_status NOT NULL DEFAULT 'planificada',
  retraso_minutos integer,
  resultado text,
  observaciones text,

  -- Posición GPS actual (mapa en tiempo real — PRD §4.4.1)
  latitud_actual numeric(10, 7),
  longitud_actual numeric(10, 7),
  velocidad_actual_kmh numeric(6, 2),
  eta_minutos integer,

  -- Auditoría
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_routes_updated_at
  BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE routes is 'Rutas activas, historial y planificación — PRD §4.4';
