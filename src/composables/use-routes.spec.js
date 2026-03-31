import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/api-routes.js', () => ({
  apiRoutes: {
    getPaginated: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getActive: vi.fn(),
  },
}))

vi.mock('@/stores/notifications.js', () => ({
  useNotificationStore: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

import { useRoutes } from './use-routes.js'
import { apiRoutes } from '@/services/api-routes.js'

const mockPaginatedResult = {
  data: [
    { id: 'r-1', origin: 'Madrid', destination: 'Barcelona', status: 'planned' },
    { id: 'r-2', origin: 'Valencia', destination: 'Sevilla', status: 'in_transit' },
  ],
  total: 2,
}

const mockRoute = { id: 'r-1', origin: 'Madrid', destination: 'Barcelona', status: 'planned' }

describe('useRoutes', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('estado inicial', () => {
    it('debería tener items vacío', () => {
      const { items } = useRoutes()
      expect(items.value).toEqual([])
    })

    it('debería tener total en 0', () => {
      const { total } = useRoutes()
      expect(total.value).toBe(0)
    })

    it('debería tener isLoading en false', () => {
      const { isLoading } = useRoutes()
      expect(isLoading.value).toBe(false)
    })

    it('debería tener error en null', () => {
      const { error } = useRoutes()
      expect(error.value).toBeNull()
    })

    it('debería tener page en 1', () => {
      const { page } = useRoutes()
      expect(page.value).toBe(1)
    })

    it('debería tener currentRoute en null', () => {
      const { currentRoute } = useRoutes()
      expect(currentRoute.value).toBeNull()
    })
  })

  describe('fetch', () => {
    it('debería cargar items y total en éxito', async () => {
      apiRoutes.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { items, total, fetch } = useRoutes()

      await fetch()

      expect(items.value).toEqual(mockPaginatedResult.data)
      expect(total.value).toBe(2)
    })

    it('debería establecer isLoading durante la carga', async () => {
      let resolvePromise
      apiRoutes.getPaginated.mockReturnValue(
        new Promise(resolve => {
          resolvePromise = resolve
        }),
      )
      const { isLoading, fetch } = useRoutes()

      const promise = fetch()
      expect(isLoading.value).toBe(true)

      resolvePromise(mockPaginatedResult)
      await promise
      expect(isLoading.value).toBe(false)
    })

    it('debería establecer error en fallo', async () => {
      const err = new Error('Network error')
      apiRoutes.getPaginated.mockRejectedValue(err)
      const { error, fetch } = useRoutes()

      await fetch()

      expect(error.value).toBe(err)
    })

    it('debería pasar parámetros de paginación correctos', async () => {
      apiRoutes.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { fetch } = useRoutes()

      await fetch()

      expect(apiRoutes.getPaginated).toHaveBeenCalledWith({
        page: 1,
        pageSize: 25,
        filters: {},
        sort: { col: 'planned_departure', asc: false },
      })
    })
  })

  describe('getById', () => {
    it('debería establecer currentRoute en éxito', async () => {
      apiRoutes.getById.mockResolvedValue(mockRoute)
      const { currentRoute, getById } = useRoutes()

      const result = await getById('r-1')

      expect(apiRoutes.getById).toHaveBeenCalledWith('r-1')
      expect(currentRoute.value).toEqual(mockRoute)
      expect(result).toEqual(mockRoute)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Not found')
      apiRoutes.getById.mockRejectedValue(err)
      const { error, getById } = useRoutes()

      await expect(getById('r-999')).rejects.toThrow('Not found')
      expect(error.value).toBe(err)
    })
  })

  describe('create', () => {
    it('debería retornar la ruta creada', async () => {
      apiRoutes.create.mockResolvedValue(mockRoute)
      const { create } = useRoutes()

      const result = await create({ origin: 'Madrid', destination: 'Barcelona' })

      expect(apiRoutes.create).toHaveBeenCalledWith({
        origin: 'Madrid',
        destination: 'Barcelona',
      })
      expect(result).toEqual(mockRoute)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Validation error')
      apiRoutes.create.mockRejectedValue(err)
      const { error, create } = useRoutes()

      await expect(create({ origin: 'Madrid' })).rejects.toThrow('Validation error')
      expect(error.value).toBe(err)
    })
  })

  describe('update', () => {
    it('debería retornar la ruta actualizada', async () => {
      const updated = { ...mockRoute, status: 'completed' }
      apiRoutes.update.mockResolvedValue(updated)
      const { update } = useRoutes()

      const result = await update('r-1', { status: 'completed' })

      expect(apiRoutes.update).toHaveBeenCalledWith('r-1', { status: 'completed' })
      expect(result).toEqual(updated)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Update failed')
      apiRoutes.update.mockRejectedValue(err)
      const { error, update } = useRoutes()

      await expect(update('r-1', {})).rejects.toThrow('Update failed')
      expect(error.value).toBe(err)
    })
  })

  describe('remove', () => {
    it('debería eliminar y refetch la lista', async () => {
      apiRoutes.delete.mockResolvedValue()
      apiRoutes.getPaginated.mockResolvedValue({ data: [], total: 0 })
      const { remove, items, total } = useRoutes()

      await remove('r-1')

      expect(apiRoutes.delete).toHaveBeenCalledWith('r-1')
      expect(apiRoutes.getPaginated).toHaveBeenCalled()
      expect(items.value).toEqual([])
      expect(total.value).toBe(0)
    })

    it('debería lanzar error en fallo', async () => {
      const err = new Error('Delete failed')
      apiRoutes.delete.mockRejectedValue(err)
      const { error, remove } = useRoutes()

      await expect(remove('r-1')).rejects.toThrow('Delete failed')
      expect(error.value).toBe(err)
    })
  })

  describe('getActive', () => {
    it('debería retornar rutas activas', async () => {
      const activeRoutes = [{ id: 'r-1', status: 'in_transit' }]
      apiRoutes.getActive.mockResolvedValue(activeRoutes)
      const { getActive } = useRoutes()

      const result = await getActive()

      expect(apiRoutes.getActive).toHaveBeenCalled()
      expect(result).toEqual(activeRoutes)
    })

    it('debería establecer error y lanzar en fallo', async () => {
      const err = new Error('Failed')
      apiRoutes.getActive.mockRejectedValue(err)
      const { error, getActive } = useRoutes()

      await expect(getActive()).rejects.toThrow('Failed')
      expect(error.value).toBe(err)
    })
  })

  describe('paginación', () => {
    it('setPage debería cambiar page y llamar fetch', async () => {
      apiRoutes.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { page, setPage } = useRoutes()

      setPage(3)

      expect(page.value).toBe(3)
      expect(apiRoutes.getPaginated).toHaveBeenCalled()
    })

    it('setSort debería cambiar sort y llamar fetch', async () => {
      apiRoutes.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { sort, setSort } = useRoutes()

      setSort('origin', true)

      expect(sort.value).toEqual({ col: 'origin', asc: true })
      expect(apiRoutes.getPaginated).toHaveBeenCalled()
    })

    it('setFilters debería cambiar filters, resetear page a 1 y llamar fetch', async () => {
      apiRoutes.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { filters, page, setFilters } = useRoutes()

      page.value = 5
      setFilters({ status: 'in_transit' })

      expect(filters.value).toEqual({ status: 'in_transit' })
      expect(page.value).toBe(1)
      expect(apiRoutes.getPaginated).toHaveBeenCalled()
    })

    it('resetFilters debería vaciar filters, resetear page a 1 y llamar fetch', async () => {
      apiRoutes.getPaginated.mockResolvedValue(mockPaginatedResult)
      const { filters, page, setFilters, resetFilters } = useRoutes()

      setFilters({ status: 'in_transit' })
      resetFilters()

      expect(filters.value).toEqual({})
      expect(page.value).toBe(1)
    })
  })

  describe('totalPages', () => {
    it('debería retornar 1 página cuando no hay items', () => {
      const { totalPages } = useRoutes()
      expect(totalPages.value).toBe(1)
    })

    it('debería calcular correctamente (50 items / 25 per page = 2 páginas)', async () => {
      apiRoutes.getPaginated.mockResolvedValue({
        data: Array(25).fill({}),
        total: 50,
      })
      const { totalPages, fetch } = useRoutes()

      await fetch()

      expect(totalPages.value).toBe(2)
    })
  })
})
