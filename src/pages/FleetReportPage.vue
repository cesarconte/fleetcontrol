<template>
  <VContainer fluid>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-2">
      <div class="d-flex align-center ga-3">
        <VBtn icon variant="text" @click="$router.push('/informes')">
          <VIcon>mdi-arrow-left</VIcon>
        </VBtn>
        <div>
          <h1 class="text-h4">Informe de Flota</h1>
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
          <ReportPieChart title="Vehículos por estado" :data="statusPieData" doughnut />
        </VCol>
        <VCol cols="12" md="6">
          <ReportPieChart title="Vehículos por etiqueta DGT" :data="dgtPieData" doughnut />
        </VCol>
      </VRow>

      <VRow class="mb-4">
        <VCol cols="12" md="6">
          <ReportBarChart
            title="Vehículos por tipo"
            :categories="vehicleTypeCategories"
            :series="vehicleTypeSeries"
          />
        </VCol>
      </VRow>

      <!-- Data table -->
      <VCard>
        <VCardTitle>Listado de vehículos</VCardTitle>
        <VDataTable
          :headers="tableHeaders"
          :items="rawData"
          :items-per-page="25"
          hover
          data-testid="fleet-table"
        >
          <template #item.status="{ item }">
            <VChip :color="statusColor(item.status)" size="small">
              {{ statusLabel(item.status) }}
            </VChip>
          </template>
          <template #item.total_odometer_km="{ item }">
            {{ formatKm(item.total_odometer_km) }}
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
  period,
  dateFrom,
  dateTo,
  setReportType,
  setPeriod,
  exportPdf,
  exportXlsx,
} = useReports()

onMounted(() => {
  setReportType('flota')
})

const tableHeaders = [
  { title: 'Matrícula', key: 'plate', sortable: true },
  { title: 'Marca', key: 'brand', sortable: true },
  { title: 'Modelo', key: 'model', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Odómetro (km)', key: 'total_odometer_km', sortable: true },
]

function formatKm(v) {
  if (v == null) return '—'
  return new Intl.NumberFormat('es-ES').format(v) + ' km'
}

function statusColor(s) {
  return (
    { active: 'success', on_route: 'info', in_maintenance: 'warning', inactive: 'error' }[s] ??
    'grey'
  )
}

function statusLabel(s) {
  return (
    {
      active: 'Activo',
      on_route: 'En ruta',
      in_maintenance: 'Mantenimiento',
      inactive: 'Inactivo',
    }[s] ?? s
  )
}

const statusPieData = computed(() => {
  const counts = {}
  for (const v of rawData.value ?? []) {
    const s = v.status ?? 'unknown'
    counts[s] = (counts[s] ?? 0) + 1
  }
  return Object.entries(counts).map(([name, value]) => ({ name: statusLabel(name), value }))
})

const dgtPieData = computed(() => {
  const counts = {}
  for (const v of rawData.value ?? []) {
    const badge = v.dgt_badge ?? 'Sin etiqueta'
    counts[badge] = (counts[badge] ?? 0) + 1
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
})

const vehicleTypeCategories = computed(() => {
  const counts = {}
  for (const v of rawData.value ?? []) {
    const t = v.vehicle_type ?? 'Otro'
    counts[t] = (counts[t] ?? 0) + 1
  }
  return Object.keys(counts)
})

const vehicleTypeSeries = computed(() => {
  const counts = {}
  for (const v of rawData.value ?? []) {
    const t = v.vehicle_type ?? 'Otro'
    counts[t] = (counts[t] ?? 0) + 1
  }
  return [{ name: 'Vehículos', data: Object.values(counts), color: '#F57C00' }]
})
</script>
