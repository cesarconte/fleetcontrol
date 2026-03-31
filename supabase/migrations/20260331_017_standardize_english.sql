-- =============================================================================
-- Migration: 20260331_017_standardize_english.sql
-- Description: Standardize ALL column names, enum values, indexes, functions,
--              and policies to English (USA) per AGENTS.md §7 convention:
--              "Columnas BD: SIEMPRE en inglés (fuente de verdad)".
--
-- This migration:
--   1. Renames all Spanish column names → English
--   2. Renames all Spanish enum values → English
--   3. Renames all Spanish indexes → English
--   4. Updates SQL functions to use English names/values
--   5. Renames Spanish storage RLS policies → English
-- =============================================================================

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. COLUMN RENAMES (vehicles)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE vehicles RENAME COLUMN matricula TO plate;
ALTER TABLE vehicles RENAME COLUMN marca TO brand;
ALTER TABLE vehicles RENAME COLUMN modelo TO model;
ALTER TABLE vehicles RENAME COLUMN variante TO variant;
-- 'color' is international, keep as-is
ALTER TABLE vehicles RENAME COLUMN anio_fabricacion TO manufacture_year;
ALTER TABLE vehicles RENAME COLUMN fecha_primera_matriculacion TO first_registration_date;
ALTER TABLE vehicles RENAME COLUMN distintivo_ambiental TO dgt_badge;
ALTER TABLE vehicles RENAME COLUMN euro_emisiones TO euro_emissions;
-- 'mma_kg' is a legal acronym (Masa Máxima Autorizada), keep as-is
ALTER TABLE vehicles RENAME COLUMN tara_kg TO tare_kg;
ALTER TABLE vehicles RENAME COLUMN mma_conjunto_kg TO combined_mma_kg;
ALTER TABLE vehicles RENAME COLUMN carga_util_max_kg TO max_payload_kg;
ALTER TABLE vehicles RENAME COLUMN anchura_max_m TO width_m;
ALTER TABLE vehicles RENAME COLUMN altura_max_m TO height_m;
ALTER TABLE vehicles RENAME COLUMN numero_ejes TO axle_count;
ALTER TABLE vehicles RENAME COLUMN longitud_total_m TO length_m;
ALTER TABLE vehicles RENAME COLUMN tipo_combustible TO fuel_type;
ALTER TABLE vehicles RENAME COLUMN cilindrada_cc TO displacement_cc;
ALTER TABLE vehicles RENAME COLUMN potencia_cv TO power_cv;
ALTER TABLE vehicles RENAME COLUMN potencia_kw TO power_kw;
ALTER TABLE vehicles RENAME COLUMN par_motor_nm TO torque_nm;
ALTER TABLE vehicles RENAME COLUMN caja_cambios TO transmission;
ALTER TABLE vehicles RENAME COLUMN caja_cambios_modelo TO transmission_model;
ALTER TABLE vehicles RENAME COLUMN velocidad_max_autorizada_kmh TO max_authorized_speed_kmh;
ALTER TABLE vehicles RENAME COLUMN norma_emisiones TO euro_standard;
ALTER TABLE vehicles RENAME COLUMN consumo_medio_homologado TO avg_consumption_homologated;
-- 'adblue' is international, keep as-is
ALTER TABLE vehicles RENAME COLUMN tipo_vehiculo TO vehicle_type;
ALTER TABLE vehicles RENAME COLUMN matricula_semirremolque TO trailer_plate;
ALTER TABLE vehicles RENAME COLUMN tipo_enganche TO hitch_type;
ALTER TABLE vehicles RENAME COLUMN longitud_caja_m TO box_length_m;
ALTER TABLE vehicles RENAME COLUMN volumen_carga_m3 TO cargo_volume_m3;
ALTER TABLE vehicles RENAME COLUMN velocidad_actual_kmh TO current_speed_kmh;
ALTER TABLE vehicles RENAME COLUMN latitud TO latitude;
ALTER TABLE vehicles RENAME COLUMN longitud TO longitude;
ALTER TABLE vehicles RENAME COLUMN temperatura_motor_c TO engine_temp_c;
ALTER TABLE vehicles RENAME COLUMN nivel_combustible_pct TO fuel_level_pct;
ALTER TABLE vehicles RENAME COLUMN estado_conductor TO driver_status_text;
ALTER TABLE vehicles RENAME COLUMN odometro_actual_km TO current_odometer_km;
ALTER TABLE vehicles RENAME COLUMN tiempo_conduccion_acumulado_min TO accumulated_driving_min;
ALTER TABLE vehicles RENAME COLUMN odometro_total_km TO total_odometer_km;
ALTER TABLE vehicles RENAME COLUMN km_este_mes TO km_this_month;
ALTER TABLE vehicles RENAME COLUMN km_este_ano TO km_this_year;
ALTER TABLE vehicles RENAME COLUMN rutas_completadas_total TO routes_completed_total;
ALTER TABLE vehicles RENAME COLUMN rutas_completadas_mes TO routes_completed_month;
ALTER TABLE vehicles RENAME COLUMN rutas_completadas_ano TO routes_completed_year;
ALTER TABLE vehicles RENAME COLUMN consumo_medio_real TO avg_consumption_real;
ALTER TABLE vehicles RENAME COLUMN tiempo_medio_ruta_min TO avg_route_time_min;
ALTER TABLE vehicles RENAME COLUMN conductor_asignado_id TO assigned_driver_id;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. COLUMN RENAMES (drivers)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE drivers RENAME COLUMN nombre_completo TO full_name;
ALTER TABLE drivers RENAME COLUMN nif_nie TO national_id;
ALTER TABLE drivers RENAME COLUMN fecha_nacimiento TO birth_date;
ALTER TABLE drivers RENAME COLUMN nacionalidad TO nationality;
ALTER TABLE drivers RENAME COLUMN direccion TO address;
ALTER TABLE drivers RENAME COLUMN ciudad TO city;
ALTER TABLE drivers RENAME COLUMN provincia TO province;
ALTER TABLE drivers RENAME COLUMN codigo_postal TO postal_code;
ALTER TABLE drivers RENAME COLUMN telefono TO phone;
-- 'email' is international, keep as-is
ALTER TABLE drivers RENAME COLUMN foto_url TO photo_url;
ALTER TABLE drivers RENAME COLUMN fecha_incorporacion TO join_date;
ALTER TABLE drivers RENAME COLUMN carnet_clase TO license_class;
ALTER TABLE drivers RENAME COLUMN carnet_numero TO license_number;
ALTER TABLE drivers RENAME COLUMN carnet_fecha_expedicion TO license_issue_date;
ALTER TABLE drivers RENAME COLUMN carnet_fecha_vencimiento TO license_expiry_date;
ALTER TABLE drivers RENAME COLUMN cap_numero TO cap_number;
ALTER TABLE drivers RENAME COLUMN cap_fecha_vencimiento TO cap_expiry_date;
ALTER TABLE drivers RENAME COLUMN cap_horas_formacion TO cap_training_hours;
ALTER TABLE drivers RENAME COLUMN tarjeta_tacografo_numero TO tachograph_card_number;
ALTER TABLE drivers RENAME COLUMN tarjeta_tacografo_vencimiento TO tachograph_card_expiry;
ALTER TABLE drivers RENAME COLUMN reconocimiento_medico_fecha TO medical_exam_date;
ALTER TABLE drivers RENAME COLUMN reconocimiento_medico_vencimiento TO medical_exam_expiry;
ALTER TABLE drivers RENAME COLUMN adr_certificado TO adr_certificate;
ALTER TABLE drivers RENAME COLUMN adr_numero TO adr_number;
ALTER TABLE drivers RENAME COLUMN adr_fecha_vencimiento TO adr_expiry_date;
ALTER TABLE drivers RENAME COLUMN conduccion_diaria_min TO driving_daily_min;
ALTER TABLE drivers RENAME COLUMN conduccion_semanal_min TO driving_weekly_min;
ALTER TABLE drivers RENAME COLUMN conduccion_bisemanal_min TO driving_biweekly_min;
ALTER TABLE drivers RENAME COLUMN ultimo_descanso_inicio TO last_rest_start;
ALTER TABLE drivers RENAME COLUMN ultimo_descanso_fin TO last_rest_end;
ALTER TABLE drivers RENAME COLUMN descanso_semanal_inicio TO weekly_rest_start;
ALTER TABLE drivers RENAME COLUMN descanso_semanal_fin TO weekly_rest_end;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. COLUMN RENAMES (routes)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE routes RENAME COLUMN origen_municipio TO origin_city;
ALTER TABLE routes RENAME COLUMN origen_provincia TO origin_province;
ALTER TABLE routes RENAME COLUMN origen_pais TO origin_country;
ALTER TABLE routes RENAME COLUMN destino_municipio TO destination_city;
ALTER TABLE routes RENAME COLUMN destino_provincia TO destination_province;
ALTER TABLE routes RENAME COLUMN destino_pais TO destination_country;
ALTER TABLE routes RENAME COLUMN fecha_salida TO departure_date;
ALTER TABLE routes RENAME COLUMN fecha_llegada_prevista TO planned_arrival_date;
ALTER TABLE routes RENAME COLUMN fecha_llegada_real TO actual_arrival_date;
ALTER TABLE routes RENAME COLUMN distancia_total_km TO distance_total_km;
ALTER TABLE routes RENAME COLUMN distancia_recorrida_km TO distance_covered_km;
ALTER TABLE routes RENAME COLUMN duracion_prevista_min TO planned_duration_min;
ALTER TABLE routes RENAME COLUMN duracion_real_min TO actual_duration_min;
ALTER TABLE routes RENAME COLUMN tipo_carga TO cargo_type;
ALTER TABLE routes RENAME COLUMN descripcion_carga TO cargo_description;
ALTER TABLE routes RENAME COLUMN peso_carga_kg TO cargo_weight_kg;
ALTER TABLE routes RENAME COLUMN volumen_carga_m3 TO cargo_volume_m3;
ALTER TABLE routes RENAME COLUMN consumo_combustible_l TO fuel_consumption_l;
ALTER TABLE routes RENAME COLUMN coste_combustible_eur TO fuel_cost_eur;
ALTER TABLE routes RENAME COLUMN coste_peajes_eur TO toll_cost_eur;
ALTER TABLE routes RENAME COLUMN coste_total_eur TO total_cost_eur;
ALTER TABLE routes RENAME COLUMN cmr_numero TO cmr_number;
ALTER TABLE routes RENAME COLUMN albaran_numero TO delivery_note_number;
ALTER TABLE routes RENAME COLUMN retraso_minutos TO delay_minutes;
ALTER TABLE routes RENAME COLUMN resultado TO result;
ALTER TABLE routes RENAME COLUMN observaciones TO notes;
ALTER TABLE routes RENAME COLUMN latitud_actual TO current_latitude;
ALTER TABLE routes RENAME COLUMN longitud_actual TO current_longitude;
ALTER TABLE routes RENAME COLUMN velocidad_actual_kmh TO current_speed_kmh;
ALTER TABLE routes RENAME COLUMN eta_minutos TO eta_minutes;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. COLUMN RENAMES (maintenance_records)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE maintenance_records RENAME COLUMN tipo TO maintenance_type;
ALTER TABLE maintenance_records RENAME COLUMN descripcion TO description;
ALTER TABLE maintenance_records RENAME COLUMN diagnostico TO diagnosis;
ALTER TABLE maintenance_records RENAME COLUMN intervencion_realizada TO intervention_done;
ALTER TABLE maintenance_records RENAME COLUMN fecha_programada TO scheduled_date;
ALTER TABLE maintenance_records RENAME COLUMN fecha_inicio TO start_date;
ALTER TABLE maintenance_records RENAME COLUMN fecha_fin TO end_date;
ALTER TABLE maintenance_records RENAME COLUMN km_al_momento TO km_at_moment;
ALTER TABLE maintenance_records RENAME COLUMN taller_nombre TO workshop_name;
ALTER TABLE maintenance_records RENAME COLUMN taller_responsable TO workshop_responsible;
ALTER TABLE maintenance_records RENAME COLUMN coste_mano_obra_eur TO labor_cost_eur;
ALTER TABLE maintenance_records RENAME COLUMN coste_recambios_eur TO parts_cost_eur;
ALTER TABLE maintenance_records RENAME COLUMN coste_total_eur TO total_cost_eur;
ALTER TABLE maintenance_records RENAME COLUMN recambios TO parts;
ALTER TABLE maintenance_records RENAME COLUMN inmovilizacion_horas TO downtime_hours;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. COLUMN RENAMES (fuel_records)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE fuel_records RENAME COLUMN fecha TO refuel_date;
ALTER TABLE fuel_records RENAME COLUMN km_al_momento TO odometer_km;
ALTER TABLE fuel_records RENAME COLUMN litros_kg TO quantity;
ALTER TABLE fuel_records RENAME COLUMN precio_por_litro_eur TO unit_price_eur;
ALTER TABLE fuel_records RENAME COLUMN importe_total_eur TO total_eur;
ALTER TABLE fuel_records RENAME COLUMN estacion_servicio TO station_name;
ALTER TABLE fuel_records RENAME COLUMN consumo_real_l100km TO consumption_l100km;
ALTER TABLE fuel_records RENAME COLUMN emisiones_co2_kg TO co2_emissions_kg;
ALTER TABLE fuel_records RENAME COLUMN desviacion_sobre_media_pct TO deviation_from_avg_pct;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. COLUMN RENAMES (cargo_records)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE cargo_records RENAME COLUMN descripcion TO description;
ALTER TABLE cargo_records RENAME COLUMN tipo TO cargo_type;
ALTER TABLE cargo_records RENAME COLUMN peso_kg TO weight_kg;
ALTER TABLE cargo_records RENAME COLUMN volumen_m3 TO volume_m3;
ALTER TABLE cargo_records RENAME COLUMN adr_clase TO adr_class;
ALTER TABLE cargo_records RENAME COLUMN adr_numero_onu TO adr_un_number;
ALTER TABLE cargo_records RENAME COLUMN adr_grupo_embalaje TO adr_packing_group;
ALTER TABLE cargo_records RENAME COLUMN peso_validado TO weight_validated;
ALTER TABLE cargo_records RENAME COLUMN peso_vs_mma_pct TO weight_vs_mma_pct;
ALTER TABLE cargo_records RENAME COLUMN sobrepeso_alerta TO overweight_alert;
ALTER TABLE cargo_records RENAME COLUMN cmr_remitente TO cmr_sender;
ALTER TABLE cargo_records RENAME COLUMN cmr_destinatario TO cmr_recipient;
ALTER TABLE cargo_records RENAME COLUMN cmr_lugar_entrega TO cmr_delivery_place;
ALTER TABLE cargo_records RENAME COLUMN cmr_documentos_adjuntos TO cmr_attached_docs;
ALTER TABLE cargo_records RENAME COLUMN subcategoria_id TO subcategory_id;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. COLUMN RENAMES (alerts)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE alerts RENAME COLUMN tipo TO alert_type;
ALTER TABLE alerts RENAME COLUMN severidad TO severity;
ALTER TABLE alerts RENAME COLUMN titulo TO title;
ALTER TABLE alerts RENAME COLUMN mensaje TO message;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. COLUMN RENAMES (vehicle_documents)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE vehicle_documents RENAME COLUMN tipo_documento TO doc_type;
ALTER TABLE vehicle_documents RENAME COLUMN numero_referencia TO reference_number;
ALTER TABLE vehicle_documents RENAME COLUMN fecha_expedicion TO issue_date;
ALTER TABLE vehicle_documents RENAME COLUMN fecha_vencimiento TO expiry_date;
ALTER TABLE vehicle_documents RENAME COLUMN alerta_dias_anticipacion TO alert_days_before;
ALTER TABLE vehicle_documents RENAME COLUMN archivo_url TO file_url;
ALTER TABLE vehicle_documents RENAME COLUMN archivo_nombre TO file_name;
ALTER TABLE vehicle_documents RENAME COLUMN archivo_tipo TO file_type;
ALTER TABLE vehicle_documents RENAME COLUMN notas TO notes;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. COLUMN RENAMES (driver_documents)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE driver_documents RENAME COLUMN tipo_documento TO doc_type;
ALTER TABLE driver_documents RENAME COLUMN numero_referencia TO reference_number;
ALTER TABLE driver_documents RENAME COLUMN categoria TO category;
ALTER TABLE driver_documents RENAME COLUMN fecha_expedicion TO issue_date;
ALTER TABLE driver_documents RENAME COLUMN fecha_vencimiento TO expiry_date;
ALTER TABLE driver_documents RENAME COLUMN alerta_dias_anticipacion TO alert_days_before;
ALTER TABLE driver_documents RENAME COLUMN archivo_url TO file_url;
ALTER TABLE driver_documents RENAME COLUMN archivo_nombre TO file_name;
ALTER TABLE driver_documents RENAME COLUMN archivo_tipo TO file_type;
ALTER TABLE driver_documents RENAME COLUMN notas TO notes;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. COLUMN RENAMES (tachograph_records)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE tachograph_records RENAME COLUMN fecha_descarga TO download_date;
ALTER TABLE tachograph_records RENAME COLUMN archivo_ddd_url TO ddd_file_url;
ALTER TABLE tachograph_records RENAME COLUMN periodo_inicio TO period_start;
ALTER TABLE tachograph_records RENAME COLUMN periodo_fin TO period_end;
ALTER TABLE tachograph_records RENAME COLUMN conduccion_total_min TO total_driving_min;
ALTER TABLE tachograph_records RENAME COLUMN conduccion_diaria_max_min TO max_daily_driving_min;
ALTER TABLE tachograph_records RENAME COLUMN descanso_diario_min_min TO min_daily_rest_min;
ALTER TABLE tachograph_records RENAME COLUMN descanso_semanal_min_min TO min_weekly_rest_min;
ALTER TABLE tachograph_records RENAME COLUMN pausas_realizadas TO breaks_taken;
ALTER TABLE tachograph_records RENAME COLUMN infracciones TO violations;
ALTER TABLE tachograph_records RENAME COLUMN tiene_infracciones TO has_violations;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 11. ENUM VALUE RENAMES
-- ═══════════════════════════════════════════════════════════════════════════════

