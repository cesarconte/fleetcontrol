/**
 * FleetControl — Format Helpers
 *
 * Shared formatting functions used across all modules.
 */

/**
 * Format a date string to Spanish locale.
 * @param {string|null} dateStr - ISO date string
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES')
}

/**
 * Format kilometers with Spanish locale.
 * @param {number|null} km
 * @returns {string}
 */
export function formatKm(km) {
  if (!km && km !== 0) return '—'
  return `${Number(km).toLocaleString('es-ES')} km`
}

/**
 * Format a price in EUR with Spanish locale.
 * @param {number|null} price
 * @returns {string}
 */
export function formatPrice(price) {
  if (!price && price !== 0) return '—'
  return `${Number(price).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
}

/**
 * Format a weight in kg with Spanish locale.
 * @param {number|null} kg
 * @returns {string}
 */
export function formatKg(kg) {
  if (!kg && kg !== 0) return '—'
  return `${Number(kg).toLocaleString('es-ES')} kg`
}
