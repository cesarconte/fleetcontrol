-- =============================================================================
-- Migration: 20260404_029_fix_transport_documents_schema.sql
-- Description: Fix generated_documents table and add missing templates
-- =============================================================================

-- 1. Add document_number to generated_documents
ALTER TABLE generated_documents ADD COLUMN IF NOT EXISTS document_number text;

-- 2. Set default for generated_by in generated_documents
ALTER TABLE generated_documents ALTER COLUMN generated_by SET DEFAULT auth.uid();

-- 3. Ensure all mandatory templates exist in document_templates
INSERT INTO document_templates (document_type, name, description, field_config) VALUES
  ('cmr', 'Carta de Porte CMR', 'Convenio CMR 1956 — transporte internacional', '{"layout": "cmr_standard"}'),
  ('carta_porte_nacional', 'Carta de Porte Nacional', 'Orden FOM/2861/2012 — transporte nacional de mercancías por carretera', '{"layout": "carta_porte_nacional_standard"}'),
  ('albaran', 'Albarán de Entrega', 'UNE 56100 — documento de entrega', '{"layout": "albaran_standard"}'),
  ('hoja_ruta', 'Hoja de Ruta', 'LOTT / RD 70/2019 — planificación de ruta', '{"layout": "hoja_ruta_standard"}'),
  ('factura', 'Factura de Transporte', 'RD 1619/2012 + Ley 18/2022', '{"layout": "factura_standard"}'),
  ('pod', 'Certificado de Entrega (POD)', 'LCTTM — proof of delivery', '{"layout": "pod_standard"}'),
  ('adr', 'Documento de Transporte ADR', 'ADR 2025 (5.4) + RD 97/2014', '{"layout": "adr_standard"}'),
  ('documento_control', 'Documento de Control Administrativo', 'Orden FOM/2861/2012 — obligatorio España', '{"layout": "control_standard"}'),
  ('cleaning_cert', 'Certificado de Limpieza', 'Certificado de limpieza de cisternas/frigoríficos', '{"layout": "cleaning_standard"}'),
  ('packing_list', 'Packing List / Listado de Carga', 'Detalle pormenorizado de la carga transportada', '{"layout": "packing_standard"}')
ON CONFLICT (document_type) 
DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 4. Add index for document_number
CREATE INDEX IF NOT EXISTS idx_generated_documents_number ON generated_documents(document_number);

COMMENT ON COLUMN generated_documents.document_number IS 'Número identificativo propio del documento (ej: CPN-2026-00001)';
