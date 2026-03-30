import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/supabase-client.js', () => {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
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

import { apiMaintenance } from './api-maintenance.js'
import { supabase } from '@/services/supabase-client.js'

const mockRecord = {
  id: '1',
  vehicle_id: 'v1',
  tipo: 'preventivo',
  status: 'pendiente',
  descripcion: 'Cambio de aceite',
  fecha_programada: '2026-04-15',
}

describe('apiMaintenance', () => {
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
          data: [mockRecord],
          error: null,
          count: 1,
        }),
      })

      const result = await apiMaintenance.getPaginated({ page: 1, pageSize: 25 })

      expect(supabase.from).toHaveBeenCalledWith('maintenance_records')
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('total')
    })
  })

  describe('getByVehicle', () => {
    it('debería filtrar por vehículo', async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [mockRecord],
        error: null,
      })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiMaintenance.getByVehicle('v1')

      expect(mockEq).toHaveBeenCalledWith('vehicle_id', 'v1')
      expect(result).toEqual([mockRecord])
    })
  })

  describe('heredados del CRUD base', () => {
    it('debería tener getAll', () => {
      expect(apiMaintenance.getAll).toBeDefined()
    })

    it('debería tener getById', () => {
      expect(apiMaintenance.getById).toBeDefined()
    })

    it('debería tener create', () => {
      expect(apiMaintenance.create).toBeDefined()
    })

    it('debería tener update', () => {
      expect(apiMaintenance.update).toBeDefined()
    })

    it('debería tener delete', () => {
      expect(apiMaintenance.delete).toBeDefined()
    })
  })
})
