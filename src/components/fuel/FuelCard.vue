<template>
  <v-card :to="{ name: 'FuelDetail', params: { id: record.id } }" hover data-testid="fuel-card">
    <v-card-text>
      <div class="d-flex justify-space-between align-start mb-2">
        <div>
          <div class="text-body-2 font-weight-medium">
            {{ record.quantity }} L · {{ formatPrice(record.unit_price) }}/L
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ formatDate(record.refuel_date) }} · {{ formatKm(record.odometer_km) }}
          </div>
        </div>
        <div class="text-body-1 font-weight-bold">
          {{ record.total_eur ? `${record.total_eur.toFixed(2)} €` : '—' }}
        </div>
      </div>

      <v-divider class="my-2" />

      <div class="d-flex justify-space-between text-caption text-medium-emphasis">
        <span>{{ record.station_name || '—' }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  record: { type: Object, required: true },
})

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES')
}

function formatKm(km) {
  if (!km) return '—'
  return `${km.toLocaleString('es-ES')} km`
}

function formatPrice(p) {
  if (!p) return '—'
  return p.toFixed(3)
}
</script>
