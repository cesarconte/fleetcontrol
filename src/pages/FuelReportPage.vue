<template>
  <VContainer fluid>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-2">
      <div class="d-flex align-center ga-3">
        <VBtn icon variant="text" @click="$router.push('/informes')">
          <VIcon>mdi-arrow-left</VIcon>
        </VBtn>
        <div>
          <h1 class="text-h4">Informe de Combustible</h1>
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
            title="Evolución del precio del combustible"
            :categories="priceTrendCategories"
            :series="priceTrendSeries"
          />
        </VCol>
        <VCol cols="12" md="6">
          <ReportBarChart
            title="Consumo por vehículo (L/100km)"
            :categories="consumptionCategories"
            :series="consumptionSeries"
          />
        </VCol>
      </VRow>

      <VRow class="mb-4">
        <VCol cols="12" md="6">
          <ReportLineChart
            title="Emisiones de CO₂"
            :categories="co2Categories"
            :series="co2Series"
          />
        </VCol>
      </VRow>

      <!-- Data table -->
      <VCard>
        <VCardTitle>Registro de repostajes</VCardTitle>
        <VDataTable
          :headers="tableHeaders"
          :items="rawData"
          :items-per-page="25"
          hover
          data-testid="fuel-table"
        >
          <template #item.refuel_date="{ item }">
            {{ formatDate(item.refuel_date) }}
          </template>
          <template #item.cost_eur="{ item }">
            {{ formatEur(item.cost_eur) }}
          </template>
          <template #item.price_per_liter="{ item }">
            {{ formatEur(item.price_per_liter) }}
          </template>
          <template #item.liters="{ item }">{{ formatNum(item.liters, 1) }} L</template>
          <template #item.consumption_l100km="{ item }">
            {{
              item.consumption_l100km != null
                ? formatNum(item.consumption_l100km, 1) + ' L/100km'
                : '—'
            }}
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
  setReportType('combustible')
})

const tableHeaders = [
  { title: 'Fecha', key: 'refuel_date', sortable: true },
  { title: 'Vehículo', key: 'vehicle_id', sortable: true },
  { title: 'Litros', key: 'liters', sortable: true },
  { title: 'Precio/L', key: 'price_per_liter', sortable: true },
  { title: 'Total', key: 'cost_eur', sortable: true },
  { title: 'Consumo', key: 'consumption_l100km', sortable: true },
]

function formatEur(v) {
  if (v == null) return '—'
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v)
}

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

const priceTrendCategories = computed(() =>
  (rawData.value ?? []).map(r => formatDate(r.refuel_date)),
)
const priceTrendSeries = computed(() => [
  {
    name: 'Precio/L',
    data: (rawData.value ?? []).map(r => r.price_per_liter ?? 0),
    color: '#F57C00',
  },
])

const consumptionCategories = computed(() =>
  (chartData.value.byVehicle ?? []).slice(0, 10).map(v => v.vehicle_id),
)
const consumptionSeries = computed(() => [
  {
    name: 'L/100km',
    data: (chartData.value.byVehicle ?? []).slice(0, 10).map(v => v.consumption_l100km),
    color: '#2196F3',
  },
])

const co2Categories = computed(() => (rawData.value ?? []).map(r => formatDate(r.refuel_date)))
const co2Series = computed(() => [
  {
    name: 'CO₂ (kg)',
    data: (rawData.value ?? []).map(r => r.co2_kg ?? 0),
    color: '#4CAF50',
    areaStyle: { opacity: 0.3 },
  },
])
</script>
