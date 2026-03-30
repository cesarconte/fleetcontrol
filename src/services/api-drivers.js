/**
 * FleetControl — Drivers Service
 *
 * Extends base CRUD with driver-specific queries.
 */

import { createCrudService } from './create-crud-service.js'
import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

const base = createCrudService('drivers', { orderBy: 'full_name', ascending: true })

export const apiDrivers = {
  ...base,

  async getPaginated({
    page = 1,
    pageSize = 25,
    filters = {},
    sort = { col: 'full_name', asc: true },
  } = {}) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('drivers')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order(sort.col, { ascending: sort.asc })

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,nif.ilike.%${filters.search}%`)
    }

    const { data, error, count } = await query
    if (error) throw mapSupabaseError(error)
    return { data, total: count, page, pageSize }
  },

  async search(term) {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .or(`full_name.ilike.%${term}%,nif.ilike.%${term}%`)
      .order('full_name')

    if (error) throw mapSupabaseError(error)
    return data
  },
}
