/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/supabase-client.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { apiVehiclePositions } from './api-vehicle-positions.js'
import { supabase } from '@/services/supabase-client.js'

describe('apiVehiclePositions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPositions', () => {
    it('debería obtener histórico de un vehículo con rango de fechas', async () => {
      const mockData = [{ id: '1', vehicle_id: 'v1', latitude: 40.4168, longitude: -3.7038 }]
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const mockLte = vi.fn().mockReturnValue({ order: mockOrder })
      const mockGte = vi.fn().mockReturnValue({ lte: mockLte })
      const mockEq = vi.fn().mockReturnValue({ gte: mockGte })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiVehiclePositions.getPositions('v1', {
        from: new Date('2026-04-01'),
        to: new Date('2026-04-02'),
      })

      expect(result).toEqual(mockData)
      expect(supabase.from).toHaveBeenCalledWith('vehicle_positions')
    })

    it('debería lanzar error si la consulta falla', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
      const mockLte = vi.fn().mockReturnValue({ order: mockOrder })
      const mockGte = vi.fn().mockReturnValue({ lte: mockLte })
      const mockEq = vi.fn().mockReturnValue({ gte: mockGte })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ select: mockSelect })

      await expect(
        apiVehiclePositions.getPositions('v1', {
          from: new Date('2026-04-01'),
          to: new Date('2026-04-02'),
        }),
      ).rejects.toThrow('DB error')
    })
  })

  describe('getLatestPosition', () => {
    it('debería obtener la última posición de un vehículo', async () => {
      const mockData = { id: '1', vehicle_id: 'v1', latitude: 40.4168 }
      const mockLimit = vi.fn().mockResolvedValue({ data: [mockData], error: null })
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiVehiclePositions.getLatestPosition('v1')
      expect(result).toEqual(mockData)
    })

    it('debería devolver null si no hay posiciones', async () => {
      const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null })
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiVehiclePositions.getLatestPosition('v1')
      expect(result).toBeNull()
    })
  })

  describe('getFleetPositions', () => {
    it('debería obtener última posición de todos los vehículos', async () => {
      const mockData = [
        { id: '1', vehicle_id: 'v1', latitude: 40.4168, vehicles: { id: 'v1', plate: 'ABC' } },
        { id: '2', vehicle_id: 'v2', latitude: 41.3874, vehicles: { id: 'v2', plate: 'DEF' } },
      ]
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiVehiclePositions.getFleetPositions()
      expect(result).toEqual(mockData)
    })
  })

  describe('ingestPosition', () => {
    it('debería insertar una posición individual', async () => {
      const input = {
        vehicle_id: 'v1',
        latitude: 40.4168,
        longitude: -3.7038,
        speed_kph: 85,
        heading_degrees: 45,
        ignition_on: true,
        gps_fix_type: 'GPS_3D',
        provider: 'mock',
        recorded_at: new Date().toISOString(),
      }
      const mockInserted = { id: '1', ...input }
      const mockSingle = vi.fn().mockResolvedValue({ data: mockInserted, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
      supabase.from.mockReturnValue({ insert: mockInsert })

      const result = await apiVehiclePositions.ingestPosition(input)
      expect(result).toEqual(mockInserted)
      expect(supabase.from).toHaveBeenCalledWith('vehicle_positions')
    })
  })

  describe('ingestBatch', () => {
    it('debería insertar un lote de posiciones', async () => {
      const positions = [
        { vehicle_id: 'v1', latitude: 40.4168, longitude: -3.7038, speed_kph: 85 },
        { vehicle_id: 'v2', latitude: 41.3874, longitude: 2.1686, speed_kph: 90 },
      ]
      const mockInserted = positions.map((p, i) => ({ id: String(i + 1), ...p }))
      const mockInsert = vi.fn().mockResolvedValue({ data: mockInserted, error: null })
      supabase.from.mockReturnValue({ insert: mockInsert })

      const result = await apiVehiclePositions.ingestBatch(positions)
      expect(result).toEqual(mockInserted)
    })

    it('debería lanzar error si el batch falla', async () => {
      const positions = [{ vehicle_id: 'v1', latitude: 40 }]
      const mockInsert = vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Batch error' } })
      supabase.from.mockReturnValue({ insert: mockInsert })

      await expect(apiVehiclePositions.ingestBatch(positions)).rejects.toThrow('Batch error')
    })

    it('debería devolver array vacío si no hay posiciones', async () => {
      const result = await apiVehiclePositions.ingestBatch([])
      expect(result).toEqual([])
    })
  })
})
