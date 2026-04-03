-- Migración 032: vehicle_positions + trigger de cache
-- Tabla histórico de posiciones GPS con trigger para actualizar cache en vehicles

-- Tabla de posiciones (histórico, append-only)
CREATE TABLE vehicle_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  recorded_at TIMESTAMPTZ NOT NULL,
  latitude NUMERIC(9,6) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude NUMERIC(9,6) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  speed_kph NUMERIC(6,2) CHECK (speed_kph >= 0 AND speed_kph <= 300),
  heading_degrees NUMERIC(5,2) CHECK (heading_degrees >= 0 AND heading_degrees < 360),
  ignition_on BOOLEAN NOT NULL DEFAULT false,
  gps_fix_type VARCHAR(20) NOT NULL DEFAULT 'GPS_3D'
    CHECK (gps_fix_type IN ('GPS_2D', 'GPS_3D', 'DEAD_RECKONING', 'CELL_TOWER', 'UNKNOWN')),
  provider VARCHAR(30) NOT NULL DEFAULT 'mock',
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices BRIN para time-series
CREATE INDEX idx_positions_vehicle_time ON vehicle_positions
  USING brin (vehicle_id, recorded_at);
CREATE INDEX idx_positions_recorded_at ON vehicle_positions
  USING brin (recorded_at);

-- RLS
ALTER TABLE vehicle_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicle_positions_select" ON vehicle_positions
  FOR SELECT USING (true);
CREATE POLICY "vehicle_positions_insert" ON vehicle_positions
  FOR INSERT WITH CHECK (true);

-- Trigger: actualizar cache en vehicles
CREATE OR REPLACE FUNCTION update_vehicle_last_position()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vehicles
  SET latitude = NEW.latitude,
      longitude = NEW.longitude,
      current_speed_kmh = NEW.speed_kph
  WHERE id = NEW.vehicle_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_update_vehicle_position
  AFTER INSERT ON vehicle_positions
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_last_position();
