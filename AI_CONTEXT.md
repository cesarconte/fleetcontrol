# AI_CONTEXT.md — Estado Actual del Proyecto

## FleetControl

> **DOCUMENTO VIVO.** Actualizar al final de cada sesión de trabajo o cuando
> cambie algo relevante. El agente de IA lee este fichero al inicio de cada tarea
> para tener el contexto exacto del estado del proyecto sin necesidad de
> explicarlo en cada conversación.
>
> **Última actualización:** 2026-04-02 (sesión 14 — correcciones settings)
> **Actualizado por:** AI Agent

---

## 1. Resumen del Proyecto (5 líneas)

FleetControl es una SPA de gestión integral de flotas de transporte de mercancías por carretera para empresas españolas. Centraliza la gestión de vehículos, conductores, rutas, mantenimiento, documentación legal y cumplimiento normativo (DGT, LOTT, UE). Stack: Vue 3 + Vuetify 4 + Supabase. PRD completo en `PRD.md`, reglas del agente en `AGENTS.md`.

---

## 2. Stack Tecnológico Definitivo

```
Frontend framework:   Vue 3 (Composition API con `<script setup>`)
Estilos:              Vuetify 4 (Material Design 3) — theme oscuro, tokens CSS
Routing:              Vue Router 4
Estado global:        Pinia
Estado servidor:      TanStack Query (Vue Query v5)
Formularios:          Vee-Validate v4 + Zod
Mapas:                Google Maps Platform
Iconos:               Material Symbols (Google)
Gráficos:             ECharts + vue-echarts
Exportación PDF:      jsPDF + jsPDF-AutoTable
Exportación Excel:    ExcelJS
Testing:              Vitest + Cypress
Linting:              ESLint + Prettier

Backend:              Supabase
Base de datos:        PostgreSQL
Autenticación:        Supabase Auth
Almacenamiento docs:  Supabase Storage
Email transaccional:  Brevo
GPS/Telemática API:   [PENDIENTE]
Despliegue:           [PENDIENTE]
Automatización:       ✅ Husky + lint-staged + commitlint + GitHub Actions CI
```

> Las decisiones técnicas se documentan en la sección 5.

---

## 3. Estructura de Carpetas (Target)

```
/
├── PRD.md                        ← Requisitos de producto
├── AGENTS.md                     ← Reglas del agente IA
├── AI_CONTEXT.md                 ← Estado del proyecto
├── .env.example                  ← Variables de entorno (sin valores reales)
├── .opencode/
│   └── workflows/                ← Workflows del agente (debug, review, tdd, etc.)
├── supabase/
│   └── migrations/               ← Migraciones SQL
└── src/
    ├── assets/
    ├── components/
    │   ├── layout/               ← AppSidebar, AppTopBar, AppLayout
    │   ├── ui/                   ← Componentes reutilizables
    │   ├── vehicles/             ← VehicleForm, VehicleList, etc.
    │   ├── drivers/              ← DriverForm, DriverList, etc.
    │   ├── routes/               ← RouteForm, RouteList, etc.
    │   ├── alerts/               ← AlertList, AlertDismissDialog
    │   └── reports/              ← ReportKpiCard, ReportChartCard, etc. (7 componentes)
    ├── composables/              ← use-*.js (lógica de negocio)
    ├── constants/                ← Enums, legal-limits, document-types
    ├── pages/                    ← Páginas Vue (lazy-loaded)
    ├── plugins/                  ← Vue Router, Pinia, Vuetify, TanStack Query
    ├── services/                 ← api-*.js (comunicación con Supabase)
    ├── stores/                   ← Pinia stores
    ├── styles/                   ← tokens.css
    ├── types/                    ← Definiciones JSDoc
    ├── utils/                    ← Funciones puras
    └── validations/              ← Esquemas Zod
```

> Estructura definitiva conforme a las convenciones de `AGENTS.md §4`.

---

## 4. Estado de Desarrollo por Módulo

> Leyenda: 🔴 Sin empezar | 🟡 En progreso | 🟢 Completado | ⏸ Bloqueado

### Gestión — Core (v1.0)

