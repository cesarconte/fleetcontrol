-- 033 — Restrictive RLS policies for vehicle_positions
--
-- vehicle_positions is append-only GPS history:
--   - SELECT: authenticated users (fleet visibility)
--   - INSERT: service_role only (Edge Function / provider webhook)
--   - UPDATE: blocked (immutable history)
--   - DELETE: blocked (immutable history)
--
-- Applied manually on 2026-04-03; file created retroactively.

-- Enable RLS
ALTER TABLE public.vehicle_positions ENABLE ROW LEVEL SECURITY;

-- SELECT: any authenticated user can read fleet positions
CREATE POLICY vehicle_positions_select
  ON public.vehicle_positions
  FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

-- INSERT: only service_role (Edge Function ingestor)
CREATE POLICY vehicle_positions_insert
  ON public.vehicle_positions
  FOR INSERT
  TO service_role
  WITH CHECK (auth.role() = 'service_role');

-- UPDATE: explicitly deny (append-only)
CREATE POLICY vehicle_positions_no_update
  ON public.vehicle_positions
  FOR UPDATE
  TO authenticated
  USING (false);

-- DELETE: explicitly deny (append-only)
CREATE POLICY vehicle_positions_no_delete
  ON public.vehicle_positions
  FOR DELETE
  TO authenticated
  USING (false);
