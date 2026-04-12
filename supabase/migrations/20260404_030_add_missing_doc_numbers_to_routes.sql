-- =============================================================================
-- Migration: 20260404_030_add_missing_doc_numbers_to_routes.sql
-- Description: Add missing document number fields to routes table to persist
--              generated document IDs.
-- =============================================================================

ALTER TABLE routes ADD COLUMN IF NOT EXISTS control_number text;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS adr_number text;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS packing_list_number text;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS route_sheet_number text;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS cleaning_cert_number text;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS national_waybill_number text;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS pod_number text;

-- Add comments for clarity
COMMENT ON COLUMN routes.control_number IS 'Nº del Documento de Control Administrativo generado.';
COMMENT ON COLUMN routes.adr_number IS 'Nº de la Carta de Porte ADR generada.';
COMMENT ON COLUMN routes.packing_list_number IS 'Nº del Packing List (listado de carga) generado.';
COMMENT ON COLUMN routes.route_sheet_number IS 'Nº de la Hoja de Ruta generada.';
COMMENT ON COLUMN routes.cleaning_cert_number IS 'Nº del Certificado de Limpieza generado.';
COMMENT ON COLUMN routes.national_waybill_number IS 'Nº de la Carta de Porte Nacional generada.';
COMMENT ON COLUMN routes.pod_number IS 'Nº del Certificado de Entrega (POD) generado.';
