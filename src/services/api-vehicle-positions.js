/**
 * FleetControl — Vehicle Positions API Service
 *
 * Servicio para consultar e ingerir posiciones GPS.
 * Usa la tabla vehicle_positions (histórico) y actualiza
 * la cache en vehicles vía trigger de BD.
 *
 * @see docs/plans/feature-mapa-plan.md — Tarea 1.5
 */

import { supabase } from './supabase-client.js'

const TABLE = 'vehicle_positions'

/**
 * Obtiene el histórico de posiciones de un vehículo.
 * @param {string} vehicleId
 * @param {{ from: Date, to: Date }} range
 * @returns {Promise<Array>}
 */
export async function getPositions(vehicleId, { from, to }) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('vehicle_id', vehicleId)
    .gte('recorded_at', from.toISOString())
    .lte('recorded_at', to.toISOString())
    .order('recorded_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

/**
 * Obtiene la última posición conocida de un vehículo.
 * @param {string} vehicleId
 * @returns {Promise<object|null>}
 */
export async function getLatestPosition(vehicleId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('recorded_at', { ascending: false })
    .limit(1)

  if (error) throw new Error(error.message)
  return data && data.length > 0 ? data[0] : null
}

/**
 * Obtiene las últimas posiciones de TODA la flota.
 * Usa una subquery para obtener solo la última posición por vehículo.
 * @returns {Promise<Array>}
 */
export async function getFleetPositions() {
  const { data, error } = await supabase
    .from(TABLE)
    .select(
      `
      *,
      vehicles (
        id,
        plate,
        status,
        driver_id
      )
    `,
    )
    .order('recorded_at', { ascending: false })

  if (error) throw new Error(error.message)

  // Deduplicar: solo la última posición por vehicle_id
  const latest = new Map()
  for (const pos of data) {
    if (!latest.has(pos.vehicle_id)) {
      latest.set(pos.vehicle_id, pos)
    }
  }
  return Array.from(latest.values())
}

/**
 * Ingiere una posición individual.
 * El trigger de BD actualiza automáticamente la cache en vehicles.
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function ingestPosition(data) {
  const { data: inserted, error } = await supabase.from(TABLE).insert(data).select().single()

  if (error) throw new Error(error.message)
  return inserted
}

/**
 * Ingiere un lote de posiciones (batch).
 * @param {Array<object>} positions
 * @returns {Promise<Array>}
 */
export async function ingestBatch(positions) {
  if (!positions || positions.length === 0) return []

  const { data, error } = await supabase.from(TABLE).insert(positions)

  if (error) throw new Error(error.message)
  return data || []
}

export const apiVehiclePositions = {
  getPositions,
  getLatestPosition,
  getFleetPositions,
  ingestPosition,
  ingestBatch,
}
