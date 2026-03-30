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
        <v-chip :color="getStatusColor(driver.status)" size="small" variant="tonal">
          {{ getStatusLabel(driver.status) }}
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
defineProps({
  driver: { type: Object, required: true },
})

function getStatusColor(status) {
  const map = {
    activo: 'success',
    baja_temporal: 'warning',
    baja_definitiva: 'grey',
  }
  return map[status] ?? 'grey'
}

function getStatusLabel(status) {
  const map = {
    activo: 'Activo',
    baja_temporal: 'Baja temporal',
    baja_definitiva: 'Baja definitiva',
  }
  return map[status] ?? status
}
</script>
