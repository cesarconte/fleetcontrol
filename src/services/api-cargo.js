/**
 * FleetControl — Cargo Service
 *
 * Extends base CRUD with cargo-specific queries.
 */

import { createCrudService } from './create-crud-service.js'
import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

const base = createCrudService('cargo_records', { orderBy: 'created_at', ascending: false })

export const apiCargo = {
  ...base,

  async getPaginated({
    page = 1,
    pageSize = 25,
    filters = {},
    sort = { col: 'created_at', asc: false },
  } = {}) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('cargo_records')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order(sort.col, { ascending: sort.asc })

    if (filters.cargo_type) query = query.eq('cargo_type', filters.cargo_type)
    if (filters.route_id) query = query.eq('route_id', filters.route_id)
    if (filters.search) query = query.ilike('description', `%${filters.search}%`)

    const { data, error, count } = await query
    if (error) throw mapSupabaseError(error)
    return { data, total: count, page, pageSize }
  },

  async getByRoute(routeId) {
    const { data, error } = await supabase.from('cargo_records').select('*').eq('route_id', routeId)

    if (error) throw mapSupabaseError(error)
    return data
  },
}
