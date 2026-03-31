/**
 * FleetControl — Fuel Service
 *
 * Extends base CRUD with fuel-specific queries.
 * Includes consumption calculation L/100km.
 */

import { createCrudService } from './create-crud-service.js'
import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

const base = createCrudService('fuel_records', { orderBy: 'refuel_date', ascending: false })

export const apiFuel = {
  ...base,

  async getPaginated({
    page = 1,
    pageSize = 25,
    filters = {},
    sort = { col: 'refuel_date', asc: false },
  } = {}) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('fuel_records')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order(sort.col, { ascending: sort.asc })

    if (filters.vehicle_id) query = query.eq('vehicle_id', filters.vehicle_id)
    if (filters.date_from) query = query.gte('refuel_date', filters.date_from)
    if (filters.date_to) query = query.lte('refuel_date', filters.date_to)
    if (filters.search) query = query.ilike('station_name', `%${filters.search}%`)

    const { data, error, count } = await query
    if (error) throw mapSupabaseError(error)
    return { data, total: count, page, pageSize }
  },

  async getByVehicle(vehicleId, { dateFrom, dateTo } = {}) {
    let query = supabase
      .from('fuel_records')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('refuel_date', { ascending: true })

    if (dateFrom) query = query.gte('refuel_date', dateFrom)
    if (dateTo) query = query.lte('refuel_date', dateTo)

    const { data, error } = await query
    if (error) throw mapSupabaseError(error)
    return data
  },

  async getConsumptionStats(vehicleId, { dateFrom, dateTo } = {}) {
    const records = await this.getByVehicle(vehicleId, { dateFrom, dateTo })
    return calculateConsumption(records)
  },
}

/**
 * Calculate real consumption L/100km from refueling records.
 * Uses the "full tank" method: consumption between consecutive full fill-ups.
 * @param {Array} records - Sorted by fecha ascending
 * @returns {{ avgConsumption: number, entries: Array, totalLitros: number, totalKm: number }}
 */
export function calculateConsumption(records) {
  if (!records || records.length < 2) {
    return { avgConsumption: null, entries: [], totalLitros: 0, totalKm: 0 }
  }

  const entries = []
  let totalLitros = 0
  let totalKm = 0

  for (let i = 1; i < records.length; i++) {
    const prev = records[i - 1]
    const curr = records[i]

    const kmDiff = curr.odometer_km - prev.odometer_km
    if (kmDiff <= 0) continue

    const litros = curr.quantity
    const consumption = (litros / kmDiff) * 100

    entries.push({
      refuel_date: curr.refuel_date,
      from_km: prev.odometer_km,
      to_km: curr.odometer_km,
      km: kmDiff,
      litros,
      consumption: Math.round(consumption * 100) / 100,
    })

    totalLitros += litros
    totalKm += kmDiff
  }

  const avgConsumption = totalKm > 0 ? Math.round((totalLitros / totalKm) * 100 * 100) / 100 : null

  return { avgConsumption, entries, totalLitros, totalKm }
}
