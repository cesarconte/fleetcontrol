/**
 * FleetControl — Vehicles Service
 *
 * Extends base CRUD with vehicle-specific queries.
 * Template for all other CRUD services.
 */

import { createCrudService } from './create-crud-service.js'
import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

const base = createCrudService('vehicles', { orderBy: 'plate', ascending: true })

export const apiVehicles = {
  ...base,

  async getPaginated({
    page = 1,
    pageSize = 25,
    filters = {},
    sort = { col: 'plate', asc: true },
  } = {}) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('vehicles')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order(sort.col, { ascending: sort.asc })

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.vehicle_type) query = query.eq('vehicle_type', filters.vehicle_type)
    if (filters.dgt_badge) query = query.eq('dgt_badge', filters.dgt_badge)
    if (filters.search) query = query.ilike('plate', `%${filters.search}%`)

    const { data, error, count } = await query
    if (error) throw mapSupabaseError(error)
    return { data, total: count, page, pageSize }
  },

  async search(plate) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .ilike('plate', `%${plate}%`)
      .order('plate')

    if (error) throw mapSupabaseError(error)
    return data
  },
}
