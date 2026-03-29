---
description: Workflow — Nueva Migración Supabase (SQL)
---

Genera una migración SQL para Supabase siguiendo las convenciones de FleetControl.
Las migraciones son inmutables: nunca se modifican una vez aplicadas.

---

## Paso 1 — Definir la operación DDL

- ¿Es una tabla nueva o una modificación de tabla existente?
- ¿Qué columnas se necesitan?
- ¿Hay relaciones con otras tablas (foreign keys)?
- ¿Qué índices se necesitan?
- ¿Necesita RLS policies?
- ¿Necesita funciones o triggers?

---

## Paso 2 — Naming conventions (obligatorio)

```sql
-- Tablas: snake_case, plural
vehicles, drivers, maintenance_records, cargo_records

-- Columnas: snake_case
plate_number, created_at, expires_at, is_active

-- Foreign keys: {table}_id
vehicle_id, driver_id, route_id

-- Índices: idx_{table}_{columns}
idx_vehicles_plate_number, idx_drivers_nif

-- Funciones: snake_case
get_active_drivers, calculate_route_cost
```

---

## Paso 3 — Escribir la migración

Archivo: `supabase/migrations/YYYYMMDD_description.sql`

```sql
-- ========================================
-- Tabla: [nombre_tabla]
-- Descripción: [qué hace esta tabla]
-- ========================================

CREATE TABLE IF NOT EXISTS [nombre_tabla] (
  -- Columnas obligatorias (todas las tablas)
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),

  -- Columnas de negocio
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  -- ... más columnas

  -- Restricciones
  CONSTRAINT [tabla]_status_check CHECK (status IN ('active', 'inactive', 'archived'))
);

-- Índices
CREATE INDEX idx_[tabla]_[columna] ON [tabla]([columna]);
CREATE INDEX idx_[tabla]_created_at ON [tabla](created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER [tabla]_updated_at
  BEFORE UPDATE ON [tabla]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE [tabla] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "[tabla]_select" ON [tabla]
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "[tabla]_insert" ON [tabla]
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "[tabla]_update" ON [tabla]
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "[tabla]_delete" ON [tabla]
  FOR DELETE USING (created_by = auth.uid());
```

---

## Paso 4 — Tipos correctos (obligatorio)

```sql
-- Money: NUNCA float o real
price numeric(12,2),
cost_total numeric(12,2),

-- GPS coordinates
latitude numeric(10,7),
longitude numeric(10,7),

-- Enums: usar CREATE TYPE
CREATE TYPE document_status AS ENUM ('valid', 'expiring', 'expired', 'not_applicable');

-- UUIDs
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

-- Timestamps: siempre timestamptz
created_at timestamptz NOT NULL DEFAULT now(),

-- JSONB: solo datos no estructurados
metadata jsonb DEFAULT '{}'::jsonb,

-- Booleanos: prefijo is_
is_active boolean NOT NULL DEFAULT true,
```

---

## Paso 5 — Verificar con Supabase

Aplicar la migración:
```
supabase_apply_migration name: "[tabla]_create" query: "[SQL completo]"
```

Verificar:
```
supabase_list_tables schemas: ["public"] verbose: true
supabase_get_advisors type: "security"
supabase_get_advisors type: "performance"
```

---

## Paso 6 — Tests de la migración

```sql
-- Verificar que la tabla existe
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = '[tabla]'
);

-- Verificar que RLS está habilitado
SELECT relrowsecurity FROM pg_class WHERE relname = '[tabla]';

-- Verificar que las policies existen
SELECT * FROM pg_policies WHERE tablename = '[tabla]';

-- Verificar que los índices existen
SELECT indexname FROM pg_indexes WHERE tablename = '[tabla]';
```

---

## Entrega

1. `supabase/migrations/YYYYMMDD_[description].sql` — migración completa
2. Verificación de que se aplicó correctamente
3. Si es tabla nueva: crear servicio API (usar workflow wf-new-service.md)
