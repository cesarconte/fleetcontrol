---
description: Workflow — Nueva Pinia Store
---

Genera una Pinia store completa con Setup Store syntax para FleetControl.
Una store = un dominio de negocio.

---

## Paso 1 — Definir el dominio

- ¿Qué entidad de negocio gestiona esta store? (vehículos, conductores, rutas…)
- ¿Qué datos necesitan ser compartidos entre componentes no relacionados?
- ¿Hay una store existente que ya cubra parte de esto? (evitar duplicar estado)
- ¿Qué operaciones de Supabase necesitará? (¿qué tabla/s?)
- ¿Algún estado necesita persistirse entre sesiones?

---

## Paso 2 — Diseñar el estado

Por cada entidad de datos, el patrón estándar es siempre tres refs:

```javascript
const items = ref([])           // los datos
const isLoading = ref(false)    // estado de la operación en curso
const error = ref(null)         // error de la última operación
```

---

## Paso 3 — Diseñar los getters

```javascript
// Getter simple
const totalItems = computed(() => items.value.length)

// Getter parametrizado
const getById = computed(() => (id) => items.value.find(i => i.id === id))

// Getter que cruza con otra store (importar dentro del computed, no en el módulo)
const enrichedItems = computed(() => {
  const otherStore = useOtherStore()
  return items.value.map(item => ({ ...item, extra: otherStore.getById(item.refId) }))
})
```

---

## Paso 4 — Implementar las actions

Cada action sigue el patrón obligatorio:

```javascript
async function fetchItems(filters = {}) {
  isLoading.value = true
  error.value = null
  try {
    const result = await apiService.getAll(filters)
    items.value = result
  } catch (err) {
    error.value = err.message
    throw err // re-lanzar para que el componente pueda reaccionar
  } finally {
    isLoading.value = false
  }
}
```

Actions CRUD estándar:
- `fetchItems(filters)` — lista con filtros y paginación
- `fetchItemById(id)` — detalle
- `createItem(data)` — creación
- `updateItem(id, data)` — actualización parcial
- `deleteItem(id)` — borrado
- `resetState()` — limpiar el estado (necesario al hacer logout)

Para datos en tiempo real (Supabase Realtime):
```javascript
let unsubscribeFn = null

function subscribeToItems() {
  unsubscribeFn?.()
  isLoading.value = true
  unsubscribeFn = apiService.subscribe(
    (data) => { items.value = data; isLoading.value = false },
    (err) => { error.value = err.message; isLoading.value = false }
  )
}

function unsubscribe() {
  unsubscribeFn?.()
  unsubscribeFn = null
}
```

---

## Paso 5 — Definir el servicio asociado

La store no llama a Supabase directamente. Llama al servicio.

```javascript
// src/services/api-[entity].js
import { createCrudService } from './create-crud-service'
const base = createCrudService('[tabla]', { orderBy: 'created_at' })

export const apiEntity = {
  ...base,
  async getPaginated({ page = 1, pageSize = 25, filters = {}, sort = {} } = {}) {
    // paginación server-side
  }
}
```

---

## Paso 6 — Persistencia (si aplica)

```javascript
export const useUiStore = defineStore('ui', () => {
  // ...
}, {
  persist: {
    key: 'fleetcontrol-ui',
    storage: localStorage,
    paths: ['sidebarCollapsed']
  }
})
```

Justificar qué se persiste y por qué. No persistir datos sensibles.

---

## Paso 7 — Tests de la store (TDD)

```javascript
import { setActivePinia, createPinia } from 'pinia'
import { useEntityStore } from '../[entity]'
import * as apiService from '@/services/api-[entity]'

vi.mock('@/services/api-[entity]')

describe('useEntityStore', () => {
  beforeEach(() => setActivePinia(createPinia()))

  describe('fetchItems', () => {
    it('debería cargar items y actualizar el estado correctamente', async () => {
      const mockItems = [{ id: '1', name: 'Item 1' }]
      apiService.getAll.mockResolvedValue(mockItems)
      const store = useEntityStore()
      await store.fetchItems()
      expect(store.items).toEqual(mockItems)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('debería registrar el error cuando el servicio falla', async () => {
      apiService.getAll.mockRejectedValue(new Error('Error de red'))
      const store = useEntityStore()
      await expect(store.fetchItems()).rejects.toThrow()
      expect(store.error).toBe('Error de red')
      expect(store.isLoading).toBe(false)
    })
  })
})
```

---

## Entrega

Archivos a generar:
1. `src/stores/[entity].js` — la store completa
2. `src/services/api-[entity].js` — el servicio (si no existe)
3. `src/stores/[entity].spec.js` — los tests
