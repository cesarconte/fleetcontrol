/**
 * FleetControl — useFuel Composable
 *
 * Reactive fuel records with pagination, filtering, and CRUD operations.
 */

import { ref, computed } from 'vue'
import { apiFuel } from '@/services/api-fuel.js'
import { useNotificationStore } from '@/stores/notifications.js'

export function useFuel(initialFilters = {}) {
  const items = ref([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref(null)
  const currentRecord = ref(null)

  const page = ref(1)
  const pageSize = ref(25)
  const filters = ref({ ...initialFilters })
  const sort = ref({ col: 'date', asc: false })

  const notifications = useNotificationStore()

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1)

  async function fetch() {
    isLoading.value = true
    error.value = null
    try {
      const result = await apiFuel.getPaginated({
        page: page.value,
        pageSize: pageSize.value,
        filters: filters.value,
        sort: sort.value,
      })
      items.value = result.data
      total.value = result.total
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar repostajes')
    } finally {
      isLoading.value = false
    }
  }

  async function getById(id) {
    isLoading.value = true
    error.value = null
    try {
      currentRecord.value = await apiFuel.getById(id)
      return currentRecord.value
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar el repostaje')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(data) {
    isLoading.value = true
    error.value = null
    try {
      const record = await apiFuel.create(data)
      notifications.success('Repostaje registrado')
      return record
    } catch (err) {
      error.value = err
      notifications.error('Error al registrar repostaje')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function update(id, data) {
    isLoading.value = true
    error.value = null
    try {
      const record = await apiFuel.update(id, data)
      notifications.success('Repostaje actualizado')
      return record
    } catch (err) {
      error.value = err
      notifications.error('Error al actualizar el repostaje')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function remove(id) {
    isLoading.value = true
    error.value = null
    try {
      await apiFuel.delete(id)
      notifications.success('Repostaje eliminado')
      await fetch()
    } catch (err) {
      error.value = err
      notifications.error('Error al eliminar el repostaje')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function getConsumptionStats(vehicleId, opts) {
    return apiFuel.getConsumptionStats(vehicleId, opts)
  }

  function setPage(newPage) {
    page.value = newPage
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
    currentRecord,
    page,
    pageSize,
    filters,
    sort,
    fetch,
    getById,
    create,
    update,
    remove,
    getConsumptionStats,
    setPage,
    setFilters,
    resetFilters,
  }
}
