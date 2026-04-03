/**
 * FleetControl — Mock GPS Provider
 *
 * Genera posiciones GPS simuladas realistas para desarrollo.
 * Interpola entre origen y destino de rutas activas con ruido gaussiano.
 *
 * @see docs/plans/feature-mapa-plan.md — Tarea 1.4
 */

import { GpsProvider } from './gps-provider.js'
import { GPS_UPDATE_INTERVAL_MS } from '@/constants/gps-config.js'

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

function toRad(deg) {
  return (deg * Math.PI) / 180
}

function toDeg(rad) {
  return (rad * 180) / Math.PI
}

/**
 * Genera número aleatorio con distribución normal (media 0, desviación 1).
 * @returns {number}
 */
function gaussianRandom() {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

/**
 * Mock GPS Provider — extiende GpsProvider.
 * Genera posiciones simuladas realistas para desarrollo.
 */
export class MockGpsProvider extends GpsProvider {
  constructor() {
    super()
    this.updateIntervalMs = GPS_UPDATE_INTERVAL_MS
    this._isRunning = false
    this._intervalId = null
    this._vehicleProgress = new Map()
    this._positions = []
  }

  get isRunning() {
    return this._isRunning
  }

  /**
   * Genera una posición simulada para un vehículo en ruta.
   * @param {{ origin_lat: number, origin_lng: number, dest_lat: number, dest_lng: number }} route
   * @param {number} progress - 0 a 1
   * @returns {object} Posición simulada
   */
  _generatePosition(route, progress) {
    const origin = { lat: route.origin_lat, lng: route.origin_lng }
    const dest = { lat: route.dest_lat, lng: route.dest_lng }
    const point = interpolate(origin, dest, progress)

    const latNoise = 0.0001 * gaussianRandom()
    const lngNoise = 0.0001 * gaussianRandom()
    const speed = Math.min(120, Math.max(0, 85 + gaussianRandom() * 5))
    const heading = calculateHeading(origin, dest)

    return {
      latitude: Math.round((point.lat + latNoise) * 1e6) / 1e6,
      longitude: Math.round((point.lng + lngNoise) * 1e6) / 1e6,
      speed_kph: Math.round(speed * 100) / 100,
      heading_degrees: Math.round(heading * 100) / 100,
      ignition_on: speed > 0,
      gps_fix_type: 'GPS_3D',
      provider: 'mock',
      recorded_at: new Date().toISOString(),
    }
  }

  /**
   * Inicia la simulación GPS.
   * Genera posiciones periódicamente para vehículos en ruta.
   */
  startSimulation() {
    if (this._isRunning) return

    this._isRunning = true
    this._intervalId = setInterval(() => {
      this._tick()
    }, this.updateIntervalMs)
  }

  /**
   * Detiene la simulación GPS.
   */
  stopSimulation() {
    this._isRunning = false
    if (this._intervalId) {
      clearInterval(this._intervalId)
      this._intervalId = null
    }
  }

  /**
   * Tick de simulación — avanza posiciones y las guarda.
   * @private
   */
  _tick() {
    const routes = this._getActiveRoutes()
    for (const route of routes) {
      const progress = this._vehicleProgress.get(route.vehicle_id) || 0
      if (progress >= 1) {
        this._vehicleProgress.delete(route.vehicle_id)
        continue
      }

      const totalDistance = haversine(
        { lat: route.origin_lat, lng: route.origin_lng },
        { lat: route.dest_lat, lng: route.dest_lng },
      )
      const estimatedSteps = totalDistance / 85 / (this.updateIntervalMs / 1000 / 3600)
      const step = 1 / Math.max(estimatedSteps, 1)
      const newProgress = progress + step

      const position = this._generatePosition(route, newProgress)
      this._positions.push({ ...position, vehicle_id: route.vehicle_id })
      this._vehicleProgress.set(route.vehicle_id, newProgress)
    }
  }

  /**
   * Obtiene rutas activas simuladas.
   * @private
   * @returns {Array}
   */
  _getActiveRoutes() {
    return []
  }

  async getPositions(vehicleId, { from, to }) {
    return this._positions.filter(
      p =>
        p.vehicle_id === vehicleId &&
        new Date(p.recorded_at) >= new Date(from) &&
        new Date(p.recorded_at) <= new Date(to),
    )
  }

  async getLatestPosition(vehicleId) {
    const vehiclePositions = this._positions.filter(p => p.vehicle_id === vehicleId)
    return vehiclePositions.length > 0 ? vehiclePositions[vehiclePositions.length - 1] : null
  }

  async getFleetPositions() {
    const latest = new Map()
    for (const pos of this._positions) {
      latest.set(pos.vehicle_id, pos)
    }
    return Array.from(latest.values())
  }

  async ingestPosition(data) {
    const position = {
      ...data,
      recorded_at: data.recorded_at || new Date().toISOString(),
      provider: data.provider || 'mock',
    }
    this._positions.push(position)
    return position
  }

  async ingestBatch(positions) {
    const created = positions.map(data => ({
      ...data,
      recorded_at: data.recorded_at || new Date().toISOString(),
      provider: data.provider || 'mock',
    }))
    this._positions.push(...created)
    return created
  }
}
