/**
 * FleetControl — Document Templates API Service
 *
 * CRUD operations for document_templates and generated_documents tables.
 * Extends base CRUD with template-specific and generated-doc queries.
 *
 * @see PRD §4.9 — Documentación de Transporte
 * @see AGENTS.md §6 — API Service Pattern
 */

import { createCrudService } from './create-crud-service.js'
import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

const STORAGE_BUCKET = 'transport-documents'

const base = createCrudService('document_templates', { orderBy: 'document_type', ascending: true })

export const apiDocumentTemplates = {
  ...base,

  /**
   * Get all active document templates, ordered by document_type.
   * @returns {Promise<Array>}
   */
  async getActiveTemplates() {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('is_active', true)
      .order('document_type', { ascending: true })

    if (error) throw mapSupabaseError(error)
    return data
  },

  /**
   * Get a template by its document type.
   * @param {string} documentType
   * @returns {Promise<Object|null>}
   */
  async getByType(documentType) {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('document_type', documentType)
      .maybeSingle()

    if (error) throw mapSupabaseError(error)
    return data
  },

  /**
   * Toggle template active/inactive status.
   * @param {string} id - Template UUID
   * @param {boolean} isActive
   * @returns {Promise<object>}
   */
  async toggleActive(id, isActive) {
    const { data, error } = await supabase
      .from('document_templates')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single()

    if (error) throw mapSupabaseError(error)
    return data
  },
}

export const apiGeneratedDocuments = {
  /**
   * Get all generated documents for a route.
   * @param {string} routeId
   * @returns {Promise<Array>}
   */
  async getByRoute(routeId) {
    const { data, error } = await supabase
      .from('generated_documents')
      .select('*')
      .eq('route_id', routeId)
      .order('generated_at', { ascending: false })

    if (error) throw mapSupabaseError(error)
    return data
  },

  /**
   * Delete a generated document (DB record + Storage file).
   * @param {string} id - Document UUID
   */
  async delete(id) {
    // First get the file URL
    const { data: doc, error: fetchError } = await supabase
      .from('generated_documents')
      .select('file_url')
      .eq('id', id)
      .single()

    if (fetchError) throw mapSupabaseError(fetchError)

    // Delete storage file if it exists
    if (doc?.file_url) {
      const urlParts = doc.file_url.split(`/${STORAGE_BUCKET}/`)
      if (urlParts[1]) {
        await supabase.storage.from(STORAGE_BUCKET).remove([urlParts[1]])
      }
    }

    // Delete DB record
    const { error } = await supabase.from('generated_documents').delete().eq('id', id)

    if (error) throw mapSupabaseError(error)
  },
}
