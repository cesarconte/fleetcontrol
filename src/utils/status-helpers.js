/**
 * FleetControl — Status Helpers
 *
 * Shared status color and label mappings for all domains.
 * Each domain has its own color/label map reflecting the DB enum values.
 */

/** @type {Record<string, Record<string, string>>} */
const STATUS_COLORS = {
  vehiculo: {
    activo: 'success',
    en_ruta: 'info',
    en_mantenimiento: 'warning',
    inactivo: 'grey',
    dado_de_baja: 'grey-darken-2',
  },
  conductor: {
    activo: 'success',
    baja_temporal: 'warning',
    baja_definitiva: 'grey',
  },
  ruta: {
    planificada: 'info',
    en_curso: 'success',
    completada: 'grey',
    retrasada: 'warning',
    cancelada: 'grey-darken-2',
  },
  mantenimiento: {
    pendiente: 'info',
    en_curso: 'warning',
    completada: 'success',
    cancelada: 'grey',
  },
  documento: {
    en_regla: 'success',
    proximo_a_vencer: 'warning',
    critico: 'error',
    vencido: 'grey-darken-2',
    sin_fecha: 'grey',
    no_aplica: 'grey',
  },
}

/** @type {Record<string, Record<string, string>>} */
const STATUS_LABELS = {
  vehiculo: {
    activo: 'Activo',
    en_ruta: 'En ruta',
    en_mantenimiento: 'En mantenimiento',
    inactivo: 'Inactivo',
    dado_de_baja: 'Dado de baja',
  },
  conductor: {
    activo: 'Activo',
    baja_temporal: 'Baja temporal',
    baja_definitiva: 'Baja definitiva',
  },
  ruta: {
    planificada: 'Planificada',
    en_curso: 'En curso',
    completada: 'Completada',
    retrasada: 'Retrasada',
    cancelada: 'Cancelada',
  },
  mantenimiento: {
    pendiente: 'Pendiente',
    en_curso: 'En curso',
    completada: 'Completada',
    cancelada: 'Cancelada',
  },
  documento: {
    en_regla: 'En regla',
    proximo_a_vencer: 'Próximo a vencer',
    critico: 'Crítico',
    vencido: 'Vencido',
    sin_fecha: 'Sin fecha',
    no_aplica: 'No aplica',
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
 * Get Spanish label for a status in a given domain.
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
