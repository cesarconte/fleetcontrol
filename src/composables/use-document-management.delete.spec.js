/**
 * FleetControl — useDocumentManagement Delete Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDocumentManagement } from './use-document-management.js'

vi.mock('@/services/api-documents.js', () => ({
  getVehicleDocumentsPaginated: vi.fn(),
  getDriverDocumentsPaginated: vi.fn(),
  getGeneratedDocumentsPaginated: vi.fn(),
  getDocumentKpis: vi.fn(),
  searchDocuments: vi.fn(),
}))

vi.mock('@/services/api-document-delete.js', () => ({
  deleteVehicleDocument: vi.fn(),
  deleteDriverDocument: vi.fn(),
  deleteGeneratedDocument: vi.fn(),
}))

vi.mock('@/utils/export-documents.js', () => ({
  documentsToCsv: vi.fn(() => 'mock,csv'),
  downloadCsv: vi.fn(),
  generateExportFilename: vi.fn(() => 'fleetcontrol-documentos-20260403'),
}))

vi.mock('@/constants/legal-limits.js', () => ({
  LEGAL_LIMITS: {
    DOCUMENT_MANAGEMENT: { DOCUMENT_PAGE_SIZE_DEFAULT: 25 },
  },
}))

import { getDocumentKpis, getVehicleDocumentsPaginated } from '@/services/api-documents.js'
import {
  deleteVehicleDocument,
  deleteDriverDocument,
  deleteGeneratedDocument,
} from '@/services/api-document-delete.js'

describe('useDocumentManagement — deleteDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getDocumentKpis.mockResolvedValue({
      total: 10,
      valid: 8,
      expiringSoon: 1,
      critical: 1,
      expired: 0,
      complianceRate: 80,
    })
    getVehicleDocumentsPaginated.mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 25 })
  })

  it('debería eliminar un documento de vehículo', async () => {
    deleteVehicleDocument.mockResolvedValue(undefined)
    const { deleteDocument, items } = useDocumentManagement()
    await deleteDocument('vd-1', 'vehicle')
    expect(deleteVehicleDocument).toHaveBeenCalledWith('vd-1')
    expect(items.value).toEqual([])
  })

  it('debería eliminar un documento de conductor', async () => {
    deleteDriverDocument.mockResolvedValue(undefined)
    const { deleteDocument } = useDocumentManagement()
    await deleteDocument('dd-1', 'driver')
    expect(deleteDriverDocument).toHaveBeenCalledWith('dd-1')
  })

  it('debería eliminar un documento generado', async () => {
    deleteGeneratedDocument.mockResolvedValue(undefined)
    const { deleteDocument } = useDocumentManagement()
    await deleteDocument('gd-1', 'transport')
    expect(deleteGeneratedDocument).toHaveBeenCalledWith('gd-1')
  })

  it('debería propagar error si la eliminación falla', async () => {
    deleteVehicleDocument.mockRejectedValue(new Error('No encontrado'))
    const { deleteDocument } = useDocumentManagement()
    await expect(deleteDocument('vd-1', 'vehicle')).rejects.toThrow('No encontrado')
  })
})
