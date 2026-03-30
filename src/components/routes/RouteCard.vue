<template>
  <v-card :to="{ name: 'RouteDetail', params: { id: route.id } }" hover data-testid="route-card">
    <v-card-text>
      <div class="d-flex justify-space-between align-start mb-2">
        <div>
          <div class="text-body-2 font-weight-medium">
            {{ route.origen_municipio }} → {{ route.destino_municipio }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ formatDate(route.fecha_salida) }}
          </div>
        </div>
        <v-chip :color="getStatusColor(route.status, 'ruta')" size="small" variant="tonal">
          {{ getStatusLabel(route.status, 'ruta') }}
        </v-chip>
      </div>

      <v-divider class="my-2" />

      <div class="d-flex justify-space-between text-caption text-medium-emphasis">
        <span>{{ route.distancia_total_km ? `${route.distancia_total_km} km` : '—' }}</span>
        <span>
          {{ route.peso_carga_kg ? `${route.peso_carga_kg.toLocaleString('es-ES')} kg` : '—' }}
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
