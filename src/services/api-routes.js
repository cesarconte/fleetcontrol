/**
 * FleetControl — Routes Service
 *
 * Extends base CRUD with route-specific queries.
 * All column names match Supabase DB schema (source of truth).
 */

import { createCrudService } from './create-crud-service.js'
import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

const base = createCrudService('routes', { orderBy: 'planned_departure', ascending: false })

export const apiRoutes = {
  ...base,

  async getPaginated({
    page = 1,
    pageSize = 25,
    filters = {},
    sort = { col: 'planned_departure', asc: false },
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
    if (filters.date_from) query = query.gte('planned_departure', filters.date_from)
    if (filters.date_to) query = query.lte('planned_departure', filters.date_to)
    if (filters.search) {
      query = query.or(
        `origin_city.ilike.%${filters.search}%,destination_city.ilike.%${filters.search}%`,
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
      .order('planned_departure', { ascending: true })

    if (error) throw mapSupabaseError(error)
    return data
  },

  async getByDriver(driverId, { dateFrom, dateTo } = {}) {
    let query = supabase
      .from('routes')
      .select('*')
      .eq('driver_id', driverId)
      .order('planned_departure', { ascending: false })

    if (dateFrom) query = query.gte('planned_departure', dateFrom)
    if (dateTo) query = query.lte('planned_departure', dateTo)

    const { data, error } = await query
    if (error) throw mapSupabaseError(error)
    return data
  },

  async getByVehicle(vehicleId, { dateFrom, dateTo } = {}) {
    let query = supabase
      .from('routes')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('planned_departure', { ascending: false })

    if (dateFrom) query = query.gte('planned_departure', dateFrom)
    if (dateTo) query = query.lte('planned_departure', dateTo)

    const { data, error } = await query
    if (error) throw mapSupabaseError(error)
    return data
  },
}