-- vehicle_status
ALTER TYPE vehicle_status RENAME VALUE 'activo' TO 'active';
ALTER TYPE vehicle_status RENAME VALUE 'en_ruta' TO 'on_route';
ALTER TYPE vehicle_status RENAME VALUE 'en_mantenimiento' TO 'in_maintenance';
ALTER TYPE vehicle_status RENAME VALUE 'inactivo' TO 'inactive';
ALTER TYPE vehicle_status RENAME VALUE 'dado_de_baja' TO 'decommissioned';

-- vehicle_type (original Spanish values from migration 001)
ALTER TYPE vehicle_type RENAME VALUE 'tractora' TO 'tractor';
ALTER TYPE vehicle_type RENAME VALUE 'vehiculo_rigido' TO 'rigid';
ALTER TYPE vehicle_type RENAME VALUE 'semirremolque' TO 'semitrailer';
ALTER TYPE vehicle_type RENAME VALUE 'remolque' TO 'trailer';
ALTER TYPE vehicle_type RENAME VALUE 'portacoches' TO 'car_carrier';
ALTER TYPE vehicle_type RENAME VALUE 'cisterna' TO 'tanker';
ALTER TYPE vehicle_type RENAME VALUE 'frigorifico' TO 'refrigerated';
ALTER TYPE vehicle_type RENAME VALUE 'basculante' TO 'dump';
ALTER TYPE vehicle_type RENAME VALUE 'lona' TO 'curtain';
ALTER TYPE vehicle_type RENAME VALUE 'caja_cerrada' TO 'closed_box';
ALTER TYPE vehicle_type RENAME VALUE 'especial' TO 'special';

