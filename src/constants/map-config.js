/**
 * FleetControl — Map Configuration Constants
 *
 * Configuración del mapa de flota: centro, zoom, colores de marcadores, filtros.
 *
 * @see docs/plans/feature-mapa-plan.md — Tarea 2.1
 */

export const MAP_CONFIG = Object.freeze({
  DEFAULT_CENTER: Object.freeze({ lat: 40.4168, lng: -3.7038 }), // Madrid
  DEFAULT_ZOOM: 6,
  ZOOM_MOBILE: 5,
  ZOOM_DETAIL: 12,
  MARKER_COLORS: Object.freeze({
    on_route: '#4CAF50',
    in_maintenance: '#FFC107',
    active: '#2196F3',
    inactive: '#9E9E9E',
    decommissioned: '#616161',
  }),
  FILTERS: Object.freeze([
    { key: 'all', label: 'Todos', icon: 'mdi-map-marker' },
    { key: 'on_route', label: 'En Ruta', icon: 'mdi-truck-fast' },
    { key: 'in_maintenance', label: 'Mantenimiento', icon: 'mdi-wrench' },
    { key: 'has_alerts', label: 'Con Alertas', icon: 'mdi-alert-circle' },
  ]),
})
