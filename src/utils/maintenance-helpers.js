/**
 * FleetControl — Maintenance Helpers
 *
 * Shared mappings for maintenance types.
 */

/**
 * Get color for maintenance type.
 * @param {string} tipo
 * @returns {string}
 */
export function getTipoColor(tipo) {
  const map = {
    preventive: 'info',
    corrective: 'warning',
  }
  return map[tipo] ?? 'grey'
}

/**
 * Get label for maintenance type.
 * @param {string} tipo
 * @returns {string}
 */
export function getTipoLabel(tipo) {
  const map = {
    preventive: 'Preventivo',
    corrective: 'Correctivo',
  }
  return map[tipo] ?? tipo
}

/**
 * Get color for maintenance status.
 * @param {string} status
 * @returns {string}
 */
export function getMantenimientoStatusColor(status) {
  const map = {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'grey',
  }
  return map[status] ?? 'grey'
}

/**
 * Get label for maintenance status.
 * @param {string} status
 * @returns {string}
 */
export function getMantenimientoStatusLabel(status) {
  const map = {
    pending: 'Pendiente',
    in_progress: 'En curso',
    completed: 'Completada',
    cancelled: 'Cancelada',
  }
  return map[status] ?? status
}
