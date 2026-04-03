/**
 * FleetControl — Google Maps Loader
 *
 * Carga lazy de Google Maps Platform con caching singleton.
 * Usa @googlemaps/js-api-loader v2 (API funcional).
 *
 * @see docs/plans/feature-mapa-plan.md — Tarea 2.2
 */

import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

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

  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID

  setOptions({
    key: apiKey,
    v: 'weekly',
    libraries: ['places', 'marker'],
    ...(mapId && { mapId }),
  })

  googleMapsPromise = Promise.all([importLibrary('maps'), importLibrary('marker')])

  return googleMapsPromise
}

/**
 * Resetea el cache (útil para testing).
 */
export function resetGoogleMapsCache() {
  googleMapsPromise = null
}
