/**
 * FleetControl — api-document-delete.js Tests
 *
 * Tests for document deletion API functions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/supabase-client.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

vi.mock('@/services/api-document-templates.js', () => ({
  apiGeneratedDocuments: {
    delete: vi.fn(),
  },
}))

import {
  deleteVehicleDocument,
  deleteDriverDocument,
  deleteGeneratedDocument,
} from './api-document-delete.js'
import { supabase } from '@/services/supabase-client.js'
import { apiGeneratedDocuments } from '@/services/api-document-templates.js'

describe('api-document-delete.js', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('deleteVehicleDocument', () => {
    it('debería eliminar un documento de vehículo', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ delete: mockDelete })

      await deleteVehicleDocument('vd-1')

      expect(supabase.from).toHaveBeenCalledWith('vehicle_documents')
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', 'vd-1')
    })

    it('debería lanzar error mapeado si falla la eliminación', async () => {
      const mockEq = vi.fn().mockResolvedValue({
        error: { code: '42501', message: 'Permission denied' },
      })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ delete: mockDelete })

      await expect(deleteVehicleDocument('vd-1')).rejects.toThrow('Sin permisos para esta acción')
    })
  })

  describe('deleteDriverDocument', () => {
    it('debería eliminar un documento de conductor', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ delete: mockDelete })

      await deleteDriverDocument('dd-1')

      expect(supabase.from).toHaveBeenCalledWith('driver_documents')
      expect(mockEq).toHaveBeenCalledWith('id', 'dd-1')
    })

    it('debería lanzar error mapeado si falla la eliminación', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Failed to fetch' } })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ delete: mockDelete })

      await expect(deleteDriverDocument('dd-1')).rejects.toThrow(
        'Error de conexión. Inténtelo de nuevo.',
      )
    })
  })

  describe('deleteGeneratedDocument', () => {
    it('debería delegar en apiGeneratedDocuments.delete', async () => {
      apiGeneratedDocuments.delete.mockResolvedValue(undefined)

      await deleteGeneratedDocument('gd-1')

      expect(apiGeneratedDocuments.delete).toHaveBeenCalledWith('gd-1')
    })

    it('debería propagar error si apiGeneratedDocuments.delete falla', async () => {
      apiGeneratedDocuments.delete.mockRejectedValue(new Error('No encontrado'))

      await expect(deleteGeneratedDocument('gd-1')).rejects.toThrow('No encontrado')
    })
  })
})
