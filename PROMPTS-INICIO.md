# PROMPTS DE INICIO — FleetControl

> Instrucciones paso a paso para iniciar el nuevo proyecto FleetControl desde cero
> usando OpenCode. Copiar y pegar cada prompt en orden, uno a uno.
>
> **Antes de empezar:**
> 1. Crear el directorio del nuevo proyecto: `mkdir fleetcontrol && cd fleetcontrol`
> 2. Copiar estos archivos al directorio raíz del nuevo proyecto:
>    - `AGENTS.md`
>    - `AI_CONTEXT.md`
>    - `PRD.md`
>    - `PROMPTS-INICIO.md` (este archivo)
> 3. Copiar el directorio `.opencode/workflows/` con sus 10 archivos
> 4. Instalar Supabase MCP en OpenCode (ver Prompt 0)
> 5. Instalar las skills de Antigravity (ver Prompt 0)
> 6. Abrir OpenCode en el directorio del proyecto
>
> **Convención:** Cada prompt se copia tal cual y se pega en OpenCode.
> Esperar a que el agente termine antes de pasar al siguiente.

---

## PROMPT 0 — Preparación del entorno (manual)

Antes de ejecutar ningún prompt en OpenCode, realizar estos pasos manualmente:

### 0.1 Instalar Supabase MCP en OpenCode

```bash
# Abrir la configuración de OpenCode y añadir el MCP de Supabase
# En ~/.opencode/config.json o .opencode/config.json añadir:
```

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref=TU_PROJECT_REF"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "TU_ACCESS_TOKEN"
      }
    }
  }
}
```

> Reemplazar `TU_PROJECT_REF` con el project reference de Supabase (ej: `abcdefghijklmnop`)
> Reemplazar `TU_ACCESS_TOKEN` con tu Personal Access Token de Supabase
> Obtener en: https://supabase.com/dashboard/account/tokens

### 0.2 Instalar skills de Antigravity

```bash
# Instalar todas las skills en el directorio global de OpenCode
npx antigravity-awesome-skills --path ~/.agents/skills
```

### 0.3 Verificar instalación

```bash
# Verificar que los archivos están en su sitio
ls -la AGENTS.md AI_CONTEXT.md PRD.md
ls -la .opencode/workflows/
```

---

## PROMPT 1 — Lectura de contexto y plan inicial

```
Lee los siguientes archivos en este orden para entender completamente el proyecto:

1. AI_CONTEXT.md — estado actual del proyecto
2. AGENTS.md — reglas del agente
3. PRD.md — requisitos de producto

Una vez leídos, crea un plan detallado de implementación para el proyecto FleetControl.
El plan debe cubrir las fases necesarias para construir el MVP desde cero.

Considera:
- El stack: Vue 3 + Vuetify 4 + Supabase + Pinia + TanStack Query
- Metodología TDD (tests antes que código)
- Feature branches desde `dev`
- Mobile-first responsive
- Cumplimiento normativo España/UE (ver AGENTS.md §1)

Estructura el plan en fases claras con entregables concretos.
No escribas código todavía, solo planifica.
```

---

## PROMPT 2 — Setup del proyecto (scaffolding)

```
Ejecuta el plan de la Fase 1: Setup inicial del proyecto.

Pasos concretos:
1. Inicializar el proyecto con Vite: `npm create vite@latest . -- --template vue`
2. Instalar dependencias: Vuetify 4, Pinia, Vue Router 4, TanStack Query, Vee-Validate, Zod, Supabase JS client
3. Configurar Vuetify 4 con theme oscuro y colores del proyecto (ver AGENTS.md §8)
4. Configurar Vue Router 4 con lazy loading
5. Configurar Pinia con persistencia
6. Configurar TanStack Query (Vue Query)
7. Crear estructura de carpetas target (ver AI_CONTEXT.md §3)
8. Crear tokens CSS en `src/styles/tokens.css` (ver AGENTS.md §8 Color Palette)
9. Crear `.env.example` con variables requeridas (ver AGENTS.md §13)
10. Configurar ESLint + Prettier
11. Configurar Vitest
12. Crear script `check` que ejecuta lint + typecheck en package.json

