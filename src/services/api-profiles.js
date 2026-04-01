/**
 * FleetControl — Profiles API Service
 *
 * CRUD for user profiles (management layer over Supabase Auth).
 *
 * @see PRD §4.10.1 — RBAC
 */

import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

export const apiProfiles = {
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true })

    if (error) throw mapSupabaseError(error)
    return data
  },

  async getById(id) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()

    if (error) throw mapSupabaseError(error)
    return data
  },

  async updateProfile(id, fields) {
    const { data, error } = await supabase
      .from('profiles')
      .update(fields)
      .eq('id', id)
      .select()
      .single()

    if (error) throw mapSupabaseError(error)
    return data
  },

  async updateRole(id, role) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single()

    if (error) throw mapSupabaseError(error)
    return data
  },

  async deactivate(id) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single()

    if (error) throw mapSupabaseError(error)
    return data
  },

  async reactivate(id) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active: true })
      .eq('id', id)
      .select()
      .single()

    if (error) throw mapSupabaseError(error)
    return data
  },
}
