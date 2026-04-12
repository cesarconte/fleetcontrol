<template>
  <div class="vehicle-documents-table">
    <!-- Desktop: VDataTableServer -->
    <VDataTableServer
      :headers="headers"
      :items="items"
      :loading="loading"
      :items-length="pagination.total"
      :items-per-page="pagination.pageSize"
      :items-per-page-options="[15, 25, 50, 100]"
      :page="pagination.page"
      :sort-by="[{ key: pagination.sortBy, order: pagination.sortAsc ? 'asc' : 'desc' }]"
      hover
      class="elevation-1"
      @update:options="onOptionsUpdate"
      @click:row="handleRowClick"
    >
      <!-- Vehicle column -->
      <template #item.vehicle="{ item }">
        <RouterLink
          v-if="item.vehicles?.id"
          :to="{ name: 'VehicleDetail', params: { id: item.vehicles.id } }"
          class="text-primary"
        >
          {{ item.vehicles?.plate || '—' }}
        </RouterLink>
        <span v-else class="text-medium-emphasis">
          {{ item.vehicles?.plate || '—' }}
        </span>
        <div class="text-caption text-medium-emphasis">
          {{ item.vehicles?.brand }} {{ item.vehicles?.model }}
        </div>
      </template>

      <!-- Document type -->
      <template #item.doc_type="{ item }">
        <div class="d-flex align-center ga-2">
          <VIcon :icon="getDocTypeIcon(item.doc_type)" size="small" />
          {{ getDocTypeLabel(item.doc_type) }}
        </div>
      </template>

      <!-- Status -->
      <template #item.status="{ item }">
        <DocumentStatusChip :status="item.status" />
      </template>

      <!-- Dates -->
      <template #item.issue_date="{ item }">
        {{ formatDate(item.issue_date) }}
      </template>
      <template #item.expiry_date="{ item }">
        {{ formatDate(item.expiry_date) }}
      </template>

      <!-- Days remaining -->
      <template #item.days_remaining="{ item }">
        <DocumentExpiryBadge :expiry-date="item.expiry_date" />
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">
        <VBtn
          variant="text"
          icon="mdi-eye"
          size="x-small"
          data-testid="action-view"
          @click.stop="$emit('action', { action: 'view', item })"
        />
        <VBtn
          v-if="item.file_url"
          variant="text"
          icon="mdi-download"
          size="x-small"
          data-testid="action-download"
          @click.stop="$emit('action', { action: 'download', item })"
        />
        <VBtn
          variant="text"
          icon="mdi-pencil"
          size="x-small"
          data-testid="action-edit"
          @click.stop="$emit('action', { action: 'edit', item })"
        />
        <VBtn
          variant="text"
          icon="mdi-delete"
          size="x-small"
          color="error"
          data-testid="action-delete"
          @click.stop="$emit('action', { action: 'delete', item })"
        />
      </template>

      <!-- Loading -->
      <template #loading>
        <VSkeletonLoader type="table-row@5" />
      </template>

      <!-- No data -->
      <template #no-data>
        <div class="text-center pa-8">
          <v-icon size="48" color="grey">mdi-file-document-outline</v-icon>
          <p class="text-body-1 mt-4 text-medium-emphasis">
            No se encontraron documentos de vehículos con los filtros actuales.
          </p>
        </div>
      </template>
    </VDataTableServer>

    <!-- Mobile: Cards -->
    <div class="d-none d-sm-none d-md-none d-lg-none d-xl-none">
      <VCard
        v-for="doc in items"
        :key="doc.id"
        class="mb-2"
        variant="outlined"
        @click="$emit('action', { action: 'view', item: doc })"
      >
        <VCardText>
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-subtitle-2">
                {{ doc.vehicles?.plate || '—' }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ getDocTypeLabel(doc.doc_type) }}
              </div>
            </div>
            <DocumentStatusChip :status="doc.status" />
          </div>
          <div class="text-caption mt-2">Vence: {{ formatDate(doc.expiry_date) }}</div>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<script setup>
/**
 * FleetControl — Vehicle Documents Table
 *
 * Server-side paginated table of all vehicle documents.
 * Desktop: VDataTableServer | Mobile: Card list
 *
 * @see docs/plans/feature-documentos-centralizados-plan.md — Fase 4
 */

import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DocumentStatusChip from './DocumentStatusChip.vue'
import DocumentExpiryBadge from './DocumentExpiryBadge.vue'
import { VEHICLE_DOCUMENT_TYPES } from '@/constants/vehicle-document-types.js'

const vehicleDocTypes = Object.values(VEHICLE_DOCUMENT_TYPES)

defineProps({
  items: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  pagination: {
    type: Object,
    required: true,
    // { page, pageSize, total, sortBy, sortAsc }
  },
})

const emit = defineEmits(['action', 'update:pagination'])
const router = useRouter()

// ── Table headers ────────────────────────────────────────────────────
const headers = computed(() => [
  { title: 'Vehículo', key: 'vehicle', sortable: false },
  { title: 'Tipo', key: 'doc_type', value: 'doc_type' },
  { title: 'Nº referencia', key: 'reference_number', value: 'reference_number' },
  { title: 'Estado', key: 'status', value: 'status' },
  { title: 'Expedición', key: 'issue_date', value: 'issue_date' },
  { title: 'Vencimiento', key: 'expiry_date', value: 'expiry_date' },
  { title: 'Días restantes', key: 'days_remaining', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false },
])

// ── Helpers ──────────────────────────────────────────────────────────
/**
 * Format date to DD/MM/YYYY.
 * @param {string} dateStr - ISO date string
 * @returns {string}
 */
function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES')
}

/**
 * Get document type label in Spanish.
 * @param {string} type
 * @returns {string}
 */
function getDocTypeLabel(type) {
  const found = vehicleDocTypes.find(t => t.key === type)
  return found ? found.label : type || '—'
}

/**
 * Get document type icon.
 * @param {string} type
 * @returns {string}
 */
function getDocTypeIcon(type) {
  const found = vehicleDocTypes.find(t => t.key === type)
  return found?.icon || 'mdi-file-document-outline'
}

// ── Event handlers ───────────────────────────────────────────────────
/**
 * Handle VDataTableServer options change (page, sort, itemsPerPage).
 * @param {object} options
 */
function onOptionsUpdate(options) {
  const sortBy = options.sortBy?.[0]?.key || 'expiry_date'
  const sortAsc = options.sortBy?.[0]?.order === 'asc'
  emit('update:pagination', {
    page: options.page,
    pageSize: options.itemsPerPage,
    sortBy,
    sortAsc,
  })
}

/**
 * Navigate to vehicle detail on row click.
 * @param {object} _event
 * @param {object} row
 */
function handleRowClick(_event, row) {
  const vehicleId = row.item.vehicles?.id || row.item.vehicle_id
  if (vehicleId) {
    router.push({ name: 'VehicleDetail', params: { id: vehicleId } })
  }
}
</script>
