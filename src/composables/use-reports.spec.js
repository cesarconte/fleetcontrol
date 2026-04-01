import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/api-reports.js', () => ({
  apiReports: {
    getReportData: vi.fn(),
    getComplianceData: vi.fn(),
  },
}))

vi.mock('@/stores/notifications.js', () => ({
  useNotificationStore: () => ({ success: vi.fn(), error: vi.fn() }),
}))

import { useInformes } from './use-reports.js'
import { apiReports } from '@/services/api-reports.js'

const mockRoutes = [
  {
    id: 'r1',
    revenue_eur: 500,
    fuel_cost_eur: 150,
    total_variable_cost_eur: 270,
    allocated_fixed_cost_eur: 50,
    net_margin_eur: 180,
    distance_covered_km: 300,
    departure_date: '2026-03-01',
    vehicle_id: 'v1',
  },
  {
    id: 'r2',
    revenue_eur: 800,
    fuel_cost_eur: 200,
    total_variable_cost_eur: 370,
    allocated_fixed_cost_eur: 70,
    net_margin_eur: 360,
    distance_covered_km: 500,
    departure_date: '2026-03-15',
    vehicle_id: 'v1',
  },
]

describe('useInformes', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('estado inicial', () => {
    it('debería tener reportType en economico por defecto', () => {
      const { reportType } = useInformes()
      expect(reportType.value).toBe('economico')
    })

    it('debería tener isLoading en false', () => {
      const { isLoading } = useInformes()
      expect(isLoading.value).toBe(false)
    })

    it('debería tener error en null', () => {
      const { error } = useInformes()
      expect(error.value).toBeNull()
    })

    it('debería tener rawData vacío', () => {
      const { rawData } = useInformes()
      expect(rawData.value).toEqual([])
    })
  })

  describe('setInformeType', () => {
    it('debería cambiar el tipo de informe', () => {
      const { reportType, setInformeType } = useInformes()
      setInformeType('flota')
      expect(reportType.value).toBe('flota')
    })

    it('debería cargar datos al cambiar tipo si hay período', async () => {
      apiReports.getReportData.mockResolvedValue(mockRoutes)
      const { setInformeType } = useInformes()
      setInformeType('rutas')
      expect(apiReports.getReportData).toHaveBeenCalled()
    })
  })

  describe('fetch', () => {
    it('debería cargar datos en éxito', async () => {
      apiReports.getReportData.mockResolvedValue(mockRoutes)
      const { rawData, fetch, isLoading } = useInformes()

      const promise = fetch()
      expect(isLoading.value).toBe(true)

      await promise
      expect(rawData.value).toEqual(mockRoutes)
      expect(isLoading.value).toBe(false)
    })

    it('debería establecer error en fallo', async () => {
      const err = new Error('Network error')
      apiReports.getReportData.mockRejectedValue(err)
      const { error, fetch } = useInformes()

      await fetch()

      expect(error.value).toBe(err)
    })
  })

  describe('kpis', () => {
    it('debería computar KPIs financieros cuando el tipo es economico', async () => {
      apiReports.getReportData.mockResolvedValue(mockRoutes)
      const { kpis, fetch } = useInformes()
      await fetch()
      expect(kpis.value.length).toBeGreaterThan(0)
      expect(kpis.value.some(k => k.key === 'total_revenue')).toBe(true)
    })
  })

  describe('exportPdf', () => {
    it('debería ser una función', () => {
      const { exportPdf } = useInformes()
      expect(typeof exportPdf).toBe('function')
    })
  })

  describe('exportXlsx', () => {
    it('debería ser una función', () => {
      const { exportXlsx } = useInformes()
      expect(typeof exportXlsx).toBe('function')
    })
  })
})
