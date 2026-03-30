-- =============================================================================
-- Migration: 20260330_016_vehicle_types.sql
-- Description: Reestructuración vehículos — 3 campos UE (categoría, estructura, carrocería)
--              EU Homologation Categories + RD 2822/1998 Anexo II
-- =============================================================================

-- ── 1. Crear nuevos enums ───────────────────────────────────────────────────

CREATE TYPE eu_categoria AS ENUM (
  'N1', 'N2', 'N3',
  'O1', 'O2', 'O3', 'O4'
);

CREATE TYPE vehicle_body_type AS ENUM (
  'caja_abierta', 'lona', 'caja_cerrada', 'frigorifico', 'isotermo',
  'calorifico', 'cisterna', 'silo', 'basculante', 'portavehiculos',
  'portacontenedores', 'jaula', 'ganadero', 'capitone', 'portabobinas',
  'plataforma_abierta', 'furgon', 'furgoneta', 'grua', 'tolva',
  'especial'
);

-- ── 2. Añadir nuevas columnas (nullable temporalmente) ──────────────────────

ALTER TABLE vehicles
  ADD COLUMN categoria_ue eu_categoria,
  ADD COLUMN tipo_carroceria vehicle_body_type;

-- ── 3. Migrar datos existentes ──────────────────────────────────────────────
-- Mapping del antiguo tipo_vehiculo a los 3 nuevos campos.
-- NOTA: El campo tipo_vehiculo original se conserva como backup.

DO $$
DECLARE
  v_count int;
BEGIN
  -- tractora → cab_tractora / especial / N3
  UPDATE vehicles SET tipo_carroceria = 'especial', categoria_ue = 'N3'
  WHERE tipo_vehiculo = 'tractora' AND tipo_carroceria IS NULL;

  -- vehiculo_rigido → rigido / caja_cerrada / N3
  UPDATE vehicles SET tipo_carroceria = 'caja_cerrada', categoria_ue = 'N3'
  WHERE tipo_vehiculo = 'vehiculo_rigido' AND tipo_carroceria IS NULL;

  -- semirremolque → semirremolque / lona / O4
  UPDATE vehicles SET tipo_carroceria = 'lona', categoria_ue = 'O4'
  WHERE tipo_vehiculo = 'semirremolque' AND tipo_carroceria IS NULL;

  -- remolque → remolque / caja_abierta / O3
  UPDATE vehicles SET tipo_carroceria = 'caja_abierta', categoria_ue = 'O3'
  WHERE tipo_vehiculo = 'remolque' AND tipo_carroceria IS NULL;

  -- portacoches → rigido / portavehiculos / N3
  UPDATE vehicles SET tipo_carroceria = 'portavehiculos', categoria_ue = 'N3'
  WHERE tipo_vehiculo = 'portacoches' AND tipo_carroceria IS NULL;

  -- cisterna → rigido / cisterna / N3
  UPDATE vehicles SET tipo_carroceria = 'cisterna', categoria_ue = 'N3'
  WHERE tipo_vehiculo = 'cisterna' AND tipo_carroceria IS NULL;

  -- frigorifico → rigido / frigorifico / N3
  UPDATE vehicles SET tipo_carroceria = 'frigorifico', categoria_ue = 'N3'
  WHERE tipo_vehiculo = 'frigorifico' AND tipo_carroceria IS NULL;

  -- basculante → rigido / basculante / N3
  UPDATE vehicles SET tipo_carroceria = 'basculante', categoria_ue = 'N3'
  WHERE tipo_vehiculo = 'basculante' AND tipo_carroceria IS NULL;

  -- lona → rigido / lona / N3
  UPDATE vehicles SET tipo_carroceria = 'lona', categoria_ue = 'N3'
  WHERE tipo_vehiculo = 'lona' AND tipo_carroceria IS NULL;

  -- caja_cerrada → rigido / caja_cerrada / N3
  UPDATE vehicles SET tipo_carroceria = 'caja_cerrada', categoria_ue = 'N3'
  WHERE tipo_vehiculo = 'caja_cerrada' AND tipo_carroceria IS NULL;

  -- especial → rigido / especial / N3
  UPDATE vehicles SET tipo_carroceria = 'especial', categoria_ue = 'N3'
  WHERE tipo_vehiculo = 'especial' AND tipo_carroceria IS NULL;

  -- furgoneta → rigido / furgoneta / N1
  UPDATE vehicles SET tipo_carroceria = 'furgoneta', categoria_ue = 'N1'
  WHERE tipo_vehiculo = 'furgoneta' AND tipo_carroceria IS NULL;

  -- furgon → rigido / furgon / N2
  UPDATE vehicles SET tipo_carroceria = 'furgon', categoria_ue = 'N2'
  WHERE tipo_vehiculo = 'furgon' AND tipo_carroceria IS NULL;

  -- ganadero → rigido / ganadero / N3
  UPDATE vehicles SET tipo_carroceria = 'ganadero', categoria_ue = 'N3'
  WHERE tipo_vehiculo = 'ganadero' AND tipo_carroceria IS NULL;

  -- isotermo → rigido / isotermo / N3
  UPDATE vehicles SET tipo_carroceria = 'isotermo', categoria_ue = 'N3'
  WHERE tipo_vehiculo = 'isotermo' AND tipo_carroceria IS NULL;

  -- mega → semirremolque / lona / O4
  UPDATE vehicles SET tipo_carroceria = 'lona', categoria_ue = 'O4'
  WHERE tipo_vehiculo = 'mega' AND tipo_carroceria IS NULL;

  -- plataforma_abierta → rigido / plataforma_abierta / N3
  UPDATE vehicles SET tipo_carroceria = 'plataforma_abierta', categoria_ue = 'N3'
  WHERE tipo_vehiculo = 'plataforma_abierta' AND tipo_carroceria IS NULL;

  -- gondola → rigido / plataforma_abierta / N3
  UPDATE vehicles SET tipo_carroceria = 'plataforma_abierta', categoria_ue = 'N3'
  WHERE tipo_vehiculo = 'gondola' AND tipo_carroceria IS NULL;

  -- portacovertores → rigido / portacontenedores / N3
  UPDATE vehicles SET tipo_carroceria = 'portacontenedores', categoria_ue = 'N3'
  WHERE tipo_vehiculo = 'portacovertores' AND tipo_carroceria IS NULL;

  -- tolva → rigido / tolva / N3
  UPDATE vehicles SET tipo_carroceria = 'tolva', categoria_ue = 'N3'
  WHERE tipo_vehiculo = 'tolva' AND tipo_carroceria IS NULL;

  -- grua → rigido / grua / N3
  UPDATE vehicles SET tipo_carroceria = 'grua', categoria_ue = 'N3'
  WHERE tipo_vehiculo = 'grua' AND tipo_carroceria IS NULL;

  -- mixto → rigido / especial / N3
  UPDATE vehicles SET tipo_carroceria = 'especial', categoria_ue = 'N3'
  WHERE tipo_vehiculo = 'mixto' AND tipo_carroceria IS NULL;

  -- Cualquier otro valor restante → rigido / especial / N3
  UPDATE vehicles SET tipo_carroceria = 'especial', categoria_ue = 'N3'
  WHERE tipo_carroceria IS NULL;

  RAISE NOTICE 'Migración de datos de tipo_vehiculo completada';
