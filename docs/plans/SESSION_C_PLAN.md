# Plan Sesión C — Mejoras Adicionales

> **Fecha:** 2026-04-02
> **Branch:** feature/sesion-c-mejoras (desde `dev`)
> **Migraciones:** 1 (027)
> **Estimación:** ~17 archivos, ~40-50 tests nuevos

---

## 1. Objetivo

Completar el Plan Pendiente del módulo de Configuración con:

1. **Task 9** — Limpieza de integraciones (eliminar "Otro" de GPS, Combustible, Contabilidad)
2. **Task 10** — Sistema de Documentos de Transporte (catálogo + generación PDF con auto-rellenado por ID de ruta/carga)

---

## 2. Bloque 1: Task 9 — Limpieza Integraciones

### 9a. Eliminar "Otro" de Zod schemas

**Archivo:** `src/validations/settings-schema.js`

- Eliminar `'otro'` de `GPS_PROVIDERS` (línea 38)
- Eliminar `'otro'` de `FUEL_CARD_PROVIDERS` (línea 41)
- Eliminar `'otro'` de `ACCOUNTING_PROVIDERS` (línea 42)
- Resultado:
  - `GPS_PROVIDERS = ['webfleet', 'frotcom', 'geotab', '']`
  - `FUEL_CARD_PROVIDERS = ['dkv', 'wabco', '']`
  - `ACCOUNTING_PROVIDERS = ['sage', 'a3', 'holded', '']`

### 9b. Eliminar "Otro" de IntegrationsForm.vue

**Archivo:** `src/components/settings/IntegrationsForm.vue`

- Quitar `<VListItem>` con value `'otro'` de los 3 paneles:
  - Panel GPS
  - Panel Combustible
  - Panel Contabilidad

### 9c. Tests

**Archivo:** `src/validations/settings-schema.spec.js`

- Verificar que los schemas rechazan `'otro'` como valor de provider
- Tests existentes deben seguir pasando (refactor, no cambio funcional)

---

## 3. Bloque 2: Task 10 — Documentos de Transporte

### 3.1 Visión General

Sistema que permite:

1. Definir un catálogo de tipos de documento de transporte
2. Generar PDFs reales auto-rellenados introduciendo el ID de una ruta o carga
3. Almacenar y descargar documentos generados

### 3.2 Data Sources para Auto-rellenado

| Campo del documento       | Tabla origen       | Columnas clave                                                                                                      |
| ------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Remitente / Transportista | `company_settings` | `company_name`, `cif`, `address`, `city`, `postal_code`, `transport_authorization_number`                           |
| Destinatario              | `cargo_records`    | `cmr_recipient`, `cmr_delivery_place`                                                                               |
| Vehículo                  | `vehicles`         | `plate`, `brand`, `model`, `vehicle_type`, `mma_kg`                                                                 |
| Conductor                 | `drivers`          | `full_name`, `national_id`, `license_number`                                                                        |
| Ruta                      | `routes`           | `origin_city`, `origin_province`, `destination_city`, `destination_province`, `departure_date`, `distance_total_km` |
| Carga                     | `cargo_records`    | `description`, `cargo_type`, `weight_kg`, `volume_m3`, `adr_class`, `adr_un_number`                                 |
| Datos fiscales            | `routes`           | `client_name`, `client_tax_id`, `invoice_number`, `invoice_date`                                                    |

### 3.3 Migración 027

**Archivo:** `supabase/migrations/20260402_027_transport_documents.sql`

#### Tabla `document_templates`

```sql
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
```

#### Tabla `generated_documents`

```sql
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
```

#### RLS + Políticas

- RLS habilitado en ambas tablas
- `document_templates`: admin CRUD, authenticated SELECT (solo activos)
- `generated_documents`: authenticated SELECT, owner DELETE
- Storage bucket `transport-documents` con políticas

#### Seed

6 templates por defecto (uno por tipo): CMR, Albarán, Hoja de Ruta, Factura, POD, ADR

#### Índices

```sql
CREATE INDEX idx_document_templates_type ON document_templates(document_type);
CREATE INDEX idx_generated_documents_route ON generated_documents(route_id);
CREATE INDEX idx_generated_documents_cargo ON generated_documents(cargo_id);
CREATE INDEX idx_generated_documents_type ON generated_documents(document_type);
```

### 3.4 Constantes — `transport-document-types.js`

**Archivo:** `src/constants/transport-document-types.js`

Define 6 tipos con su estructura de campos:

- **CMR** — Carta de Porte CMR (Convenio CMR 1956, arts. 5-6)
  - 19 campos mapeados desde company, cargo, vehicle, driver, route
- **ALBARAN** — Albarán de Entrega (UNE 56100)
  - Campos: cliente, dirección entrega, artículos, firma
- **HOJA_RUTA** — Hoja de Ruta (LOTT / RD 70/2019)
  - Campos: vehículo, conductor, paradas, horarios, instrucciones
