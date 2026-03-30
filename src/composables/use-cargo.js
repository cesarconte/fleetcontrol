/**
 * FleetControl — useCargo Composable
 */

import { ref, computed } from 'vue'
import { apiCargo } from '@/services/api-cargo.js'
import { useNotificationStore } from '@/stores/notifications.js'

export function useCargo(initialFilters = {}) {
  const items = ref([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref(null)
  const currentRecord = ref(null)

  const page = ref(1)
  const pageSize = ref(25)
  const filters = ref({ ...initialFilters })
  const sort = ref({ col: 'created_at', asc: false })

  const notifications = useNotificationStore()
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1)

  async function fetch() {
    isLoading.value = true
    error.value = null
    try {
      const result = await apiCargo.getPaginated({
        page: page.value,
        pageSize: pageSize.value,
        filters: filters.value,
        sort: sort.value,
      })
      items.value = result.data
      total.value = result.total
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar cargas')
    } finally {
      isLoading.value = false
    }
  }

  async function getById(id) {
    isLoading.value = true
    error.value = null
    try {
      currentRecord.value = await apiCargo.getById(id)
      return currentRecord.value
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar la carga')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function create(data) {
    isLoading.value = true
    error.value = null
    try {
      const record = await apiCargo.create(data)
      notifications.success('Carga registrada correctamente')
      return record
    } catch (err) {
      error.value = err
      notifications.error('Error al registrar carga')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function update(id, data) {
    isLoading.value = true
    error.value = null
    try {
      const record = await apiCargo.update(id, data)
      notifications.success('Carga actualizada')
      return record
    } catch (err) {
      error.value = err
      notifications.error('Error al actualizar carga')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function remove(id) {
    isLoading.value = true
    error.value = null
    try {
      await apiCargo.delete(id)
      notifications.success('Carga eliminada')
      await fetch()
    } catch (err) {
      error.value = err
      notifications.error('Error al eliminar carga')
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
