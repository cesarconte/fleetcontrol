/**
 * FleetControl — Document Deletion API Service
 *
 * Delete operations for vehicle_documents, driver_documents,
 * and generated_documents tables.
 */

import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'
import { apiGeneratedDocuments } from './api-document-templates.js'

/**
 * Delete a vehicle document.
 * @param {string} id - Document UUID
 */
export async function deleteVehicleDocument(id) {
  const { error } = await supabase.from('vehicle_documents').delete().eq('id', id)
  if (error) throw mapSupabaseError(error)
}

/**
 * Delete a driver document.
 * @param {string} id - Document UUID
 */
export async function deleteDriverDocument(id) {
  const { error } = await supabase.from('driver_documents').delete().eq('id', id)
  if (error) throw mapSupabaseError(error)
}

/**
 * Delete a generated transport document (DB record + Storage file).
 * @param {string} id - Document UUID
 */
export async function deleteGeneratedDocument(id) {
  await apiGeneratedDocuments.delete(id)
}