| Módulo                     | Estado         | Notas                                                                        |
| -------------------------- | -------------- | ---------------------------------------------------------------------------- |
| Setup inicial del proyecto | 🟢 Completado  | Vite + Vue 3 + Vuetify 4                                                     |
| Autenticación y roles      | 🟢 Completado  | Supabase Auth (api-auth, composable, login/registro, Zod)                    |
| Dashboard principal        | 🟡 Parcial     | Placeholder con KPIs                                                         |
| Módulo Vehículos           | 🟢 Completado  | CRUD completo, template para otros módulos                                   |
| Módulo Conductores         | 🟢 Completado  | CRUD, licencias, horas, CAP                                                  |
| Módulo Rutas               | 🟢 Completado  | Activas, historial, planificación                                            |
| Módulo Mantenimiento       | 🟢 Completado  | Preventivo, correctivo, repuestos                                            |
| Módulo Combustible         | 🟢 Completado  | Registro, estadísticas                                                       |
| Módulo Cargas              | 🟢 Completado  | CRUD, ADR, tipos de carga, taxonomía jerárquica 27 subcategorías, compliance |
| Módulo Tacógrafos          | 🔴 Sin empezar | Descarga DDD, análisis conducción/descanso, infracciones                     |
| Gestión Documental         | 🔴 Sin empezar | Documentos centralizados, alertas vencimiento, auditoría                     |
| Módulo Alertas             | 🟢 Completado  | CRUD, filtros, acciones, dismiss, página completa                            |
| Módulo Informes            | 🟢 Completado  | 9 informes, KPIs, gráficos ECharts, export PDF/Excel, BD financiera          |
| Configuración              | 🟢 Completado  | Empresa, usuarios, RBAC, umbrales alerta, integraciones GPS                  |
| Sistema de Notificaciones  | 🔴 Sin empezar | In-app, email                                                                |
| GPS/Telemática             | 🔴 Sin empezar | Integración con proveedor                                                    |
| Sistema Realtime           | 🔴 Sin empezar | Tablas Tier 1                                                                |
| Testing (TDD)              | 🟢 Completado  | 852 tests (Vitest), Cypress configurado, E2E smoke test                      |

### Documentación de Transporte (v1.0)

| Documento                       | Estado | Base Legal                            | Obligatorio                |
| ------------------------------- | ------ | ------------------------------------- | -------------------------- |
| Carta de Porte CMR              | 🔴     | Convenio CMR 1956 (arts. 5-6)         | Sí (internacional)         |
| Carta de Porte Nacional         | 🔴     | LCTTM (Ley 15/2009, art. 10-12)       | Sí (>€150 con porteador)   |
| Documento de Control Digital    | 🔴     | Orden FOM/2861/2012 + Ley 9/2025      | **Sí (desde 05/10/2026)**  |
| Albarán de Entrega              | 🔴     | Práctica comercial + UNE 56100        | Sí (práctica)              |
| Hoja de Ruta                    | 🔴     | LOTT / RD 70/2019                     | Recomendado (funcional)    |
| Nota de Gastos                  | 🔴     | IRPF + Convenio colectivo transporte  | Sí (si hay reembolso)      |
| Factura de Transporte           | 🔴     | RD 1619/2012 + Ley 18/2022 (eFactura) | Sí (fiscal)                |
| Certificado de Entrega (POD)    | 🔴     | LCTTM / práctica comercial            | Sí (prueba de entrega)     |
| Documento de Transporte ADR     | 🔴     | ADR 2025 (5.4) + RD 97/2014           | Sí (mercancías peligrosas) |
| Declaración de Valor CMR        | 🔴     | CMR art. 24/26                        | Si valor > límite CMR      |
| Certificado ATP + control temp. | 🔴     | ATP + RD 635/1984                     | Sí (perecederos)           |
| Packing List                    | 🔴     | Práctica comercial                    | Recomendado                |
| Ficha de Estiba                 | 🔴     | RD 551/2020                           | Si carga pesada/especial   |
| Doc. conductores desplazados    | 🔴     | Dir. UE 2020/1057 + RD 362/2023       | Si aplica (internacional)  |

### Análisis (v1.5 — implementar TRAS gestión y documentación)

| Módulo                       | Estado         | Notas                                               |
| ---------------------------- | -------------- | --------------------------------------------------- |
| Análisis de Costes (CPM/TCO) | 🔴 Sin empezar | Coste/km, coste por vehículo/ruta/conductor         |
| Análisis Combustible         | 🔴 Sin empezar | Eficiencia L/100km, anomalías, robo                 |
| Scoring de Conductores       | 🔴 Sin empezar | Frenadas, aceleración, velocidad, HOS               |
| Utilización de Flota         | 🔴 Sin empezar | Ratio horas activas/disponibles                     |
| Análisis Mantenimiento       | 🔴 Sin empezar | MTBF, MTTR, compliance PM, tendencia costes         |
| Huella de Carbono            | 🔴 Sin empezar | CO2 por vehículo/flota, Scope 1, CSRD               |
| Benchmarking                 | 🔴 Sin empezar | Comparación vehículos/conductores/rutas             |
| Tendencias Temporales        | 🔴 Sin empezar | Evolución costes, eficiencia, consumo, averías      |
| Compliance Regulatorio       | 🔴 Sin empezar | % cumplimiento ITV, CAP, ADR, tacógrafo, conducción |
| Análisis de Rutas            | 🔴 Sin empezar | Planificado vs real, puntualidad                    |

### Futuras Ampliaciones (v2.0+)

