/**
 * FleetControl — Drivers Service
 *
 * Extends base CRUD with driver-specific queries.
 * Column names match the Supabase drivers table (Spanish).
 */

import { createCrudService } from './create-crud-service.js'
import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

const base = createCrudService('drivers', {
  orderBy: 'nombre_completo',
  ascending: true,
})

export const apiDrivers = {
  ...base,

  async getPaginated({
    page = 1,
    pageSize = 25,
    filters = {},
    sort = { col: 'nombre_completo', asc: true },
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
      query = query.or(
        `nombre_completo.ilike.%${filters.search}%,nif_nie.ilike.%${filters.search}%`,
      )
    }

    const { data, error, count } = await query
    if (error) throw mapSupabaseError(error)
    return { data, total: count, page, pageSize }
  },

  async search(term) {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .or(`nombre_completo.ilike.%${term}%,nif_nie.ilike.%${term}%`)
      .order('nombre_completo')

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
   * @param {object} metadata - { tipo_documento, numero_referencia, categoria, fecha_expedicion, fecha_vencimiento, notas }
   */
  async subirDocumento(driverId, file, metadata) {
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const filePath = `${driverId}/${metadata.tipo_documento}_${timestamp}.${ext}`

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
        tipo_documento: metadata.tipo_documento,
        numero_referencia: metadata.numero_referencia || null,
        categoria: metadata.categoria || null,
        fecha_expedicion: metadata.fecha_expedicion || null,
        fecha_vencimiento: metadata.fecha_vencimiento || null,
        alerta_dias_anticipacion: metadata.alerta_dias_anticipacion || 30,
        notas: metadata.notas || null,
        archivo_url: publicUrl,
        archivo_nombre: file.name,
        archivo_tipo: file.type,
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
      .select('archivo_url, driver_id')
      .eq('id', documentoId)
      .single()

    if (fetchError) throw mapSupabaseError(fetchError)

    if (doc.archivo_url) {
      const urlParts = doc.archivo_url.split('/documentos-conductores/')
      if (urlParts[1]) {
        await supabase.storage.from('documentos-conductores').remove([urlParts[1]])
      }
    }

    const { error } = await supabase.from('driver_documents').delete().eq('id', documentoId)

    if (error) throw mapSupabaseError(error)
  },
}
