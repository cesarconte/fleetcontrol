/**
 * FleetControl — Company Settings API Service
 *
 * CRUD for the singleton company_settings table.
 *
 * @see PRD §4.10 — Configuración
 */

import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

export const apiCompanySettings = {
  async getSettings() {
    const { data, error } = await supabase.from('company_settings').select('*').maybeSingle()

    if (error) throw mapSupabaseError(error)
    return data
  },

  async updateSettings(id, fields) {
    const { data, error } = await supabase
      .from('company_settings')
      .update(fields)
      .eq('id', id)
      .select()
      .single()

    if (error) throw mapSupabaseError(error)
    return data
  },
}
