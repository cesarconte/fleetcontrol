-- =============================================================================
-- Migration: 20260331_018_vehicle_documents_storage.sql
-- Description: Supabase Storage bucket for vehicle document uploads
-- =============================================================================

-- Create bucket for vehicle documents (private, 10MB max, PDF/JPEG/PNG)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-documents',
  'vehicle-documents',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage.objects (vehicle documents bucket)
CREATE POLICY "vehicle_docs_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'vehicle-documents');

CREATE POLICY "vehicle_docs_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'vehicle-documents');

CREATE POLICY "vehicle_docs_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'vehicle-documents');
