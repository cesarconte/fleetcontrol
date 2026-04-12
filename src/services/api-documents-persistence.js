/**
 * FleetControl — Shared Document Persistence Service
 *
 * Centralized logic for saving generated document records and updating
 * associated business entities (routes, cargo, etc.) with document numbers.
 */

import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

/**
 * Mapping between document types and the corresponding route table column.
 */
const ROUTE_DOCUMENT_FIELD_MAP = {
  albaran: 'delivery_note_number',
  cmr: 'cmr_number',
  carta_porte_nacional: 'cpn_number',
  factura: 'invoice_number',
  pod: 'pod_number',
  adr: 'adr_number',
  documento_control: 'control_number',
  hoja_ruta: 'route_sheet_number',
  packing_list: 'packing_list_number',
  cleaning_cert: 'cleaning_cert_number',
}

/**
 * Save a record of a generated document and update the associated route.
 *
 * @param {object} params
 * @param {string} params.routeId - UUID of the route
 * @param {string} [params.cargoId] - UUID of the cargo
 * @param {string} params.docNumber - Professional document identifier
 * @param {string} params.filename - Name of the stored file
 * @param {string} params.url - Public URL of the stored file
 * @param {string} params.type - Document type (slug)
 * @returns {Promise<object>} The created document record
 */
export async function saveDocumentRecord({ routeId, cargoId, docNumber, filename, url, type }) {
  // 1. Fetch template ID
  const { data: template } = await supabase
    .from('document_templates')
    .select('id')
    .eq('document_type', type)
    .maybeSingle()

  const user = (await supabase.auth.getUser()).data.user

  // 2. Insert into generated_documents
  const { data, error } = await supabase
    .from('generated_documents')
    .insert({
      template_id: template?.id,
      route_id: routeId,
      cargo_id: cargoId || null,
      document_type: type,
      document_number: docNumber,
      file_url: url,
      filename,
      generated_by: user?.id,
    })
    .select()
    .single()

  if (error) throw mapSupabaseError(error)

  // 3. Update associated route with the document number (business field)
  const column = ROUTE_DOCUMENT_FIELD_MAP[type]
  if (column && routeId) {
    const { error: updateError } = await supabase
      .from('routes')
      .update({ [column]: docNumber })
      .eq('id', routeId)

    if (updateError) {
      console.warn(
        `[DocumentPersistence] Failed to update route ${routeId} with ${column}:`,
        updateError,
      )
    }
  }

  return data
}