-- fuel_type
ALTER TYPE fuel_type RENAME VALUE 'hidrogeno' TO 'hydrogen';
ALTER TYPE fuel_type RENAME VALUE 'electrico' TO 'electric';
ALTER TYPE fuel_type RENAME VALUE 'hibrido' TO 'hybrid';
-- 'diesel', 'gnc', 'gnl' are international abbreviations, keep as-is

-- transmission_type
ALTER TYPE transmission_type RENAME VALUE 'automatica' TO 'automatic';
-- 'manual' is already English

-- driver_status
ALTER TYPE driver_status RENAME VALUE 'activo' TO 'active';
ALTER TYPE driver_status RENAME VALUE 'baja_temporal' TO 'temporary_leave';
ALTER TYPE driver_status RENAME VALUE 'baja_definitiva' TO 'permanently_off';

-- route_status
ALTER TYPE route_status RENAME VALUE 'planificada' TO 'planned';
ALTER TYPE route_status RENAME VALUE 'en_curso' TO 'in_progress';
ALTER TYPE route_status RENAME VALUE 'completada' TO 'completed';
ALTER TYPE route_status RENAME VALUE 'retrasada' TO 'delayed';
ALTER TYPE route_status RENAME VALUE 'cancelada' TO 'cancelled';

-- maintenance_type
ALTER TYPE maintenance_type RENAME VALUE 'preventivo' TO 'preventive';
ALTER TYPE maintenance_type RENAME VALUE 'correctivo' TO 'corrective';

