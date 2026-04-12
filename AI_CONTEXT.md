# AI_CONTEXT.md — Estado Actual del Proyecto

## FleetControl

> **DOCUMENTO VIVO.** Actualizar al final de cada sesión de trabajo o cuando
> cambie algo relevante. El agente de IA lee este fichero al inicio de cada tarea
> para tener el contexto exacto del estado del proyecto sin necesidad de
> explicarlo en cada conversación.
>
> **Última actualización:** 2026-04-11 (sesión audit-hoja-ruta — auditoría roadmap, fix 5 tests fallando en 6 spec files de documentos transporte)
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
    ├── services/                 ← api-*.js (comunicación con Supabase), document-*.js (generación PDF)
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

| Módulo                     | Estado         | Notas                                                                                                          |
| -------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------- |
| Setup inicial del proyecto | 🟢 Completado  | Vite + Vue 3 + Vuetify 4                                                                                       |
| Autenticación y roles      | 🟢 Completado  | Supabase Auth (api-auth, composable, login/registro, Zod)                                                      |
| Dashboard principal        | 🟡 Parcial     | Placeholder con KPIs                                                                                           |
| Módulo Vehículos           | 🟢 Completado  | CRUD completo, template para otros módulos                                                                     |
| Módulo Conductores         | 🟢 Completado  | CRUD, licencias, horas, CAP                                                                                    |
| Módulo Rutas               | 🟢 Completado  | Activas, historial, planificación                                                                              |
| Módulo Mantenimiento       | 🟢 Completado  | Preventivo, correctivo, repuestos                                                                              |
| Módulo Combustible         | 🟢 Completado  | Registro, estadísticas                                                                                         |
| Módulo Cargas              | 🟢 Completado  | CRUD, ADR, tipos de carga, taxonomía jerárquica 27 subcategorías, compliance                                   |
| Módulo Tacógrafos          | 🔴 Sin empezar | Descarga DDD, análisis conducción/descanso, infracciones                                                       |
| Gestión Documental         | 🟢 Completado  | Documentos centralizados, KPIs, filtros, tabs, export CSV, generación                                          |
| Módulo Alertas             | 🟢 Completado  | CRUD, filtros, acciones, dismiss, página completa                                                              |
| Módulo Informes            | 🟢 Completado  | 9 informes, KPIs, gráficos ECharts, export PDF/Excel, BD financiera                                            |
| Configuración              | 🟢 Completado  | Empresa, usuarios, RBAC, umbrales alerta, integraciones GPS, plantillas doc                                    |
| Documentos Transporte      | 🟢 Completado  | 6 tipos (CMR, Albarán, Hoja Ruta, Factura, POD, ADR), generación PDF auto                                      |
| Sistema de Notificaciones  | 🔴 Sin empezar | In-app, email                                                                                                  |
| GPS/Telemática             | 🟢 Completado  | Infraestructura GPS, adapter pattern, mock provider conectado a rutas reales, mapa FleetMap, offline indicator |
| Sistema Realtime           | 🟢 Completado  | useRealtime composable + suscripciones en alerts, vehicles, drivers, routes                                    |
| Testing (TDD)              | 🟢 Completado  | 1330 tests (Vitest), Cypress configurado, E2E smoke test                                                       |

### Documentación de Transporte (v1.0)

| Documento                       | Estado | Base Legal                            | Obligatorio                 |
| ------------------------------- | ------ | ------------------------------------- | --------------------------- |
| Carta de Porte CMR              | 🟢     | Convenio CMR 1956 (arts. 5-6)         | Sí (internacional)          |
| Carta de Porte Nacional         | 🟢     | LCTTM (Ley 15/2009, art. 10-12)       | Sí (>€150 con porteador)    |
| Documento de Control            | 🟢     | Orden FOM/2861/2012 + Ley 9/2025      | **Sí (obligatorio España)** |
| Albarán de Entrega              | 🟢     | Práctica comercial + UNE 56100        | Sí (práctica)               |
| Hoja de Ruta                    | 🟢     | LOTT / RD 70/2019                     | Recomendado (funcional)     |
| Factura de Transporte           | 🟢     | RD 1619/2012 + Ley 18/2022 (eFactura) | Sí (fiscal)                 |
| Certificado de Entrega (POD)    | 🟢     | LCTTM / práctica comercial            | Sí (prueba de entrega)      |
| Documento de Transporte ADR     | 🟢     | ADR 2025 (5.4) + RD 97/2014           | Sí (mercancías peligrosas)  |
| Certificado de Limpieza         | 🟢     | APPCC / Práctica sectorial            | Sí (alimentación/química)   |
| Packing List                    | 🟢     | Práctica comercial                    | Recomendado                 |
| Nota de Gastos                  | 🔴     | IRPF + Convenio colectivo transporte  | Sí (si hay reembolso)       |
| Declaración de Valor CMR        | 🔴     | CMR art. 24/26                        | Si valor > límite CMR       |
| Certificado ATP + control temp. | 🔴     | ATP + RD 635/1984                     | Sí (perecederos)            |
| Ficha de Estiba                 | 🔴     | RD 551/2020                           | Si carga pesada/especial    |
| Doc. conductores desplazados    | 🔴     | Dir. UE 2020/1057 + RD 362/2023       | Si aplica (internacional)   |

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

