/**
 * FleetControl — Centralized Documents API Service
 *
 * Cross-entity paginated queries for vehicle_documents, driver_documents,
 * and generated_documents tables. Includes JOINs for entity data.
 *
 * @see AGENTS.md §6 — API Service Pattern
 * @see docs/plans/feature-documentos-centralizados-plan.md — Fase 1
 */

import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

/**
 * Build a filter clause chain on a Supabase query.
 * @param {object} query - Supabase query builder
 * @param {object} filters - Filter key-value pairs
 * @returns {object} Filtered query
 */
function applyFilters(query, filters) {
  let q = query
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        q = q.in(key, value)
      } else if (key === 'dateFrom') {
        q = q.gte('expiry_date', value)
      } else if (key === 'dateTo') {
        q = q.lte('expiry_date', value)
      } else if (key === 'dateFromGenerated') {
        q = q.gte('generated_at', value)
      } else if (key === 'dateToGenerated') {
        q = q.lte('generated_at', value)
      } else {
        q = q.eq(key, value)
      }
    }
  }
  return q
}

/**
 * Get vehicle documents with pagination and vehicle data.
 * @param {object} [options]
 * @param {number} [options.page=1]
 * @param {number} [options.pageSize=25]
 * @param {object} [options.filters={}] - { docType, status, vehicleId, dateFrom, dateTo }
 * @param {object} [options.sort={ col: 'expiry_date', asc: true }]
 * @returns {Promise<{ data: Array, total: number, page: number, pageSize: number }>}
 */
export async function getVehicleDocumentsPaginated({
  page = 1,
  pageSize = 25,
  filters = {},
  sort = { col: 'expiry_date', asc: true },
} = {}) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('vehicle_documents')
    .select(
      `
        *,
        vehicles!inner (
          id,
          plate,
          brand,
          model
        )
      `,
      { count: 'exact' },
    )
    .range(from, to)
    .order(sort.col, { ascending: sort.asc, nullsFirst: false })

  query = applyFilters(query, filters)

  const { data, error, count } = await query
  if (error) throw mapSupabaseError(error)
  return { data, total: count, page, pageSize }
}

/**
 * Get driver documents with pagination and driver data.
 * @param {object} [options]
 * @param {number} [options.page=1]
 * @param {number} [options.pageSize=25]
 * @param {object} [options.filters={}] - { docType, status, driverId, dateFrom, dateTo }
 * @param {object} [options.sort={ col: 'expiry_date', asc: true }]
 * @returns {Promise<{ data: Array, total: number, page: number, pageSize: number }>}
 */
export async function getDriverDocumentsPaginated({
  page = 1,
  pageSize = 25,
  filters = {},
  sort = { col: 'expiry_date', asc: true },
} = {}) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('driver_documents')
    .select(
      `
        *,
        drivers!inner (
          id,
          full_name,
          national_id
        )
      `,
      { count: 'exact' },
    )
    .range(from, to)
    .order(sort.col, { ascending: sort.asc, nullsFirst: false })

  query = applyFilters(query, filters)

  const { data, error, count } = await query
  if (error) throw mapSupabaseError(error)
  return { data, total: count, page, pageSize }
}

/**
 * Get generated transport documents with pagination and route data.
 * @param {object} [options]
 * @param {number} [options.page=1]
 * @param {number} [options.pageSize=25]
 * @param {object} [options.filters={}] - { documentType, routeId, dateFrom, dateTo }
 * @param {object} [options.sort={ col: 'generated_at', asc: false }]
 * @returns {Promise<{ data: Array, total: number, page: number, pageSize: number }>}
 */
export async function getGeneratedDocumentsPaginated({
  page = 1,
  pageSize = 25,
  filters = {},
  sort = { col: 'generated_at', asc: false },
} = {}) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('generated_documents')
    .select(
      `
        *,
        routes!inner (
          id,
          origin_city,
          destination_city
        )
      `,
      { count: 'exact' },
    )
    .range(from, to)
    .order(sort.col, { ascending: sort.asc, nullsFirst: false })

  query = applyFilters(query, filters)

  const { data, error, count } = await query
  if (error) throw mapSupabaseError(error)
  return { data, total: count, page, pageSize }
}

