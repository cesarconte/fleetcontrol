import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/api-maintenance.js', () => ({
  apiMaintenance: {
    getPaginated: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/stores/notifications.js', () => ({
  useNotificationStore: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

import { useMaintenance } from './use-maintenance.js'
import { apiMaintenance } from '@/services/api-maintenance.js'

const mockPaginatedResult = {
  data: [
    { id: 'm-1', vehicle_id: 'v-1', type: 'oil_change', status: 'scheduled' },
    { id: 'm-2', vehicle_id: 'v-1', type: 'brake_inspection', status: 'completed' },
  ],
  total: 2,
}

const mockRecord = { id: 'm-1', vehicle_id: 'v-1', type: 'oil_change', status: 'scheduled' }

describe('useMaintenance', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('estado inicial', () => {
    it('debería tener items vacío', () => {
      const { items } = useMaintenance()
      expect(items.value).toEqual([])
    })

    it('debería tener total en 0', () => {
      const { total } = useMaintenance()
      expect(total.value).toBe(0)
    })

    it('debería tener isLoading en false', () => {
      const { isLoading } = useMaintenance()
      expect(isLoading.value).toBe(false)
    })

    it('debería tener error en null', () => {
      const { error } = useMaintenance()
      expect(error.value).toBeNull()
    })

    it('debería tener page en 1', () => {
      const { page } = useMaintenance()
      expect(page.value).toBe(1)
    })

    it('debería tener currentRecord en null', () => {
      const { currentRecord } = useMaintenance()
      expect(currentRecord.value).toBeNull()
    })
  })

  describe('fetch', () => {
    it('debería cargar items y total en éxito', async () => {
      apiMaintenance.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { items, total, fetch } = useMaintenance()

      await fetch()

      expect(items.value).toEqual(mockPaginatedResult.data)
      expect(total.value).toBe(2)
    })

    it('debería establecer isLoading durante la carga', async () => {
      let resolvePromise
      apiMaintenance.getPaginated.mockReturnValue(
        new Promise(resolve => {
          resolvePromise = resolve
        }),
      )
      const { isLoading, fetch } = useMaintenance()

      const promise = fetch()
      expect(isLoading.value).toBe(true)

      resolvePromise(mockPaginatedResult)
      await promise
      expect(isLoading.value).toBe(false)
    })

    it('debería establecer error en fallo', async () => {
      const err = new Error('Network error')
      apiMaintenance.getPaginated.mockRejectedValue(err)
      const { error, fetch } = useMaintenance()

      await fetch()

      expect(error.value).toBe(err)
    })

    it('debería pasar parámetros de paginación correctos', async () => {
      apiMaintenance.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { fetch } = useMaintenance()

      await fetch()

      expect(apiMaintenance.getPaginated).toHaveBeenCalledWith({
        page: 1,
        pageSize: 25,
        filters: {},
        sort: { col: 'scheduled_date', asc: false },
      })
    })
  })

  describe('getById', () => {
    it('debería establecer currentRecord en éxito', async () => {
      apiMaintenance.getById.mockResolvedValue(mockRecord)
      const { currentRecord, getById } = useMaintenance()

      const result = await getById('m-1')

      expect(apiMaintenance.getById).toHaveBeenCalledWith('m-1')
      expect(currentRecord.value).toEqual(mockRecord)
      expect(result).toEqual(mockRecord)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Not found')
      apiMaintenance.getById.mockRejectedValue(err)
      const { error, getById } = useMaintenance()

      await expect(getById('m-999')).rejects.toThrow('Not found')
      expect(error.value).toBe(err)
    })
  })

  describe('create', () => {
    it('debería retornar el registro creado', async () => {
      apiMaintenance.create.mockResolvedValue(mockRecord)
      const { create } = useMaintenance()

      const result = await create({ vehicle_id: 'v-1', type: 'oil_change' })

      expect(apiMaintenance.create).toHaveBeenCalledWith({
        vehicle_id: 'v-1',
        type: 'oil_change',
      })
      expect(result).toEqual(mockRecord)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Validation error')
      apiMaintenance.create.mockRejectedValue(err)
      const { error, create } = useMaintenance()

      await expect(create({ type: 'oil_change' })).rejects.toThrow('Validation error')
      expect(error.value).toBe(err)
    })
  })

  describe('update', () => {
    it('debería retornar el registro actualizado', async () => {
      const updated = { ...mockRecord, status: 'completed' }
      apiMaintenance.update.mockResolvedValue(updated)
      const { update } = useMaintenance()

      const result = await update('m-1', { status: 'completed' })

      expect(apiMaintenance.update).toHaveBeenCalledWith('m-1', { status: 'completed' })
      expect(result).toEqual(updated)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Update failed')
      apiMaintenance.update.mockRejectedValue(err)
      const { error, update } = useMaintenance()

      await expect(update('m-1', {})).rejects.toThrow('Update failed')
      expect(error.value).toBe(err)
    })
  })

  describe('remove', () => {
    it('debería eliminar y refetch la lista', async () => {
      apiMaintenance.delete.mockResolvedValue()
      apiMaintenance.getPaginated.mockResolvedValue({ data: [], total: 0 })
      const { remove, items, total } = useMaintenance()

      await remove('m-1')

      expect(apiMaintenance.delete).toHaveBeenCalledWith('m-1')
      expect(apiMaintenance.getPaginated).toHaveBeenCalled()
      expect(items.value).toEqual([])
      expect(total.value).toBe(0)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Delete failed')
      apiMaintenance.delete.mockRejectedValue(err)
      const { error, remove } = useMaintenance()

      await expect(remove('m-1')).rejects.toThrow('Delete failed')
      expect(error.value).toBe(err)
    })
  })

  describe('paginación', () => {
    it('setPage debería cambiar page y llamar fetch', async () => {
      apiMaintenance.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { page, setPage } = useMaintenance()

      setPage(3)

      expect(page.value).toBe(3)
      expect(apiMaintenance.getPaginated).toHaveBeenCalled()
    })

    it('setFilters debería cambiar filters, resetear page a 1 y llamar fetch', async () => {
      apiMaintenance.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { filters, page, setFilters } = useMaintenance()

      page.value = 5
      setFilters({ status: 'scheduled' })

      expect(filters.value).toEqual({ status: 'scheduled' })
      expect(page.value).toBe(1)
      expect(apiMaintenance.getPaginated).toHaveBeenCalled()
    })

    it('resetFilters debería vaciar filters, resetear page a 1 y llamar fetch', async () => {
      apiMaintenance.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { filters, page, setFilters, resetFilters } = useMaintenance()

      setFilters({ status: 'scheduled' })
      resetFilters()

      expect(filters.value).toEqual({})
      expect(page.value).toBe(1)
    })
  })

  describe('totalPages', () => {
    it('debería retornar 1 página cuando no hay items', () => {
      const { totalPages } = useMaintenance()
      expect(totalPages.value).toBe(1)
    })

    it('debería calcular correctamente (50 items / 25 per page = 2 páginas)', async () => {
      apiMaintenance.getPaginated.mockResolvedValue({
        data: Array(25).fill({}),
        total: 50,
      })
      const { totalPages, fetch } = useMaintenance()

      await fetch()

      expect(totalPages.value).toBe(2)
    })
  })
})
