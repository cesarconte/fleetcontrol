/**
 * FleetControl — Base CRUD Service Factory
 *
 * Creates a standard CRUD service for any Supabase table.
 * Services extend this base to add custom queries.
 */

import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

/**
 * @param {string} table - Supabase table name
 * @param {object} [options]
 * @param {string} [options.orderBy] - Default sort column
 * @param {boolean} [options.ascending] - Default sort direction
 */
export function createCrudService(table, { orderBy = 'created_at', ascending = false } = {}) {
  return {
    table,

    async getAll(filters = {}) {
      let query = supabase.from(table).select('*').order(orderBy, { ascending })

      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value)
        }
      }

      const { data, error } = await query
      if (error) throw mapSupabaseError(error)
      return data
    },

    async getById(id) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw mapSupabaseError(error)
      return data
    },

    async create(record) {
      const { data, error } = await supabase
        .from(table)
        .insert(record)
        .select()
        .single()

      if (error) throw mapSupabaseError(error)
      return data
    },

    async update(id, record) {
      const { data, error } = await supabase
        .from(table)
        .update(record)
        .eq('id', id)
        .select()
        .single()

      if (error) throw mapSupabaseError(error)
      return data
    },

    async delete(id) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (error) throw mapSupabaseError(error)
    },

    async getPaginated({
      page = 1,
      pageSize = 25,
      filters = {},
      sort = { col: orderBy, asc: ascending },
    } = {}) {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = supabase
        .from(table)
        .select('*', { count: 'exact' })
        .range(from, to)
        .order(sort.col, { ascending: sort.asc })

      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value)
        }
      }

      const { data, error, count } = await query
      if (error) throw mapSupabaseError(error)
      return { data, total: count, page, pageSize }
    },
  }
}