**Fecha:** 2026-04-03 (sesión realtime — Suscripciones Supabase Realtime)
**Branch:** feature/realtime (desde `dev`)
**Tests:** 1101 pasando (20 nuevos de use-realtime), 0 errores lint, 0 warnings, typecheck limpio
**Migraciones:** 32 aplicadas (001-032)

**Trabajo realizado:**

- **Composable `use-realtime.js`**: genérico de suscripciones Supabase Realtime
  - Singleton con canales compartidos por tabla
  - Reconexión automática con backoff exponencial (1s → 2s → 4s → ... → max 30s)
  - Máx 10 reintentos antes de error permanente
  - Manejo de INSERT/UPDATE/DELETE con handlers
  - Cleanup en `onUnmounted`
  - 20 tests TDD (150 líneas)
- **Integración en composables**:
  - `use-alerts.js`: INSERT → toast crítico/warning, UPDATE → reemplazo, DELETE → filtrado
  - `use-vehicles.js`: INSERT → toast info, UPDATE → reemplazo, DELETE → filtrado
  - `use-drivers.js`: INSERT → toast info, UPDATE → reemplazo, DELETE → filtrado
  - `use-routes.js`: INSERT → toast info, UPDATE → toast por cambio de estado (en_curso/completada/incidencia), DELETE → filtrado
- **AppTopBar**: Dropdown de notificaciones con alertas recientes, marcar leídas, navegar a detalle
- **AppSidebar**: Badge de alertas activas con fetchActiveCount
- **RLS Policies**: Fix alerts_update (USING true), alerts_delete (admin/traffic_manager only)
- **Realtime**: Habilitado en alerts, vehicles, drivers, routes (migración 031)
- **Archivos creados**: `src/composables/use-realtime.js`, `src/composables/use-realtime.spec.js`
- **Archivos modificados**: `use-alerts.js`, `use-vehicles.js`, `use-drivers.js`, `use-routes.js`, `AppTopBar.vue`, `AppSidebar.vue`
- **Migraciones creadas**: 028 (fix alerts RLS), 029 (fix delete), 030 (role-based delete), 031 (enable realtime)

**Pendiente para la Edge Function:**

- Configurar `SUPABASE_SERVICE_ROLE_KEY` como secret: `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<key>`
- Desplegar Edge Function: `supabase functions deploy invite-user`
- Obtener service_role key del dashboard: Settings → API → Project API keys

### Sesión C — Documentos de Transporte + Limpieza Integraciones

**Fecha:** 2026-04-02
**Branch:** feature/sesion-c-mejoras (desde `dev`)
**Tests:** 1081 pasando
**Migraciones:** 27 aplicadas (001-027)

**Trabajo realizado:**

1. **Task 9 — Eliminar "Otro" de integraciones:** `'otro'` eliminado de `GPS_PROVIDERS`, `FUEL_CARD_PROVIDERS`, `ACCOUNTING_PROVIDERS` en `settings-schema.js`. VListItem 'Otro' eliminado de 3 paneles en `IntegrationsForm.vue`.
2. **Task 10a — Constantes transport-document-types.js:** 6 tipos definidos (CMR, Albarán, Hoja Ruta, Factura, POD, ADR) con fields, icon, baseLegal. CMR_FIELD_MAPPING agrupado por entidad.
3. **Task 10b — Migración 027:** Tablas `document_templates` + `generated_documents`, RLS, bucket Storage `transport-documents`, seed de 6 plantillas.
4. **Task 10c — Schema Zod:** `generateDocumentSchema` + `documentTemplateSchema` en `transport-document-schema.js`.
5. **Task 10d — Servicio API:** `apiDocumentTemplates` (CRUD + getActiveTemplates, getByType, toggleActive) + `apiGeneratedDocuments` (getByRoute, delete).
6. **Task 10e — Generador PDF:** `document-generator.js` con `generateDocument()` que fetch datos, genera PDF con jsPDF (layouts CMR, Albarán, Hoja Ruta, Factura, POD, ADR + stub genérico), sube a Storage, registra en BD.
7. **Task 10f — Composable:** `use-document-templates.js` con templates, isLoading, error, isGenerating, generateError + funciones fetchTemplates, toggleTemplate, generateDocument, deleteGeneratedDocument.
8. **Task 10g — DocumentTemplatesForm.vue:** Componente de pestaña Configuración con expansion panels por tipo, toggle activo/inactivo, read-only para no-admins.
9. **Task 10h — GenerateDocumentDialog.vue:** Diálogo con selector tipo doc + selector ruta + selector carga opcional + botón generar PDF.
10. **Task 10i — SettingsPage.vue:** Nueva pestaña "Documentos" con RBAC (acceso para todos los roles con permiso de empresa).
11. **Task 10j — Botones en rutas/cargas:** Botón "Generar documento" (icon mdi-file-document-plus-outline) en RouteDetail y CargoDetail con route_id y cargo_id pre-rellenados.

**Archivos creados (13):**

- `src/constants/transport-document-types.js` + spec — 6 tipos documento, CMR_FIELD_MAPPING (23 tests)
- `supabase/migrations/20260402_027_transport_documents.sql` — tablas + RLS + bucket + seed
- `src/validations/transport-document-schema.js` + spec — Zod schemas (13 tests)
- `src/services/api-document-templates.js` + spec — CRUD service (12 tests)
- `src/services/document-generator.js` + spec — PDF generation service (6 tests)
- `src/composables/use-document-templates.js` + spec — composable (10 tests)
- `src/components/settings/DocumentTemplatesForm.vue` — settings tab component
- `src/components/documents/GenerateDocumentDialog.vue` — generate dialog component

