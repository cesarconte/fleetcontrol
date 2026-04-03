/**
 * FleetControl — GPS Configuration Constants
 *
 * Proveedores GPS, tipos de fix y umbrales de telemática.
 *
 * @see AGENTS.md §11 — Legal Domain Rules
 * @see docs/plans/feature-mapa-plan.md — Tarea 1.2
 */

export const GPS_PROVIDERS = Object.freeze(['webfleet', 'frotcom', 'geotab', 'mock'])

export const GPS_FIX_TYPES = Object.freeze([
  'GPS_2D',
  'GPS_3D',
  'DEAD_RECKONING',
  'CELL_TOWER',
  'UNKNOWN',
])

export const GPS_UPDATE_INTERVAL_MS = 30000 // 30s (intervalo real de telemática)
export const GPS_OFFLINE_THRESHOLD_MS = 900000 // 15 min sin ping = offline
