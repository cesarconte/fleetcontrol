# AI_CONTEXT.md — Estado Actual del Proyecto

## FleetControl

> **DOCUMENTO VIVO.** Actualizar al final de cada sesión de trabajo o cuando
> cambie algo relevante. El agente de IA lee este fichero al inicio de cada tarea
> para tener el contexto exacto del estado del proyecto sin necesidad de
> explicarlo en cada conversación.
>
> **Última actualización:** 2026-03-30
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
| Testing (TDD)              | 🔴 Sin empezar | Vitest + Cypress                                                             |

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

- Los mockups de referencia están en `/docs/mockups/`.
- Los colores se definen como tokens CSS en `/src/styles/tokens.css`.
- Las constantes legales van en `/src/constants/legal-limits.js`.
- Los esquemas Zod se colocan en `/src/validations/`.
- Los tests se colocan junto al archivo source (`*.spec.js`).
- Las migraciones SQL van en `supabase/migrations/`.
- Los documentos de transporte se generan desde `/src/services/document-*.js`.
- Los workflows del agente están en `.opencode/workflows/`.
- Los skills del agente están en `/home/cesar/.agents/skills/`.

---

## 8. Contexto de la Última Sesión

**Fecha:** 2026-03-30
**Branch:** dev (feature/taxonomia-cargas merged)

**Trabajo realizado:**

### Sesión 1 — Taxonomía de Cargas (completada)

- Taxonomía jerárquica completa: 4 categorías, 27 subcategorías con requisitos de vehículo
- Equipamiento normativo por subcategoría (ADR, ATP, Animales, Carga General) con referencias legales
- Módulo de compliance: verificación vehículo-carga con auto-checks y checklists
- Selector jerárquico en CargoForm (categoría → subcategoría)
- Sección "Requisitos y Normativa" en CargoDetail
- Validación Zod con `subcategoria_id` y cross-validation
- Migración `20260330_015_cargo_taxonomia.sql` (11 nuevos vehicle_type + subcategoria_id)
- 375 tests pasando

### Sesión 2 — Reestructuración Modelo Vehículos (EU)

- **Nuevo modelo de 3 campos** según normativa UE/RD 2822/1998:
  - `categoria_ue` (eu_categoria enum): N1, N2, N3, O1, O2, O3, O4
  - `tipo_carroceria` (vehicle_body_type enum): 21 valores de utilización
  - Campo antiguo `tipo_vehiculo` renombrado a `tipo_vehiculo_deprecated`
- **Nuevas constantes**: `vehicle-types.js` con 3 enums congeladas + 30 tests
- **Migración SQL creada**: `20260330_016_vehicle_types.sql` (252 líneas)
  - Crea 2 enums nuevos, migra datos existentes, índices nuevos
- **Schema Zod actualizado**: `vehicle-schema.js` derivado de constantes (DRY)
- **4 componentes UI actualizados**: VehicleForm (2 selects), VehicleDetail (2 campos), VehicleList (filtro carrocería), VehicleCard (label carrocería)
- **Compliance actualizado**: `cargo-compliance.js` usa `tipo_carroceria` para compatibilidad
- **Eliminados**: 4 copias de `getTypeLabel()` hardcodeado, 2 copias de `typeOptions` hardcodeado
- **411 tests pasando**, lint 0 errores, typecheck OK

**Archivos creados (esta sesión):**

- `src/constants/vehicle-types.js` + `.spec.js` (3 enums UE + helpers + 30 tests)
- `supabase/migrations/20260330_016_vehicle_types.sql`

**Archivos modificados (esta sesión):**

- `src/validations/vehicle-schema.js` + `.spec.js` (3 campos UE)
- `src/components/vehicles/VehicleForm.vue` (3 selects: UE + carrocería + estado)
- `src/components/vehicles/VehicleDetail.vue` (2 campos + imports)
- `src/components/vehicles/VehicleList.vue` (filtro carrocería + imports)
- `src/components/vehicles/VehicleCard.vue` (label carrocería + imports)
- `src/utils/cargo-compliance.js` + `.spec.js` (compatibilidad por carrocería)
- `src/services/api-vehicles.js` (filtros por categoria_ue y tipo_carroceria)

**Próximos pasos (tareas pendientes):**

1. **PENDIENTE URGENTE: Aplicar migraciones a Supabase**
   - `20260330_015_cargo_taxonomia.sql` (subcategoria_id + vehicle_type ampliado)
   - `20260330_016_vehicle_types.sql` (reestructuración 3 campos UE)
   - Conexión no disponible en estas sesiones. Ejecutar manualmente o cuando la conexión esté activa.
2. **PENDIENTE**: Eliminar columnas de backup en futura migración (`tipo_vehiculo_deprecated`, `tipo_vehiculo_old_value`) una vez verificado que todo funciona con los nuevos campos.
3. **PENDIENTE Fase 5.1**: Integrar `checkVehicleCompliance()` en la planificación de rutas (§4.4.3 PRD).
4. **PENDIENTE**: Definir equipamiento para 6 subcategorías gen sin equipamiento específico.
5. **PENDIENTE**: Crear tabla `vehicle_documents` para compliance real contra documentos vigentes.
6. **PENDIENTE**: Actualizar `CargoList.vue` y `CargoCard.vue` para mostrar subcategoría y badge de compliance.
7. **PENDIENTE**: Actualizar `api-vehicles.spec.js` para usar los nuevos campos en fixtures.

**Bloqueos activos:**

- Conexión a Supabase no disponible para aplicar migraciones (no bloqueante para desarrollo local)

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
| Tipos de documentos             | Código       | `src/constants/document-types.js`                      |
| Schema BD                       | SQL          | `supabase/migrations/`                                 |
| Migración taxonomía cargas      | SQL          | `supabase/migrations/20260330_015_cargo_taxonomia.sql` |
| Migración tipos vehículo UE     | SQL          | `supabase/migrations/20260330_016_vehicle_types.sql`   |
| Material Design 3               | Docs         | https://m3.material.io                                 |
| Vuetify 4                       | Docs         | https://vuetifyjs.com                                  |
| Reglamento CE 561/2006          | Normativa UE | https://eur-lex.europa.eu                              |
| LCTTM (Ley 15/2009)             | Normativa ES | BOE                                                    |
| ADR 2025                        | Normativa    | UNECE                                                  |
| Ley 9/2025 Movilidad Sostenible | Normativa ES | BOE 04/12/2025                                         |

---

_Actualiza este fichero al final de cada sesión de trabajo. Verificar que la sección 4 (Estado de Desarrollo) refleja el progreso real._
