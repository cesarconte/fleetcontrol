# Plan de Implementación: Suscripciones Supabase Realtime

**Branch:** `feature/realtime`
**Fecha:** 2026-04-03
**Estado:** Pendiente de implementación
**Prioridad:** Alta — listado en AI_CONTEXT.md §8.1

---

## Contexto Actual

- **0 código realtime existente** — ninguna suscripción, canal ni `subscribe()` en todo el proyecto
- Supabase client simple en `src/services/supabase-client.js` (24 líneas)
- 13 composables, 15 servicios, 4 stores (auth, ui, notifications, settings)
- Notification store ya funcional con `success/error/warning/info`
- Tablas Tier 1 según AGENTS.md §17: **`alerts`**, **`routes`**, **`vehicles`**, **`drivers`**

---

## Arquitectura Propuesta

### Archivos a crear/modificar

```
src/
├── composables/
│   ├── use-realtime.js          ← NUEVO: composable genérico de suscripciones
│   ├── use-realtime.spec.js     ← NUEVO: tests TDD del composable
│   ├── use-alerts.js            ← MODIFICAR: integrar suscripción alerts
│   ├── use-routes.js            ← MODIFICAR: integrar suscripción routes
│   ├── use-vehicles.js          ← MODIFICAR: integrar suscripción vehicles
│   └── use-drivers.js           ← MODIFICAR: integrar suscripción drivers
```

---

## Fases de Implementación (TDD: RED → GREEN → REFACTOR)

### Fase 1: Tests del composable `use-realtime.js` (RED)

Crear `src/composables/use-realtime.spec.js` con tests que fallen:

1. **Debe crear un canal y suscribirse** — mock `supabase.channel().on().subscribe()`
2. **Debe manejar eventos INSERT** — callback recibe `NEW` row, ejecuta handler
3. **Debe manejar eventos UPDATE** — callback recibe `OLD` + `NEW`, ejecuta handler
4. **Debe manejar eventos DELETE** — callback recibe `OLD`, ejecuta handler
5. **Debe limpiar canal en unsubscribe** — `supabase.removeChannel()` llamado
6. **Debe manejar CHANNEL_ERROR** — set error state
7. **Debe manejar CLOSED con reconexión** — schedule reconnect con backoff exponencial
8. **Debe soportar múltiples tablas** — un canal por tabla, no duplicados
9. **No debe suscribirse si no hay supabase** — graceful no-op

---

### Fase 2: Implementar `use-realtime.js` (GREEN)

**API del composable:**

```js
const {
  connectionStatus, // 'connected' | 'connecting' | 'error' | 'disconnected'
  error, // string | null
  subscribe, // (table, handler, options?) => void
  unsubscribe, // (table) => void
  unsubscribeAll, // () => void
} = useRealtime()
```

**Requisitos (según AGENTS.md §17):**

- Subscribe en `onMounted`, unsubscribe en `onUnmounted`
- Manejar `CHANNEL_ERROR` y `CLOSED` statuses
- Máx 1 canal por tabla — compartir canales
- Reconexión automática con backoff exponencial (1s → 2s → 4s → 8s → max 30s)
- Max reintentos: 10 antes de dar error permanente
- Handler recibe: `{ eventType, new: record, old: oldRecord, table, schema, commitTimestamp }`

**Estructura interna:**

```js
// Estado compartido (module-level singleton)
const channels = new Map()        // table -> channel instance
const handlers = new Map()        // table -> callback function
const reconnectTimers = new Map() // table -> timer id
const retryCounts = new Map()     // table -> retry count

// Funciones internas
function createChannel(table, handler)      // Crea canal con postgres_changes
function handleStatusChange(status, table)  // CHANNEL_ERROR, CLOSED, SUBSCRIBED
function scheduleReconnect(table, handler)  // Backoff exponencial
function cleanupChannel(table)              // removeChannel + clear timers
```

**Reconexión automática:**

```js
const MAX_RETRIES = 10
const MAX_BACKOFF = 30000 // 30s

function getBackoff(retryCount) {
  return Math.min(1000 * Math.pow(2, retryCount), MAX_BACKOFF)
}
```

**Singleton pattern:** El composable usa estado a nivel de módulo para compartir canales entre instancias. Si `useAlerts` y otro componente llaman `subscribe('alerts', ...)`, se reutiliza el mismo canal.

