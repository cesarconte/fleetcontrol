<template>
  <VCard class="mb-4">
    <VCardText>
      <VRow density="comfortable" align="center">
        <VCol cols="12" sm="4">
          <VSelect
            v-model="selectedPeriod"
            :items="periodOptions"
            label="Período"
            variant="outlined"
            density="compact"
            hide-details
            data-testid="report-period-select"
            @update:model-value="emit('update:period', $event)"
          />
        </VCol>
        <VCol v-if="selectedPeriod === 'personalizado'" cols="6" sm="3">
          <VTextField
            v-model="customFrom"
            label="Desde"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
            data-testid="report-date-from"
            @update:model-value="emitCustomDates"
          />
        </VCol>
        <VCol v-if="selectedPeriod === 'personalizado'" cols="6" sm="3">
          <VTextField
            v-model="customTo"
            label="Hasta"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
            data-testid="report-date-to"
            @update:model-value="emitCustomDates"
          />
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<script setup>
import { ref } from 'vue'
import { getReportPeriodOptions } from '@/constants/report-types.js'

defineProps({
  modelValue: { type: String, default: 'este_mes' },
})

const emit = defineEmits(['update:period', 'update:dates'])

const periodOptions = getReportPeriodOptions().map(o => ({ title: o.label, value: o.value }))
const selectedPeriod = ref('este_mes')
const customFrom = ref('')
const customTo = ref('')

function emitCustomDates() {
  if (customFrom.value && customTo.value) {
    emit('update:dates', { from: customFrom.value, to: customTo.value })
  }
}
</script>
