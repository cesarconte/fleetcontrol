-- =============================================================================
-- Seed: 001_company_test.sql
-- Description: Datos de empresa de test para FleetControl
--
-- Empresa ficticia: Transportes Cantábricos S.L.
-- Ubicación: Polígono Industrial de Tremañes, Gijón, Asturias
--
-- Ejecutar: supabase db reset (incluye seeds) o manualmente:
--   supabase sql < supabase/seeds/001_company_test.sql
-- =============================================================================

-- Actualizar company_settings con datos de la empresa test
UPDATE company_settings SET
  company_name = 'Transportes Cantábricos S.L.',
  cif = 'B33876542',
  address = 'Calle de la Industria, 14 - Nave 7',
  city = 'Gijón',
  postal_code = '33211',
  province = 'Asturias',
  country = 'España',
  email = 'info@transportescantabricos.es',
  phone = '+34 985 123 456',
  transport_authorization_number = 'ATP-2024-00157',
  logo_url = NULL,

  -- Umbrales de alerta (valores por defecto según legal-limits.js)
  alert_days_vehicle_doc = 30,
  alert_days_driver_doc = 30,
  alert_days_maintenance_km = 5000,
  alert_days_maintenance_days = 30,
  alert_critical_doc_days = 7,
  fuel_anomaly_percent = 20,

  -- Integraciones (por configurar)
  gps_provider = NULL,
  gps_api_key = NULL,
  gps_api_secret = NULL
WHERE id = (SELECT id FROM company_settings LIMIT 1);

-- Actualizar perfil del admin con nombre completo
UPDATE profiles SET
  full_name = 'César Conte'
WHERE id = (SELECT id FROM auth.users LIMIT 1);
