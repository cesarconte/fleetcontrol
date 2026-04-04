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
import {
  deleteVehicleDocument,
  deleteDriverDocument,
  deleteGeneratedDocument,
} from '@/services/api-document-delete.js'
import { documentsToCsv, downloadCsv, generateExportFilename } from '@/utils/export-documents.js'
import { LEGAL_LIMITS } from '@/constants/legal-limits.js'
import {
  buildApiFilters,
  getDefaultSortColumn,
  resetSortForTab,
  getCsvType,
} from '@/utils/document-filters.js'

/**
 * Centralized document management composable.
 */
export function useDocumentManagement() {
  // ── State ──────────────────────────────────────────────────────────
  const activeTab = ref('vehicles')
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

  async function fetchKpis() {
    try {
      kpis.value = await getDocumentKpis()
    } catch (err) {
      error.value = err
    }
  }

  async function fetchDocuments() {
    isLoading.value = true
    error.value = null
    try {
      const sortCol = pagination.sortBy || getDefaultSortColumn(activeTab.value)
      const sort = { col: sortCol, asc: pagination.sortAsc }
      const apiFilters = buildApiFilters(filters, activeTab.value)
      const pageParams = { page: pagination.page, pageSize: pagination.pageSize, sort }

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

  function applyFilters(newFilters) {
    Object.assign(filters, newFilters)
    pagination.page = 1
    fetchDocuments()
  }

  function clearFilters() {
    filters.docType = null
    filters.status = null
    filters.entityId = null
    filters.dateFrom = null
    filters.dateTo = null
    pagination.page = 1
    fetchDocuments()
  }

  function setActiveTab(tab) {
    activeTab.value = tab
    pagination.page = 1
    pagination.sortBy = resetSortForTab(tab, pagination.sortBy)
    fetchDocuments()
  }

  function setPagination(page, pageSize) {
    pagination.page = page
    if (pageSize) pagination.pageSize = pageSize
    fetchDocuments()
  }

  function setSort(sortBy, sortAsc) {
    pagination.sortBy = sortBy
    pagination.sortAsc = sortAsc
    fetchDocuments()
  }

  function filterByStatus(status) {
    applyFilters({ status })
  }

  function exportToCsv() {
    if (!items.value.length) return
    const csvContent = documentsToCsv(items.value, getCsvType(activeTab.value))
    downloadCsv(csvContent, generateExportFilename())
  }

  async function deleteDocument(id, type) {
    if (type === 'vehicle') await deleteVehicleDocument(id)
    else if (type === 'driver') await deleteDriverDocument(id)
    else if (type === 'transport') await deleteGeneratedDocument(id)
    await Promise.all([fetchDocuments(), fetchKpis()])
  }

  // ── Watchers ───────────────────────────────────────────────────────
  watch(activeTab, newTab => {
    pagination.sortBy = resetSortForTab(newTab, pagination.sortBy)
    fetchDocuments()
    fetchKpis()
  })

  // ── Cleanup ────────────────────────────────────────────────────────
  function cleanup() {
    if (searchTimeout) clearTimeout(searchTimeout)
  }

  return {
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
    deleteDocument,
    cleanup,
  }
}
