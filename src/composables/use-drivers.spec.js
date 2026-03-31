import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/api-drivers.js', () => ({
  apiDrivers: {
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

import { useDrivers } from './use-drivers.js'
import { apiDrivers } from '@/services/api-drivers.js'

const mockPaginatedResult = {
  data: [
    { id: 'd-1', full_name: 'Juan García', license_number: 'LIC001' },
    { id: 'd-2', full_name: 'María López', license_number: 'LIC002' },
  ],
  total: 2,
}

const mockDriver = { id: 'd-1', full_name: 'Juan García', license_number: 'LIC001' }

describe('useDrivers', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('estado inicial', () => {
    it('debería tener items vacío', () => {
      const { items } = useDrivers()
      expect(items.value).toEqual([])
    })

    it('debería tener total en 0', () => {
      const { total } = useDrivers()
      expect(total.value).toBe(0)
    })

    it('debería tener isLoading en false', () => {
      const { isLoading } = useDrivers()
      expect(isLoading.value).toBe(false)
    })

    it('debería tener error en null', () => {
      const { error } = useDrivers()
      expect(error.value).toBeNull()
    })

    it('debería tener page en 1', () => {
      const { page } = useDrivers()
      expect(page.value).toBe(1)
    })

    it('debería tener currentDriver en null', () => {
      const { currentDriver } = useDrivers()
      expect(currentDriver.value).toBeNull()
    })
  })

  describe('fetch', () => {
    it('debería cargar items y total en éxito', async () => {
      apiDrivers.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { items, total, fetch } = useDrivers()

      await fetch()

      expect(items.value).toEqual(mockPaginatedResult.data)
      expect(total.value).toBe(2)
    })

    it('debería establecer isLoading durante la carga', async () => {
      let resolvePromise
      apiDrivers.getPaginated.mockReturnValue(
        new Promise(resolve => {
          resolvePromise = resolve
        }),
      )
      const { isLoading, fetch } = useDrivers()

      const promise = fetch()
      expect(isLoading.value).toBe(true)

      resolvePromise(mockPaginatedResult)
      await promise
      expect(isLoading.value).toBe(false)
    })

    it('debería establecer error en fallo', async () => {
      const err = new Error('Network error')
      apiDrivers.getPaginated.mockRejectedValue(err)
      const { error, fetch } = useDrivers()

      await fetch()

      expect(error.value).toBe(err)
    })

    it('debería pasar parámetros de paginación correctos', async () => {
      apiDrivers.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { fetch } = useDrivers()

      await fetch()

      expect(apiDrivers.getPaginated).toHaveBeenCalledWith({
        page: 1,
        pageSize: 25,
        filters: {},
        sort: { col: 'full_name', asc: true },
      })
    })
  })

  describe('getById', () => {
    it('debería establecer currentDriver en éxito', async () => {
      apiDrivers.getById.mockResolvedValue(mockDriver)
      const { currentDriver, getById } = useDrivers()

      const result = await getById('d-1')

      expect(apiDrivers.getById).toHaveBeenCalledWith('d-1')
      expect(currentDriver.value).toEqual(mockDriver)
      expect(result).toEqual(mockDriver)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Not found')
      apiDrivers.getById.mockRejectedValue(err)
      const { error, getById } = useDrivers()

      await expect(getById('d-999')).rejects.toThrow('Not found')
      expect(error.value).toBe(err)
    })
  })

  describe('create', () => {
    it('debería retornar el conductor creado', async () => {
      apiDrivers.create.mockResolvedValue(mockDriver)
      const { create } = useDrivers()

      const result = await create({ full_name: 'Juan García', license_number: 'LIC001' })

      expect(apiDrivers.create).toHaveBeenCalledWith({
        full_name: 'Juan García',
        license_number: 'LIC001',
      })
      expect(result).toEqual(mockDriver)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Duplicate')
      apiDrivers.create.mockRejectedValue(err)
      const { error, create } = useDrivers()

      await expect(create({ full_name: 'Test' })).rejects.toThrow('Duplicate')
      expect(error.value).toBe(err)
    })
  })

  describe('update', () => {
    it('debería retornar el conductor actualizado', async () => {
      const updated = { ...mockDriver, full_name: 'Juan G. García' }
      apiDrivers.update.mockResolvedValue(updated)
      const { update } = useDrivers()

      const result = await update('d-1', { full_name: 'Juan G. García' })

      expect(apiDrivers.update).toHaveBeenCalledWith('d-1', { full_name: 'Juan G. García' })
      expect(result).toEqual(updated)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Update failed')
      apiDrivers.update.mockRejectedValue(err)
      const { error, update } = useDrivers()

      await expect(update('d-1', {})).rejects.toThrow('Update failed')
      expect(error.value).toBe(err)
    })
  })

  describe('remove', () => {
    it('debería eliminar y refetch la lista', async () => {
      apiDrivers.delete.mockResolvedValue()
      apiDrivers.getPaginated.mockResolvedValue({ data: [], total: 0 })
      const { remove, items, total } = useDrivers()

      await remove('d-1')

      expect(apiDrivers.delete).toHaveBeenCalledWith('d-1')
      expect(apiDrivers.getPaginated).toHaveBeenCalled()
      expect(items.value).toEqual([])
      expect(total.value).toBe(0)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Delete failed')
      apiDrivers.delete.mockRejectedValue(err)
      const { error, remove } = useDrivers()

      await expect(remove('d-1')).rejects.toThrow('Delete failed')
      expect(error.value).toBe(err)
    })
  })

  describe('paginación', () => {
    it('setPage debería cambiar page y llamar fetch', async () => {
      apiDrivers.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { page, setPage } = useDrivers()

      setPage(3)

      expect(page.value).toBe(3)
      expect(apiDrivers.getPaginated).toHaveBeenCalled()
    })

    it('setSort debería cambiar sort y llamar fetch', async () => {
      apiDrivers.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { sort, setSort } = useDrivers()

      setSort('license_number', false)

      expect(sort.value).toEqual({ col: 'license_number', asc: false })
      expect(apiDrivers.getPaginated).toHaveBeenCalled()
    })

    it('setFilters debería cambiar filters, resetear page a 1 y llamar fetch', async () => {
      apiDrivers.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { filters, page, setFilters } = useDrivers()

      page.value = 5
      setFilters({ status: 'active' })

      expect(filters.value).toEqual({ status: 'active' })
      expect(page.value).toBe(1)
      expect(apiDrivers.getPaginated).toHaveBeenCalled()
    })

    it('resetFilters debería vaciar filters, resetear page a 1 y llamar fetch', async () => {
      apiDrivers.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { filters, page, setFilters, resetFilters } = useDrivers()

      setFilters({ status: 'active' })
      resetFilters()

      expect(filters.value).toEqual({})
      expect(page.value).toBe(1)
    })
  })

  describe('totalPages', () => {
    it('debería retornar 1 página cuando no hay items', () => {
      const { totalPages } = useDrivers()
      expect(totalPages.value).toBe(1)
    })

    it('debería calcular correctamente (50 items / 25 per page = 2 páginas)', async () => {
      apiDrivers.getPaginated.mockResolvedValue({
        data: Array(25).fill({}),
        total: 50,
      })
      const { totalPages, fetch } = useDrivers()

      await fetch()

      expect(totalPages.value).toBe(2)
    })
  })
})
