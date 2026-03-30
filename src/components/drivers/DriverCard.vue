<template>
  <v-card :to="{ name: 'DriverDetail', params: { id: driver.id } }" hover data-testid="driver-card">
    <v-card-text>
      <div class="d-flex justify-space-between align-start mb-2">
        <div>
          <div class="text-h6 font-weight-bold">{{ driver.full_name }}</div>
          <div class="text-body-2 text-medium-emphasis">
            {{ driver.nif }}
          </div>
        </div>
        <v-chip :color="getStatusColor(driver.status)" size="small" variant="tonal">
          {{ getStatusLabel(driver.status) }}
        </v-chip>
      </div>

      <v-divider class="my-2" />

      <div class="d-flex justify-space-between text-caption text-medium-emphasis">
        <span>{{ driver.city || '—' }}</span>
        <span>{{ driver.phone || '—' }}</span>
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
    active: 'success',
    temporary_leave: 'warning',
    inactive: 'grey',
  }
  return map[status] ?? 'grey'
}

function getStatusLabel(status) {
  const map = {
    active: 'Activo',
    temporary_leave: 'Baja temporal',
    inactive: 'Inactivo',
  }
  return map[status] ?? status
}
</script>
