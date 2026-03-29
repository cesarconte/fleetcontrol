-- =============================================================================
-- Migration: 20260329_002_vehicles.sql
-- Description: vehicles table — PRD §4.2.1 all fields
-- =============================================================================

CREATE TABLE vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación (PRD §4.2.1)
  matricula text NOT NULL UNIQUE,
  vin text UNIQUE,
  transport_card_number text,
  marca text NOT NULL,
  modelo text NOT NULL,
  variante text,
  color text,
  anio_fabricacion integer,
  fecha_primera_matriculacion date,
  distintivo_ambiental dgt_badge,
  euro_emisiones euro_standard,

  -- Masas y Dimensiones (PRD §4.2.1 — RD 2822/1998, Reg. UE 1230/2012)
  mma_kg numeric(10, 2),
  tara_kg numeric(10, 2),
  mma_conjunto_kg numeric(10, 2),
  carga_util_max_kg numeric(10, 2),
  anchura_max_m numeric(4, 2),
  altura_max_m numeric(4, 2),
  numero_ejes integer,
  longitud_total_m numeric(5, 2),

  -- Motor y Emisiones (PRD §4.2.1)
  tipo_combustible fuel_type,
  cilindrada_cc integer,
  potencia_cv integer,
  potencia_kw numeric(8, 2),
  par_motor_nm integer,
  caja_cambios transmission_type,
  caja_cambios_modelo text,
  velocidad_max_autorizada_kmh integer,
  norma_emisiones euro_standard,
  consumo_medio_homologado numeric(5, 2),
  adblue boolean DEFAULT false,

  -- Tipo de vehículo (PRD §4.2.1)
  tipo_vehiculo vehicle_type NOT NULL,
  matricula_semirremolque text,
  tipo_enganche text,
  longitud_caja_m numeric(5, 2),
  volumen_carga_m3 numeric(8, 2),

  -- Estado en Tiempo Real (PRD §4.2.3)
  velocidad_actual_kmh numeric(6, 2),
  latitud numeric(10, 7),
  longitud numeric(10, 7),
  temperatura_motor_c numeric(6, 2),
  nivel_combustible_pct numeric(5, 2),
  estado_conductor text,
  odometro_actual_km numeric(12, 2),
  tiempo_conduccion_acumulado_min integer,

  -- Estadísticas (PRD §4.2.4)
  odometro_total_km numeric(12, 2),
  km_este_mes numeric(10, 2),
  km_este_ano numeric(10, 2),
  rutas_completadas_total integer DEFAULT 0,
  rutas_completadas_mes integer DEFAULT 0,
  rutas_completadas_ano integer DEFAULT 0,
  consumo_medio_real numeric(5, 2),
  tiempo_medio_ruta_min integer,

  -- Estado general
  status vehicle_status NOT NULL DEFAULT 'activo',
  -- NOTE: conductor_asignado_id FK added in 20260329_012_cross_fks.sql
  -- (drivers table must exist first)
  conductor_asignado_id uuid,

  -- Auditoría
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE vehicles is 'Ficha completa de vehículos de la flota — PRD §4.2';
