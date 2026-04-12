/**
 * FleetControl — useDocumentManagement Composable Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDocumentManagement } from './use-document-management.js'

// Mock services
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

import {
  getVehicleDocumentsPaginated,
  getDriverDocumentsPaginated,
  getGeneratedDocumentsPaginated,
  getDocumentKpis,
  searchDocuments,
} from '@/services/api-documents.js'
import { downloadCsv } from '@/utils/export-documents.js'

describe('useDocumentManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debería inicializar con valores por defecto', () => {
    const { activeTab, kpis, filters, pagination, items, isLoading, error } =
      useDocumentManagement()

    expect(activeTab.value).toBe('vehicles')
    expect(kpis.value.total).toBe(0)
    expect(filters.docType).toBeNull()
    expect(pagination.page).toBe(1)
    expect(pagination.pageSize).toBe(25)
    expect(items.value).toEqual([])
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  describe('fetchKpis', () => {
    it('debería cargar KPIs correctamente', async () => {
      getDocumentKpis.mockResolvedValue({
        total: 10,
        valid: 8,
        expiringSoon: 1,
        critical: 1,
        expired: 0,
        complianceRate: 80,
      })
      const { kpis, fetchKpis } = useDocumentManagement()
      await fetchKpis()
      expect(kpis.value.total).toBe(10)
      expect(kpis.value.complianceRate).toBe(80)
    })

    it('debería capturar error si falla la carga', async () => {
      getDocumentKpis.mockRejectedValue(new Error('Network error'))
      const { error, fetchKpis } = useDocumentManagement()
      await fetchKpis()
      expect(error.value.message).toBe('Network error')
    })
  })

  describe('fetchDocuments', () => {
    it('debería cargar documentos de vehículos por defecto', async () => {
      getVehicleDocumentsPaginated.mockResolvedValue({
        data: [{ id: '1' }],
        total: 1,
        page: 1,
        pageSize: 25,
      })
      const { items, pagination, fetchDocuments } = useDocumentManagement()
      await fetchDocuments()
      expect(items.value).toHaveLength(1)
      expect(pagination.total).toBe(1)
    })

    it('debería cargar documentos de conductores cuando activeTab es drivers', async () => {
      getDriverDocumentsPaginated.mockResolvedValue({
        data: [{ id: '2' }],
        total: 5,
        page: 1,
        pageSize: 25,
      })
      const { items, activeTab, fetchDocuments } = useDocumentManagement()
      activeTab.value = 'drivers'
      await fetchDocuments()
      expect(getDriverDocumentsPaginated).toHaveBeenCalled()
      expect(items.value).toHaveLength(1)
    })

    it('debería cargar documentos generados cuando activeTab es transport', async () => {
      getGeneratedDocumentsPaginated.mockResolvedValue({
        data: [{ id: '3' }],
        total: 3,
        page: 1,
        pageSize: 25,
      })
      const { items, activeTab, fetchDocuments } = useDocumentManagement()
      activeTab.value = 'transport'
      await fetchDocuments()
      expect(getGeneratedDocumentsPaginated).toHaveBeenCalled()
      expect(items.value).toHaveLength(1)
    })

    it('debería capturar error si falla la carga', async () => {
      getVehicleDocumentsPaginated.mockRejectedValue(new Error('Failed'))
      const { error, items, fetchDocuments } = useDocumentManagement()
      await fetchDocuments()
      expect(error.value.message).toBe('Failed')
      expect(items.value).toEqual([])
    })
  })

  describe('filterByStatus', () => {
    it('debería aplicar filtro de estado y resetear página', async () => {
      getVehicleDocumentsPaginated.mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 25 })
      const { filterByStatus, filters, pagination, fetchDocuments } = useDocumentManagement()
      pagination.page = 3
      filterByStatus('expired')
      expect(filters.status).toBe('expired')
      expect(pagination.page).toBe(1)
    })
  })

  describe('clearFilters', () => {
    it('debería limpiar todos los filtros y resetear página', async () => {
      getVehicleDocumentsPaginated.mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 25 })
      const { filters, pagination, clearFilters } = useDocumentManagement()
      filters.status = 'expired'
      filters.docType = 'itv'
      pagination.page = 5
      clearFilters()
      expect(filters.status).toBeNull()
      expect(filters.docType).toBeNull()
      expect(pagination.page).toBe(1)
    })
  })

  describe('setActiveTab', () => {
    it('debería cambiar pestaña y resetear página', () => {
      const { activeTab, pagination, setActiveTab } = useDocumentManagement()
      pagination.page = 3
      setActiveTab('drivers')
      expect(activeTab.value).toBe('drivers')
      expect(pagination.page).toBe(1)
    })

    it('debería cambiar sort a generated_at para transport', () => {
      const { activeTab, pagination, setActiveTab } = useDocumentManagement()
      setActiveTab('transport')
      expect(activeTab.value).toBe('transport')
      expect(pagination.sortBy).toBe('generated_at')
    })

    it('debería cambiar sort a expiry_date al volver de transport', () => {
      const { activeTab, pagination, setActiveTab } = useDocumentManagement()
      setActiveTab('transport')
      expect(pagination.sortBy).toBe('generated_at')
      setActiveTab('vehicles')
      expect(pagination.sortBy).toBe('expiry_date')
    })
  })

  describe('setPagination', () => {
    it('debería actualizar página y pageSize', () => {
      const { pagination, setPagination } = useDocumentManagement()
      setPagination(5, 50)
      expect(pagination.page).toBe(5)
      expect(pagination.pageSize).toBe(50)
    })

    it('debería mantener pageSize si no se proporciona', () => {
      const { pagination, setPagination } = useDocumentManagement()
      setPagination(3)
      expect(pagination.page).toBe(3)
      expect(pagination.pageSize).toBe(25) // default
    })
  })

  describe('setSort', () => {
    it('debería actualizar orden y recargar', () => {
      const { pagination, setSort } = useDocumentManagement()
      setSort('created_at', false)
      expect(pagination.sortBy).toBe('created_at')
      expect(pagination.sortAsc).toBe(false)
    })
  })

  describe('searchDocuments (debounced)', () => {
    it('debería buscar documentos después del debounce', async () => {
      searchDocuments.mockResolvedValue([{ id: '1', type: 'vehicle' }])
      const { searchQuery, searchResults, isSearching, setSearchQuery } = useDocumentManagement()
      setSearchQuery('test')
      expect(searchQuery.value).toBe('test')
      expect(isSearching.value).toBe(true)

      vi.advanceTimersByTime(300)
      await vi.waitFor(() => {
        expect(searchResults.value).toHaveLength(1)
        expect(isSearching.value).toBe(false)
      })
    })

    it('no debería buscar si query tiene menos de 2 caracteres', () => {
      const { searchQuery, searchResults, isSearching, setSearchQuery } = useDocumentManagement()
      setSearchQuery('a')
      expect(searchQuery.value).toBe('a')
      expect(searchResults.value).toEqual([])
      expect(isSearching.value).toBe(false)
    })
  })

  describe('exportToCsv', () => {
    it('debería exportar documentos actuales a CSV', async () => {
      getVehicleDocumentsPaginated.mockResolvedValue({
        data: [{ id: '1', doc_type: 'itv', status: 'valid' }],
        total: 1,
        page: 1,
        pageSize: 25,
      })
      const { fetchDocuments, exportToCsv } = useDocumentManagement()
      await fetchDocuments()
      exportToCsv()
      expect(downloadCsv).toHaveBeenCalled()
    })

    it('no debería exportar si no hay items', () => {
      const { exportToCsv } = useDocumentManagement()
      exportToCsv()
      expect(downloadCsv).not.toHaveBeenCalled()
    })
  })

  describe('cleanup', () => {
    it('debería limpiar timeout de búsqueda', () => {
      const { setSearchQuery, cleanup } = useDocumentManagement()
      setSearchQuery('test')
      cleanup()
      vi.advanceTimersByTime(300)
      expect(searchDocuments).not.toHaveBeenCalled()
    })
  })
})