-- maintenance_status
ALTER TYPE maintenance_status RENAME VALUE 'pendiente' TO 'pending';
ALTER TYPE maintenance_status RENAME VALUE 'en_curso' TO 'in_progress';
ALTER TYPE maintenance_status RENAME VALUE 'completada' TO 'completed';

-- cargo_type
ALTER TYPE cargo_type RENAME VALUE 'frigorifica' TO 'refrigerated';
ALTER TYPE cargo_type RENAME VALUE 'peligrosa' TO 'dangerous';
ALTER TYPE cargo_type RENAME VALUE 'especial' TO 'special';
-- 'general' is already English

-- alert_type
ALTER TYPE alert_type RENAME VALUE 'documento_vehiculo_vencido' TO 'vehicle_doc_expired';
ALTER TYPE alert_type RENAME VALUE 'documento_conductor_vencido' TO 'driver_doc_expired';
ALTER TYPE alert_type RENAME VALUE 'limite_conduccion' TO 'driving_limit';
ALTER TYPE alert_type RENAME VALUE 'mantenimiento_pendiente' TO 'maintenance_pending';
ALTER TYPE alert_type RENAME VALUE 'consumo_anomalo' TO 'anomalous_consumption';
ALTER TYPE alert_type RENAME VALUE 'vehiculo_detenido' TO 'vehicle_stopped';
ALTER TYPE alert_type RENAME VALUE 'exceso_velocidad' TO 'speeding';
ALTER TYPE alert_type RENAME VALUE 'descarga_tacografo' TO 'tachograph_download';
ALTER TYPE alert_type RENAME VALUE 'infraccion_conduccion' TO 'driving_violation';