---

### Fase 3: Integrar en composable `use-alerts.js`

Añadir al composable existente:

```js
import { useRealtime } from './use-realtime'

export function useAlerts(filters = {}) {
  // ... existing state ...

  const realtime = useRealtime()

  function handleAlertChange({ eventType, new: record, old: oldRecord }) {
    if (eventType === 'INSERT') {
      items.value.unshift(record)
      total.value++
      if (record.severity === 'critical') {
        notificationStore.error(`Nueva alerta crítica: ${record.title}`)
      } else {
        notificationStore.warning(`Nueva alerta: ${record.title}`)
      }
    }
    if (eventType === 'UPDATE') {
      const idx = items.value.findIndex(a => a.id === record.id)
      if (idx !== -1) items.value[idx] = record
    }
    if (eventType === 'DELETE') {
      items.value = items.value.filter(a => a.id !== oldRecord.id)
      total.value--
    }
  }

  onMounted(() => {
    realtime.subscribe('alerts', handleAlertChange)
  })

  onUnmounted(() => {
    realtime.unsubscribe('alerts')
  })

  // ... return existing + realtime state
}
```

---

### Fase 4: Integrar en composable `use-vehicles.js`

Mismo patrón:

- **INSERT**: añadir vehículo a lista, toast `info`
- **UPDATE**: actualizar vehículo en lista (cambio de estado, posición GPS, etc.)
- **DELETE**: eliminar de lista

---

### Fase 5: Integrar en composable `use-drivers.js`

Mismo patrón que vehicles.

---

### Fase 6: Integrar en composable `use-routes.js`

Mismo patrón + **toast especial** para cambios de estado:

- `status` cambia a `en_curso` → `info` toast
- `status` cambia a `completada` → `success` toast
- `status` cambia a `incidencia` → `error` toast

---

### Fase 7: Verificación y Cleanup

1. `npm test` — todos los tests pasan (incluyendo nuevos tests de realtime)
2. `npm run check` — lint + typecheck limpios
3. Verificar que cada archivo nuevo tiene su `*.spec.js`
4. Actualizar `AI_CONTEXT.md` con:
   - Qué se hizo
   - Archivos creados/modificados
   - Siguientes pasos

---

## Detalles Técnicos Clave

### No duplicar datos

Las actualizaciones son optimistas — se modifica el array local sin refetch. Si la lista está paginada, solo se actualiza si el registro ya está en la página actual.

### Seguridad

Las suscripciones respetan RLS — Supabase filtra automáticamente según el usuario autenticado.

### Patrón de suscripción (AGENTS.md §17)

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

---

## Estimación de Archivos

| Archivo                                | Acción    | Líneas aprox. |
| -------------------------------------- | --------- | ------------- |
| `src/composables/use-realtime.js`      | NUEVO     | ~120          |
| `src/composables/use-realtime.spec.js` | NUEVO     | ~150          |
| `src/composables/use-alerts.js`        | MODIFICAR | +30           |
| `src/composables/use-vehicles.js`      | MODIFICAR | +30           |
| `src/composables/use-drivers.js`       | MODIFICAR | +30           |
| `src/composables/use-routes.js`        | MODIFICAR | +35           |

**Total:** ~400 líneas nuevas, 4 archivos modificados.

---

## Reglas de Implementación (de AGENTS.md)

- **TDD obligatorio**: tests antes que código de producción
- **Máx 200 líneas/archivo** — split si se acerca al límite
- **Composables**: `/src/composables/use-*.js` — uno por dominio
- **Tests**: junto al archivo source (`*.spec.js`)
- **JSDoc** para todas las funciones públicas
- **Nunca** `supabase.from()` en componentes Vue
- **Siempre** cleanup en `onUnmounted`
- **Siempre** manejar errores en async calls
- **No** duplicar datos de servidor en Pinia

---

## Referencias

- AGENTS.md §17 — Realtime Subscriptions
- AGENTS.md §18 — Testing Policy (TDD obligatorio)
- AGENTS.md §4 — Code Style Guidelines
- AGENTS.md §5 — State Management Conventions
- AI_CONTEXT.md §8.1 — Tareas Pendientes (Realtime subscriptions)
