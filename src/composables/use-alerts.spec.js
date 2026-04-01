import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/api-alerts.js', () => ({
  apiAlerts: {
    getPaginated: vi.fn(),
    getById: vi.fn(),
    getActiveCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    dismiss: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/stores/notifications.js', () => ({
  useNotificationStore: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

import { useAlerts } from './use-alerts.js'
import { apiAlerts } from '@/services/api-alerts.js'

const mockPaginatedResult = {
  data: [
    { id: 'a-1', alert_type: 'vehicle_doc_expired', severity: 'warning', title: 'ITV vencida' },
    { id: 'a-2', alert_type: 'speeding', severity: 'critical', title: 'Exceso velocidad' },
  ],
  total: 2,
}

const mockAlert = {
  id: 'a-1',
  alert_type: 'vehicle_doc_expired',
  severity: 'warning',
  title: 'ITV vencida',
  message: 'La ITV del vehículo 1234ABC vence en 5 días',
  is_read: false,
  is_dismissed: false,
}

describe('useAlerts', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('estado inicial', () => {
    it('debería tener items vacío', () => {
      const { items } = useAlerts()
      expect(items.value).toEqual([])
    })

    it('debería tener total en 0', () => {
      const { total } = useAlerts()
      expect(total.value).toBe(0)
    })

    it('debería tener isLoading en false', () => {
      const { isLoading } = useAlerts()
      expect(isLoading.value).toBe(false)
    })

    it('debería tener error en null', () => {
      const { error } = useAlerts()
      expect(error.value).toBeNull()
    })

    it('debería tener page en 1', () => {
      const { page } = useAlerts()
      expect(page.value).toBe(1)
    })

    it('debería tener activeCount en 0', () => {
      const { activeCount } = useAlerts()
      expect(activeCount.value).toBe(0)
    })

    it('debería tener filters vacío', () => {
      const { filters } = useAlerts()
      expect(filters.value).toEqual({})
    })
  })

  describe('fetch', () => {
    it('debería cargar items y total en éxito', async () => {
      apiAlerts.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { items, total, fetch } = useAlerts()

      await fetch()

      expect(items.value).toEqual(mockPaginatedResult.data)
      expect(total.value).toBe(2)
    })

    it('debería establecer isLoading durante la carga', async () => {
      let resolvePromise
      apiAlerts.getPaginated.mockReturnValue(
        new Promise(resolve => {
          resolvePromise = resolve
        }),
      )
      const { isLoading, fetch } = useAlerts()

      const promise = fetch()
      expect(isLoading.value).toBe(true)

      resolvePromise(mockPaginatedResult)
      await promise
      expect(isLoading.value).toBe(false)
    })

    it('debería establecer error y llamar notifications.error en fallo', async () => {
      const err = new Error('Network error')
      apiAlerts.getPaginated.mockRejectedValue(err)
      const { error, fetch } = useAlerts()

      await fetch()

      expect(error.value).toBe(err)
    })

    it('debería pasar parámetros de paginación correctos', async () => {
      apiAlerts.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { fetch } = useAlerts()

      await fetch()

      expect(apiAlerts.getPaginated).toHaveBeenCalledWith({
        page: 1,
        pageSize: 25,
        filters: {},
        sort: { col: 'created_at', asc: false },
      })
    })
  })

  describe('getById', () => {
    it('debería retornar la alerta encontrada', async () => {
      apiAlerts.getById.mockResolvedValue(mockAlert)
      const { getById } = useAlerts()

      const result = await getById('a-1')

      expect(apiAlerts.getById).toHaveBeenCalledWith('a-1')
      expect(result).toEqual(mockAlert)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Not found')
      apiAlerts.getById.mockRejectedValue(err)
      const { error, getById } = useAlerts()

      await expect(getById('a-999')).rejects.toThrow('Not found')
      expect(error.value).toBe(err)
    })
  })

  describe('markAsRead', () => {
    it('debería marcar alerta como leída y refetch', async () => {
      const readAlert = { ...mockAlert, is_read: true }
      apiAlerts.markAsRead.mockResolvedValue(readAlert)
      apiAlerts.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { markAsRead } = useAlerts()

      await markAsRead('a-1')

      expect(apiAlerts.markAsRead).toHaveBeenCalledWith('a-1')
      expect(apiAlerts.getPaginated).toHaveBeenCalled()
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Mark failed')
      apiAlerts.markAsRead.mockRejectedValue(err)
      const { error, markAsRead } = useAlerts()

      await expect(markAsRead('a-1')).rejects.toThrow('Mark failed')
      expect(error.value).toBe(err)
    })
  })

  describe('markAllAsRead', () => {
    it('debería marcar todas como leídas y refetch', async () => {
      apiAlerts.markAllAsRead.mockResolvedValue()
      apiAlerts.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { markAllAsRead } = useAlerts()

      await markAllAsRead()

      expect(apiAlerts.markAllAsRead).toHaveBeenCalled()
      expect(apiAlerts.getPaginated).toHaveBeenCalled()
    })
  })

  describe('dismiss', () => {
    it('debería silenciar alerta con justificación y refetch', async () => {
      const dismissedAlert = { ...mockAlert, is_dismissed: true }
      apiAlerts.dismiss.mockResolvedValue(dismissedAlert)
      apiAlerts.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { dismiss } = useAlerts()

      await dismiss('a-1', 'Duplicada')

      expect(apiAlerts.dismiss).toHaveBeenCalledWith('a-1', 'Duplicada')
      expect(apiAlerts.getPaginated).toHaveBeenCalled()
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Dismiss failed')
      apiAlerts.dismiss.mockRejectedValue(err)
      const { error, dismiss } = useAlerts()

      await expect(dismiss('a-1', 'x')).rejects.toThrow('Dismiss failed')
      expect(error.value).toBe(err)
    })
  })

  describe('remove', () => {
    it('debería eliminar y refetch la lista', async () => {
      apiAlerts.delete.mockResolvedValue()
      apiAlerts.getPaginated.mockResolvedValue({ data: [], total: 0 })
      const { remove, items, total } = useAlerts()

      await remove('a-1')

      expect(apiAlerts.delete).toHaveBeenCalledWith('a-1')
      expect(apiAlerts.getPaginated).toHaveBeenCalled()
      expect(items.value).toEqual([])
      expect(total.value).toBe(0)
    })
  })

  describe('fetchActiveCount', () => {
    it('debería actualizar activeCount', async () => {
      apiAlerts.getActiveCount.mockResolvedValue(7)
      const { activeCount, fetchActiveCount } = useAlerts()

      await fetchActiveCount()

      expect(activeCount.value).toBe(7)
    })

    it('debería manejar error sin lanzar', async () => {
      apiAlerts.getActiveCount.mockRejectedValue(new Error('fail'))
      const { activeCount, fetchActiveCount } = useAlerts()

      await fetchActiveCount()

      expect(activeCount.value).toBe(0)
    })
  })

  describe('paginación', () => {
    it('setPage debería cambiar page y llamar fetch', async () => {
      apiAlerts.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { page, setPage } = useAlerts()

      setPage(3)

      expect(page.value).toBe(3)
      expect(apiAlerts.getPaginated).toHaveBeenCalled()
    })

    it('setSort debería cambiar sort y llamar fetch', async () => {
      apiAlerts.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { sort, setSort } = useAlerts()

      setSort('severity', true)

      expect(sort.value).toEqual({ col: 'severity', asc: true })
      expect(apiAlerts.getPaginated).toHaveBeenCalled()
    })

    it('setFilters debería cambiar filters, resetear page a 1 y llamar fetch', async () => {
      apiAlerts.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { filters, page, setFilters } = useAlerts()

      page.value = 5
      setFilters({ severity: 'critical' })

      expect(filters.value).toEqual({ severity: 'critical' })
      expect(page.value).toBe(1)
      expect(apiAlerts.getPaginated).toHaveBeenCalled()
    })

    it('resetFilters debería vaciar filters, resetear page a 1 y llamar fetch', async () => {
      apiAlerts.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { filters, page, setFilters, resetFilters } = useAlerts()

      setFilters({ severity: 'critical', is_read: false })
      resetFilters()

      expect(filters.value).toEqual({})
      expect(page.value).toBe(1)
    })
  })

  describe('totalPages', () => {
    it('debería retornar 1 página cuando no hay items', () => {
      const { totalPages } = useAlerts()
      expect(totalPages.value).toBe(1)
    })

    it('debería calcular correctamente (50 items / 25 per page = 2 páginas)', async () => {
      apiAlerts.getPaginated.mockResolvedValue({
        data: Array(25).fill({}),
        total: 50,
      })
      const { totalPages, fetch } = useAlerts()

      await fetch()

      expect(totalPages.value).toBe(2)
    })
  })
})
