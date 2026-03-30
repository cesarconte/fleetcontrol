<template>
  <v-card :to="{ name: 'DriverDetail', params: { id: driver.id } }" hover data-testid="driver-card">
    <v-card-text>
      <div class="d-flex justify-space-between align-start mb-2">
        <div>
          <div class="text-h6 font-weight-bold">{{ driver.nombre_completo }}</div>
          <div class="text-body-2 text-medium-emphasis">
            {{ driver.nif_nie }}
          </div>
        </div>
        <v-chip :color="getStatusColor(driver.status, 'conductor')" size="small" variant="tonal">
          {{ getStatusLabel(driver.status, 'conductor') }}
        </v-chip>
      </div>

      <v-divider class="my-2" />

      <div class="d-flex justify-space-between text-caption text-medium-emphasis">
        <span>{{ driver.ciudad || '—' }}</span>
        <span>{{ driver.telefono || '—' }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { getStatusColor, getStatusLabel } from '@/utils/status-helpers.js'

defineProps({
  driver: { type: Object, required: true },
})
</script>
