/**
 * FleetControl — api-documents.js Tests
 *
 * Tests for centralized cross-entity document API service.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/supabase-client.js', () => {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  }
  return {
    supabase: {
      from: vi.fn().mockReturnValue(query),
    },
  }
})

import {
  getVehicleDocumentsPaginated,
  getDriverDocumentsPaginated,
  getGeneratedDocumentsPaginated,
  getDocumentKpis,
  searchDocuments,
} from './api-documents.js'
import { supabase } from '@/services/supabase-client.js'
import { mockChain, mockSearchChain, mockKpiChain } from './api-documents.test-helpers.js'

const mockVehicleDoc = {
  id: 'vd-1',
  doc_type: 'itv',
  status: 'valid',
  expiry_date: '2027-06-15',
  reference_number: 'ITV-2026-001',
  file_name: 'itv.pdf',
  vehicles: { id: 'v-1', plate: '1234-BCD', brand: 'Volvo', model: 'FH' },
}

const mockDriverDoc = {
  id: 'dd-1',
  doc_type: 'cap',
  status: 'expiring_soon',
  expiry_date: '2026-05-01',
  reference_number: 'CAP-2026-001',
  file_name: 'cap.pdf',
  drivers: { id: 'd-1', full_name: 'Juan García', national_id: '12345678A' },
}

const mockGeneratedDoc = {
  id: 'gd-1',
  document_type: 'cmr',
  generated_at: '2026-04-01T10:00:00Z',
  file_url: 'https://example.com/doc.pdf',
  file_name: 'cmr-route-001.pdf',
  generated_by: 'user-1',
  routes: { id: 'r-1', origin_city: 'Madrid', destination_city: 'Barcelona' },
}

describe('api-documents.js', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getVehicleDocumentsPaginated', () => {
    it('debería retornar datos paginados con defaults', async () => {
      mockChain(supabase, { data: [mockVehicleDoc], error: null, count: 1 })
      const result = await getVehicleDocumentsPaginated()
      expect(supabase.from).toHaveBeenCalledWith('vehicle_documents')
      expect(result.data).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('debería calcular rangos correctos para página 2', async () => {
      const { chain } = mockChain(supabase, { data: [], error: null, count: 50 })
      await getVehicleDocumentsPaginated({ page: 2, pageSize: 10 })
      expect(chain.range).toHaveBeenCalledWith(10, 19)
    })

    it('debería incluir datos del vehículo via JOIN', async () => {
      mockChain(supabase, { data: [mockVehicleDoc], error: null, count: 1 })
      const result = await getVehicleDocumentsPaginated()
      expect(result.data[0].vehicles.plate).toBe('1234-BCD')
    })

    it('debería ordenar por expiry_date ascendente por defecto', async () => {
      const { chain } = mockChain(supabase, { data: [], error: null, count: 0 })
      await getVehicleDocumentsPaginated()
      expect(chain.order).toHaveBeenCalledWith('expiry_date', {
        ascending: true,
        nullsFirst: false,
      })
    })

    it('debería respetar orden personalizado', async () => {
      const { chain } = mockChain(supabase, { data: [], error: null, count: 0 })
      await getVehicleDocumentsPaginated({ sort: { col: 'created_at', asc: false } })
      expect(chain.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
        nullsFirst: false,
      })
    })

    it('debería lanzar error mapeado si Supabase falla', async () => {
      mockChain(supabase, { data: null, error: { code: 'PGRST116', message: 'Not found' } })
      await expect(getVehicleDocumentsPaginated()).rejects.toThrow('No encontrado')
    })
  })

  describe('getDriverDocumentsPaginated', () => {
    it('debería retornar datos paginados con defaults', async () => {
      mockChain(supabase, { data: [mockDriverDoc], error: null, count: 1 })
      const result = await getDriverDocumentsPaginated()
      expect(supabase.from).toHaveBeenCalledWith('driver_documents')
      expect(result.data).toHaveLength(1)
    })

    it('debería incluir datos del conductor via JOIN', async () => {
      mockChain(supabase, { data: [mockDriverDoc], error: null, count: 1 })
      const result = await getDriverDocumentsPaginated()
      expect(result.data[0].drivers.full_name).toBe('Juan García')
    })

    it('debería ordenar por expiry_date ascendente por defecto', async () => {
      const { chain } = mockChain(supabase, { data: [], error: null, count: 0 })
      await getDriverDocumentsPaginated()
      expect(chain.order).toHaveBeenCalledWith('expiry_date', {
        ascending: true,
        nullsFirst: false,
      })
    })

    it('debería lanzar error mapeado si Supabase falla', async () => {
      mockChain(supabase, { data: null, error: { code: '42501', message: 'Permission denied' } })
      await expect(getDriverDocumentsPaginated()).rejects.toThrow('Sin permisos para esta acción')
    })
  })

  describe('getGeneratedDocumentsPaginated', () => {
    it('debería retornar datos paginados con defaults', async () => {
      mockChain(supabase, { data: [mockGeneratedDoc], error: null, count: 1 })
      const result = await getGeneratedDocumentsPaginated()
      expect(supabase.from).toHaveBeenCalledWith('generated_documents')
      expect(result.data).toHaveLength(1)
    })

    it('debería incluir datos de ruta via JOIN', async () => {
      mockChain(supabase, { data: [mockGeneratedDoc], error: null, count: 1 })
      const result = await getGeneratedDocumentsPaginated()
      expect(result.data[0].routes.origin_city).toBe('Madrid')
    })

    it('debería ordenar por generated_at descendente por defecto', async () => {
      const { chain } = mockChain(supabase, { data: [], error: null, count: 0 })
      await getGeneratedDocumentsPaginated()
      expect(chain.order).toHaveBeenCalledWith('generated_at', {
        ascending: false,
        nullsFirst: false,
      })
    })

    it('debería lanzar error mapeado si Supabase falla', async () => {
      mockChain(supabase, { data: null, error: { message: 'Failed to fetch' } })
      await expect(getGeneratedDocumentsPaginated()).rejects.toThrow(
        'Error de conexión. Inténtelo de nuevo.',
      )
    })
  })

  describe('getDocumentKpis', () => {
    it('debería retornar KPIs correctos con datos mixtos', async () => {
      const vehicleDocs = [
        { status: 'valid' },
        { status: 'valid' },
        { status: 'expiring_soon' },
        { status: 'critical' },
        { status: 'expired' },
      ]
      const driverDocs = [
        { status: 'valid' },
        { status: 'valid' },
        { status: 'expiring_soon' },
        { status: 'expired' },
      ]
      mockKpiChain(supabase, vehicleDocs, driverDocs)
      const result = await getDocumentKpis()
      expect(result.total).toBe(9)
      expect(result.valid).toBe(4)
      expect(result.expiringSoon).toBe(2)
      expect(result.critical).toBe(1)
      expect(result.expired).toBe(2)
      expect(result.complianceRate).toBe(44)
    })

    it('debería retornar ceros si no hay documentos', async () => {
      mockKpiChain(supabase, [], [])
      const result = await getDocumentKpis()
      expect(result.total).toBe(0)
      expect(result.complianceRate).toBe(0)
    })

    it('debería calcular 100% compliance si todos están valid', async () => {
      mockKpiChain(supabase, [{ status: 'valid' }, { status: 'valid' }, { status: 'valid' }], [])
      const result = await getDocumentKpis()
      expect(result.complianceRate).toBe(100)
    })

    it('debería lanzar error si falla la consulta de vehicle_documents', async () => {
      const mockSelect = vi.fn().mockResolvedValueOnce({
        data: null,
        error: { code: '42501', message: 'Permission denied' },
      })
      supabase.from.mockReturnValue({ select: mockSelect })
      await expect(getDocumentKpis()).rejects.toThrow('Sin permisos para esta acción')
    })
  })

  describe('searchDocuments', () => {
    it('debería retornar array vacío si query está vacía', async () => {
      expect(await searchDocuments('')).toEqual([])
    })

    it('debería retornar array vacío si query tiene menos de 2 caracteres', async () => {
      expect(await searchDocuments('a')).toEqual([])
    })

    it('debería combinar resultados de vehículos y conductores', async () => {
      const vehicleDocs = [
        {
          id: 'v1',
          doc_type: 'itv',
          status: 'valid',
          expiry_date: '2027-01-01',
          reference_number: 'REF-001',
          file_name: 'itv.pdf',
          vehicles: { id: 'veh-1', plate: '1234-BCD', brand: 'Volvo', model: 'FH' },
        },
      ]
      const driverDocs = [
        {
          id: 'd1',
          doc_type: 'cap',
          status: 'expiring_soon',
          expiry_date: '2026-05-01',
          reference_number: 'REF-002',
          file_name: 'cap.pdf',
          drivers: { id: 'drv-1', full_name: 'Juan García', national_id: '12345678A' },
        },
      ]
      mockSearchChain(
        supabase,
        { data: vehicleDocs, error: null },
        { data: driverDocs, error: null },
      )
      const result = await searchDocuments('test')
      expect(result).toHaveLength(2)
      expect(result[0].type).toBe('vehicle')
      expect(result[0].entityLabel).toBe('1234-BCD — Volvo FH')
      expect(result[1].type).toBe('driver')
      expect(result[1].entityLabel).toBe('Juan García (12345678A)')
    })

    it('debería respetar el límite de resultados', async () => {
      const manyDocs = Array.from({ length: 10 }, (_, i) => ({
        id: `v${i}`,
        doc_type: 'itv',
        status: 'valid',
        expiry_date: '2027-01-01',
        reference_number: `REF-${i}`,
        file_name: `doc${i}.pdf`,
        vehicles: { id: `veh-${i}`, plate: `PLATE${i}`, brand: 'Volvo', model: 'FH' },
      }))
      mockSearchChain(supabase, { data: manyDocs, error: null }, { data: [], error: null })
      const result = await searchDocuments('test', { limit: 5 })
      expect(result.length).toBeLessThanOrEqual(5)
    })

    it('debería lanzar error mapeado si falla la búsqueda', async () => {
      const mockOr = vi.fn()
      const mockLimit = vi
        .fn()
        .mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'Not found' } })
      mockOr.mockReturnValue({ limit: mockLimit })
      supabase.from.mockReturnValue({ select: vi.fn().mockReturnValue({ or: mockOr }) })
      await expect(searchDocuments('test')).rejects.toThrow('No encontrado')
    })
  })
})
