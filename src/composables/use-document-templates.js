/**
 * FleetControl — useDocumentTemplates Composable
 *
 * Reactive state for transport document template management,
 * PDF generation, and generated document tracking.
 *
 * @returns {{ templates, isLoading, error, isGenerating, generateError, fetchTemplates, toggleTemplate, generateDocument, deleteGeneratedDocument }}
 */

import { ref } from 'vue'
import { apiDocumentTemplates, apiGeneratedDocuments } from '@/services/api-document-templates.js'
import { generateDocument as generatePdf } from '@/services/document-generator.js'

export function useDocumentTemplates() {
  const templates = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const isGenerating = ref(false)
  const generateError = ref(null)

  /**
   * Fetch all active document templates.
   */
  async function fetchTemplates() {
    isLoading.value = true
    error.value = null
    try {
      templates.value = await apiDocumentTemplates.getActiveTemplates()
    } catch (err) {
      error.value = err.message
      templates.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Toggle a template active/inactive status.
   * @param {string} id - Template UUID
   * @param {boolean} isActive
   */
  async function toggleTemplate(id, isActive) {
    error.value = null
    try {
      await apiDocumentTemplates.toggleActive(id, isActive)
      const idx = templates.value.findIndex(t => t.id === id)
      if (idx !== -1) {
        templates.value[idx].is_active = isActive
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  /**
   * Generate a transport document PDF.
   * @param {object} params
   * @param {string} params.documentType
   * @param {string} params.routeId
   * @param {string} [params.cargoId]
   * @returns {Promise<{ url: string, documentId: string, filename: string }>}
   */
  async function generateDocument({ documentType, routeId, cargoId }) {
    isGenerating.value = true
    generateError.value = null
    try {
      const result = await generatePdf({ documentType, routeId, cargoId })
      return result
    } catch (err) {
      generateError.value = err.message
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  /**
   * Delete a generated document.
   * @param {string} id - Document UUID
   */
  async function deleteGeneratedDocument(id) {
    error.value = null
    try {
      await apiGeneratedDocuments.delete(id)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    templates,
    isLoading,
    error,
    isGenerating,
    generateError,
    fetchTemplates,
    toggleTemplate,
    generateDocument,
    deleteGeneratedDocument,
  }
}
