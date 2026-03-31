# AI_CONTEXT.md — Estado Actual del Proyecto

## FleetControl

> **DOCUMENTO VIVO.** Actualizar al final de cada sesión de trabajo o cuando
> cambie algo relevante. El agente de IA lee este fichero al inicio de cada tarea
> para tener el contexto exacto del estado del proyecto sin necesidad de
> explicarlo en cada conversación.
>
> **Última actualización:** 2026-03-31 (sesión 7)
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
Testing:              Vitest + Cypress
Linting:              ESLint + Prettier

Backend:              Supabase
Base de datos:        PostgreSQL
Autenticación:        Supabase Auth
Almacenamiento docs:  Supabase Storage
Email transaccional:  Brevo
GPS/Telemática API:   [PENDIENTE]
Despliegue:           [PENDIENTE]
Automatización:       [PENDIENTE]
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
    │   └── ui/                   ← Componentes reutilizables
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
| Módulo Alertas             | 🔴 Sin empezar | Tabla, filtros, acciones, compliance                                         |
| Módulo Informes            | 🔴 Sin empezar | Operativos + regulatorios                                                    |
| Configuración              | 🔴 Sin empezar | Empresa, usuarios, integraciones                                             |
| Sistema de Notificaciones  | 🔴 Sin empezar | In-app, email                                                                |
| GPS/Telemática             | 🔴 Sin empezar | Integración con proveedor                                                    |
| Sistema Realtime           | 🔴 Sin empezar | Tablas Tier 1                                                                |
| Testing (TDD)              | 🟡 En progreso | 392 tests (Vitest), lint + typecheck, Cypress pendiente                      |

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

**Fecha:** 2026-03-30 (sesión 3)
**Branch:** dev
**Tests:** 392 pasando, 0 errores lint, typecheck limpio

**Trabajo realizado:**

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
   - `RouteCompliancePanel.vue` creado (banner reactivo de compliance)
   - `RouteForm.vue` actualizado: guarda objeto vehículo, selector subcategoría agrupado, panel compliance
   - `route-schema.js` actualizado con `subcategoria_id` opcional
   - Tipo legado eliminado del formulario (se deriva automáticamente de la subcategoría)
2. **COMPLETADO**: Definir equipamiento para 11 subcategorías (sesión 5).
3. **COMPLETADO**: Integrar `vehicle_documents` con compliance real contra documentos vigentes (sesión 6).
   - Acciones NO incluidas (pendientes futuro):
     - CRUD completo de documentos en UI (formulario subida/edición/borrado)
     - Validación de certificado ADR vehículo en subcategorías ADR
4. **PENDIENTE (bajo)**: Eliminar columnas de backup en BD si existen.

**Bloqueos activos:**

- Ninguno. Conexión Supabase operativa.

---

## 9. Referencias y Recursos

| Recurso                         | Tipo         | Ubicación                                  |
| ------------------------------- | ------------ | ------------------------------------------ |
| PRD completo                    | Documento    | `PRD.md`                                   |
| Reglas del agente               | Documento    | `AGENTS.md`                                |
| Workflows del agente            | Plantillas   | `.opencode/workflows/` (10 archivos)       |
| Skills del agente               | Documento    | `/home/cesar/.agents/skills/`              |
| Constantes legales              | Código       | `src/constants/legal-limits.js`            |
| Taxonomía de cargas             | Código       | `src/constants/cargo-categories.js`        |
| Equipamiento vehículos          | Código       | `src/constants/vehicle-equipment.js`       |
| Tipos de vehículo (UE)          | Código       | `src/constants/vehicle-types.js`           |
| Compliance de cargas            | Código       | `src/utils/cargo-compliance.js`            |
| Tipos de documentos conductor   | Código       | `src/constants/driver-document-types.js`   |
| Tipos de documentos             | Código       | `src/constants/document-types.js`          |
| Schema BD (esquema real)        | SQL          | `information_schema` (fuente de verdad)    |
| Migraciones SQL                 | SQL          | `supabase/migrations/` (001-016 aplicadas) |
| Configuración MCP Supabase      | Config       | `~/.config/opencode/opencode.json`         |
| Material Design 3               | Docs         | https://m3.material.io                     |
| Vuetify 4                       | Docs         | https://vuetifyjs.com                      |
| Reglamento CE 561/2006          | Normativa UE | https://eur-lex.europa.eu                  |
| LCTTM (Ley 15/2009)             | Normativa ES | BOE                                        |
| ADR 2025                        | Normativa    | UNECE                                      |
| Ley 9/2025 Movilidad Sostenible | Normativa ES | BOE 04/12/2025                             |

---

_Actualiza este fichero al final de cada sesión de trabajo. Verificar que la sección 4 (Estado de Desarrollo) refleja el progreso real._
