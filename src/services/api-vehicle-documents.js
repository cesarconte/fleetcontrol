/**
 * FleetControl — Vehicle Documents API Service
 *
 * CRUD operations for vehicle_documents table.
 * Column names match Supabase DB schema (English).
 */

import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'
import { createCrudService } from './create-crud-service.js'

const base = createCrudService('vehicle_documents')

export const apiVehicleDocuments = {
  ...base,

  /**
   * Get all documents for a vehicle, ordered by expiry_date ascending.
   * @param {string} vehicleId
   * @returns {Promise<Array>}
   */
  async getByVehicle(vehicleId) {
    const { data, error } = await supabase
      .from('vehicle_documents')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('expiry_date', { ascending: true, nullsFirst: false })

    if (error) throw mapSupabaseError(error)
    return data
  },

  /**
   * Get a specific document by vehicle and type.
   * @param {string} vehicleId
   * @param {string} docType
   * @returns {Promise<Object|null>}
   */
  async getByVehicleAndType(vehicleId, docType) {
    const { data, error } = await supabase
      .from('vehicle_documents')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .eq('doc_type', docType)
      .maybeSingle()

    if (error) throw mapSupabaseError(error)
    return data
  },

  /**
   * Get documents with critical or expired status for a vehicle.
   * @param {string} vehicleId
   * @returns {Promise<Array>}
   */
  async getExpiredOrCritical(vehicleId) {
    const { data, error } = await supabase
      .from('vehicle_documents')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .in('status', ['expired', 'critical'])

    if (error) throw mapSupabaseError(error)
    return data
  },
}