| Módulo                           | Prioridad | Notas                                            |
| -------------------------------- | --------- | ------------------------------------------------ |
| Gestión de Remolques/Activos     | Alta      | Ciclo de vida independiente                      |
| Inventario de Repuestos          | Alta      | Stock, costes, reposición, vinculación a órdenes |
| Planificación/Dispatch           | Alta      | Asignación de jobs, calendario                   |
| Integración Tarjetas Combustible | Alta      | Importación automática transacciones             |
| Sostenibilidad/Emisiones ZBE     | Alta      | Etiqueta DGT, Euro class, CSRD                   |
| Gestión de Clientes/Expedidores  | Media     | Base de datos, contratos, precios                |
| Gastos de Viaje                  | Media     | Peajes, parking, ferry, dietas                   |
| Gestión de Seguros               | Media     | Pólizas, primas, vencimientos, siniestros        |
| Gestión de Sanciones/Multas      | Media     | Tráfico, LOTT, vinculación conductor/vehículo    |
| Comunicación con Conductores     | Media     | Mensajería in-app                                |
| Optimización de Carga            | Media     | Peso ejes, distribución, límites MMA             |
| Presupuestación                  | Baja      | Presupuesto anual, real vs previsto              |
| Gestión de Contratos             | Baja      | Tarifas, SLAs, volúmenes                         |
| Portal de Cliente                | Baja      | Seguimiento envíos, descarga documentos          |
| Gestión de Garantías             | Baja      | Coberturas, reparaciones cubiertas               |
| App Móvil Conductores            | Futuro    | Rutas, documentos, horas disponibles             |

---

## 5. Decisiones Tomadas

| Fecha   | Decisión                    | Alternativas descartadas | Razón                             |
| ------- | --------------------------- | ------------------------ | --------------------------------- |
| 2026-03 | Vue 3 + Composition API     | React, Angular           | Ecosistema, experiencia previa    |
| 2026-03 | Vuetify 4                   | PrimeVue, Quasar         | Material Design, madurez          |
| 2026-03 | Supabase (BaaS)             | Firebase, Railway        | Mejor integración Postgres, RLS   |
| 2026-03 | TanStack Query              | Pinia directo, SWR       | Cache servidor, separación estado |
| 2026-03 | Vitest + Cypress            | Jest, Playwright         | Velocidad, ecosistema Vue         |
| 2026-03 | TDD como metodología        | Tests post-código        | Calidad desde el inicio           |
| 2026-03 | Feature branches (dev→main) | Trunk-based              | Claridad, revisión antes de merge |
| 2026-03 | Mobile-first responsive     | Desktop-first            | Uso en campo por técnicos         |

---

## 6. Decisiones Pendientes

| Decisión                           | Opciones                  | Impacto                          | Urgencia    |
| ---------------------------------- | ------------------------- | -------------------------------- | ----------- |
| Proveedor de despliegue            | Vercel, Netlify, Railway  | Hosting producción               | Media       |
| Proveedor GPS/telemática           | Webfleet, Frotcom, Geotab | Integración realtime             | Alta        |
| Proveedor email transaccional      | Brevo, Resend, SendGrid   | Notificaciones                   | Alta        |
| Proveedor mapas                    | Google Maps, Mapbox       | Visualización rutas              | Media       |
| Tarjetas combustible (integración) | WABCO, UTA, DKV           | Automatización datos combustible | Baja (v2.0) |

---

## 7. Convenciones Acordadas

_(Complementa las de AGENTS.md)_

- **Nombres de columna en la BD: SIEMPRE en inglés** (fuente de verdad). El código JS/Vue usa los nombres en inglés de la BD. Las etiquetas de UI se mantienen en español para el usuario.
- Los mockups de referencia están en `/docs/mockups/`.
- Los colores se definen como tokens CSS en `/src/styles/tokens.css`.
- Las constantes legales van en `/src/constants/legal-limits.js`.
- Los esquemas Zod se colocan en `/src/validations/`.
- Los tests se colocan junto al archivo source (`*.spec.js`).
- Las migraciones SQL van en `supabase/migrations/`.
- Los documentos de transporte se generan desde `/src/services/document-*.js`.
- Los workflows del agente están en `.opencode/workflows/`.
- Los skills del agente están en `/home/cesar/.agents/skills/`.
- El MCP de Supabase está configurado en `~/.config/opencode/opencode.json` con PAT.

---

## 8. Contexto de la Última Sesión

**Fecha:** 2026-04-02 (sesión 14)
**Branch:** dev
**Tests:** 980 pasando, 0 errores lint, 0 warnings, typecheck limpio

**Trabajo realizado:**

### Sesión 14 — Correcciones módulo Configuración (SettingsPage)

**Problemas encontrados y corregidos:**

- VTabs/VWindow no renderizaban: cambiado `<div>` a `<VContainer>`, quitado `v-if` de VWindowItems
- Enum `user_role` tenía valores antiguos (`admin`, `traffic_manager`, etc.) — renombrados a los correctos del código
- `company_settings` vacía — insertada fila por defecto
- Auth store fallback `'readonly'` no coincidía con enum BD `'read_only'` — corregido
- `useSettings()` composable creaba instancias independientes por componente — convertido a Pinia store (`src/stores/settings.js`)
- `currentRole.value` → `currentRole` (Pinia auto-desempaqueta)
- Componentes dentro slots VDataTable necesitaban kebab-case

