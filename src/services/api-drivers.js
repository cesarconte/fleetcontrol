/**
 * FleetControl — Drivers Service
 *
 * Extends base CRUD with driver-specific queries.
 * Column names match the Supabase drivers table.
 */

import { createCrudService } from './create-crud-service.js'
import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

const base = createCrudService('drivers', {
  orderBy: 'full_name',
  ascending: true,
})

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
      query = query.or(`full_name.ilike.%${filters.search}%,national_id.ilike.%${filters.search}%`)
    }

    const { data, error, count } = await query
    if (error) throw mapSupabaseError(error)
    return { data, total: count, page, pageSize }
  },

  async search(term) {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .or(`full_name.ilike.%${term}%,national_id.ilike.%${term}%`)
      .order('full_name')

    if (error) throw mapSupabaseError(error)
    return data
  },

  /**
   * Get all documents for a driver.
   * @param {string} driverId
   */
  async getDocumentos(driverId) {
    const { data, error } = await supabase
      .from('driver_documents')
      .select('*')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false })

    if (error) throw mapSupabaseError(error)
    return data
  },

  /**
   * Upload a document file to Supabase Storage and create the DB record.
   * @param {string} driverId
   * @param {File} file
   * @param {object} metadata - { doc_type, issue_date, expiry_date, alert_days_before, notas }
   */
  async subirDocumento(driverId, file, metadata) {
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const filePath = `${driverId}/${metadata.doc_type}_${timestamp}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('documentos-conductores')
      .upload(filePath, file)

    if (uploadError) throw mapSupabaseError(uploadError)

    const {
      data: { publicUrl },
    } = supabase.storage.from('documentos-conductores').getPublicUrl(filePath)

    const { data, error } = await supabase
      .from('driver_documents')
      .insert({
        driver_id: driverId,
        doc_type: metadata.doc_type,
        issue_date: metadata.issue_date || null,
        expiry_date: metadata.expiry_date || null,
        alert_days_before: metadata.alert_days_before || 30,
        notes: metadata.notes || null,
        file_url: publicUrl,
      })
      .select()
      .single()

    if (error) throw mapSupabaseError(error)
    return data
  },

  /**
   * Delete a document (DB record + Storage file).
   * @param {string} documentoId
   */
  async eliminarDocumento(documentoId) {
    const { data: doc, error: fetchError } = await supabase
      .from('driver_documents')
      .select('file_url, driver_id')
      .eq('id', documentoId)
      .single()

    if (fetchError) throw mapSupabaseError(fetchError)

    if (doc.file_url) {
      const urlParts = doc.file_url.split('/documentos-conductores/')
      if (urlParts[1]) {
        await supabase.storage.from('documentos-conductores').remove([urlParts[1]])
      }
    }

    const { error } = await supabase.from('driver_documents').delete().eq('id', documentoId)

    if (error) throw mapSupabaseError(error)
  },
}
