# Plan — feature/documentos-centralizados: Página Documentos

## Resumen

Implementación de la página centralizada de **Documentos** (`/documentacion`) para FleetControl. Esta página actuará como **centro de mando documental** de toda la flota, integrando dos modos de uso complementarios:

1. **Gestión y Control**: Vista global de TODA la documentación de la flota (vehículos + conductores + transporte generado), con dashboard de vencimientos, filtros, búsqueda, KPIs y acciones.
2. **Generación de Documentos de Transporte**: Acceso centralizado a la generación automática de documentos de transporte (CMR, Carta de Porte Nacional, Albarán, Hoja de Ruta, Factura, POD, ADR) con autocompletado de campos desde la BD.

**Estado actual:** Infraestructura base implementada (servicio API, composable, constantes, export CSV, componentes chip/badge). Pendientes: DocumentFilterBar, DocumentActionsDialog, tablas por tipo, y página completa.

**Base legal:**

| Documento               | Base Legal                       | Obligatorio                |
| ----------------------- | -------------------------------- | -------------------------- |
| ITV vehículo            | RD 2042/1994                     | Sí (anual >3.5t)           |
| Seguro RC               | RDL 8/2004 + Ley 5/2025          | Sí                         |
| Tarjeta de Transporte   | LOTT — Ley 16/1987               | Sí (5 años)                |
| CAP conductor           | RD 1032/2007 / Dir. 2003/59/CE   | Sí (35h/5 años)            |
| Tarjeta tacógrafo       | Reg. UE 165/2014                 | Sí (5 años)                |
| Carta de Porte Nacional | Ley 15/2009 (LCTTM), arts. 10-12 | Sí (>€150 con porteador)   |
| CMR                     | Convenio CMR 1956, arts. 5-6     | Sí (internacional)         |
| Albarán                 | Práctica comercial + UNE 56100   | Sí (práctica)              |
| ADR                     | ADR 2025 + RD 97/2014            | Sí (mercancías peligrosas) |

---

## Arquitectura del Módulo

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DocumentsListPage.vue (página principal)                                │
│  ├── KPI Cards (total, vigentes, próximos, críticos, vencidos, % comp.) │
│  ├── Barra global: búsqueda + filtros + botón "Generar documento"       │
│  ├── VTabs: Vehículos | Conductores | Transporte Generado               │
│  │   ├── Tab Vehículos: VDataTableServer paginada                        │
│  │   ├── Tab Conductores: VDataTableServer paginada                      │
│  │   └── Tab Transporte: VDataTableServer + botón generar               │
│  ├── DocumentFilterBar.vue (filtros por tipo, estado, entidad, fechas)  │
│  ├── GenerateDocumentDialog.vue (REUTILIZADO — ya existe)               │
│  └── DocumentActionsDialog.vue (upload/edit/ver detalle)                 │
├─────────────────────────────────────────────────────────────────────────┤
│  useDocumentManagement.js (composable centralizado)                      │
│  ├── fetchVehicleDocuments(filters) → paginación server-side            │
│  ├── fetchDriverDocuments(filters) → paginación server-side             │
│  ├── fetchGeneratedDocuments(filters) → paginación server-side          │
│  ├── fetchKpis() → resumen cross-entidad                                │
│  ├── searchDocuments(query) → búsqueda global                           │
│  └── reactive state: kpis, activeTab, filters, isLoading, error         │
├─────────────────────────────────────────────────────────────────────────┤
│  api-documents.js (servicio centralizado)                                │
│  ├── getVehicleDocumentsPaginated({ page, pageSize, filters, sort })    │
│  ├── getDriverDocumentsPaginated({ page, pageSize, filters, sort })     │
│  ├── getGeneratedDocumentsPaginated({ page, pageSize, filters, sort })  │
│  ├── getDocumentsByStatus(status)                                       │
│  ├── getExpiringDocuments(days)                                         │
│  ├── getExpiredDocuments()                                              │
│  ├── getDocumentKpis()                                                  │
│  └── searchDocuments(query)                                             │
├─────────────────────────────────────────────────────────────────────────┤
│  Componentes reutilizables                                               │
│  ├── DocumentStatusChip.vue (chip con color + icono + label)            │
│  ├── DocumentExpiryBadge.vue (badge con días restantes)                 │
│  └── DocumentFilterBar.vue (filtros + búsqueda)                         │
├─────────────────────────────────────────────────────────────────────────┤
│  Infraestructura existente (REUTILIZAR, NO reescribir)                   │
│  ├── useDocumentTemplates.js → generación PDF                           │
│  ├── document-generator.js → orquestador generadores                    │
│  ├── document-cmr.js, document-albaran.js, etc. → 6 generadores PDF     │
│  ├── GenerateDocumentDialog.vue → UI de generación (ya funciona)        │
│  ├── api-vehicle-documents.js → CRUD por vehículo                       │
│  ├── api-document-templates.js → CRUD templates + generated_docs        │
│  ├── useVehicleDocuments → composable por vehículo                      │
│  └── useDriverDocuments → composable por conductor                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Estado Actual del Código Existente

### Lo que YA funciona

