<template>
  <v-card :to="{ name: 'CargoDetail', params: { id: record.id } }" hover data-testid="cargo-card">
    <v-card-text>
      <div class="d-flex justify-space-between align-start mb-2">
        <div>
          <div class="text-body-2 font-weight-medium">{{ record.description }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ formatKg(record.weight_kg) }}
            {{ record.volume_m3 ? ` · ${record.volume_m3} m³` : '' }}
          </div>
        </div>
        <v-chip :color="getTypeColor(record.type)" size="small" variant="tonal">
          {{ getTypeLabel(record.type) }}
        </v-chip>
      </div>

      <template v-if="record.type === 'dangerous'">
        <v-divider class="my-2" />
        <div class="d-flex justify-space-between text-caption text-medium-emphasis">
          <span>Clase ADR: {{ record.adr_class || '—' }}</span>
          <span>ONU: {{ record.un_number || '—' }}</span>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({ record: { type: Object, required: true } })

function getTypeColor(type) {
  const map = { general: 'info', refrigerated: 'cyan', dangerous: 'error', special: 'warning' }
  return map[type] ?? 'grey'
}

function getTypeLabel(type) {
  const map = {
    general: 'General',
    refrigerated: 'Frigorífica',
    dangerous: 'Peligrosa',
    special: 'Especial',
  }
  return map[type] ?? type
}

function formatKg(kg) {
  if (!kg) return '—'
  return `${kg.toLocaleString('es-ES')} kg`
}
</script>
