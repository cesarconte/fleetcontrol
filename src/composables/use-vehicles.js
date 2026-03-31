/**
 * FleetControl — useVehicles Composable
 *
 * Reactive vehicle list with pagination, filtering, and CRUD operations.
 * Template for all other CRUD composites.
 */

import { ref, computed } from 'vue'
import { apiVehicles } from '@/services/api-vehicles.js'
import { useNotificationStore } from '@/stores/notifications.js'

export function useVehicles(initialFilters = {}) {
  const items = ref([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref(null)
  const currentVehicle = ref(null)

  const page = ref(1)
  const pageSize = ref(25)
  const filters = ref({ ...initialFilters })
  const sort = ref({ col: 'plate', asc: true })

  const notifications = useNotificationStore()

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1)

  async function fetch() {
    isLoading.value = true
    error.value = null
    try {
      const result = await apiVehicles.getPaginated({
        page: page.value,
        pageSize: pageSize.value,
        filters: filters.value,
        sort: sort.value,
      })
      items.value = result.data
      total.value = result.total
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar vehículos')
    } finally {
      isLoading.value = false
    }
  }

  async function getById(id) {
    isLoading.value = true
    error.value = null
    try {
      currentVehicle.value = await apiVehicles.getById(id)
      return currentVehicle.value
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar el vehículo')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(data) {
    isLoading.value = true
    error.value = null
    try {
      const vehicle = await apiVehicles.create(data)
      notifications.success('Vehículo creado correctamente')
      return vehicle
    } catch (err) {
      error.value = err
      notifications.error('Error al crear el vehículo')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function update(id, data) {
    isLoading.value = true
    error.value = null
    try {
      const vehicle = await apiVehicles.update(id, data)
      notifications.success('Vehículo actualizado')
      return vehicle
    } catch (err) {
      error.value = err
      notifications.error('Error al actualizar el vehículo')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function remove(id) {
    isLoading.value = true
    error.value = null
    try {
      await apiVehicles.delete(id)
      notifications.success('Vehículo eliminado')
      await fetch()
    } catch (err) {
      error.value = err
      notifications.error('Error al eliminar el vehículo')
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
    currentVehicle,
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
