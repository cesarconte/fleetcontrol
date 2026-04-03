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
import { mapSupabaseError } from '@/utils/error-map.js'

const TABLE = 'vehicle_positions'

/**
 * Obtiene el histórico de posiciones de un vehículo.
 * @param {string} vehicleId - ID del vehículo
 * @param {{ from: Date, to: Date }} range - Rango de fechas
 * @returns {Promise<Array>} Array de posiciones
 * @throws {Error} Si la consulta falla
 */
export async function getPositions(vehicleId, { from, to }) {
  if (!vehicleId) throw new Error('vehicleId es obligatorio')
  if (!from || !to) throw new Error('Rango de fechas obligatorio')

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('vehicle_id', vehicleId)
    .gte('recorded_at', from.toISOString())
    .lte('recorded_at', to.toISOString())
    .order('recorded_at', { ascending: true })

  if (error) throw new Error(mapSupabaseError(error))
  return data
}

/**
 * Obtiene la última posición conocida de un vehículo.
 * @param {string} vehicleId - ID del vehículo
 * @returns {Promise<object|null>} Última posición o null
 * @throws {Error} Si la consulta falla
 */
export async function getLatestPosition(vehicleId) {
  if (!vehicleId) throw new Error('vehicleId es obligatorio')

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('recorded_at', { ascending: false })
    .limit(1)

  if (error) throw new Error(mapSupabaseError(error))
  return data && data.length > 0 ? data[0] : null
}

/**
 * Obtiene las últimas posiciones de TODA la flota.
 * Usa rpc() con DISTINCT ON para evitar traer todas las filas.
 * @returns {Promise<Array>} Última posición por vehículo
 * @throws {Error} Si la consulta falla
 */
export async function getFleetPositions() {
  const { data, error } = await supabase.rpc('get_latest_fleet_positions')

  if (error) throw new Error(mapSupabaseError(error))
  return data || []
}

/**
 * Ingiere una posición individual.
 * El trigger de BD actualiza automáticamente la cache en vehicles.
 * @param {object} data - Datos de posición
 * @returns {Promise<object>} Posición creada
 * @throws {Error} Si la inserción falla
 */
export async function ingestPosition(data) {
  if (!data?.vehicle_id) throw new Error('vehicle_id es obligatorio')
  if (data.latitude == null || data.longitude == null) {
    throw new Error('latitude y longitude son obligatorios')
  }

  const { data: inserted, error } = await supabase.from(TABLE).insert(data).select().single()

  if (error) throw new Error(mapSupabaseError(error))
  return inserted
}

/**
 * Ingiere un lote de posiciones (batch).
 * @param {Array<object>} positions - Array de datos de posición
 * @returns {Promise<Array>} Posiciones creadas
 * @throws {Error} Si la inserción falla
 */
export async function ingestBatch(positions) {
  if (!positions || positions.length === 0) return []

  const validPositions = positions.filter(
    p => p?.vehicle_id && p.latitude != null && p.longitude != null,
  )
  if (validPositions.length === 0) return []

  const { data, error } = await supabase.from(TABLE).insert(validPositions)

  if (error) throw new Error(mapSupabaseError(error))
  return data || []
}

export const apiVehiclePositions = {
  getPositions,
  getLatestPosition,
  getFleetPositions,
  ingestPosition,
  ingestBatch,
}