**Archivos modificados (7):**

- `src/validations/settings-schema.js` — eliminar 'otro' de 3 arrays de providers
- `src/validations/settings-schema.spec.js` — +3 tests (rechazar 'otro')
- `src/components/settings/IntegrationsForm.vue` — eliminar VListItem 'Otro' de 3 paneles
- `src/pages/SettingsPage.vue` — nueva pestaña "Documentos" + import DocumentTemplatesForm
- `src/constants/role-permissions.js` — +case 'documentos' en hasSettingsAccess
- `src/components/routes/RouteDetail.vue` — +botón generar documento + GenerateDocumentDialog
- `src/components/cargo/CargoDetail.vue` — +botón generar documento + GenerateDocumentDialog

**Resultado:** 1081 tests (1014 + 67 nuevos). Lint + typecheck limpios. 1 migración pendiente de aplicar en Supabase (027).

### Sesión B — Funcionalidad PRD + Integraciones completas

**Tareas completadas:**

1. **Migración 026:** Columnas nuevas en `company_settings` (alert*driving_hours, alert_tachograph_days, alert_speed_limit, email*\_, maps\__, fuel*card*_, accounting\_\_). Bucket Storage `company-logos` creado con políticas RLS.
2. **Task 5 — Nuevos umbrales de alerta:** 3 constantes en `ALERT_THRESHOLDS` (DRIVING_HOURS: 9, TACHOGRAPH_DOWNLOAD_DAYS: 28, SPEED_LIMIT_KMH: 90). Schema Zod extendido. Form actualizado con 3 campos nuevos.
3. **Task 6 — Upload logo empresa:** `CompanyForm.vue` con VFileInput + preview + upload a bucket `company-logos` + validación (formato, max 2MB). `logo_url` añadido a `companySettingsSchema`.
4. **Task 8 — Refactor IntegrationsForm:** Reescrito como 5 `VExpansionPanel` (GPS, Email, Maps, Tarjetas Combustible, Contabilidad). 4 nuevos schemas Zod por sección. Guardado por sección independiente. Read-only con secrets enmascarados.
5. **Task 7 — Edge Function invite-user:** `supabase/functions/invite-user/index.ts` con verificación JWT + check admin + `auth.admin.inviteUserByEmail()` + creación perfil. Método `inviteUser()` en `api-profiles.js` + store `settings.js`. `UsersTable.vue` conectado con `handleCreate()`.

**Archivos creados (2):**

- `supabase/migrations/20260402_026_session_b_settings.sql`
- `supabase/functions/invite-user/index.ts`

**Archivos modificados (9):**

- `src/constants/legal-limits.js` — +3 constantes (umbrales conducción, tacógrafo, velocidad)
- `src/constants/legal-limits.spec.js` — +3 tests
- `src/validations/settings-schema.js` — +logo_url en companySettings, +3 campos alertThresholds, +4 schemas integraciones por sección
- `src/validations/settings-schema.spec.js` — +12 tests (3 alertas + 9 integraciones)
- `src/components/settings/AlertThresholdsForm.vue` — +3 campos (conducción, tacógrafo, velocidad) + read-only
- `src/components/settings/CompanyForm.vue` — upload logo (VFileInput, preview, bucket upload)
- `src/components/settings/IntegrationsForm.vue` — rewrite completo con 5 VExpansionPanels
- `src/components/settings/UsersTable.vue` — `handleCreate()` conectado con Edge Function
- `src/services/api-profiles.js` — +`inviteUser()` método
- `src/stores/settings.js` — +`inviteUser()` acción

**Resultado:** 1014 tests (989 + 25 nuevos). Lint + typecheck limpios. 1 migración aplicada en Supabase.

**Pendiente para la Edge Function:**

- Configurar `SUPABASE_SERVICE_ROLE_KEY` como secret: `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<key>`
- Desplegar Edge Function: `supabase functions deploy invite-user`
- Obtener service_role key del dashboard: Settings → API → Project API keys

**Trabajo realizado:**

### Sesión 15 — Sesión A: Correcciones críticas y seguridad

**Tareas completadas:**

1. **Verificación defaults alerta (BD):** Valores en `company_settings` confirmados correctos: km=5000, days=30, critical=7. Sin cambios necesarios.
2. **`DRIVER_DOC_EXPIRY_WARNING_DAYS`:** Constante añadida a `legal-limits.js` (sección `ALERT_THRESHOLDS`, valor 30). Test verificatorio en `legal-limits.spec.js`.
3. **Admin auto-degradación:** Guard clause en `updateUserRole()` de `stores/settings.js` — impide que un admin cambie su propio rol. Nuevo archivo `stores/settings.spec.js` con 3 tests.
4. **Validación Zod IntegrationsForm:** Nuevo `integrationsSchema` en `settings-schema.js` (gps_provider enum + strings opcionales). `IntegrationsForm.vue` actualizado con `safeParse()` y manejo de errores inline. 5 tests nuevos en `settings-schema.spec.js`.

**Archivos creados (2):**