**Archivos creados/modificados:**

- `src/stores/settings.js` — Pinia store para estado compartido
- `src/composables/use-settings.js` — wrapper delgado al store
- `src/components/settings/UsersTable.vue` — CRUD completo con diálogos
- `src/components/settings/CompanyForm.vue` — fix currentRole
- `src/components/settings/AlertThresholdsForm.vue` — fix currentRole
- `src/components/settings/IntegrationsForm.vue` — fix currentRole
- `src/pages/SettingsPage.vue` — fix render VTabs

---

### PLAN PENDIENTE — Mejoras módulo Configuración (siguiente sesión)

**Contexto:** Revisión de las 4 pestañas de configuración contra PRD §4.10, legal-limits.js, y estándares del sector transporte. Se identificaron discrepancias y funcionalidades faltantes.

#### Sesión A — Correcciones críticas y seguridad

| #   | Tarea                                                              | Archivos                                      |
| --- | ------------------------------------------------------------------ | --------------------------------------------- |
| 1   | Corregir defaults alerta: km 10000→5000, days 90→30, critical 15→7 | `AlertThresholdsForm.vue`                     |
| 2   | Añadir `DRIVER_DOC_EXPIRY_WARNING_DAYS: 30` a `legal-limits.js`    | `legal-limits.js`                             |
| 3   | Admin no puede auto-degradar su rol                                | `stores/settings.js`                          |
| 4   | Validación Zod en IntegrationsForm                                 | `IntegrationsForm.vue` + `settings-schema.js` |

#### Sesión B — Funcionalidad PRD + Integraciones completas

| #   | Tarea                                                                  | Archivos                                 |
| --- | ---------------------------------------------------------------------- | ---------------------------------------- |
| 5   | Nuevos umbrales: conducción (9h), tacógrafo (28d), velocidad (90 km/h) | `AlertThresholdsForm.vue` + migración BD |
| 6   | Upload logo empresa (Supabase Storage)                                 | `CompanyForm.vue`                        |
| 7   | Creación usuario (Edge Function Supabase Admin API)                    | `UsersTable.vue` + Edge Function         |
| 8   | Refactor IntegrationsForm → VExpansionPanels con 5 secciones           | `IntegrationsForm.vue` + migración BD    |

**Secciones de Integraciones (VExpansionPanels):**

- GPS/Telemática: Webfleet, Frotcom, Geotab, Otro
- Email: Brevo, SendGrid
- Maps: Google Maps
- Tarjetas combustible: DKV, WABCO, Otro
- Contabilidad: Sage, A3, Holded, Otro

Cada sección: selector proveedor + campos credenciales + botón guardar + botón "Probar conexión".

#### Sesión C — Mejoras adicionales

| #   | Tarea                                   | Archivos                 |
| --- | --------------------------------------- | ------------------------ |
| 9   | Botón test conexión GPS (Edge Function) | `IntegrationsForm.vue`   |
| 10  | Plantillas documentos transporte        | Nueva tabla + componente |

#### Migraciones BD necesarias

- **Sesión A**: 0 migraciones (solo correcciones de código)
- **Sesión B**: 1 migración (columnas nuevas en company_settings para umbrales extra + credenciales integraciones)
- **Sesión C**: 1 migración (tabla document_templates)

**Archivos creados (16):**

- `src/constants/role-permissions.js` + spec — 5 roles, matriz permisos, helpers RBAC (29 tests)
- `src/validations/settings-schema.js` + spec — Zod para empresa, umbrales, usuarios
- `src/services/api-company-settings.js` + spec — getSettings, updateSettings
- `src/services/api-profiles.js` + spec — getAll, getById, updateRole, deactivate, reactivate
- `src/composables/use-settings.js` + spec — isAdmin, currentRole, acciones con RBAC check
- `src/components/settings/CompanyForm.vue` — Form empresa (editable/readonly por rol)
- `src/components/settings/UsersTable.vue` — Tabla usuarios con cambio rol y activación
- `src/components/settings/AlertThresholdsForm.vue` — 6 umbrales con validación Zod
- `src/components/settings/IntegrationsForm.vue` — GPS provider + API keys
- `src/pages/SettingsPage.vue` — VTabs con RBAC gate (4 pestañas)
- PRD.md actualizado §4.10.1 — Política RBAC completa

### Sesión 12 — Módulo Informes (completo)

**Alcance:** Sistema de informes profesional con 9 tipos, gráficos ECharts, exportación PDF/Excel, y esquema BD financiera completa.

**Migraciones BD aplicadas (6):** 019-024 (routes_financials, vehicle_annual_costs, driver_compensation, financial_functions, financial_indexes, financial_rls)

