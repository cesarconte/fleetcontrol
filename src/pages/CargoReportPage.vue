<template>
  <VContainer fluid>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-2">
      <div class="d-flex align-center ga-3">
        <VBtn icon variant="text" @click="$router.push('/informes')">
          <VIcon>mdi-arrow-left</VIcon>
        </VBtn>
        <div>
          <h1 class="text-h4">Informe de Cargas</h1>
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
          <ReportPieChart title="Cargas por tipo" :data="chartData.byType" doughnut />
        </VCol>
        <VCol cols="12" md="6">
          <ReportBarChart
            title="Peso por ruta (kg)"
            :categories="weightByRouteCategories"
            :series="weightByRouteSeries"
          />
        </VCol>
      </VRow>

      <!-- Data table -->
      <VCard>
        <VCardTitle>Registro de cargas</VCardTitle>
        <VDataTable
          :headers="tableHeaders"
          :items="rawData"
          :items-per-page="25"
          hover
          data-testid="cargo-table"
        >
          <template #item.peso_kg="{ item }">{{ formatNum(item.peso_kg, 0) }} kg</template>
          <template #item.volumen_m3="{ item }">{{ formatNum(item.volumen_m3, 1) }} m³</template>
          <template #item.adr_clase="{ item }">
            <VChip v-if="item.adr_clase" color="warning" size="small">
              ADR {{ item.adr_clase }}
            </VChip>
            <span v-else>—</span>
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
  setReportType('cargas')
})

const tableHeaders = [
  { title: 'Descripción', key: 'description', sortable: false },
  { title: 'Tipo', key: 'cargo_type', sortable: true },
  { title: 'Peso (kg)', key: 'peso_kg', sortable: true },
  { title: 'Volumen (m³)', key: 'volumen_m3', sortable: true },
  { title: 'ADR', key: 'adr_clase', sortable: true },
]

function formatNum(v, decimals = 1) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v ?? 0)
}

const weightByRouteCategories = computed(() =>
  (rawData.value ?? []).slice(0, 10).map((_, i) => `Ruta ${i + 1}`),
)
const weightByRouteSeries = computed(() => [
  {
    name: 'Peso (kg)',
    data: (rawData.value ?? []).slice(0, 10).map(c => c.peso_kg ?? 0),
    color: '#F57C00',
  },
])
</script>
