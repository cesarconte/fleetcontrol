/**
 * FleetControl — Document Export Utilities
 *
 * Export document lists to CSV format (Spanish locale: semicolon separator, UTF-8 BOM).
 *
 * @see docs/plans/feature-documentos-centralizados-plan.md — Fase 5
 */

import { getVehicleDocumentTypeLabel } from '@/constants/vehicle-document-types.js'
import { getDriverDocumentTypeLabel } from '@/constants/driver-document-types.js'

/**
 * Convert document array to CSV string.
 * @param {Array} documents - Document records
 * @param {'vehicle'|'driver'|'transport'} type - Document type category
 * @returns {string} CSV content with UTF-8 BOM
 */
export function documentsToCsv(documents, type) {
  const BOM = '\uFEFF'
  const separator = ';'

  const headers = getHeadersForType(type)
  const rows = documents.map(doc => getRowForType(doc, type))

  const headerLine = headers.join(separator)
  const dataLines = rows.map(row => row.map(cell => escapeCsvCell(cell)).join(separator))

  return BOM + [headerLine, ...dataLines].join('\n')
}

/**
 * Get header columns for a document type.
 * @param {'vehicle'|'driver'|'transport'} type
 * @returns {string[]}
 */
function getHeadersForType(type) {
  const common = [
    'Tipo documento',
    'Estado',
    'Nº referencia',
    'Fecha expedición',
    'Fecha vencimiento',
    'Archivo',
  ]

  if (type === 'vehicle') {
    return ['Vehículo', ...common]
  }
  if (type === 'driver') {
    return ['Conductor', ...common]
  }
  // transport
  return ['Ruta', 'Carga', 'Fecha generación', 'Generado por']
}

/**
 * Extract row values from a document record.
 * @param {object} doc - Document record
 * @param {'vehicle'|'driver'|'transport'} type
 * @returns {(string|number|null)[]}
 */
function getRowForType(doc, type) {
  if (type === 'vehicle') {
    const vehicle = doc.vehicles || {}
    return [
      `${vehicle.plate || ''} ${vehicle.brand || ''} ${vehicle.model || ''}`.trim(),
      doc.doc_type ? getVehicleDocumentTypeLabel(doc.doc_type) : '',
      doc.status || '',
      doc.reference_number || '',
      formatDate(doc.issue_date),
      formatDate(doc.expiry_date),
      doc.file_name || '',
    ]
  }

  if (type === 'driver') {
    const driver = doc.drivers || {}
    return [
      `${driver.full_name || ''} (${driver.national_id || ''})`.replace(' ()', ''),
      doc.doc_type ? getDriverDocumentTypeLabel(doc.doc_type) : '',
      doc.status || '',
      doc.reference_number || '',
      formatDate(doc.issue_date),
      formatDate(doc.expiry_date),
      doc.file_name || '',
    ]
  }

  // transport
  const route = doc.routes || {}
  return [
    route.origin_city && route.destination_city
      ? `${route.origin_city} → ${route.destination_city}`
      : '',
    '', // carga (not joined)
    formatDateTime(doc.generated_at),
    doc.generated_by || '',
  ]
}

/**
 * Escape a CSV cell value.
 * @param {string|number|null} value
 * @returns {string}
 */
function escapeCsvCell(value) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Format ISO date to DD/MM/YYYY.
 * @param {string|null} isoDate
 * @returns {string}
 */
function formatDate(isoDate) {
  if (!isoDate) return ''
  const d = new Date(isoDate)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-ES')
}

/**
 * Format ISO datetime to DD/MM/YYYY HH:mm.
 * @param {string|null} isoDate
 * @returns {string}
 */
function formatDateTime(isoDate) {
  if (!isoDate) return ''
  const d = new Date(isoDate)
  if (isNaN(d.getTime())) return ''
  return (
    d.toLocaleDateString('es-ES') +
    ' ' +
    d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  )
}

/**
 * Trigger browser download of CSV content.
 * @param {string} csvContent - CSV string with BOM
 * @param {string} filename - Filename (without extension)
 */
export function downloadCsv(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Generate default filename for document export.
 * @returns {string}
 */
export function generateExportFilename() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `fleetcontrol-documentos-${yyyy}${mm}${dd}`
}
