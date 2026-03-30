<template>
  <v-card :to="{ name: 'RouteDetail', params: { id: route.id } }" hover data-testid="route-card">
    <v-card-text>
      <div class="d-flex justify-space-between align-start mb-2">
        <div>
          <div class="text-body-2 font-weight-medium">
            {{ route.origin }} → {{ route.destination }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ formatDate(route.departure_date) }}
          </div>
        </div>
        <v-chip :color="getStatusColor(route.status)" size="small" variant="tonal">
          {{ getStatusLabel(route.status) }}
        </v-chip>
      </div>

      <v-divider class="my-2" />

      <div class="d-flex justify-space-between text-caption text-medium-emphasis">
        <span>{{ route.planned_distance_km ? `${route.planned_distance_km} km` : '—' }}</span>
        <span>
          {{ route.cargo_weight_kg ? `${route.cargo_weight_kg.toLocaleString('es-ES')} kg` : '—' }}
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  route: { type: Object, required: true },
})

function getStatusColor(status) {
  const map = {
    planned: 'info',
    active: 'success',
    completed: 'grey',
    delayed: 'warning',
    incident: 'error',
    cancelled: 'grey-darken-2',
  }
  return map[status] ?? 'grey'
}

function getStatusLabel(status) {
  const map = {
    planned: 'Planificada',
    active: 'En curso',
    completed: 'Completada',
    delayed: 'Retrasada',
    incident: 'Incidencia',
    cancelled: 'Cancelada',
  }
  return map[status] ?? status
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES')
}
</script>
