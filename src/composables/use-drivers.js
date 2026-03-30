/**
 * FleetControl — useDrivers Composable
 *
 * Reactive driver list with pagination, filtering, and CRUD operations.
 */

import { ref, computed } from 'vue'
import { apiDrivers } from '@/services/api-drivers.js'
import { useNotificationStore } from '@/stores/notifications.js'

export function useDrivers(initialFilters = {}) {
  const items = ref([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref(null)
  const currentDriver = ref(null)

  const page = ref(1)
  const pageSize = ref(25)
  const filters = ref({ ...initialFilters })
  const sort = ref({ col: 'full_name', asc: true })

  const notifications = useNotificationStore()

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1)

  async function fetch() {
    isLoading.value = true
    error.value = null
    try {
      const result = await apiDrivers.getPaginated({
        page: page.value,
        pageSize: pageSize.value,
        filters: filters.value,
        sort: sort.value,
      })
      items.value = result.data
      total.value = result.total
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar conductores')
    } finally {
      isLoading.value = false
    }
  }

  async function getById(id) {
    isLoading.value = true
    error.value = null
    try {
      currentDriver.value = await apiDrivers.getById(id)
      return currentDriver.value
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar el conductor')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(data) {
    isLoading.value = true
    error.value = null
    try {
      const driver = await apiDrivers.create(data)
      notifications.success('Conductor creado correctamente')
      return driver
    } catch (err) {
      error.value = err
      notifications.error('Error al crear el conductor')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function update(id, data) {
    isLoading.value = true
    error.value = null
    try {
      const driver = await apiDrivers.update(id, data)
      notifications.success('Conductor actualizado')
      return driver
    } catch (err) {
      error.value = err
      notifications.error('Error al actualizar el conductor')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function remove(id) {
    isLoading.value = true
    error.value = null
    try {
      await apiDrivers.delete(id)
      notifications.success('Conductor eliminado')
      await fetch()
    } catch (err) {
      error.value = err
      notifications.error('Error al eliminar el conductor')
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
    currentDriver,
    page,
    pageSize,
    filters,
    sort,
    fetch,
    getById,
    create,
    update,
    remove,
    setPage,
    setSort,
    setFilters,
    resetFilters,
  }
}
