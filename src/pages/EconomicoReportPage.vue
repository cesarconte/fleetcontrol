<template>
  <VContainer fluid>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-2">
      <div class="d-flex align-center ga-3">
        <VBtn icon variant="text" @click="$router.push('/informes')">
          <VIcon>mdi-arrow-left</VIcon>
        </VBtn>
        <div>
          <h1 class="text-h4">Informe Económico</h1>
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
          <ReportPieChart
            title="Desglose de costes por categoría"
            :data="chartData.costBreakdown"
            doughnut
          />
        </VCol>
      </VRow>

      <VRow class="mb-4">
        <VCol cols="12" md="6">
          <ReportBarChart
            title="Rentabilidad por vehículo"
            :categories="vehicleCategories"
            :series="vehicleSeries"
          />
        </VCol>
        <VCol cols="12" md="6">
          <ReportBarChart
            title="Top 10 rutas más rentables"
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
          data-testid="economico-table"
        >
          <template #item.gross_margin_eur="{ item }">
            <span :class="item.gross_margin_eur >= 0 ? 'text-success' : 'text-error'">
              {{ formatEur(item.gross_margin_eur) }}
            </span>
          </template>
          <template #item.net_margin_eur="{ item }">
            <span :class="item.net_margin_eur >= 0 ? 'text-success' : 'text-error'">
              {{ formatEur(item.net_margin_eur) }}
            </span>
          </template>
          <template #item.revenue_eur="{ item }">
            {{ formatEur(item.revenue_eur) }}
          </template>
        </VDataTable>
      </VCard>
    </template>
  </VContainer>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useInformes } from '@/composables/use-informes.js'
import ReportKpiCard from '@/components/reports/ReportKpiCard.vue'
import ReportChartCard from '@/components/reports/ReportChartCard.vue'
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
  fetch,
  setPeriod,
  exportPdf,
  exportXlsx,
} = useInformes()

onMounted(() => {
  setPeriod('este_mes')
})

function formatEur(v) {
  if (v == null) return '—'
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v)
}

const tableHeaders = [
  { title: 'Fecha', key: 'departure_date', sortable: true },
  { title: 'Ruta', key: 'route_label', sortable: false },
  { title: 'Km', key: 'distance_covered_km', sortable: true },
  { title: 'Ingreso', key: 'revenue_eur', sortable: true },
  { title: 'Coste Variable', key: 'total_variable_cost_eur', sortable: true },
  { title: 'Coste Fijo', key: 'allocated_fixed_cost_eur', sortable: true },
  { title: 'Margen Bruto', key: 'gross_margin_eur', sortable: true },
  { title: 'Margen Neto', key: 'net_margin_eur', sortable: true },
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

const vehicleCategories = computed(() =>
  (chartData.value.profitByVehicle ?? []).slice(0, 10).map(v => v.vehicle_id),
)
const vehicleSeries = computed(() => [
  {
    name: 'Beneficio neto',
    data: (chartData.value.profitByVehicle ?? []).slice(0, 10).map(v => v.profit),
    color: '#F57C00',
  },
])

const topRoutesCategories = computed(() =>
  (rawData.value ?? []).slice(0, 10).map(r => `${r.origin_city ?? ''}→${r.destination_city ?? ''}`),
)
const topRoutesSeries = computed(() => [
  {
    name: 'Margen neto',
    data: (rawData.value ?? []).slice(0, 10).map(r => r.net_margin_eur ?? 0),
    color: '#4CAF50',
  },
])
</script>