-- document_status
ALTER TYPE document_status RENAME VALUE 'en_regla' TO 'valid';
ALTER TYPE document_status RENAME VALUE 'proximo_a_vencer' TO 'expiring_soon';
ALTER TYPE document_status RENAME VALUE 'critico' TO 'critical';
ALTER TYPE document_status RENAME VALUE 'vencido' TO 'expired';
ALTER TYPE document_status RENAME VALUE 'no_aplica' TO 'not_applicable';

-- user_role
ALTER TYPE user_role RENAME VALUE 'administrador' TO 'admin';
ALTER TYPE user_role RENAME VALUE 'jefe_trafico' TO 'traffic_manager';
ALTER TYPE user_role RENAME VALUE 'agente_trafico' TO 'traffic_agent';
ALTER TYPE user_role RENAME VALUE 'tecnico_mantenimiento' TO 'maintenance_tech';
ALTER TYPE user_role RENAME VALUE 'solo_lectura' TO 'read_only';

-- dgt_badge
ALTER TYPE dgt_badge RENAME VALUE 'sin_etiqueta' TO 'no_label';
-- '0', 'eco', 'c', 'b' are codes, keep as-is

-- ═══════════════════════════════════════════════════════════════════════════════
-- 12. INDEX RENAMES (drop old + create with English names)
-- ═══════════════════════════════════════════════════════════════════════════════

