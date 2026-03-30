<template>
  <v-card :to="{ name: 'FuelDetail', params: { id: record.id } }" hover data-testid="fuel-card">
    <v-card-text>
      <div class="d-flex justify-space-between align-start mb-2">
        <div>
          <div class="text-body-2 font-weight-medium">
            {{ record.litros_kg }} L · {{ formatPrice(record.precio_por_litro_eur) }}/L
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ formatDate(record.fecha) }} · {{ formatKm(record.km_al_momento) }}
          </div>
        </div>
        <div class="text-body-1 font-weight-bold">
          {{ record.importe_total_eur ? `${record.importe_total_eur.toFixed(2)} €` : '—' }}
        </div>
      </div>

      <v-divider class="my-2" />

      <div class="d-flex justify-space-between text-caption text-medium-emphasis">
        <span>{{ record.estacion_servicio || '—' }}</span>
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
