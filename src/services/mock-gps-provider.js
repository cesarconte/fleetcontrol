/**
 * FleetControl — Mock GPS Provider
 *
 * Genera posiciones GPS simuladas realistas para desarrollo.
 * Interpola entre origen y destino de rutas activas con ruido gaussiano.
 * Lee rutas activas de la BD para generar posiciones realistas.
 *
 * @see docs/plans/feature-mapa-plan.md — Tarea 1.4, Tarea 3
 */

import { GpsProvider } from './gps-provider.js'
import { GPS_UPDATE_INTERVAL_MS } from '@/constants/gps-config.js'
import { getCityCoords } from '@/constants/city-coords.js'
import { haversine, interpolate, calculateHeading, gaussianRandom } from '@/utils/gps-math.js'
import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

/**
 * Resuelve coordenadas desde nombre de ciudad.
 * @param {string} cityName
 * @returns {{ lat: number, lng: number }}
 */
function resolveCoords(cityName) {
  const coords = getCityCoords(cityName)
  if (coords) return coords
  // Fallback: Madrid + offset aleatorio para ciudades no mapeadas
  return {
    lat: 40.4168 + (Math.random() - 0.5) * 4,
    lng: -3.7038 + (Math.random() - 0.5) * 4,
  }
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
    this._cachedRoutes = []
    this._lastRouteFetch = 0
    this._routeFetchIntervalMs = 60000 // Refetch routes cada 1 min
  }

  get isRunning() {
    return this._isRunning
  }

  /**
   * Genera una posición simulada para un vehículo en ruta.
   * @param {{ origin: {lat, lng}, dest: {lat, lng}, distance_km: number }} route
   * @param {number} progress - 0 a 1
   * @returns {object} Posición simulada
   */
  _generatePosition(route, progress) {
    const origin = route.origin
    const dest = route.dest
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
   * @throws {Error} Si no hay rutas activas configuradas
   */
  startSimulation() {
    if (this._isRunning) return

    this._isRunning = true
    this._intervalId = setInterval(() => {
      this._tick()
    }, this.updateIntervalMs)

    // Fetch routes immediately
    this._refreshRoutes()
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
   * Refresca rutas activas desde la BD.
   * @private
   */
  async _refreshRoutes() {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('id, vehicle_id, origin_city, destination_city, distance_total_km')
        .in('status', ['planned', 'in_progress'])

      if (error) throw mapSupabaseError(error)

      this._cachedRoutes = (data || []).map(route => ({
        id: route.id,
        vehicle_id: route.vehicle_id,
        origin: resolveCoords(route.origin_city),
        dest: resolveCoords(route.destination_city),
        distance_km: route.distance_total_km
          ? Number(route.distance_total_km)
          : haversine(resolveCoords(route.origin_city), resolveCoords(route.destination_city)),
      }))

      // Initialize progress for new routes
      for (const route of this._cachedRoutes) {
        if (!this._vehicleProgress.has(route.vehicle_id)) {
          this._vehicleProgress.set(route.vehicle_id, 0)
        }
      }

      // Remove progress for completed routes
      const activeVehicleIds = new Set(this._cachedRoutes.map(r => r.vehicle_id))
      for (const vehicleId of this._vehicleProgress.keys()) {
        if (!activeVehicleIds.has(vehicleId)) {
          this._vehicleProgress.delete(vehicleId)
        }
      }

      this._lastRouteFetch = Date.now()
    } catch (err) {
      console.error('MockGpsProvider: Error fetching routes:', err.message)
    }
  }

  /**
   * Tick de simulación — avanza posiciones y las guarda.
   * @private
   */
  _tick() {
    // Refresh routes periodically
    if (Date.now() - this._lastRouteFetch > this._routeFetchIntervalMs) {
      this._refreshRoutes()
    }

    const routes = this._cachedRoutes
    if (routes.length === 0) return

    for (const route of routes) {
      const progress = this._vehicleProgress.get(route.vehicle_id) || 0
      if (progress >= 1) {
        this._vehicleProgress.delete(route.vehicle_id)
        continue
      }

      const totalDistance = route.distance_km
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
    return this._cachedRoutes
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
