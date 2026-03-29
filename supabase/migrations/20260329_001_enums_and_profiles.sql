-- =============================================================================
-- Migration: 20260329_001_enums_and_profiles.sql
-- Description: Custom enums, trigger function, profiles table, company_settings
-- =============================================================================

-- ── Trigger Function ─────────────────────────────────────────────────────────
-- Updated automatically by triggers on every table with updated_at column.
-- SECURITY DEFINER with SET search_path = public (Supabase linter compliant).

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── Enum Types ───────────────────────────────────────────────────────────────

-- Vehicle status
CREATE TYPE vehicle_status AS ENUM (
  'activo',
  'en_ruta',
  'en_mantenimiento',
  'inactivo',
  'dado_de_baja'
);

-- Vehicle type
CREATE TYPE vehicle_type AS ENUM (
  'tractora',
  'vehiculo_rigido',
  'semirremolque',
  'remolque',
  'portacoches',
  'cisterna',
  'frigorifico',
  'basculante',
  'lona',
  'caja_cerrada',
  'especial'
);

-- Fuel type
CREATE TYPE fuel_type AS ENUM (
  'diesel',
  'gnc',
  'gnl',
  'hidrogeno',
  'electrico',
  'hibrido'
);

-- DGT environmental badge
CREATE TYPE dgt_badge AS ENUM (
  '0',
  'eco',
  'c',
  'b',
  'sin_etiqueta'
);

-- Euro emission standard
CREATE TYPE euro_standard AS ENUM (
  'euro_i',
  'euro_ii',
  'euro_iii',
  'euro_iv',
  'euro_v',
  'euro_vi',
  'euro_vi_d'
);

-- Transmission type
CREATE TYPE transmission_type AS ENUM (
  'manual',
  'automatica'
);

-- Driver status
CREATE TYPE driver_status AS ENUM (
  'activo',
  'baja_temporal',
  'baja_definitiva'
);

-- Route status
CREATE TYPE route_status AS ENUM (
  'planificada',
  'en_curso',
  'completada',
  'retrasada',
  'cancelada'
);

-- Maintenance type
CREATE TYPE maintenance_type AS ENUM (
  'preventivo',
  'correctivo'
);

-- Maintenance status
CREATE TYPE maintenance_status AS ENUM (
  'pendiente',
  'en_curso',
  'completada'
);

-- Cargo type
CREATE TYPE cargo_type AS ENUM (
  'general',
  'frigorifica',
  'peligrosa',
  'especial'
);

-- Alert type
CREATE TYPE alert_type AS ENUM (
  'documento_vehiculo_vencido',
  'documento_conductor_vencido',
  'limite_conduccion',
  'mantenimiento_pendiente',
  'consumo_anomalo',
  'vehiculo_detenido',
  'exceso_velocidad',
  'descarga_tacografo',
  'infraccion_conduccion'
);

-- Alert severity
CREATE TYPE alert_severity AS ENUM (
  'info',
  'warning',
  'critical'
);

-- Document status
CREATE TYPE document_status AS ENUM (
  'en_regla',
  'proximo_a_vencer',
  'critico',
  'vencido',
  'no_aplica'
);

-- User role
CREATE TYPE user_role AS ENUM (
  'administrador',
  'jefe_trafico',
  'agente_trafico',
  'tecnico_mantenimiento',
  'solo_lectura'
);

-- ── Profiles Table ───────────────────────────────────────────────────────────
-- Linked to auth.users via id. Stores app-specific profile data.

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'solo_lectura',
  phone text,
  avatar_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Company Settings Table ───────────────────────────────────────────────────
-- Singleton-style table for fleet company data.

CREATE TABLE company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  cif text NOT NULL,
  address text,
  city text,
  postal_code text,
  province text,
  country text NOT NULL DEFAULT 'España',
  transport_authorization_number text,
  logo_url text,
  email text,
  phone text,
  alert_days_vehicle_doc integer NOT NULL DEFAULT 30,
  alert_days_driver_doc integer NOT NULL DEFAULT 30,
  alert_days_maintenance_km integer NOT NULL DEFAULT 5000,
  alert_days_maintenance_days integer NOT NULL DEFAULT 30,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
