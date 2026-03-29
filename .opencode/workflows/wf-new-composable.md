---
description: Workflow — Nuevo Composable
---

Genera un composable Vue 3 siguiendo las convenciones de FleetControl.
Los composables encapsulan lógica de negocio reutilizable con estado reactivo.

---

## Paso 1 — Definir el composable

- ¿Qué lógica encapsula?
- ¿Necesita estado reactivo (refs)?
- ¿Hace llamadas a servicios API?
- ¿Tiene efectos de lifecycle (onMounted, onUnmounted)?
- ¿Se reutiliza en más de un componente?

Si la lógica no necesita estado reactivo → crear utilidad en `utils/` en su lugar.
Si la lógica interactúa con Supabase → crear servicio en `services/` y el composable lo orquesta.

---

## Paso 2 — Estructura del composable

```javascript
// src/composables/use-[feature].js
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { apiEntity } from '@/services/api-[entity]'
import { useNotificationStore } from '@/stores/notifications'

/**
 * Composable para [descripción del feature].
 *
 * @param {Object} [options] - Opciones de configuración
 * @param {string} [options.entityId] - ID de la entidad a gestionar
 * @param {Object} [options.filters] - Filtros iniciales
 * @returns {Object} Estado reactivo y funciones del composable
 */
export function useFeature(options = {}) {
  // ── Estado ───────────────────────────────────────────
  const items = ref([])
  const currentItem = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // ── Stores ───────────────────────────────────────────
  const notificationStore = useNotificationStore()

  // ── Computed ─────────────────────────────────────────
  const totalItems = computed(() => items.value.length)
  const hasError = computed(() => error.value !== null)

  // ── Acciones ─────────────────────────────────────────
  async function fetchItems(filters = {}) {
    isLoading.value = true
    error.value = null
    try {
      const result = await apiEntity.getPaginated(filters)
      items.value = result.data
      return result
    } catch (err) {
      error.value = err.message
      notificationStore.error('No se pudieron cargar los datos.')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id) {
    isLoading.value = true
    error.value = null
    try {
      currentItem.value = await apiEntity.getById(id)
      return currentItem.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createItem(data) {
    isLoading.value = true
    error.value = null
    try {
      const created = await apiEntity.create(data)
      items.value.unshift(created)
      notificationStore.success('Elemento creado correctamente.')
      return created
    } catch (err) {
      error.value = err.message
      notificationStore.error('No se pudo crear el elemento.')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateItem(id, data) {
    isLoading.value = true
    error.value = null
    try {
      const updated = await apiEntity.update(id, data)
      const index = items.value.findIndex(i => i.id === id)
      if (index !== -1) items.value[index] = updated
      notificationStore.success('Elemento actualizado correctamente.')
      return updated
    } catch (err) {
      error.value = err.message
      notificationStore.error('No se pudo actualizar el elemento.')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteItem(id) {
    isLoading.value = true
    error.value = null
    try {
      await apiEntity.remove(id)
      items.value = items.value.filter(i => i.id !== id)
      notificationStore.success('Elemento eliminado correctamente.')
    } catch (err) {
      error.value = err.message
      notificationStore.error('No se pudo eliminar el elemento.')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function resetState() {
    items.value = []
    currentItem.value = null
    error.value = null
  }

  // ── Retorno ──────────────────────────────────────────
  return {
    // Estado
    items,
    currentItem,
    isLoading,
    error,
    // Computed
    totalItems,
    hasError,
    // Acciones
    fetchItems,
    fetchById,
    createItem,
    updateItem,
    deleteItem,
    resetState
  }
}
```

---

## Paso 3 — Reglas obligatorias

- Nombre: siempre `use` + PascalCase del concepto
- Retornar refs individuales, nunca un reactive desestructurado
- Sin acceso al DOM (usar templateRef)
- Documentar con JSDoc: qué recibe, qué devuelve, efectos
- Limpiar subscripciones en onUnmounted si aplica
- Error handling en cada acción async
- Re-lanzar errores para que el componente pueda reaccionar
- NotificationStore para feedback al usuario

---

## Paso 4 — Tests (TDD)

```javascript
import { useFeature } from '../use-[feature]'
import { apiEntity } from '@/services/api-[entity]'

vi.mock('@/services/api-[entity]')

describe('useFeature', () => {
  it('debería inicializar con estado vacío', () => {
    const { items, isLoading, error } = useFeature()
    expect(items.value).toEqual([])
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  describe('fetchItems', () => {
    it('debería cargar items correctamente', async () => {
      const mockData = [{ id: '1', name: 'Test' }]
      apiEntity.getPaginated.mockResolvedValue({ data: mockData })
      const { items, fetchItems } = useFeature()
      await fetchItems()
      expect(items.value).toEqual(mockData)
    })

    it('debería manejar errores', async () => {
      apiEntity.getPaginated.mockRejectedValue(new Error('Error'))
      const { error, fetchItems } = useFeature()
      await expect(fetchItems()).rejects.toThrow()
      expect(error.value).toBe('Error')
    })
  })
})
```

---

## Entrega

1. `src/composables/use-[feature].js` — composable completo
2. `src/composables/use-[feature].spec.js` — tests