| Componente                         | Estado  | Notas                                                |
| ---------------------------------- | ------- | ---------------------------------------------------- |
| `vehicle-document-types.js`        | ✅      | 8 tipos con periodicidad, base legal                 |
| `driver-document-types.js`         | ✅      | 7 tipos con categorías                               |
| `transport-document-types.js`      | ✅      | 7 tipos con campos, base legal                       |
| `document-generator.js`            | ✅      | Orquestador con 6 generadores especializados         |
| `document-cmr.js`                  | ✅      | Generador PDF CMR con autocompletado BD              |
| `document-carta-porte-nacional.js` | ✅      | Generador PDF Carta de Porte Nacional (10 secciones) |
| `document-albaran.js`              | ✅      | Generador PDF Albarán                                |
| `document-hoja-ruta.js`            | ✅      | Generador PDF Hoja de Ruta                           |
| `document-factura.js`              | ✅      | Generador PDF Factura                                |
| `document-pod.js`                  | ✅      | Generador PDF Certificado de Entrega                 |
| `GenerateDocumentDialog.vue`       | ✅      | Selector tipo + ruta + carga, genera PDF auto        |
| `useDocumentTemplates.js`          | ✅      | Composable generación + templates                    |
| `api-vehicle-documents.js`         | ✅      | CRUD vehicle_documents                               |
| `api-document-templates.js`        | ✅      | CRUD templates + generated_documents                 |
| `useVehicleDocuments`              | ✅      | Composable por vehículo                              |
| `useDriverDocuments`               | ✅      | Composable por conductor                             |
| `VehicleDocuments.vue`             | ✅      | CRUD docs en ficha vehículo                          |
| `DriverDocumentUploader.vue`       | ✅      | Upload docs en ficha conductor                       |
| `DocumentsListPage.vue`            | ⚠️ Stub | 12 líneas, "Página en construcción"                  |
| Migraciones 009, 027               | ✅      | Tablas + RLS + buckets Storage                       |

### Lo que FALTA

| Requisito                                                | Estado | Acción                                   |
| -------------------------------------------------------- | ------ | ---------------------------------------- |
| Vista global de documentos de TODA la flota              | ❌     | Crear servicio + composable centralizado |
| KPIs documentales cross-entidad                          | ❌     | Crear función getDocumentKpis()          |
| Tabla paginada server-side de documentos vehículo        | ❌     | Nueva consulta con JOIN vehicles         |
| Tabla paginada server-side de documentos conductor       | ❌     | Nueva consulta con JOIN drivers          |
| Tabla de documentos de transporte generados              | ❌     | Nueva consulta generated_documents       |
| Filtros por tipo, estado, entidad, fechas                | ❌     | Crear DocumentFilterBar.vue              |
| Búsqueda global (matrícula, nombre, referencia)          | ❌     | searchDocuments()                        |
| Navegación a entidad desde documento                     | ❌     | Links en tabla                           |
| Botón "Generar documento" desde página Documentos        | ❌     | Integrar GenerateDocumentDialog          |
| Vista de vencimientos priorizada                         | ❌     | Filtro especial + ordenación             |
| Exportar listado a CSV/Excel                             | ❌     | Función de export                        |
| Componentes UI reutilizables (status chip, expiry badge) | ❌     | Crear componentes                        |

---

## Funcionalidades Detalladas

### 1. Dashboard KPI (siempre visible, arriba de la página)

| KPI                   | Cálculo                                            | Color                                               | Icono                      |
| --------------------- | -------------------------------------------------- | --------------------------------------------------- | -------------------------- |
| **Total documentos**  | COUNT(vehicle_documents) + COUNT(driver_documents) | primary                                             | mdi-file-document-multiple |
| **En regla**          | status = 'valid' (vence > 30 días)                 | success                                             | mdi-check-circle           |
| **Próximos a vencer** | status = 'expiring_soon' (≤ 30 días)               | warning                                             | mdi-clock-alert            |
| **Críticos**          | status = 'critical' (≤ 7 días)                     | error                                               | mdi-alert-circle           |
| **Vencidos**          | status = 'expired'                                 | error (oscuro)                                      | mdi-close-circle           |
| **% Cumplimiento**    | (en_regla / total × 100)                           | primary si ≥ 90%, warning si 70-89%, error si < 70% | mdi-percent                |

**Comportamiento:**

- Se actualizan al cambiar de pestaña o aplicar filtros
- Click en un KPI → filtra la tabla por ese estado
- Responsive: desktop 6 columnas, tablet 3, mobile 2

### 2. Barra Global de Acciones

Ubicada debajo de los KPIs, siempre visible:

- **Búsqueda global**: campo de texto con debounce (300ms) que busca en:
  - Matrícula del vehículo
  - Nombre del conductor
  - Nº de referencia del documento
  - Nombre del archivo
  - Tipo de documento
- **Botón "Generar documento"**: abre `GenerateDocumentDialog.vue` (reutilizado)
- **Botón "Exportar CSV"**: exporta la vista actual a CSV
- **Indicador de carga**: spinner mientras se cargan datos

### 3. Pestaña "Vehículos"

Tabla server-side paginada de TODOS los documentos de TODOS los vehículos.

**Columnas:**

