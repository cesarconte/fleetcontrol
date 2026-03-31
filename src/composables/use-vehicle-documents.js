/**
 * FleetControl — useVehicleDocuments Composable
 *
 * Reactive state for vehicle document management with CRUD and file upload.
 *
 * @returns {{ documents, isLoading, error, fetchDocuments, createDocument, updateDocument, deleteDocument, uploadFile }}
 */

import { ref } from 'vue'
import { apiVehicleDocuments } from '@/services/api-vehicle-documents.js'
import { supabase } from '@/services/supabase-client.js'

const STORAGE_BUCKET = 'vehicle-documents'

export function useVehicleDocuments() {
  const documents = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Fetch all documents for a vehicle.
   * @param {string} vehicleId
   */
  async function fetchDocuments(vehicleId) {
    if (!vehicleId) {
      documents.value = []
      return
    }

    isLoading.value = true
    error.value = null
    try {
      documents.value = await apiVehicleDocuments.getByVehicle(vehicleId)
    } catch (err) {
      error.value = err.message
      documents.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new vehicle document.
   * @param {object} data - Document data (vehicle_id, doc_type, etc.)
   * @returns {Promise<object>} Created document
   */
  async function createDocument(data) {
    isLoading.value = true
    error.value = null
    try {
      const doc = await apiVehicleDocuments.create(data)
      documents.value.push(doc)
      return doc
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing vehicle document.
   * @param {string} id - Document UUID
   * @param {object} data - Fields to update
   * @returns {Promise<object>} Updated document
   */
  async function updateDocument(id, data) {
    isLoading.value = true
    error.value = null
    try {
      const doc = await apiVehicleDocuments.update(id, data)
      const idx = documents.value.findIndex(d => d.id === id)
      if (idx !== -1) documents.value[idx] = doc
      return doc
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a vehicle document (DB record + Storage file).
   * @param {string} id - Document UUID
   */
  async function deleteDocument(id) {
    isLoading.value = true
    error.value = null
    try {
      const doc = documents.value.find(d => d.id === id)
      if (doc?.file_url) {
        const urlParts = doc.file_url.split(`/${STORAGE_BUCKET}/`)
        if (urlParts[1]) {
          await supabase.storage.from(STORAGE_BUCKET).remove([urlParts[1]])
        }
      }
      await apiVehicleDocuments.delete(id)
      documents.value = documents.value.filter(d => d.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Upload a file to Supabase Storage.
   * @param {File} file - File to upload
   * @param {string} vehicleId - Vehicle UUID (for path)
   * @param {string} docType - Document type (for filename)
   * @returns {Promise<string>} Public URL of uploaded file
   */
  async function uploadFile(file, vehicleId, docType) {
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const filePath = `${vehicleId}/${docType}_${timestamp}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)

    return publicUrl
  }

  return {
    documents,
    isLoading,
    error,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    uploadFile,
  }
}
