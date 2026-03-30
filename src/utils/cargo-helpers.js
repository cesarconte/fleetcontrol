/**
 * FleetControl — Cargo Helpers
 *
 * Shared utility functions and constants for cargo module.
 */

export const CARGO_TYPE_OPTIONS = [
  { title: 'General', value: 'general' },
  { title: 'Frigorífica', value: 'refrigerated' },
  { title: 'Peligrosa (ADR)', value: 'dangerous' },
  { title: 'Especial', value: 'special' },
]

export function getCargoTypeColor(type) {
  const map = { general: 'info', refrigerated: 'teal', dangerous: 'error', special: 'warning' }
  return map[type] ?? 'grey'
}

export function getCargoTypeLabel(type) {
  const map = {
    general: 'General',
    refrigerated: 'Frigorífica',
    dangerous: 'Peligrosa',
    special: 'Especial',
  }
  return map[type] ?? type
}

export function formatKg(kg) {
  if (!kg && kg !== 0) return '—'
  return `${kg.toLocaleString('es-ES')} kg`
}