-- vehicles
DROP INDEX IF EXISTS idx_vehicles_matricula;
CREATE INDEX idx_vehicles_plate ON vehicles(plate);
DROP INDEX IF EXISTS idx_vehicles_tipo;
CREATE INDEX idx_vehicles_vehicle_type ON vehicles(vehicle_type);
DROP INDEX IF EXISTS idx_vehicles_conductor;
CREATE INDEX idx_vehicles_assigned_driver ON vehicles(assigned_driver_id);
-- idx_vehicles_status, idx_vehicles_eu_category, idx_vehicles_body_type, idx_vehicles_cat_body already English

-- drivers
DROP INDEX IF EXISTS idx_drivers_nif;
CREATE INDEX idx_drivers_national_id ON drivers(national_id);

-- routes
DROP INDEX IF EXISTS idx_routes_fecha_salida;
CREATE INDEX idx_routes_departure_date ON routes(departure_date);
DROP INDEX IF EXISTS idx_routes_status_fecha;
CREATE INDEX idx_routes_status_departure ON routes(status, departure_date);

-- maintenance_records
DROP INDEX IF EXISTS idx_maintenance_tipo;
CREATE INDEX idx_maintenance_type ON maintenance_records(maintenance_type);
DROP INDEX IF EXISTS idx_maintenance_fecha_programada;
CREATE INDEX idx_maintenance_scheduled ON maintenance_records(scheduled_date);

