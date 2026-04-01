-- =============================================================================
-- Migration: 20260401_021_driver_compensation.sql
-- Description: Monthly driver compensation records — PRD §4.9
-- =============================================================================

CREATE TABLE driver_compensation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES drivers(id),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  fiscal_year integer NOT NULL CHECK (fiscal_year >= 2020 AND fiscal_year <= 2099),

  -- Base salary
  base_salary_eur numeric(12, 2) NOT NULL,
  collective_agreement_eur numeric(12, 2) DEFAULT 0,
  seniority_bonus_eur numeric(12, 2) DEFAULT 0,
  hazard_bonus_eur numeric(12, 2) DEFAULT 0,
  overtime_pay_eur numeric(12, 2) DEFAULT 0,

  -- Variable compensation (actual per month)
  daily_allowance_eur numeric(12, 2) DEFAULT 0,
  lodging_eur numeric(12, 2) DEFAULT 0,

  -- Benefits (monthly portion of annual)
  extra_pay_eur numeric(12, 2) DEFAULT 0,
  group_insurance_eur numeric(12, 2) DEFAULT 0,
  training_cap_eur numeric(12, 2) DEFAULT 0,
  work_clothing_eur numeric(12, 2) DEFAULT 0,

  -- Employer charges
  social_security_employer_eur numeric(12, 2) NOT NULL,

  -- Computed: gross salary
  gross_salary_eur numeric(12, 2) GENERATED ALWAYS AS (
    COALESCE(base_salary_eur, 0) +
    COALESCE(collective_agreement_eur, 0) +
    COALESCE(seniority_bonus_eur, 0) +
    COALESCE(hazard_bonus_eur, 0) +
    COALESCE(overtime_pay_eur, 0) +
    COALESCE(extra_pay_eur, 0)
  ) STORED,

  -- Computed: total cost to company
  total_company_cost_eur numeric(12, 2) GENERATED ALWAYS AS (
    COALESCE(base_salary_eur, 0) +
    COALESCE(collective_agreement_eur, 0) +
    COALESCE(seniority_bonus_eur, 0) +
    COALESCE(hazard_bonus_eur, 0) +
    COALESCE(overtime_pay_eur, 0) +
    COALESCE(daily_allowance_eur, 0) +
    COALESCE(lodging_eur, 0) +
    COALESCE(extra_pay_eur, 0) +
    COALESCE(group_insurance_eur, 0) +
    COALESCE(training_cap_eur, 0) +
    COALESCE(work_clothing_eur, 0) +
    COALESCE(social_security_employer_eur, 0)
  ) STORED,

  -- Hours worked (for allocation to routes)
  driving_hours_month numeric(6, 2),
  completed_routes_month integer,

  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(driver_id, month, fiscal_year)
);

CREATE TRIGGER trg_driver_compensation_updated_at
  BEFORE UPDATE ON driver_compensation
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_dc_period ON driver_compensation(fiscal_year, month);
CREATE INDEX idx_dc_driver ON driver_compensation(driver_id);

ALTER TABLE driver_compensation ENABLE ROW LEVEL SECURITY;
CREATE POLICY driver_compensation_select ON driver_compensation FOR SELECT TO authenticated USING (true);
CREATE POLICY driver_compensation_insert ON driver_compensation FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY driver_compensation_update ON driver_compensation FOR UPDATE TO authenticated USING (true);
CREATE POLICY driver_compensation_delete ON driver_compensation FOR DELETE TO authenticated USING (true);

COMMENT ON TABLE driver_compensation IS 'Compensación mensual por conductor — PRD §4.9 Informes económicos.';
