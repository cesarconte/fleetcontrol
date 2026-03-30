/**
 * FleetControl — Driver Document Types
 *
 * Valid document types for the driver_documents table.
 * Each type has an internal value (stored in DB) and a Spanish label (shown in UI).
 */

/** @param {object} obj */
function deepFreeze(obj) {
  Object.keys(obj).forEach(key => {
    const val = obj[key]
    if (val && typeof val === 'object') deepFreeze(val)
  })
  return Object.freeze(obj)
}

export const DRIVER_DOCUMENT_TYPES = deepFreeze({
  CARNET_CONDUCIR: { value: 'carnet_conducir', label: 'Carnet de conducir' },
  CAP: { value: 'cap', label: 'CAP — Certificado de Aptitud Profesional' },
  TARJETA_TACOGRAFO: { value: 'tarjeta_tacografo', label: 'Tarjeta de conductor (tacógrafo)' },
  RECONOCIMIENTO_MEDICO: { value: 'reconocimiento_medico', label: 'Reconocimiento médico' },
  CERTIFICADO_ADR: { value: 'certificado_adr', label: 'Certificado ADR' },
  FORMACION_CONTINUA: { value: 'formacion_continua', label: 'Formación continua' },
  OTRO: { value: 'otro', label: 'Otro' },
})

/**
 * Array of all document type values (for selects and validation).
 * @type {string[]}
 */
export const DRIVER_DOCUMENT_TYPE_VALUES = Object.freeze(
  Object.values(DRIVER_DOCUMENT_TYPES).map(t => t.value),
)

/**
 * Get the Spanish label for a document type value.
 * @param {string} value
 * @returns {string}
 */
export function getDriverDocumentTypeLabel(value) {
  const entry = Object.values(DRIVER_DOCUMENT_TYPES).find(t => t.value === value)
  return entry?.label ?? value
}

/**
 * Allowed license classes for Spanish driving licenses (RDL 6/2015).
 * @type {string[]}
 */
export const CLASES_CARNET = Object.freeze([
  'B',
  'C',
  'C+E',
  'C1',
  'C1+E',
  'D',
  'D+E',
  'D1',
  'D1+E',
])
