<template>
  <VContainer fluid class="documents-page">
    <h1 class="text-h4 mb-4">Documentación</h1>

    <!-- KPI Cards -->
    <VRow>
      <VCol v-for="kpi in kpiCards" :key="kpi.label" cols="6" sm="4" md="2">
        <ReportKpiCard
          :label="kpi.label"
          :formatted-value="kpi.value"
          :color="kpi.color"
          :class="{ 'clickable-kpi': kpi.clickable }"
          @click="kpi.status !== undefined && filterByStatus(kpi.status)"
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
          @clear="clearFilters"
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
      <VWindowItem value="vehicles">
        <VehicleDocumentsTable
          :items="items"
          :loading="isLoading"
          :pagination="pagination"
          @update:pagination="onPaginationUpdate"
          @action="handleAction"
        />
      </VWindowItem>
      <VWindowItem value="drivers">
        <DriverDocumentsTable
          :items="items"
          :loading="isLoading"
          :pagination="pagination"
          @update:pagination="onPaginationUpdate"
          @action="handleAction"
        />
      </VWindowItem>
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
    <DeleteConfirmDialog
      v-model="showDeleteConfirm"
      :document="documentToDelete"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </VContainer>
</template>

<script setup>
/**
 * FleetControl — Documents List Page
 * Centralized document management for the entire fleet.
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
import DeleteConfirmDialog from '@/components/documents/DeleteConfirmDialog.vue'
import { useDocumentManagement } from '@/composables/use-document-management.js'
import { useNotificationStore } from '@/stores/notifications.js'

const notifications = useNotificationStore()

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
  deleteDocument,
  cleanup,
} = useDocumentManagement()

const showGenerateDialog = ref(false)
const showActionsDialog = ref(false)
const showDeleteConfirm = ref(false)
const selectedDocument = ref(null)
const actionMode = ref('view')
const documentToDelete = ref(null)

const complianceColor = computed(() => {
  if (kpis.value.complianceRate >= 90) return 'success'
  if (kpis.value.complianceRate >= 70) return 'warning'
  return 'error'
})

const entityTypeForTab = computed(() => {
  if (activeTab.value === 'vehicles') return 'vehicle'
  if (activeTab.value === 'drivers') return 'driver'
  return 'transport'
})

const kpiCards = computed(() => [
  {
    label: 'Total',
    value: String(kpis.value.total),
    color: 'primary',
    clickable: true,
    status: null,
  },
  {
    label: 'En regla',
    value: String(kpis.value.valid),
    color: 'success',
    clickable: true,
    status: 'valid',
  },
  {
    label: 'Próximos',
    value: String(kpis.value.expiringSoon),
    color: 'warning',
    clickable: true,
    status: 'expiring_soon',
  },
  {
    label: 'Críticos',
    value: String(kpis.value.critical),
    color: 'error',
    clickable: true,
    status: 'critical',
  },
  {
    label: 'Vencidos',
    value: String(kpis.value.expired),
    color: 'error',
    clickable: true,
    status: 'expired',
  },
  {
    label: 'Cumplimiento',
    value: `${kpis.value.complianceRate}%`,
    color: complianceColor.value,
    clickable: false,
  },
])

watch(activeTab, () => {
  fetchDocuments()
  fetchKpis()
})

onMounted(async () => {
  await Promise.all([fetchKpis(), fetchDocuments()])
})
onUnmounted(() => {
  cleanup()
})

function onPaginationUpdate(p) {
  setPagination(p.page, p.pageSize)
}

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
    window.open(item.file_url, '_blank')
  } else if (action === 'delete') {
    documentToDelete.value = item
    showDeleteConfirm.value = true
  }
}

async function confirmDelete() {
  if (!documentToDelete.value) return
  try {
    await deleteDocument(documentToDelete.value.id, entityTypeForTab.value)
    notifications.success('Documento eliminado correctamente')
  } catch (err) {
    notifications.error(`Error al eliminar: ${err.message || 'Error desconocido'}`)
  } finally {
    documentToDelete.value = null
    showDeleteConfirm.value = false
  }
}

function cancelDelete() {
  documentToDelete.value = null
  showDeleteConfirm.value = false
}
function onDocumentGenerated() {
  notifications.success('Documento generado correctamente')
  fetchDocuments()
}
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
