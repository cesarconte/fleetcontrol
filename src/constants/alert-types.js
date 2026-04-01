/**
 * FleetControl — Alert Types
 *
 * Valid alert types and severities for the alerts table.
 * Each type maps to an alert_type enum value in the DB (English).
 * UI labels are in Spanish.
 *
 * Based on PRD §4.8 — Alertas y Notificaciones.
 *
 * @see LEGAL_LIMITS.ALERT_THRESHOLDS for configurable thresholds
 */

/** @param {object} obj */
function deepFreeze(obj) {
  Object.keys(obj).forEach(key => {
    const val = obj[key]
    if (val && typeof val === 'object') deepFreeze(val)
  })
  return Object.freeze(obj)
}

export const ALERT_TYPES = deepFreeze({
  vehicle_doc_expired: {
    value: 'vehicle_doc_expired',
    label: 'Documento de vehículo próximo a vencer o vencido',
    icon: 'mdi-file-document-alert-outline',
    color: 'warning',
    severity: 'warning',
  },
  driver_doc_expired: {
    value: 'driver_doc_expired',
    label: 'Documento de conductor próximo a vencer o vencido',
    icon: 'mdi-card-account-details-outline',
    color: 'warning',
    severity: 'warning',
  },
  driving_limit: {
    value: 'driving_limit',
    label: 'Conductor próximo al límite de conducción',
    icon: 'mdi-steering',
    color: 'error',
    severity: 'critical',
  },
  maintenance_pending: {
    value: 'maintenance_pending',
    label: 'Vehículo próximo a revisión de mantenimiento',
    icon: 'mdi-wrench-clock',
    color: 'warning',
    severity: 'warning',
  },
  anomalous_consumption: {
    value: 'anomalous_consumption',
    label: 'Consumo de combustible anómalo',
    icon: 'mdi-gas-station-off-outline',
    color: 'warning',
    severity: 'warning',
  },
  vehicle_stopped: {
    value: 'vehicle_stopped',
    label: 'Vehículo detenido sin justificación',
    icon: 'mdi-truck-alert-outline',
    color: 'info',
    severity: 'info',
  },
  speeding: {
    value: 'speeding',
    label: 'Velocidad superior al límite legal',
    icon: 'mdi-speedometer-slow',
    color: 'error',
    severity: 'critical',
  },
  tachograph_download: {
    value: 'tachograph_download',
    label: 'Descarga de tacógrafo pendiente',
    icon: 'mdi-download-circle-outline',
    color: 'info',
    severity: 'info',
  },
  driving_violation: {
    value: 'driving_violation',
    label: 'Infracción de conducción detectada',
    icon: 'mdi-alert-octagon-outline',
    color: 'error',
    severity: 'critical',
  },
})

export const ALERT_SEVERITIES = deepFreeze({
  info: {
    value: 'info',
    label: 'Informativa',
    color: 'info',
  },
  warning: {
    value: 'warning',
    label: 'Advertencia',
    color: 'warning',
  },
  critical: {
    value: 'critical',
    label: 'Crítica',
    color: 'error',
  },
})

/** @type {string[]} */
export const ALERT_TYPE_VALUES = Object.freeze(Object.keys(ALERT_TYPES))

/** @type {string[]} */
export const ALERT_SEVERITY_VALUES = Object.freeze(Object.keys(ALERT_SEVERITIES))

/**
 * Get the Spanish label for an alert type value.
 * @param {string} value
 * @returns {string}
 */
export function getAlertTypeLabel(value) {
  return ALERT_TYPES[value]?.label ?? value
}

/**
 * Get the Material Design Icon name for an alert type.
 * @param {string} value
 * @returns {string}
 */
export function getAlertTypeIcon(value) {
  return ALERT_TYPES[value]?.icon ?? 'mdi-alert-circle-outline'
}

/**
 * Get the Vuetify color token for an alert type.
 * @param {string} value
 * @returns {string}
 */
export function getAlertTypeColor(value) {
  return ALERT_TYPES[value]?.color ?? 'grey'
}

/**
 * Get the Spanish label for an alert severity.
 * @param {string} value
 * @returns {string}
 */
export function getAlertSeverityLabel(value) {
  return ALERT_SEVERITIES[value]?.label ?? value
}

/**
 * Get the Vuetify color token for a severity level.
 * Maps critical → error for Vuetify compatibility.
 * @param {string} severity
 * @returns {string}
 */
export function getAlertSeverityColor(severity) {
  return ALERT_SEVERITIES[severity]?.color ?? 'grey'
}
