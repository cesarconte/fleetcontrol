<template>
  <VContainer fluid>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-2">
      <div class="d-flex align-center ga-3">
        <VBtn icon variant="text" @click="$router.push('/informes')">
          <VIcon>mdi-arrow-left</VIcon>
        </VBtn>
        <div>
          <h1 class="text-h4">Informe de Cumplimiento</h1>
          <span class="text-body-2 text-medium-emphasis">{{ dateFrom }} — {{ dateTo }}</span>
        </div>
      </div>
      <ReportExportBar :on-export-pdf="exportPdf" :on-export-xlsx="exportXlsx" />
    </div>

    <!-- Period filter -->
    <ReportPeriodFilter :model-value="period" @update:period="setPeriod" />

    <!-- Loading -->
    <VSkeletonLoader v-if="isLoading" type="card@4,table-trow@5" />

    <!-- Error -->
    <VAlert v-else-if="error" type="error" class="mb-4">
      {{ error.message }}
    </VAlert>

    <template v-else>
      <!-- KPIs -->
      <VRow class="mb-4">
        <VCol v-for="kpi in kpis" :key="kpi.key" cols="6" sm="4" md="3" lg="2">
          <ReportKpiCard :label="kpi.label" :formatted-value="kpi.formatted" :icon="kpi.icon" />
        </VCol>
      </VRow>

      <!-- Charts -->
      <VRow class="mb-4">
        <VCol cols="12" md="6">
          <ReportPieChart title="Documentos de vehículos" :data="vehicleDocsPieData" doughnut />
        </VCol>
        <VCol cols="12" md="6">
          <ReportPieChart title="Documentos de conductores" :data="driverDocsPieData" doughnut />
        </VCol>
      </VRow>

      <!-- Data table -->
      <VCard>
        <VCardTitle>Documentación combinada</VCardTitle>
        <VDataTable
          :headers="tableHeaders"
          :items="allDocs"
          :items-per-page="25"
          hover
          data-testid="compliance-table"
        >
          <template #item.status="{ item }">
            <VChip :color="docStatusColor(item.status)" size="small">
              {{ docStatusLabel(item.status) }}
            </VChip>
          </template>
          <template #item.expiry_date="{ item }">
            <span :class="expiryClass(item.expiry_date)">
              {{ formatDate(item.expiry_date) }}
            </span>
          </template>
        </VDataTable>
      </VCard>
    </template>
  </VContainer>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useReports } from '@/composables/use-reports.js'
import ReportKpiCard from '@/components/reports/ReportKpiCard.vue'
import ReportPieChart from '@/components/reports/ReportPieChart.vue'
import ReportPeriodFilter from '@/components/reports/ReportPeriodFilter.vue'
import ReportExportBar from '@/components/reports/ReportExportBar.vue'

const {
  rawData,
  secondaryData,
  isLoading,
  error,
  kpis,
  period,
  dateFrom,
  dateTo,
  setReportType,
  setPeriod,
  exportPdf,
  exportXlsx,
} = useReports()

onMounted(() => {
  setReportType('cumplimiento')
})

const tableHeaders = [
  { title: 'Entidad', key: 'entity_type', sortable: true },
  { title: 'Nombre', key: 'entity_name', sortable: true },
  { title: 'Documento', key: 'doc_type', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Caducidad', key: 'expiry_date', sortable: true },
]

function formatDate(v) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function classifyDoc(expiryDate) {
  if (!expiryDate) return 'unknown'
  const now = new Date()
  const exp = new Date(expiryDate)
  const days = (exp - now) / (1000 * 60 * 60 * 24)
  if (days < 0) return 'expired'
  if (days <= 7) return 'critical'
  if (days <= 30) return 'expiring_soon'
  return 'valid'
}

function docStatusColor(s) {
  return (
    { valid: 'success', expiring_soon: 'warning', critical: 'error', expired: 'error' }[s] ?? 'grey'
  )
}

function docStatusLabel(s) {
  return (
    {
      valid: 'En regla',
      expiring_soon: 'Próximo a vencer',
      critical: 'Crítico',
      expired: 'Vencido',
    }[s] ?? s
  )
}

function expiryClass(dateStr) {
  const status = classifyDoc(dateStr)
  if (status === 'expired') return 'text-error'
  if (status === 'critical' || status === 'expiring_soon') return 'text-warning'
  return ''
}

const allDocs = computed(() => {
  const vehicleDocs = (rawData.value ?? []).map(d => ({
    ...d,
    entity_type: 'Vehículo',
    status: classifyDoc(d.expiry_date),
  }))
  const driverDocs = (secondaryData.value ?? []).map(d => ({
    ...d,
    entity_type: 'Conductor',
    status: classifyDoc(d.expiry_date),
  }))
  return [...vehicleDocs, ...driverDocs]
})

const vehicleDocsPieData = computed(() => {
  const counts = { valid: 0, expiring_soon: 0, critical: 0, expired: 0 }
  for (const d of rawData.value ?? []) {
    counts[classifyDoc(d.expiry_date)]++
  }
  return [
    { name: 'En regla', value: counts.valid },
    { name: 'Próximo a vencer', value: counts.expiring_soon },
    { name: 'Crítico', value: counts.critical },
    { name: 'Vencido', value: counts.expired },
  ]
})

const driverDocsPieData = computed(() => {
  const counts = { valid: 0, expiring_soon: 0, critical: 0, expired: 0 }
  for (const d of secondaryData.value ?? []) {
    counts[classifyDoc(d.expiry_date)]++
  }
  return [
    { name: 'En regla', value: counts.valid },
    { name: 'Próximo a vencer', value: counts.expiring_soon },
    { name: 'Crítico', value: counts.critical },
    { name: 'Vencido', value: counts.expired },
  ]
})
</script>
