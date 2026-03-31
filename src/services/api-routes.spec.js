import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/supabase-client.js', () => {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  }
  return {
    supabase: {
      from: vi.fn().mockReturnValue(query),
    },
  }
})

import { apiRoutes } from './api-routes.js'
import { supabase } from '@/services/supabase-client.js'

const mockRoute = {
  id: '1',
  departure_date: '2026-04-01',
  origin_city: 'Madrid',
  destination_city: 'Barcelona',
  vehicle_id: 'v1',
  driver_id: 'd1',
  status: 'planned',
}

describe('apiRoutes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPaginated', () => {
    it('debería retornar datos paginados', async () => {
      const mockRange = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockReturnThis()
      supabase.from().select.mockReturnValue({
        range: mockRange,
        order: mockOrder,
        eq: vi.fn().mockReturnThis(),
        then: undefined,
      })
      mockRange.mockReturnValue({
        order: mockOrder,
        eq: vi.fn().mockResolvedValue({
          data: [mockRoute],
          error: null,
          count: 1,
        }),
      })

      const result = await apiRoutes.getPaginated({ page: 1, pageSize: 25 })

      expect(supabase.from).toHaveBeenCalledWith('routes')
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('total')
    })
  })

  describe('getActive', () => {
    it('debería obtener rutas activas y planificadas', async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [mockRoute],
        error: null,
      })
      const mockIn = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ in: mockIn })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiRoutes.getActive()

      expect(supabase.from).toHaveBeenCalledWith('routes')
      expect(mockIn).toHaveBeenCalledWith('status', ['planned', 'in_progress'])
      expect(result).toEqual([mockRoute])
    })
  })

  describe('getByDriver', () => {
    it('debería filtrar por conductor', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [mockRoute], error: null })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiRoutes.getByDriver('d1')

      expect(mockEq).toHaveBeenCalledWith('driver_id', 'd1')
      expect(result).toEqual([mockRoute])
    })
  })

  describe('getByVehicle', () => {
    it('debería filtrar por vehículo', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [mockRoute], error: null })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiRoutes.getByVehicle('v1')

      expect(mockEq).toHaveBeenCalledWith('vehicle_id', 'v1')
      expect(result).toEqual([mockRoute])
    })
  })

  describe('heredados del CRUD base', () => {
    it('debería tener getAll', () => {
      expect(apiRoutes.getAll).toBeDefined()
    })

    it('debería tener getById', () => {
      expect(apiRoutes.getById).toBeDefined()
    })

    it('debería tener create', () => {
      expect(apiRoutes.create).toBeDefined()
    })

    it('debería tener update', () => {
      expect(apiRoutes.update).toBeDefined()
    })

    it('debería tener delete', () => {
      expect(apiRoutes.delete).toBeDefined()
    })
  })
})
