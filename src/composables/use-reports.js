/**
 * FleetControl — useInformes Composable
 *
 * Reactive informe state with data fetching, aggregation, and export.
 *
 * @see PRD §4.9 — Informes
 */

import { ref, computed } from 'vue'
import { apiReports } from '@/services/api-reports.js'
import { useNotificationStore } from '@/stores/notifications.js'
import { getReportPeriodOptions } from '@/constants/report-types.js'
import {
  aggregateFinancialKpis,
  aggregateCostBreakdown,
  aggregateProfitByVehicle,
  aggregateMonthlyTrend,
  aggregateFleetKpis,
  aggregateCargoKpis,
} from '@/utils/report-aggregations.js'
import { exportPdf as doExportPdf } from '@/utils/export-pdf.js'
import { exportXlsx as doExportXlsx } from '@/utils/export-xlsx.js'

export function useInformes() {
  const type = ref('economico')
  const rawData = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const period = ref('este_mes')
  const dateFrom = ref('')
  const dateTo = ref('')

  const notifications = useNotificationStore()

  function resolveDates() {
    const options = getReportPeriodOptions()
    const opt = options.find(o => o.value === period.value)
    if (opt && opt.dateFrom) {
      dateFrom.value = opt.dateFrom()
      dateTo.value = opt.dateTo()
    }
  }

  const kpis = computed(() => {
    if (!rawData.value.length) return []
    switch (type.value) {
      case 'economico':
      case 'rutas':
        return aggregateFinancialKpis(rawData.value)
      case 'flota':
        return aggregateFleetKpis(rawData.value)
      case 'cargas':
        return aggregateCargoKpis(rawData.value)
      default:
        return []
    }
  })

  const chartData = computed(() => {
    if (!rawData.value.length) return {}
    switch (type.value) {
      case 'economico':
        return {
          costBreakdown: aggregateCostBreakdown(rawData.value),
          profitByVehicle: aggregateProfitByVehicle(rawData.value),
          monthlyTrend: aggregateMonthlyTrend(rawData.value),
        }
      default:
        return {}
    }
  })

  async function fetch() {
    isLoading.value = true
    error.value = null
    try {
      if (!dateFrom.value) resolveDates()
      rawData.value = await apiReports.getReportData(type.value, {
        date_from: dateFrom.value,
        date_to: dateTo.value,
      })
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar datos del informe')
    } finally {
      isLoading.value = false
    }
  }

  function setInformeType(newType) {
    type.value = newType
    fetch()
  }

  function setPeriod(newPeriod) {
    period.value = newPeriod
    resolveDates()
    fetch()
  }

  function exportPdf() {
    const title = `Informe ${type.value}`
    const cols = Object.keys(rawData.value[0] ?? {}).slice(0, 8)
    const rows = rawData.value.map(r => cols.map(c => r[c] ?? ''))
    doExportPdf(title, cols, rows, {
      kpis: kpis.value.map(k => ({ label: k.label, value: k.formatted })),
      subtitle: `${dateFrom.value} — ${dateTo.value}`,
    })
  }

  async function exportXlsx() {
    const title = `Informe ${type.value}`
    const cols = Object.keys(rawData.value[0] ?? {}).slice(0, 8)
    const rows = rawData.value.map(r => cols.map(c => r[c] ?? ''))
    await doExportXlsx(title, cols, rows, {
      kpis: kpis.value.map(k => ({ label: k.label, value: k.formatted })),
    })
  }

  return {
    reportType: type,
    rawData,
    isLoading,
    error,
    period,
    dateFrom,
    dateTo,
    kpis,
    chartData,
    fetch,
    setInformeType,
    setPeriod,
    exportPdf,
    exportXlsx,
  }
}
