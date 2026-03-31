/**
 * FleetControl — useRoutes Composable
 *
 * Reactive route list with pagination, filtering, and CRUD operations.
 * Sort column matches Supabase DB schema (planned_departure).
 */

import { ref, computed } from 'vue'
import { apiRoutes } from '@/services/api-routes.js'
import { useNotificationStore } from '@/stores/notifications.js'

export function useRoutes(initialFilters = {}) {
  const items = ref([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref(null)
  const currentRoute = ref(null)

  const page = ref(1)
  const pageSize = ref(25)
  const filters = ref({ ...initialFilters })
  const sort = ref({ col: 'planned_departure', asc: false })

  const notifications = useNotificationStore()

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1)

  async function fetch() {
    isLoading.value = true
    error.value = null
    try {
      const result = await apiRoutes.getPaginated({
        page: page.value,
        pageSize: pageSize.value,
        filters: filters.value,
        sort: sort.value,
      })
      items.value = result.data
      total.value = result.total
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar rutas')
    } finally {
      isLoading.value = false
    }
  }

  async function getById(id) {
    isLoading.value = true
    error.value = null
    try {
      currentRoute.value = await apiRoutes.getById(id)
      return currentRoute.value
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar la ruta')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(data) {
    isLoading.value = true
    error.value = null
    try {
      const route = await apiRoutes.create(data)
      notifications.success('Ruta creada correctamente')
      return route
    } catch (err) {
      error.value = err
      notifications.error('Error al crear la ruta')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function update(id, data) {
    isLoading.value = true
    error.value = null
    try {
      const route = await apiRoutes.update(id, data)
      notifications.success('Ruta actualizada')
      return route
    } catch (err) {
      error.value = err
      notifications.error('Error al actualizar la ruta')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function remove(id) {
    isLoading.value = true
    error.value = null
    try {
      await apiRoutes.delete(id)
      notifications.success('Ruta eliminada')
      await fetch()
    } catch (err) {
      error.value = err
      notifications.error('Error al eliminar la ruta')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function getActive() {
    isLoading.value = true
    error.value = null
    try {
      return await apiRoutes.getActive()
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar rutas activas')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function setPage(newPage) {
    page.value = newPage
    fetch()
  }

  function setSort(col, asc) {
    sort.value = { col, asc }
    fetch()
  }

  function setFilters(newFilters) {
    filters.value = { ...newFilters }
    page.value = 1
    fetch()
  }

  function resetFilters() {
    filters.value = {}
    page.value = 1
    fetch()
  }

  return {
    items,
    total,
    totalPages,
    isLoading,
    error,
    currentRoute,
    page,
    pageSize,
    filters,
    sort,
    fetch,
    getById,
    create,
    update,
    remove,
    getActive,
    setPage,
    setSort,
    setFilters,
    resetFilters,
  }
}