| Columna           | Contenido                                           | Ordenable |
| ----------------- | --------------------------------------------------- | --------- |
| Vehículo          | Matrícula + marca/modelo (link a VehicleDetailPage) | Sí        |
| Tipo documento    | Label en español (ITV, Seguro RC, etc.) + icono     | Sí        |
| Nº referencia     | reference_number                                    | Sí        |
| Estado            | DocumentStatusChip (color + texto)                  | Sí        |
| Fecha expedición  | DD/MM/YYYY                                          | Sí        |
| Fecha vencimiento | DD/MM/YYYY                                          | Sí        |
| Días restantes    | DocumentExpiryBadge (verde/ámbar/rojo)              | Sí        |
| Acciones          | Ver/descargar/editar/eliminar                       | —         |

**Filtros específicos:**

- Tipo de documento (multi-select: ITV, Seguro, Tarjeta Transporte, etc.)
- Estado (multi-select: En regla, Próximo a vencer, Crítico, Vencido, No aplica)
- Vehículo específico (autocomplete)
- Rango de fechas de vencimiento

**Acciones por fila:**

- 👁 Ver detalle → abre diálogo con toda la info del documento
- ⬇ Descargar → descarga el archivo adjunto (si existe file_url)
- ✏ Editar → abre DocumentActionsDialog con datos precargados
- 🗑 Eliminar → confirmación modal

**Vista mobile:** Cards en lugar de tabla, una por documento, con los campos clave visibles.

### 4. Pestaña "Conductores"

Tabla server-side paginada de TODOS los documentos de TODOS los conductores.

**Columnas:**

| Columna           | Contenido                                       | Ordenable |
| ----------------- | ----------------------------------------------- | --------- |
| Conductor         | Nombre completo + NIF (link a DriverDetailPage) | Sí        |
| Tipo documento    | Label en español (Carnet C, CAP, etc.) + icono  | Sí        |
| Categoría         | Categoría del documento (C, CE, CAP, etc.)      | Sí        |
| Nº documento      | reference_number                                | Sí        |
| Estado            | DocumentStatusChip                              | Sí        |
| Fecha expedición  | DD/MM/YYYY                                      | Sí        |
| Fecha vencimiento | DD/MM/YYYY                                      | Sí        |
| Días restantes    | DocumentExpiryBadge                             | Sí        |
| Acciones          | Ver/descargar/editar/eliminar                   | —         |

**Filtros específicos:**

- Tipo de documento (multi-select: Carnet, CAP, Tacógrafo, etc.)
- Estado (multi-select)
- Conductor específico (autocomplete)
- Rango de fechas de vencimiento

### 5. Pestaña "Transporte Generado"

Documentos de transporte generados automáticamente desde rutas/cargas.

**Columnas:**

| Columna          | Contenido                                   | Ordenable |
| ---------------- | ------------------------------------------- | --------- |
| Tipo documento   | Label + icono (CMR, Albarán, Factura, etc.) | Sí        |
| Ruta             | Origen → Destino (link a RouteDetail)       | Sí        |
| Carga            | Descripción (si aplica, link a CargoDetail) | Sí        |
| Fecha generación | DD/MM/YYYY HH:mm                            | Sí        |
| Generado por     | Nombre del usuario                          | Sí        |
| Archivo          | Nombre del fichero + botón descargar        | —         |
| Acciones         | Descargar / Eliminar                        | —         |

**Acciones:**

- **Botón "Generar documento"** (arriba de la tabla) → abre `GenerateDocumentDialog.vue`
  - El diálogo ya existe y funciona: selecciona tipo + ruta + carga opcional
  - Los campos del PDF se autocompletan desde la BD (ruta, vehículo, conductor, carga, empresa)
  - Genera PDF → sube a Storage → registra en `generated_documents`
- Descargar PDF generado
- Eliminar registro (con confirmación)

**Filtros específicos:**

- Tipo de documento (CMR, Albarán, Carta de Porte, Factura, POD, Hoja de Ruta, ADR)
- Rango de fechas de generación
- Ruta específica (autocomplete)

### 6. Vista "Vencimientos" (acceso rápido)

No es una pestaña separada, sino un **filtro predefinido** accesible desde:

- Click en KPI "Próximos a vencer" o "Críticos" o "Vencidos"
- Botón "Ver vencimientos" en la barra de acciones

**Comportamiento:**

- Muestra solo documentos con status: expiring_soon, critical, expired
- Ordenados por urgencia (vencidos primero, luego críticos, luego próximos)
- Agrupados por entidad (vehículo/conductor) con expansión
- Acción rápida "Renovar" en cada documento → abre diálogo de edición con fecha de vencimiento precargada a hoy + periodicidad del tipo

### 7. Diálogo de Acciones de Documento (DocumentActionsDialog.vue)

Diálogo reutilizable para crear/editar/ver documentos de vehículo y conductor.

**Modo Crear:**

- Selector de entidad (vehículo o conductor, según pestaña activa)
- Selector de tipo de documento
- Campos del formulario según tipo (reference_number, issue_date, expiry_date, file_url, notes)
- Upload de archivo (VFileInput, max 10MB, PDF/JPEG/PNG)
- Validación Zod

**Modo Editar:**

- Mismos campos precargados con datos existentes
- Permite cambiar fechas, subir nuevo archivo, añadir notas

