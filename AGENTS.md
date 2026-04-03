# FleetControl — Agent Guidelines

## 1. Project Context

- **FleetControl**: SPA de gestión de flotas de transporte de mercancías por carretera (España)
- **Stack**: Vue 3 (Composition API + `<script setup>`), Vuetify 4, Pinia, Vue Router 4, TanStack Query, Vee-Validate + Zod, Supabase (Auth, DB, Storage, Edge Functions, Realtime), Vitest, Cypress
- **Language**: JavaScript (ES2022) — no TypeScript en runtime
- **Package manager**: npm

### Regulatory Context (Spain + EU)

#### Transport Organization

| Norma        | Referencia                  | Contenido                                                                                |
| ------------ | --------------------------- | ---------------------------------------------------------------------------------------- |
| LOTT         | Ley 16/1987                 | Ley matriz: autorizaciones, régimen sancionador                                          |
| ROTT         | RD 1211/1990                | Reglamento desarrollo LOTT                                                               |
| Ley 9/2013   | Ley 9/2013                  | Liberalización, subcontratación                                                          |
| Ley 9/2025   | Ley 9/2025 (BOE 04/12/2025) | **NUEVA**: Movilidad Sostenible — Documento Control Digital obligatorio desde 05/10/2026 |
| RD 242/2022  | RD 242/2022                 | Documentación digital y e-CMR                                                            |
| LCTTM        | Ley 15/2009                 | Contrato transporte terrestre mercancías                                                 |
| Convenio CMR | Convenio CMR 1956           | Transporte internacional mercancías                                                      |

#### Driving Times & Rest (CE 561/2006 + Mobility Package I)

| Parámetro                     | Límite                                               |
| ----------------------------- | ---------------------------------------------------- |
| Conducción diaria             | 9h (ampliable a 10h, máx. 2 veces/semana)            |
| Conducción semanal            | 56h                                                  |
| Conducción bisemanal          | 90h                                                  |
| Pausa tras 4h30min conducción | 45 min (o 15+30 min)                                 |
| Descanso diario normal        | 11h (reducible a 9h, máx. 3 veces/periodo bisemanal) |
| Descanso semanal normal       | 45h                                                  |
| Descanso semanal reducido     | 24h (con compensación antes de 3ª semana)            |
| Retorno centro operativo      | Cada 4 semanas (Reg. 2020/1054)                      |
| Descanso semanal en vehículo  | **Prohibido** (TJUE 04/10/2024)                      |

Reg. transposición española: **RD 284/2021**

#### Working Time (RD 1561/1995)

| Parámetro               | Límite                               |
| ----------------------- | ------------------------------------ |
| Jornada diaria máxima   | 9h (ampliable a 10h, 2 veces/semana) |
| Jornada semanal máxima  | 48h (media 4 meses: 40h)             |
| Descanso entre jornadas | 12h (10h si vehículo con litera)     |
| Descanso semanal        | 36h ininterrumpidas                  |

> **Regla**: Cumplir el más restrictivo entre conducción (561/2006) y trabajo (1561/1995).

#### Tachographs

| Norma                      | Referencia                 |
| -------------------------- | -------------------------- |
| Marco general              | Reg. UE 165/2014           |
| Specs técnicas v1          | Reg. UE 2016/799           |
| Smart Tachograph v2 (G2V2) | Reg. Delegado UE 2021/1228 |

Plazos G2V2:

- 21/08/2023: obligatorio en vehículos nuevos
- 31/12/2024: fin plazo analógicos → G2V2
- 21/08/2025: fin plazo v1 → G2V2 (internacional)
- 01/07/2026: vehículos ligeros 2.5–3.5t (internacional) → G2V2

#### Vehicle Dimensions & Weights

| Norma                        | Referencia         |
| ---------------------------- | ------------------ |
| Reglamento general vehículos | RD 2822/1998       |
| Masas y dimensiones UE       | Reg. UE 1230/2012  |
| Actualización 2025           | Orden PJC/780/2025 |

Límites clave:

- Ancho: 2.55m (2.60m frigoríficos)
- Altura: 4.00m
- Largo articulado: 16.50m
- MMA estándar: 40t / MMA eco: 44t (Orden PJC/780/2025)

#### Speed Limits (TRLGSV — Ley 18/2021)

| Vía                    | >3.5t   | Conjuntos >3.5t |
| ---------------------- | ------- | --------------- |
| Autopista/Autovía      | 90 km/h | 80 km/h         |
| Carretera convencional | 80 km/h | 70 km/h         |
| Urbana                 | 50 km/h | 50 km/h         |
| Zona 30                | 30 km/h | 30 km/h         |

#### ITV (RD 2042/1994 + Manual ITV v7.8)

- Vehículos >3.5t: **anual** (primer ITV: 1 año desde matriculación)
- Remolques >3.5t: **anual**
- Transporte viajeros >9 plazas: **cada 6 meses**

#### Professional Drivers — CAP

| Norma                  | Referencia           |
| ---------------------- | -------------------- |
| CAP inicial y continua | RD 1032/2007         |
| Marco UE               | Directiva 2003/59/CE |

- Formación continua: 35h cada 5 años
- Validez tarjeta: 5 años
- Edad mínima: 18 (nacional) / 21 (internacional)

#### ADR — Dangerous Goods

| Norma                | Referencia                            |
| -------------------- | ------------------------------------- |
| ADR vigente          | ADR 2025 (enmiendas sesiones 111-114) |
| Transposición España | RD 97/2014                            |
| Normas seguridad     | RD 1202/2005                          |

- Certificado conductor: renovación cada 5 años
- Certificado vehículo: anual
- Consejero de Seguridad: obligatorio para empresas
- Clasificación: clases 1-9, etiquetado específico

#### Insurance (RDL 8/2004 + Ley 5/2025)

- Daños personales: sin límite
- Daños materiales: mínimo 1.2M€/siniestro
- Responsabilidad asegurado: 70M€ (Ley 5/2025)
- Mercancías (LCTTM): ~5.34€/kg peso bruto

#### Emissions & Environment

| Norma                  | Referencia        |
| ---------------------- | ----------------- |
| Zonas Bajas Emisiones  | RD 1052/2022      |
| Emisiones CO₂ camiones | Reg. UE 2019/1242 |

Etiquetas DGT: 0, Eco, C, B (sin etiqueta = sin acceso ZBE)

- ZBE obligatorias en municipios >50.000 hab.
- Restricciones etiqueta B en ZBE desde 2026

#### Cabotage & International Transport

| Norma                   | Referencia        |
| ----------------------- | ----------------- |
| Acceso mercado cabotaje | Reg. CE 1072/2009 |
| Mobility Package I      | Reg. UE 2020/1055 |

- Máximo 3 operaciones cabotaje en 7 días, carencia 4 días
- Obligación retorno vehículo al centro operativo

#### Data Protection (RGPD + LOPDGDD)

- Datos conductores: base legal 6.1.c (obligación legal)
- Datos tacógrafo: conservación mínima 12 meses (recomendado 5 años)
- Geolocalización: información al conductor obligatoria (art. 13 RGPD)

#### Sanctions (LOTT arts. 136-149)

| Tipo      | Prescripción | Sanción       |
| --------- | ------------ | ------------- |
| Leve      | 6 meses      | hasta 4.000€  |
| Grave     | 1 año        | 4.001–6.000€  |
| Muy grave | 2 años       | 6.001–18.000€ |

#### Other Relevant Regulations

- Transporte perecedero (ATP): RD 635/1984
- Transporte animales vivos: RD 1136/1997 + Reg. CE 1/2005
- Transporte combinado: Directiva 92/106/CEE
- Facturación electrónica: Ley 18/2022 (Crea y Crece)
- Peajes: RD 205/2025
- Inspección transporte: RD 1387/2011

#### Key Constants Reference

All numeric limits are defined in `src/constants/legal-limits.js` — this is the single source of truth. Never hardcode regulatory values elsewhere.

---

## 2. Context Files (MANDATORY)

Before ANY coding task, read these files in order:

1. `AI_CONTEXT.md` — Current project state and stack details
2. `AGENTS.md` — This file (coding conventions and rules)
3. `PRD.md` — Product requirements for full scope reference
4. `src/constants/legal-limits.js` — Regulatory numeric limits (single source of truth)

Load the relevant skill when the task matches:

| Tarea FleetControl                  | Skill a cargar                                       | Ruta                                                                  |
| ----------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------- |
| UI components, layout, responsive   | `ui-ux-pro-max`                                      | `file:///home/cesar/.agents/skills/ui-ux-pro-max`                     |
| Frontend patterns, a11y, testing    | `senior-frontend`                                    | `file:///home/cesar/.agents/skills/senior-frontend`                   |
| Testing TDD, factories, mocking     | `testing-patterns`,                                  | `file:///home/cesar/.agents/skills/testing-patterns`                  |
| Supabase/Postgres schema, RLS, perf | `supabase-postgres-best-practices`                   | `file:///home/cesar/.agents/skills/supabase-postgres-best-practices`  |
| Vue patterns, Composition API       | `vue-best-practices` (ref AGENTS.md §4 Vue Patterns) | —                                                                     |
| Git workflows, PRs, branching       | `git-advanced-workflows`                             | `file:///home/cesar/.agents/skills/git-advanced-workflows`            |
| Deployment, CI/CD                   | `cicd-automation-workflow-automate`                  | `file:///home/cesar/.agents/skills/cicd-automation-workflow-automate` |
| Security audit, vulnerabilities     | `security-audit`                                     | `file:///home/cesar/.agents/skills/security-audit`                    |
| API design, REST patterns           | `api-design-principles`                              | `file:///home/cesar/.agents/skills/api-design-principles`             |
| Accessibility audit (WCAG)          | `fixing-accessibility`                               | `file:///home/cesar/.agents/skills/fixing-accessibility`              |
| Clean code, refactoring             | `clean-code`                                         | `file:///home/cesar/.agents/skills/clean-code`                        |
| Debugging, error analysis           | `systematic-debugging`                               | `file:///home/cesar/.agents/skills/systematic-debugging`              |

> **Regla**: Cargar el skill ANTES de empezar la tarea. El skill inyecta
> instrucciones y workflows específicos en el contexto de la conversación.

After completing ANY task, update `AI_CONTEXT.md` with:

- What was done
- Files created/modified
- Next steps / blockers

---

## 3. Available Commands

```bash
# Development
npm run dev         # Start dev server (http://localhost:5173)
npm run build       # Production build
npm run preview     # Preview production build

# Testing
npm test            # Run unit tests (vitest run)
npm test -- path    # Run single test file
npm test:watch      # Run tests in watch mode
npm test:coverage   # Run tests with coverage report
npm test:ui         # Open Vitest UI
npm run cypress     # Run E2E tests (headless)
npm run cypress:open # Open Cypress UI
npm run test:all    # Run all tests (unit + E2E)

# Quality
npm run lint        # Linting (ESLint)
npm run lint:fix    # Linting with auto-fix
npm run typecheck   # Type checking (vue-tsc with JSDoc)
npm run check       # Run lint + typecheck
```

**Rule**: Always run `npm run check` (lint + typecheck) after completing any code change. Verify it passes before reporting task done.

---

## 4. Code Style Guidelines

### Design Principles (ALWAYS apply)

