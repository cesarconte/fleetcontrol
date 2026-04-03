/**
 * FleetControl — GPS Math Utilities
 *
 * Pure functions for GPS position calculations: Haversine distance,
 * linear interpolation, heading calculation, and Gaussian noise.
 *
 * @see docs/plans/feature-mapa-plan.md
 */

const EARTH_RADIUS_KM = 6371

/**
 * Calcula distancia entre dos puntos (fórmula Haversine).
 * @param {{ lat: number, lng: number }} a
 * @param {{ lat: number, lng: number }} b
 * @returns {number} Distancia en km
 */
export function haversine(a, b) {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

/**
 * Interpola linealmente entre dos puntos.
 * @param {{ lat: number, lng: number }} from
 * @param {{ lat: number, lng: number }} to
 * @param {number} progress - 0 a 1
 * @returns {{ lat: number, lng: number }}
 */
export function interpolate(from, to, progress) {
  return {
    lat: from.lat + (to.lat - from.lat) * progress,
    lng: from.lng + (to.lng - from.lng) * progress,
  }
}

/**
 * Calcula heading (rumbo) entre dos puntos en grados (0-360).
 * @param {{ lat: number, lng: number }} from
 * @param {{ lat: number, lng: number }} to
 * @returns {number} Heading en grados
 */
export function calculateHeading(from, to) {
  const dLng = toRad(to.lng - from.lng)
  const lat1 = toRad(from.lat)
  const lat2 = toRad(to.lat)

  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)

  let heading = toDeg(Math.atan2(y, x))
  if (heading < 0) heading += 360
  return heading
}

/**
 * Genera número aleatorio con distribución normal (media 0, desviación 1).
 * Box-Muller transform.
 * @returns {number}
 */
export function gaussianRandom() {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

function toRad(deg) {
  return (deg * Math.PI) / 180
}

function toDeg(rad) {
  return (rad * 180) / Math.PI
}
