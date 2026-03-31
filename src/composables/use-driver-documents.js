/**
 * FleetControl — useDriverDocuments Composable
 *
 * Reactive driver document management with upload, list, and delete.
 * Calculates document expiry status per regulatory thresholds.
 */

import { ref } from 'vue'
import { apiDrivers } from '@/services/api-drivers.js'
import { useNotificationStore } from '@/stores/notifications.js'
import { LEGAL_LIMITS } from '@/constants/legal-limits.js'
import { getDriverDocumentTypeLabel } from '@/constants/driver-document-types.js'

/**
 * @param {string} driverId
 */
export function useDriverDocuments(driverId) {
  const documentos = ref([])
  const isLoading = ref(false)
  const isUploading = ref(false)
  const error = ref(null)

  const notifications = useNotificationStore()

  async function cargarDocumentos() {
    if (!driverId) return
    isLoading.value = true
    error.value = null
    try {
      documentos.value = await apiDrivers.getDocumentos(driverId)
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar los documentos del conductor')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * @param {File} file
   * @param {object} metadata
   */
  async function subirDocumento(file, metadata) {
    if (!driverId) return
    isUploading.value = true
    error.value = null
    try {
      const doc = await apiDrivers.subirDocumento(driverId, file, metadata)
      documentos.value.unshift(doc)
      notifications.success('Documento subido correctamente')
      return doc
    } catch (err) {
      error.value = err
      notifications.error('Error al subir el documento')
      throw err
    } finally {
      isUploading.value = false
    }
  }

  /**
   * @param {string} documentoId
   */
  async function eliminarDocumento(documentoId) {
    error.value = null
    try {
      await apiDrivers.eliminarDocumento(documentoId)
      documentos.value = documentos.value.filter(d => d.id !== documentoId)
      notifications.success('Documento eliminado')
    } catch (err) {
      error.value = err
      notifications.error('Error al eliminar el documento')
      throw err
    }
  }

  /**
   * Calculate document status based on expiry date.
   * @param {string|null} fechaVencimiento - ISO date string
   * @returns {{ status: string, label: string, color: string }}
   */
  function getEstadoDocumento(fechaVencimiento) {
    if (!fechaVencimiento) {
      return { status: 'sin_fecha', label: 'Sin fecha', color: 'grey' }
    }

    const ahora = new Date()
    const vencimiento = new Date(fechaVencimiento)
    const diffMs = vencimiento - ahora
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { status: 'vencido', label: 'Vencido', color: 'error' }
    }

    const criticalDays = LEGAL_LIMITS.ALERT_THRESHOLDS.DOCUMENT_EXPIRY_CRITICAL_DAYS
    const warningDays = LEGAL_LIMITS.ALERT_THRESHOLDS.DOCUMENT_EXPIRY_WARNING_DAYS

    if (diffDays <= criticalDays) {
      return { status: 'critico', label: `Crítico (${diffDays}d)`, color: 'error' }
    }

    if (diffDays <= warningDays) {
      return {
        status: 'proximo_a_vencer',
        label: `Próximo a vencer (${diffDays}d)`,
        color: 'warning',
      }
    }

    return { status: 'en_regla', label: 'En regla', color: 'success' }
  }

  /**
   * Get documents grouped by type for display.
   * @returns {Record<string, object[]>}
   */
  function documentosPorTipo() {
    const grouped = {}
    for (const doc of documentos.value) {
      const tipo = doc.doc_type
      if (!grouped[tipo]) grouped[tipo] = []
      grouped[tipo].push({
        ...doc,
        tipo_label: getDriverDocumentTypeLabel(tipo),
        estado: getEstadoDocumento(doc.expiry_date),
      })
    }
    return grouped
  }

  return {
    documentos,
    isLoading,
    isUploading,
    error,
    cargarDocumentos,
    subirDocumento,
    eliminarDocumento,
    getEstadoDocumento,
    documentosPorTipo,
  }
}