-- fuel_records
DROP INDEX IF EXISTS idx_fuel_fecha;
CREATE INDEX idx_fuel_refuel_date ON fuel_records(refuel_date);

-- cargo_records
DROP INDEX IF EXISTS idx_cargo_tipo;
CREATE INDEX idx_cargo_type ON cargo_records(cargo_type);
DROP INDEX IF EXISTS idx_cargo_subcategoria;
CREATE INDEX idx_cargo_subcategory ON cargo_records(subcategory_id);

-- alerts
DROP INDEX IF EXISTS idx_alerts_tipo;
CREATE INDEX idx_alerts_type ON alerts(alert_type);
DROP INDEX IF EXISTS idx_alerts_severidad;
CREATE INDEX idx_alerts_severity ON alerts(severity);

-- vehicle_documents
DROP INDEX IF EXISTS idx_vehicle_documents_tipo;
CREATE INDEX idx_vehicle_documents_doc_type ON vehicle_documents(doc_type);
DROP INDEX IF EXISTS idx_vehicle_documents_vencimiento;
CREATE INDEX idx_vehicle_documents_expiry ON vehicle_documents(expiry_date);

-- driver_documents
DROP INDEX IF EXISTS idx_driver_documents_tipo;
CREATE INDEX idx_driver_documents_doc_type ON driver_documents(doc_type);
DROP INDEX IF EXISTS idx_driver_documents_vencimiento;
CREATE INDEX idx_driver_documents_expiry ON driver_documents(expiry_date);

-- tachograph_records
DROP INDEX IF EXISTS idx_tachograph_infracciones;
CREATE INDEX idx_tachograph_violations ON tachograph_records(has_violations);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 13. UPDATE FUNCTIONS (English column names + enum values)
-- ═══════════════════════════════════════════════════════════════════════════════

