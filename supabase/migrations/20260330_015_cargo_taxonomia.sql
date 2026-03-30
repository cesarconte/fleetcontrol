-- =============================================================================
-- Migration: 20260330_015_cargo_taxonomia.sql
-- Description: Taxonomía de cargas — subcategoria_id + ampliación vehicle_type
--              PRD §4.6, Fases 1-3 del plan de implementación
-- =============================================================================

-- ── 1. Ampliar vehicle_type con clases adicionales ──────────────────────────
-- PostgreSQL solo permite ADD VALUE (sin DELETE). Backward-compatible.

ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'furgoneta';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'furgon';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'ganadero';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'isotermo';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'mega';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'plataforma_abierta';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'gondola';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'portacovertores';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'tolva';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'grua';
ALTER TYPE vehicle_type ADD VALUE IF NOT EXISTS 'mixto';

-- ── 2. Añadir subcategoria_id a cargo_records ───────────────────────────────
-- Nullable y backward-compatible: registros existentes sin subcategoría siguen
-- válidos. La columna se rellena al crear/editar cargas con el nuevo selector.

ALTER TABLE cargo_records
  ADD COLUMN subcategoria_id text;

COMMENT ON COLUMN cargo_records.subcategoria_id IS
  'ID de subcategoría de la taxonomía de cargas (kebab-case). '
  'Referencia a src/constants/cargo-categories.js. Nullable por backward compatibility.';

-- ── 3. Índice para consultas por subcategoría ───────────────────────────────

CREATE INDEX idx_cargo_subcategoria
  ON cargo_records (subcategoria_id)
  WHERE subcategoria_id IS NOT NULL;