**Archivos creados (~40):** 10 tipos informe, 7 componentes UI, 10 páginas, servicios, agregaciones, export utils

- `FuelReportPage.vue` — Combustible con precio/L, consumo, CO2
- `MaintenanceReportPage.vue` — Mantenimiento costes, preventivo/correctivo
- `ComplianceReportPage.vue` — Cumplimiento doc vehículos + conductores
- `TachographReportPage.vue` — Tacógrafos descargas, infracciones, horas
- `CargoReportPage.vue` — Cargas por tipo, peso, ADR

Rutas: 10 nuevas (hub + 9 informes), sidebar actualizado

**Resultado:** 920 tests (789 + 131 nuevos). Lint + typecheck limpios. 0 warnings Supabase advisors.

---

### Sesión 11 — Módulo Alertas (CRUD + UI)

**Alcance:** CRUD completo de alertas con filtros, acciones (leer, silenciar, eliminar) y página UI.
Pendiente para futuras sesiones: generación automática de alertas, realtime subscriptions, badge sidebar.

**Archivos creados (11):**

- `src/constants/alert-types.spec.js` — 31 tests (tipos, severidades, helpers)
- `src/constants/alert-types.js` — 9 tipos alerta + 3 severidades + helpers (label, icon, color)
- `src/validations/alert-schema.spec.js` — 19 tests (dismiss + filter validation)
- `src/validations/alert-schema.js` — Schemas Zod para dismiss y filtros
- `src/services/api-alerts.spec.js` — 13 tests (CRUD + alert-specific queries)
- `src/services/api-alerts.js` — Servicio: getPaginated, getActiveCount, markAsRead, markAllAsRead, dismiss, getByVehicle, getByDriver
- `src/composables/use-alerts.spec.js` — 27 tests (estado, fetch, acciones, paginación)
- `src/composables/use-alerts.js` — Composable reactivo con 3-layer state + acciones alerta
- `src/components/alerts/AlertDismissDialog.vue` — Diálogo silenciar con justificación (VDialog + VTextarea)
- `src/components/alerts/AlertList.vue` — Tabla desktop (VDataTableServer) + cards mobile + filtros por tipo/severidad/estado
- `src/pages/AlertsListPage.vue` — Página principal (reescribida desde placeholder)

**Resultado:** 789 tests (699 + 90 nuevos). Lint + typecheck limpios.

**Tareas pendientes documentadas:**

1. Generación automática de alertas (detección vencimientos, HOS, consumo)
2. Realtime subscriptions en tabla alerts (Tier 1)
3. Badge de alertas activas en sidebar/navegación
4. Notificaciones por email (integración Brevo)
5. Configuración de umbrales desde UI (company_settings)

**Problema:** La BD desplegada en Supabase tenía diferencias significativas con las migraciones locales y con el código:

- Enums de la BD real usaban valores diferentes a los del código (ej: `in_route` vs `on_route`, `archived` vs `decommissioned`)
- Algunas columnas tenían nombres diferentes (ej: `planned_departure` vs `departure_date`)

**Solución:**

1. Eliminadas TODAS las tablas, tipos, funciones e índices de Supabase
2. Re-aplicadas migraciones 001-018 desde archivos locales en orden
3. Migración 017 aplicada (estandarización a inglés: columnas + enums + índices + funciones)
4. Migración 018 aplicada (bucket Storage `vehicle-documents`)
5. Verificación: BD coincide exactamente con el código fuente

**Estado final BD Supabase:**

- 14 tablas con RLS habilitado (12 originales + vehicle_annual_costs + driver_compensation)
- Todas las columnas en inglés
- Todos los valores de enum en inglés
- 2 buckets Storage: `documentos-conductores` + `vehicle-documents`
- 24 migraciones aplicadas (001-024)
- Código y BD 100% sincronizados
- Vista `v_route_financials` con security_invoker
- Función `calculate_route_fixed_cost()` para allocation de costes fijos
- RLS restrictivo en tablas financieras (created_by = auth.uid())

**Problema 1: BD en español vs código en inglés**

- Se descubrió que TODAS las columnas de la BD estaban en español (migraciones 001-009) mientras los servicios API usaban inglés
- **Migración 017** creada: renombra ~200 columnas, ~30 valores de enum, ~20 índices, 2 funciones SQL y 3 políticas storage a inglés
- **Migración 016** corregida: WHERE clauses usaban valores enum ingleses inexistentes ('tractor') en vez de españoles ('tractora')
- Servicios API actualizados: api-drivers, api-routes, api-maintenance (column names + enum values)
- Todos los componentes Vue, schemas Zod, utils, composables y tests actualizados para usar valores enum ingles
- **Regla confirmada**: Columnas BD = inglés, Valores enum = inglés, Etiquetas UI = español

**Problema 2: CRUD documentos vehículo**

