-- =============================================================================
-- Migration: 20260404_028_add_carta_porte_nacional_template.sql
-- Description: Add Carta de Porte Nacional to document_templates seed data
-- =============================================================================

INSERT INTO document_templates (document_type, name, description, field_config) VALUES
  ('carta_porte_nacional', 'Carta de Porte Nacional', 'Orden FOM/2861/2012 — transporte nacional de mercancías por carretera', '{"layout": "carta_porte_nacional_standard"}')
ON CONFLICT (document_type) DO NOTHING;