- **FACTURA** — Factura de Transporte (RD 1619/2012 + Ley 18/2022)
  - Campos: datos fiscales, ruta, precio, IVA, total
- **POD** — Certificado de Entrega (LCTTM)
  - Campos: receptor, fecha/hora entrega, firma, observaciones
- **ADR** — Documento de Transporte ADR (ADR 2025 5.4 + RD 97/2014)
  - Campos: clase ADR, Nº ONU, embalaje, etiquetas, conductor ADR

**Tests:** `src/constants/transport-document-types.spec.js` (~15 tests)

### 3.5 Schema Zod — `transport-document-schema.js`

**Archivo:** `src/validations/transport-document-schema.js`

```js
// Validar tipo de documento al generar
export const generateDocumentSchema = z.object({
  document_type: z.enum(TRANSPORT_DOCUMENT_TYPE_VALUES),
  route_id: z.string().uuid('ID de ruta inválido'),
  cargo_id: z.string().uuid('ID de carga inválido').optional(),
})

// Validar template al crear/editar
export const documentTemplateSchema = z.object({
  document_type: z.enum(TRANSPORT_DOCUMENT_TYPE_VALUES),
  name: z.string().min(1, 'El nombre es obligatorio').max(200),
  description: z.string().max(500).optional().or(z.literal('')),
  field_config: z.record(z.string(), z.any()).default({}),
  is_active: z.boolean().default(true),
})
```

**Tests:** `src/validations/transport-document-schema.spec.js` (~10 tests)

### 3.6 Servicio API — `api-document-templates.js`

**Archivo:** `src/services/api-document-templates.js`

- CRUD heredado de `createCrudService('document_templates')`
- Métodos extra:
  - `getActiveTemplates()` — SELECT activos, order por document_type
  - `getByType(documentType)` — SELECT por tipo, maybeSingle
  - `toggleActive(id, isActive)` — Update is_active

**Sub-servicio `apiGeneratedDocuments`:**

- `getByRoute(routeId)` — documentos generados para una ruta
- `delete(id)` — elimina registro + archivo en Storage

**Tests:** `src/services/api-document-templates.spec.js` (~8 tests)

### 3.7 Servicio Generador — `document-generator.js`

**Archivo:** `src/services/document-generator.js`

Función principal `generateDocument({ documentType, routeId, cargoId })`:

1. Fetch route por `routeId` → obtener `vehicle_id`, `driver_id`
2. Fetch vehicle, driver, company_settings en paralelo (`Promise.all`)
3. Fetch cargo (por `cargoId` o `getByRoute(routeId)`)
4. Auto-rellenar campos según mapping en `transport-document-types.js`
5. Generar PDF con jsPDF según layout del tipo de documento
6. Subir a Storage bucket `transport-documents`
7. Insertar registro en `generated_documents`
8. Retornar `{ url, documentId, filename }`

Funciones de layout por tipo:

- `renderCmrPdf(doc, data)` — Layout CMR estándar (cabecera empresa, tabla mercancías, firma)
- `renderAlbaranPdf(doc, data)` — Layout albarán con tabla artículos y firma recepción
- Las demás (Hoja de Ruta, Factura, POD, ADR) como stubs con layout genérico de tabla

Reutiliza `jsPDF` + `jspdf-autotable` (ya instalados).

**Tests:** `src/services/document-generator.spec.js` (~12 tests)

### 3.8 Composable — `use-document-templates.js`

**Archivo:** `src/composables/use-document-templates.js`

```js
export function useDocumentTemplates() {
  const templates = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const isGenerating = ref(false)
  const generateError = ref(null)

  async function fetchTemplates() { ... }
  async function toggleTemplate(id, isActive) { ... }
  async function generateDocument({ documentType, routeId, cargoId }) { ... }
  async function deleteGeneratedDocument(id) { ... }

  return {
    templates, isLoading, error,
    isGenerating, generateError,
    fetchTemplates, toggleTemplate, generateDocument, deleteGeneratedDocument,
  }
}
```

**Tests:** `src/composables/use-document-templates.spec.js` (~12 tests)

### 3.9 Componentes UI

#### `DocumentTemplatesForm.vue`

**Archivo:** `src/components/settings/DocumentTemplatesForm.vue`

- Lista los 6 tipos de documento
- Chip de estado (activo/inactivo) por cada uno
- Toggle para activar/desactivar
- Expansion panel con campos de cada tipo
- Read-only para no-admins

#### `GenerateDocumentDialog.vue`

**Archivo:** `src/components/documents/GenerateDocumentDialog.vue`

- `VDialog` max-width="600"
- Selector de tipo de documento (solo activos, `VSelect`)
- Selector de ruta (`VAutocomplete` con búsqueda)
- Selector de carga opcional (si la ruta tiene cargas)
- Preview de datos auto-rellenados (read-only, tabla de pares campo-valor)
- Botón "Generar PDF" → genera y descarga
- Loading state en botón
- Error handling con toast

### 3.10 Integraciones

#### `SettingsPage.vue`

