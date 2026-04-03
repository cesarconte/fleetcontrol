/**
 * FleetControl — useAlerts Composable
 *
 * Reactive alert list with pagination, filtering, and alert-specific actions.
 * Follows the same pattern as useVehicles per AGENTS.md §4.
 *
 * @see PRD §4.8 — Alertas y Notificaciones
 * @see apiAlerts — Service layer
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { apiAlerts } from '@/services/api-alerts.js'
import { useNotificationStore } from '@/stores/notifications.js'
import { useRealtime } from './use-realtime.js'

export function useAlerts(initialFilters = {}) {
  const items = ref([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref(null)
  const activeCount = ref(0)

  const page = ref(1)
  const pageSize = ref(25)
  const filters = ref({ ...initialFilters })
  const sort = ref({ col: 'created_at', asc: false })

  const notifications = useNotificationStore()
  const realtime = useRealtime()

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1)

  function handleAlertChange({ eventType, new: record, old: oldRecord }) {
    try {
      if (eventType === 'INSERT') {
        items.value.unshift(record)
        total.value++
        if (record.severity === 'critical') {
          notifications.error(`Nueva alerta crítica: ${record.title}`)
        } else {
          notifications.warning(`Nueva alerta: ${record.title}`)
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
    } catch (err) {
      console.error('[useAlerts] Realtime handler error:', err)
    }
  }

  onMounted(() => {
    realtime.subscribe('alerts', handleAlertChange)
  })

  onUnmounted(() => {
    realtime.unsubscribe('alerts')
  })

  async function fetch() {
    isLoading.value = true
    error.value = null
    try {
      const result = await apiAlerts.getPaginated({
        page: page.value,
        pageSize: pageSize.value,
        filters: filters.value,
        sort: sort.value,
      })
      items.value = result.data
      total.value = result.total
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar alertas')
    } finally {
      isLoading.value = false
    }
  }

  async function getById(id) {
    isLoading.value = true
    error.value = null
    try {
      const alert = await apiAlerts.getById(id)
      return alert
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar la alerta')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function markAsRead(id) {
    error.value = null
    try {
      await apiAlerts.markAsRead(id)
      notifications.success('Alerta marcada como leída')
      await fetch()
    } catch (err) {
      error.value = err
      notifications.error('Error al marcar como leída')
      throw err
    }
  }

  async function markAllAsRead() {
    error.value = null
    try {
      await apiAlerts.markAllAsRead()
      notifications.success('Todas las alertas marcadas como leídas')
      await fetch()
    } catch (err) {
      error.value = err
      notifications.error('Error al marcar alertas')
      throw err
    }
  }

  async function dismiss(id, justification) {
    error.value = null
    try {
      await apiAlerts.dismiss(id, justification)
      notifications.success('Alerta silenciada')
      await fetch()
    } catch (err) {
      error.value = err
      notifications.error('Error al silenciar la alerta')
      throw err
    }
  }

  async function remove(id) {
    error.value = null
    try {
      await apiAlerts.delete(id)
      notifications.success('Alerta eliminada')
      await fetch()
    } catch (err) {
      error.value = err
      notifications.error('Error al eliminar la alerta')
      throw err
    }
  }

  async function fetchActiveCount() {
    try {
      activeCount.value = await apiAlerts.getActiveCount()
    } catch {
      activeCount.value = 0
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
    activeCount,
    page,
    pageSize,
    filters,
    sort,
    fetch,
    getById,
    markAsRead,
    markAllAsRead,
    dismiss,
    remove,
    fetchActiveCount,
    setPage,
    setSort,
    setFilters,
    resetFilters,
  }
}
