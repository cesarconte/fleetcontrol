<template>
  <v-card
    :to="{ name: 'VehicleDetail', params: { id: vehicle.id } }"
    hover
    data-testid="vehicle-card"
  >
    <v-card-text>
      <div class="d-flex justify-space-between align-start mb-2">
        <div>
          <div class="text-h6 font-weight-bold">{{ vehicle.plate }}</div>
          <div class="text-body-2 text-medium-emphasis">
            {{ vehicle.brand }} {{ vehicle.model }}
          </div>
        </div>
        <v-chip :color="getStatusColor(vehicle.status, 'vehiculo')" size="small" variant="tonal">
          {{ getStatusLabel(vehicle.status, 'vehiculo') }}
        </v-chip>
      </div>

      <v-divider class="my-2" />

      <div class="d-flex justify-space-between text-caption text-medium-emphasis">
        <span>{{ getBodyLabel(vehicle.body_type) }}</span>
        <span>
          <v-chip
            v-if="vehicle.dgt_badge && vehicle.dgt_badge !== 'sin_etiqueta'"
            :color="getDgtColor(vehicle.dgt_badge)"
            size="x-small"
            variant="flat"
          >
            {{ getDgtLabel(vehicle.dgt_badge) }}
          </v-chip>
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { getStatusColor, getStatusLabel, getDgtColor, getDgtLabel } from '@/utils/status-helpers.js'
import { getBodyLabel } from '@/constants/vehicle-types.js'

defineProps({
  vehicle: { type: Object, required: true },
})
</script>