/**
 * Get cross-entity document KPIs.
 * @returns {Promise<{ total: number, valid: number, expiringSoon: number, critical: number, expired: number, complianceRate: number }>}
 */
export async function getDocumentKpis() {
  // Vehicle documents counts by status
  const { data: vehicleStatuses, error: vError } = await supabase
    .from('vehicle_documents')
    .select('status')

  if (vError) throw mapSupabaseError(vError)

  // Driver documents counts by status
  const { data: driverStatuses, error: dError } = await supabase
    .from('driver_documents')
    .select('status')

  if (dError) throw mapSupabaseError(dError)

  const allStatuses = [...(vehicleStatuses || []), ...(driverStatuses || [])]
  const total = allStatuses.length

  const valid = allStatuses.filter(d => d.status === 'valid').length
  const expiringSoon = allStatuses.filter(d => d.status === 'expiring_soon').length
  const critical = allStatuses.filter(d => d.status === 'critical').length
  const expired = allStatuses.filter(d => d.status === 'expired').length
  const complianceRate = total > 0 ? Math.round((valid / total) * 100) : 0

  return { total, valid, expiringSoon, critical, expired, complianceRate }
}

/**
 * Global search across vehicle and driver documents.
 * @param {string} query - Search term
 * @param {object} [options]
 * @param {number} [options.limit=50]
 * @returns {Promise<Array<{ type: string, entityLabel: string, docLabel: string, status: string, expiryDate: string|null, entityId: string }>>}
 */
export async function searchDocuments(query, { limit = 50 } = {}) {
  if (!query || query.trim().length < 2) return []

  const searchTerm = `%${query.trim()}%`

  // Search vehicle documents
  const { data: vehicleDocs, error: vError } = await supabase
    .from('vehicle_documents')
    .select(
      `
        id,
        doc_type,
        status,
        expiry_date,
        reference_number,
        file_name,
        vehicles!inner (
          id,
          plate,
          brand,
          model
        )
      `,
    )
    .or(
      `reference_number.ilike.${searchTerm},file_name.ilike.${searchTerm},doc_type.ilike.${searchTerm},vehicles.plate.ilike.${searchTerm},vehicles.brand.ilike.${searchTerm},vehicles.model.ilike.${searchTerm}`,
    )
    .limit(limit)

  if (vError) throw mapSupabaseError(vError)

  // Search driver documents
  const { data: driverDocs, error: dError } = await supabase
    .from('driver_documents')
    .select(
      `
        id,
        doc_type,
        status,
        expiry_date,
        reference_number,
        file_name,
        drivers!inner (
          id,
          full_name,
          national_id
        )
      `,
    )
    .or(
      `reference_number.ilike.${searchTerm},file_name.ilike.${searchTerm},doc_type.ilike.${searchTerm},drivers.full_name.ilike.${searchTerm},drivers.national_id.ilike.${searchTerm}`,
    )
    .limit(limit)

  if (dError) throw mapSupabaseError(dError)

  const vehicleResults = (vehicleDocs || []).map(d => ({
    type: 'vehicle',
    entityId: d.vehicles.id,
    entityLabel: `${d.vehicles.plate} — ${d.vehicles.brand} ${d.vehicles.model}`,
    docLabel: d.doc_type,
    status: d.status,
    expiryDate: d.expiry_date,
    referenceNumber: d.reference_number,
    fileName: d.file_name,
  }))

  const driverResults = (driverDocs || []).map(d => ({
    type: 'driver',
    entityId: d.drivers.id,
    entityLabel: `${d.drivers.full_name} (${d.drivers.national_id})`,
    docLabel: d.doc_type,
    status: d.status,
    expiryDate: d.expiry_date,
    referenceNumber: d.reference_number,
    fileName: d.file_name,
  }))

  return [...vehicleResults, ...driverResults].slice(0, limit)
}
