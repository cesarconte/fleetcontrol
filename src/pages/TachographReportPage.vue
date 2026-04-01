<template>
  <VContainer fluid>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-2">
      <div class="d-flex align-center ga-3">
        <VBtn icon variant="text" @click="$router.push('/informes')">
          <VIcon>mdi-arrow-left</VIcon>
        </VBtn>
        <div>
          <h1 class="text-h4">Informe de Tacógrafos</h1>
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
            title="Infracciones por conductor"
            :categories="violationsByDriverCategories"
            :series="violationsByDriverSeries"
          />
        </VCol>
        <VCol cols="12" md="6">
          <ReportLineChart
            title="Evolución de horas de conducción"
            :categories="drivingHoursCategories"
            :series="drivingHoursSeries"
          />
        </VCol>
      </VRow>

      <!-- Data table -->
      <VCard>
        <VCardTitle>Registros de tacógrafo</VCardTitle>
        <VDataTable
          :headers="tableHeaders"
          :items="rawData"
          :items-per-page="25"
          hover
          data-testid="tachograph-table"
        >
          <template #item.download_date="{ item }">
            {{ formatDate(item.download_date) }}
          </template>
          <template #item.driving_hours="{ item }">
            {{ item.driving_hours != null ? formatNum(item.driving_hours, 1) + ' h' : '—' }}
          </template>
          <template #item.violations_count="{ item }">
            <VChip :color="item.violations_count > 0 ? 'error' : 'success'" size="small">
              {{ item.violations_count ?? 0 }}
            </VChip>
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
import ReportLineChart from '@/components/reports/ReportLineChart.vue'
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
  setReportType('tacografos')
})

const tableHeaders = [
  { title: 'Fecha descarga', key: 'download_date', sortable: true },
  { title: 'Conductor', key: 'driver_id', sortable: true },
  { title: 'Vehículo', key: 'vehicle_id', sortable: true },
  { title: 'Horas conducción', key: 'driving_hours', sortable: true },
  { title: 'Infracciones', key: 'violations_count', sortable: true },
]

function formatNum(v, decimals = 1) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v ?? 0)
}

function formatDate(v) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const violationsByDriverCategories = computed(() =>
  (chartData.value.byDriver ?? []).slice(0, 10).map(d => d.driver_id),
)
const violationsByDriverSeries = computed(() => [
  {
    name: 'Infracciones',
    data: (chartData.value.byDriver ?? []).slice(0, 10).map(d => d.violations),
    color: '#F44336',
  },
])

const drivingHoursCategories = computed(() =>
  (rawData.value ?? []).map(r => formatDate(r.download_date)),
)
const drivingHoursSeries = computed(() => [
  {
    name: 'Horas conducción',
    data: (rawData.value ?? []).map(r => r.driving_hours ?? 0),
    color: '#2196F3',
  },
])
</script>
