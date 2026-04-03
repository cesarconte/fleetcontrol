/**
 * FleetControl — Google Maps Loader
 *
 * Carga lazy de Google Maps Platform con caching singleton.
 * Usa @googlemaps/js-api-loader para carga asíncrona.
 *
 * @see docs/plans/feature-mapa-plan.md — Tarea 2.2
 */

let googleMapsPromise = null

/**
 * Carga Google Maps de forma lazy con caching singleton.
 * @returns {Promise<void>}
 */
export async function loadGoogleMaps() {
  if (googleMapsPromise) return googleMapsPromise

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY
  if (!apiKey) {
    throw new Error('VITE_GOOGLE_MAPS_KEY no configurada')
  }

  const { Loader } = await import('@googlemaps/js-api-loader')

  googleMapsPromise = new Loader({
    apiKey,
    version: 'weekly',
    libraries: ['places', 'marker'],
  }).load()

  return googleMapsPromise
}

/**
 * Resetea el cache (útil para testing).
 */
export function resetGoogleMapsCache() {
  googleMapsPromise = null
}