-- get_dashboard_kpis()
CREATE OR REPLACE FUNCTION get_dashboard_kpis()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  total_vehicles integer;
  vehicles_on_route integer;
  active_drivers integer;
  total_drivers integer;
  vehicles_in_maintenance integer;
  routes_completed_today integer;
  active_alerts integer;
  tachograph_violations integer;
BEGIN
  SELECT count(*) INTO total_vehicles
  FROM vehicles WHERE status != 'decommissioned';

  SELECT count(*) INTO vehicles_on_route
  FROM vehicles WHERE status = 'on_route';

  SELECT count(*) INTO active_drivers
  FROM drivers WHERE status = 'active';

  SELECT count(*) INTO total_drivers
  FROM drivers;

  SELECT count(*) INTO vehicles_in_maintenance
  FROM vehicles WHERE status = 'in_maintenance';

  SELECT count(*) INTO routes_completed_today
  FROM routes
  WHERE status = 'completed'
    AND actual_arrival_date::date = current_date;

  SELECT count(*) INTO active_alerts
  FROM alerts
  WHERE is_read = false AND is_dismissed = false;

  SELECT count(*) INTO tachograph_violations
  FROM tachograph_records
  WHERE has_violations = true;

  RETURN jsonb_build_object(
    'total_vehicles', total_vehicles,
    'vehicles_on_route', vehicles_on_route,
    'active_drivers', active_drivers,
    'total_drivers', total_drivers,
    'vehicles_in_maintenance', vehicles_in_maintenance,
    'routes_completed_today', routes_completed_today,
    'active_alerts', active_alerts,
    'tachograph_violations', tachograph_violations,
    'generated_at', now()
  );
END;
$$;

-- check_document_expiry()
CREATE OR REPLACE FUNCTION check_document_expiry()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  affected integer := 0;
BEGIN
  UPDATE vehicle_documents
  SET status = CASE
    WHEN expiry_date IS NULL THEN 'valid'::document_status
    WHEN expiry_date < current_date THEN 'expired'::document_status
    WHEN expiry_date <= current_date + interval '7 days' THEN 'critical'::document_status
    WHEN expiry_date <= current_date + (alert_days_before || ' days')::interval THEN 'expiring_soon'::document_status
    ELSE 'valid'::document_status
  END,
  updated_at = now()
  WHERE status != 'not_applicable';

  GET DIAGNOSTICS affected = ROW_COUNT;

  UPDATE driver_documents
  SET status = CASE
    WHEN expiry_date IS NULL THEN 'valid'::document_status
    WHEN expiry_date < current_date THEN 'expired'::document_status
    WHEN expiry_date <= current_date + interval '7 days' THEN 'critical'::document_status
    WHEN expiry_date <= current_date + (alert_days_before || ' days')::interval THEN 'expiring_soon'::document_status
    ELSE 'valid'::document_status
  END,
  updated_at = now()
  WHERE status != 'not_applicable';

  GET DIAGNOSTICS affected = affected + ROW_COUNT;

  RETURN affected;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 14. STORAGE RLS POLICY RENAMES (Spanish → English)
-- ═══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Usuarios autenticados pueden ver documentos" ON storage.objects;
CREATE POLICY "driver_docs_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documentos-conductores');

DROP POLICY IF EXISTS "Usuarios autenticados pueden subir documentos" ON storage.objects;
CREATE POLICY "driver_docs_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documentos-conductores');

DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar documentos" ON storage.objects;
CREATE POLICY "driver_docs_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documentos-conductores');

-- ═══════════════════════════════════════════════════════════════════════════════
-- 15. TRIGGER RENAMES (if they reference Spanish column names)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Triggers use update_updated_at() which sets updated_at (already English).
-- No changes needed for triggers.

COMMENT ON MIGRATION IS
  'Standardize all DB identifiers to English per AGENTS.md §7. ' ||
  'Column names, enum values, indexes, functions, and policies renamed.';