**Modo Ver:**

- Solo lectura, todos los campos visibles
- Botón descargar archivo adjunto
- Histórico de renovaciones (si se implementa en futuro)

### 8. Exportar a CSV/Excel

**Alcance:** Exporta los datos visibles en la tabla actual (respeta filtros activos).

**Formato CSV:**

- Separador: punto y coma (`;`) — estándar español
- Encoding: UTF-8 con BOM (compatible con Excel)
- Columnas: las mismas que la tabla visible
- Nombre archivo: `fleetcontrol-documentos-YYYYMMDD.csv`

**Implementación:** Función pura en `src/utils/export-documents.js` usando generación de CSV nativo (sin dependencia externa para CSV simple).

---

## Plan de Implementación (TDD Obligatorio)

### Fase 1: Servicio API Centralizado

**Objetivo:** `src/services/api-documents.js` con consultas cross-entidad paginadas.

#### 1.1 — `getVehicleDocumentsPaginated()`

```js
/**
 * Obtiene documentos de vehículos con paginación server-side.
 * Incluye datos del vehículo (matrícula, marca, modelo) via JOIN.
 */
export async function getVehicleDocumentsPaginated({
  page = 1,
  pageSize = 25,
  filters = {},  // { docType, status, vehicleId, dateFrom, dateTo }
  sort = { col: 'expiry_date', asc: true }
} = {})
```

#### 1.2 — `getDriverDocumentsPaginated()`

```js
/**
 * Obtiene documentos de conductores con paginación server-side.
 * Incluye datos del conductor (nombre, NIF) via JOIN.
 */
export async function getDriverDocumentsPaginated({
  page = 1,
  pageSize = 25,
  filters = {},
  sort = { col: 'expiry_date', asc: true }
} = {})
```

#### 1.3 — `getGeneratedDocumentsPaginated()`

```js
/**
 * Obtiene documentos de transporte generados con paginación.
 * Incluye datos de ruta (origen, destino) via JOIN.
 */
export async function getGeneratedDocumentsPaginated({
  page = 1,
  pageSize = 25,
  filters = {},  // { documentType, routeId, dateFrom, dateTo }
  sort = { col: 'generated_at', asc: false }
} = {})
```

#### 1.4 — `getDocumentKpis()`

```js
/**
 * Obtiene KPIs documentales cross-entidad.
 * Retorna: { total, valid, expiringSoon, critical, expired, complianceRate }
 */
export async function getDocumentKpis()
```

#### 1.5 — `searchDocuments()`

```js
/**
 * Búsqueda global en documentos de vehículos y conductores.
 * Busca en: matrícula, nombre conductor, referencia, nombre archivo, tipo.
 */
export async function searchDocuments(query, { limit = 50 } = {})
```

#### Archivos a crear

| Archivo                              | Tipo     | Líneas est. |
| ------------------------------------ | -------- | ----------- |
| `src/services/api-documents.js`      | Servicio | ~200        |
| `src/services/api-documents.spec.js` | Test     | ~160        |

### Fase 2: Composable Centralizado

**Objetivo:** `src/composables/use-document-management.js` con estado reactivo.

#### 2.1 — Estado reactivo

```js
const activeTab = ref('vehicles') // 'vehicles' | 'drivers' | 'transport'
const kpis = ref({
  total: 0,
  valid: 0,
  expiringSoon: 0,
  critical: 0,
  expired: 0,
  complianceRate: 0,
})
const filters = reactive({
  docType: null,
  status: null,
  entity: null,
  dateFrom: null,
  dateTo: null,
})
const searchQuery = ref('')
const pagination = reactive({
  page: 1,
  pageSize: 25,
  total: 0,
  sortBy: 'expiry_date',
  sortAsc: true,
})
const items = ref([])
const isLoading = ref(false)
const error = ref(null)
```

#### 2.2 — Funciones

| Función                         | Descripción                                        |
| ------------------------------- | -------------------------------------------------- |
| `fetchKpis()`                   | Carga KPIs cross-entidad                           |
| `fetchDocuments()`              | Carga items según activeTab + filters + pagination |
| `applyFilters(newFilters)`      | Aplica filtros y resetea página a 1                |
| `setSearchQuery(query)`         | Actualiza búsqueda con debounce                    |
| `setActiveTab(tab)`             | Cambia pestaña y recarga                           |
| `setPagination(page, pageSize)` | Cambia paginación y recarga                        |
| `exportToCsv()`                 | Exporta vista actual a CSV                         |

#### Archivos a crear

| Archivo                                           | Tipo       | Líneas est. |
| ------------------------------------------------- | ---------- | ----------- |
| `src/composables/use-document-management.js`      | Composable | ~140        |
| `src/composables/use-document-management.spec.js` | Test       | ~120        |

### Fase 3: Componentes UI Reutilizables

#### 3.1 — `DocumentStatusChip.vue`

Chip de estado con color, icono y label en español.

| Status         | Color        | Icono            | Label            |
| -------------- | ------------ | ---------------- | ---------------- |
| valid          | success      | mdi-check-circle | En regla         |
| expiring_soon  | warning      | mdi-clock-alert  | Próximo a vencer |
| critical       | error        | mdi-alert-circle | Crítico          |
| expired        | error (dark) | mdi-close-circle | Vencido          |
| not_applicable | grey         | mdi-minus-circle | No aplica        |

