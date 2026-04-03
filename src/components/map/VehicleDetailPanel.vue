<template>
  <v-card class="vehicle-detail-panel" data-testid="vehicle-detail-panel" elevation="4">
    <v-card-title class="d-flex align-center justify-space-between">
      <span>{{ vehicle.vehicles?.plate || 'Sin matrícula' }}</span>
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        data-testid="close-panel"
        aria-label="Cerrar panel"
        @click="$emit('close')"
      />
    </v-card-title>

    <v-card-text>
      <div class="mb-2">
        <v-chip :color="statusColor" size="small" class="mr-2">
          {{ statusLabel }}
        </v-chip>
      </div>

      <div class="text-body-2 mb-2">
        {{ vehicle.vehicles?.brand }} {{ vehicle.vehicles?.model }}
      </div>

      <v-divider class="my-2" />

      <div class="text-caption text-medium-emphasis">
        <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
        {{ vehicle.latitude?.toFixed(6) }}, {{ vehicle.longitude?.toFixed(6) }}
      </div>

      <div v-if="vehicle.speed_kph != null" class="text-caption text-medium-emphasis mt-1">
        <v-icon size="small" class="mr-1">mdi-speedometer</v-icon>
        {{ vehicle.speed_kph }} km/h
      </div>

      <div v-if="vehicle.recorded_at" class="text-caption text-medium-emphasis mt-1">
        <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
        {{ formatTime(vehicle.recorded_at) }}
      </div>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn
        variant="outlined"
        size="small"
        data-testid="view-detail"
        @click="$emit('view-detail', vehicle.vehicles?.id)"
      >
        Ver ficha
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  vehicle: { type: Object, required: true },
})

defineEmits(['close', 'view-detail'])

const statusColor = computed(() => {
  const status = props.vehicle.vehicles?.status
  const colors = {
    on_route: 'success',
    in_maintenance: 'warning',
    active: 'info',
    inactive: 'grey',
    decommissioned: 'grey-darken-2',
  }
  return colors[status] || 'grey'
})

const statusLabel = computed(() => {
  const status = props.vehicle.vehicles?.status
  const labels = {
    on_route: 'En Ruta',
    in_maintenance: 'Mantenimiento',
    active: 'Activo',
    inactive: 'Inactivo',
    decommissioned: 'Retirado',
  }
  return labels[status] || status || 'Desconocido'
})

function formatTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}
</script>

<style scoped>
.vehicle-detail-panel {
  border-radius: 8px 0 0 8px;
}
</style>
