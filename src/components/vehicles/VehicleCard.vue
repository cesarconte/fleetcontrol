<template>
  <v-card
    :to="{ name: 'VehicleDetail', params: { id: vehicle.id } }"
    hover
    data-testid="vehicle-card"
  >
    <v-card-text>
      <div class="d-flex justify-space-between align-start mb-2">
        <div>
          <div class="text-h6 font-weight-bold">{{ vehicle.matricula }}</div>
          <div class="text-body-2 text-medium-emphasis">
            {{ vehicle.marca }} {{ vehicle.modelo }}
          </div>
        </div>
        <v-chip :color="getStatusColor(vehicle.status, 'vehiculo')" size="small" variant="tonal">
          {{ getStatusLabel(vehicle.status, 'vehiculo') }}
        </v-chip>
      </div>

      <v-divider class="my-2" />

      <div class="d-flex justify-space-between text-caption text-medium-emphasis">
        <span>{{ getTypeLabel(vehicle.tipo_vehiculo) }}</span>
        <span>
          <v-chip
            v-if="vehicle.distintivo_ambiental && vehicle.distintivo_ambiental !== 'sin_etiqueta'"
            :color="getDgtColor(vehicle.distintivo_ambiental)"
            size="x-small"
            variant="flat"
          >
            {{ getDgtLabel(vehicle.distintivo_ambiental) }}
          </v-chip>
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { getStatusColor, getStatusLabel, getDgtColor, getDgtLabel } from '@/utils/status-helpers.js'

defineProps({
  vehicle: { type: Object, required: true },
})

function getTypeLabel(type) {
  const map = {
    tractora: 'Tractora',
    vehiculo_rigido: 'Rígido',
    semirremolque: 'Semirremolque',
    remolque: 'Remolque',
    cisterna: 'Cisterna',
    frigorifico: 'Frigorífico',
    basculante: 'Volquete',
    lona: 'Lona',
    caja_cerrada: 'Furgón',
    especial: 'Especial',
    portacoches: 'Portacoches',
  }
  return map[type] ?? type
}
</script>
