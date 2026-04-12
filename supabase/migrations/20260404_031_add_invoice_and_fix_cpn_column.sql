-- =============================================================================
-- Migration: 20260404_031_add_invoice_and_fix_cpn_column.sql
-- Description: Add missing invoice_number and rename waybill to cpn_number
-- =============================================================================

-- 1. Add invoice_number to routes
ALTER TABLE routes ADD COLUMN IF NOT EXISTS invoice_number text;

-- 2. Rename national_waybill_number to cpn_number for consistency with UI
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'national_waybill_number') THEN
        ALTER TABLE routes RENAME COLUMN national_waybill_number TO cpn_number;
    ELSE
        ALTER TABLE routes ADD COLUMN IF NOT EXISTS cpn_number text;
    END IF;
END $$;

-- 3. Add comments
COMMENT ON COLUMN routes.invoice_number IS 'Nº de la Factura de Transporte generada.';
COMMENT ON COLUMN routes.cpn_number IS 'Nº de la Carta de Porte Nacional generada.';

-- 4. Create indexes for quick search
CREATE INDEX IF NOT EXISTS idx_routes_invoice_number ON routes(invoice_number);
CREATE INDEX IF NOT EXISTS idx_routes_cpn_number ON routes(cpn_number);