- `api-vehicle-documents.js` corregido: nombres de columna alineados con BD (doc_type, expiry_date, file_url)
- `use-vehicle-documents.js` extendido: createDocument, updateDocument, deleteDocument, uploadFile
- `VehicleDocumentFormDialog.vue` creado: formulario CRUD con VDialog, VForm, VFileInput
- `vehicle-document-schema.js` creado: schema Zod para validación de documentos
- `VehicleDocuments.vue` reescrito: tabla CRUD completa con añadir/editar/eliminar/descargar
- Migración 018: bucket `vehicle-documents` en Supabase Storage con políticas RLS

**Archivos creados (7):**

- `supabase/migrations/20260331_017_standardize_english.sql`
- `supabase/migrations/20260331_018_vehicle_documents_storage.sql`
- `src/validations/vehicle-document-schema.js`
- `src/validations/vehicle-document-schema.spec.js`
- `src/components/vehicles/VehicleDocumentFormDialog.vue`

**Archivos modificados (~35):**

- `supabase/migrations/20260330_016_vehicle_types.sql` (fix WHERE clauses)
- `src/services/api-vehicle-documents.js` (fix column names)
- `src/services/api-drivers.js` (fix column names, notes field)
- `src/services/api-routes.js` (departure_date, English enum values)
- `src/services/api-maintenance.js` (English enum values)
- `src/services/api-vehicles.spec.js`, `api-drivers.spec.js`, `api-routes.spec.js`, `api-maintenance.spec.js`, `api-vehicle-documents.spec.js`
- `src/composables/use-vehicle-documents.js` (CRUD + upload)
- `src/composables/use-vehicle-documents.spec.js` (11 new tests)
- `src/components/vehicles/VehicleDocuments.vue` (CRUD UI)
- `src/validations/maintenance-schema.spec.js` (fix syntax error)
- `src/utils/cargo-helpers.js`, `src/utils/cargo-helpers.spec.js` (English enum keys)
- Todos los componentes Vue (~15) con valores enum ingles
- Todos los schemas Zod y utils ya estaban en inglés (no cambios necesarios)

**Resultado**: Sistema completamente alineado — BD inglés, código inglés, UI español.

### Sesión 3 — Refactor completo: Alineación código → BD (inglés)

**Problema resuelto:** La BD Supabase usaba nombres en inglés pero todo el código usaba español. Se realizó un refactor completo de ~60 archivos para alinearlos al esquema real de la BD.

**Migraciones aplicadas:**

- M015: `subcategoria_id` en cargo_records + 11 nuevos valores vehicle_type enum (inglés)
- M016: Nuevos enums `eu_category` (7 valores) y `body_type` (21 valores), columnas en vehicles

**Archivos refactorizados (resumen):**

- **Constantes:** `vehicle-types.js` + spec (values español → inglés)
- **Utils:** `cargo-compliance.js` + spec (tipo_carroceria → body_type, status activo → active)
- **Schemas Zod:** 6 módulos (vehicle, driver, route, fuel, maintenance, cargo) + specs
- **Servicios API:** 6 módulos (api-vehicles, api-drivers, api-routes, api-fuel, api-maintenance, api-cargo) + specs
- **Composables:** use-vehicles, use-drivers, use-driver-documents, use-routes, use-fuel, use-maintenance
- **Componentes Vue:** ~25 archivos (Form, Detail, List, Card × 6 módulos + DriverDetailCarnets, DriverFormCarnets, DriverDocumentUploader)

**Reglas de idioma establecidas:**

- Columnas BD: inglés (plate, brand, body_type, eu_category...)
- Etiquetas UI: español ("Matrícula", "Marca", "Cisterna"...)
- Enums BD: inglés (rigid, tractor, curtain, tanker...)
- Labels JS: español (Rígido, Cabeza Tractora, Lona/Tauliner, Cisterna...)

**Conexión MCP Supabase:** Configurada exitosamente con PAT en `~/.config/opencode/opencode.json`.

### Sesión 4 — Compliance en planificación de rutas

- `RouteCompliancePanel.vue` creado: banner reactivo que muestra compliance vehículo-carga
- `RouteForm.vue` actualizado:
  - Guarda objeto vehículo completo (`selectedVehicle`) al seleccionar
  - Selector de subcategoría agrupado (elimina paso intermedio de tipo legado)
  - Panel de compliance reactivo (aparece al seleccionar vehículo + subcategoría)
  - Form reactivo renombrado a inglés (corrección del refactor sesión 3)
- `route-schema.js`: campo `subcategoria_id` opcional añadido
- Peso de carga validado contra `max_payload_kg` del vehículo

### Sesión 5 — Equipamiento normativo subcategorías

- Equipamiento obligatorio para 5 clases ADR (2, 4, 5, 6, 7) según ADR 2025 + RD 97/2014
- Equipamiento recomendado para 6 subcategorías GEN según práctica sector
- Nuevo campo `elementosRecomendados` en estructura de equipamiento
- Nueva función `getRecommendedEquipmentElements()` (no afecta compliance)
- Las 27 subcategorías ahora tienen equipamiento definido
- Tests: 402 passing

