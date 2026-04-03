/**
 * FleetControl — useDocumentManagement Composable Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDocumentManagement } from './use-document-management.js'

// Mock services
vi.mock('@/services/api-documents.js', () => ({
  getVehicleDocumentsPaginated: vi.fn(),
  getDriverDocumentsPaginated: vi.fn(),
  getGeneratedDocumentsPaginated: vi.fn(),
  getDocumentKpis: vi.fn(),
  searchDocuments: vi.fn(),
}))

vi.mock('@/utils/export-documents.js', () => ({
  documentsToCsv: vi.fn(() => 'mock,csv'),
  downloadCsv: vi.fn(),
  generateExportFilename: vi.fn(() => 'fleetcontrol-documentos-20260403'),
}))

vi.mock('@/constants/legal-limits.js', () => ({
  LEGAL_LIMITS: {
    DOCUMENT_MANAGEMENT: {
      DOCUMENT_PAGE_SIZE_DEFAULT: 25,
    },
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
    const { activeTab, kpis, filters, searchQuery, pagination, items, isLoading, error } =
      useDocumentManagement()

    expect(activeTab.value).toBe('vehicles')
    expect(kpis.value.total).toBe(0)
    expect(filters.docType).toBeNull()
    expect(searchQuery.value).toBe('')
    expect(pagination.page).toBe(1)
    expect(pagination.pageSize).toBe(25)
    expect(items.value).toEqual([])
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  describe('fetchKpis', () => {
    it('debería cargar KPIs correctamente', async () => {
      getDocumentKpis.mockResolvedValue({
        total: 50,
        valid: 35,
        expiringSoon: 8,
        critical: 3,
        expired: 4,
        complianceRate: 70,
      })

      const { kpis, fetchKpis } = useDocumentManagement()
      await fetchKpis()

      expect(kpis.value.total).toBe(50)
      expect(kpis.value.complianceRate).toBe(70)
    })

    it('debería manejar error al cargar KPIs', async () => {
      getDocumentKpis.mockRejectedValue(new Error('Network error'))

      const { error, fetchKpis } = useDocumentManagement()
      await fetchKpis()

      expect(error.value).toBeTruthy()
    })
  })

  describe('fetchDocuments', () => {
    it('debería cargar documentos de vehículos', async () => {
      getVehicleDocumentsPaginated.mockResolvedValue({
        data: [{ id: '1', doc_type: 'itv' }],
        total: 1,
        page: 1,
        pageSize: 25,
      })

      const { items, pagination, fetchDocuments } = useDocumentManagement()
      await fetchDocuments()

      expect(getVehicleDocumentsPaginated).toHaveBeenCalled()
      expect(items.value).toHaveLength(1)
      expect(pagination.total).toBe(1)
    })

    it('debería cargar documentos de conductores', async () => {
      getDriverDocumentsPaginated.mockResolvedValue({
        data: [{ id: '2', doc_type: 'cap' }],
        total: 1,
        page: 1,
        pageSize: 25,
      })

      const { activeTab, items, fetchDocuments } = useDocumentManagement()
      activeTab.value = 'drivers'
      await fetchDocuments()

      expect(getDriverDocumentsPaginated).toHaveBeenCalled()
      expect(items.value).toHaveLength(1)
    })

    it('debería cargar documentos de transporte', async () => {
      getGeneratedDocumentsPaginated.mockResolvedValue({
        data: [{ id: '3', document_type: 'cmr' }],
        total: 1,
        page: 1,
        pageSize: 25,
      })

      const { activeTab, items, fetchDocuments } = useDocumentManagement()
      activeTab.value = 'transport'
      await fetchDocuments()

      expect(getGeneratedDocumentsPaginated).toHaveBeenCalled()
      expect(items.value).toHaveLength(1)
    })

    it('debería aplicar filtros al cargar', async () => {
      getVehicleDocumentsPaginated.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        pageSize: 25,
      })

      const { applyFilters, fetchDocuments } = useDocumentManagement()
      applyFilters({ status: 'expiring_soon' })
      await fetchDocuments()

      expect(getVehicleDocumentsPaginated).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({ status: 'expiring_soon' }),
        }),
      )
    })

    it('debería manejar error al cargar documentos', async () => {
      getVehicleDocumentsPaginated.mockRejectedValue(new Error('API error'))

      const { error, items, fetchDocuments } = useDocumentManagement()
      await fetchDocuments()

      expect(error.value).toBeTruthy()
      expect(items.value).toEqual([])
    })
  })

  describe('setSearchQuery', () => {
    it('debería retornar array vacío si query es muy corta', async () => {
      const { searchResults, setSearchQuery } = useDocumentManagement()
      await setSearchQuery('a')

      expect(searchResults.value).toEqual([])
    })

    it('debería buscar después del debounce', async () => {
      searchDocuments.mockResolvedValue([{ id: '1', type: 'vehicle' }])

      const { searchResults, setSearchQuery } = useDocumentManagement()
      setSearchQuery('test')

      // Before debounce
      expect(searchResults.value).toEqual([])

      // After debounce
      await vi.advanceTimersByTimeAsync(300)

      expect(searchDocuments).toHaveBeenCalledWith('test')
      expect(searchResults.value).toHaveLength(1)
    })
  })

  describe('applyFilters', () => {
    it('debería aplicar filtros y resetear página', async () => {
      getVehicleDocumentsPaginated.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        pageSize: 25,
      })

      const { filters, pagination, applyFilters } = useDocumentManagement()
      pagination.page = 3
      applyFilters({ status: 'critical' })

      expect(pagination.page).toBe(1)
      expect(filters.status).toBe('critical')
    })
  })

  describe('setActiveTab', () => {
    it('debería cambiar pestaña y resetear página', async () => {
      getDriverDocumentsPaginated.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        pageSize: 25,
      })

      const { activeTab, pagination, setActiveTab } = useDocumentManagement()
      pagination.page = 5
      setActiveTab('drivers')

      expect(activeTab.value).toBe('drivers')
      expect(pagination.page).toBe(1)
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

      // Advance past debounce — should not call searchDocuments
      vi.advanceTimersByTime(300)
      expect(searchDocuments).not.toHaveBeenCalled()
    })
  })
})
