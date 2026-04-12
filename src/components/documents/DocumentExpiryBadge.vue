<template>
  <VChip :color="color" size="small" variant="tonal" data-testid="document-expiry-badge">
    {{ text }}
  </VChip>
</template>

<script setup>
/**
 * FleetControl — DocumentExpiryBadge
 *
 * Shows remaining days until document expiry with dynamic color.
 *
 * @param {string|null} expiryDate - ISO date string
 */

const props = defineProps({
  expiryDate: {
    type: String,
    default: null,
  },
})

const { color, text } = computeExpiryStatus(props.expiryDate)

/**
 * Compute color and text from expiry date.
 * @param {string|null} expiryDate
 * @returns {{ color: string, text: string }}
 */
function computeExpiryStatus(expiryDate) {
  if (!expiryDate) {
    return { color: 'grey', text: 'Sin fecha' }
  }

  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffMs = expiry - now
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { color: 'error', text: `Vencido hace ${Math.abs(diffDays)} días` }
  }
  if (diffDays === 0) {
    return { color: 'error', text: 'Hoy' }
  }
  if (diffDays <= 7) {
    return { color: 'error', text: `${diffDays} días` }
  }
  if (diffDays <= 30) {
    return { color: 'warning', text: `${diffDays} días` }
  }
  return { color: 'success', text: `${diffDays} días` }
}
</script>
