-- 035 — Rename BRIN indexes to follow naming convention
--
-- AGENTS.md §15: Indexes should be named idx_{table}_{columns}
-- Current names: idx_positions_recorded_at, idx_positions_vehicle_time
-- New names: idx_vehicle_positions_recorded_at, idx_vehicle_positions_vehicle_time

DROP INDEX IF EXISTS public.idx_positions_recorded_at;
DROP INDEX IF EXISTS public.idx_positions_vehicle_time;

CREATE INDEX idx_vehicle_positions_recorded_at
  ON public.vehicle_positions
  USING brin (recorded_at);

CREATE INDEX idx_vehicle_positions_vehicle_time
  ON public.vehicle_positions
  USING brin (vehicle_id, recorded_at);
