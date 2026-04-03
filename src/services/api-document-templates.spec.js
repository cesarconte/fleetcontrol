import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/supabase-client.js', () => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
  }
  return {
    supabase: {
      from: vi.fn(() => chain),
      storage: {
        from: vi.fn(() => ({
          remove: vi.fn(),
        })),
      },
    },
  }
})

import { apiDocumentTemplates, apiGeneratedDocuments } from './api-document-templates.js'
import { supabase } from '@/services/supabase-client.js'

describe('api-document-templates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('apiDocumentTemplates', () => {
    it('debería tener getAll heredado del base CRUD', () => {
      expect(typeof apiDocumentTemplates.getAll).toBe('function')
    })

    it('debería tener getById heredado del base CRUD', () => {
      expect(typeof apiDocumentTemplates.getById).toBe('function')
    })

    it('debería tener getActiveTemplates', () => {
      expect(typeof apiDocumentTemplates.getActiveTemplates).toBe('function')
    })

    it('debería tener getByType', () => {
      expect(typeof apiDocumentTemplates.getByType).toBe('function')
    })

    it('debería tener toggleActive', () => {
      expect(typeof apiDocumentTemplates.toggleActive).toBe('function')
    })

    it('getActiveTemplates debería filtrar por is_active=true', async () => {
      const mockData = [{ id: '1', document_type: 'cmr', is_active: true }]
      const chain = supabase.from()
      chain.select.mockReturnValue(chain)
      chain.eq.mockReturnValue(chain)
      chain.order.mockResolvedValue({ data: mockData, error: null })

      const result = await apiDocumentTemplates.getActiveTemplates()
      expect(supabase.from).toHaveBeenCalledWith('document_templates')
      expect(chain.eq).toHaveBeenCalledWith('is_active', true)
      expect(result).toEqual(mockData)
    })

    it('getByType debería buscar por document_type', async () => {
      const mockData = { id: '1', document_type: 'cmr' }
      const chain = supabase.from()
      chain.select.mockReturnValue(chain)
      chain.eq.mockReturnValue(chain)
      chain.maybeSingle.mockResolvedValue({ data: mockData, error: null })

      const result = await apiDocumentTemplates.getByType('cmr')
      expect(chain.eq).toHaveBeenCalledWith('document_type', 'cmr')
      expect(result).toEqual(mockData)
    })

    it('toggleActive debería actualizar is_active', async () => {
      const mockData = { id: '1', is_active: false }
      const chain = supabase.from()
      chain.update.mockReturnValue(chain)
      chain.eq.mockReturnValue(chain)
      chain.select.mockReturnValue(chain)
      chain.single.mockResolvedValue({ data: mockData, error: null })

      const result = await apiDocumentTemplates.toggleActive('1', false)
      expect(chain.update).toHaveBeenCalledWith({ is_active: false })
      expect(chain.eq).toHaveBeenCalledWith('id', '1')
      expect(result).toEqual(mockData)
    })
  })

  describe('apiGeneratedDocuments', () => {
    it('debería tener getByRoute', () => {
      expect(typeof apiGeneratedDocuments.getByRoute).toBe('function')
    })

    it('debería tener delete', () => {
      expect(typeof apiGeneratedDocuments.delete).toBe('function')
    })

    it('getByRoute debería buscar documentos por route_id', async () => {
      const mockData = [{ id: '1', route_id: 'route-1' }]
      const chain = supabase.from()
      chain.select.mockReturnValue(chain)
      chain.eq.mockReturnValue(chain)
      chain.order.mockResolvedValue({ data: mockData, error: null })

      const result = await apiGeneratedDocuments.getByRoute('route-1')
      expect(supabase.from).toHaveBeenCalledWith('generated_documents')
      expect(chain.eq).toHaveBeenCalledWith('route_id', 'route-1')
      expect(result).toEqual(mockData)
    })

    it('delete debería eliminar registro de generated_documents', async () => {
      const chain = supabase.from()
      chain.select.mockReturnValue(chain)
      chain.eq.mockReturnValue(chain)
      chain.single.mockResolvedValue({ data: { file_url: 'url/path.pdf' }, error: null })

      await apiGeneratedDocuments.delete('1')
      expect(chain.eq).toHaveBeenCalledWith('id', '1')
    })
  })
})
