/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@googlemaps/js-api-loader', () => ({
  setOptions: vi.fn(),
  importLibrary: vi.fn().mockResolvedValue({}),
}))

describe('load-google-maps.js', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('debería cargar Google Maps con la API key correcta', async () => {
    const { setOptions, importLibrary } = await import('@googlemaps/js-api-loader')

    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', 'test-api-key')
    vi.stubEnv('VITE_GOOGLE_MAPS_MAP_ID', 'test-map-id')

    const { loadGoogleMaps } = await import('@/services/load-google-maps.js')
    await loadGoogleMaps()

    expect(setOptions).toHaveBeenCalledWith({
      key: 'test-api-key',
      v: 'weekly',
      libraries: ['places', 'marker'],
      mapId: 'test-map-id',
    })
    expect(importLibrary).toHaveBeenCalledWith('maps')
    expect(importLibrary).toHaveBeenCalledWith('marker')
  })

  it('debería cachear el resultado (singleton)', async () => {
    const { setOptions } = await import('@googlemaps/js-api-loader')

    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', 'test-api-key')

    const { loadGoogleMaps } = await import('@/services/load-google-maps.js')
    await loadGoogleMaps()
    await loadGoogleMaps()

    expect(setOptions).toHaveBeenCalledTimes(1)
  })

  it('debería lanzar error si no hay API key', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', '')

    const { loadGoogleMaps, resetGoogleMapsCache } = await import('@/services/load-google-maps.js')
    resetGoogleMapsCache()
    await expect(loadGoogleMaps()).rejects.toThrow()
  })

  it('debería propagar errores de carga', async () => {
    const { importLibrary } = await import('@googlemaps/js-api-loader')
    importLibrary.mockRejectedValueOnce(new Error('Network error'))

    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', 'test-api-key')

    const { loadGoogleMaps, resetGoogleMapsCache } = await import('@/services/load-google-maps.js')
    resetGoogleMapsCache()
    await expect(loadGoogleMaps()).rejects.toThrow('Network error')
  })

  it('debería resetear el cache con resetGoogleMapsCache', async () => {
    const { setOptions } = await import('@googlemaps/js-api-loader')

    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', 'test-api-key')

    const { loadGoogleMaps, resetGoogleMapsCache } = await import('@/services/load-google-maps.js')
    await loadGoogleMaps()
    expect(setOptions).toHaveBeenCalledTimes(1)

    resetGoogleMapsCache()
    await loadGoogleMaps()
    expect(setOptions).toHaveBeenCalledTimes(2)
  })
})
