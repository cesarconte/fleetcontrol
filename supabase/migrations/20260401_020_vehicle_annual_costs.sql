-- =============================================================================
-- Migration: 20260401_020_vehicle_annual_costs.sql
-- Description: Fixed costs per vehicle per fiscal year — PRD §4.9
-- =============================================================================

CREATE TABLE vehicle_annual_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id),
  fiscal_year integer NOT NULL CHECK (fiscal_year >= 2020 AND fiscal_year <= 2099),

  -- Insurance
  insurance_rc_eur numeric(12, 2) DEFAULT 0,
  insurance_cargo_eur numeric(12, 2) DEFAULT 0,
  insurance_all_risk_eur numeric(12, 2) DEFAULT 0,

  -- Taxes
  tax_vehicle_eur numeric(12, 2) DEFAULT 0,
  tax_trailer_eur numeric(12, 2) DEFAULT 0,

  -- Inspections & certifications
  inspection_itv_eur numeric(12, 2) DEFAULT 0,
  inspection_tachograph_eur numeric(12, 2) DEFAULT 0,
  inspection_adr_eur numeric(12, 2) DEFAULT 0,

  -- Depreciation
  depreciation_vehicle_eur numeric(12, 2) DEFAULT 0,
  depreciation_trailer_eur numeric(12, 2) DEFAULT 0,

  -- Transport card & permits
  transport_card_eur numeric(12, 2) DEFAULT 0,
  circulation_permit_eur numeric(12, 2) DEFAULT 0,

  -- Tires
  tires_vehicle_eur numeric(12, 2) DEFAULT 0,
  tires_trailer_eur numeric(12, 2) DEFAULT 0,

  -- Technology
  gps_telematics_eur numeric(12, 2) DEFAULT 0,
  communications_eur numeric(12, 2) DEFAULT 0,

  -- Storage
  parking_storage_eur numeric(12, 2) DEFAULT 0,

  -- Other
  other_fixed_costs_eur numeric(12, 2) DEFAULT 0,
  other_fixed_costs_desc text,

  -- Computed total
  total_fixed_cost_eur numeric(12, 2) GENERATED ALWAYS AS (
    COALESCE(insurance_rc_eur, 0) +
    COALESCE(insurance_cargo_eur, 0) +
    COALESCE(insurance_all_risk_eur, 0) +
    COALESCE(tax_vehicle_eur, 0) +
    COALESCE(tax_trailer_eur, 0) +
    COALESCE(inspection_itv_eur, 0) +
    COALESCE(inspection_tachograph_eur, 0) +
    COALESCE(inspection_adr_eur, 0) +
    COALESCE(depreciation_vehicle_eur, 0) +
    COALESCE(depreciation_trailer_eur, 0) +
    COALESCE(transport_card_eur, 0) +
    COALESCE(circulation_permit_eur, 0) +
    COALESCE(tires_vehicle_eur, 0) +
    COALESCE(tires_trailer_eur, 0) +
    COALESCE(gps_telematics_eur, 0) +
    COALESCE(communications_eur, 0) +
    COALESCE(parking_storage_eur, 0) +
    COALESCE(other_fixed_costs_eur, 0)
  ) STORED,

  -- Allocation basis
  planned_annual_km numeric(10, 2) DEFAULT 120000,
  available_days_per_year integer DEFAULT 340,

  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(vehicle_id, fiscal_year)
);

CREATE TRIGGER trg_vehicle_annual_costs_updated_at
  BEFORE UPDATE ON vehicle_annual_costs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_vac_year ON vehicle_annual_costs(fiscal_year);
CREATE INDEX idx_vac_vehicle ON vehicle_annual_costs(vehicle_id);

ALTER TABLE vehicle_annual_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicle_annual_costs_select" ON vehicle_annual_costs FOR SELECT TO authenticated USING (true);
CREATE POLICY vehicle_annual_costs_insert ON vehicle_annual_costs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY vehicle_annual_costs_update ON vehicle_annual_costs FOR UPDATE TO authenticated USING (true);
CREATE POLICY vehicle_annual_costs_delete ON vehicle_annual_costs FOR DELETE TO authenticated USING (true);

COMMENT ON TABLE vehicle_annual_costs IS 'Costes fijos anuales por vehículo — PRD §4.9 Informes económicos.';
