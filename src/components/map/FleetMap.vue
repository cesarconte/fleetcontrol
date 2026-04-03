<template>
  <div
    ref="mapContainer"
    class="fleet-map-container"
    data-testid="fleet-map"
    role="application"
    aria-label="Mapa de flota en tiempo real"
  >
    <div ref="mapElement" class="map-element" />

    <MapControls
      :filters="MAP_CONFIG.FILTERS"
      :active-filter="activeFilter"
      @update:active-filter="setFilter"
    />

    <div
      v-if="isDetailOpen && selectedVehicle"
      class="detail-panel"
      :class="{ 'detail-panel--mobile': isMobile }"
      data-testid="detail-panel"
      role="complementary"
      aria-label="Detalle del vehículo"
    >
      <VehicleDetailPanel
        :vehicle="selectedVehicle"
        @close="closeDetail"
        @view-detail="handleViewDetail"
      />
    </div>

    <div v-if="isLoading" class="map-loading-overlay" data-testid="map-loading">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-if="showMockDisabledWarning" class="map-warning" data-testid="gps-mock-disabled">
      <v-alert type="info" variant="tonal" density="compact">
        Mock GPS desactivado. Actívalo en Configuración → Integraciones → GPS / Telemática.
      </v-alert>
    </div>

    <div v-if="showNoPositionsWarning" class="map-warning" data-testid="gps-no-positions">
      <v-alert type="warning" variant="tonal" density="compact">
        No hay posiciones GPS disponibles. Asegúrate de que haya rutas activas asignadas.
      </v-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { MAP_CONFIG } from '@/constants/map-config.js'
import { useFleetMap } from '@/composables/use-fleet-map.js'
import { loadGoogleMaps } from '@/services/load-google-maps.js'
import { MockGpsProvider } from '@/services/mock-gps-provider.js'
import MapControls from './MapControls.vue'
import VehicleDetailPanel from './VehicleDetailPanel.vue'

const router = useRouter()
const { mobile } = useDisplay()

const mapContainer = ref(null)
const mapElement = ref(null)
let map = null
let markers = {}
let unsubscribeRealtime = null
let mockGpsProvider = null

const {
  filteredVehicles,
  activeFilter,
  selectedVehicle,
  isDetailOpen,
  isLoading,
  isGpsConnected,
  isMockGpsEnabled,
  setFilter,
  selectVehicle,
  closeDetail,
  fetch,
  subscribeToRealtime,
} = useFleetMap()

const showMockDisabledWarning = computed(() => !isMockGpsEnabled.value && !isGpsConnected.value)
const showNoPositionsWarning = computed(() => isMockGpsEnabled.value && !isGpsConnected.value)

onMounted(async () => {
  try {
    await loadGoogleMaps()
    initMap()
    unsubscribeRealtime = subscribeToRealtime()

    if (isMockGpsEnabled.value) {
      startMockGps()
    }

    await fetch()
    updateMarkers()
  } catch (err) {
    console.error('Error cargando Google Maps:', err.message)
  }
})

onUnmounted(() => {
  stopMockGps()
  if (map) {
    google.maps.event.clearInstanceListeners(map)
  }
  if (unsubscribeRealtime) {
    unsubscribeRealtime()
  }
  markers = {}
})

function startMockGps() {
  if (mockGpsProvider) return
  mockGpsProvider = new MockGpsProvider()
  mockGpsProvider.startSimulation()
}

function stopMockGps() {
  if (mockGpsProvider) {
    mockGpsProvider.stopSimulation()
    mockGpsProvider = null
  }
}

watch(isMockGpsEnabled, enabled => {
  if (enabled) {
    startMockGps()
  } else {
    stopMockGps()
  }
})

function initMap() {
  map = new google.maps.Map(mapElement.value, {
    center: MAP_CONFIG.DEFAULT_CENTER,
    zoom: mobile.value ? MAP_CONFIG.ZOOM_MOBILE : MAP_CONFIG.DEFAULT_ZOOM,
    styles: getDarkMapStyles(),
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
  })
}

function updateMarkers() {
  if (!map) return

  removeStaleMarkers()
  createOrUpdateMarkers()
}

function removeStaleMarkers() {
  const currentIds = new Set(filteredVehicles.value.map(v => v.vehicle_id))
  for (const id in markers) {
    if (!currentIds.has(id)) {
      markers[id].setMap(null)
      delete markers[id]
    }
  }
}

function createOrUpdateMarkers() {
  for (const vehicle of filteredVehicles.value) {
    if (vehicle.latitude == null || vehicle.longitude == null) continue

    if (markers[vehicle.vehicle_id]) {
      markers[vehicle.vehicle_id].setPosition({
        lat: vehicle.latitude,
        lng: vehicle.longitude,
      })
    } else {
      markers[vehicle.vehicle_id] = createMarker(vehicle)
    }
  }
}

function createMarker(vehicle) {
  const status = vehicle._isOffline ? 'offline' : vehicle.vehicles?.status
  const color = MAP_CONFIG.MARKER_COLORS[status] || '#9E9E9E'
  const marker = new google.maps.Marker({
    position: { lat: vehicle.latitude, lng: vehicle.longitude },
    map,
    title: vehicle.vehicles?.plate || vehicle.vehicle_id,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: vehicle._isOffline ? 8 : 10,
    },
  })

  if (vehicle._isOffline) {
    marker.setOpacity(0.6)
  }

  marker.addListener('click', () => {
    selectVehicle(vehicle)
  })

  return marker
}

watch(
  filteredVehicles,
  () => {
    updateMarkers()
  },
  { deep: true },
)

function handleViewDetail(vehicleId) {
  closeDetail()
  router.push({ name: 'VehicleDetail', params: { id: vehicleId } })
}

function getDarkMapStyles() {
  return [
    { elementType: 'geometry', stylers: [{ color: '#212121' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    {
      featureType: 'water',
      elementType: 'geometry.fill',
      stylers: [{ color: '#000000' }],
    },
  ]
}
</script>

<style scoped>
.fleet-map-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-element {
  width: 100%;
  height: 100%;
}

.detail-panel {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 320px;
  z-index: 10;
}

.detail-panel--mobile {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  top: auto;
}

.map-loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 20;
}

.map-warning {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  z-index: 10;
}
</style>
