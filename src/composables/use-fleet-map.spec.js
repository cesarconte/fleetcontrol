/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/api-vehicle-positions.js', () => ({
  apiVehiclePositions: {
    getFleetPositions: vi.fn(),
  },
}))

vi.mock('@/composables/use-realtime.js', () => ({
  useRealtime: vi.fn(() => ({
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    isConnected: { value: true },
  })),
}))

vi.mock('@/composables/use-vehicles.js', () => ({
  useVehicles: vi.fn(() => ({
    items: { value: [] },
    isLoading: { value: false },
    error: { value: null },
    fetch: vi.fn(),
  })),
}))

describe('use-fleet-map.js', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería inicializar con estado por defecto', async () => {
    const { useFleetMap } = await import('@/composables/use-fleet-map.js')
    const {
      vehicles,
      isLoading,
      error,
      activeFilter,
      selectedVehicle,
      isDetailOpen,
      isGpsConnected,
    } = useFleetMap()

    expect(vehicles.value).toEqual([])
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(activeFilter.value).toBe('all')
    expect(selectedVehicle.value).toBeNull()
    expect(isDetailOpen.value).toBe(false)
    expect(isGpsConnected.value).toBe(false) // computed, false when vehicles is empty
  })

  it('debería tener filteredVehicles que filtra por activeFilter', async () => {
    const { apiVehiclePositions } = await import('@/services/api-vehicle-positions.js')
    apiVehiclePositions.getFleetPositions.mockResolvedValue([
      { vehicle_id: 'v1', vehicles: { id: 'v1', plate: 'ABC', status: 'on_route' } },
      { vehicle_id: 'v2', vehicles: { id: 'v2', plate: 'DEF', status: 'in_maintenance' } },
    ])

    const { useFleetMap } = await import('@/composables/use-fleet-map.js')
    const { filteredVehicles, setFilter, fetch } = useFleetMap()

    await fetch()
    await vi.dynamicImportSettled()

    expect(filteredVehicles.value).toHaveLength(2)

    setFilter('on_route')
    expect(filteredVehicles.value).toHaveLength(1)
    expect(filteredVehicles.value[0].vehicles.status).toBe('on_route')
  })

  it('debería seleccionar vehículo y abrir panel detalle', async () => {
    const { useFleetMap } = await import('@/composables/use-fleet-map.js')
    const { selectedVehicle, isDetailOpen, selectVehicle, closeDetail } = useFleetMap()

    const vehicle = { id: 'v1', plate: 'ABC' }
    selectVehicle(vehicle)

    expect(selectedVehicle.value).toEqual(vehicle)
    expect(isDetailOpen.value).toBe(true)

    closeDetail()
    expect(isDetailOpen.value).toBe(false)
    expect(selectedVehicle.value).toBeNull()
  })

  it('debería manejar error en fetch', async () => {
    const { apiVehiclePositions } = await import('@/services/api-vehicle-positions.js')
    apiVehiclePositions.getFleetPositions.mockRejectedValue(new Error('Network error'))

    const { useFleetMap } = await import('@/composables/use-fleet-map.js')
    const { error, fetch } = useFleetMap()

    await fetch()

    expect(error.value).toBe('Network error')
  })
})
