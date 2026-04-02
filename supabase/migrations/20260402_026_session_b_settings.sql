-- Migration 026: Session B — Settings enhancements
-- Adds new alert thresholds, integration credentials, and company-logos bucket.

-- ────────────────────────────────────────────────────────────
-- 1. New alert threshold columns
-- ────────────────────────────────────────────────────────────
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS alert_driving_hours    numeric(4,1) DEFAULT 9,
  ADD COLUMN IF NOT EXISTS alert_tachograph_days  integer DEFAULT 28,
  ADD COLUMN IF NOT EXISTS alert_speed_limit      integer DEFAULT 90;

-- ────────────────────────────────────────────────────────────
-- 2. Email integration columns
-- ────────────────────────────────────────────────────────────
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS email_provider      text DEFAULT 'brevo',
  ADD COLUMN IF NOT EXISTS email_api_key       text,
  ADD COLUMN IF NOT EXISTS email_sender_email  text,
  ADD COLUMN IF NOT EXISTS email_sender_name   text;

-- ────────────────────────────────────────────────────────────
-- 3. Maps integration columns
-- ────────────────────────────────────────────────────────────
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS maps_provider  text DEFAULT 'google_maps',
  ADD COLUMN IF NOT EXISTS maps_api_key   text;

-- ────────────────────────────────────────────────────────────
-- 4. Fuel cards integration columns
-- ────────────────────────────────────────────────────────────
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS fuel_card_provider   text,
  ADD COLUMN IF NOT EXISTS fuel_card_api_key    text,
  ADD COLUMN IF NOT EXISTS fuel_card_api_secret text;

-- ────────────────────────────────────────────────────────────
-- 5. Accounting integration columns
-- ────────────────────────────────────────────────────────────
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS accounting_provider  text,
  ADD COLUMN IF NOT EXISTS accounting_api_key   text,
  ADD COLUMN IF NOT EXISTS accounting_api_url   text;

-- ────────────────────────────────────────────────────────────
-- 6. Storage bucket: company-logos (public read, admin write)
-- ────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: any authenticated user can read logos
CREATE POLICY "company_logos_read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'company-logos');

-- Policy: only admins can upload/update logos
CREATE POLICY "company_logos_write"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-logos'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "company_logos_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-logos'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "company_logos_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-logos'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
