-- =============================================================================
-- Migration: 20260330_014_driver_storage.sql
-- Description: Supabase Storage bucket for driver document uploads
-- =============================================================================

-- Create bucket for driver documents (private, 10MB max, PDF/JPEG/PNG)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos-conductores',
  'documentos-conductores',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage.objects (driver documents bucket)
CREATE POLICY "Usuarios autenticados pueden ver documentos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documentos-conductores');

CREATE POLICY "Usuarios autenticados pueden subir documentos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documentos-conductores');

CREATE POLICY "Usuarios autenticados pueden eliminar documentos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documentos-conductores');

COMMENT ON POLICY "Usuarios autenticados pueden ver documentos" ON storage.objects
  IS 'Acceso lectura a documentos de conductores — RGPD art. 6.1.c';

COMMENT ON POLICY "Usuarios autenticados pueden subir documentos" ON storage.objects
  IS 'Subida de escaneos de carnets, CAP, ADR, etc.';
