-- =============================================================================
-- Migration: 20260402_027_transport_documents.sql
-- Description: Document templates + generated documents + storage bucket
--              PRD §4.9 — Documentación de Transporte
-- =============================================================================

-- ── document_templates ──────────────────────────────────────────────────────

CREATE TABLE document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type text NOT NULL,
  name text NOT NULL,
  description text,
  field_config jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(document_type)
);

CREATE TRIGGER trg_document_templates_updated_at
  BEFORE UPDATE ON document_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE document_templates IS 'Plantillas de documentos de transporte — PRD §4.9';

-- ── generated_documents ─────────────────────────────────────────────────────

CREATE TABLE generated_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES document_templates(id),
  route_id uuid REFERENCES routes(id),
  cargo_id uuid REFERENCES cargo_records(id),
  document_type text NOT NULL,
  file_url text,
  filename text,
  generated_by uuid NOT NULL REFERENCES auth.users(id),
  generated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE generated_documents IS 'Documentos de transporte generados — PRD §4.9';

-- ── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX idx_document_templates_type ON document_templates(document_type);
CREATE INDEX idx_generated_documents_route ON generated_documents(route_id);
CREATE INDEX idx_generated_documents_cargo ON generated_documents(cargo_id);
CREATE INDEX idx_generated_documents_type ON generated_documents(document_type);

-- ── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

-- document_templates: all authenticated can SELECT active templates
CREATE POLICY document_templates_select ON public.document_templates
  FOR SELECT TO authenticated USING (is_active = true);

-- document_templates: admin can INSERT/UPDATE/DELETE
CREATE POLICY document_templates_insert ON public.document_templates
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY document_templates_update ON public.document_templates
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by);

-- generated_documents: all authenticated can SELECT
CREATE POLICY generated_documents_select ON public.generated_documents
  FOR SELECT TO authenticated USING (true);

-- generated_documents: authenticated INSERT
CREATE POLICY generated_documents_insert ON public.generated_documents
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = generated_by);

-- generated_documents: owner can DELETE
CREATE POLICY generated_documents_delete ON public.generated_documents
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = generated_by);

-- ── Storage bucket ──────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'transport-documents',
  'transport-documents',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "transport_docs_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'transport-documents');

CREATE POLICY "transport_docs_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'transport-documents');

CREATE POLICY "transport_docs_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'transport-documents');

-- ── Seed: default templates ─────────────────────────────────────────────────

INSERT INTO document_templates (document_type, name, description, field_config) VALUES
  ('cmr', 'Carta de Porte CMR', 'Convenio CMR 1956 — transporte internacional', '{"layout": "cmr_standard"}'),
  ('albaran', 'Albarán de Entrega', 'UNE 56100 — documento de entrega', '{"layout": "albaran_standard"}'),
  ('hoja_ruta', 'Hoja de Ruta', 'LOTT / RD 70/2019 — planificación de ruta', '{"layout": "hoja_ruta_standard"}'),
  ('factura', 'Factura de Transporte', 'RD 1619/2012 + Ley 18/2022', '{"layout": "factura_standard"}'),
  ('pod', 'Certificado de Entrega (POD)', 'LCTTM — proof of delivery', '{"layout": "pod_standard"}'),
  ('adr', 'Documento de Transporte ADR', 'ADR 2025 (5.4) + RD 97/2014', '{"layout": "adr_standard"}')
ON CONFLICT (document_type) DO NOTHING;
