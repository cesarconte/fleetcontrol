<template>
  <VChip
    :color="color"
    size="small"
    variant="tonal"
    :prepend-icon="icon"
    data-testid="document-status-chip"
  >
    {{ label }}
  </VChip>
</template>

<script setup>
/**
 * FleetControl — DocumentStatusChip
 *
 * Displays document status with appropriate color, icon, and Spanish label.
 * Color + icon + text — never color alone (WCAG 2.1 AA).
 *
 * @param {string} status - valid | expiring_soon | critical | expired | not_applicable
 */

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: v => ['valid', 'expiring_soon', 'critical', 'expired', 'not_applicable'].includes(v),
  },
})

const STATUS_MAP = Object.freeze({
  valid: { color: 'success', icon: 'mdi-check-circle', label: 'En regla' },
  expiring_soon: { color: 'warning', icon: 'mdi-clock-alert', label: 'Próximo a vencer' },
  critical: { color: 'error', icon: 'mdi-alert-circle', label: 'Crítico' },
  expired: { color: 'error', icon: 'mdi-close-circle', label: 'Vencido' },
  not_applicable: { color: 'grey', icon: 'mdi-minus-circle', label: 'No aplica' },
})

const config = STATUS_MAP[props.status] || STATUS_MAP.not_applicable
const color = config.color
const icon = config.icon
const label = config.label
</script>