END $$;

-- ── 4. Verificar integridad y hacer NOT NULL ────────────────────────────────

DO $$
DECLARE
  null_count int;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM vehicles
  WHERE categoria_ue IS NULL OR tipo_carroceria IS NULL;

  IF null_count > 0 THEN
    RAISE EXCEPTION 'Hay % vehículos con categoria_ue o tipo_carroceria NULL', null_count;
  END IF;
END $$;

ALTER TABLE vehicles
  ALTER COLUMN categoria_ue SET NOT NULL,
  ALTER COLUMN tipo_carroceria SET NOT NULL;

-- ── 5. Renombrar columna antigua (backup por seguridad) ─────────────────────

ALTER TABLE vehicles RENAME COLUMN tipo_vehiculo TO tipo_vehiculo_deprecated;

-- Backup del valor original como texto (por si acaso)
ALTER TABLE vehicles ADD COLUMN tipo_vehiculo_old_value text;
UPDATE vehicles SET tipo_vehiculo_old_value = tipo_vehiculo_deprecated::text;

COMMENT ON COLUMN vehicles.tipo_vehiculo_deprecated IS
  'DEPRECATED: Antiguo enum vehicle_type. Renombrado en migración 016. Eliminar en futura migración.';
COMMENT ON COLUMN vehicles.tipo_vehiculo_old_value IS
  'Backup del valor original de tipo_vehiculo. Eliminar en futura migración.';
COMMENT ON COLUMN vehicles.categoria_ue IS
  'Categoría UE de homologación por masa (N1-N3, O1-O4). Reg. (UE) 2018/858.';
COMMENT ON COLUMN vehicles.tipo_carroceria IS
  'Tipo de carrocería / criterio de utilización. RD 2822/1998 Anexo II.';

-- ── 6. Índices ──────────────────────────────────────────────────────────────

DROP INDEX IF EXISTS idx_vehicles_tipo;

CREATE INDEX idx_vehicles_categoria_ue ON vehicles(categoria_ue);
CREATE INDEX idx_vehicles_tipo_carroceria ON vehicles(tipo_carroceria);
CREATE INDEX idx_vehicles_cat_carroc ON vehicles(categoria_ue, tipo_carroceria);
