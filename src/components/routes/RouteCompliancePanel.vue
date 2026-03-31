<template>
  <v-card
    variant="outlined"
    class="mt-3"
    :color="complianceResult.isCompliant ? 'success' : 'warning'"
    data-testid="route-compliance-panel"
  >
    <v-card-title class="text-body-1 d-flex align-center ga-2">
      <v-icon :icon="complianceResult.isCompliant ? 'mdi-check-circle' : 'mdi-alert'" />
      {{ complianceResult.isCompliant ? 'Vehículo compatible' : 'Incompatibilidad detectada' }}
    </v-card-title>

    <v-card-text>
      <!-- Weight check -->
      <div v-if="weightWarning" class="mb-3">
        <v-chip color="error" size="small" prepend-icon="mdi-weight" class="mb-1">
          {{ weightWarning }}
        </v-chip>
      </div>

      <!-- Auto passed -->
      <div v-if="complianceResult.autoPassed.length" class="mb-2">
        <div class="text-caption text-uppercase text-medium-emphasis mb-1">Verificaciones OK</div>
        <v-chip
          v-for="(item, i) in complianceResult.autoPassed"
          :key="'p' + i"
          color="success"
          size="small"
          class="mr-1 mb-1"
        >
          {{ item }}
        </v-chip>
      </div>

      <!-- Auto failed -->
      <div v-if="complianceResult.autoFailed.length" class="mb-2">
        <div class="text-caption text-uppercase text-medium-emphasis mb-1">
          Problemas detectados
        </div>
        <v-chip
          v-for="(item, i) in complianceResult.autoFailed"
          :key="'f' + i"
          color="error"
          size="small"
          class="mr-1 mb-1"
          prepend-icon="mdi-alert-circle"
        >
          {{ item }}
        </v-chip>
      </div>

      <!-- Manual checks (equipment) -->
      <div v-if="complianceResult.manualChecks.length" class="mb-2">
        <v-expansion-panels variant="accordion">
          <v-expansion-panel title="Equipamiento requerido (verificación manual)">
            <v-expansion-panel-text>
              <v-list density="compact">
                <v-list-item
                  v-for="(item, i) in complianceResult.manualChecks"
                  :key="'m' + i"
                  :title="item.replace(/_/g, ' ')"
                  prepend-icon="mdi-clipboard-check-outline"
                />
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <!-- Normative reference -->
      <div
        v-if="complianceResult.normativeReference"
        class="text-caption text-medium-emphasis mt-2"
      >
        <v-icon icon="mdi-book-open-variant" size="small" class="mr-1" />
        {{ complianceResult.normativeReference }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, watch } from 'vue'
import { checkVehicleCompliance } from '@/utils/cargo-compliance.js'
import { useVehicleDocuments } from '@/composables/use-vehicle-documents.js'

const props = defineProps({
  vehicle: { type: Object, required: true },
  subcategoriaId: { type: String, required: true },
  cargoWeightKg: { type: Number, default: null },
})

const { documents, fetchDocuments } = useVehicleDocuments()

// Fetch documents when vehicle changes
watch(
  () => props.vehicle?.id,
  id => fetchDocuments(id),
  { immediate: true },
)

const complianceResult = computed(() => {
  return checkVehicleCompliance(props.vehicle, props.subcategoriaId, documents.value)
})

const weightWarning = computed(() => {
  if (!props.cargoWeightKg || !props.vehicle?.max_payload_kg) return null
  if (props.cargoWeightKg > props.vehicle.max_payload_kg) {
    return `Peso (${props.cargoWeightKg} kg) excede carga útil (${props.vehicle.max_payload_kg} kg)`
  }
  return null
})
</script>