- **DRY** (Don't Repeat Yourself): Never duplicate logic. Extract to composable, util, constant, or shared component.
- **KISS** (Keep It Simple, Stupid): Choose the simplest solution that works. No over-engineering.
- **SRP** (Single Responsibility Principle): Each file, function, and component does ONE thing well.
- **YAGNI** (You Aren't Gonna Need It): Don't build what isn't needed yet. No speculative abstractions.
- **Clean Code**: Descriptive names, small functions (<30 lines), no magic numbers. Comments explain WHY, not WHAT.
- **Inmutabilidad**: Prefer pure functions. Avoid direct state mutation. Never store derivable data in state.
- **Composición**: All reusable logic goes to dedicated modules, composables, or hooks.
- **DI for testability**: Apply dependency injection where testability requires it. Avoid hard-to-mock singletons.

### Comments

- Comments explain WHY, never WHAT.
- JSDoc for all public functions: what it does, params, return, exceptions, example.
- TODOs with date and ticket: `// TODO 2026-03-12 #123: description`
- No commented-out code. If unused, delete it.

### File Organization

- **Max 200 lines/file** — split if approaching limit (hard limit: 300 lines)
- **Composables**: `/src/composables/use-*.js` — one composable per domain (e.g., `useVehicles.js`)
- **Services**: `/src/services/*.js` — one file per API domain (e.g., `api-vehicles.js`)
- **Utils**: `/src/utils/*.js` — pure functions, no side effects
- **Constants**: `/src/constants/*.js` — enums and legal limits as frozen objects
- **Types**: `/src/types/*.js` — JSDoc type definitions
- **Validations**: `/src/validations/*.js` — Zod schemas
- **Tests**: Place test files alongside source files (`*.spec.js`)

### Imports

- Use `@/` alias for absolute imports from `src/`
- Never use relative paths like `../../..`
- Import order: Vue, External Libraries, Internal Modules (Composables → Services → Constants → Utils → Components)

### Naming Conventions

| Type                | Convention           | Example                               |
| ------------------- | -------------------- | ------------------------------------- |
| Components          | PascalCase + `.vue`  | `VehicleCard.vue`                     |
| Variables/functions | camelCase            | `activeRoutes`, `getActiveVehicles()` |
| Constants           | SCREAMING_SNAKE_CASE | `MAX_DRIVING_HOURS_DAILY`             |
| Composables         | `use` + PascalCase   | `useVehicles`, `useAlerts`            |
| Services            | `api-` + kebab-case  | `api-vehicles.js`, `api-waybills.js`  |
| Tests               | `*.spec.js`          | `useVehicles.spec.js`                 |

### Vue Patterns

- **Composition API only** — no Options API
- Use `<script setup>` syntax exclusively
- Keep business logic in composables, not components

**Order inside `<script setup>` (mandatory):**

1. Imports externos (Vue, librerías)
2. Imports internos (stores, composables, utils, componentes)
3. Props y emits (`defineProps`, `defineEmits`)
4. Stores (`useXxxStore()`)
5. Estado reactivo local (`ref`, `reactive`)
6. Computed
7. Watchers (`watch`, `watchEffect`)
8. Lifecycle hooks (`onMounted`, `onUnmounted`)
9. Funciones y handlers

**Props & Emits:**

```js
const props = defineProps({
  userId: { type: String, required: true },
  isLoading: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])
```

- Props: camelCase in script, kebab-case in template (Vue resolves automatically)
- Never mutate a prop directly — emit event to parent
- Use `v-model` with `modelValue` + `update:modelValue` for controlled components

**Reactivity:**

```js
// ref: for primitives and values that can be null/undefined
const count = ref(0)
const user = ref(null)

// reactive: for compound objects that won't be reassigned
const formState = reactive({ name: '', email: '', isValid: false })

// computed: derive data only, never side effects
const fullName = computed(() => `${user.value?.firstName} ${user.value?.lastName}`)

// watch: react to specific changes with previous value available
watch(
  () => props.userId,
  async (newId, oldId) => {
    if (newId !== oldId) await loadUser(newId)
  },
  { immediate: true },
)
```

- Never destructure `reactive` without `toRefs`
- Never use `.value` in template (Vue resolves it automatically)
- Never create computed with side effects — use `watch` or `watchEffect`
- Clean up watchers, listeners and subscriptions in `onUnmounted`

**Template Rules:**

- Don't use `v-if` and `v-for` on the same element — use `<template>` as wrapper
- `v-for` always on the child element, never on the container
- `v-for` always with `:key` — never use array index as key
- `v-show` only for frequent toggles; `v-if` for conditional rendering
- PascalCase component names in template
- Use shorthand: `:` for `v-bind`, `@` for `v-on`, `#` for `v-slot`
- Max one simple expression in interpolation: `{{ isLoggedIn ? user.name : 'Invitado' }}`

**Vue Router:**

- Use `useRouter()` / `useRoute()`, never `$router` / `$route`
- Lazy loading mandatory on ALL routes: `component: () => import('@/pages/XPage.vue')`
- Auth guards in router config (`beforeEach`), not inside view components
- Validate route params on entry — never assume they're correct
- Separate `router/index.js` (init) from `router/routes.js` (definitions)

**Composables:**

```js
// src/composables/use-vehicles.js
export function useVehicles(filters = {}) {
  const isLoading = ref(false)
  const error = ref(null)
  const items = ref([])

  async function fetch() {
    isLoading.value = true
    error.value = null
    try {
      items.value = await apiVehicles.getPaginated(filters)
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  return { items, isLoading, error, fetch }
}
```

- Name: always `use` + PascalCase concept: `useVehicles`, `useAlerts`
- Return individual refs, never a destructured reactive
- No direct DOM access — use `templateRef` or `useTemplateRef`
- Document with JSDoc: what it receives, returns, and side effects

**What the agent NEVER does in Vue:**

- Use Options API in new code
- Mutate props directly
- Use `this` inside `<script setup>`
- Mix business logic with presentation in a component
- Leave watchers or listeners uncleaned in `onUnmounted`
- Use array index as `v-for` key
- Put complex logic in template instead of extracting to computed
- Create composables without JSDoc or typed return
- Access stores directly from template without passing through computed

### JavaScript (ES2022)

- Use `const` by default, `let` when reassignment needed, never `var`
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Use `Object.freeze()` for constants/enums
- Use JSDoc for type hints when complex types are needed:
  ```js
  /** @param {{ id: string, name: string }} vehicle */
  ```
- No `any` type in JSDoc without documented justification

### Error Handling

- All async calls must have try/catch
- Set error state on catch, clear on success
- Never swallow errors silently
- Never expose stack traces to users
- Use the app's toast system for user-facing errors

---

## 5. State Management Conventions

### When to use what

| Concern                             | Layer                                | Example                                                             |
| ----------------------------------- | ------------------------------------ | ------------------------------------------------------------------- |
| Auth, user session, global UI state | Pinia store                          | `stores/auth.js`                                                    |
| Server data (CRUD, lists, queries)  | TanStack Query + service             | `useQuery({ queryKey: ['vehicles'], queryFn: apiVehicles.getAll })` |
| Derived/computed state              | Composable (computed)                | `useVehicleStats()`                                                 |
| Realtime subscriptions              | Composable wrapping Supabase channel | `useVehicles().subscribeToVehicles()`                               |

### Rules

- NEVER duplicate server data in Pinia — use TanStack Query for caching/fetching
- Pinia stores: max 200 lines, setup syntax only, persist only auth/UI prefs
- Composables: pure reactive logic, no direct `supabase.from()` calls
- TanStack Query keys: `['entity', 'list', filters]` / `['entity', 'detail', id]`

---

## 6. API Service Pattern

### Structure

```js
// services/api-vehicles.js
import { createCrudService } from "./create-crud-service";
const base = createCrudService("vehicles", { orderBy: "plate" });

export const apiVehicles = {
  ...base,
  // Custom queries only — base CRUD is inherited
  async search(query) { ... },
  async getPaginated({ page, pageSize, filters, sort }) { ... },
};
```

### Mandatory: Paginated lists

All list endpoints must support server-side pagination:

```js
async getPaginated({ page = 1, pageSize = 25, filters = {}, sort = { col: 'created_at', asc: false } } = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase.from(table).select('*', { count: 'exact' }).range(from, to);
  // Apply filters, sort...
  const { data, error, count } = await query;
  if (error) throw mapSupabaseError(error);
  return { data, total: count, page, pageSize };
}
```

### Error mapping

NEVER raw Supabase errors to UI. Map via `utils/error-map.js`:
| Supabase code | User message (ES) |
|---------------|-------------------|
| `23505` | "Este registro ya existe" |
| `PGRST116` | "No encontrado" |
| `42501` | "Sin permisos para esta acción" |
| Network error | "Error de conexión. Inténtelo de nuevo." |

---

## 7. Pinia Store Rules

### Structure — Setup Store syntax (mandatory)

```js
// src/stores/auth.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  // ── State (always 3 layers: data + loading + error) ────────────────
  const currentUser = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // ── Getters (computed — derive only, never side effects) ───────────
  const isAuthenticated = computed(() => currentUser.value !== null)
  const getUserById = computed(() => id => users.value.find(u => u.id === id))

  // ── Actions (sync or async — only place state is modified) ────────
  async function login(email, password) {
    isLoading.value = true
    error.value = null
    try {
      currentUser.value = await apiAuth.login(email, password)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function resetState() {
    currentUser.value = null
    error.value = null
  }

  return {
    currentUser,
    isLoading,
    error,
    isAuthenticated,
    getUserById,
    login,
    resetState,
  }
})
```

### Domain stores

```
src/stores/
  auth.js          ← autenticación y sesión
  ui.js            ← estado global de UI (sidebar, theme)
  notifications.js ← sistema de notificaciones/toasts
```

- One store = one business domain. Never a "general" store.
- If a store exceeds 150 lines, split by subdomain.
- Never duplicate state between stores. Import one store into another if needed.

### State pattern

```js
const items = ref([]) // los datos
const isLoading = ref(false) // estado de la operación
const error = ref(null) // error de la última operación
```

- Only data shared between unrelated components or that must persist between navigations.
- NOT in store: local component state (forms, toggles), data derivable from existing store data.

### Getters

```js
// Simple
const totalItems = computed(() => items.value.length)

// Parametrized (returns a function)
const getItemById = computed(() => id => items.value.find(i => i.id === id))

// Cross-store (import inside the getter, not at module level)
const enrichedItems = computed(() => {
  const otherStore = useOtherStore()
  return items.value.map(item => ({ ...item, extra: otherStore.getById(item.refId) }))
})
```

- Never call an action inside a getter.
- Never modify state inside a getter.

### Actions pattern

```js
async function fetchItems(filters = {}) {
  isLoading.value = true
  error.value = null
  try {
    items.value = await itemService.getAll(filters)
  } catch (err) {
    error.value = err.message
    throw err // re-throw so caller can react
  } finally {
    isLoading.value = false
  }
}
```

- Actions don't know about UI. No router access, no modals, no DOM.
- Re-throw errors so the component can decide what to do.
- For atomic multi-doc operations: use `writeBatch` or `runTransaction` in the service.

### Communication between stores

```js
// Correct: import the other store inside the action that needs it
async function loadUserCart() {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) return
  // ...
}

// Incorrect: import stores at module root level (circular dependency risk)
```

### Persistence

- Only persist: auth session, UI preferences (sidebar collapsed, table page size)
- NEVER persist server data (use TanStack Query cache or refetch)
- Use `pinia-plugin-persistedstate` with explicit `paths: []`

```js
export const useUiStore = defineStore(
  'ui',
  () => {
    // ...
  },
  {
    persist: {
      key: 'fleetcontrol-ui',
      storage: localStorage,
      paths: ['sidebarCollapsed', 'tablePageSize'],
    },
  },
)
```

### Testing stores

```js
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

beforeEach(() => setActivePinia(createPinia()))

it('debería actualizar currentUser al hacer login', async () => {
  const store = useAuthStore()
  // Arrange: mock service
  // Act: call action
  // Assert: verify state
})
```

### Never in Pinia

- Options Store syntax in new code
- Mutate state directly from a component (use actions)
- Getters with side effects
- Call router, show notifications, or manipulate DOM from actions
- Import stores at module root level (circular dependency risk)

---

## 8. UI Conventions

### Design System

- Framework: Vuetify 4 (Material Design 3)
- Theme: Dark (default)
- Approach: **Mobile-first** — diseñar para móvil primero, escalar hacia arriba
- Font: Roboto (Google Fonts)
- Icons: Material Symbols (Google)

### Responsive Strategy

- Use Vuetify 4 default breakpoints (xs/sm/md/lg/xl/xxl)
- Mobile-first: base styles for xs, override upward with `sm-and-up`, `md-and-up`, etc.
- Touch-friendly: minimum 44x44px tap targets on all interactive elements

### Sidebar Behavior

- **Desktop (lg+)**: `v-navigation-drawer` permanent, 220px
- **Tablet (md)**: `v-navigation-drawer` temporary, overlay with scrim
- **Mobile (xs/sm)**: `v-navigation-drawer` temporary, overlay with scrim
- Always accessible via hamburger menu icon in top bar

### Layout Patterns by Screen Size

**Dashboard (KPIs):**

- Mobile: stacked vertically (1 column)
- Tablet: 2-column grid
- Desktop: 4-column grid (full row)

**Data Tables:**

- Mobile: card-based list (one card per row, key fields visible)
- Tablet: simplified table (essential columns only)
- Desktop: full data table with all columns

**Forms:**

- Mobile: single column, full-width inputs
- Tablet: 2-column where logical (e.g., city + postal code)
- Desktop: multi-column, grouped fields

**Detail Pages:**

- Mobile: single column, collapsible sections (expansion panels)
- Tablet/Desktop: multi-column layout with sidebar info

### Color Palette (ONLY these semantic colors — defined in `src/styles/tokens.css`)

```css
--color-bg: #121212; /* Fondo principal */
--color-surface: #1e1e1e; /* Tarjetas/paneles */
--color-surface-alt: #2c2c2c; /* Sidebar, inputs */
--color-border: #3a3a3a; /* Bordes */
--color-text: #ffffff;
--color-text-secondary: rgba(255, 255, 255, 0.6);

--color-primary: #f57c00; /* Acciones principales */
--color-success: #4caf50; /* En regla, activo */
--color-error: #f44336; /* Crítico, vencido, error */
--color-warning: #ffc107; /* Próximo a vencer */
--color-info: #2196f3; /* Informativo */
```

**Rule**: Never hardcode colors. Always use CSS variables or Vuetify theme tokens.

### Status Tokens

| Token             | Color   | Use                          |
| ----------------- | ------- | ---------------------------- |
| `status-ok`       | success | En regla, activo, completado |
| `status-warning`  | warning | Próximo a vencer             |
| `status-critical` | error   | Crítico, vencido, avería     |
| `status-info`     | info    | Planificado, pendiente       |

### Typography

- Labels: `text-caption text-uppercase tracking-wide`
- Body: `text-body-2`
- KPIs: `text-h4` (desktop) / `text-h5` (mobile)
- Section titles: `text-h6`

### Feedback Requirements

- Async actions: loading state (spinner/skeleton)
- Success: toast confirmation (green, 3s auto-dismiss)
- Errors: toast with user-friendly message (red, persistent until dismissed)
- Destructive actions: confirmation modal with explicit "Eliminar/Cancelar" buttons
- Empty states: illustration + message + action button

### Spacing & Tokens

- Spacing scale based on 4px unit: 4, 8, 12, 16, 24, 32, 48, 64, 96
- Design tokens in CSS variables: colors, typography, spacing, breakpoints, radius, shadow
- No arbitrary values — everything derives from the defined scale
- Max 3 font sizes per view
- Min body text: 16px

### Animation & Motion

- Animations must be intentional — if you can't justify it, don't add it
- Always respect `prefers-reduced-motion`
- Micro-interactions: 100–200ms
- Page transitions: 200–400ms
- Prefer CSS transitions over JS animations (GPU compositor)

### Vuetify 4 Patterns

**Principle:** Vuetify is the design system. Never override Vuetify styles with custom CSS when a prop, slot, or theme variable exists.

**Grid system:**

```vue
<VContainer>
  <VRow>
    <!-- mobile: 12 cols, tablet: 6, desktop: 4 -->
    <VCol cols="12" sm="6" md="4">
      <VehicleCard :vehicle="vehicle" />
    </VCol>
  </VRow>
</VContainer>
```

- Always use `VContainer > VRow > VCol` 12-column grid
- Spacing via utility classes: `ma-`, `pa-`, `mt-`, `mb-`, `mx-`, `my-` (scale 0-16)
- `VContainer fluid` for full-width views. Without `fluid` for centered content

**Theme & Colors:**

```js
// src/plugins/vuetify.js
export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          primary: '#F57C00',
          success: '#4CAF50',
          error: '#F44336',
          warning: '#FFC107',
          info: '#2196F3',
        },
      },
    },
  },
})
```

- Reference colors as `color="primary"`, never as `color="#F57C00"`
- Custom CSS: use `rgb(var(--v-theme-primary))`
- Hardcoding colors in components is an anti-pattern

**Forms:**

```vue
<VForm ref="formRef" @submit.prevent="handleSubmit">
  <VTextField
    v-model="form.email"
    label="Correo electrónico"
    :rules="emailRules"
    :error-messages="serverErrors.email"
    required
  />
  <VBtn type="submit" :loading="isSubmitting" :disabled="isSubmitting">
    Guardar
  </VBtn>
</VForm>
```

- Always `ref` on `VForm` to call `formRef.value.validate()`
- Validation rules as constants outside template, never inline
- `:rules` for client-side, `:error-messages` for server errors
- Submit button always has `:loading` during submission

**Dialogs:**

```vue
<VDialog v-model="isDialogOpen" max-width="500" persistent>
  <VCard>
    <VCardTitle>Confirmar acción</VCardTitle>
    <VCardText>¿Estás seguro?</VCardText>
    <VCardActions>
      <VSpacer />
      <VBtn variant="text" @click="isDialogOpen = false">Cancelar</VBtn>
      <VBtn color="error" :loading="isDeleting" @click="handleDelete">Eliminar</VBtn>
    </VCardActions>
  </VCard>
</VDialog>
```

- `persistent` on confirmation dialogs (don't close on outside click)
- Always include cancel action
- For reusable dialogs, create wrapper component with props and emits

**Data Tables:**

```vue
<VDataTable
  :headers="headers"
  :items="items"
  :loading="isLoading"
  :items-per-page="25"
  hover
  @click:row="handleRowClick"
>
  <template #item.status="{ item }">
    <VChip :color="getStatusColor(item.status)" size="small">{{ item.status }}</VChip>
  </template>
  <template #loading>
    <VSkeletonLoader type="table-row@5" />
  </template>
  <template #no-data>
    <EmptyState icon="mdi-inbox-outline" title="No hay datos" description="Sin resultados." />
  </template>
</VDataTable>
```

- Define `headers` as constant in `<script setup>`
- Always include `#loading` and `#no-data` slots
- Use `VDataTableServer` for server-side pagination with Supabase

**Notifications (centralized via store):**

```js
// src/stores/notifications.js
export const useNotificationStore = defineStore('notifications', () => {
  const items = ref([])

  function add({ message, type = 'info', timeout = 4000 }) {
    items.value.push({ id: Date.now(), message, type, timeout })
  }

  function success(message) {
    add({ message, type: 'success' })
  }
  function error(message) {
    add({ message, type: 'error', timeout: 6000 })
  }
  function warning(message) {
    add({ message, type: 'warning' })
  }
  function info(message) {
    add({ message, type: 'info' })
  }

  function remove(id) {
    items.value = items.value.filter(n => n.id !== id)
  }

  return { items, success, error, warning, info, remove }
})
```

- NEVER manage `VSnackbar` in individual components — use centralized store
- Mount `AppNotifications.vue` once in `App.vue`
- Location: `bottom right`, auto-dismiss 3s (success), 6s (error)

---

## 9. Accessibility (a11y)

### Minimum requirements (WCAG 2.1 AA)

- All interactive elements: keyboard focusable + visible focus ring
- `data-testid` on all interactive elements (also used by Cypress)
- Form inputs: associated `<label>` or `aria-label`
- Status changes (toasts, alerts): `role="alert"` + `aria-live="polite"`
- Loading states: `aria-busy="true"` on container
- Modals: focus trap + `aria-modal="true"` + ESC to close
- Tables: `<th scope="col">` headers, caption or `aria-label`
- Color: NEVER the sole indicator of status — always pair with icon/text
- Content must work at 200% zoom

### HTML Semántico

- Use the correct HTML element for the job
- Landmarks: `<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>`, `<section>`
- Never use `<div>` or `<span>` for interactive elements — `<button>` for actions, `<a>` for navigation
- Heading hierarchy: logical and sequential, never skip levels (h1 → h4)
- Lists: `<ul>`, `<ol>` or `<dl>`. Never simulated with divs
- IDs unique; classes for styling; `data-attributes` for JS

### ARIA

- Use ARIA only when HTML semantics are not enough
- Custom interactive components: role, aria-label/labelledby, aria-expanded, aria-controls, aria-selected
- Dynamic content changes: announce via `aria-live` regions (polite or assertive)
- Decorative icons/images: `aria-hidden="true"` and `alt=""`

### Focus Management

- Visible focus indicators on all interactive elements. Never `outline: none` without custom replacement
- Programmatic focus in: modal open/close, SPA route changes, dynamic content injection
- Modals trap focus while open, return to trigger on close
- Tab order follows visual reading order

### Keyboard Navigation

- All interactive elements reachable and operable with keyboard only
- Dropdowns: arrows to navigate, Escape to close, Enter/Space to select
- Modals: Escape closes, Tab cycles within dialog
- Interactive tables: navigable with arrow keys

### Color & Contrast

- Text normal: minimum ratio 4.5:1
- Text large (18px+ or 14px+ bold): minimum ratio 3:1
- UI components (buttons, inputs, borders): minimum 3:1 against adjacent colors
- Color never the sole indicator of state, error or information

### Vuetify specifics

- Use Vuetify's built-in a11y props (`aria-label`, `role`)
- `v-data-table`: set `item-value` and `hover` for keyboard nav
- Prefer `v-btn` over raw `<button>` (built-in ripple + a11y)

---

## 10. Performance

### Route lazy loading (MANDATORY)

All page components must be lazy-loaded in the router:

```js
// ✅ CORRECT
const VehiclesPage = () => import('@/pages/VehiclesPage.vue')

// ❌ INCORRECT — blocks initial load
import VehiclesPage from '@/pages/VehiclesPage.vue'
```

### Large lists

- Server-side pagination for any list > 25 items (see API Service Pattern)
- Use `v-virtual-scroll` (Vuetify) for any client-side list > 100 items
- Dashboard KPIs: fetch in parallel with `Promise.all`, not sequentially

### Images

- Max 200KB per image, use WebP with PNG fallback
- Driver photos: lazy load with `loading="lazy"`
- Always specify `width` and `height` to avoid CLS
- Icons: Material Symbols (tree-shakeable), never import full icon sets

### Core Web Vitals targets

| Metric | Target  |
| ------ | ------- |
| LCP    | < 2.5s  |
| INP    | < 200ms |
| CLS    | < 0.1   |
| TTFB   | < 600ms |

No JS chunk exceeds 200KB gzipped without explicit justification.

### Fonts

- `font-display: swap` for all custom fonts
- Preload critical fonts with `<link rel="preload">`
- Max 2 font families per project

### Listeners & Events

- Debounce/throttle on costly listeners: scroll, resize, input
- Avoid creating new object/function references on every render

---

## 11. Legal Domain Rules (NEVER violate)

All regulatory numeric limits are defined in `src/constants/legal-limits.js`.
This is the **single source of truth** — never hardcode regulatory values elsewhere.

### Key reminders

- Driving: CE 561/2006 — max 9h/day, 56h/week, 90h/biweekly
- Working time: RD 1561/1995 — max 48h/week (40h avg over 4 months)
- Speed: 90 km/h autopista (>3.5t), 80 km/h conjuntos
- Weights: 40t standard / 44t eco configurations
- Dimensions: 2.55m wide, 4.00m high, 16.50m articulated

### Units (always metric)

- Distances: km | Weights: kg/t | Dimensions: m | Temp: °C
- Dates: DD/MM/YYYY (UI), ISO 8601 (API)
- Currency: EUR (€) with 2 decimals

---

## 12. Security

### Environment & Secrets

- NO inline credentials/API keys — use `.env` exclusively
- NEVER commit `.env`, `node_modules`, `*.log`, `*.local`
- Use `.env.example` as template (no real values)

### Input Validation

- Validate ALL external data with Zod schemas (`/src/validations/`)
- Sanitize user input before database operations
- Use parameterized queries (Supabase handles this)

### Security Headers

- Configure in production: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP
- Rate limiting on critical endpoints: login, registration, password reset
- Tokens with expiration and correct invalidation
- Sensitive cookies: `HttpOnly`, `Secure`, `SameSite=Strict` flags
- Check auth status before ANY data operation
- Verify user role/permissions before sensitive actions
- Use Supabase RLS policies as primary access control
- Never trust client-side auth state alone

### Data Protection (RGPD / LOPDGDD)

- Minimize personal data collection
- Log access to sensitive driver data (audit trail)
- Geolocalization: inform drivers of tracking (art. 13 RGPD)
- Tacógrafo data: retain minimum 12 months (recommend 5 years)

---

## 13. Environment Configuration

### Required variables (.env)

```env
# Supabase (REQUIRED)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Maps
VITE_GOOGLE_MAPS_KEY=AIza...

# Email provider (brevo | sendgrid | smtp)
VITE_EMAIL_PROVIDER=brevo
VITE_BREVO_API_KEY=xkeysib-...

# App
VITE_APP_URL=http://localhost:5173
```

### Rules

- All client vars MUST start with `VITE_` (Vite requirement)
- `.env.example` must be updated when adding new vars
- NEVER commit `.env` — only `.env.example` with placeholder values
- Server-side secrets (Supabase service role) go in server environment, never in client `.env`

---

## 14. Error Logging & Monitoring

### Client-side

- Use `utils/logger.js` (wrapper around console with env check):
  - Development: `console.error/warn/info` as normal
  - Production: send to Supabase Edge Function → `error_logs` table
- NEVER log PII (driver NIF, emails, passwords) — hash or mask
- Capture: component name, action, error message, timestamp, user ID

### Supabase monitoring

- Enable Logflare for API/Auth/Storage logs in Supabase dashboard
- Set up alerts for: auth failures spike, 5xx errors, RLS policy violations
- Check `supabase_get_advisors` weekly for security/performance warnings

---

## 15. Supabase SQL Guidelines

### General

- Use `supabase_apply_migration` for DDL operations
- Use `supabase_execute_sql` for data queries
- Never hardcode generated IDs in migrations

### search_path en funciones SECURITY DEFINER

When creating PostgreSQL functions with `SECURITY DEFINER`, `SET search_path` must be a **function clause**, NOT inside the `BEGIN` block:

```sql
-- CORRECT (passes Supabase linter)
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- INCORRECT (fails linter)
BEGIN
  SET search_path = public;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### RLS Policies

- All tables with RLS enabled must have at least one policy
- Verify no `rls_enabled_no_policy` warnings in Supabase advisors
- Policies should be specific (not overly permissive `USING (true)`)

### Views

- Remove unused views to avoid security warnings (`auth_users_exposed`)
- Never JOIN directly with `auth.users` in public views

### Naming Conventions (SQL)

- Tables: `snake_case`, plural (e.g., `vehicles`, `drivers`)
- Columns: `snake_case` (e.g., `created_at`, `vehicle_id`)
- Foreign keys: `{table}_id` (e.g., `driver_id`)
- Indexes: `idx_{table}_{columns}` (e.g., `idx_vehicles_matricula`)
- Functions: `snake_case` (e.g., `get_active_drivers`)

### Performance

- Add indexes on foreign key columns and frequently queried fields
- Use `EXPLAIN ANALYZE` for slow queries
- Avoid `SELECT *` in production — select only needed columns

---

## 16. Data Modeling Conventions (Supabase/PostgreSQL)

### Naming

- Tables: `snake_case` plural (`vehicles`, `maintenance_records`)
- Columns: `snake_case` (`plate_number`, `created_at`, `expires_at`)
- Foreign keys: `{table}_id` (`vehicle_id`, `driver_id`)
- Boolean columns: `is_` prefix (`is_active`, `is_archived`)
- Timestamps: always `timestamptz`, store UTC, display in Europe/Madrid

### Types

- Money: `numeric(12,2)` NEVER `float` or `real`
- GPS coordinates: `numeric(10,7)` for lat/lng
- Enums: use PostgreSQL `CREATE TYPE` for fixed sets (document_status, vehicle_status)
- JSONB: only for unstructured data (notification preferences, API responses)
- UUIDs: `gen_random_uuid()` as default PK

### Required columns on every table

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now(),
created_by uuid REFERENCES auth.users(id)
```

### Migrations

- One file per logical change: `YYYYMMDD_description.sql`
- NEVER modify applied migrations — create a new one
- Run `supabase db diff` to verify before applying

---

## 17. Realtime Subscriptions

### Pattern

```js
// In composable — always return cleanup function
function subscribe() {
  channel = supabase
    .channel(`${table}_changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, handlePayload)
    .subscribe(status => {
      if (status === 'CHANNEL_ERROR') error.value = 'Conexión perdida'
      if (status === 'CLOSED') scheduleReconnect()
    })
}

function unsubscribe() {
  if (channel) {
    supabase.removeChannel(channel)
    channel = null
  }
}
```

### Rules

- Subscribe in `onMounted`, unsubscribe in `onUnmounted` — NEVER at module level
- Handle `CHANNEL_ERROR` and `CLOSED` statuses
- Max 1 channel per table per client — share channels via composables
- Realtime only for Tier 1 tables: `alerts`, `routes`, `vehicles`, `drivers`

---

## 18. Testing Policy — TDD OBLIGATORIO

### Norma absoluta

**TODO el desarrollo sigue TDD. No hay excepciones.**

El ciclo es siempre:

1. **RED** — Escribir un test que FALLA definiendo el comportamiento esperado
2. **GREEN** — Escribir el MÍNIMO código para que el test pase
3. **REFACTOR** — Mejorar el código manteniendo los tests en verde

> **NUNCA escribir código de producción sin un test que lo justifique.**
> Si no hay un test que falle, no hay código que escribir.

### Flujo obligatorio por tipo de tarea

| Tarea             | Orden obligatorio                                                            |
| ----------------- | ---------------------------------------------------------------------------- |
| **Nueva feature** | 1. Escribir tests que fallan → 2. Implementar mínimo → 3. Refactorizar       |
| **Bug fix**       | 1. Escribir test que reproduce el bug → 2. Arreglar → 3. Verificar test pasa |
| **Refactor**      | 1. Tests existentes pasan → 2. Refactorizar → 3. Tests siguen pasando        |
| **Nuevo archivo** | 1. Crear `*.spec.js` con tests → 2. Crear el archivo fuente                  |
| **Merge a dev**   | Todos los tests pasan, cobertura no disminuye                                |

### Verificación en cada commit

Antes de cada commit, el agente DEBE:

1. `npm test` — todos los tests pasan
2. `npm run check` — lint + typecheck limpios
3. Verificar que cada archivo fuente tiene su `*.spec.js` correspondiente

### Excepciones documentadas

Los únicos archivos que no requieren test unitario son:

- `main.js` (entry point)
- `router.js` / `routes.js` (configuración Vue Router)
- `vuetify.js` (configuración plugin)
- `query-client.js` (configuración TanStack Query)
- `supabase-client.js` (configuración cliente)

Cualquier otra excepción DEBE documentarse con justificación.

### Testing Pyramid

```
        ┌─────────────────────────┐
        │      E2E (Cypress)       │  10% - Critical user journeys
        ├─────────────────────────┤
        │   Integration Tests      │  20% - Components + Composables
        ├─────────────────────────┤
        │     Unit Tests          │  70% - Utils, Services, Validations
        └─────────────────────────┘
```

### Test Types

| Type                 | Scope                                   | Tool                     |
| -------------------- | --------------------------------------- | ------------------------ |
| **Unit Tests**       | Utils, Services, Validations, Constants | Vitest                   |
| **Composable Tests** | Business logic in composables           | Vitest + @vue/test-utils |
| **Component Tests**  | Props, events, UI states                | Vitest + @vue/test-utils |
| **E2E Tests**        | Critical user flows (login, CRUD)       | Cypress                  |

### Coverage Goals

| Category              | Target | Current |
| --------------------- | ------ | ------- |
| Utils/Functions       | 80%    | 100%    |
| Composables           | 70%    | 100%    |
| Services (API)        | 60%    | 100%    |
| Constants             | 80%    | 100%    |
| Validations           | 80%    | 100%    |
| Components (critical) | 40%    | —       |

100% coverage in pure critical functions.

### Test File Location

Place test files alongside source files (`*.spec.js`).

### Rules by Task

- **New feature (TDD)**: write failing tests first → implement → refactor
- **Bug fix**: test that reproduces bug BEFORE fix, then verify
- **Merge to main**: all tests pass, coverage does not decrease

### Best Practices

- Test behavior, not implementation details
- Use descriptive test names in Spanish/English
- Mock external dependencies (API calls, services)
- Test edge cases (null, empty, invalid input)
- Use `data-testid` attributes for stable selectors
- Always test: loading, success, error states

---

## 19. Git Conventions

### Branch Structure

```
main              → Stable production code (protected)
dev               → Integration branch (features merge here)
feature/*         → Feature branches (one per task/feature)
fix/*             → Bug fix branches (branch from dev)
```

### Git Flow Lifecycle

```
main ───────────────────────────────────────────────── (stable, releases)
  │
  └── dev ──────────────────────────────────────────── (integration)
        │
        ├── feature/setup ────── PR → merge to dev ─── ✅ merged
        ├── feature/database ─── PR → merge to dev ─── ✅ merged
        ├── feature/vehicles ─── PR → merge to dev ─── 🔴 in progress
        └── fix/... ──────────── PR → merge to dev
```

### Feature Branch Lifecycle

1. **Start**: Create branch from `dev`: `feature/<descriptive-name>`
2. **Develop**: Commit frequently on feature branch
3. **Verify**: `npm run check` + `npm test` must pass before merge
4. **Merge**: PR to `dev` — squash merge preferred for clean history
5. **Cleanup**: Delete feature branch after merge (`git branch -d feature/name`)
6. **Release**: When `dev` is stable, PR to `main` for production release
7. **Sync**: After release, merge `main` back to `dev` to sync tags/version

### Commit Rules

- **NEVER commit without asking user first** — when a task is complete (Definition of Done met), the agent MUST propose the commit and wait for explicit user confirmation before executing it
- **NEVER push without asking user first**
- **NEVER commit with `console.log` or dev-only code**
- Run `npm run check` before every commit (Husky enforces this)

### Commit Message Format

```
feat(scope): description
fix(scope): description
test(scope): description
docs(scope): description
chore(scope): description
perf(scope): description
refactor(scope): description
a11y(scope): description
ci(scope): description
```

- Scope = module affected (e.g., `vehicles`, `drivers`, `routes`)
- Description: imperative mood, lowercase, no period (e.g., "add filter by status")
- Breaking changes: `BREAKING CHANGE:` in commit footer

### CI/CD Pipeline

- **GitHub Actions** on every push/PR to `main` and `dev`
- **Jobs**: lint → typecheck → test (unit) → test:e2e
- Workflow file: `.github/workflows/ci.yml`

---

## 20. Development Workflow

### For New Features (TDD)

1. Read mandatory context files (AI_CONTEXT.md, AGENTS.md, PRD.md)
2. Create feature branch from `dev`: `feature/<name>`
3. Understand requirement — read PRD relevant section, identify affected modules
4. Check existing patterns in similar modules
5. **RED**: Write failing tests first (unit → component → E2E if critical flow)
6. **GREEN**: Implement to make tests pass:
   - 6a. Create/update JSDoc types if needed (`/src/types/`)
   - 6b. Create Zod validation schemas if handling user input (`/src/validations/`)
   - 6c. Implement API services (`/src/services/api-*.js`)
   - 6d. Implement composables for business logic (`/src/composables/use-*.js`)
   - 6e. Build UI components using Vuetify 4 (`/src/components/`)
   - 6f. Wire up pages and routes
   - 6g. Ensure error handling on all async operations
7. **REFACTOR**: Clean up, ensure <200 lines/file
8. Run `npm run check` — must pass
9. Run `npm run test` — all tests must pass
10. Commit and merge to `dev` when fully working

### For Bug Fixes (TDD)

1. Read mandatory context files
2. Create fix branch from `dev`: `fix/<description>`
3. Locate problematic code
4. **RED**: Write test that reproduces the bug
5. **GREEN**: Fix the issue
6. **REFACTOR**: Clean up if needed
7. Verify all tests pass
8. Run `npm run check` — must pass
9. Commit and merge to `dev`

### Code Reviews

When reviewing code (own or others), follow the **Pre-Commit / Pre-Push Review Protocol (§29)**:

1. Run automated checks (§29.1)
2. Review each changed file against applicable checklists (§29.3–§29.10)
3. Categorize findings by severity (Blocking / High / Medium / Low)
4. Fix all Blocking and High before committing
5. Document Medium/Low as tech debt if not fixed
6. Re-run automated checks after fixes
7. Propose commit to user with summary of review findings

**Quick review** (before any commit): §29.1 + §29.2
**Full review** (before merge to `dev`): §29.1 through §29.8
**Full review + Supabase advisors** (before push to `dev`/`main`): all sections

### Definition of Done

Before merging ANY branch to `dev`:

- [ ] All mandatory context files were read
- [ ] **TDD cycle completed** (RED → GREEN → REFACTOR) — tests written BEFORE code
- [ ] Each source file has its `*.spec.js` test file (exceptions documented in §18)
- [ ] No `console.log` or temporary comments
- [ ] All async calls have error handling
- [ ] `npm run check` passes (lint + typecheck)
- [ ] All tests pass (`npm test`)
- [ ] Test coverage does not decrease from current baseline
- [ ] File under 200 lines (or split proposed)
- [ ] Business logic in composables, not components
- [ ] Color palette respected (no hardcoded colors)
- [ ] Metric units used
- [ ] No inline credentials or API keys
- [ ] Composition API used (`<script setup>`)
- [ ] Mobile-first responsive design verified
- [ ] **Pre-Commit Review performed** (§29) — all Blocking and High issues resolved
- [ ] **Propose commit to user** — ask before executing, never commit unilaterally

---

## 21. Decision Framework

When facing ambiguity:

1. Prioritize user experience and regulatory compliance
2. Follow existing patterns in the codebase
3. Choose clarity over cleverness
4. When unsure about domain rules (DGT, EU regulations), ask the user
5. Document non-obvious decisions in AI_CONTEXT.md

---

## 22. Communication Style

- Be precise and direct in Spanish fleet management domain language
- Explain regulatory context when relevant (DGT, EU regulations)
- Provide code with inline comments for complex logic
- Suggest improvements proactively
- Alert to potential issues before they become problems
- Think before writing code — never generate code without understanding the full problem
- Push back respectfully when a request would lead to a bad technical result
- Treat every technical decision as if it will be maintained for years by others

### Design Mindset

- Every visual decision has a functional reason — aesthetics serve usability, never the reverse
- Design systems, not screens — a component works in all contexts, not just the ideal mockup
- Think about the real user: interruptions, slow connection, one hand on the phone
- Visual hierarchy is how the user knows what to do next without reading anything

---

## 23. Anti-Patterns (NEVER)

- ❌ `supabase.from()` calls inside Vue components — use services
- ❌ `v-if / v-else` chains > 3 — use computed + object lookup or dynamic component
- ❌ Inline styles — use Vuetify utility classes or scoped CSS tokens
- ❌ `$emit` with > 3 events — consider provide/inject or a store
- ❌ `watch` with deep: true on large arrays — use computed or specific watchers
- ❌ Copy-paste component variants — extract shared logic to composable
- ❌ `getAll()` without pagination — always paginate server-side
- ❌ `console.log` in committed code — use a logger utility or remove
- ❌ Direct DOM manipulation (`document.querySelector`) — use template refs
- ❌ Storing JWT in localStorage manually — Supabase handles this
- ❌ Business logic in `onMounted` — belongs in composables
- ❌ Writing code before understanding the problem
- ❌ Generating code without error handling "because it's a prototype"
- ❌ Mixing business logic with presentation logic
- ❌ Introducing new dependencies without explicit justification
- ❌ Changing color palette or design without explicit instruction
- ❌ Leaving TODOs without date and ticket reference
- ❌ Simplifying validations arguing "it's unlikely"
- ❌ Accepting a refactor without explaining what changed and why
- ❌ Suppressing type errors without justified comments
- ❌ Assuming code "is fine" without running the Definition of Done checklist
- ❌ Exposing technical info or stack traces to end users
- ❌ Committing code that doesn't pass tests
- ❌ Committing changes without asking user first
- ❌ Producing UI without considering accessible and mobile behavior
- ❌ Suggesting a dependency without knowing its maintenance status and bundle impact
- ❌ Committing code without running the Pre-Commit Review Protocol (§29)
- ❌ Pushing to `dev` or `main` without running Supabase advisors

---

## 24. Self-Check After Writing Code

After writing ANY block of code, verify these 8 points before reporting task done:

1. **Does it do ONE thing?** (SRP) — If not, split it.
2. **Is it duplicated?** (DRY) — If yes, extract it.
3. **Is it the simplest solution?** (KISS) — If not, simplify it.
4. **Are names descriptive?** — `getActiveVehicles()` not `getData()`.
5. **Are errors handled?** — Every async call has try/catch.
6. **Does it handle null/empty/invalid input?** — Edge cases covered.
7. **Is it under 30 lines per function?** — If not, break it down.
8. **Does it break any rule in this document?** — Check Anti-Patterns.

If any point fails → fix it before continuing.

---

## 25. Debugging Process

When encountering a bug, follow this systematic 5-step process:

### Step 1: Hypothesis

List 3 possible causes, ordered by probability. Don't jump to conclusions.

### Step 2: Line-by-line analysis

Trace the exact execution path. Pinpoint where the behavior diverges from expected.

### Step 3: Root cause

Identify the most probable cause. Explain WHY it produces the observed behavior.
The root cause is often NOT where the symptom appears.

### Step 4: Fix

Show the corrected code with changes clearly marked. Minimal changes — fix the cause, not the symptoms.

### Step 5: Prevention

Write a test that would have caught this bug. Add it to the test suite to prevent regression.

### Rules

- Never fix blindly — understand the root cause first
- Never fix symptoms — fix the underlying cause
- Always add a regression test
- Document the fix in the commit message

---

## 26. Refactoring Rules

When improving existing code that works but needs cleanup:

### Non-negotiable rules

1. **Don't change external behavior** — input and output must be identical before and after.
2. **Explain every change** — no new code without understanding what changed and why.
3. **Show before and after** — for each modified block, show old vs new.
4. **Respect project conventions** — composables, services, naming, all rules in this document.

### When to refactor

- Function exceeds 30 lines → break into smaller functions
- Same logic appears in 2+ places → extract to composable/util
- File exceeds 200 lines → split by responsibility
- `v-if/v-else` chain > 3 → use computed lookup or dynamic component
- Complex nested callbacks → convert to async/await
- Magic numbers/strings → extract to named constants

### When NOT to refactor

- During a bug fix — fix first, refactor separately
- If tests don't exist — write tests first, then refactor
- If deadline is critical — document tech debt, refactor later

### Verification

After refactoring:

- All existing tests still pass (green)
- No new functionality added
- `npm run check` passes
- Code is more readable than before

---

## 27. Dependencies Policy

Always use the **latest stable version** of each dependency unless there is a documented technical reason not to.
"Latest stable" means the most recent release without `alpha`, `beta`, `rc`, or `next` tags.

### Before adding ANY new dependency

1. Can it be done reasonably without it? (YAGNI)
2. Does it have active maintenance? (last commit < 12 months)
3. What is its bundle impact?
4. Does it have known vulnerabilities? (`npm audit`)

### Rules

- Never install a new dependency without explicit justification
- Flag any dependency with known CVEs
- Question packages abandoned for 2+ years in critical paths
- If outdated versions are detected, flag proactively with current version and estimated impact
- Never assume a library is available — check `package.json` first

---

## 28. Session Management

Sesiones cortas producen código de mayor calidad. El agente DEBE autogestionar la duración de la sesión.

### Límites de sesión

| Límite                       | Umbral | Acción                   |
| ---------------------------- | ------ | ------------------------ |
| Módulos/features por sesión  | 1-2    | Proponer commit + cierre |
| Archivos creados/modificados | > 15   | Proponer commit + cierre |
| Tests escritos               | > 50   | Proponer commit + cierre |
| Commits en la sesión         | > 5    | Proponer cierre          |
| Turnos de conversación       | > 20   | Evaluar si cerrar        |

### Checklist de cierre de sesión

Antes de proponer cerrar una sesión, el agente DEBE:

1. `npm test` — todos los tests pasan
2. `npm run check` — lint + typecheck limpios
3. **Pre-Commit Review** (§29) — Blocking y High resueltos
4. Commit de todos los cambios
5. Push a la rama correspondiente
6. Actualizar `AI_CONTEXT.md` con:
   - Qué se hizo
   - Qué queda pendiente (con prioridad)
   - Siguiente paso recomendado
7. Confirmar que el working tree está limpio (`git status --short` vacío)

### Señal de cierre

Cuando se alcanza un límite, el agente dice:

```
La sesión está llegando a su límite óptimo. Propongo:
1. Commit de lo realizado
2. Actualizar AI_CONTEXT.md
3. Cerrar sesión y continuar en una nueva con [siguiente tarea]
```

### Puente entre sesiones

`AI_CONTEXT.md` es el puente. Cada sesión termina actualizándolo con:

- Estado actual (tests, branch, working tree)
- Tarea completada
- Siguiente tarea pendiente con contexto suficiente para retomar
- Bloqueos si los hay

### Excepciones

Se permite sesiones más largas SOLO cuando:

- Un solo módulo complejo requiere continuidad (ej: migración BD + API + UI de un feature)
- Un bug requiere debugging profundo con múltiples iteraciones
- El usuario explícitamente pide continuar

---

## 29. Pre-Commit / Pre-Push Review Protocol

**MANDATORY**: Before ANY commit (and absolutely before ANY push to `dev` or `main`), the agent MUST perform a comprehensive code review covering ALL dimensions below. This is NOT optional — code that has not been reviewed MUST NOT be committed.

> **Rationale**: A single feature implementation review (sesión mapa, 2026-04-03) found 37 issues including 4 blocking security bugs, 7 high-severity architectural problems, and 18 medium-severity quality issues. Without this protocol, those would have reached production.

### When to trigger

| Trigger                                                                   | Scope                             |
| ------------------------------------------------------------------------- | --------------------------------- |
| Before ANY commit                                                         | Quick check (§29.1 + §29.2)       |
| Before merge to `dev`                                                     | Full review (§29.1 through §29.8) |
| Before push to `dev`/`main`                                               | Full review + Supabase advisors   |
| After any code change > 10 files                                          | Full review                       |
| After any code change > 500 lines                                         | Full review                       |
| After touching security-sensitive code (auth, RLS, env vars, credentials) | Full review + security focus      |
| After touching database schema (migrations)                               | Full review + DB focus            |

### §29.1 Automated Checks (ALWAYS run)

```bash
npm test           # ALL tests must pass — zero failures
npm run check      # lint + typecheck — zero errors, zero warnings
git status --short # working tree must be clean before commit
```

### §29.2 Definition of Done Checklist (§20)

Verify ALL items in the Definition of Done checklist (§20). If any item fails, fix it before committing.

### §29.3 Code Quality & Architecture

| Check                        | What to verify                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| **SRP**                      | Each file, function, component does ONE thing                                       |
| **DRY**                      | No duplicated logic across files                                                    |
| **KISS**                     | Simplest solution that works — no over-engineering                                  |
| **File size**                | Max 200 lines (soft), 300 lines (hard)                                              |
| **Function size**            | Max 30 lines per function                                                           |
| **Naming**                   | Follows §4 conventions (PascalCase, camelCase, SCREAMING_SNAKE_CASE)                |
| **Import order**             | Vue → External → Internal (Composables → Services → Constants → Utils → Components) |
| **No relative imports**      | Use `@/` alias exclusively                                                          |
| **No magic numbers/strings** | All constants extracted to named constants                                          |
| **Directory placement**      | Utils = pure functions only; Services = side effects; Composables = reactive logic  |

### §29.4 Framework Compliance

#### Vue 3

| Check                                                                                                    | What to verify |
| -------------------------------------------------------------------------------------------------------- | -------------- |
| Composition API only — no Options API                                                                    |
| `<script setup>` syntax exclusively                                                                      |
| Script setup order: imports → props/emits → stores → state → computed → watchers → lifecycle → functions |
| No `this` in `<script setup>`                                                                            |
| No prop mutation — emit events instead                                                                   |
| No `v-if` + `v-for` on same element                                                                      |
| `v-for` always with `:key` — never array index                                                           |
| Business logic in composables, NOT in components                                                         |
| Module-level mutable state NOT shared across component instances                                         |
| Watchers cleaned up in `onUnmounted`                                                                     |
| No direct DOM manipulation — use template refs                                                           |

#### Vuetify 4

| Check                                                        | What to verify |
| ------------------------------------------------------------ | -------------- |
| Use Vuetify props/slots instead of custom CSS overrides      |
| Color references use theme tokens, never hardcoded hex       |
| Responsive: mobile-first with `cols`, `sm`, `md` breakpoints |
| Touch targets ≥ 44×44px                                      |

### §29.5 Security

| Check                                                                                  | What to verify |
| -------------------------------------------------------------------------------------- | -------------- |
| **No inline credentials** — API keys, secrets, tokens in `.env` only                   |
| **No secrets in commits** — `.env`, `*.local`, `node_modules` excluded                 |
| **Input validation** — ALL external data validated with Zod schemas                    |
| **Error mapping** — Supabase errors mapped via `mapSupabaseError()`, never raw         |
| **RLS policies** — NOT `USING (true)` for sensitive tables; restrict by role/ownership |
| **RLS completeness** — SELECT, INSERT, UPDATE, DELETE all have explicit policies       |
| **SECURITY DEFINER** — functions must have `SET search_path = public`                  |
| **No SQL injection** — parameterized queries (Supabase handles this)                   |
| **No PII in logs** — driver NIF, emails, passwords never logged                        |
| **Auth verification** — check auth status before ANY data operation                    |
| **File uploads** — validate type, size, no execution risk                              |

### §29.6 Database & Supabase

| Check                                                                                         | What to verify |
| --------------------------------------------------------------------------------------------- | -------------- |
| **Migration naming** — `YYYYMMDD_NNN_description.sql`                                         |
| **Column naming** — `snake_case`, English                                                     |
| **Table naming** — `snake_case`, plural                                                       |
| **Index naming** — `idx_{table}_{columns}`                                                    |
| **Required columns** — `id`, `created_at`, `updated_at`, `created_by` on every table          |
| **RLS enabled** — every table has `ENABLE ROW LEVEL SECURITY`                                 |
| **RLS policies** — at least one policy per table, not overly permissive                       |
| **Foreign keys** — indexed, with appropriate `ON DELETE` behavior                             |
| **Indexes** — appropriate for query patterns (B-tree for point lookups, BRIN for time-series) |
| **No `SELECT *`** in production queries                                                       |
| **Triggers** — documented with WHY comment, `SECURITY DEFINER SET search_path = public`       |
| **No direct `auth.users` JOINs** in public views                                              |
| **Run `supabase_get_advisors`** — check for security and performance warnings                 |

### §29.7 Testing

| Check                                                                               | What to verify |
| ----------------------------------------------------------------------------------- | -------------- |
| **TDD followed** — tests written BEFORE implementation code                         |
| **Each source file has `*.spec.js`** — exceptions documented in §18                 |
| **All tests pass** — `npm test` zero failures                                       |
| **Coverage not decreased** — from current baseline                                  |
| **Edge cases tested** — null, empty, invalid input, boundary values                 |
| **Error paths tested** — not just happy path                                        |
| **Mocks are realistic** — test behavior, not implementation details                 |
| **No unnecessary `@vitest-environment jsdom`** — use `node` when no DOM interaction |
| **No dead mock code** — remove unused mocks                                         |
| **No probabilistic tests** — seed random or clamp values                            |
| **Test names are descriptive** — "debería..." in Spanish                            |

### §29.8 Accessibility (WCAG 2.1 AA)

| Check                                                             | What to verify |
| ----------------------------------------------------------------- | -------------- |
| All interactive elements: keyboard focusable + visible focus ring |
| `data-testid` on all interactive elements                         |
| Form inputs: associated `<label>` or `aria-label`                 |
| Status changes: `role="alert"` + `aria-live="polite"`             |
| Modals: focus trap + `aria-modal="true"` + ESC to close           |
| Tables: `<th scope="col">` headers                                |
| Color NOT sole indicator of status — pair with icon/text          |
| Toggle buttons: `aria-pressed`                                    |
| Icon-only buttons: `aria-label`                                   |
| Interactive containers: `role` + `aria-label`                     |
| Content works at 200% zoom                                        |
| `prefers-reduced-motion` respected                                |

### §29.9 Performance

| Check                                                                                | What to verify |
| ------------------------------------------------------------------------------------ | -------------- |
| Route lazy loading — ALL page components use `() => import()`                        |
| Server-side pagination for lists > 25 items                                          |
| No N+1 queries — use JOINs or batch queries                                          |
| No fetching ALL rows for "latest per entity" — use `DISTINCT ON` or window functions |
| Images: lazy load, WebP, specified dimensions (no CLS)                               |
| No unbounded loops in render/template                                                |
| Debounce/throttle on scroll, resize, input listeners                                 |
| No creating new object/function references on every render                           |

### §29.10 PRD & Regulatory Compliance

| Check                                                         | What to verify |
| ------------------------------------------------------------- | -------------- |
| Feature matches PRD requirements for the module               |
| Regulatory constants from `legal-limits.js` — never hardcoded |
| Metric units used (km, kg, t, m, °C, EUR)                     |
| Dates: DD/MM/YYYY (UI), ISO 8601 (API)                        |
| Spanish labels in UI, English in code/DB                      |

### Review Execution Process

When a review is triggered (before commit/push):

1. **Identify scope** — which files changed, which modules affected
2. **Run automated checks** (§29.1) — if any fail, STOP and fix
3. **Review each changed file** against applicable checklists (§29.3–§29.10)
4. **Categorize findings** by severity:
   - 🔴 **Blocking** — security vulnerability, data loss, production crash, API contract violation. MUST fix before commit.
   - 🟠 **High** — architectural violation, performance risk, framework misuse. SHOULD fix before commit.
   - 🟡 **Medium** — code quality, missing tests, accessibility gap. SHOULD fix before commit, MUST fix before merge to `main`.
   - 🟢 **Low** — naming, JSDoc, minor style. CAN fix now or track as tech debt.
5. **Fix all Blocking and High issues** before committing
6. **Fix Medium issues** when feasible in the same session
7. **Document Low issues** as tech debt in `AI_CONTEXT.md` if not fixed
8. **Re-run automated checks** (§29.1) after fixes
9. **Propose commit to user** with summary of review findings

### Review Output Format

When reporting review results:

```
## Pre-Commit Review — [feature name]

### Automated Checks
- [ ] npm test: ✅/❌
- [ ] npm run check: ✅/❌
- [ ] git status: clean/dirty

### Findings
| Severity | File | Issue | Status |
|----------|------|-------|--------|
| 🔴       |      |       | Fixed/Pending |
| 🟠       |      |       | Fixed/Pending |
| 🟡       |      |       | Fixed/Pending |
| 🟢       |      |       | Fixed/Deferred |

### Summary
- Blocking: X (all fixed / X pending)
- High: X (all fixed / X pending)
- Medium: X (all fixed / X pending)
- Low: X (all fixed / X deferred)

### Recommendation
[Proceed to commit / Fix X issues first]
```

### Supabase Advisors Integration

Before push to `dev` or `main`, run:

```
supabase_get_advisors(type: "security")
supabase_get_advisors(type: "performance")
```

Address all HIGH and MEDIUM findings. Document LOW findings in `AI_CONTEXT.md`.

---

## 30. Industry Standards Reference

All code MUST conform to these industry standards. The agent is expected to know and apply them without being reminded:

### Web Standards

| Standard                | Scope         | Key Requirements                                                      |
| ----------------------- | ------------- | --------------------------------------------------------------------- |
| **HTML5**               | Markup        | Semantic elements, valid structure, no deprecated tags                |
| **CSS3**                | Styling       | CSS custom properties, no browser hacks, `prefers-reduced-motion`     |
| **ES2022**              | JavaScript    | Modern syntax, strict mode, no `var`, proper error handling           |
| **WCAG 2.1 AA**         | Accessibility | Contrast 4.5:1, keyboard nav, screen reader support, focus management |
| **OWASP Top 10 (2025)** | Security      | Input validation, auth, session management, CSP, rate limiting        |

### Framework Standards

| Framework/Lib          | Standard             | Key Requirements                                                                   |
| ---------------------- | -------------------- | ---------------------------------------------------------------------------------- |
| **Vue 3**              | Official Style Guide | Composition API, single-file components, prop validation, emit naming              |
| **Vuetify 4**          | MD3 Guidelines       | Theme tokens, responsive breakpoints, built-in a11y, component props               |
| **Pinia**              | Official Guide       | Setup syntax, 3-layer state (data/loading/error), no server data                   |
| **Vue Router 4**       | Official Guide       | Lazy loading, navigation guards, route param validation                            |
| **TanStack Query**     | Official Guide       | Query key structure, stale time, error boundaries, no Pinia duplication            |
| **Vee-Validate + Zod** | Official Docs        | Schema validation, error messages in Spanish, server error display                 |
| **Supabase**           | Official Docs        | RLS on all tables, parameterized queries, error mapping, no service role in client |
| **PostgreSQL**         | Official Docs        | Proper types, indexes, constraints, `EXPLAIN ANALYZE` for slow queries             |

### Development Practices

| Practice          | Standard             | Key Requirements                                                    |
| ----------------- | -------------------- | ------------------------------------------------------------------- |
| **TDD**           | Red-Green-Refactor   | Tests before code, minimal implementation, refactor only when green |
| **Git**           | Conventional Commits | Type(scope): description, signed commits, no force push to main     |
| **CI/CD**         | Pipeline gates       | Lint → typecheck → test → e2e — all must pass                       |
| **SemVer**        | Semantic Versioning  | MAJOR.MINOR.PATCH for releases                                      |
| **12-Factor App** | Methodology          | Config in env, stateless processes, disposability, dev/prod parity  |

### Security Standards

| Standard                | Scope                   | Key Requirements                                                  |
| ----------------------- | ----------------------- | ----------------------------------------------------------------- |
| **RGPD (EU 2016/679)**  | Data Protection         | Consent, data minimization, right to erasure, breach notification |
| **LOPDGDD (LO 3/2018)** | Data Protection (Spain) | Spanish implementation of RGPD                                    |
| **OWASP ASVS L2**       | Application Security    | Auth, session, access control, input validation, cryptography     |
| **CIS Benchmarks**      | Infrastructure          | Secure defaults, least privilege, audit logging                   |
