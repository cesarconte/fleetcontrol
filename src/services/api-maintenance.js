/**
 * FleetControl — Maintenance Service
 *
 * Extends base CRUD with maintenance-specific queries.
 */

import { createCrudService } from './create-crud-service.js'
import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

const base = createCrudService('maintenance_records', {
  orderBy: 'fecha_programada',
  ascending: false,
})

export const apiMaintenance = {
  ...base,

  async getPaginated({
    page = 1,
    pageSize = 25,
    filters = {},
    sort = { col: 'fecha_programada', asc: false },
  } = {}) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('maintenance_records')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order(sort.col, { ascending: sort.asc })

    if (filters.tipo) query = query.eq('tipo', filters.tipo)
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.vehicle_id) query = query.eq('vehicle_id', filters.vehicle_id)
    if (filters.search) {
      query = query.ilike('descripcion', `%${filters.search}%`)
    }

    const { data, error, count } = await query
    if (error) throw mapSupabaseError(error)
    return { data, total: count, page, pageSize }
  },

  async getByVehicle(vehicleId) {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('fecha_programada', { ascending: false })

    if (error) throw mapSupabaseError(error)
    return data
  },

  async getUpcoming({ days = 30 } = {}) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)
    const dateStr = futureDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('status', 'pendiente')
      .lte('fecha_programada', dateStr)
      .order('fecha_programada', { ascending: true })

    if (error) throw mapSupabaseError(error)
    return data
  },
}
