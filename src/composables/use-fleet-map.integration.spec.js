/**
 * @vitest-environment jsdom
 *
 * Tests de integración realtime para use-fleet-map.
 * Simula el comportamiento del canal Supabase Realtime
 * para verificar que los eventos INSERT/UPDATE/ERROR
 * actualizan correctamente el estado del mapa.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  registeredHandlers: {},
  mockSubscribe: vi.fn(),
  mockUnsubscribe: vi.fn(),
  mockConnectionStatus: { value: 'connected' },
  mockError: { value: null },
  mockGetFleetPositions: vi.fn(),
}))

vi.mock('@/services/api-vehicle-positions.js', () => ({
  get apiVehiclePositions() {
    return {
      getFleetPositions: mocks.mockGetFleetPositions,
    }
  },
}))

vi.mock('@/composables/use-realtime.js', () => ({
  useRealtime: vi.fn(() => ({
    subscribe: mocks.mockSubscribe,
    unsubscribe: mocks.mockUnsubscribe,
    connectionStatus: mocks.mockConnectionStatus,
    error: mocks.mockError,
  })),
  _resetState: vi.fn(),
}))

vi.mock('@/composables/use-vehicles.js', () => ({
  useVehicles: vi.fn(() => ({
    items: { value: [] },
    isLoading: { value: false },
    error: { value: null },
    fetch: vi.fn(),
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

describe('use-fleet-map — integración realtime', () => {
  const mockPositions = [
    {
      vehicle_id: 'v1',
      latitude: 40.4168,
      longitude: -3.7038,
      current_speed_kmh: 85,
      vehicles: { id: 'v1', plate: 'ABC-1234', status: 'on_route' },
    },
    {
      vehicle_id: 'v2',
      latitude: 41.3851,
      longitude: 2.1734,
      current_speed_kmh: 0,
      vehicles: { id: 'v2', plate: 'DEF-5678', status: 'in_maintenance' },
    },
  ]

  beforeEach(async () => {
    vi.resetModules()
    mocks.registeredHandlers = {}
    mocks.mockSubscribe.mockImplementation((table, handler) => {
      mocks.registeredHandlers[table] = handler
    })
    mocks.mockUnsubscribe.mockImplementation(table => {
      delete mocks.registeredHandlers[table]
    })
    mocks.mockConnectionStatus.value = 'connected'
    mocks.mockError.value = null
    // Reset mock to default behavior
    mocks.mockGetFleetPositions.mockReset()
    mocks.mockGetFleetPositions.mockResolvedValue(mockPositions)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('debería suscribirse a vehicle_positions al llamar subscribeToRealtime', async () => {
    const { useFleetMap } = await import('@/composables/use-fleet-map.js')
    const fleetMap = useFleetMap()

    await fleetMap.fetch()
    const cleanup = fleetMap.subscribeToRealtime()

    expect(mocks.registeredHandlers['vehicle_positions']).toBeDefined()
    expect(typeof mocks.registeredHandlers['vehicle_positions']).toBe('function')

    cleanup()
  })

  it('debería hacer refetch al recibir INSERT en vehicle_positions', async () => {
    const { useFleetMap } = await import('@/composables/use-fleet-map.js')
    const fleetMap = useFleetMap()

    await fleetMap.fetch()
    await vi.dynamicImportSettled()

    expect(fleetMap.vehicles.value).toHaveLength(2)

    const newPositions = [
      ...mockPositions,
      {
        vehicle_id: 'v3',
        latitude: 37.3891,
        longitude: -5.9845,
        current_speed_kmh: 90,
        vehicles: { id: 'v3', plate: 'GHI-9012', status: 'on_route' },
      },
    ]
    mocks.mockGetFleetPositions.mockResolvedValueOnce(newPositions)

    const cleanup = fleetMap.subscribeToRealtime()
    const handler = mocks.registeredHandlers['vehicle_positions']
    expect(handler).toBeDefined()
    await handler({
      eventType: 'INSERT',
      new: { vehicle_id: 'v3', latitude: 37.3891, longitude: -5.9845 },
      old: null,
      table: 'vehicle_positions',
    })

    await vi.dynamicImportSettled()

    expect(mocks.mockGetFleetPositions).toHaveBeenCalledTimes(2)
    expect(fleetMap.vehicles.value).toHaveLength(3)

    cleanup()
  })

  it('debería actualizar vehículo al recibir UPDATE en vehicles (cambio de estado)', async () => {
    const { useFleetMap } = await import('@/composables/use-fleet-map.js')
    const fleetMap = useFleetMap()

    await fleetMap.fetch()
    await vi.dynamicImportSettled()

    const v1 = fleetMap.vehicles.value.find(v => v.vehicle_id === 'v1')
    expect(v1.vehicles.status).toBe('on_route')

    const updatedPositions = mockPositions.map(v =>
      v.vehicle_id === 'v1' ? { ...v, vehicles: { ...v.vehicles, status: 'in_maintenance' } } : v,
    )
    mocks.mockGetFleetPositions.mockResolvedValueOnce(updatedPositions)

    const cleanup = fleetMap.subscribeToRealtime()
    const handler = mocks.registeredHandlers['vehicle_positions']
    await handler({
      eventType: 'UPDATE',
      new: { vehicle_id: 'v1', status: 'in_maintenance' },
      old: { vehicle_id: 'v1', status: 'on_route' },
      table: 'vehicles',
    })

    await vi.dynamicImportSettled()

    expect(mocks.mockGetFleetPositions).toHaveBeenCalledTimes(2)
    const updatedV1 = fleetMap.vehicles.value.find(v => v.vehicle_id === 'v1')
    expect(updatedV1.vehicles.status).toBe('in_maintenance')

    cleanup()
  })

  it('debería filtrar correctamente después de refetch por realtime', async () => {
    const { useFleetMap } = await import('@/composables/use-fleet-map.js')
    const fleetMap = useFleetMap()

    await fleetMap.fetch()
    await vi.dynamicImportSettled()

    expect(fleetMap.vehicles.value).toHaveLength(2)
    expect(fleetMap.vehicles.value[0].vehicles?.status).toBe('on_route')

    fleetMap.setFilter('on_route')
    expect(fleetMap.filteredVehicles.value).toHaveLength(1)

    const newPositions = [
      ...mockPositions,
      {
        vehicle_id: 'v3',
        latitude: 37.3891,
        longitude: -5.9845,
        vehicles: { id: 'v3', plate: 'GHI-9012', status: 'on_route' },
      },
    ]
    mocks.mockGetFleetPositions.mockResolvedValueOnce(newPositions)

    const cleanup = fleetMap.subscribeToRealtime()
    const handler = mocks.registeredHandlers['vehicle_positions']
    await handler({
      eventType: 'INSERT',
      new: { vehicle_id: 'v3' },
      table: 'vehicle_positions',
    })

    await vi.dynamicImportSettled()

    expect(fleetMap.filteredVehicles.value).toHaveLength(2)
    expect(fleetMap.filteredVehicles.value.every(v => v.vehicles.status === 'on_route')).toBe(true)

    cleanup()
  })

  it('debería manejar CHANNEL_ERROR y establecer estado de error', async () => {
    const { useFleetMap } = await import('@/composables/use-fleet-map.js')
    const fleetMap = useFleetMap()

    await fleetMap.fetch()
    fleetMap.subscribeToRealtime()

    expect(fleetMap.error.value).toBeNull()
  })

  it('debería limpiar suscripción al llamar cleanup', async () => {
    const { useFleetMap } = await import('@/composables/use-fleet-map.js')
    const fleetMap = useFleetMap()

    await fleetMap.fetch()
    const cleanup = fleetMap.subscribeToRealtime()

    expect(mocks.registeredHandlers['vehicle_positions']).toBeDefined()

    cleanup()

    expect(mocks.mockUnsubscribe).toHaveBeenCalledWith('vehicle_positions')
  })

  it('debería mantener filteredVehicles consistente tras múltiples eventos realtime', async () => {
    const { useFleetMap } = await import('@/composables/use-fleet-map.js')
    const fleetMap = useFleetMap()

    await fleetMap.fetch()
    await vi.dynamicImportSettled()

    const cleanup = fleetMap.subscribeToRealtime()
    const handler = mocks.registeredHandlers['vehicle_positions']

    const positions1 = [
      ...mockPositions,
      {
        vehicle_id: 'v3',
        latitude: 39.4699,
        longitude: -0.3763,
        vehicles: { id: 'v3', plate: 'JKL-3456', status: 'on_route' },
      },
    ]
    mocks.mockGetFleetPositions.mockResolvedValueOnce(positions1)

    await handler({ eventType: 'INSERT', new: { vehicle_id: 'v3' }, table: 'vehicle_positions' })
    await vi.dynamicImportSettled()

    expect(fleetMap.vehicles.value).toHaveLength(3)

    const positions2 = [
      ...positions1,
      {
        vehicle_id: 'v4',
        latitude: 43.263,
        longitude: -2.935,
        vehicles: { id: 'v4', plate: 'MNO-7890', status: 'active' },
      },
    ]
    mocks.mockGetFleetPositions.mockResolvedValueOnce(positions2)

    await handler({ eventType: 'INSERT', new: { vehicle_id: 'v4' }, table: 'vehicle_positions' })
    await vi.dynamicImportSettled()

    expect(fleetMap.vehicles.value).toHaveLength(4)
    expect(fleetMap.filteredVehicles.value).toHaveLength(4)

    fleetMap.setFilter('on_route')
    expect(fleetMap.filteredVehicles.value).toHaveLength(2)

    cleanup()
  })
})
