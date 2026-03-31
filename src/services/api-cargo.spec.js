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
  return { supabase: { from: vi.fn().mockReturnValue(query) } }
})

import { apiCargo } from './api-cargo.js'
import { supabase } from '@/services/supabase-client.js'

const mockCargo = {
  id: '1',
  route_id: 'r1',
  description: 'Electrodomésticos',
  weight_kg: 15000,
  cargo_type: 'general',
}

describe('apiCargo', () => {
  beforeEach(() => vi.clearAllMocks())

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
        eq: vi.fn().mockResolvedValue({ data: [mockCargo], error: null, count: 1 }),
      })
      const result = await apiCargo.getPaginated()
      expect(supabase.from).toHaveBeenCalledWith('cargo_records')
      expect(result).toHaveProperty('data')
    })
  })

  describe('getByRoute', () => {
    it('debería filtrar por ruta', async () => {
      const mockEq = vi.fn().mockResolvedValue({ data: [mockCargo], error: null })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiCargo.getByRoute('r1')

      expect(result).toEqual([mockCargo])
    })
  })

  describe('heredados', () => {
    it('debería tener getAll', () => expect(apiCargo.getAll).toBeDefined())
    it('debería tener getById', () => expect(apiCargo.getById).toBeDefined())
    it('debería tener create', () => expect(apiCargo.create).toBeDefined())
    it('debería tener update', () => expect(apiCargo.update).toBeDefined())
    it('debería tener delete', () => expect(apiCargo.delete).toBeDefined())
  })
})
