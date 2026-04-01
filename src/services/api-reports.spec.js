import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/supabase-client.js', () => {
  const buildQuery = () => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
  })
  return { supabase: { from: vi.fn().mockReturnValue(buildQuery()) } }
})

import { apiReports } from './api-reports.js'
import { supabase } from '@/services/supabase-client.js'

describe('apiReports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getReportData', () => {
    it('debería ser una función', () => {
      expect(typeof apiReports.getReportData).toBe('function')
    })

    it('debería retornar flota data para tipo flota', async () => {
      const mockData = [{ id: 'v1', plate: '1234ABC', status: 'active' }]
      const buildQuery = () => ({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        }),
      })
      supabase.from.mockReturnValue(buildQuery())

      const result = await apiReports.getReportData('flota', {})
      expect(supabase.from).toHaveBeenCalledWith('vehicles')
      expect(result).toEqual(mockData)
    })

    it('debería retornar rutas data con filtro de fechas', async () => {
      const mockData = [{ id: 'r1', status: 'completed' }]
      const chain = {}
      chain.select = vi.fn().mockReturnValue(chain)
      chain.eq = vi.fn().mockReturnValue(chain)
      chain.gte = vi.fn().mockReturnValue(chain)
      chain.lte = vi.fn().mockReturnValue(chain)
      chain.order = vi.fn().mockResolvedValue({ data: mockData, error: null })
      supabase.from.mockReturnValue(chain)

      const result = await apiReports.getReportData('rutas', {
        date_from: '2026-01-01',
        date_to: '2026-03-31',
      })
      expect(supabase.from).toHaveBeenCalledWith('routes')
      expect(chain.gte).toHaveBeenCalledWith('departure_date', '2026-01-01')
      expect(chain.lte).toHaveBeenCalledWith('departure_date', '2026-03-31')
      expect(result).toEqual(mockData)
    })

    it('debería retornar combustible data', async () => {
      const buildQuery = () => ({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      })
      supabase.from.mockReturnValue(buildQuery())

      const result = await apiReports.getReportData('combustible', {})
      expect(supabase.from).toHaveBeenCalledWith('fuel_records')
      expect(result).toEqual([])
    })

    it('debería retornar cargas data', async () => {
      const buildQuery = () => ({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      })
      supabase.from.mockReturnValue(buildQuery())

      const result = await apiReports.getReportData('cargas', {})
      expect(supabase.from).toHaveBeenCalledWith('cargo_records')
    })

    it('debería filtrar economico por status completed', async () => {
      const chain = {}
      chain.select = vi.fn().mockReturnValue(chain)
      chain.eq = vi.fn().mockReturnValue(chain)
      chain.gte = vi.fn().mockReturnValue(chain)
      chain.order = vi.fn().mockResolvedValue({ data: [], error: null })
      supabase.from.mockReturnValue(chain)

      await apiReports.getReportData('economico', { date_from: '2026-01-01' })
      expect(chain.eq).toHaveBeenCalledWith('status', 'completed')
    })

    it('debería lanzar error para tipo desconocido', async () => {
      await expect(apiReports.getReportData('unknown', {})).rejects.toThrow(
        'Tipo de reporte no soportado',
      )
    })
  })
})