Usa TDD donde tenga sentido (ej: tests de utilidades).
Ejecuta `npm run check` y `npm test` al finalizar.
Commit del setup inicial en rama `feature/setup`.
```

---

## PROMPT 3 — Base de datos (Supabase)

```
Ejecuta la Fase 2: Configuración de Supabase y esquema de base de datos.

Usa el MCP de Supabase para interactuar con la base de datos directamente.

Pasos:
1. Crear las migraciones SQL iniciales en `supabase/migrations/`:
   - Tabla `profiles` (extensión de auth.users con rol)
   - Tabla `vehicles` (todos los campos del PRD §4.2.1)
   - Tabla `drivers` (todos los campos del PRD §4.3)
   - Tabla `routes` (campos del PRD §4.4)
   - Tabla `maintenance_records` (campos del PRD §4.5)
   - Tabla `fuel_records` (campos del PRD §4.7)
   - Tabla `cargo_records` (campos del PRD §4.6)
   - Tabla `alerts` (campos del PRD §4.8)
   - Tabla `documents` (para gestión documental)

2. Cada tabla debe tener las columnas obligatorias (ver AGENTS.md §16):
   - id uuid PRIMARY KEY DEFAULT gen_random_uuid()
   - created_at timestamptz NOT NULL DEFAULT now()
   - updated_at timestamptz NOT NULL DEFAULT now()
   - created_by uuid REFERENCES auth.users(id)

3. Aplicar tipos correctos (ver AGENTS.md §16):
   - Money: numeric(12,2)
   - GPS: numeric(10,7)
   - Enums: CREATE TYPE
   - Timestamps: timestamptz

4. Configurar RLS policies para cada tabla (ver AGENTS.md §15)

5. Crear índices en columnas de foreign keys y consultas frecuentes

Usa `supabase_apply_migration` para DDL.
Usa `supabase_execute_sql` para verificar que las tablas se crearon correctamente.
Commit en rama `feature/database-schema`.
```

---

## PROMPT 4 — Layout base

```
Ejecuta la Fase 3: Layout base de la aplicación.

Crear los componentes de layout siguiendo AGENTS.md §8 (UI Conventions):

1. `src/components/layout/AppSidebar.vue`:
   - Vuetify v-navigation-drawer
   - Responsive: permanent (lg+), temporary con scrim (md, xs/sm)
   - Agrupado: PRINCIPAL / FLOTA / RUTAS / GESTIÓN / DOCUMENTACIÓN / INFORMES
   - Ítems con iconos Material Symbols
   - Badges numéricos para alertas
   - Perfil de usuario en la parte inferior

2. `src/components/layout/AppTopBar.vue`:
   - Menú hamburguesa (toggle sidebar en mobile)
   - Búsqueda global
   - Icono de notificaciones con badge
   - Avatar de usuario

3. `src/components/layout/AppLayout.vue`:
   - Combina sidebar + top bar + contenido
   - `<router-view>` con transición

4. `src/components/ui/AppNotifications.vue`:
   - Sistema de notificaciones centralizado
   - Lee del store notifications.js

5. Crear store `src/stores/notifications.js` (ver AGENTS.md §8 Vuetify Patterns)

6. Crear store `src/stores/auth.js` (ver AGENTS.md §7)

7. Crear store `src/stores/ui.js` (sidebar collapsed, table page size)

8. Configurar rutas en `src/router/routes.js` con lazy loading
   - Ruta `/login`
   - Ruta `/dashboard` (protegida)
   - Ruta catch-all 404

9. Crear página `DashboardPage.vue` placeholder

Tests TDD para los stores.
Tests de componente para AppSidebar (responsive behavior).
Commit en rama `feature/layout-base`.
```

---

## PROMPT 5 — Autenticación

```
Ejecuta la Fase 4: Sistema de autenticación con Supabase Auth.

1. Crear servicio `src/services/api-auth.js`:
   - login(email, password)
   - register(email, password, metadata)
   - logout()
   - getSession()
   - resetPassword(email)

2. Crear composable `src/composables/use-auth.js`

3. Crear página `LoginPage.vue`:
   - Formulario con email + contraseña
   - Validación con Vee-Validate + Zod
   - Error handling con mensajes en español
   - Loading state en botón

