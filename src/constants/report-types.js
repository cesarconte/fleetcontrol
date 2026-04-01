/**
 * FleetControl — Informe Types
 *
 * All report/informe types with labels, icons, colors, and descriptions.
 * Based on PRD §4.9 — Informes.
 *
 * @see PRD §4.9
 */

/** @param {object} obj */
function deepFreeze(obj) {
  Object.keys(obj).forEach(key => {
    const val = obj[key]
    if (val && typeof val === 'object') deepFreeze(val)
  })
  return Object.freeze(obj)
}

export const REPORT_TYPES = deepFreeze({
  dashboard: {
    value: 'dashboard',
    label: 'Dashboard General',
    icon: 'mdi-view-dashboard',
    color: 'primary',
    description: 'Visión general de la flota con KPIs principales y resumen ejecutivo.',
  },
  flota: {
    value: 'flota',
    label: 'Informe de Flota',
    icon: 'mdi-truck-outline',
    color: 'info',
    description: 'Estado general de todos los vehículos, documentación y km acumulados.',
  },
  conductores: {
    value: 'conductores',
    label: 'Informe de Conductores',
    icon: 'mdi-account-group-outline',
    color: 'success',
    description: 'Horas conducidas, rutas completadas, estado del CAP y documentación.',
  },
  rutas: {
    value: 'rutas',
    label: 'Informe de Rutas',
    icon: 'mdi-map-marker-path',
    color: 'warning',
    description: 'Rutas completadas, km totales, tiempos medios, retrasos e incidencias.',
  },
  combustible: {
    value: 'combustible',
    label: 'Informe de Combustible',
    icon: 'mdi-gas-station-outline',
    color: 'orange',
    description: 'Consumo por vehículo, gasto total (€), CO2, comparativa entre vehículos.',
  },
  mantenimiento: {
    value: 'mantenimiento',
    label: 'Informe de Mantenimiento',
    icon: 'mdi-wrench-outline',
    color: 'grey',
    description: 'Costes, intervenciones por vehículo, tiempo de inmovilización.',
  },
  cumplimiento: {
    value: 'cumplimiento',
    label: 'Informe de Cumplimiento',
    icon: 'mdi-shield-check-outline',
    color: 'teal',
    description: 'Resumen de documentación en regla y vencida por vehículo y conductor.',
  },
  tacografos: {
    value: 'tacografos',
    label: 'Informe de Tacógrafos',
    icon: 'mdi-database-clock-outline',
    color: 'purple',
    description: 'Descargas realizadas, infracciones, horas de conducción por conductor.',
  },
  cargas: {
    value: 'cargas',
    label: 'Informe de Cargas',
    icon: 'mdi-package-variant-closed',
    color: 'brown',
    description: 'Peso transportado, volumen, tipos de carga, mercancías peligrosas.',
  },
  economico: {
    value: 'economico',
    label: 'Informe Económico',
    icon: 'mdi-chart-line',
    color: 'deep-purple',
    description: 'Ingresos, costes, beneficios, margen, CPM, análisis financiero completo.',
  },
})

/** @type {string[]} */
export const REPORT_TYPE_VALUES = Object.freeze(Object.keys(REPORT_TYPES))

/**
 * Get the label for an informe type.
 * @param {string} value
 * @returns {string}
 */
export function getReportTypeLabel(value) {
  return REPORT_TYPES[value]?.label ?? value
}

/**
 * Get the icon for an informe type.
 * @param {string} value
 * @returns {string}
 */
export function getReportTypeIcon(value) {
  return REPORT_TYPES[value]?.icon ?? 'mdi-file-document-outline'
}

/**
 * Get the color for an informe type.
 * @param {string} value
 * @returns {string}
 */
export function getReportTypeColor(value) {
  return REPORT_TYPES[value]?.color ?? 'grey'
}

/**
 * Get the description for an informe type.
 * @param {string} value
 * @returns {string}
 */
export function getReportTypeDescription(value) {
  return REPORT_TYPES[value]?.description ?? ''
}

/**
 * Predefined period options for report filtering.
 * @returns {Array<{value: string, label: string, dateFrom: Function, dateTo: Function}>}
 */
export function getReportPeriodOptions() {
  return [
    {
      value: 'este_mes',
      label: 'Este mes',
      dateFrom: () => {
        const d = new Date()
        return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
      },
      dateTo: () => new Date().toISOString().slice(0, 10),
    },
    {
      value: 'ultimo_mes',
      label: 'Último mes',
      dateFrom: () => {
        const d = new Date()
        return new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString().slice(0, 10)
      },
      dateTo: () => {
        const d = new Date()
        return new Date(d.getFullYear(), d.getMonth(), 0).toISOString().slice(0, 10)
      },
    },
    {
      value: 'este_trimestre',
      label: 'Este trimestre',
      dateFrom: () => {
        const d = new Date()
        const q = Math.floor(d.getMonth() / 3) * 3
        return new Date(d.getFullYear(), q, 1).toISOString().slice(0, 10)
      },
      dateTo: () => new Date().toISOString().slice(0, 10),
    },
    {
      value: 'este_ano',
      label: 'Este año',
      dateFrom: () => `${new Date().getFullYear()}-01-01`,
      dateTo: () => new Date().toISOString().slice(0, 10),
    },
    {
      value: 'ultimo_ano',
      label: 'Último año',
      dateFrom: () => {
        const d = new Date()
        return new Date(d.getFullYear() - 1, d.getMonth(), d.getDate()).toISOString().slice(0, 10)
      },
      dateTo: () => new Date().toISOString().slice(0, 10),
    },
    {
      value: 'personalizado',
      label: 'Personalizado',
      dateFrom: () => null,
      dateTo: () => null,
    },
  ]
}
