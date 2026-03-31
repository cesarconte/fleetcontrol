import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/supabase-client.js', () => {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
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

import { apiVehicles } from './api-vehicles.js'
import { supabase } from '@/services/supabase-client.js'

const mockVehicle = {
  id: '1',
  plate: '1234ABC',
  brand: 'Mercedes',
  model: 'Actros',
  vehicle_type: 'tractor',
  status: 'active',
  fuel_type: 'diesel',
  dgt_badge: 'no_label',
}

describe('apiVehicles', () => {
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
          data: [mockVehicle],
          error: null,
          count: 1,
        }),
      })

      const result = await apiVehicles.getPaginated({ page: 1, pageSize: 25 })

      expect(supabase.from).toHaveBeenCalledWith('vehicles')
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('page', 1)
      expect(result).toHaveProperty('pageSize', 25)
    })
  })

  describe('search', () => {
    it('debería buscar por matrícula con ilike', async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [mockVehicle],
        error: null,
      })
      const mockIlike = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ ilike: mockIlike })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiVehicles.search('1234')

      expect(supabase.from).toHaveBeenCalledWith('vehicles')
      expect(result).toEqual([mockVehicle])
    })
  })

  describe('getAll', () => {
    it('debería heredar getAll del CRUD base', () => {
      expect(apiVehicles.getAll).toBeDefined()
    })
  })

  describe('getById', () => {
    it('debería heredar getById del CRUD base', () => {
      expect(apiVehicles.getById).toBeDefined()
    })
  })

  describe('create', () => {
    it('debería heredar create del CRUD base', () => {
      expect(apiVehicles.create).toBeDefined()
    })
  })

  describe('update', () => {
    it('debería heredar update del CRUD base', () => {
      expect(apiVehicles.update).toBeDefined()
    })
  })

  describe('delete', () => {
    it('debería heredar delete del CRUD base', () => {
      expect(apiVehicles.delete).toBeDefined()
    })
  })
})
