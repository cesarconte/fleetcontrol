/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@googlemaps/js-api-loader', () => {
  const MockLoader = vi.fn()
  return { Loader: MockLoader }
})

describe('load-google-maps.js', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('debería cargar Google Maps con la API key correcta', async () => {
    const { Loader } = await import('@googlemaps/js-api-loader')
    const mockLoad = vi.fn().mockResolvedValue(undefined)
    Loader.mockImplementation(function () {
      return { load: mockLoad }
    })

    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', 'test-api-key')

    const { loadGoogleMaps } = await import('@/services/load-google-maps.js')
    await loadGoogleMaps()

    expect(Loader).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      version: 'weekly',
      libraries: ['places', 'marker'],
    })
    expect(mockLoad).toHaveBeenCalled()
  })

  it('debería cachear el resultado (singleton)', async () => {
    const { Loader } = await import('@googlemaps/js-api-loader')
    const mockLoad = vi.fn().mockResolvedValue(undefined)
    Loader.mockImplementation(function () {
      return { load: mockLoad }
    })

    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', 'test-api-key')

    const { loadGoogleMaps } = await import('@/services/load-google-maps.js')
    await loadGoogleMaps()
    await loadGoogleMaps()

    expect(Loader).toHaveBeenCalledTimes(1)
    expect(mockLoad).toHaveBeenCalledTimes(1)
  })

  it('debería lanzar error si no hay API key', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', '')

    const { loadGoogleMaps, resetGoogleMapsCache } = await import('@/services/load-google-maps.js')
    resetGoogleMapsCache()
    await expect(loadGoogleMaps()).rejects.toThrow()
  })

  it('debería propagar errores de carga', async () => {
    const { Loader } = await import('@googlemaps/js-api-loader')
    const mockLoad = vi.fn().mockRejectedValue(new Error('Network error'))
    Loader.mockImplementation(function () {
      return { load: mockLoad }
    })

    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', 'test-api-key')

    const { loadGoogleMaps, resetGoogleMapsCache } = await import('@/services/load-google-maps.js')
    resetGoogleMapsCache()
    await expect(loadGoogleMaps()).rejects.toThrow('Network error')
  })

  it('debería resetear el cache con resetGoogleMapsCache', async () => {
    const { Loader } = await import('@googlemaps/js-api-loader')
    const mockLoad = vi.fn().mockResolvedValue(undefined)
    Loader.mockImplementation(function () {
      return { load: mockLoad }
    })

    vi.stubEnv('VITE_GOOGLE_MAPS_KEY', 'test-api-key')

    const { loadGoogleMaps, resetGoogleMapsCache } = await import('@/services/load-google-maps.js')
    await loadGoogleMaps()
    expect(Loader).toHaveBeenCalledTimes(1)

    resetGoogleMapsCache()
    await loadGoogleMaps()
    expect(Loader).toHaveBeenCalledTimes(2)
  })
})