```vue
<template>
  <VChip :color="color" size="small" variant="tonal" :prepend-icon="icon">
    {{ label }}
  </VChip>
</template>
```

#### 3.2 — `DocumentExpiryBadge.vue`

Badge con días restantes y color dinámico.

| Días restantes | Color        | Texto                 |
| -------------- | ------------ | --------------------- |
| > 30           | success      | "45 días"             |
| 8-30           | warning      | "15 días"             |
| 1-7            | error        | "3 días"              |
| 0              | error (dark) | "Hoy"                 |
| < 0            | error (dark) | "Vencido hace 5 días" |

#### 3.3 — `DocumentFilterBar.vue`

Barra de filtros reutilizable con:

- Multi-select tipo de documento (items dinámicos según pestaña)
- Multi-select estado
- Autocomplete entidad (vehículo/conductor)
- Date range picker
- Botón "Limpiar filtros"

#### Archivos a crear

| Archivo                                                  | Tipo       | Líneas est. |
| -------------------------------------------------------- | ---------- | ----------- |
| `src/components/documents/DocumentStatusChip.vue`        | Componente | ~45         |
| `src/components/documents/DocumentStatusChip.spec.js`    | Test       | ~30         |
| `src/components/documents/DocumentExpiryBadge.vue`       | Componente | ~40         |
| `src/components/documents/DocumentExpiryBadge.spec.js`   | Test       | ~30         |
| `src/components/documents/DocumentFilterBar.vue`         | Componente | ~100        |
| `src/components/documents/DocumentFilterBar.spec.js`     | Test       | ~40         |
| `src/components/documents/DocumentActionsDialog.vue`     | Componente | ~120        |
| `src/components/documents/DocumentActionsDialog.spec.js` | Test       | ~50         |

### Fase 4: Página DocumentsListPage Completa

**Objetivo:** Rewrite completo del stub actual.

#### 4.1 — Estructura de la página

```vue
<template>
  <VContainer fluid class="documents-page">
    <!-- KPI Cards -->
    <VRow>
      <VCol v-for="kpi in kpiCards" :key="kpi.label" cols="6" sm="4" md="2">
        <KpiCard :kpi="kpi" @click="filterByStatus(kpi.status)" />
      </VCol>
    </VRow>

    <!-- Global Action Bar -->
    <VRow class="mt-2">
      <VCol>
        <DocumentFilterBar
          v-model:filters="filters"
          v-model:search="searchQuery"
          :tab="activeTab"
          @export="exportToCsv"
        />
        <VBtn color="primary" class="ml-2" @click="openGenerateDialog">
          <VIcon start>mdi-file-plus</VIcon>
          Generar documento
        </VBtn>
      </VCol>
    </VRow>

    <!-- Tabs -->
    <VTabs v-model="activeTab">
      <VTab value="vehicles">Vehículos</VTab>
      <VTab value="drivers">Conductores</VTab>
      <VTab value="transport">Transporte Generado</VTab>
    </VTabs>

    <!-- Tab Panels -->
    <VWindow v-model="activeTab">
      <!-- Vehicles Panel -->
      <VWindowItem value="vehicles">
        <VehicleDocumentsTable
          :items="items"
          :loading="isLoading"
          :pagination="pagination"
          @update:pagination="setPagination"
          @action="handleAction"
        />
      </VWindowItem>

      <!-- Drivers Panel -->
      <VWindowItem value="drivers">
        <DriverDocumentsTable
          :items="items"
          :loading="isLoading"
          :pagination="pagination"
          @update:pagination="setPagination"
          @action="handleAction"
        />
      </VWindowItem>

      <!-- Transport Panel -->
      <VWindowItem value="transport">
        <GeneratedDocumentsTable
          :items="items"
          :loading="isLoading"
          :pagination="pagination"
          @update:pagination="setPagination"
          @action="handleAction"
        />
      </VWindowItem>
    </VWindow>

    <!-- Dialogs -->
    <GenerateDocumentDialog v-model="showGenerateDialog" @generated="onDocumentGenerated" />
    <DocumentActionsDialog
      v-model="showActionsDialog"
      :document="selectedDocument"
      @saved="fetchDocuments"
    />
  </VContainer>
</template>
```

#### 4.2 — Sub-componentes de tabla (para mantener < 200 líneas)

| Componente              | Archivo                                                | Líneas est. |
| ----------------------- | ------------------------------------------------------ | ----------- |
| VehicleDocumentsTable   | `src/components/documents/VehicleDocumentsTable.vue`   | ~120        |
| DriverDocumentsTable    | `src/components/documents/DriverDocumentsTable.vue`    | ~120        |
| GeneratedDocumentsTable | `src/components/documents/GeneratedDocumentsTable.vue` | ~100        |

Cada tabla:

- VDataTableServer con paginación server-side
- Columnas específicas de su tipo
- Slots personalizados para estado (DocumentStatusChip), días restantes (DocumentExpiryBadge), links a entidad
- Template #no-data con EmptyState
- Template #loading con VSkeletonLoader
- Responsive: tabla en desktop, cards en mobile

