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
    preventivo: 'info',
    correctivo: 'warning',
  }
  return map[tipo] ?? 'grey'
}

/**
 * Get Spanish label for maintenance type.
 * @param {string} tipo
 * @returns {string}
 */
export function getTipoLabel(tipo) {
  const map = {
    preventivo: 'Preventivo',
    correctivo: 'Correctivo',
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
    pendiente: 'info',
    en_curso: 'warning',
    completada: 'success',
    cancelada: 'grey',
  }
  return map[status] ?? 'grey'
}

/**
 * Get Spanish label for maintenance status.
 * @param {string} status
 * @returns {string}
 */
export function getMantenimientoStatusLabel(status) {
  const map = {
    pendiente: 'Pendiente',
    en_curso: 'En curso',
    completada: 'Completada',
    cancelada: 'Cancelada',
  }
  return map[status] ?? status
}
