<template>
  <VContainer fluid>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-2">
      <div class="d-flex align-center ga-3">
        <VBtn icon variant="text" @click="$router.push('/informes')">
          <VIcon>mdi-arrow-left</VIcon>
        </VBtn>
        <div>
          <h1 class="text-h4">Informe de Rutas</h1>
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
          <ReportLineChart
            title="Evolución mensual: Ingresos vs Costes vs Beneficio"
            :categories="monthlyCategories"
            :series="monthlySeries"
          />
        </VCol>
        <VCol cols="12" md="6">
          <ReportPieChart title="Desglose de incidencias" :data="chartData.incidents" doughnut />
        </VCol>
      </VRow>

      <VRow class="mb-4">
        <VCol cols="12" md="6">
          <ReportBarChart
            title="Top 10 rutas por coste"
            :categories="topRoutesCategories"
            :series="topRoutesSeries"
          />
        </VCol>
      </VRow>

      <!-- Data table -->
      <VCard>
        <VCardTitle>Detalle de rutas</VCardTitle>
        <VDataTable
          :headers="tableHeaders"
          :items="rawData"
          :items-per-page="25"
          hover
          data-testid="routes-table"
        >
          <template #item.departure_date="{ item }">
            {{ formatDate(item.departure_date) }}
          </template>
          <template #item.route_label="{ item }">
            {{ item.origin_city ?? '' }} → {{ item.destination_city ?? '' }}
          </template>
          <template #item.revenue_eur="{ item }">
            {{ formatEur(item.revenue_eur) }}
          </template>
          <template #item.total_variable_cost_eur="{ item }">
            {{ formatEur(item.total_variable_cost_eur) }}
          </template>
          <template #item.gross_margin_eur="{ item }">
            <span :class="item.gross_margin_eur >= 0 ? 'text-success' : 'text-error'">
              {{ formatEur(item.gross_margin_eur) }}
            </span>
          </template>
          <template #item.delay_minutes="{ item }">{{ item.delay_minutes ?? 0 }} min</template>
          <template #item.incidents_count="{ item }">
            <VChip :color="incidentColor(item.incidents_count ?? 0)" size="small">
              {{ item.incidents_count ?? 0 }}
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
  setReportType('rutas')
})

function formatEur(v) {
  if (v == null) return '—'
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v)
}

function formatDate(v) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function incidentColor(count) {
  if (count === 0) return 'success'
  if (count <= 2) return 'warning'
  return 'error'
}

const tableHeaders = [
  { title: 'Fecha', key: 'departure_date', sortable: true },
  { title: 'Ruta', key: 'route_label', sortable: false },
  { title: 'Km', key: 'distance_covered_km', sortable: true },
  { title: 'Ingreso', key: 'revenue_eur', sortable: true },
  { title: 'Coste', key: 'total_variable_cost_eur', sortable: true },
  { title: 'Margen', key: 'gross_margin_eur', sortable: true },
  { title: 'Retraso', key: 'delay_minutes', sortable: true },
  { title: 'Incidencias', key: 'incidents_count', sortable: true },
]

const monthlyCategories = computed(() => (chartData.value.monthlyTrend ?? []).map(m => m.month))
const monthlySeries = computed(() => [
  {
    name: 'Ingresos',
    data: (chartData.value.monthlyTrend ?? []).map(m => m.revenue),
    color: '#4CAF50',
  },
  {
    name: 'Costes',
    data: (chartData.value.monthlyTrend ?? []).map(m => m.costs),
    color: '#F44336',
  },
  {
    name: 'Beneficio',
    data: (chartData.value.monthlyTrend ?? []).map(m => m.profit),
    color: '#2196F3',
  },
])

const topRoutesCategories = computed(() =>
  (rawData.value ?? []).slice(0, 10).map(r => `${r.origin_city ?? ''}→${r.destination_city ?? ''}`),
)
const topRoutesSeries = computed(() => [
  {
    name: 'Coste total',
    data: (rawData.value ?? [])
      .slice(0, 10)
      .map(r => (r.total_variable_cost_eur ?? 0) + (r.allocated_fixed_cost_eur ?? 0)),
    color: '#F57C00',
  },
])
</script>
