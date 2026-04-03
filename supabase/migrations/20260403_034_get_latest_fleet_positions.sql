-- 034 — Function: get_latest_fleet_positions
--
-- Returns the latest GPS position per vehicle using DISTINCT ON.
-- Joins with vehicles table to get plate and status.
-- Applied manually on 2026-04-03; file created retroactively.

CREATE OR REPLACE FUNCTION public.get_latest_fleet_positions()
RETURNS TABLE (
  id uuid,
  vehicle_id uuid,
  recorded_at timestamptz,
  latitude numeric,
  longitude numeric,
  speed_kph numeric,
  heading_degrees numeric,
  ignition_on boolean,
  gps_fix_type text,
  provider text,
  raw_payload jsonb,
  created_at timestamptz,
  plate text,
  vehicle_status text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT ON (vp.vehicle_id)
    vp.id,
    vp.vehicle_id,
    vp.recorded_at,
    vp.latitude,
    vp.longitude,
    vp.speed_kph,
    vp.heading_degrees,
    vp.ignition_on,
    vp.gps_fix_type,
    vp.provider,
    vp.raw_payload,
    vp.created_at,
    v.plate,
    v.status AS vehicle_status
  FROM vehicle_positions vp
  JOIN vehicles v ON v.id = vp.vehicle_id
  ORDER BY vp.vehicle_id, vp.recorded_at DESC;
$$;
