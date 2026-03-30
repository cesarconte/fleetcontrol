/**
 * FleetControl — useMaintenance Composable
 *
 * Reactive maintenance list with pagination, filtering, and CRUD operations.
 */

import { ref, computed } from 'vue'
import { apiMaintenance } from '@/services/api-maintenance.js'
import { useNotificationStore } from '@/stores/notifications.js'

export function useMaintenance(initialFilters = {}) {
  const items = ref([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref(null)
  const currentRecord = ref(null)

  const page = ref(1)
  const pageSize = ref(25)
  const filters = ref({ ...initialFilters })
  const sort = ref({ col: 'fecha_programada', asc: false })

  const notifications = useNotificationStore()

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1)

  async function fetch() {
    isLoading.value = true
    error.value = null
    try {
      const result = await apiMaintenance.getPaginated({
        page: page.value,
        pageSize: pageSize.value,
        filters: filters.value,
        sort: sort.value,
      })
      items.value = result.data
      total.value = result.total
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar mantenimiento')
    } finally {
      isLoading.value = false
    }
  }

  async function getById(id) {
    isLoading.value = true
    error.value = null
    try {
      currentRecord.value = await apiMaintenance.getById(id)
      return currentRecord.value
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar el registro')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(data) {
    isLoading.value = true
    error.value = null
    try {
      const record = await apiMaintenance.create(data)
      notifications.success('Registro de mantenimiento creado')
      return record
    } catch (err) {
      error.value = err
      notifications.error('Error al crear el registro')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function update(id, data) {
    isLoading.value = true
    error.value = null
    try {
      const record = await apiMaintenance.update(id, data)
      notifications.success('Registro actualizado')
      return record
    } catch (err) {
      error.value = err
      notifications.error('Error al actualizar el registro')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function remove(id) {
    isLoading.value = true
    error.value = null
    try {
      await apiMaintenance.delete(id)
      notifications.success('Registro eliminado')
      await fetch()
    } catch (err) {
      error.value = err
      notifications.error('Error al eliminar el registro')
      throw err
    } finally {
      isLoading.value = false
    }
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
    setPage,
    setFilters,
    resetFilters,
  }
}
