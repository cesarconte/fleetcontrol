/**
 * FleetControl — useFleetMap Composable
 *
 * Gestiona el estado del mapa de flota: vehículos con posición,
 * filtros, selección, y suscripción realtime.
 *
 * @see docs/plans/feature-mapa-plan.md — Tarea 3.1
 * @returns {Object} FleetMap state and methods
 */

import { ref, computed, watch } from 'vue'
import { apiVehiclePositions } from '@/services/api-vehicle-positions.js'
import { useRealtime } from '@/composables/use-realtime.js'
import { GPS_OFFLINE_THRESHOLD_MS } from '@/constants/gps-config.js'
import { useSettings } from '@/composables/use-settings.js'
import { MockGpsProvider } from '@/services/mock-gps-provider.js'
import { supabase } from '@/services/supabase-client.js'

/**
 * Composable para el mapa de flota.
 * @returns {object} Reactive state and methods
 */
export function useFleetMap() {
  const settingsStore = useSettings()
  const vehicles = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const activeFilter = ref('all')
  const selectedVehicle = ref(null)
  const isDetailOpen = ref(false)
  const isGpsConnected = computed(() => vehicles.value.length > 0 && !error.value)
  let mockProvider = null

  const isMockGpsEnabled = computed(
    () =>
      settingsStore.companySettings?.gps_provider === 'mock' &&
      settingsStore.companySettings?.mock_gps_enabled === true,
  )

  // Load settings immediately so isMockGpsEnabled is accurate from the start
  if (!settingsStore.companySettings) {
    settingsStore.fetchCompanySettings().catch(() => {})
  }

  /**
   * Determina si un vehículo está offline (sin ping >15 min).
   * @param {object} vehicle
   * @returns {boolean}
   */
  function isVehicleOffline(vehicle) {
    if (!vehicle.recorded_at) return true
    const lastPing = new Date(vehicle.recorded_at).getTime()
    return Date.now() - lastPing > GPS_OFFLINE_THRESHOLD_MS
  }

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

  /**
   * Asegura que las settings están cargadas y el mock GPS arrancado si procede.
   */
  async function ensureMockGps() {
    if (mockProvider) return mockProvider

    // Load settings if not available
    if (!settingsStore.companySettings) {
      try {
        await settingsStore.fetchCompanySettings()
      } catch {
        return null
      }
    }

    // Only start if mock is enabled
    if (!isMockGpsEnabled.value) return null

    mockProvider = new MockGpsProvider()
    await mockProvider.startSimulation()
    return mockProvider
  }

  async function fetch() {
    isLoading.value = true
    error.value = null
    try {
      let positions

      if (isMockGpsEnabled.value) {
        // Ensure settings are loaded and mock is running
        await ensureMockGps()

        const mockPositions = await mockProvider.getFleetPositions()

        // Fetch vehicle info from DB to enrich mock positions
        const vehicleIds = mockPositions.map(p => p.vehicle_id)
        let vehicleInfo = new Map()
        if (vehicleIds.length > 0) {
          const { data, error } = await supabase
            .from('vehicles')
            .select('id, plate, brand, model, status')
            .in('id', vehicleIds)
          if (!error && data) {
            for (const v of data) {
              vehicleInfo.set(v.id, v)
            }
          }
        }

        positions = mockPositions.map(p => {
          const info = vehicleInfo.get(p.vehicle_id) || {}
          return {
            vehicle_id: p.vehicle_id,
            latitude: p.latitude,
            longitude: p.longitude,
            current_speed_kmh: p.speed_kph,
            heading_degrees: p.heading_degrees,
            recorded_at: p.recorded_at,
            provider: p.provider,
            vehicles: {
              id: p.vehicle_id,
              plate: info.plate || '',
              brand: info.brand || '',
              model: info.model || '',
              status: 'on_route', // Mock GPS = vehículo en ruta activa
            },
            _isOffline: false,
          }
        })
      } else {
        positions = await apiVehiclePositions.getFleetPositions()
        positions = positions.map(v => ({
          ...v,
          _isOffline: isVehicleOffline(v),
        }))
      }
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

  function stopMockGps() {
    if (mockProvider) {
      mockProvider.stopSimulation()
      mockProvider = null
    }
  }

  // When mock GPS becomes enabled (settings loaded), auto-start and fetch
  watch(isMockGpsEnabled, async enabled => {
    if (enabled && !mockProvider) {
      await ensureMockGps()
      await fetch()
    }
  })

  return {
    vehicles,
    isLoading,
    error,
    activeFilter,
    selectedVehicle,
    isDetailOpen,
    isGpsConnected,
    isMockGpsEnabled,
    filteredVehicles,
    vehiclesWithPosition,
    vehiclesOnRoute,
    fetch,
    setFilter,
    selectVehicle,
    closeDetail,
    subscribeToRealtime,
    stopMockGps,
  }
}