4. Configurar guard en `src/router/index.js`:
   - beforeEach: si requiresAuth y no autenticado → redirect /login
   - Guardar redirect query param

5. Crear página `RegisterPage.vue` (si aplica)

6. Tests TDD:
   - api-auth service (mock Supabase)
   - use-auth composable
   - LoginPage component (form validation, error states)

Commit en rama `feature/auth`.
```

---

## PROMPT 6 — CRUD base (Vehículos como template)

```
Ejecuta la Fase 5: CRUD completo del módulo Vehículos.
Este módulo será el template para los demás módulos CRUD.

Sigue el workflow wf-new-supabase-query.md y wf-new-component.md.

1. Crear `src/services/api-vehicles.js`:
   - Extender createCrudService
   - getPaginated con filtros (status, tipo, distintivo DGT)
   - search por matrícula

2. Crear `src/composables/use-vehicles.js`

3. Crear `src/validations/vehicle-schema.js` (Zod):
   - Todos los campos del PRD §4.2.1
   - Validaciones de matrícula española
   - Validaciones de peso (MMA > 0, MMA <= 44000)
   - Validaciones de dimensiones

4. Crear componentes:
   - `VehicleList.vue` (VDataTableServer paginado, filtros, búsqueda)
   - `VehicleCard.vue` (vista card para mobile)
   - `VehicleForm.vue` (formulario completo con validación)
   - `VehicleDetail.vue` (ficha con secciones colapsables, PRD §6.4)
   - `VehicleDocuments.vue` (tabla documentos con estados)

5. Crear páginas:
   - `VehiclesListPage.vue`
   - `VehicleDetailPage.vue` (/vehicles/:id)
   - `VehicleCreatePage.vue`
   - `VehicleEditPage.vue` (/vehicles/:id/edit)

6. Configurar rutas en router/routes.js

7. Tests TDD:
   - api-vehicles service
   - vehicle-schema validation
   - Componentes (render, estados, eventos)

Commit en rama `feature/vehicles-crud`.
```

---

## PROMPT 7 — Replicar patrón CRUD en módulos restantes

```
Usando el módulo Vehículos como template, implementa los módulos restantes del core.
Implementar en orden, uno por rama:

1. `feature/conductores-crud`:
   - api-drivers.js + use-drivers.js + driver-schema.js
   - Componentes: list, card, form, detail
   - Páginas: list, detail, create, edit
   - Campos según PRD §4.3

2. `feature/rutas-crud`:
   - api-routes.js + use-routes.js + route-schema.js
   - Componentes: list (activas + historial), form (planificación), detail
   - Validación de horas conductor (CE 561/2006)
   - Validación de peso vs MMA
   - Campos según PRD §4.4

3. `feature/mantenimiento-crud`:
   - api-maintenance.js + use-maintenance.js
   - Componentes: list (preventivo + correctivo), form, detail
   - Campos según PRD §4.5

4. `feature/combustible-crud`:
   - api-fuel.js + use-fuel.js
   - Componentes: list, form, charts
   - Cálculo de consumo real L/100km
   - Campos según PRD §4.7

5. `feature/cargas-crud`:
   - api-cargo.js + use-cargo.js
   - Validación ADR (si mercancía peligrosa)
   - Campos según PRD §4.6

Cada módulo: TDD completo, tests unitarios + componente.
npm run check y npm test antes de cada commit.
```

---

## PROMPT 8 — Alertas, Informes y Configuración

```
Implementa los módulos de soporte:

1. `feature/alertas`:
   - Sistema de alertas automáticas
   - api-alerts.js + use-alerts.js
   - Tipos según PRD §4.8
   - Configuración de umbrales por tipo
   - Página de alertas con filtros y acciones

2. `feature/informes`:
   - api-reports.js
   - Informes según PRD §4.9
   - Exportación PDF (usar librería jspdf o similar)
   - Exportación CSV
   - Página de informes con selector de tipo y período

3. `feature/configuracion`:
   - api-settings.js
   - Gestión de usuarios y roles
   - Configuración de empresa
   - Configuración de umbrales de alerta
   - Página de configuración