### Sesión 6 — Integración vehicle_documents con compliance

- `vehicle-document-types.js`: 8 tipos documentales (5 obligatorios, 3 opcionales)
- `api-vehicle-documents.js`: servicio CRUD con getByVehicle, getByVehicleAndType
- `use-vehicle-documents.js`: composable reactivo para estado de documentos
- `VehicleDocuments.vue`: corregido (usa composable + labels de tipos)
- `checkVehicleCompliance()`: extensión con validación documental (3er parámetro)
- `RouteCompliancePanel.vue`: carga documentos y pasa al compliance check
- CSVs semilla: 7 archivos en `seed/` con datos de prueba interconectados
- Tests: 445 passing (37 nuevos). Skill `testing-patterns` aplicada.
- Acciones pendientes: CRUD UI documentos, validación certificado ADR vehículo

### Sesión 7 — Cobertura completa de tests (composables + utils)

- 11 nuevos archivos de test: 8 composables + 3 utils
- Todos los composables cubiertos (9/9): use-auth, use-vehicles, use-drivers, use-routes, use-fuel, use-maintenance, use-cargo, use-driver-documents, use-vehicle-documents
- Todas las utils cubiertas (7/7): format-helpers, maintenance-helpers, status-helpers, cargo-compliance, cargo-helpers, error-map, validate-driver-hours
- Patrón TDD aplicado (testing-patterns skill): factory mocks, behavior-driven tests
- Tests: 677 passing, 39 test files, 0 lint errors
- Solo infraestructura sin test (main.js, router.js, vuetify.js) — no requiere unit tests

### Sesiones anteriores

<details>
<summary>Sesión 1 — Taxonomía de Cargas (completada)</summary>

- Taxonomía jerárquica completa: 4 categorías, 27 subcategorías con requisitos de vehículo
- Equipamiento normativo por subcategoría (ADR, ATP, Animales, Carga General) con referencias legales
- Módulo de compliance: verificación vehículo-carga con auto-checks y checklists
- Selector jerárquico en CargoForm (categoría → subcategoría)
- Sección "Requisitos y Normativa" en CargoDetail
- Validación Zod con `subcategoria_id` y cross-validation
</details>

<details>
<summary>Sesión 2 — Reestructuración Modelo Vehículos (EU)</summary>

- Nuevo modelo de 3 campos según normativa UE/RD 2822/1998
- Constantes `vehicle-types.js` con 3 enums congeladas
- Migración SQL `20260330_016_vehicle_types.sql`
- Schema Zod, componentes UI, compliance actualizados
</details>

**Próximos pasos (tareas pendientes):**

1. **COMPLETADO**: Integrar `checkVehicleCompliance()` en planificación de rutas.
2. **COMPLETADO**: Definir equipamiento para 11 subcategorías (sesión 5).
3. **COMPLETADO**: Integrar `vehicle_documents` con compliance real contra documentos vigentes (sesión 6).
4. **COMPLETADO (sesión 9)**: CRUD completo de documentos en UI (formulario subida/edición/borrado).
5. **COMPLETADO (sesión 9)**: Validación de certificado ADR vehículo en subcategorías ADR (ya implementado en sesiones anteriores, verificado).
6. **COMPLETADO (sesión 9)**: Eliminar columnas de backup en BD — verificado que no existen columnas backup.
7. **COMPLETADO (sesión 9)**: Estandarizar TODOS los identificadores de BD a inglés (columnas, enums, índices, funciones, políticas).

**Bloqueos activos:**

- Ninguno. Conexión Supabase operativa. BD completamente en inglés.

---

## 8.1 Tareas Pendientes (por prioridad)

### Alta — Próxima sesión

| Tarea                            | Módulo    | Descripción                                                                                                         |
| -------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------- |
| Generación automática de alertas | Alertas   | Detectar vencimientos doc, límites HOS, consumo anómalo, mantenimiento pendiente e insertar alertas automáticamente |
| Realtime subscriptions           | Alertas   | Suscripción Supabase Realtime en tabla `alerts` para actualización en tiempo real (Tier 1 según AGENTS.md §17)      |
| Badge alertas activas            | Sidebar   | Mostrar contador de alertas no leídas/no silenciadas en el icono del sidebar                                        |
| Aplicar migraciones BD informes  | Informes  | Migraciones 019-024 ya aplicadas en Supabase ✅                                                                     |
| Dashboard principal              | Dashboard | Reemplazar placeholder con KPIs reales desde `get_dashboard_kpis()` + gráficos desde datos                          |

### Media — Siguientes iteraciones

