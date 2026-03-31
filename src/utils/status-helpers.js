/**
 * FleetControl — Status Helpers
 *
 * Shared status color and label mappings for all domains.
 * Each domain has its own color/label map reflecting the DB enum values.
 */

/** @type {Record<string, Record<string, string>>} */
const STATUS_COLORS = {
  vehiculo: {
    active: 'success',
    on_route: 'info',
    in_maintenance: 'warning',
    inactive: 'grey',
    decommissioned: 'grey-darken-2',
  },
  conductor: {
    active: 'success',
    temporary_leave: 'warning',
    permanently_off: 'grey',
  },
  ruta: {
    planned: 'info',
    in_progress: 'success',
    completed: 'grey',
    delayed: 'warning',
    cancelled: 'grey-darken-2',
  },
  mantenimiento: {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'grey',
  },
  documento: {
    valid: 'success',
    expiring_soon: 'warning',
    critical: 'error',
    expired: 'grey-darken-2',
    sin_fecha: 'grey',
    not_applicable: 'grey',
  },
}

/** @type {Record<string, Record<string, string>>} */
const STATUS_LABELS = {
  vehiculo: {
    active: 'Activo',
    on_route: 'En ruta',
    in_maintenance: 'En mantenimiento',
    inactive: 'Inactivo',
    decommissioned: 'Dado de baja',
  },
  conductor: {
    active: 'Activo',
    temporary_leave: 'Baja temporal',
    permanently_off: 'Baja definitiva',
  },
  ruta: {
    planned: 'Planificada',
    in_progress: 'En curso',
    completed: 'Completada',
    delayed: 'Retrasada',
    cancelled: 'Cancelada',
  },
  mantenimiento: {
    pending: 'Pendiente',
    in_progress: 'En curso',
    completed: 'Completada',
    cancelled: 'Cancelada',
  },
  documento: {
    valid: 'En regla',
    expiring_soon: 'Próximo a vencer',
    critical: 'Crítico',
    expired: 'Vencido',
    sin_fecha: 'Sin fecha',
    not_applicable: 'No aplica',
  },
}

/**
 * Get Vuetify color for a status in a given domain.
 * @param {string} status
 * @param {'vehiculo'|'conductor'|'ruta'|'mantenimiento'|'documento'} domain
 * @returns {string}
 */
export function getStatusColor(status, domain) {
  return STATUS_COLORS[domain]?.[status] ?? 'grey'
}

/**
 * Get label for a status in a given domain.
 * @param {string} status
 * @param {'vehiculo'|'conductor'|'ruta'|'mantenimiento'|'documento'} domain
 * @returns {string}
 */
export function getStatusLabel(status, domain) {
  return STATUS_LABELS[domain]?.[status] ?? status
}

/**
 * Get DGT badge color.
 * @param {string|null} badge
 * @returns {string}
 */
export function getDgtColor(badge) {
  const map = {
    0: 'green-darken-2',
    eco: 'green',
    c: 'orange',
    b: 'blue-grey',
  }
  return map[badge] ?? 'grey'
}

/**
 * Get DGT badge label.
 * @param {string|null} badge
 * @returns {string}
 */
export function getDgtLabel(badge) {
  const map = {
    0: 'Cero emisiones',
    eco: 'ECO',
    c: 'C',
    b: 'B',
    sin_etiqueta: 'Sin etiqueta',
  }
  return map[badge] ?? badge ?? '—'
}