#### Archivos a crear/modificar

| Archivo                                                | Acción           | Líneas est. |
| ------------------------------------------------------ | ---------------- | ----------- |
| `src/pages/DocumentsListPage.vue`                      | Rewrite completo | ~180        |
| `src/components/documents/VehicleDocumentsTable.vue`   | Nuevo            | ~120        |
| `src/components/documents/DriverDocumentsTable.vue`    | Nuevo            | ~120        |
| `src/components/documents/GeneratedDocumentsTable.vue` | Nuevo            | ~100        |

### Fase 5: Utilidades y Constantes

#### 5.1 — Export CSV

```js
// src/utils/export-documents.js
export function documentsToCsv(documents, type) // type: 'vehicle' | 'driver' | 'transport'
export function downloadCsv(csvContent, filename)
```

#### 5.2 — Constantes legales

Añadir a `src/constants/legal-limits.js`:

| Constante                       | Valor                         | Referencia                |
| ------------------------------- | ----------------------------- | ------------------------- |
| `DOCUMENT_EXPIRY_WARNING_DAYS`  | 30                            | Umbral "próximo a vencer" |
| `DOCUMENT_EXPIRY_CRITICAL_DAYS` | 7                             | Umbral "crítico"          |
| `DOCUMENT_MAX_FILE_SIZE_MB`     | 10                            | Límite upload             |
| `DOCUMENT_ALLOWED_FILE_TYPES`   | ['pdf', 'jpeg', 'jpg', 'png'] | Formatos aceptados        |
| `DOCUMENT_RETENTION_YEARS`      | 5                             | Plazo conservación legal  |
| `DOCUMENT_PAGE_SIZE_DEFAULT`    | 25                            | Paginación por defecto    |

#### Archivos a crear/modificar

| Archivo                              | Acción                                 | Líneas est. |
| ------------------------------------ | -------------------------------------- | ----------- |
| `src/utils/export-documents.js`      | Nuevo                                  | ~50         |
| `src/utils/export-documents.spec.js` | Nuevo                                  | ~30         |
| `src/constants/legal-limits.js`      | Ampliar (+sección DOCUMENT_MANAGEMENT) | +15         |
| `src/constants/legal-limits.spec.js` | Ampliar                                | +8          |

---

## Resumen de Archivos

### ✅ Creados (11)

| Archivo                                                | Tipo       | Líneas | Estado |
| ------------------------------------------------------ | ---------- | ------ | ------ |
| `src/services/api-documents.js`                        | Servicio   | ~250   | ✅     |
| `src/services/api-documents.spec.js`                   | Test       | ~260   | ✅     |
| `src/composables/use-document-management.js`           | Composable | ~200   | ✅     |
| `src/composables/use-document-management.spec.js`      | Test       | ~270   | ✅     |
| `src/components/documents/DocumentStatusChip.vue`      | Componente | ~45    | ✅     |
| `src/components/documents/DocumentStatusChip.spec.js`  | Test       | ~45    | ✅     |
| `src/components/documents/DocumentExpiryBadge.vue`     | Componente | ~55    | ✅     |
| `src/components/documents/DocumentExpiryBadge.spec.js` | Test       | ~55    | ✅     |
| `src/utils/export-documents.js`                        | Utilidad   | ~120   | ✅     |
| `src/utils/export-documents.spec.js`                   | Test       | ~100   | ✅     |
| `src/constants/legal-limits.js` (ampliado)             | Constantes | +10    | ✅     |
| `src/constants/legal-limits.spec.js` (ampliado)        | Test       | +30    | ✅     |

### ⏳ Pendientes de crear (7)

| Archivo                                                  | Tipo       | Líneas est. | Fase |
| -------------------------------------------------------- | ---------- | ----------- | ---- |
| `src/components/documents/DocumentFilterBar.vue`         | Componente | ~100        | 3    |
| `src/components/documents/DocumentFilterBar.spec.js`     | Test       | ~40         | 3    |
| `src/components/documents/DocumentActionsDialog.vue`     | Componente | ~120        | 3    |
| `src/components/documents/DocumentActionsDialog.spec.js` | Test       | ~50         | 3    |
| `src/components/documents/VehicleDocumentsTable.vue`     | Componente | ~120        | 4    |
| `src/components/documents/DriverDocumentsTable.vue`      | Componente | ~120        | 4    |
| `src/components/documents/GeneratedDocumentsTable.vue`   | Componente | ~100        | 4    |

### ⏳ Pendientes de modificar (1)

| Archivo                           | Cambio                                     | Líneas est.  | Fase |
| --------------------------------- | ------------------------------------------ | ------------ | ---- |
| `src/pages/DocumentsListPage.vue` | Rewrite completo (stub → página funcional) | ~180 (de 12) | 4    |

### Progreso por Fase

| Fase | Descripción                       | Estado       | Tests |
| ---- | --------------------------------- | ------------ | ----- |
| 1    | Servicio API centralizado         | ✅ Completa  | 23    |
| 2    | Composable centralizado           | ✅ Completa  | 15    |
| 5    | Constantes legales + export CSV   | ✅ Completa  | 21    |
| 3    | Componentes UI reutilizables      | ⏳ Parcial   | 13/33 |
| 4    | Página DocumentsListPage + tablas | 🔴 Pendiente | 0     |

