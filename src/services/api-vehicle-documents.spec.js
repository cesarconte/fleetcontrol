import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/supabase-client.js', () => {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  }
  return {
    supabase: {
      from: vi.fn().mockReturnValue(query),
    },
  }
})

import { apiVehicleDocuments } from './api-vehicle-documents.js'
import { supabase } from '@/services/supabase-client.js'

const mockDoc = {
  id: 'doc-1',
  vehicle_id: 'v-1',
  tipo_documento: 'itv',
  status: 'en_regla',
  fecha_vencimiento: '2027-03-15',
  alerta_dias_anticipacion: 30,
}

describe('apiVehicleDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getByVehicle', () => {
    it('debería retornar documentos del vehículo ordenados por expiry_date', async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [mockDoc],
        error: null,
      })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiVehicleDocuments.getByVehicle('v-1')

      expect(supabase.from).toHaveBeenCalledWith('vehicle_documents')
      expect(mockEq).toHaveBeenCalledWith('vehicle_id', 'v-1')
      expect(result).toEqual([mockDoc])
    })

    it('debería lanzar error si Supabase falla', async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ select: mockSelect })

      await expect(apiVehicleDocuments.getByVehicle('v-1')).rejects.toThrow()
    })
  })

  describe('getByVehicleAndType', () => {
    it('debería retornar documento específico por vehículo y tipo', async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: mockDoc,
        error: null,
      })
      const mockEq2 = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiVehicleDocuments.getByVehicleAndType('v-1', 'itv')

      expect(supabase.from).toHaveBeenCalledWith('vehicle_documents')
      expect(result).toEqual(mockDoc)
    })

    it('debería retornar null si no existe', async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      })
      const mockEq2 = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiVehicleDocuments.getByVehicleAndType('v-1', 'no_existe')

      expect(result).toBeNull()
    })
  })

  describe('getExpiredOrCritical', () => {
    it('debería retornar solo documentos vencidos o críticos', async () => {
      const expiredDoc = { ...mockDoc, status: 'vencido' }
      const mockIn = vi.fn().mockResolvedValue({
        data: [expiredDoc],
        error: null,
      })
      const mockEq = vi.fn().mockReturnValue({ in: mockIn })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiVehicleDocuments.getExpiredOrCritical('v-1')

      expect(supabase.from).toHaveBeenCalledWith('vehicle_documents')
      expect(result).toEqual([expiredDoc])
    })
  })

  describe('heredados del CRUD base', () => {
    it('debería tener getAll', () => {
      expect(apiVehicleDocuments.getAll).toBeDefined()
    })

    it('debería tener getById', () => {
      expect(apiVehicleDocuments.getById).toBeDefined()
    })

    it('debería tener create', () => {
      expect(apiVehicleDocuments.create).toBeDefined()
    })

    it('debería tener update', () => {
      expect(apiVehicleDocuments.update).toBeDefined()
    })

    it('debería tener delete', () => {
      expect(apiVehicleDocuments.delete).toBeDefined()
    })
  })
})
