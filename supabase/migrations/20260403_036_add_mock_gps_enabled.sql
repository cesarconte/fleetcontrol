-- 036 — Add mock_gps_enabled to company_settings
--
-- Allows users to toggle the mock GPS provider on/off from Settings > Integrations.

ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS mock_gps_enabled boolean NOT NULL DEFAULT false;
