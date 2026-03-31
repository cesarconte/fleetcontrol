/**
 * FleetControl — Cargo Helpers
 *
 * Shared utility functions and constants for cargo module.
 * Type options derived from cargo-categories.js (DRY).
 */

import { CARGO_CATEGORIES } from '@/constants/cargo-categories.js'

const LEGACY_LABELS = {
  general: 'General',
  refrigerated: 'Frigorífica',
  dangerous: 'Peligrosa',
  special: 'Especial',
}

/** @type {Array<{ title: string, value: string }>} */
export const CARGO_TYPE_OPTIONS = CARGO_CATEGORIES.map(c => ({
  title: LEGACY_LABELS[c.legacyType] ?? c.legacyType,
  value: c.legacyType,
}))

export function getCargoTypeColor(tipo) {
  const map = { general: 'info', refrigerated: 'teal', dangerous: 'error', special: 'warning' }
  return map[tipo] ?? 'grey'
}

export function getCargoTypeLabel(tipo) {
  return LEGACY_LABELS[tipo] ?? tipo
}

export function formatKg(kg) {
  if (!kg && kg !== 0) return '—'
  return `${kg.toLocaleString('es-ES')} kg`
}