Cada módulo con TDD y tests.
```

---

## PROMPT 9 — Sistema Realtime y Mapa

```
Implementa las funcionalidades en tiempo real:

1. `feature/realtime`:
   - Suscripciones Supabase Realtime para tablas Tier 1
   - Composable use-realtime.js con cleanup en onUnmounted
   - Patrón según AGENTS.md §17
   - Reconnection automática

2. `feature/mapa`:
   - Integración con Google Maps Platform
   - Componente FleetMap.vue (mapa de flota)
   - Marcadores por vehículo con estado
   - Filtros: Todos / En Ruta / Mantenimiento / Alertas
   - Click en marcador → detalle vehículo
   - Responsive: fullscreen en mobile, sidebar en desktop

Tests de integración para realtime (mock de canal).
```

---

## PROMPT 10 — Documentación de Transporte

```
Implementa el módulo de generación de documentos de transporte.
Este es un módulo crítico que debe cumplir al 100% con la normativa.

Implementar en orden de prioridad:

1. `feature/doc-carta-porte-cmr`:
   - Generación de Carta de Porte CMR según Convenio CMR 1956
   - Todos los campos obligatorios (arts. 5-6)
   - Generación PDF
   - Campos según investigación documental

2. `feature/doc-carta-porte-nacional`:
   - Carta de Porte Nacional según LCTTM (art. 10-12)
   - Todos los campos obligatorios

3. `feature/doc-albaran`:
   - Albarán de entrega según UNE 56100

4. `feature/doc-hoja-ruta`:
   - Hoja de ruta con datos vehículo, conductor, carga, origen/destino

5. `feature/doc-factura`:
   - Factura de transporte según RD 1619/2012
   - Compatible con Ley 18/2022 (eFactura)

6. `feature/doc-pod`:
   - Certificado de entrega (Proof of Delivery)

Cada documento debe tener:
- Servicio de generación: src/services/document-*.js
- Plantilla de datos según normativa
- Generación PDF
- Tests que verifican que TODOS los campos obligatorios están presentes
```

---

## PROMPT 11 — Tacógrafos

```
Implementa el módulo de Tacógrafos.
Módulo crítico para cumplimiento CE 561/2006.

1. `feature/tacografos`:
   - api-tachographs.js + use-tachographs.js
   - Registro de descargas DDD
   - Análisis de conducción/descanso:
     * Tiempo conducción diario (9h/10h)
     * Tiempo conducción semanal (56h)
     * Tiempo conducción bisemanal (90h)
     * Pausa tras 4h30min (45 min)
     * Descanso diario (11h/9h)
     * Descanso semanal (45h/24h)
   - Detección automática de infracciones
   - Visualización semáforo: verde/ámbar/rojo
   - Página de tacógrafos con:
     * Estado actual por conductor
     * Historial de descargas
     * Infracciones detectadas
     * Exportación informe

Todos los límites legales de legal-limits.js.
Tests exhaustivos con casos límite de CE 561/2006.
```

---

## PROMPT 12 — Dashboard con KPIs

```
Implementa el Dashboard principal con KPIs operativos.

1. Actualizar `DashboardPage.vue`:
   - KPIs según PRD §4.1:
     * Camiones totales en flota (delta vs mes anterior)
     * Camiones en ruta ahora (delta vs ayer)
     * Conductores activos (sobre total)
     * Unidades en mantenimiento
     * Rutas completadas hoy (% vs ayer)
     * Alertas activas
     * Violaciones tacógrafo pendientes
   - Tarjetas KPI: 4 col desktop, 2 col tablet, stacked mobile
   - Colores funcionales según estado
   - Mapa de flota integrado (FleetMap.vue)
   - Gráficos de actividad reciente

2. Fetch en paralelo con Promise.all
3. Skeleton loaders durante carga
4. Responsive mobile-first

Tests de componente (render, datos mock, estados).
```

---

## PROMPT 13 — Pulido final

```
Realiza el pulido final antes del primer release:

1. Revisión de accesibilidad completa (AGENTS.md §9):
   - Todos los elementos interactivos son operables por teclado
   - ARIA labels correctos
   - Contraste de color WCAG 2.1 AA
   - Focus management en modales
   - data-testid en todos los elementos interactivos

