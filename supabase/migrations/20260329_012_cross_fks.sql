-- =============================================================================
-- Migration: 20260329_012_cross_fks.sql
-- Description: Cross-table foreign keys that depend on creation order
-- =============================================================================

-- vehicles.conductor_asignado_id → drivers(id)
-- Added here because vehicles (002) is created before drivers (003).
ALTER TABLE vehicles
  ADD CONSTRAINT fk_vehicles_conductor
  FOREIGN KEY (conductor_asignado_id) REFERENCES drivers(id);