- `src/stores/settings.spec.js` — 3 tests (admin permisos, auto-degradación)
- _(schema integrations ya existía, solo se amplió)_

**Archivos modificados (4):**

- `src/constants/legal-limits.js` — +1 constante (`DRIVER_DOC_EXPIRY_WARNING_DAYS`)
- `src/constants/legal-limits.spec.js` — +1 test
- `src/stores/settings.js` — guard clause auto-degradación en `updateUserRole()`
- `src/validations/settings-schema.js` — +`integrationsSchema` (3 campos)
- `src/validations/settings-schema.spec.js` — +5 tests
- `src/components/settings/IntegrationsForm.vue` — import schema, `safeParse()`, errores inline

**Resultado:** 989 tests (980 + 9 nuevos). Lint + typecheck limpios.

### Sesión Mapa — Integración Google Maps + GPS Profesional

**Fecha:** 2026-04-03
**Branch:** feature/mapa (desde `dev`)
**Tests:** 1160 pasando (59 nuevos), 0 errores lint, 0 warnings, typecheck limpio
**Migraciones:** 32 aplicadas (001-032)

**Trabajo realizado:**

- **Migración 032**: Tabla `vehicle_positions` (histórico GPS) + índice BRIN + RLS + trigger `AFTER INSERT` que actualiza cache en `vehicles` (latitude, longitude, current_speed_kmh)
- **Constantes GPS**: `gps-config.js` — proveedores, tipos de fix, intervalos
- **Adapter pattern**: `GpsProvider` (interfaz abstracta) + `MockGpsProvider` (simulación realista con interpolación haversine, ruido gaussiano, heading)
- **Servicio API**: `api-vehicle-positions.js` — getPositions, getLatestPosition, getFleetPositions, ingestPosition, ingestBatch
- **Constantes mapa**: `map-config.js` — centro Madrid, zoom, colores marcadores por estado, filtros
- **Google Maps loader**: `load-google-maps.js` — carga lazy con `@googlemaps/js-api-loader`, caching singleton
- **Composable**: `use-fleet-map.js` — estado reactivo, filtros, selección, realtime subscription
- **Componentes UI**: `FleetMap.vue`, `MapControls.vue`, `VehicleDetailPanel.vue`
- **Página**: `FleetMapPage.vue` — wrapper full-height
- **Navegación**: Ruta `/mapa` + item "Mapa" en sidebar grupo FLOTA
- **Settings**: `'mock'` añadido a `GPS_PROVIDERS`
- **Dependencia**: `@googlemaps/js-api-loader` instalada

**Archivos creados (14):** migración 032, gps-config, gps-provider, mock-gps-provider, api-vehicle-positions, map-config, load-google-maps, use-fleet-map, FleetMap, MapControls, VehicleDetailPanel, FleetMapPage + sus tests (59 tests nuevos)

**Archivos modificados (4):** routes.js, AppSidebar.vue, settings-schema.js, package.json

**Pendiente:** Tests integración realtime (Tarea 6.1), tests FleetMap component, eliminar docs/plans obsoletos.

### Sesión mapa — Tests pendientes + mejoras

**Fecha:** 2026-04-03
**Branch:** feature/mapa
**Tests:** 1181 pasando (+22 nuevos: 7 integración realtime + 12 FleetMap + 3 heading), 3 skipped (Google Maps DOM-dependent), 0 errores lint, 0 warnings, typecheck limpio

**Trabajo realizado:**

- **Tests integración realtime** (`use-fleet-map.integration.spec.js`): 7 tests
  - Suscripción a vehicle_positions al llamar subscribeToRealtime
  - Refetch al recibir INSERT en vehicle_positions
  - Actualización de vehículo al recibir UPDATE (cambio de estado)
  - Filtrado correcto después de refetch por realtime
  - Manejo de CHANNEL_ERROR
  - Limpieza de suscripción al llamar cleanup
  - Múltiples eventos realtime mantienen filteredVehicles consistente

- **Tests componente FleetMap.vue** (`FleetMap.spec.js`): 12 tests (9 passing, 3 skipped)
  - Renderizado con atributos ARIA
  - Controles de mapa
  - Overlay de carga (visible/oculto)
  - Advertencia GPS (visible/oculto)
  - Panel de detalle (visible/oculto)
  - 3 tests de marcadores skipped (requieren Google Maps real en DOM)

- **JSDoc completo**: @throws en startSimulation de MockGpsProvider
- **Tests calculateHeading**: valores conocidos (Norte=0°, Este=90°, Sur=180°, Oeste=270°)

**Archivos creados (2):**

- `src/composables/use-fleet-map.integration.spec.js` — 7 tests integración realtime
- `src/components/map/FleetMap.spec.js` — 12 tests componente (9 passing, 3 skipped)

**Archivos modificados (1):**

- `src/services/mock-gps-provider.js` — JSDoc @throws en startSimulation
- `src/services/mock-gps-provider.spec.js` — +3 tests calculateHeading con valores conocidos

### Sesión mapa-mejoras — Mock GPS + rutas reales + offline indicator

**Fecha:** 2026-04-03
**Branch:** dev
**Tests:** 1190 pasando (+9 nuevos: 7 city-coords + 2 use-fleet-map offline), 0 skipped, 0 errores lint, 0 warnings, typecheck limpio
**Migraciones:** 35 aplicadas (001-035)

**Trabajo realizado:**

