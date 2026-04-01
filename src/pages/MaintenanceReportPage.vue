<template>
  <VContainer fluid>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-2">
      <div class="d-flex align-center ga-3">
        <VBtn icon variant="text" @click="$router.push('/informes')">
          <VIcon>mdi-arrow-left</VIcon>
        </VBtn>
        <div>
          <h1 class="text-h4">Informe de Mantenimiento</h1>
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
            title="Costes de mantenimiento por vehículo"
            :categories="costByVehicleCategories"
            :series="costByVehicleSeries"
          />
        </VCol>
        <VCol cols="12" md="6">
          <ReportPieChart title="Preventivo vs Correctivo" :data="typePieData" doughnut />
        </VCol>
      </VRow>

      <VRow class="mb-4">
        <VCol cols="12" md="6">
          <ReportLineChart
            title="Evolución mensual de costes"
            :categories="monthlyCostCategories"
            :series="monthlyCostSeries"
          />
        </VCol>
      </VRow>

      <!-- Data table -->
      <VCard>
        <VCardTitle>Registro de mantenimiento</VCardTitle>
        <VDataTable
          :headers="tableHeaders"
          :items="rawData"
          :items-per-page="25"
          hover
          data-testid="maintenance-table"
        >
          <template #item.scheduled_date="{ item }">
            {{ formatDate(item.scheduled_date) }}
          </template>
          <template #item.type="{ item }">
            <VChip :color="item.type === 'preventive' ? 'success' : 'warning'" size="small">
              {{ item.type === 'preventive' ? 'Preventivo' : 'Correctivo' }}
            </VChip>
          </template>
          <template #item.status="{ item }">
            <VChip :color="maintStatusColor(item.status)" size="small">
              {{ maintStatusLabel(item.status) }}
            </VChip>
          </template>
          <template #item.cost_eur="{ item }">
            {{ formatEur(item.cost_eur) }}
          </template>
          <template #item.downtime_hours="{ item }">
            {{ item.downtime_hours != null ? formatNum(item.downtime_hours, 1) + ' h' : '—' }}
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
  setReportType('mantenimiento')
})

const tableHeaders = [
  { title: 'Fecha', key: 'scheduled_date', sortable: true },
  { title: 'Vehículo', key: 'vehicle_id', sortable: true },
  { title: 'Tipo', key: 'type', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Coste', key: 'cost_eur', sortable: true },
  { title: 'Inactividad', key: 'downtime_hours', sortable: true },
]

function formatEur(v) {
  if (v == null) return '—'
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v)
}

function formatNum(v, d = 1) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(v ?? 0)
}

function formatDate(v) {
  return v
    ? new Date(v).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—'
}

function maintStatusColor(s) {
  return (
    { scheduled: 'info', in_progress: 'warning', completed: 'success', cancelled: 'error' }[s] ??
    'grey'
  )
}

function maintStatusLabel(s) {
  return (
    {
      scheduled: 'Programado',
      in_progress: 'En curso',
      completed: 'Completado',
      cancelled: 'Cancelado',
    }[s] ?? s
  )
}

const costByVehicleCategories = computed(() =>
  (chartData.value.byVehicle ?? []).slice(0, 10).map(v => v.vehicle_id),
)
const costByVehicleSeries = computed(() => [
  {
    name: 'Coste total',
    data: (chartData.value.byVehicle ?? []).slice(0, 10).map(v => v.total_cost),
    color: '#F57C00',
  },
])

const typePieData = computed(() => [
  { name: 'Preventivo', value: rawData.value.filter(r => r.type === 'preventive').length },
  { name: 'Correctivo', value: rawData.value.filter(r => r.type === 'corrective').length },
])

const monthlyCosts = computed(() => {
  const byMonth = {}
  for (const r of rawData.value ?? []) {
    const m = (r.scheduled_date ?? '').slice(0, 7)
    if (!m) continue
    byMonth[m] = (byMonth[m] ?? 0) + (r.cost_eur ?? 0)
  }
  return Object.keys(byMonth)
    .sort()
    .map(m => ({ month: m, cost: Math.round(byMonth[m] * 100) / 100 }))
})
const monthlyCostCategories = computed(() => monthlyCosts.value.map(m => m.month))
const monthlyCostSeries = computed(() => [
  { name: 'Coste', data: monthlyCosts.value.map(m => m.cost), color: '#F44336' },
])
</script>
