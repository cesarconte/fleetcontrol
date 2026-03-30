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
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi
            .fn()
            .mockReturnValue({ data: { publicUrl: 'https://test.url/file.pdf' } }),
          remove: vi.fn().mockResolvedValue({ error: null }),
        }),
      },
    },
  }
})

import { apiDrivers } from './api-drivers.js'
import { supabase } from '@/services/supabase-client.js'

const mockDriver = {
  id: '1',
  nombre_completo: 'Juan García López',
  nif_nie: '12345678A',
  fecha_nacimiento: '1985-03-15',
  status: 'activo',
  email: 'juan@test.com',
  telefono: '612345678',
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

      await apiDrivers.getPaginated({ filters: { status: 'activo' } })

      expect(mockEq).toHaveBeenCalledWith('status', 'activo')
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

  describe('getDocumentos', () => {
    it('debería obtener documentos de un conductor', async () => {
      const mockDocs = [{ id: '1', tipo_documento: 'carnet_conducir' }]
      const mockOrder = vi.fn().mockResolvedValue({ data: mockDocs, error: null })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiDrivers.getDocumentos('driver-1')

      expect(supabase.from).toHaveBeenCalledWith('driver_documents')
      expect(result).toEqual(mockDocs)
    })
  })

  describe('eliminarDocumento', () => {
    it('debería eliminar un documento', async () => {
      const mockDoc = {
        archivo_url: 'https://test.url/documentos-conductores/1/file.pdf',
        driver_id: '1',
      }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockDoc, error: null })
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq2 })

      const mockDeleteEq = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockDeleteEq })

      let callCount = 0
      supabase.from.mockImplementation(() => {
        callCount++
        if (callCount === 1) return { select: mockSelect }
        return { delete: mockDelete }
      })

      await apiDrivers.eliminarDocumento('doc-1')

      expect(supabase.from).toHaveBeenCalledWith('driver_documents')
    })
  })
})
