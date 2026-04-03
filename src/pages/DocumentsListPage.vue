<template>
  <VContainer fluid class="documents-page">
    <h1 class="text-h4 mb-4">Documentación</h1>

    <!-- KPI Cards -->
    <VRow>
      <VCol cols="6" sm="4" md="2">
        <ReportKpiCard
          label="Total"
          :formatted-value="String(kpis.total)"
          color="primary"
          class="clickable-kpi"
          @click="filterByStatus(null)"
        />
      </VCol>
      <VCol cols="6" sm="4" md="2">
        <ReportKpiCard
          label="En regla"
          :formatted-value="String(kpis.valid)"
          color="success"
          class="clickable-kpi"
          @click="filterByStatus('valid')"
        />
      </VCol>
      <VCol cols="6" sm="4" md="2">
        <ReportKpiCard
          label="Próximos"
          :formatted-value="String(kpis.expiringSoon)"
          color="warning"
          class="clickable-kpi"
          @click="filterByStatus('expiring_soon')"
        />
      </VCol>
      <VCol cols="6" sm="4" md="2">
        <ReportKpiCard
          label="Críticos"
          :formatted-value="String(kpis.critical)"
          color="error"
          class="clickable-kpi"
          @click="filterByStatus('critical')"
        />
      </VCol>
      <VCol cols="6" sm="4" md="2">
        <ReportKpiCard
          label="Vencidos"
          :formatted-value="String(kpis.expired)"
          color="error"
          class="clickable-kpi"
          @click="filterByStatus('expired')"
        />
      </VCol>
      <VCol cols="6" sm="4" md="2">
        <ReportKpiCard
          label="Cumplimiento"
          :formatted-value="`${kpis.complianceRate}%`"
          :color="complianceColor"
        />
      </VCol>
    </VRow>

    <!-- Global Action Bar -->
    <VRow class="mt-2" align="center">
      <VCol>
        <DocumentFilterBar
          v-model="filters"
          v-model:search="searchQuery"
          :tab="activeTab"
          @export="exportToCsv"
          @clear="onClearFilters"
        />
      </VCol>
    </VRow>

    <!-- Generate button -->
    <VRow class="mt-1">
      <VCol>
        <VBtn
          color="primary"
          prepend-icon="mdi-file-plus"
          data-testid="btn-generate-document"
          @click="showGenerateDialog = true"
        >
          Generar documento
        </VBtn>
      </VCol>
    </VRow>

    <!-- Tabs -->
    <VTabs v-model="activeTab" class="mt-2">
      <VTab value="vehicles" data-testid="tab-vehicles">Vehículos</VTab>
      <VTab value="drivers" data-testid="tab-drivers">Conductores</VTab>
      <VTab value="transport" data-testid="tab-transport">Transporte Generado</VTab>
    </VTabs>

    <!-- Tab Panels -->
    <VWindow v-model="activeTab" class="mt-2">
      <!-- Vehicles Panel -->
      <VWindowItem value="vehicles">
        <VehicleDocumentsTable
          :items="items"
          :loading="isLoading"
          :pagination="pagination"
          @update:pagination="onPaginationUpdate"
          @action="handleAction"
        />
      </VWindowItem>

      <!-- Drivers Panel -->
      <VWindowItem value="drivers">
        <DriverDocumentsTable
          :items="items"
          :loading="isLoading"
          :pagination="pagination"
          @update:pagination="onPaginationUpdate"
          @action="handleAction"
        />
      </VWindowItem>

      <!-- Transport Panel -->
      <VWindowItem value="transport">
        <GeneratedDocumentsTable
          :items="items"
          :loading="isLoading"
          :pagination="pagination"
          @update:pagination="onPaginationUpdate"
          @action="handleAction"
        />
      </VWindowItem>
    </VWindow>

    <!-- Dialogs -->
    <GenerateDocumentDialog v-model="showGenerateDialog" @generated="onDocumentGenerated" />
    <DocumentActionsDialog
      v-model="showActionsDialog"
      :mode="actionMode"
      :document="selectedDocument"
      :entity-type="entityTypeForTab"
      @saved="onDocumentSaved"
    />
  </VContainer>
