import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/api-fuel.js', () => ({
  apiFuel: {
    getPaginated: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getConsumptionStats: vi.fn(),
  },
}))

vi.mock('@/stores/notifications.js', () => ({
  useNotificationStore: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

import { useFuel } from './use-fuel.js'
import { apiFuel } from '@/services/api-fuel.js'

const mockPaginatedResult = {
  data: [
    { id: 'f-1', vehicle_id: 'v-1', liters: 80, cost: 120.5 },
    { id: 'f-2', vehicle_id: 'v-1', liters: 75, cost: 112.0 },
  ],
  total: 2,
}

const mockRecord = { id: 'f-1', vehicle_id: 'v-1', liters: 80, cost: 120.5 }

describe('useFuel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('estado inicial', () => {
    it('debería tener items vacío', () => {
      const { items } = useFuel()
      expect(items.value).toEqual([])
    })

    it('debería tener total en 0', () => {
      const { total } = useFuel()
      expect(total.value).toBe(0)
    })

    it('debería tener isLoading en false', () => {
      const { isLoading } = useFuel()
      expect(isLoading.value).toBe(false)
    })

    it('debería tener error en null', () => {
      const { error } = useFuel()
      expect(error.value).toBeNull()
    })

    it('debería tener page en 1', () => {
      const { page } = useFuel()
      expect(page.value).toBe(1)
    })

    it('debería tener currentRecord en null', () => {
      const { currentRecord } = useFuel()
      expect(currentRecord.value).toBeNull()
    })
  })

  describe('fetch', () => {
    it('debería cargar items y total en éxito', async () => {
      apiFuel.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { items, total, fetch } = useFuel()

      await fetch()

      expect(items.value).toEqual(mockPaginatedResult.data)
      expect(total.value).toBe(2)
    })

    it('debería establecer isLoading durante la carga', async () => {
      let resolvePromise
      apiFuel.getPaginated.mockReturnValue(
        new Promise(resolve => {
          resolvePromise = resolve
        }),
      )
      const { isLoading, fetch } = useFuel()

      const promise = fetch()
      expect(isLoading.value).toBe(true)

      resolvePromise(mockPaginatedResult)
      await promise
      expect(isLoading.value).toBe(false)
    })

    it('debería establecer error en fallo', async () => {
      const err = new Error('Network error')
      apiFuel.getPaginated.mockRejectedValue(err)
      const { error, fetch } = useFuel()

      await fetch()

      expect(error.value).toBe(err)
    })

    it('debería pasar parámetros de paginación correctos', async () => {
      apiFuel.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { fetch } = useFuel()

      await fetch()

      expect(apiFuel.getPaginated).toHaveBeenCalledWith({
        page: 1,
        pageSize: 25,
        filters: {},
        sort: { col: 'refuel_date', asc: false },
      })
    })
  })

  describe('getById', () => {
    it('debería establecer currentRecord en éxito', async () => {
      apiFuel.getById.mockResolvedValue(mockRecord)
      const { currentRecord, getById } = useFuel()

      const result = await getById('f-1')

      expect(apiFuel.getById).toHaveBeenCalledWith('f-1')
      expect(currentRecord.value).toEqual(mockRecord)
      expect(result).toEqual(mockRecord)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Not found')
      apiFuel.getById.mockRejectedValue(err)
      const { error, getById } = useFuel()

      await expect(getById('f-999')).rejects.toThrow('Not found')
      expect(error.value).toBe(err)
    })
  })

  describe('create', () => {
    it('debería retornar el registro creado', async () => {
      apiFuel.create.mockResolvedValue(mockRecord)
      const { create } = useFuel()

      const result = await create({ vehicle_id: 'v-1', liters: 80 })

      expect(apiFuel.create).toHaveBeenCalledWith({ vehicle_id: 'v-1', liters: 80 })
      expect(result).toEqual(mockRecord)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Validation error')
      apiFuel.create.mockRejectedValue(err)
      const { error, create } = useFuel()

      await expect(create({ liters: 80 })).rejects.toThrow('Validation error')
      expect(error.value).toBe(err)
    })
  })

  describe('update', () => {
    it('debería retornar el registro actualizado', async () => {
      const updated = { ...mockRecord, liters: 85 }
      apiFuel.update.mockResolvedValue(updated)
      const { update } = useFuel()

      const result = await update('f-1', { liters: 85 })

      expect(apiFuel.update).toHaveBeenCalledWith('f-1', { liters: 85 })
      expect(result).toEqual(updated)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Update failed')
      apiFuel.update.mockRejectedValue(err)
      const { error, update } = useFuel()

      await expect(update('f-1', {})).rejects.toThrow('Update failed')
      expect(error.value).toBe(err)
    })
  })

  describe('remove', () => {
    it('debería eliminar y refetch la lista', async () => {
      apiFuel.delete.mockResolvedValue()
      apiFuel.getPaginated.mockResolvedValue({ data: [], total: 0 })
      const { remove, items, total } = useFuel()

      await remove('f-1')

      expect(apiFuel.delete).toHaveBeenCalledWith('f-1')
      expect(apiFuel.getPaginated).toHaveBeenCalled()
      expect(items.value).toEqual([])
      expect(total.value).toBe(0)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Delete failed')
      apiFuel.delete.mockRejectedValue(err)
      const { error, remove } = useFuel()

      await expect(remove('f-1')).rejects.toThrow('Delete failed')
      expect(error.value).toBe(err)
    })
  })

  describe('getConsumptionStats', () => {
    it('debería retornar estadísticas de consumo', async () => {
      const stats = { avg_liters: 77.5, total_cost: 232.5 }
      apiFuel.getConsumptionStats.mockResolvedValue(stats)
      const { getConsumptionStats } = useFuel()

      const result = await getConsumptionStats('v-1', { from: '2025-01-01' })

      expect(apiFuel.getConsumptionStats).toHaveBeenCalledWith('v-1', { from: '2025-01-01' })
      expect(result).toEqual(stats)
    })

    it('debería propagar errores', async () => {
      const err = new Error('Stats failed')
      apiFuel.getConsumptionStats.mockRejectedValue(err)
      const { getConsumptionStats } = useFuel()

      await expect(getConsumptionStats('v-1')).rejects.toThrow('Stats failed')
    })
  })

  describe('paginación', () => {
    it('setPage debería cambiar page y llamar fetch', async () => {
      apiFuel.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { page, setPage } = useFuel()

      setPage(3)

      expect(page.value).toBe(3)
      expect(apiFuel.getPaginated).toHaveBeenCalled()
    })

    it('setFilters debería cambiar filters, resetear page a 1 y llamar fetch', async () => {
      apiFuel.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { filters, page, setFilters } = useFuel()

      page.value = 5
      setFilters({ vehicle_id: 'v-1' })

      expect(filters.value).toEqual({ vehicle_id: 'v-1' })
      expect(page.value).toBe(1)
      expect(apiFuel.getPaginated).toHaveBeenCalled()
    })

    it('resetFilters debería vaciar filters, resetear page a 1 y llamar fetch', async () => {
      apiFuel.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { filters, page, setFilters, resetFilters } = useFuel()

      setFilters({ vehicle_id: 'v-1' })
      resetFilters()

      expect(filters.value).toEqual({})
      expect(page.value).toBe(1)
    })
  })

  describe('totalPages', () => {
    it('debería retornar 1 página cuando no hay items', () => {
      const { totalPages } = useFuel()
      expect(totalPages.value).toBe(1)
    })

    it('debería calcular correctamente (50 items / 25 per page = 2 páginas)', async () => {
      apiFuel.getPaginated.mockResolvedValue({
        data: Array(25).fill({}),
        total: 50,
      })
      const { totalPages, fetch } = useFuel()

      await fetch()

      expect(totalPages.value).toBe(2)
    })
  })
})
