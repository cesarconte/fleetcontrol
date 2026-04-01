/**
 * FleetControl — Informes API Service
 *
 * Data fetching for each informe type.
 * Reuses existing Supabase queries from other services.
 *
 * @see PRD §4.9 — Informes
 */

import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

const TABLE_MAP = {
  flota: 'vehicles',
  conductores: 'drivers',
  rutas: 'routes',
  combustible: 'fuel_records',
  mantenimiento: 'maintenance_records',
  cumplimiento_vehiculos: 'vehicle_documents',
  cumplimiento_conductores: 'driver_documents',
  tacografos: 'tachograph_records',
  cargas: 'cargo_records',
  economico: 'routes',
}

function getDateColumn(table) {
  const map = {
    vehicles: null,
    drivers: null,
    routes: 'departure_date',
    fuel_records: 'refuel_date',
    maintenance_records: 'scheduled_date',
    vehicle_documents: 'expiry_date',
    driver_documents: 'expiry_date',
    tachograph_records: 'download_date',
    cargo_records: null,
  }
  return map[table] ?? 'created_at'
}

async function getReportData(type, params = {}) {
  const table = TABLE_MAP[type]
  if (!table) throw new Error(`Tipo de reporte no soportado: ${type}`)

  let query = supabase.from(table).select('*')

  const dateCol = getDateColumn(table)
  if (dateCol && params.date_from) query = query.gte(dateCol, params.date_from)
  if (dateCol && params.date_to) query = query.lte(dateCol, params.date_to)

  if (params.vehicle_id) query = query.eq('vehicle_id', params.vehicle_id)
  if (params.driver_id) query = query.eq('driver_id', params.driver_id)

  if (type === 'economico') query = query.eq('status', 'completed')
  if (type === 'rutas') query = query.eq('status', 'completed')

  query = query.order(dateCol || 'created_at', { ascending: false })

  const { data, error } = await query
  if (error) throw mapSupabaseError(error)
  return data
}

async function getComplianceData(params = {}) {
  const [vehicleDocs, driverDocs] = await Promise.all([
    getReportData('cumplimiento_vehiculos', params),
    getReportData('cumplimiento_conductores', params),
  ])
  return { vehicleDocs, driverDocs }
}

export const apiReports = {
  getReportData,
  getComplianceData,
}
