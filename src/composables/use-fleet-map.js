/**
 * FleetControl — useFleetMap Composable
 *
 * Gestiona el estado del mapa de flota: vehículos con posición,
 * filtros, selección, y suscripción realtime.
 *
 * @see docs/plans/feature-mapa-plan.md — Tarea 3.1
 * @returns {Object} FleetMap state and methods
 */

import { ref, computed } from 'vue'
import { apiVehiclePositions } from '@/services/api-vehicle-positions.js'
import { useRealtime } from '@/composables/use-realtime.js'

/**
 * Composable para el mapa de flota.
 * @returns {object} Reactive state and methods
 */
export function useFleetMap() {
  const vehicles = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const activeFilter = ref('all')
  const selectedVehicle = ref(null)
  const isDetailOpen = ref(false)
  const isGpsConnected = computed(() => vehicles.value.length > 0 && !error.value)

  const filteredVehicles = computed(() => {
    if (activeFilter.value === 'all') return vehicles.value
    if (activeFilter.value === 'has_alerts') {
      return vehicles.value.filter(v => v._hasAlerts)
    }
    return vehicles.value.filter(v => v.vehicles?.status === activeFilter.value)
  })

  const vehiclesWithPosition = computed(() =>
    vehicles.value.filter(v => v.latitude != null && v.longitude != null),
  )

  const vehiclesOnRoute = computed(() =>
    vehicles.value.filter(v => v.vehicles?.status === 'on_route'),
  )

  async function fetch() {
    isLoading.value = true
    error.value = null
    try {
      const positions = await apiVehiclePositions.getFleetPositions()
      vehicles.value = positions
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  function setFilter(filter) {
    activeFilter.value = filter
  }

  function selectVehicle(vehicle) {
    selectedVehicle.value = vehicle
    isDetailOpen.value = true
  }

  function closeDetail() {
    selectedVehicle.value = null
    isDetailOpen.value = false
  }

  function subscribeToRealtime() {
    const realtime = useRealtime()
    realtime.subscribe('vehicle_positions', async () => {
      await fetch()
    })
    return () => realtime.unsubscribe('vehicle_positions')
  }

  return {
    vehicles,
    isLoading,
    error,
    activeFilter,
    selectedVehicle,
    isDetailOpen,
    isGpsConnected,
    filteredVehicles,
    vehiclesWithPosition,
    vehiclesOnRoute,
    fetch,
    setFilter,
    selectVehicle,
    closeDetail,
    subscribeToRealtime,
  }
}