2. Revisión de rendimiento (AGENTS.md §10):
   - Lazy loading en todas las rutas
   - Virtual scroll en listas > 100 items
   - Optimización de imágenes
   - Debounce en búsqueda

3. Revisión de seguridad (AGENTS.md §12):
   - RLS policies verificadas
   - Input validation con Zod en todos los formularios
   - Error messages genéricos al usuario
   - No credenciales en código

4. Ejecutar check completo:
   - npm run check (lint + typecheck)
   - npm test (todos los tests)
   - npm run build (verificar que compila)

5. Actualizar AI_CONTEXT.md con estado final

6. Commit final y merge a `dev`
```

---

## REFERENCIAS RÁPIDAS

### Archivos del proyecto
| Archivo | Propósito |
|---------|-----------|
| `AGENTS.md` | Reglas del agente (siempre activo) |
| `AI_CONTEXT.md` | Estado del proyecto (actualizar tras cada sesión) |
| `PRD.md` | Requisitos de producto |
| `.opencode/workflows/` | Workflows del agente (14 archivos) |

### Workflows disponibles
| Workflow | Cuándo usar |
|----------|-------------|
| `wf-debug.md` | Bug difícil — debugging sistemático |
| `wf-done.md` | Checklist de salida antes de mergear |
| `wf-optimize.md` | Optimizar rendimiento con métricas |
| `wf-refactor.md` | Mejorar código existente (7 dimensiones) |
| `wf-review.md` | Code review estructurado (8 dimensiones) |
| `wf-tdd.md` | TDD RED→GREEN→REFACTOR |
| `wf-new-component.md` | Crear componente Vue 3 + Vuetify 4 |
| `wf-new-composable.md` | Crear composable Vue 3 |
| `wf-new-document.md` | Crear documento de transporte normativo |
| `wf-new-migration.md` | Crear migración SQL Supabase |
| `wf-new-service.md` | Crear servicio API Supabase |
| `wf-new-store.md` | Crear Pinia store |
| `wf-new-supabase-query.md` | Crear operación Supabase (CRUD, Realtime) |
| `wf-new-view.md` | Crear página/route con Vue Router |

### Skills a usar (si están instaladas)
| Skill | Cuándo usar |
|-------|-------------|
| `supabase-postgres-best-practices` | Al crear migraciones SQL, queries, RLS |
| `@test-driven-development` | Al implementar cualquier funcionalidad nueva |
| `@security-auditor` | Al revisar autenticación, RLS, inputs |
| `@frontend-design` | Al crear componentes UI |
| `@debugging-strategies` | Al encontrar bugs |
| `@architecture` | Al diseñar la estructura del proyecto |
| `@lint-and-validate` | Antes de cada commit |

### MCP Supabase — comandos útiles
| Comando | Propósito |
|---------|-----------|
| `supabase_apply_migration` | Crear/alterar tablas (DDL) |
| `supabase_execute_sql` | Ejecutar queries (SELECT, INSERT, etc.) |
| `supabase_list_tables` | Ver tablas existentes |
| `supabase_get_advisors` | Verificar seguridad y rendimiento |
| `supabase_generate_typescript_types` | Generar tipos desde el schema |

### Flujo por prompt
```
Prompt 0  → Preparación manual (MCP + skills + copiar archivos)
Prompt 1  → Lectura contexto + plan
Prompt 2  → Setup proyecto (Vite + dependencias)
Prompt 3  → Base de datos (Supabase schema + RLS)
Prompt 4  → Layout base (sidebar, topbar, stores)
Prompt 5  → Autenticación (Supabase Auth)
Prompt 6  → CRUD Vehículos (template)
Prompt 7  → CRUD módulos restantes
Prompt 8  → Alertas, Informes, Configuración
Prompt 9  → Realtime + Mapa
Prompt 10 → Documentación de Transporte
Prompt 11 → Tacógrafos
Prompt 12 → Dashboard con KPIs
Prompt 13 → Pulido final
```

---

*Archivo generado para el proyecto FleetControl v2.0.*
*Última actualización: 2026-03-29*
