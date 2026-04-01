-- =============================================================================
-- Migration: 20260401_025_settings_enhancements.sql
-- Description: Enhance company_settings with integrations + alert threshold config
-- =============================================================================

ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS
  gps_provider text;

ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS
  gps_api_key text;

ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS
  gps_api_secret text;

ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS
  alert_critical_doc_days integer NOT NULL DEFAULT 7;

ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS
  fuel_anomaly_percent integer NOT NULL DEFAULT 20;
