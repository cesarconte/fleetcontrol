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
        <v-chip :color="getCargoTypeColor(record.cargo_type)" size="small" variant="tonal">
          {{ getCargoTypeLabel(record.cargo_type) }}
        </v-chip>
      </div>

      <template v-if="record.cargo_type === 'dangerous'">
        <v-divider class="my-2" />
        <div class="d-flex justify-space-between text-caption text-medium-emphasis">
          <span>Clase ADR: {{ record.adr_class || '—' }}</span>
          <span>ONU: {{ record.adr_un_number || '—' }}</span>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { getCargoTypeColor, getCargoTypeLabel, formatKg } from '@/utils/cargo-helpers.js'

defineProps({ record: { type: Object, required: true } })
</script>
