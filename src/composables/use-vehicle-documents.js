/**
 * FleetControl — useVehicleDocuments Composable
 *
 * Reactive state for vehicle document management.
 *
 * @param {string} vehicleId - The vehicle UUID to load documents for
 * @returns {{ documents, isLoading, error, fetchDocuments }}
 */

import { ref } from 'vue'
import { apiVehicleDocuments } from '@/services/api-vehicle-documents.js'

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

  return { documents, isLoading, error, fetchDocuments }
}
