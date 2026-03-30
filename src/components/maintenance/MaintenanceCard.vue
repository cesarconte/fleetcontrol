<template>
  <v-card
    :to="{ name: 'MaintenanceDetail', params: { id: record.id } }"
    hover
    data-testid="maintenance-card"
  >
    <v-card-text>
      <div class="d-flex justify-space-between align-start mb-2">
        <div>
          <div class="text-body-2 font-weight-medium">{{ record.descripcion }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ formatDate(record.fecha_programada) }}
          </div>
        </div>
        <div class="d-flex ga-1">
          <v-chip :color="getTipoColor(record.tipo)" size="x-small" variant="outlined">
            {{ getTipoLabel(record.tipo) }}
          </v-chip>
          <v-chip :color="getStatusColor(record.status)" size="x-small" variant="tonal">
            {{ getStatusLabel(record.status) }}
          </v-chip>
        </div>
      </div>

      <v-divider class="my-2" />

      <div class="d-flex justify-space-between text-caption text-medium-emphasis">
        <span>{{ record.taller_nombre || '—' }}</span>
        <span>{{ record.coste_total_eur ? `${record.coste_total_eur.toFixed(2)} €` : '—' }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  record: { type: Object, required: true },
})

function getTipoColor(tipo) {
  return tipo === 'preventivo' ? 'info' : 'warning'
}

function getTipoLabel(tipo) {
  return tipo === 'preventivo' ? 'Preventivo' : 'Correctivo'
}

function getStatusColor(status) {
  const map = {
    pendiente: 'info',
    en_curso: 'warning',
    completada: 'success',
    cancelada: 'grey',
  }
  return map[status] ?? 'grey'
}

function getStatusLabel(status) {
  const map = {
    pendiente: 'Pendiente',
    en_curso: 'En curso',
    completada: 'Completada',
    cancelada: 'Cancelada',
  }
  return map[status] ?? status
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES')
}
</script>