| Tarea                          | Módulo          | Descripción                                                              |
| ------------------------------ | --------------- | ------------------------------------------------------------------------ |
| Comparación período vs período | Informes        | Añadir selector "comparar con" (mes anterior, año anterior) con deltas % |
| Drill-down en gráficos         | Informes        | Click en gráfico → ver datos filtrados en tabla                          |
| Notificaciones por email       | Alertas         | Integración Brevo para alertas configurables por tipo y por usuario      |
| Configuración de umbrales      | Alertas         | UI para editar `company_settings` (alert_days_vehicle_doc, etc.)         |
| Exportación PDF con gráficos   | Informes        | Incluir capturas de gráficos ECharts en el PDF exportado                 |
| Informes programados           | Informes        | Envío automático por email de informes en horarios configurados          |
| Módulo Tacógrafos              | Gestión         | CRUD descargas DDD, análisis conducción/descanso, infracciones           |
| Gestión Documental completa    | Gestión         | Documentos centralizados con flujo de aprobación y auditoría             |
| Sistema Realtime               | Infraestructura | Suscripciones en tablas Tier 1 (alerts, routes, vehicles, drivers)       |

### Baja — Futuras ampliaciones

| Tarea                         | Módulo          | Descripción                                                                      |
| ----------------------------- | --------------- | -------------------------------------------------------------------------------- |
| Portal de datos económicos    | Informes        | CRUD de revenue, driver_cost, other_variable_cost, allocated_fixed_cost por ruta |
| CRUD vehicle_annual_costs     | Configuración   | UI para gestionar costes fijos anuales por vehículo                              |
| CRUD driver_compensation      | Configuración   | UI para gestionar compensación mensual por conductor                             |
| Exportación Excel avanzada    | Informes        | Múltiples hojas por informe (resumen KPIs + detalle + gráficos)                  |
| Gráficos interactivos         | Informes        | Zoom, filtros por click en leyenda, tooltips avanzados                           |
| Configuración empresa         | Configuración   | Datos fiscales, logo, preferencias, integraciones                                |
| Sistema notificaciones in-app | Notificaciones  | Centro de notificaciones con historial y preferencias                            |
| GPS/Telemática                | Infraestructura | Integración con proveedor para posición en tiempo real                           |

### Completado (no requiere acción)

| Tarea                                                               | Fecha     |
| ------------------------------------------------------------------- | --------- |
| CRUD alertas completo                                               | Sesión 11 |
| 9 informes con KPIs + gráficos + export                             | Sesión 12 |
| BD financiera (routes + vehicle_annual_costs + driver_compensation) | Sesión 12 |
| 24 migraciones aplicadas en Supabase                                | Sesión 12 |
| RLS restrictivo en tablas nuevas                                    | Sesión 12 |
| 920 tests TDD                                                       | Sesión 12 |

---

## 9. Referencias y Recursos

| Recurso                         | Tipo         | Ubicación                                              |
| ------------------------------- | ------------ | ------------------------------------------------------ |
| PRD completo                    | Documento    | `PRD.md`                                               |
| Reglas del agente               | Documento    | `AGENTS.md`                                            |
| Workflows del agente            | Plantillas   | `.opencode/workflows/` (10 archivos)                   |
| Skills del agente               | Documento    | `/home/cesar/.agents/skills/`                          |
| Constantes legales              | Código       | `src/constants/legal-limits.js`                        |
| Taxonomía de cargas             | Código       | `src/constants/cargo-categories.js`                    |
| Equipamiento vehículos          | Código       | `src/constants/vehicle-equipment.js`                   |
| Tipos de vehículo (UE)          | Código       | `src/constants/vehicle-types.js`                       |
| Compliance de cargas            | Código       | `src/utils/cargo-compliance.js`                        |
| Tipos de documentos conductor   | Código       | `src/constants/driver-document-types.js`               |
| Tipos de alerta                 | Código       | `src/constants/alert-types.js`                         |
| Tipos de informe                | Código       | `src/constants/report-types.js`                        |
| Agregaciones informes           | Código       | `src/utils/report-aggregations.js`                     |
| Tipos de documentos             | Código       | `src/constants/document-types.js`                      |
| Schema BD (esquema real)        | SQL          | `information_schema` (fuente de verdad)                |
| Migraciones SQL                 | SQL          | `supabase/migrations/` (001-024 aplicadas en Supabase) |
| Configuración MCP Supabase      | Config       | `~/.config/opencode/opencode.json`                     |
| Material Design 3               | Docs         | https://m3.material.io                                 |
| Vuetify 4                       | Docs         | https://vuetifyjs.com                                  |
| Reglamento CE 561/2006          | Normativa UE | https://eur-lex.europa.eu                              |
| LCTTM (Ley 15/2009)             | Normativa ES | BOE                                                    |
| ADR 2025                        | Normativa    | UNECE                                                  |
| Ley 9/2025 Movilidad Sostenible | Normativa ES | BOE 04/12/2025                                         |

---

_Actualiza este fichero al final de cada sesión de trabajo. Verificar que la sección 4 (Estado de Desarrollo) refleja el progreso real._
