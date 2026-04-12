/**
 * FleetControl — Document filter helpers.
 *
 * Pure functions for building API filter objects from UI filter state.
 */

/**
 * Build API filters object from composable filters and active tab.
 * @param {object} filters - UI filter state
 * @param {string} activeTab - 'vehicles' | 'drivers' | 'transport'
 * @returns {object} API-ready filters
 */
export function buildApiFilters(filters, activeTab) {
  const apiFilters = {}
  if (filters.docType) apiFilters.docType = filters.docType
  if (filters.status) apiFilters.status = filters.status
  if (filters.entityId) {
    if (activeTab === 'vehicles') apiFilters.vehicleId = filters.entityId
    else if (activeTab === 'drivers') apiFilters.driverId = filters.entityId
    else apiFilters.routeId = filters.entityId
  }
  if (filters.dateFrom) apiFilters.dateFrom = filters.dateFrom
  if (filters.dateTo) apiFilters.dateTo = filters.dateTo
  return apiFilters
}

/**
 * Get the default sort column for the active tab.
 * @param {string} activeTab
 * @returns {string}
 */
export function getDefaultSortColumn(activeTab) {
  return activeTab === 'transport' ? 'generated_at' : 'expiry_date'
}

/**
 * Reset sort column when switching tabs.
 * @param {string} newTab
 * @param {string} currentSortBy
 * @returns {string}
 */
export function resetSortForTab(newTab, currentSortBy) {
  if (newTab === 'transport' && currentSortBy === 'expiry_date') return 'generated_at'
  if (newTab !== 'transport' && currentSortBy === 'generated_at') return 'expiry_date'
  return currentSortBy
}

/**
 * Get CSV type mapping for active tab.
 * @param {string} activeTab
 * @returns {string}
 */
export function getCsvType(activeTab) {
  const typeMap = { vehicles: 'vehicle', drivers: 'driver', transport: 'transport' }
  return typeMap[activeTab] || 'vehicle'
}