- **Migración 033**: Archivo retroactivo `20260403_033_restrict_vehicle_positions_rls.sql` — RLS restrictivo para vehicle_positions (SELECT authenticated, INSERT service_role, UPDATE/DELETE denied)
- **Migración 034**: Archivo retroactivo `20260403_034_get_latest_fleet_positions.sql` — Función SQL `get_latest_fleet_positions()` con DISTINCT ON
- **Migración 035**: `20260403_035_rename_vehicle_positions_indexes.sql` — Renombrar índices BRIN a convención `idx_vehicle_positions_*`
- **city-coords.js**: 90+ ciudades españolas con coordenadas + función `getCityCoords()` con búsqueda parcial
- **MockGpsProvider conectado a BD**: `_refreshRoutes()` lee rutas activas (`planned`/`in_progress`) de la BD, resuelve coordenadas de ciudades, interpola posiciones realistas. Refetch automático cada 60s.
- **Offline indicator**: `use-fleet-map.js` añade `_isOffline` a vehículos sin ping >15 min (`GPS_OFFLINE_THRESHOLD_MS`). FleetMap muestra marcador gris con opacidad reducida.
- **Tests**: `city-coords.spec.js` (7 tests), tests mock-gps-provider actualizados a nuevo formato de rutas

**Archivos creados (3):**

- `src/constants/city-coords.js` — 90+ ciudades españolas con coordenadas
- `src/constants/city-coords.spec.js` — 7 tests
- `supabase/migrations/20260403_033_restrict_vehicle_positions_rls.sql`
- `supabase/migrations/20260403_034_get_latest_fleet_positions.sql`
- `supabase/migrations/20260403_035_rename_vehicle_positions_indexes.sql`

**Archivos modificados (5):**

- `src/services/mock-gps-provider.js` — Conectado a rutas reales de BD, resolveCoords, refresh periódico
- `src/services/mock-gps-provider.spec.js` — Tests actualizados a nuevo formato de rutas (origin/dest objects)
- `src/composables/use-fleet-map.js` — Offline detection con `_isOffline` flag
- `src/components/map/FleetMap.vue` — Marcadores offline (gris, opacidad reducida)
- `src/constants/map-config.js` — Color `offline` añadido a MARKER_COLORS
- `docs/plans/feature-mapa-plan.md` — Estado actualizado (tareas 2-6 ✅)

### Sesión mapa-fix — Correcciones post-revisión + protocolo seguridad Git

**Fecha:** 2026-04-03
**Branch:** dev
**Tests:** 1202 pasando, 0 skipped, 0 errores lint, 0 warnings, typecheck limpio

**Problema detectado:** Divergencia entre commits locales y remotos causó pérdida de fixes al hacer merge. La versión de `origin/dev` sobrescribió los cambios locales porque no se verificó el contenido post-merge.

**Correcciones aplicadas (12 archivos):**

- **FleetMap.vue**: Eliminado MockGpsProvider local (delegado al composable), migrado a AdvancedMarkerElement + PinElement, soporte mapId, eliminado watcher duplicado, corregido `isMobile` → `mobile`
- **VehicleDetailPanel.vue**: Panel enriquecido con 6 secciones (estado, vehículo, posición, ruta activa, carga, horas conductor, alertas). Corregido color `amber` inválido a `warning`
- **use-fleet-map.js**: MockGpsProvider movido del componente al composable, añadido `ensureMockGps()`, `fetch()` maneja mock y real, `stopMockGps()` exportado
- **FleetMap.spec.js**: Actualizado mocks para AdvancedMarkerElement, refs reactivos, stubs apropiados
- **use-fleet-map.spec.js + integration**: Añadidos mocks supabase-client y error-map
- **load-google-maps.js**: Soporte `VITE_GOOGLE_MAPS_MAP_ID`
- **city-coords.js**: Normalización de acentos en búsqueda (NFD)
- **mock-gps-provider.js**: `startSimulation` async con `await _refreshRoutes()`
- **IntegrationsForm.vue**: `mock_gps_enabled` añadido a campos sección GPS
- **AGENTS.md**: Protocolo de seguridad Git (§19) — 7 reglas anti-divergencia, recuperación, anti-patrones

**Protocolo de seguridad Git añadido a AGENTS.md §19:**

- Sincronización antes de commit: `git pull --rebase`, `git status --short`, `git diff --stat`
- Verificación antes de push: `git log --graph`, `git log origin/dev..HEAD`
- Integridad de commits: `git show --stat HEAD`, spot-check con `rg`
- Recuperación: `git reflog`, `git cherry-pick`, `git reset --soft`
- 7 anti-patrones explícitos (NEVER)

**Limpieza:** 11 ramas remotas obsoletas eliminadas con `git remote prune origin`.

---

### Sesión documentos-centralizados — Eliminación + Tests página

**Fecha:** 2026-04-04
**Branch:** feature/documentos-centralizados
**Tests:** 1351 pasando (+21 nuevos: 9 api-documents delete + 4 composable delete + 12 DocumentsListPage), 0 errores lint, 0 warnings críticos, typecheck limpio
**Migraciones:** 35 aplicadas (001-035) — RLS policies para generated_documents ya existentes

**Trabajo realizado:**