</template>

<script setup>
/**
 * FleetControl — Documents List Page
 *
 * Centralized document management page for the entire fleet.
 * Shows vehicle, driver, and generated transport documents with
 * KPIs, filters, search, pagination, and export.
 *
 * @see docs/plans/feature-documentos-centralizados-plan.md — Fase 4
 */

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import ReportKpiCard from '@/components/reports/ReportKpiCard.vue'
import DocumentFilterBar from '@/components/documents/DocumentFilterBar.vue'
import VehicleDocumentsTable from '@/components/documents/VehicleDocumentsTable.vue'
import DriverDocumentsTable from '@/components/documents/DriverDocumentsTable.vue'
import GeneratedDocumentsTable from '@/components/documents/GeneratedDocumentsTable.vue'
import GenerateDocumentDialog from '@/components/documents/GenerateDocumentDialog.vue'
import DocumentActionsDialog from '@/components/documents/DocumentActionsDialog.vue'
import { useDocumentManagement } from '@/composables/use-document-management.js'
import { useNotificationStore } from '@/stores/notifications.js'

const notifications = useNotificationStore()

// ── Composable ───────────────────────────────────────────────────────
const {
  activeTab,
  kpis,
  filters,
  searchQuery,
  pagination,
  items,
  isLoading,
  fetchKpis,
  fetchDocuments,
  clearFilters,
  setPagination,
  filterByStatus,
  exportToCsv,
  cleanup,
} = useDocumentManagement()

// ── Local state ──────────────────────────────────────────────────────
const showGenerateDialog = ref(false)
const showActionsDialog = ref(false)
const selectedDocument = ref(null)
const actionMode = ref('view') // 'create' | 'edit' | 'view'

// ── Computed ─────────────────────────────────────────────────────────
const complianceColor = computed(() => {
  if (kpis.value.complianceRate >= 90) return 'success'
  if (kpis.value.complianceRate >= 70) return 'warning'
  return 'error'
})

const entityTypeForTab = computed(() => {
  if (activeTab.value === 'vehicles') return 'vehicle'
  if (activeTab.value === 'drivers') return 'driver'
  return 'vehicle' // default
})

// ── Watchers ─────────────────────────────────────────────────────────
watch(activeTab, () => {
  fetchDocuments()
  fetchKpis()
})

// ── Lifecycle ────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([fetchKpis(), fetchDocuments()])
})

onUnmounted(() => {
  cleanup()
})

// ── Handlers ─────────────────────────────────────────────────────────
/**
 * Handle pagination update from table.
 * @param {object} newPagination
 */
function onPaginationUpdate(newPagination) {
  setPagination(newPagination.page, newPagination.pageSize)
  if (newPagination.sortBy) {
    // Sort is handled by the composable's setSort if needed
  }
}

/**
 * Handle clear filters from filter bar.
 */
function onClearFilters() {
  clearFilters()
}

/**
 * Handle action from table (view, edit, download, delete).
 * @param {object} payload - { action, item }
 */
async function handleAction({ action, item }) {
  if (action === 'view') {
    selectedDocument.value = item
    actionMode.value = 'view'
    showActionsDialog.value = true
  } else if (action === 'edit') {
    selectedDocument.value = item
    actionMode.value = 'edit'
    showActionsDialog.value = true
  } else if (action === 'download' && item.file_url) {
    // Open file URL in new tab
    window.open(item.file_url, '_blank')
  } else if (action === 'delete') {
    // TODO: implement delete with confirmation
    notifications.warning('Eliminación pendiente de implementar')
  }
}

/**
 * Handle document generation complete.
 */
function onDocumentGenerated() {
  notifications.success('Documento generado correctamente')
  fetchDocuments()
}

/**
 * Handle document saved (create/edit).
 */
function onDocumentSaved() {
  notifications.success('Documento guardado correctamente')
  fetchDocuments()
}
</script>

<style scoped>
.documents-page {
  padding: 16px;
}

.clickable-kpi {
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.clickable-kpi:hover {
  opacity: 0.85;
}
</style>
