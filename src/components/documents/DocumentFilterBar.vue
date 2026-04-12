<template>
  <div class="document-filter-bar">
    <VRow align="center">
      <!-- Search -->
      <VCol cols="12" sm="4">
        <VTextField
          v-model="localSearch"
          label="Buscar documentos"
          placeholder="Matrícula, nombre, referencia..."
          prepend-inner-icon="mdi-magnify"
          clearable
          density="compact"
          hide-details
          data-testid="document-search"
          @update:model-value="onSearchUpdate"
        />
      </VCol>

      <!-- Document Type Filter -->
      <VCol cols="6" sm="2">
        <VAutocomplete
          v-model="localFilters.docType"
          :items="docTypeItems"
          label="Tipo"
          density="compact"
          clearable
          hide-details
          data-testid="filter-doc-type"
          @update:model-value="applyFilters"
        />
      </VCol>

      <!-- Status Filter -->
      <VCol cols="6" sm="2">
        <VAutocomplete
          v-model="localFilters.status"
          :items="statusItems"
          label="Estado"
          density="compact"
          clearable
          hide-details
          data-testid="filter-status"
          @update:model-value="applyFilters"
        />
      </VCol>

      <!-- Date Range -->
      <VCol cols="6" sm="2">
        <VTextField
          v-model="localFilters.dateFrom"
          label="Desde"
          type="date"
          density="compact"
          hide-details
          data-testid="filter-date-from"
          @update:model-value="applyFilters"
        />
      </VCol>

      <VCol cols="6" sm="2">
        <VTextField
          v-model="localFilters.dateTo"
          label="Hasta"
          type="date"
          density="compact"
          hide-details
          data-testid="filter-date-to"
          @update:model-value="applyFilters"
        />
      </VCol>

      <!-- Actions -->
      <VCol cols="12" sm="auto" class="d-flex align-center ga-2">
        <VBtn
          variant="text"
          size="small"
          prepend-icon="mdi-filter-remove"
          data-testid="clear-filters"
          @click="clearAllFilters"
        >
          Limpiar
        </VBtn>
        <VBtn
          variant="text"
          size="small"
          prepend-icon="mdi-download"
          data-testid="export-csv"
          @click="$emit('export')"
        >
          Exportar
        </VBtn>
      </VCol>
    </VRow>
  </div>
</template>

<script setup>
/**
 * FleetControl — Document Filter Bar
 *
 * Reusable filter bar for the Documents page.
 * Provides search, type/status filters, date range, and export actions.
 *
 * @see docs/plans/feature-documentos-centralizados-plan.md — Fase 3
 */

import { ref, reactive, watch, onUnmounted, computed } from 'vue'
import { VEHICLE_DOCUMENT_TYPES } from '@/constants/vehicle-document-types.js'
import { DRIVER_DOCUMENT_TYPES } from '@/constants/driver-document-types.js'
import { TRANSPORT_DOCUMENT_TYPES } from '@/constants/transport-document-types.js'

const props = defineProps({
  tab: {
    type: String,
    required: true,
    validator: v => ['vehicles', 'drivers', 'transport'].includes(v),
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  search: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'update:search', 'export', 'clear'])

// ── Local state ──────────────────────────────────────────────────────
const localSearch = ref(props.search)
const localFilters = reactive({
  docType: props.modelValue.docType || null,
  status: props.modelValue.status || null,
  dateFrom: props.modelValue.dateFrom || null,
  dateTo: props.modelValue.dateTo || null,
})

let searchTimeout = null

// ── Dynamic items based on active tab ────────────────────────────────
const docTypeItems = computed(() => {
  if (props.tab === 'vehicles') {
    return Object.values(VEHICLE_DOCUMENT_TYPES).map(t => ({ title: t.label, value: t.key }))
  }
  if (props.tab === 'drivers') {
    return Object.values(DRIVER_DOCUMENT_TYPES).map(t => ({ title: t.label, value: t.key }))
  }
  // transport tab
  return Object.values(TRANSPORT_DOCUMENT_TYPES).map(t => ({ title: t.label, value: t.key }))
})

const statusItems = Object.freeze([
  { title: 'En regla', value: 'valid' },
  { title: 'Próximo a vencer', value: 'expiring_soon' },
  { title: 'Crítico', value: 'critical' },
  { title: 'Vencido', value: 'expired' },
  { title: 'No aplica', value: 'not_applicable' },
])

// ── Handlers ─────────────────────────────────────────────────────────
/**
 * Handle search input with debounce.
 * @param {string} value
 */
function onSearchUpdate(value) {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    emit('update:search', value || '')
  }, 300)
}

/**
 * Emit filter changes to parent.
 */
function applyFilters() {
  emit('update:modelValue', { ...localFilters })
}

/**
 * Clear all filters and notify parent.
 */
function clearAllFilters() {
  localFilters.docType = null
  localFilters.status = null
  localFilters.dateFrom = null
  localFilters.dateTo = null
  localSearch.value = ''
  emit('update:modelValue', { ...localFilters })
  emit('update:search', '')
  emit('clear')
}

// ── Sync props to local state ────────────────────────────────────────
watch(
  () => props.search,
  val => {
    localSearch.value = val
  },
)

watch(
  () => props.modelValue,
  val => {
    localFilters.docType = val.docType || null
    localFilters.status = val.status || null
    localFilters.dateFrom = val.dateFrom || null
    localFilters.dateTo = val.dateTo || null
  },
  { deep: true },
)
</script>

<style scoped>
.document-filter-bar {
  padding: 8px 0;
}
</style>