- **Eliminación de documentos** implementada para las 3 entidades:
  - `api-documents.js`: `deleteVehicleDocument()`, `deleteDriverDocument()`, `deleteGeneratedDocument()` (delega en `apiGeneratedDocuments.delete` que borra BD + Storage)
  - `use-document-management.js`: método `deleteDocument(id, type)` con refresh automático de datos y KPIs
  - `DocumentsListPage.vue`: diálogo de confirmación modal con `VDialog` persistente, información del documento a eliminar, notificación de éxito/error
  - TODO eliminado: ya no hay `notifications.warning('Eliminación pendiente de implementar')`
- **RLS policies verificadas**: `generated_documents` tiene SELECT (all authenticated), INSERT (authenticated), DELETE (owner)
- **Tests**:
  - `api-documents.spec.js`: +9 tests (delete vehicle, driver, generated + error paths)
  - `use-document-management.spec.js`: +4 tests (deleteDocument vehicle/driver/transport + error propagation)
  - `DocumentsListPage.spec.js`: +12 tests (renderizado, KPIs, tabs, delete confirm/cancel, view/edit actions, lifecycle)

**Archivos creados (1):**

- `src/pages/DocumentsListPage.spec.js` — 12 tests página

**Archivos modificados (4):**

- `src/services/api-documents.js` — +3 funciones de eliminación
- `src/services/api-documents.spec.js` — +9 tests eliminación
- `src/composables/use-document-management.js` — +función `deleteDocument()`
- `src/composables/use-document-management.spec.js` — +4 tests eliminación
- `src/pages/DocumentsListPage.vue` — eliminación con confirmación modal, diálogos

**Resultado:** 1360 tests (92 ficheros). Lint + typecheck limpios.

---

### Sesión transport-doc-standard — Estandarización Total PDF

**Fecha:** 2026-04-04
**Branch:** feature/documentos-transporte (desde `dev`)
**Tests:** 1351+ pasando
**Migraciones:** 36 aplicadas (001-029 + fix transporte + templates obligatorios)

**Trabajo realizado:**

- **Estandarización de 7 Documentos**: Refactorización profunda de layouts para cumplir con modelos oficiales y profesionales:
  - **Carta de Porte Nacional**: Replicado modelo Pretium/Ministerio con 21 casillas, aprovechamiento total de página y firmas alineadas.
  - **CMR**: Adaptado a Convenio 1956 con campos obligatorios (1-24) y diseño corporativo.
  - **Documento de Control**: Implementado diseño conforme a Orden FOM/2861/2012.
  - **ADR**: Layout según ADR 2025 (cap. 5.4) con secciones de mercancía peligrosa destacadas.
  - **Certificado de Limpieza**: Diseño industrial con checkbox para cisterna/suelo y datos de operario.
  - **Packing List**: Tabla de bultos estandarizada con pesos netos/brutos.
  - **Albarán**: Diseño simplificado para entrega comercial.
- **Orquestador `document-generator.js`**: Centralización de la lógica. Sube PDFs a Supabase Storage (`transport-documents`) y registra en `generated_documents`.
- **Integridad Referencial**:
  - Migración 029: Añade `template_id` y `document_number` a `generated_documents` y puebla `transport_document_templates`.
  - Todos los servicios actualizados para vincular el documento generado con su plantilla activa y el usuario (`generated_by`).
- **UI/UX**: `GenerateDocumentDialog.vue` actualizado para garantizar que los 7 documentos siempre están disponibles.

**Archivos creados/modificados:**

- `document-carta-porte-nacional.js`, `document-cmr.js`, `document-adr.js`, `document-control.js`, `document-cleaning-cert.js`, `document-packing-list.js`, `document-albaran.js`, `document-generator.js`, `api-documents.js`, `GenerateDocumentDialog.vue`, `GeneratedDocumentsTable.vue`.
- Migración: `20260404_029_fix_transport_documents_schema.sql`.

---

### Sesión carta-porte-nacional — PDF layout + tabla docs transporte

**Fecha:** 2026-04-04

**1. Carta de Porte Nacional PDF — Rediseño completo**

- `src/services/document-carta-porte-nacional.js`: Layout reescrito con alturas de sección correctas (S1: 38mm, S2: 16mm, S3: 12mm, S13: 16mm, S14: 26mm, S15: 12mm, S18: 16mm, firmas: 26mm), padding de 1.5mm entre barra de título y contenido, `writeFieldStack` con cálculo dinámico de Y para evitar solapamientos, tabla mercancías a ancho completo (190mm), `splitTextToSize` en todas las celdas.
- `supabase/migrations/20260404_028_add_carta_porte_nacional_template.sql`: Migración para añadir carta_porte_nacional a document_templates.
- `src/services/document-carta-porte-nacional.spec.js`: Añadidos mocks `splitTextToSize` y `getTextWidth`.

**2. Tabla Transporte Generado — Columna Carga**

- `src/services/api-documents.js`: Query `getGeneratedDocumentsPaginated` ahora obtiene carga vía `routes → cargo_records` (nested join) en lugar de JOIN directo por `cargo_id` (que puede ser null).
- `src/components/documents/GeneratedDocumentsTable.vue`: Template `#item.cargo` lee `item.routes?.cargo_records?.[0]?.description` con fallback a `item.cargo_records?.description`.

**Archivos creados (1):**

- `supabase/migrations/20260404_028_add_carta_porte_nacional_template.sql`

**Archivos modificados (3):**

