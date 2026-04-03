<template>
  <div class="driver-documents-table">
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
      <!-- Driver column -->
      <template #item.driver="{ item }">
        <RouterLink
          v-if="item.drivers?.id"
          :to="{ name: 'DriverDetail', params: { id: item.drivers.id } }"
          class="text-primary"
        >
          {{ item.drivers?.full_name || '—' }}
        </RouterLink>
        <span v-else class="text-medium-emphasis">
          {{ item.drivers?.full_name || '—' }}
        </span>
        <div class="text-caption text-medium-emphasis">
          {{ item.drivers?.national_id || '' }}
        </div>
      </template>

      <!-- Document type -->
      <template #item.doc_type="{ item }">
        <div class="d-flex align-center ga-2">
          <VIcon :icon="getDocTypeIcon(item.doc_type)" size="small" />
          {{ getDocTypeLabel(item.doc_type) }}
        </div>
      </template>

      <!-- Category -->
      <template #item.category="{ item }">
        {{ item.category || '—' }}
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
            No se encontraron documentos de conductores con los filtros actuales.
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
                {{ doc.drivers?.full_name || '—' }}
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
 * FleetControl — Driver Documents Table
 *
 * Server-side paginated table of all driver documents.
 * Desktop: VDataTableServer | Mobile: Card list
 *
 * @see docs/plans/feature-documentos-centralizados-plan.md — Fase 4
 */

import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DocumentStatusChip from './DocumentStatusChip.vue'
import DocumentExpiryBadge from './DocumentExpiryBadge.vue'
import { DRIVER_DOCUMENT_TYPES } from '@/constants/driver-document-types.js'

const driverDocTypes = Object.values(DRIVER_DOCUMENT_TYPES)

defineProps({
  items: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  pagination: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['action', 'update:pagination'])
const router = useRouter()

const headers = computed(() => [
  { title: 'Conductor', key: 'driver', sortable: false },
  { title: 'Tipo', key: 'doc_type', value: 'doc_type' },
  { title: 'Categoría', key: 'category', value: 'category' },
  { title: 'Nº documento', key: 'reference_number', value: 'reference_number' },
  { title: 'Estado', key: 'status', value: 'status' },
  { title: 'Expedición', key: 'issue_date', value: 'issue_date' },
  { title: 'Vencimiento', key: 'expiry_date', value: 'expiry_date' },
  { title: 'Días restantes', key: 'days_remaining', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false },
])

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES')
}

function getDocTypeLabel(type) {
  const found = driverDocTypes.find(t => t.key === type)
  return found ? found.label : type || '—'
}

function getDocTypeIcon(type) {
  const found = driverDocTypes.find(t => t.key === type)
  return found?.icon || 'mdi-file-document-outline'
}

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

function handleRowClick(_event, row) {
  const driverId = row.item.drivers?.id || row.item.driver_id
  if (driverId) {
    router.push({ name: 'DriverDetail', params: { id: driverId } })
  }
}
</script>
