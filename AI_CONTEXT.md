# AI_CONTEXT.md — Estado Actual del Proyecto

## FleetControl

> **DOCUMENTO VIVO.** Actualizar al final de cada sesión de trabajo o cuando
> cambie algo relevante. El agente de IA lee este fichero al inicio de cada tarea
> para tener el contexto exacto del estado del proyecto sin necesidad de
> explicarlo en cada conversación.
>
> **Última actualización:** 2026-04-02 (sesión C — Documentos Transporte + limpieza integraciones)
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
| Configuración              | 🟢 Completado  | Empresa, usuarios, RBAC, umbrales alerta, integraciones GPS, plantillas doc  |
| Documentos Transporte      | 🟢 Completado  | 6 tipos (CMR, Albarán, Hoja Ruta, Factura, POD, ADR), generación PDF auto    |
| Sistema de Notificaciones  | 🔴 Sin empezar | In-app, email                                                                |
| GPS/Telemática             | 🔴 Sin empezar | Integración con proveedor                                                    |
| Sistema Realtime           | 🟢 Completado  | useRealtime composable + suscripciones en alerts, vehicles, drivers, routes  |
| Testing (TDD)              | 🟢 Completado  | 1101 tests (Vitest), Cypress configurado, E2E smoke test                     |

### Documentación de Transporte (v1.0)

| Documento                       | Estado | Base Legal                            | Obligatorio                |
| ------------------------------- | ------ | ------------------------------------- | -------------------------- |
| Carta de Porte CMR              | 🟢     | Convenio CMR 1956 (arts. 5-6)         | Sí (internacional)         |
| Carta de Porte Nacional         | 🟢     | LCTTM (Ley 15/2009, art. 10-12)       | Sí (>€150 con porteador)   |
| Documento de Control Digital    | 🔴     | Orden FOM/2861/2012 + Ley 9/2025      | **Sí (desde 05/10/2026)**  |
| Albarán de Entrega              | 🟢     | Práctica comercial + UNE 56100        | Sí (práctica)              |
| Hoja de Ruta                    | 🟢     | LOTT / RD 70/2019                     | Recomendado (funcional)    |
| Nota de Gastos                  | 🔴     | IRPF + Convenio colectivo transporte  | Sí (si hay reembolso)      |
| Factura de Transporte           | 🟢     | RD 1619/2012 + Ley 18/2022 (eFactura) | Sí (fiscal)                |
| Certificado de Entrega (POD)    | 🟢     | LCTTM / práctica comercial            | Sí (prueba de entrega)     |
| Documento de Transporte ADR     | 🟢     | ADR 2025 (5.4) + RD 97/2014           | Sí (mercancías peligrosas) |
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

**Fecha:** 2026-04-03 (sesión realtime — Suscripciones Supabase Realtime)
**Branch:** feature/realtime (desde `dev`)
**Tests:** 1101 pasando (20 nuevos de use-realtime), 0 errores lint, 0 warnings, typecheck limpio
**Migraciones:** 27 aplicadas (001-027)

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
- **Archivos creados**: `src/composables/use-realtime.js`, `src/composables/use-realtime.spec.js`
- **Archivos modificados**: `use-alerts.js`, `use-vehicles.js`, `use-drivers.js`, `use-routes.js`

**Pendiente para la Edge Function:**

- Configurar `SUPABASE_SERVICE_ROLE_KEY` como secret: `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<key>`
- Desplegar Edge Function: `supabase functions deploy invite-user`
- Obtener service_role key del dashboard: Settings → API → Project API keys

---

## 8.1 Tareas Pendientes (por prioridad)

### Alta — Próxima sesión

| Tarea                            | Módulo    | Descripción                                                                                                         |
| -------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------- |
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

| Tarea                                                                | Fecha     |
| -------------------------------------------------------------------- | --------- |
| CRUD alertas completo                                                | Sesión 11 |
| 9 informes con KPIs + gráficos + export                              | Sesión 12 |
| BD financiera (routes + vehicle_annual_costs + driver_compensation)  | Sesión 12 |
| 26 migraciones aplicadas en Supabase                                 | Sesión B  |
| 27 migraciones creadas (027 pendiente aplicar en Supabase)           | Sesión C  |
| RLS restrictivo en tablas nuevas                                     | Sesión 12 |
| 920 tests TDD                                                        | Sesión 12 |
| Sesión A: correcciones críticas seguridad (4 tareas)                 | Sesión 15 |
| Sesión B: funcionalidad PRD + integraciones (4 tareas)               | Sesión B  |
| 1014 tests TDD (989 + sesión B)                                      | Sesión B  |
| Sesión C: documentos transporte + limpieza integraciones (12 tareas) | Sesión C  |
| 1081 tests TDD (1014 + sesión C)                                     | Sesión C  |
| 27 migraciones aplicadas (001-027)                                   | Sesión C  |

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
| Migraciones SQL                 | SQL          | `supabase/migrations/` (001-027, 027 pendiente aplicar)        |
| Configuración MCP Supabase      | Config       | `~/.config/opencode/opencode.json`                             |
| Material Design 3               | Docs         | https://m3.material.io                                         |
| Vuetify 4                       | Docs         | https://vuetifyjs.com                                          |
| Reglamento CE 561/2006          | Normativa UE | https://eur-lex.europa.eu                                      |
| LCTTM (Ley 15/2009)             | Normativa ES | BOE                                                            |
| ADR 2025                        | Normativa    | UNECE                                                          |
| Ley 9/2025 Movilidad Sostenible | Normativa ES | BOE 04/12/2025                                                 |

---

_Actualiza este fichero al final de cada sesión de trabajo. Verificar que la sección 4 (Estado de Desarrollo) refleja el progreso real._
