/**
 * FleetControl — Alerts API Service
 *
 * CRUD operations for the alerts table.
 * Extends base CRUD with alert-specific queries per PRD §4.8.
 *
 * @see PRD §4.8 — Alertas y Notificaciones
 * @see AGENTS.md §6 — API Service Pattern
 */

import { createCrudService } from './create-crud-service.js'
import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

const base = createCrudService('alerts', { orderBy: 'created_at', ascending: false })

export const apiAlerts = {
  ...base,

  /**
   * Get paginated alerts with alert-specific filters.
   * @param {object} options
   * @param {number} [options.page=1]
   * @param {number} [options.pageSize=25]
   * @param {object} [options.filters] - { alert_type, severity, is_read, is_dismissed, vehicle_id, driver_id }
   * @param {object} [options.sort] - { col, asc }
   * @returns {Promise<{ data: Array, total: number, page: number, pageSize: number }>}
   */
  async getPaginated({
    page = 1,
    pageSize = 25,
    filters = {},
    sort = { col: 'created_at', asc: false },
  } = {}) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('alerts')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order(sort.col, { ascending: sort.asc })

    if (filters.alert_type) query = query.eq('alert_type', filters.alert_type)
    if (filters.severity) query = query.eq('severity', filters.severity)
    if (filters.is_read !== undefined) query = query.eq('is_read', filters.is_read)
    if (filters.is_dismissed !== undefined) query = query.eq('is_dismissed', filters.is_dismissed)
    if (filters.vehicle_id) query = query.eq('vehicle_id', filters.vehicle_id)
    if (filters.driver_id) query = query.eq('driver_id', filters.driver_id)

    const { data, error, count } = await query
    if (error) throw mapSupabaseError(error)
    return { data, total: count, page, pageSize }
  },

  /**
   * Get count of active (unread and not dismissed) alerts.
   * @returns {Promise<number>}
   */
  async getActiveCount() {
    const { count, error } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .eq('is_dismissed', false)

    if (error) throw mapSupabaseError(error)
    return count ?? 0
  },

  /**
   * Mark a single alert as read.
   * @param {string} id
   * @returns {Promise<object>}
   */
  async markAsRead(id) {
    const { data, error } = await supabase
      .from('alerts')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw mapSupabaseError(error)
    return data
  },

  /**
   * Mark all unread alerts as read.
   * @returns {Promise<void>}
   */
  async markAllAsRead() {
    const { error } = await supabase
      .from('alerts')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('is_read', false)

    if (error) throw mapSupabaseError(error)
  },

  /**
   * Dismiss an alert with justification.
   * @param {string} id
   * @param {string} justification
   * @returns {Promise<object>}
   */
  async dismiss(id, justification) {
    const { data, error } = await supabase
      .from('alerts')
      .update({
        is_dismissed: true,
        dismissed_at: new Date().toISOString(),
        dismiss_justification: justification,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw mapSupabaseError(error)
    return data
  },

  /**
   * Get alerts for a specific vehicle.
   * @param {string} vehicleId
   * @returns {Promise<Array>}
   */
  async getByVehicle(vehicleId) {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false })

    if (error) throw mapSupabaseError(error)
    return data
  },

  /**
   * Get alerts for a specific driver.
   * @param {string} driverId
   * @returns {Promise<Array>}
   */
  async getByDriver(driverId) {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false })

    if (error) throw mapSupabaseError(error)
    return data
  },
}
