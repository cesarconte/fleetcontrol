import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/api-vehicles.js', () => ({
  apiVehicles: {
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

import { useVehicles } from './use-vehicles.js'
import { apiVehicles } from '@/services/api-vehicles.js'

const mockPaginatedResult = {
  data: [
    { id: 'v-1', plate: '1234ABC', brand: 'Volvo' },
    { id: 'v-2', plate: '5678DEF', brand: 'MAN' },
  ],
  total: 2,
}

const mockVehicle = { id: 'v-1', plate: '1234ABC', brand: 'Volvo' }

describe('useVehicles', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('estado inicial', () => {
    it('debería tener items vacío', () => {
      const { items } = useVehicles()
      expect(items.value).toEqual([])
    })

    it('debería tener total en 0', () => {
      const { total } = useVehicles()
      expect(total.value).toBe(0)
    })

    it('debería tener isLoading en false', () => {
      const { isLoading } = useVehicles()
      expect(isLoading.value).toBe(false)
    })

    it('debería tener error en null', () => {
      const { error } = useVehicles()
      expect(error.value).toBeNull()
    })

    it('debería tener page en 1', () => {
      const { page } = useVehicles()
      expect(page.value).toBe(1)
    })

    it('debería tener currentVehicle en null', () => {
      const { currentVehicle } = useVehicles()
      expect(currentVehicle.value).toBeNull()
    })
  })

  describe('fetch', () => {
    it('debería cargar items y total en éxito', async () => {
      apiVehicles.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { items, total, fetch } = useVehicles()

      await fetch()

      expect(items.value).toEqual(mockPaginatedResult.data)
      expect(total.value).toBe(2)
    })

    it('debería establecer isLoading durante la carga', async () => {
      let resolvePromise
      apiVehicles.getPaginated.mockReturnValue(
        new Promise(resolve => {
          resolvePromise = resolve
        }),
      )
      const { isLoading, fetch } = useVehicles()

      const promise = fetch()
      expect(isLoading.value).toBe(true)

      resolvePromise(mockPaginatedResult)
      await promise
      expect(isLoading.value).toBe(false)
    })

    it('debería establecer error y llamar notifications.error en fallo', async () => {
      const err = new Error('Network error')
      apiVehicles.getPaginated.mockRejectedValue(err)
      const { error, fetch } = useVehicles()

      await fetch()

      expect(error.value).toBe(err)
    })

    it('debería pasar parámetros de paginación correctos', async () => {
      apiVehicles.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { fetch } = useVehicles()

      await fetch()

      expect(apiVehicles.getPaginated).toHaveBeenCalledWith({
        page: 1,
        pageSize: 25,
        filters: {},
        sort: { col: 'plate', asc: true },
      })
    })
  })

  describe('getById', () => {
    it('debería establecer currentVehicle en éxito', async () => {
      apiVehicles.getById.mockResolvedValue(mockVehicle)
      const { currentVehicle, getById } = useVehicles()

      const result = await getById('v-1')

      expect(apiVehicles.getById).toHaveBeenCalledWith('v-1')
      expect(currentVehicle.value).toEqual(mockVehicle)
      expect(result).toEqual(mockVehicle)
    })

    it('debería lanzar error y establecer error en fallo', async () => {
      const err = new Error('Not found')
      apiVehicles.getById.mockRejectedValue(err)
      const { error, getById } = useVehicles()

      await expect(getById('v-999')).rejects.toThrow('Not found')
      expect(error.value).toBe(err)
    })
  })

  describe('create', () => {
    it('debería retornar el vehículo creado', async () => {
      apiVehicles.create.mockResolvedValue(mockVehicle)
      const { create } = useVehicles()

      const result = await create({ plate: '1234ABC', brand: 'Volvo' })

      expect(apiVehicles.create).toHaveBeenCalledWith({ plate: '1234ABC', brand: 'Volvo' })
      expect(result).toEqual(mockVehicle)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Duplicate')
      apiVehicles.create.mockRejectedValue(err)
      const { error, create } = useVehicles()

      await expect(create({ plate: '1234ABC' })).rejects.toThrow('Duplicate')
      expect(error.value).toBe(err)
    })
  })

  describe('update', () => {
    it('debería retornar el vehículo actualizado', async () => {
      const updated = { ...mockVehicle, brand: 'Scania' }
      apiVehicles.update.mockResolvedValue(updated)
      const { update } = useVehicles()

      const result = await update('v-1', { brand: 'Scania' })

      expect(apiVehicles.update).toHaveBeenCalledWith('v-1', { brand: 'Scania' })
      expect(result).toEqual(updated)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Update failed')
      apiVehicles.update.mockRejectedValue(err)
      const { error, update } = useVehicles()

      await expect(update('v-1', {})).rejects.toThrow('Update failed')
      expect(error.value).toBe(err)
    })
  })

  describe('remove', () => {
    it('debería eliminar y refetch la lista', async () => {
      apiVehicles.delete.mockResolvedValue()
      apiVehicles.getPaginated.mockResolvedValue({ data: [], total: 0 })
      const { remove, items, total } = useVehicles()

      await remove('v-1')

      expect(apiVehicles.delete).toHaveBeenCalledWith('v-1')
      expect(apiVehicles.getPaginated).toHaveBeenCalled()
      expect(items.value).toEqual([])
      expect(total.value).toBe(0)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Delete failed')
      apiVehicles.delete.mockRejectedValue(err)
      const { error, remove } = useVehicles()

      await expect(remove('v-1')).rejects.toThrow('Delete failed')
      expect(error.value).toBe(err)
    })
  })

  describe('paginación', () => {
    it('setPage debería cambiar page y llamar fetch', async () => {
      apiVehicles.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { page, setPage } = useVehicles()

      setPage(3)

      expect(page.value).toBe(3)
      expect(apiVehicles.getPaginated).toHaveBeenCalled()
    })

    it('setSort debería cambiar sort y llamar fetch', async () => {
      apiVehicles.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { sort, setSort } = useVehicles()

      setSort('brand', false)

      expect(sort.value).toEqual({ col: 'brand', asc: false })
      expect(apiVehicles.getPaginated).toHaveBeenCalled()
    })

    it('setFilters debería cambiar filters, resetear page a 1 y llamar fetch', async () => {
      apiVehicles.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { filters, page, setFilters } = useVehicles()

      page.value = 5
      setFilters({ status: 'active' })

      expect(filters.value).toEqual({ status: 'active' })
      expect(page.value).toBe(1)
      expect(apiVehicles.getPaginated).toHaveBeenCalled()
    })

    it('resetFilters debería vaciar filters, resetear page a 1 y llamar fetch', async () => {
      apiVehicles.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { filters, page, setFilters, resetFilters } = useVehicles()

      setFilters({ status: 'active', brand: 'Volvo' })
      resetFilters()

      expect(filters.value).toEqual({})
      expect(page.value).toBe(1)
    })
  })

  describe('totalPages', () => {
    it('debería retornar 1 página cuando no hay items', () => {
      const { totalPages } = useVehicles()
      expect(totalPages.value).toBe(1)
    })

    it('debería calcular correctamente (50 items / 25 per page = 2 páginas)', async () => {
      apiVehicles.getPaginated.mockResolvedValue({
        data: Array(25).fill({}),
        total: 50,
      })
      const { totalPages, fetch } = useVehicles()

      await fetch()

      expect(totalPages.value).toBe(2)
    })
  })
})
