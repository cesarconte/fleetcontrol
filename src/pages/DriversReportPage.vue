<template>
  <VContainer fluid>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-2">
      <div class="d-flex align-center ga-3">
        <VBtn icon variant="text" @click="$router.push('/informes')">
          <VIcon>mdi-arrow-left</VIcon>
        </VBtn>
        <div>
          <h1 class="text-h4">Informe de Conductores</h1>
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
          <ReportBarChart
            title="Rutas por conductor"
            :categories="routesByDriverCategories"
            :series="routesByDriverSeries"
          />
        </VCol>
        <VCol cols="12" md="6">
          <ReportPieChart title="Estado de documentos" :data="docStatusPieData" doughnut />
        </VCol>
      </VRow>

      <!-- Data table -->
      <VCard>
        <VCardTitle>Listado de conductores</VCardTitle>
        <VDataTable
          :headers="tableHeaders"
          :items="rawData"
          :items-per-page="25"
          hover
          data-testid="drivers-table"
        >
          <template #item.status="{ item }">
            <VChip :color="driverStatusColor(item.status)" size="small">
              {{ driverStatusLabel(item.status) }}
            </VChip>
          </template>
          <template #item.license_expiry_date="{ item }">
            <span :class="expiryClass(item.license_expiry_date)">
              {{ formatDate(item.license_expiry_date) }}
            </span>
          </template>
          <template #item.cap_expiry_date="{ item }">
            <span :class="expiryClass(item.cap_expiry_date)">
              {{ formatDate(item.cap_expiry_date) }}
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
import ReportBarChart from '@/components/reports/ReportBarChart.vue'
import ReportPieChart from '@/components/reports/ReportPieChart.vue'
import ReportPeriodFilter from '@/components/reports/ReportPeriodFilter.vue'
import ReportExportBar from '@/components/reports/ReportExportBar.vue'

const {
  rawData,
  isLoading,
  error,
  kpis,
  chartData,
  period,
  dateFrom,
  dateTo,
  setReportType,
  setPeriod,
  exportPdf,
  exportXlsx,
} = useReports()

onMounted(() => {
  setReportType('conductores')
})

const tableHeaders = [
  { title: 'Nombre', key: 'full_name', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Caducidad carnet', key: 'license_expiry_date', sortable: true },
  { title: 'Caducidad CAP', key: 'cap_expiry_date', sortable: true },
]

function formatDate(v) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function driverStatusColor(s) {
  return (
    { active: 'success', on_route: 'info', on_leave: 'warning', inactive: 'error' }[s] ?? 'grey'
  )
}

function driverStatusLabel(s) {
  return (
    { active: 'Activo', on_route: 'En ruta', on_leave: 'Permiso', inactive: 'Inactivo' }[s] ?? s
  )
}

function expiryClass(dateStr) {
  if (!dateStr) return ''
  const days = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24)
  if (days < 0) return 'text-error'
  if (days <= 30) return 'text-warning'
  return ''
}

const routesByDriverCategories = computed(() =>
  (chartData.value.activity ?? []).slice(0, 10).map(d => d.driver_name ?? d.driver_id),
)
const routesByDriverSeries = computed(() => [
  {
    name: 'Rutas',
    data: (chartData.value.activity ?? []).slice(0, 10).map(d => d.routes_count),
    color: '#2196F3',
  },
])

const docStatusPieData = computed(() => {
  let valid = 0
  let expiring = 0
  let expired = 0
  const now = new Date()
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  for (const d of rawData.value ?? []) {
    const exp = d.license_expiry_date ? new Date(d.license_expiry_date) : null
    if (!exp || exp <= now) expired++
    else if (exp <= thirtyDays) expiring++
    else valid++
  }
  return [
    { name: 'En regla', value: valid },
    { name: 'Próximo a vencer', value: expiring },
    { name: 'Vencido', value: expired },
  ]
})
</script>
