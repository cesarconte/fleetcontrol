/**
 * FleetControl — Vehicle Document Types
 *
 * Valid document types for the vehicle_documents table.
 * Each type has an internal value (stored in DB) and a Spanish label (shown in UI).
 *
 * Based on PRD §4.2.2 — Documentación del Vehículo.
 *
 * @see RD 2042/1994 — ITV
 * @see RDL 8/2004 + Ley 5/2025 — Seguro RC
 * @see LOTT — Ley 16/1987 — Tarjeta de Transporte
 * @see Reg. UE 165/2014 — Tacógrafo
 * @see ADR 2025 + RD 97/2014 — Certificado ADR vehículo
 */

/** @param {object} obj */
function deepFreeze(obj) {
  Object.keys(obj).forEach(key => {
    const val = obj[key]
    if (val && typeof val === 'object') deepFreeze(val)
  })
  return Object.freeze(obj)
}

export const VEHICLE_DOCUMENT_TYPES = deepFreeze({
  ITV: {
    value: 'itv',
    label: 'ITV — Inspección Técnica de Vehículos',
    required: true,
    periodicity: 'Anual (>3.500 kg)',
    baseLegal: 'RD 2042/1994',
  },
  SEGURO_RC: {
    value: 'seguro_rc',
    label: 'Seguro de Responsabilidad Civil',
    required: true,
    periodicity: 'Anual',
    baseLegal: 'RDL 8/2004 + Ley 5/2025',
  },
  TARJETA_TRANSPORTE: {
    value: 'tarjeta_transporte',
    label: 'Tarjeta de Transporte (MDL/MDC)',
    required: true,
    periodicity: 'Cada 5 años',
    baseLegal: 'LOTT — Ley 16/1987',
  },
  CALIBRACION_TACOGRAFO: {
    value: 'calibracion_tacografo',
    label: 'Calibración Tacógrafo Digital',
    required: true,
    periodicity: 'Cada 2 años',
    baseLegal: 'Reg. UE 165/2014',
  },
  PERMISO_CIRCULACION: {
    value: 'permiso_circulacion',
    label: 'Permiso de Circulación',
    required: true,
    periodicity: 'Sin vencimiento ordinario',
    baseLegal: 'DGT',
  },
  CERTIFICADO_ADR_VEHICULO: {
    value: 'certificado_adr_vehiculo',
    label: 'Certificado ADR del Vehículo',
    required: false,
    periodicity: 'Anual (solo mercancías peligrosas)',
    baseLegal: 'ADR 2025 — RD 97/2014',
  },
  AUTORIZACION_TRANSP_ESP: {
    value: 'autorizacion_transporte_especial',
    label: 'Autorización Transporte Especial',
    required: false,
    periodicity: 'Por expedición o periódica',
    baseLegal: 'RD 1837/2009',
  },
  REVISION_LIMITADOR: {
    value: 'revision_limitador_velocidad',
    label: 'Revisión Limitador de Velocidad',
    required: false,
    periodicity: 'Vinculado a ITV',
    baseLegal: 'Directiva 92/6/CEE',
  },
})

/**
 * Array of all document type values (for selects and validation).
 * @type {string[]}
 */
export const VEHICLE_DOCUMENT_TYPE_VALUES = Object.freeze(
  Object.values(VEHICLE_DOCUMENT_TYPES).map(t => t.value),
)

/**
 * Get the Spanish label for a document type value.
 * @param {string} value
 * @returns {string}
 */
export function getVehicleDocumentTypeLabel(value) {
  const entry = Object.values(VEHICLE_DOCUMENT_TYPES).find(t => t.value === value)
  return entry?.label ?? value
}

/**
 * Get the required document types (always needed regardless of cargo).
 * @returns {Array<{ value: string, label: string }>}
 */
export function getRequiredVehicleDocumentTypes() {
  return Object.values(VEHICLE_DOCUMENT_TYPES)
    .filter(t => t.required)
    .map(t => ({ value: t.value, label: t.label }))
}

/**
 * Check if a document type is required for a given cargo subcategory.
 * @param {string} docType - The document type value
 * @param {string} subcategoryId - The cargo subcategory ID
 * @returns {boolean}
 */
export function isDocumentRequiredForSubcategory(docType, subcategoryId) {
  if (docType === 'certificado_adr_vehiculo' && subcategoryId?.startsWith('adr-')) {
    return true
  }
  const entry = Object.values(VEHICLE_DOCUMENT_TYPES).find(t => t.value === docType)
  return entry?.required ?? false
}