### Métricas actuales

| Métrica                  | Valor     |
| ------------------------ | --------- |
| Tests totales proyecto   | 1315      |
| Tests nuevos esta sesión | 113       |
| Archivos creados         | 10        |
| Archivos modificados     | 2         |
| Lint errors              | 0         |
| Typecheck                | ✅ limpio |

---

## Orden de Ejecución (TDD)

### ✅ 1. **Fase 1** — Servicio API centralizado

- RED: Tests de consultas paginadas que fallan (mock Supabase)
- GREEN: Implementar 5 funciones con queries Supabase
- REFACTOR: Extraer helper de construcción de queries
- **Resultado:** 23 tests pasando, 5 funciones (`getVehicleDocumentsPaginated`, `getDriverDocumentsPaginated`, `getGeneratedDocumentsPaginated`, `getDocumentKpis`, `searchDocuments`)

### ✅ 2. **Fase 2** — Composable centralizado

- RED: Tests de estado reactivo y fetch que fallan
- GREEN: Implementar useDocumentManagement con reactive state
- REFACTOR: Extraer debounce de búsqueda
- **Resultado:** 15 tests pasando, estado reactivo + acciones completas

### ✅ 3. **Fase 5** — Constantes legales + export CSV (prerrequisitos UI)

- RED: Tests de constantes y export
- GREEN: Añadir constantes + función CSV
- **Resultado:** 21 tests pasando (6 nuevas constantes + 10 export + 5 legal-limits)

### ⏳ 4. **Fase 3** — Componentes UI reutilizables (PARCIAL)

- ✅ DocumentStatusChip.vue + tests (6 tests)
- ✅ DocumentExpiryBadge.vue + tests (7 tests)
- ⏳ DocumentFilterBar.vue + tests (pendiente)
- ⏳ DocumentActionsDialog.vue + tests (pendiente)

### 🔴 5. **Fase 4** — Página completa + tablas (PENDIENTE)

- 🔴 DocumentsListPage.vue rewrite
- 🔴 VehicleDocumentsTable.vue
- 🔴 DriverDocumentsTable.vue
- 🔴 GeneratedDocumentsTable.vue

---

## Flujo de Generación de Documentos de Transporte

El sistema de autogeneración YA existe y funciona. Se REUTILIZA tal cual:

### Cómo funciona actualmente

1. **Orquestador**: `document-generator.js` recibe `{ documentType, routeId, cargoId }`
2. **Generador especializado**: Cada tipo tiene su servicio (`document-cmr.js`, `document-albaran.js`, etc.)
3. **Autocompletado**: El generador hace fetch de:
   - Datos de la ruta (origen, destino, fechas, distancia)
   - Datos del vehículo (matrícula, marca, modelo, MMA)
   - Datos del conductor (nombre, licencia)
   - Datos de la carga (descripción, peso, tipo, ADR)
   - Datos de la empresa (razón social, CIF, dirección)
4. **PDF**: Genera PDF con jsPDF + jsPDF-AutoTable con layout normativo
5. **Storage**: Sube PDF a bucket `transport-documents` en Supabase Storage
6. **Registro**: Guarda referencia en tabla `generated_documents`

### Puntos de acceso existentes (NO modificar)

| Punto de acceso      | Ubicación                               | Comportamiento                                                     |
| -------------------- | --------------------------------------- | ------------------------------------------------------------------ |
| Botón en RouteDetail | `src/components/routes/RouteDetail.vue` | Abre GenerateDocumentDialog con route_id pre-rellenado             |
| Botón en CargoDetail | `src/components/cargo/CargoDetail.vue`  | Abre GenerateDocumentDialog con route_id + cargo_id pre-rellenados |

### Nuevo punto de acceso (a añadir)

| Punto de acceso           | Ubicación                                          | Comportamiento                                                    |
| ------------------------- | -------------------------------------------------- | ----------------------------------------------------------------- |
| Botón "Generar documento" | Pestaña "Transporte Generado" de DocumentsListPage | Abre GenerateDocumentDialog sin pre-rellenar (usuario selecciona) |
| Botón global              | Barra de acciones de DocumentsListPage             | Abre GenerateDocumentDialog sin pre-rellenar                      |

### GenerateDocumentDialog (REUTILIZAR, NO reescribir)

El componente ya existe en `src/components/documents/GenerateDocumentDialog.vue` y:

- Acepta props `routeId` y `cargoId` para pre-rellenar
- Carga templates activos para tipos disponibles
- Genera PDF vía `useDocumentTemplates.generateDocument()`
- Emite evento `generated` al completar
- **Se importa y usa tal cual** en la nueva página Documentos

---

## Criterios de Aceptación

