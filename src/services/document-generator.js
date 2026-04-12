/**
 * FleetControl — Document Generator (Orchestrator)
 *
 * Delegates document generation to specialized services per document type.
 * Each document type has its own service with field mapping, validation,
 * PDF rendering, and storage.
 *
 * @see PRD §4.9 — Documentación de Transporte
 */

import { generateCmrDocument } from './document-cmr.js'
import { generateCartaPorteNacionalDocument } from './document-carta-porte-nacional.js'
import { generateAlbaranDocument } from './document-albaran.js'
import { generateHojaRutaDocument } from './document-hoja-ruta.js'
import { generateFacturaDocument } from './document-factura.js'
import { generatePodDocument } from './document-pod.js'
import { generateAdrDocument } from './document-adr.js'
import { generateControlDocument } from './document-control.js'
import { generateCleaningCertDocument } from './document-cleaning-cert.js'
import { generatePackingListDocument } from './document-packing-list.js'

/**
 * Generate a transport document PDF and store it.
 * Delegates to the appropriate specialized service based on document type.
 *
 * @param {object} params
 * @param {string} params.documentType - Document type value (cmr, albaran, etc.)
 * @param {string} params.routeId - Route UUID for data source
 * @param {string} [params.cargoId] - Optional cargo UUID
 * @returns {Promise<{ url: string, documentId: string, filename: string }>}
 */
export async function generateDocument({ documentType, routeId, cargoId }) {
  const generators = {
    cmr: generateCmrDocument,
    carta_porte_nacional: generateCartaPorteNacionalDocument,
    albaran: generateAlbaranDocument,
    hoja_ruta: generateHojaRutaDocument,
    factura: generateFacturaDocument,
    pod: generatePodDocument,
    adr: generateAdrDocument,
    documento_control: generateControlDocument,
    cleaning_cert: generateCleaningCertDocument,
    packing_list: generatePackingListDocument,
  }

  const generator = generators[documentType]
  if (!generator) {
    throw new Error(`Tipo de documento no soportado: ${documentType}`)
  }

  return generator({ routeId, cargoId })
}
