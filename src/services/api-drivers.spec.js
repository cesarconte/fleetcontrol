import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/supabase-client.js', () => {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
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

import { apiDrivers } from './api-drivers.js'
import { supabase } from '@/services/supabase-client.js'

const mockDriver = {
  id: '1',
  full_name: 'Juan García López',
  nif: '12345678A',
  birth_date: '1985-03-15',
  status: 'active',
  email: 'juan@test.com',
  phone: '612345678',
}

describe('apiDrivers', () => {
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
          data: [mockDriver],
          error: null,
          count: 1,
        }),
      })

      const result = await apiDrivers.getPaginated({ page: 1, pageSize: 25 })

      expect(supabase.from).toHaveBeenCalledWith('drivers')
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('page', 1)
      expect(result).toHaveProperty('pageSize', 25)
    })

    it('debería aplicar filtro de estado', async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: [mockDriver],
        error: null,
        count: 1,
      })
      const mockOrder = vi.fn().mockReturnValue({ eq: mockEq })
      const mockRange = vi.fn().mockReturnValue({ order: mockOrder })
      supabase.from().select.mockReturnValue({ range: mockRange })

      await apiDrivers.getPaginated({ filters: { status: 'active' } })

      expect(mockEq).toHaveBeenCalledWith('status', 'active')
    })
  })

  describe('search', () => {
    it('debería buscar por nombre o NIF', async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [mockDriver],
        error: null,
      })
      const mockOr = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ or: mockOr })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiDrivers.search('Juan')

      expect(supabase.from).toHaveBeenCalledWith('drivers')
      expect(result).toEqual([mockDriver])
    })
  })

  describe('heredados del CRUD base', () => {
    it('debería tener getAll', () => {
      expect(apiDrivers.getAll).toBeDefined()
    })

    it('debería tener getById', () => {
      expect(apiDrivers.getById).toBeDefined()
    })

    it('debería tener create', () => {
      expect(apiDrivers.create).toBeDefined()
    })

    it('debería tener update', () => {
      expect(apiDrivers.update).toBeDefined()
    })

    it('debería tener delete', () => {
      expect(apiDrivers.delete).toBeDefined()
    })
  })
})
