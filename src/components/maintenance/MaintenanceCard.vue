<template>
  <v-card
    :to="{ name: 'MaintenanceDetail', params: { id: record.id } }"
    hover
    data-testid="maintenance-card"
  >
    <v-card-text>
      <div class="d-flex justify-space-between align-start mb-2">
        <div>
          <div class="text-body-2 font-weight-medium">{{ record.description }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ formatDate(record.scheduled_date) }}
          </div>
        </div>
        <div class="d-flex ga-1">
          <v-chip :color="getTypeColor(record.type)" size="x-small" variant="outlined">
            {{ getTypeLabel(record.type) }}
          </v-chip>
          <v-chip :color="getStatusColor(record.status)" size="x-small" variant="tonal">
            {{ getStatusLabel(record.status) }}
          </v-chip>
        </div>
      </div>

      <v-divider class="my-2" />

      <div class="d-flex justify-space-between text-caption text-medium-emphasis">
        <span>{{ record.workshop || '—' }}</span>
        <span>{{ record.total_cost_eur ? `${record.total_cost_eur.toFixed(2)} €` : '—' }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  record: { type: Object, required: true },
})

function getTypeColor(type) {
  return type === 'preventive' ? 'info' : 'warning'
}

function getTypeLabel(type) {
  return type === 'preventive' ? 'Preventivo' : 'Correctivo'
}

function getStatusColor(status) {
  const map = {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'grey',
  }
  return map[status] ?? 'grey'
}

function getStatusLabel(status) {
  const map = {
    pending: 'Pendiente',
    in_progress: 'En curso',
    completed: 'Completado',
    cancelled: 'Cancelado',
  }
  return map[status] ?? status
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES')
}
</script>
