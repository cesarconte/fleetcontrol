import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/supabase-client.js', () => {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  }
  return { supabase: { from: vi.fn().mockReturnValue(query) } }
})

import { apiFuel, calculateConsumption } from './api-fuel.js'
import { supabase } from '@/services/supabase-client.js'

const mockRecord = {
  id: '1',
  vehicle_id: 'v1',
  refuel_date: '2026-03-15',
  odometer_km: 100000,
  quantity: 150,
  unit_price: 1.45,
}

describe('apiFuel', () => {
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
        eq: vi.fn().mockResolvedValue({ data: [mockRecord], error: null, count: 1 }),
      })
      const result = await apiFuel.getPaginated()
      expect(supabase.from).toHaveBeenCalledWith('fuel_records')
      expect(result).toHaveProperty('data')
    })
  })

  describe('heredados del CRUD base', () => {
    it('debería tener getAll', () => expect(apiFuel.getAll).toBeDefined())
    it('debería tener getById', () => expect(apiFuel.getById).toBeDefined())
    it('debería tener create', () => expect(apiFuel.create).toBeDefined())
    it('debería tener update', () => expect(apiFuel.update).toBeDefined())
    it('debería tener delete', () => expect(apiFuel.delete).toBeDefined())
  })
})

describe('calculateConsumption', () => {
  it('debería calcular consumo L/100km correctamente', () => {
    const records = [
      { refuel_date: '2026-03-01', odometer_km: 100000, quantity: 0 },
      { refuel_date: '2026-03-10', odometer_km: 101000, quantity: 120 },
      { refuel_date: '2026-03-20', odometer_km: 102500, quantity: 180 },
    ]
    const result = calculateConsumption(records)
    expect(result.entries).toHaveLength(2)
    expect(result.entries[0].consumption).toBe(12)
    expect(result.entries[1].consumption).toBe(12)
    expect(result.avgConsumption).toBe(12)
    expect(result.totalLitros).toBe(300)
    expect(result.totalKm).toBe(2500)
  })

  it('debería retornar null con menos de 2 registros', () => {
    const result = calculateConsumption([
      { refuel_date: '2026-03-01', odometer_km: 100000, quantity: 150 },
    ])
    expect(result.avgConsumption).toBeNull()
    expect(result.entries).toHaveLength(0)
  })

  it('debería retornar null con array vacío', () => {
    const result = calculateConsumption([])
    expect(result.avgConsumption).toBeNull()
  })

  it('debería retornar null con null', () => {
    const result = calculateConsumption(null)
    expect(result.avgConsumption).toBeNull()
  })

  it('debería saltar registros donde km no aumenta', () => {
    const records = [
      { refuel_date: '2026-03-01', odometer_km: 100000, quantity: 0 },
      { refuel_date: '2026-03-05', odometer_km: 100000, quantity: 50 },
      { refuel_date: '2026-03-10', odometer_km: 101000, quantity: 120 },
    ]
    const result = calculateConsumption(records)
    expect(result.entries).toHaveLength(1)
    expect(result.entries[0].consumption).toBe(12)
  })
})
