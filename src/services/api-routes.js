/**
 * FleetControl — Routes Service
 *
 * Extends base CRUD with route-specific queries.
 * All column names match Supabase DB schema (source of truth).
 */

import { createCrudService } from './create-crud-service.js'
import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

const base = createCrudService('routes', { orderBy: 'fecha_salida', ascending: false })

export const apiRoutes = {
  ...base,

  async getPaginated({
    page = 1,
    pageSize = 25,
    filters = {},
    sort = { col: 'fecha_salida', asc: false },
  } = {}) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('routes')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order(sort.col, { ascending: sort.asc })

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.driver_id) query = query.eq('driver_id', filters.driver_id)
    if (filters.vehicle_id) query = query.eq('vehicle_id', filters.vehicle_id)
    if (filters.date_from) query = query.gte('fecha_salida', filters.date_from)
    if (filters.date_to) query = query.lte('fecha_salida', filters.date_to)
    if (filters.search) {
      query = query.or(
        `origen_municipio.ilike.%${filters.search}%,destino_municipio.ilike.%${filters.search}%`,
      )
    }

    const { data, error, count } = await query
    if (error) throw mapSupabaseError(error)
    return { data, total: count, page, pageSize }
  },

  async getActive() {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .in('status', ['planificada', 'en_curso'])
      .order('fecha_salida', { ascending: true })

    if (error) throw mapSupabaseError(error)
    return data
  },

  async getByDriver(driverId, { dateFrom, dateTo } = {}) {
    let query = supabase
      .from('routes')
      .select('*')
      .eq('driver_id', driverId)
      .order('fecha_salida', { ascending: false })

    if (dateFrom) query = query.gte('fecha_salida', dateFrom)
    if (dateTo) query = query.lte('fecha_salida', dateTo)

    const { data, error } = await query
    if (error) throw mapSupabaseError(error)
    return data
  },

  async getByVehicle(vehicleId, { dateFrom, dateTo } = {}) {
    let query = supabase
      .from('routes')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('fecha_salida', { ascending: false })

    if (dateFrom) query = query.gte('fecha_salida', dateFrom)
    if (dateTo) query = query.lte('fecha_salida', dateTo)

    const { data, error } = await query
    if (error) throw mapSupabaseError(error)
    return data
  },
}