- `src/services/document-carta-porte-nacional.js` — PDF layout completo reescrito
- `src/services/document-carta-porte-nacional.spec.js` — mocks jsPDF
- `src/services/api-documents.js` — nested join routes → cargo_records
- `src/components/documents/GeneratedDocumentsTable.vue` — cargo template + helper function

---

### PLAN PENDIENTE — Mejoras módulo Configuración (siguiente sesión)

**Contexto:** Revisión de las 4 pestañas de configuración contra PRD §4.10, legal-limits.js, y estándares del sector transporte. Se identificaron discrepancias y funcionalidades faltantes.

#### ~~Sesión A — Correcciones críticas y seguridad~~ ✅ COMPLETADA

| #   | Tarea                                                              | Archivos                                      | Estado                    |
| --- | ------------------------------------------------------------------ | --------------------------------------------- | ------------------------- |
| 1   | Corregir defaults alerta: km 10000→5000, days 90→30, critical 15→7 | `AlertThresholdsForm.vue`                     | ✅ BD verificada correcta |
| 2   | Añadir `DRIVER_DOC_EXPIRY_WARNING_DAYS: 30` a `legal-limits.js`    | `legal-limits.js` + spec                      | ✅                        |
| 3   | Admin no puede auto-degradar su rol                                | `stores/settings.js` + spec                   | ✅                        |
| 4   | Validación Zod en IntegrationsForm                                 | `IntegrationsForm.vue` + `settings-schema.js` | ✅                        |

#### ~~Sesión B — Funcionalidad PRD + Integraciones completas~~ ✅ COMPLETADA

| #   | Tarea                                                                  | Archivos                                 | Estado |
| --- | ---------------------------------------------------------------------- | ---------------------------------------- | ------ |
| 5   | Nuevos umbrales: conducción (9h), tacógrafo (28d), velocidad (90 km/h) | `AlertThresholdsForm.vue` + migración BD | ✅     |
| 6   | Upload logo empresa (Supabase Storage)                                 | `CompanyForm.vue`                        | ✅     |
| 7   | Creación usuario (Edge Function Supabase Admin API)                    | `UsersTable.vue` + Edge Function         | ✅     |
| 8   | Refactor IntegrationsForm → VExpansionPanels con 5 secciones           | `IntegrationsForm.vue` + migración BD    | ✅     |

**Secciones de Integraciones (VExpansionPanels):**

- GPS/Telemática: Webfleet, Frotcom, Geotab
- Email: Brevo, SendGrid
- Maps: Google Maps
- Tarjetas combustible: DKV, WABCO
- Contabilidad: Sage, A3, Holded

Cada sección: selector proveedor + campos credenciales + botón guardar + botón "Probar conexión" (deshabilitado, pendiente GPS en producción).

#### ~~Sesión C — Mejoras adicionales~~ ✅ COMPLETADA

> **Plan:** `docs/plans/SESSION_C_PLAN.md`

| #   | Tarea                                                                | Archivos                                      | Estado |
| --- | -------------------------------------------------------------------- | --------------------------------------------- | ------ |
| 9   | Eliminar "Otro" de 3 paneles de integraciones                        | `IntegrationsForm.vue` + `settings-schema.js` | ✅     |
| 10  | Sistema documentos transporte (catálogo + PDF auto-rellenado por ID) | 13 archivos nuevos + 7 modificados            | ✅     |

#### Migraciones BD necesarias

- **Sesión A**: 0 migraciones (solo correcciones de código) ✅ COMPLETADA
- **Sesión B**: 1 migración (columnas nuevas en company_settings para umbrales extra + credenciales integraciones) ✅ COMPLETADA
- **Sesión C**: 1 migración (tabla document_templates + generated_documents) ✅ PENDIENTE APLICAR EN SUPABASE

**Archivos creados Sesión A (11):**

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

**Archivos creados Sesión B (2):**

- `supabase/migrations/20260402_026_session_b_settings.sql`
- `supabase/functions/invite-user/index.ts`

**Archivos modificados Sesión B (9):**

- `src/constants/legal-limits.js` — +3 constantes (umbrales conducción, tacógrafo, velocidad)
- `src/constants/legal-limits.spec.js` — +3 tests
- `src/validations/settings-schema.js` — +logo_url, +3 campos alertas, +4 schemas integraciones
- `src/validations/settings-schema.spec.js` — +12 tests
- `src/components/settings/AlertThresholdsForm.vue` — +3 campos umbrales
- `src/components/settings/CompanyForm.vue` — upload logo (VFileInput, bucket upload)
- `src/components/settings/IntegrationsForm.vue` — rewrite completo con 5 VExpansionPanels
- `src/components/settings/UsersTable.vue` — handleCreate() con Edge Function
- `src/services/api-profiles.js` — +inviteUser() método
- `src/stores/settings.js` — +inviteUser() acción

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
  > > > > > > > origin/dev

---

## 8.1 Tareas Pendientes (por prioridad)

### Alta — Próxima sesión

