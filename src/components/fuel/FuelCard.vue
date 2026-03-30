<template>
  <v-card :to="{ name: 'FuelDetail', params: { id: record.id } }" hover data-testid="fuel-card">
    <v-card-text>
      <div class="d-flex justify-space-between align-start mb-2">
        <div>
          <div class="text-body-2 font-weight-medium">
            {{ record.liters }} L · {{ formatPrice(record.price_per_liter) }}/L
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ formatDate(record.date) }} · {{ formatKm(record.mileage_km) }}
          </div>
        </div>
        <div class="text-body-1 font-weight-bold">
          {{ record.total_cost_eur ? `${record.total_cost_eur.toFixed(2)} €` : '—' }}
        </div>
      </div>

      <v-divider class="my-2" />

      <div class="d-flex justify-space-between text-caption text-medium-emphasis">
        <span>{{ record.station || '—' }}</span>
        <span>{{ getFuelLabel(record.fuel_type) }}</span>
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

function getFuelLabel(type) {
  const map = {
    diesel: 'Diésel',
    cng: 'GNC',
    lng: 'GNL',
    hydrogen: 'Hidrógeno',
    electric: 'Eléctrico',
    hybrid: 'Híbrido',
  }
  return map[type] ?? type
}
</script>