| Criterio                                                    | Verificación                             |
| ----------------------------------------------------------- | ---------------------------------------- |
| KPIs muestran datos correctos cross-entidad                 | Test de getDocumentKpis()                |
| Tabla vehículos paginada server-side                        | Test de getVehicleDocumentsPaginated()   |
| Tabla conductores paginada server-side                      | Test de getDriverDocumentsPaginated()    |
| Tabla transporte generado con datos de ruta                 | Test de getGeneratedDocumentsPaginated() |
| Filtros aplican correctamente                               | Test de applyFilters()                   |
| Búsqueda global encuentra por matrícula, nombre, referencia | Test de searchDocuments()                |
| DocumentStatusChip muestra color/icono correcto por status  | Test de componente                       |
| DocumentExpiryBadge muestra días restantes correctos        | Test de componente                       |
| Click en KPI filtra tabla por estado                        | Test de interacción                      |
| Click en vehículo/conductor navega a detalle                | Test de navegación                       |
| Botón "Generar documento" abre diálogo existente            | Test de interacción                      |
| Documento generado aparece en pestaña Transporte            | Test end-to-end                          |
| Export CSV genera archivo descargable                       | Test de export-documents.js              |
| Constantes legales añadidas y testeadas                     | Test de legal-limits.js                  |
| Responsive: mobile cards, desktop tables                    | Test visual/manual                       |
| `npm test` pasa sin fallos                                  | CI gate                                  |
| `npm run check` limpio (lint + typecheck)                   | CI gate                                  |
| TDD seguido: tests escritos ANTES de implementación         | Historial commits                        |
| Archivos < 200 líneas (soft), < 300 (hard)                  | Review manual                            |
| Sin colores hardcodeados, sin console.log                   | Review manual                            |

---

## Riesgos y Mitigaciones

| Riesgo                                                       | Impacto | Mitigación                                                               |
| ------------------------------------------------------------ | ------- | ------------------------------------------------------------------------ |
| Consultas JOIN con vehicles/drivers lentas                   | Alto    | Indexar foreign keys, usar `.select('*, vehicles(plate, brand, model)')` |
| Tablas exceden 200 líneas                                    | Medio   | Extraer columnas a constantes, sub-componentes por slot                  |
| GenerateDocumentDialog no funciona sin routeId pre-rellenado | Medio   | El diálogo ya maneja caso sin pre-rellenado (selector de rutas)          |
| Bucket storage no accesible desde página centralizada        | Bajo    | Mismo bucket `transport-documents`, mismas políticas RLS                 |
| Migración de datos necesaria para campos faltantes           | Bajo    | Las tablas ya tienen todos los campos necesarios                         |
| jsPDF layout complejo para documentos normativos             | Bajo    | Ya resuelto en los 6 generadores existentes                              |

---

## Dependencias

| Dependencia                                        | Estado | Notas                                                                            |
| -------------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| Tablas `vehicle_documents`, `driver_documents`     | ✅     | Migración 009                                                                    |
| Tablas `document_templates`, `generated_documents` | ✅     | Migración 027                                                                    |
| Buckets Storage                                    | ✅     | vehicle-documents, transport-documents, documentos-conductores                   |
| Generadores PDF (6 tipos)                          | ✅     | document-cmr.js, document-albaran.js, etc.                                       |
| GenerateDocumentDialog.vue                         | ✅     | Funcional, reutilizable                                                          |
| useDocumentTemplates.js                            | ✅     | Composable de generación                                                         |
| Constantes tipos documento                         | ✅     | vehicle-document-types.js, driver-document-types.js, transport-document-types.js |
| Trigger check_document_expiry()                    | ✅     | Auto-actualiza status en BD                                                      |

---

## Métricas Objetivo

| Métrica                              | Valor Actual | Valor Objetivo |
| ------------------------------------ | ------------ | -------------- |
| Tests totales proyecto               | 1202         | 2,050+         |
| Tests módulo documentos              | ~20          | 850+           |
| Cobertura api-documents.js           | 0%           | 90%+           |
| Cobertura use-document-management.js | 0%           | 85%+           |
| Lint errors                          | 0            | 0              |
| Typecheck                            | ✅ limpio    | ✅ limpio      |

---

## Notas Técnicas

### Patrón de consulta paginada

Todas las consultas siguen el mismo patrón (ver AGENTS.md §6):

```js
const from = (page - 1) * pageSize
const to = from + pageSize - 1
let query = supabase
  .from(table)
  .select('*, related_table(fields)', { count: 'exact' })
  .range(from, to)
// Apply filters...
const { data, error, count } = await query
if (error) throw mapSupabaseError(error)
return { data, total: count, page, pageSize }
```

### Mapeo de status

El status se calcula en BD vía trigger `check_document_expiry()`. El frontend solo lee y muestra.

### Navegación a entidades

Usar `useRouter()` para navegar:

- Vehículo: `router.push({ name: 'VehicleDetail', params: { id: vehicleId } })`
- Conductor: `router.push({ name: 'DriverDetail', params: { id: driverId } })`
- Ruta: `router.push({ name: 'RouteDetail', params: { id: routeId } })`

### Accesibilidad

- Todos los KPIs con `role="status"` y `aria-live="polite"`
- Tablas con `<th scope="col">` y `aria-label`
- Chips de estado: color + texto + icono (nunca solo color)
- Filtros con labels asociados
- Keyboard navigation en tablas

### Performance

- Debounce 300ms en búsqueda
- Paginación server-side (nunca cargar todos los documentos)
- KPIs con cache de TanStack Query (staleTime: 60s)
- Lazy loading de componentes de tabla
