/**
 * FleetControl — useDocumentManagement Composable
 *
 * Centralized reactive state for the Documents page.
 * Manages cross-entity document data, filters, pagination, and export.
 *
 * @see docs/plans/feature-documentos-centralizados-plan.md — Fase 2
 * @returns {object} Reactive state and actions
 */

import { ref, reactive, watch } from 'vue'
import {
  getVehicleDocumentsPaginated,
  getDriverDocumentsPaginated,
  getGeneratedDocumentsPaginated,
  getDocumentKpis,
  searchDocuments,
} from '@/services/api-documents.js'
import { documentsToCsv, downloadCsv, generateExportFilename } from '@/utils/export-documents.js'
import { LEGAL_LIMITS } from '@/constants/legal-limits.js'

/**
 * Centralized document management composable.
 */
export function useDocumentManagement() {
  // ── State ──────────────────────────────────────────────────────────
  const activeTab = ref('vehicles') // 'vehicles' | 'drivers' | 'transport'
  const kpis = ref({
    total: 0,
    valid: 0,
    expiringSoon: 0,
    critical: 0,
    expired: 0,
    complianceRate: 0,
  })
  const filters = reactive({
    docType: null,
    status: null,
    entityId: null,
    dateFrom: null,
    dateTo: null,
  })
  const searchQuery = ref('')
  const searchResults = ref([])
  const isSearching = ref(false)
  const pagination = reactive({
    page: 1,
    pageSize: LEGAL_LIMITS.DOCUMENT_MANAGEMENT.DOCUMENT_PAGE_SIZE_DEFAULT,
    total: 0,
    sortBy: 'expiry_date',
    sortAsc: true,
  })
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // ── Debounced search ───────────────────────────────────────────────
  let searchTimeout = null

  /**
   * Set search query with debounce.
   * @param {string} query
   */
  async function setSearchQuery(query) {
    searchQuery.value = query
    if (searchTimeout) clearTimeout(searchTimeout)

    if (!query || query.trim().length < 2) {
      searchResults.value = []
      isSearching.value = false
      return
    }

    isSearching.value = true
    searchTimeout = setTimeout(async () => {
      try {
        searchResults.value = await searchDocuments(query.trim())
      } catch (err) {
        error.value = err
      } finally {
        isSearching.value = false
      }
    }, 300)
  }

  // ── Data fetching ──────────────────────────────────────────────────

  /**
   * Load KPIs cross-entity.
   */
  async function fetchKpis() {
    try {
      kpis.value = await getDocumentKpis()
    } catch (err) {
      error.value = err
    }
  }

  /**
   * Load documents based on active tab, filters, and pagination.
   */
  async function fetchDocuments() {
    isLoading.value = true
    error.value = null
    try {
      // Transport documents use generated_at, not expiry_date
      const defaultSort = activeTab.value === 'transport' ? 'generated_at' : 'expiry_date'
      const sortCol = pagination.sortBy || defaultSort
      const sort = { col: sortCol, asc: pagination.sortAsc }
      const pageParams = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        sort,
      }

      // Build filters object for the API
      const apiFilters = {}
      if (filters.docType) apiFilters.docType = filters.docType
      if (filters.status) apiFilters.status = filters.status
      if (filters.entityId) {
        if (activeTab.value === 'vehicles') apiFilters.vehicleId = filters.entityId
        else if (activeTab.value === 'drivers') apiFilters.driverId = filters.entityId
        else apiFilters.routeId = filters.entityId
      }
      if (filters.dateFrom) apiFilters.dateFrom = filters.dateFrom
      if (filters.dateTo) apiFilters.dateTo = filters.dateTo

      let result
      if (activeTab.value === 'vehicles') {
        result = await getVehicleDocumentsPaginated({ ...pageParams, filters: apiFilters })
      } else if (activeTab.value === 'drivers') {
        result = await getDriverDocumentsPaginated({ ...pageParams, filters: apiFilters })
      } else {
        result = await getGeneratedDocumentsPaginated({ ...pageParams, filters: apiFilters })
      }

      items.value = result.data || []
      pagination.total = result.total || 0
    } catch (err) {
      error.value = err
      items.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Apply new filters and reset to page 1.
   * @param {object} newFilters
   */
  function applyFilters(newFilters) {
    Object.assign(filters, newFilters)
    pagination.page = 1
    fetchDocuments()
  }

  /**
   * Clear all filters.
   */
  function clearFilters() {
    filters.docType = null
    filters.status = null
    filters.entityId = null
    filters.dateFrom = null
    filters.dateTo = null
    pagination.page = 1
    fetchDocuments()
  }

  /**
   * Change active tab and reload.
   * @param {string} tab
   */
  function setActiveTab(tab) {
    activeTab.value = tab
    pagination.page = 1
    // Reset sort column if switching to transport (uses generated_at, not expiry_date)
    if (tab === 'transport' && pagination.sortBy === 'expiry_date') {
      pagination.sortBy = 'generated_at'
    } else if (tab !== 'transport' && pagination.sortBy === 'generated_at') {
      pagination.sortBy = 'expiry_date'
    }
    fetchDocuments()
  }

  /**
   * Update pagination and reload.
   * @param {number} page
   * @param {number} pageSize
   */
  function setPagination(page, pageSize) {
    pagination.page = page
    if (pageSize) pagination.pageSize = pageSize
    fetchDocuments()
  }

  /**
   * Handle sort change.
   * @param {string} sortBy
   * @param {boolean} sortAsc
   */
  function setSort(sortBy, sortAsc) {
    pagination.sortBy = sortBy
    pagination.sortAsc = sortAsc
    fetchDocuments()
  }

  /**
   * Filter by status (from KPI click).
   * @param {string} status
   */
  function filterByStatus(status) {
    applyFilters({ status })
  }

  /**
   * Export current view to CSV.
   */
  function exportToCsv() {
    if (!items.value.length) return

    const typeMap = {
      vehicles: 'vehicle',
      drivers: 'driver',
      transport: 'transport',
    }
    const csvType = typeMap[activeTab.value] || 'vehicle'
    const csvContent = documentsToCsv(items.value, csvType)
    const filename = generateExportFilename()
    downloadCsv(csvContent, filename)
  }

  // ── Watchers ───────────────────────────────────────────────────────

  // Reload data when tab changes
  watch(activeTab, newTab => {
    // Reset sort column based on tab (transport uses generated_at, others use expiry_date)
    if (newTab === 'transport' && pagination.sortBy === 'expiry_date') {
      pagination.sortBy = 'generated_at'
    } else if (newTab !== 'transport' && pagination.sortBy === 'generated_at') {
      pagination.sortBy = 'expiry_date'
    }
    fetchDocuments()
    fetchKpis()
  })

  // ── Cleanup ────────────────────────────────────────────────────────

  /**
   * Clean up search timeout.
   */
  function cleanup() {
    if (searchTimeout) clearTimeout(searchTimeout)
  }

  return {
    // State
    activeTab,
    kpis,
    filters,
    searchQuery,
    searchResults,
    isSearching,
    pagination,
    items,
    isLoading,
    error,

    // Actions
    fetchKpis,
    fetchDocuments,
    applyFilters,
    clearFilters,
    setActiveTab,
    setPagination,
    setSort,
    setSearchQuery,
    filterByStatus,
    exportToCsv,
    cleanup,
  }
}
