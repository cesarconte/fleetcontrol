/**
 * FleetControl — useReports Composable
 *
 * Reactive report state with data fetching, aggregation, and export.
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
  aggregateCargoBreakdown,
  aggregateDriverKpis,
  aggregateDriverActivity,
  aggregateFuelKpis,
  aggregateFuelByVehicle,
  aggregateMaintenanceKpis,
  aggregateMaintenanceByVehicle,
  aggregateComplianceKpis,
  aggregateComplianceBreakdown,
  aggregateTachographKpis,
  aggregateTachographByDriver,
  aggregateRouteIncidents,
} from '@/utils/report-aggregations.js'
import { exportPdf as doExportPdf } from '@/utils/export-pdf.js'
import { exportXlsx as doExportXlsx } from '@/utils/export-xlsx.js'

export function useReports() {
  const type = ref('economico')
  const rawData = ref([])
  const secondaryData = ref([])
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
      case 'conductores':
        return aggregateDriverKpis(rawData.value)
      case 'combustible':
        return aggregateFuelKpis(rawData.value)
      case 'mantenimiento':
        return aggregateMaintenanceKpis(rawData.value)
      case 'cumplimiento':
        return aggregateComplianceKpis(rawData.value, secondaryData.value)
      case 'tacografos':
        return aggregateTachographKpis(rawData.value)
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
      case 'rutas':
        return {
          incidents: aggregateRouteIncidents(rawData.value),
          monthlyTrend: aggregateMonthlyTrend(rawData.value),
        }
      case 'conductores':
        return {
          activity: aggregateDriverActivity(rawData.value, secondaryData.value),
        }
      case 'combustible':
        return {
          byVehicle: aggregateFuelByVehicle(rawData.value),
        }
      case 'mantenimiento':
        return {
          byVehicle: aggregateMaintenanceByVehicle(rawData.value),
        }
      case 'cumplimiento':
        return {
          breakdown: aggregateComplianceBreakdown(rawData.value, secondaryData.value),
        }
      case 'tacografos':
        return {
          byDriver: aggregateTachographByDriver(rawData.value),
        }
      case 'cargas':
        return {
          byType: aggregateCargoBreakdown(rawData.value),
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
      const params = { date_from: dateFrom.value, date_to: dateTo.value }

      if (type.value === 'cumplimiento') {
        const result = await apiReports.getComplianceData(params)
        rawData.value = result.vehicleDocs
        secondaryData.value = result.driverDocs
      } else {
        rawData.value = await apiReports.getReportData(type.value, params)
      }
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar datos del informe')
    } finally {
      isLoading.value = false
    }
  }

  function setReportType(newType) {
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
    secondaryData,
    isLoading,
    error,
    period,
    dateFrom,
    dateTo,
    kpis,
    chartData,
    fetch,
    setReportType,
    setPeriod,
    exportPdf,
    exportXlsx,
  }
}
