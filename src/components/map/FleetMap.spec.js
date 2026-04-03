/**
 * @vitest-environment jsdom
 *
 * Tests del componente FleetMap.vue — estructura y estados UI.
 * Tests de marcadores en FleetMap.markers.spec.js.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import FleetMap from '@/components/map/FleetMap.vue'

const mockSetCenter = vi.fn()
const mockSetZoom = vi.fn()
const mockSetPosition = vi.fn()
const mockSetMap = vi.fn()
const mockAddListener = vi.fn()
const mockClearListeners = vi.fn()

global.google = {
  maps: {
    Map: vi.fn().mockImplementation(function () {
      this.setCenter = mockSetCenter
      this.setZoom = mockSetZoom
    }),
    Marker: vi.fn().mockImplementation(function () {
      this.setPosition = mockSetPosition
      this.setMap = mockSetMap
      this.addListener = mockAddListener
    }),
    SymbolPath: { CIRCLE: 0 },
    event: {
      clearInstanceListeners: mockClearListeners,
    },
    marker: {
      PinElement: vi.fn().mockImplementation(function () {
        this.element = document.createElement('div')
      }),
      AdvancedMarkerElement: vi.fn().mockImplementation(function (opts) {
        this.position = opts.position
        this.map = opts.map
        this.content = opts.content
        this.addEventListener = mockAddListener
      }),
    },
  },
}

const mockIsGpsConnected = ref(true)
const mockIsMockGpsEnabled = ref(false)

const mockFleetMapState = {
  vehicles: [],
  filteredVehicles: [],
  activeFilter: 'all',
  selectedVehicle: null,
  isDetailOpen: false,
  isLoading: false,
  isGpsConnected: mockIsGpsConnected,
  isMockGpsEnabled: mockIsMockGpsEnabled,
  setFilter: vi.fn(),
  selectVehicle: vi.fn(),
  closeDetail: vi.fn(),
  fetch: vi.fn(),
  subscribeToRealtime: vi.fn(() => vi.fn()),
  stopMockGps: vi.fn(),
}

vi.mock('@/composables/use-fleet-map.js', () => ({
  useFleetMap: vi.fn(() => mockFleetMapState),
}))

vi.mock('@/services/load-google-maps.js', () => ({
  loadGoogleMaps: vi.fn().mockResolvedValue(),
}))

vi.mock('@/constants/map-config.js', () => ({
  MAP_CONFIG: {
    DEFAULT_CENTER: { lat: 40.4168, lng: -3.7038 },
    DEFAULT_ZOOM: 6,
    ZOOM_MOBILE: 5,
    MARKER_COLORS: {
      on_route: '#4CAF50',
      in_maintenance: '#FFC107',
      active: '#2196F3',
      inactive: '#9E9E9E',
      decommissioned: '#616161',
    },
    FILTERS: [
      { key: 'all', label: 'Todos', icon: 'mdi-map-marker' },
      { key: 'on_route', label: 'En Ruta', icon: 'mdi-truck-fast' },
      { key: 'in_maintenance', label: 'Mantenimiento', icon: 'mdi-wrench' },
      { key: 'has_alerts', label: 'Con Alertas', icon: 'mdi-alert-circle' },
    ],
  },
}))

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

vi.mock('vuetify', () => ({
  useDisplay: vi.fn(() => ({ mobile: { value: false } })),
}))

vi.mock('@/services/mock-gps-provider.js', () => ({
  MockGpsProvider: vi.fn().mockImplementation(() => ({
    startSimulation: vi.fn(),
    stopSimulation: vi.fn(),
  })),
}))

vi.mock('@/composables/use-settings.js', () => ({
  useSettings: vi.fn(() => ({
    companySettings: {
      gps_provider: '',
      mock_gps_enabled: false,
    },
  })),
}))

function createWrapper() {
  return mount(FleetMap, {
    global: {
      stubs: {
        MapControls: true,
        VehicleDetailPanel: true,
      },
    },
  })
}

describe('FleetMap.vue — estructura y estados UI', () => {
  beforeEach(() => {
    global.google = {
      maps: {
        Map: vi.fn().mockImplementation(function () {
          this.setCenter = mockSetCenter
          this.setZoom = mockSetZoom
        }),
        Marker: vi.fn().mockImplementation(function () {
          this.setPosition = mockSetPosition
          this.setMap = mockSetMap
          this.addListener = mockAddListener
        }),
        SymbolPath: { CIRCLE: 0 },
        event: {
          clearInstanceListeners: mockClearListeners,
        },
        marker: {
          PinElement: vi.fn().mockImplementation(function () {
            this.element = document.createElement('div')
          }),
          AdvancedMarkerElement: vi.fn().mockImplementation(function () {
            this.addListener = mockAddListener
          }),
        },
      },
    }
    vi.clearAllMocks()
    mockIsGpsConnected.value = true
    mockFleetMapState.isLoading = false
    mockFleetMapState.isDetailOpen = false
    mockFleetMapState.selectedVehicle = null
    mockFleetMapState.activeFilter = 'all'
    mockIsMockGpsEnabled.value = false
  })

  it('debería renderizar el contenedor del mapa con atributos ARIA', async () => {
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    const mapContainer = wrapper.find('[data-testid="fleet-map"]')
    expect(mapContainer.exists()).toBe(true)
    expect(mapContainer.attributes('role')).toBe('application')
    expect(mapContainer.attributes('aria-label')).toBe('Mapa de flota en tiempo real')
  })

  it('debería mostrar controles de mapa', async () => {
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    const controls = wrapper.findComponent({ name: 'MapControls' })
    expect(controls.exists()).toBe(true)
  })

  it('debería mostrar overlay de carga cuando isLoading es true', async () => {
    mockFleetMapState.isLoading = true
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    const overlay = wrapper.find('[data-testid="map-loading"]')
    expect(overlay.exists()).toBe(true)
  })

  it('debería ocultar overlay de carga cuando isLoading es false', async () => {
    mockFleetMapState.isLoading = false
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    const overlay = wrapper.find('[data-testid="map-loading"]')
    expect(overlay.exists()).toBe(false)
  })

  it('debería mostrar advertencia GPS cuando isGpsConnected es false', async () => {
    mockIsGpsConnected.value = false
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    const warning = wrapper.find('[data-testid="gps-mock-disabled"]')
    expect(warning.exists()).toBe(true)
  })

  it('debería ocultar advertencia GPS cuando isGpsConnected es true', async () => {
    mockIsGpsConnected.value = true
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    const warning = wrapper.find('[data-testid="gps-mock-disabled"]')
    expect(warning.exists()).toBe(false)
  })

  it('debería mostrar panel de detalle cuando se selecciona un vehículo', async () => {
    mockFleetMapState.isDetailOpen = true
    mockFleetMapState.selectedVehicle = {
      vehicle_id: 'v1',
      vehicles: { plate: 'ABC-1234', status: 'on_route' },
      latitude: 40.4168,
      longitude: -3.7038,
    }
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    const panel = wrapper.find('[data-testid="detail-panel"]')
    expect(panel.exists()).toBe(true)
    expect(panel.attributes('role')).toBe('complementary')
    expect(panel.attributes('aria-label')).toBe('Detalle del vehículo')
  })

  it('debería ocultar panel de detalle cuando no hay vehículo seleccionado', async () => {
    mockFleetMapState.isDetailOpen = false
    mockFleetMapState.selectedVehicle = null
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    const panel = wrapper.find('[data-testid="detail-panel"]')
    expect(panel.exists()).toBe(false)
  })

  it('debería limpiar listeners y canales al desmontar', async () => {
    const wrapper = createWrapper()
    await wrapper.vm.$nextTick()

    wrapper.unmount()

    expect(mockClearListeners).toHaveBeenCalled()
  })
})
