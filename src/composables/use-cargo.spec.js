import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/api-cargo.js', () => ({
  apiCargo: {
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

import { useCargo } from './use-cargo.js'
import { apiCargo } from '@/services/api-cargo.js'

const mockPaginatedResult = {
  data: [
    { id: 'c-1', reference: 'CGO-001', weight_kg: 12000, status: 'pending' },
    { id: 'c-2', reference: 'CGO-002', weight_kg: 8500, status: 'in_transit' },
  ],
  total: 2,
}

const mockRecord = { id: 'c-1', reference: 'CGO-001', weight_kg: 12000, status: 'pending' }

describe('useCargo', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('estado inicial', () => {
    it('debería tener items vacío', () => {
      const { items } = useCargo()
      expect(items.value).toEqual([])
    })

    it('debería tener total en 0', () => {
      const { total } = useCargo()
      expect(total.value).toBe(0)
    })

    it('debería tener isLoading en false', () => {
      const { isLoading } = useCargo()
      expect(isLoading.value).toBe(false)
    })

    it('debería tener error en null', () => {
      const { error } = useCargo()
      expect(error.value).toBeNull()
    })

    it('debería tener page en 1', () => {
      const { page } = useCargo()
      expect(page.value).toBe(1)
    })

    it('debería tener currentRecord en null', () => {
      const { currentRecord } = useCargo()
      expect(currentRecord.value).toBeNull()
    })
  })

  describe('fetch', () => {
    it('debería cargar items y total en éxito', async () => {
      apiCargo.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { items, total, fetch } = useCargo()

      await fetch()

      expect(items.value).toEqual(mockPaginatedResult.data)
      expect(total.value).toBe(2)
    })

    it('debería establecer isLoading durante la carga', async () => {
      let resolvePromise
      apiCargo.getPaginated.mockReturnValue(
        new Promise(resolve => {
          resolvePromise = resolve
        }),
      )
      const { isLoading, fetch } = useCargo()

      const promise = fetch()
      expect(isLoading.value).toBe(true)

      resolvePromise(mockPaginatedResult)
      await promise
      expect(isLoading.value).toBe(false)
    })

    it('debería establecer error en fallo', async () => {
      const err = new Error('Network error')
      apiCargo.getPaginated.mockRejectedValue(err)
      const { error, fetch } = useCargo()

      await fetch()

      expect(error.value).toBe(err)
    })

    it('debería pasar parámetros de paginación correctos', async () => {
      apiCargo.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { fetch } = useCargo()

      await fetch()

      expect(apiCargo.getPaginated).toHaveBeenCalledWith({
        page: 1,
        pageSize: 25,
        filters: {},
        sort: { col: 'created_at', asc: false },
      })
    })
  })

  describe('getById', () => {
    it('debería establecer currentRecord en éxito', async () => {
      apiCargo.getById.mockResolvedValue(mockRecord)
      const { currentRecord, getById } = useCargo()

      const result = await getById('c-1')

      expect(apiCargo.getById).toHaveBeenCalledWith('c-1')
      expect(currentRecord.value).toEqual(mockRecord)
      expect(result).toEqual(mockRecord)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Not found')
      apiCargo.getById.mockRejectedValue(err)
      const { error, getById } = useCargo()

      await expect(getById('c-999')).rejects.toThrow('Not found')
      expect(error.value).toBe(err)
    })
  })

  describe('create', () => {
    it('debería retornar el registro creado', async () => {
      apiCargo.create.mockResolvedValue(mockRecord)
      const { create } = useCargo()

      const result = await create({ reference: 'CGO-001', weight_kg: 12000 })

      expect(apiCargo.create).toHaveBeenCalledWith({
        reference: 'CGO-001',
        weight_kg: 12000,
      })
      expect(result).toEqual(mockRecord)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Validation error')
      apiCargo.create.mockRejectedValue(err)
      const { error, create } = useCargo()

      await expect(create({ reference: 'CGO-001' })).rejects.toThrow('Validation error')
      expect(error.value).toBe(err)
    })
  })

  describe('update', () => {
    it('debería retornar el registro actualizado', async () => {
      const updated = { ...mockRecord, status: 'delivered' }
      apiCargo.update.mockResolvedValue(updated)
      const { update } = useCargo()

      const result = await update('c-1', { status: 'delivered' })

      expect(apiCargo.update).toHaveBeenCalledWith('c-1', { status: 'delivered' })
      expect(result).toEqual(updated)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Update failed')
      apiCargo.update.mockRejectedValue(err)
      const { error, update } = useCargo()

      await expect(update('c-1', {})).rejects.toThrow('Update failed')
      expect(error.value).toBe(err)
    })
  })

  describe('remove', () => {
    it('debería eliminar y refetch la lista', async () => {
      apiCargo.delete.mockResolvedValue()
      apiCargo.getPaginated.mockResolvedValue({ data: [], total: 0 })
      const { remove, items, total } = useCargo()

      await remove('c-1')

      expect(apiCargo.delete).toHaveBeenCalledWith('c-1')
      expect(apiCargo.getPaginated).toHaveBeenCalled()
      expect(items.value).toEqual([])
      expect(total.value).toBe(0)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Delete failed')
      apiCargo.delete.mockRejectedValue(err)
      const { error, remove } = useCargo()

      await expect(remove('c-1')).rejects.toThrow('Delete failed')
      expect(error.value).toBe(err)
    })
  })

  describe('paginación', () => {
    it('setPage debería cambiar page y llamar fetch', async () => {
      apiCargo.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { page, setPage } = useCargo()

      setPage(3)

      expect(page.value).toBe(3)
      expect(apiCargo.getPaginated).toHaveBeenCalled()
    })

    it('setFilters debería cambiar filters, resetear page a 1 y llamar fetch', async () => {
      apiCargo.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { filters, page, setFilters } = useCargo()

      page.value = 5
      setFilters({ status: 'pending' })

      expect(filters.value).toEqual({ status: 'pending' })
      expect(page.value).toBe(1)
      expect(apiCargo.getPaginated).toHaveBeenCalled()
    })

    it('resetFilters debería vaciar filters, resetear page a 1 y llamar fetch', async () => {
      apiCargo.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { filters, page, setFilters, resetFilters } = useCargo()

      setFilters({ status: 'pending' })
      resetFilters()

      expect(filters.value).toEqual({})
      expect(page.value).toBe(1)
    })
  })

  describe('totalPages', () => {
    it('debería retornar 1 página cuando no hay items', () => {
      const { totalPages } = useCargo()
      expect(totalPages.value).toBe(1)
    })

    it('debería calcular correctamente (50 items / 25 per page = 2 páginas)', async () => {
      apiCargo.getPaginated.mockResolvedValue({
        data: Array(25).fill({}),
        total: 50,
      })
      const { totalPages, fetch } = useCargo()

      await fetch()

      expect(totalPages.value).toBe(2)
    })
  })
})
