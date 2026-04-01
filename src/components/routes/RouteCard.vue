<template>
  <v-card :to="{ name: 'RouteDetail', params: { id: route.id } }" hover data-testid="route-card">
    <v-card-text>
      <div class="d-flex justify-space-between align-start mb-2">
        <div>
          <div class="text-body-2 font-weight-medium">
            {{ route.origin_city }} → {{ route.destination_city }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ formatDate(route.departure_date) }}
          </div>
        </div>
        <v-chip :color="getStatusColor(route.status, 'ruta')" size="small" variant="tonal">
          {{ getStatusLabel(route.status, 'ruta') }}
        </v-chip>
      </div>

      <v-divider class="my-2" />

      <div class="d-flex justify-space-between text-caption text-medium-emphasis">
        <span>{{ route.distance_total_km ? `${route.distance_total_km} km` : '—' }}</span>
        <span>
          {{ route.cargo_weight_kg ? `${route.cargo_weight_kg.toLocaleString('es-ES')} kg` : '—' }}
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { getStatusColor, getStatusLabel } from '@/utils/status-helpers.js'
import { formatDate } from '@/utils/format-helpers.js'

defineProps({
  route: { type: Object, required: true },
})
</script>
