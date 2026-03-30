/**
 * FleetControl — Vehicles Service
 *
 * Extends base CRUD with vehicle-specific queries.
 * Template for all other CRUD services.
 *
 * Column names match Supabase DB schema (source of truth).
 */

import { createCrudService } from './create-crud-service.js'
import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

const base = createCrudService('vehicles', { orderBy: 'matricula', ascending: true })

export const apiVehicles = {
  ...base,

  async getPaginated({
    page = 1,
    pageSize = 25,
    filters = {},
    sort = { col: 'matricula', asc: true },
  } = {}) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('vehicles')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order(sort.col, { ascending: sort.asc })

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.categoria_ue) query = query.eq('categoria_ue', filters.categoria_ue)
    if (filters.tipo_carroceria) query = query.eq('tipo_carroceria', filters.tipo_carroceria)
    if (filters.distintivo_ambiental)
      query = query.eq('distintivo_ambiental', filters.distintivo_ambiental)
    if (filters.search) query = query.ilike('matricula', `%${filters.search}%`)

    const { data, error, count } = await query
    if (error) throw mapSupabaseError(error)
    return { data, total: count, page, pageSize }
  },

  async search(matricula) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .ilike('matricula', `%${matricula}%`)
      .order('matricula')

    if (error) throw mapSupabaseError(error)
    return data
  },
}