**Archivo:** `src/pages/SettingsPage.vue`

- Nueva pestaña 5: "Documentos" (value: `documentos`, icon: `mdi-file-document-outline`)
- RBAC: admin = edit, otros = view
- Renderiza `DocumentTemplatesForm.vue`

#### Página detalle de ruta

- Botón "Generar documento" en la cabecera o acciones
- Abre `GenerateDocumentDialog.vue` con `route_id` pre-rellenado

#### Página de cargas

- Botón "Generar documento" por cada carga
- Abre `GenerateDocumentDialog.vue` con `route_id` + `cargo_id` pre-rellenados

---

## 4. Orden de Implementación (TDD)

| Paso | Tarea                                      | Tipo         | Tests            |
| ---- | ------------------------------------------ | ------------ | ---------------- |
| 1    | 9a+9b: Eliminar "Otro" de schemas + form   | Refactor     | Existentes pasan |
| 2    | 10a: `transport-document-types.js` + spec  | Constantes   | ~15              |
| 3    | 10b: Migración 027 (SQL)                   | BD           | —                |
| 4    | 10c: `transport-document-schema.js` + spec | Validación   | ~10              |
| 5    | 10d: `api-document-templates.js` + spec    | Servicio     | ~8               |
| 6    | 10e: `document-generator.js` + spec        | Servicio     | ~12              |
| 7    | 10f: `use-document-templates.js` + spec    | Composable   | ~12              |
| 8    | 10g: `DocumentTemplatesForm.vue`           | Componente   | —                |
| 9    | 10h: `GenerateDocumentDialog.vue`          | Componente   | —                |
| 10   | 10i: `SettingsPage.vue` — nueva pestaña    | Página       | —                |
| 11   | 10j: Botones en rutas/cargas               | Integración  | —                |
| 12   | `npm run check` + `npm test`               | Verificación | —                |

---

## 5. Archivos

### Nuevos (13)

| Archivo                                                    | Tipo       |
| ---------------------------------------------------------- | ---------- |
| `src/constants/transport-document-types.js`                | Constantes |
| `src/constants/transport-document-types.spec.js`           | Tests      |
| `supabase/migrations/20260402_027_transport_documents.sql` | Migración  |
| `src/validations/transport-document-schema.js`             | Validación |
| `src/validations/transport-document-schema.spec.js`        | Tests      |
| `src/services/api-document-templates.js`                   | Servicio   |
| `src/services/api-document-templates.spec.js`              | Tests      |
| `src/services/document-generator.js`                       | Servicio   |
| `src/services/document-generator.spec.js`                  | Tests      |
| `src/composables/use-document-templates.js`                | Composable |
| `src/composables/use-document-templates.spec.js`           | Tests      |
| `src/components/settings/DocumentTemplatesForm.vue`        | Componente |
| `src/components/documents/GenerateDocumentDialog.vue`      | Componente |

### Modificados (4)

| Archivo                                        | Cambio                                     |
| ---------------------------------------------- | ------------------------------------------ |
| `src/validations/settings-schema.js`           | Eliminar `'otro'` de 3 arrays de providers |
| `src/validations/settings-schema.spec.js`      | Tests actualizados                         |
| `src/components/settings/IntegrationsForm.vue` | Eliminar items "Otro" de 3 VSelect         |
| `src/pages/SettingsPage.vue`                   | Nueva pestaña "Documentos"                 |

---

## 6. Definition of Done

- [ ] TDD completado (RED → GREEN → REFACTOR) para cada paso
- [ ] "Otro" eliminado de GPS, Combustible, Contabilidad (schemas + UI)
- [ ] Migración 027 aplicada en Supabase (tablas + RLS + bucket + seed)
- [ ] 6 tipos de documento definidos en constantes
- [ ] Generación PDF funcional para CMR y Albarán (auto-rellenado por ruta ID)
- [ ] Stubs con layout genérico para Hoja de Ruta, Factura, POD, ADR
- [ ] Pestaña "Documentos" en Configuración (solo admin edita)
- [ ] Botón "Generar documento" funcional desde detalle de ruta
- [ ] Todos los tests pasan (`npm test`)
- [ ] Lint + typecheck limpios (`npm run check`)
- [ ] ~40-50 tests nuevos
- [ ] AI_CONTEXT.md actualizado con progreso

---

## 7. Roadmap Futuro v2+ (NO implementar en esta sesión)

### Capa 2 — Generación asistida por IA

- Integración con LLM (OpenAI/Claude API) para rellenado contextual
- El LLM analiza datos de la ruta y genera texto libre para campos abiertos
- Útil para: condiciones de transporte en CMR, observaciones, instrucciones especiales

### Capa 3 — Chat para generación de documentos

- Interfaz conversacional: _"Genera un CMR para la carga de la ruta R-2024-0156"_
- El chat interpreta la petición, busca la ruta/carga, genera el documento automáticamente
- Requiere: Capa 2 + sistema de chat + manejo de contexto conversacional