| Tarea                            | Módulo    | Descripción                                                                                                         |
| -------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------- |
| Tests integración realtime mapa  | Mapa      | Tarea 6.1 del feature-mapa-plan: mock canal Supabase, INSERT → marcador se mueve, status change → color, reconexión |
| Tests componente FleetMap.vue    | Mapa      | Tests del componente FleetMap (carga Google Maps, marcadores por estado, click → detalle, responsive)               |
| Generación automática de alertas | Alertas   | Detectar vencimientos doc, límites HOS, consumo anómalo, mantenimiento pendiente e insertar alertas automáticamente |
| Badge alertas activas            | Sidebar   | Mostrar contador de alertas no leídas/no silenciadas en el icono del sidebar                                        |
| Dashboard principal              | Dashboard | Reemplazar placeholder con KPIs reales desde `get_dashboard_kpis()` + gráficos desde datos                          |
| Deploy Edge Function invite-user | Config    | Configurar SUPABASE_SERVICE_ROLE_KEY como secret + desplegar `supabase functions deploy invite-user`                |

### Media — Siguientes iteraciones

| Tarea                          | Módulo   | Descripción                                                              |
| ------------------------------ | -------- | ------------------------------------------------------------------------ |
| Comparación período vs período | Informes | Añadir selector "comparar con" (mes anterior, año anterior) con deltas % |
| Drill-down en gráficos         | Informes | Click en gráfico → ver datos filtrados en tabla                          |
| Notificaciones por email       | Alertas  | Integración Brevo para alertas configurables por tipo y por usuario      |
| Configuración de umbrales      | Alertas  | UI para editar `company_settings` (alert_days_vehicle_doc, etc.)         |
| Exportación PDF con gráficos   | Informes | Incluir capturas de gráficos ECharts en el PDF exportado                 |
| Informes programados           | Informes | Envío automático por email de informes en horarios configurados          |
| Módulo Tacógrafos              | Gestión  | CRUD descargas DDD, análisis conducción/descanso, infracciones           |
| Gestión Documental completa    | Gestión  | Documentos centralizados con flujo de aprobación y auditoría             |

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

| Tarea                                                                | Fecha       |
| -------------------------------------------------------------------- | ----------- |
| CRUD alertas completo                                                | Sesión 11   |
| 9 informes con KPIs + gráficos + export                              | Sesión 12   |
| BD financiera (routes + vehicle_annual_costs + driver_compensation)  | Sesión 12   |
| 26 migraciones aplicadas en Supabase                                 | Sesión B    |
| 28 migraciones creadas (032 pendiente aplicar en Supabase)           | Sesión Mapa |
| RLS restrictivo en tablas nuevas                                     | Sesión 12   |
| 920 tests TDD                                                        | Sesión 12   |
| Sesión A: correcciones críticas seguridad (4 tareas)                 | Sesión 15   |
| Sesión B: funcionalidad PRD + integraciones (4 tareas)               | Sesión B    |
| 1014 tests TDD (989 + sesión B)                                      | Sesión B    |
| Sesión C: documentos transporte + limpieza integraciones (12 tareas) | Sesión C    |
| 1160 tests TDD (1101 + sesión mapa)                                  | Sesión Mapa |
| 32 migraciones aplicadas (001-032)                                   | Sesión Mapa |

---

## 9. Referencias y Recursos

| Recurso                         | Tipo         | Ubicación                                                      |
| ------------------------------- | ------------ | -------------------------------------------------------------- |
| PRD completo                    | Documento    | `PRD.md`                                                       |
| Reglas del agente               | Documento    | `AGENTS.md`                                                    |
| Workflows del agente            | Plantillas   | `.opencode/workflows/` (10 archivos)                           |
| Skills del agente               | Documento    | `/home/cesar/.agents/skills/`, `/home/cesar/.opencode/skills/` |
| Constantes legales              | Código       | `src/constants/legal-limits.js`                                |
| Taxonomía de cargas             | Código       | `src/constants/cargo-categories.js`                            |
| Equipamiento vehículos          | Código       | `src/constants/vehicle-equipment.js`                           |
| Tipos de vehículo (UE)          | Código       | `src/constants/vehicle-types.js`                               |
| Compliance de cargas            | Código       | `src/utils/cargo-compliance.js`                                |
| Tipos de documentos conductor   | Código       | `src/constants/driver-document-types.js`                       |
| Tipos de alerta                 | Código       | `src/constants/alert-types.js`                                 |
| Tipos de informe                | Código       | `src/constants/report-types.js`                                |
| Agregaciones informes           | Código       | `src/utils/report-aggregations.js`                             |
| Tipos de documentos             | Código       | `src/constants/transport-document-types.js`                    |
| Plantillas documentos           | Composable   | `src/composables/use-document-templates.js`                    |
| Schema BD (esquema real)        | SQL          | `information_schema` (fuente de verdad)                        |
| Migraciones SQL                 | SQL          | `supabase/migrations/` (001-032)                               |
| Configuración MCP Supabase      | Config       | `~/.config/opencode/opencode.json`                             |
| Material Design 3               | Docs         | https://m3.material.io                                         |
| Vuetify 4                       | Docs         | https://vuetifyjs.com                                          |
| Reglamento CE 561/2006          | Normativa UE | https://eur-lex.europa.eu                                      |
| LCTTM (Ley 15/2009)             | Normativa ES | BOE                                                            |
| ADR 2025                        | Normativa    | UNECE                                                          |
| Ley 9/2025 Movilidad Sostenible | Normativa ES | BOE 04/12/2025                                                 |

---

_Actualiza este fichero al final de cada sesión de trabajo. Verificar que la sección 4 (Estado de Desarrollo) refleja el progreso real._
