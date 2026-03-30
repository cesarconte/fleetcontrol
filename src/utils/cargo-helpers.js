/**
 * FleetControl — Cargo Helpers
 *
 * Shared utility functions and constants for cargo module.
 */

export const CARGO_TYPE_OPTIONS = [
  { title: 'General', value: 'general' },
  { title: 'Frigorífica', value: 'frigorifica' },
  { title: 'Peligrosa (ADR)', value: 'peligrosa' },
  { title: 'Especial', value: 'especial' },
]

export function getCargoTypeColor(tipo) {
  const map = { general: 'info', frigorifica: 'teal', peligrosa: 'error', especial: 'warning' }
  return map[tipo] ?? 'grey'
}

export function getCargoTypeLabel(tipo) {
  const map = {
    general: 'General',
    frigorifica: 'Frigorífica',
    peligrosa: 'Peligrosa',
    especial: 'Especial',
  }
  return map[tipo] ?? tipo
}

export function formatKg(kg) {
  if (!kg && kg !== 0) return '—'
  return `${kg.toLocaleString('es-ES')} kg`
}
