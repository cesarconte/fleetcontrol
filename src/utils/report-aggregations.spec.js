import { describe, it, expect } from 'vitest'
import {
  aggregateFinancialKpis,
  aggregateCostBreakdown,
  aggregateProfitByVehicle,
  aggregateMonthlyTrend,
  aggregateFleetKpis,
  aggregateCargoKpis,
} from './report-aggregations.js'

describe('report-aggregations', () => {
  const mockRoutes = [
    {
      revenue_eur: 500,
      fuel_cost_eur: 150,
      toll_cost_eur: 30,
      driver_cost_eur: 80,
      other_variable_cost_eur: 10,
      allocated_fixed_cost_eur: 50,
      gross_margin_eur: 230,
      net_margin_eur: 180,
      total_variable_cost_eur: 270,
      distance_covered_km: 300,
      fuel_consumption_l: 95,
      departure_date: '2026-03-01',
      vehicle_id: 'v1',
    },
    {
      revenue_eur: 800,
      fuel_cost_eur: 200,
      toll_cost_eur: 50,
      driver_cost_eur: 100,
      other_variable_cost_eur: 20,
      allocated_fixed_cost_eur: 70,
      gross_margin_eur: 430,
      net_margin_eur: 360,
      total_variable_cost_eur: 370,
      distance_covered_km: 500,
      fuel_consumption_l: 140,
      departure_date: '2026-03-15',
      vehicle_id: 'v1',
    },
    {
      revenue_eur: 350,
      fuel_cost_eur: 120,
      toll_cost_eur: 20,
      driver_cost_eur: 60,
      other_variable_cost_eur: 5,
      allocated_fixed_cost_eur: 40,
      gross_margin_eur: 145,
      net_margin_eur: 105,
      total_variable_cost_eur: 205,
      distance_covered_km: 200,
      fuel_consumption_l: 65,
      departure_date: '2026-02-10',
      vehicle_id: 'v2',
    },
  ]

  describe('aggregateFinancialKpis', () => {
    it('debería calcular ingresos totales', () => {
      const kpis = aggregateFinancialKpis(mockRoutes)
      const revenue = kpis.find(k => k.key === 'total_revenue')
      expect(revenue.value).toBe(1650)
    })

    it('debería calcular costes totales (variable + fijo)', () => {
      const kpis = aggregateFinancialKpis(mockRoutes)
      const costs = kpis.find(k => k.key === 'total_costs')
      expect(costs.value).toBe(1005) // (270+370+205) + (50+70+40)
    })

    it('debería calcular beneficio neto', () => {
      const kpis = aggregateFinancialKpis(mockRoutes)
      const profit = kpis.find(k => k.key === 'net_profit')
      expect(profit.value).toBe(645) // 1650 - 1005
    })

    it('debería calcular margen %', () => {
      const kpis = aggregateFinancialKpis(mockRoutes)
      const margin = kpis.find(k => k.key === 'net_margin_pct')
      expect(margin.value).toBeCloseTo(39.09, 1) // 645/1650*100
    })

    it('debería calcular CPM (coste por km)', () => {
      const kpis = aggregateFinancialKpis(mockRoutes)
      const cpm = kpis.find(k => k.key === 'cost_per_km')
      expect(cpm.value).toBeCloseTo(1.005, 2) // 1005/1000
    })

    it('debería calcular ingreso por km', () => {
      const kpis = aggregateFinancialKpis(mockRoutes)
      const rpk = kpis.find(k => k.key === 'revenue_per_km')
      expect(rpk.value).toBe(1.65) // 1650/1000
    })

    it('debería retornar array vacío si no hay datos', () => {
      const kpis = aggregateFinancialKpis([])
      expect(kpis).toBeInstanceOf(Array)
      expect(kpis.length).toBeGreaterThan(0)
      kpis.forEach(k => expect(k.value).toBe(0))
    })
  })

  describe('aggregateCostBreakdown', () => {
    it('debería desglosar costes por categoría', () => {
      const breakdown = aggregateCostBreakdown(mockRoutes)
      expect(breakdown).toBeInstanceOf(Array)
      expect(breakdown.length).toBeGreaterThan(0)
    })

    it('cada categoría debería tener name, value, percentage', () => {
      const breakdown = aggregateCostBreakdown(mockRoutes)
      breakdown.forEach(item => {
        expect(item).toHaveProperty('name')
        expect(item).toHaveProperty('value')
        expect(item).toHaveProperty('percentage')
      })
    })

    it('las porcentajes deberían sumar 100', () => {
      const breakdown = aggregateCostBreakdown(mockRoutes)
      const total = breakdown.reduce((sum, item) => sum + item.percentage, 0)
      expect(total).toBeCloseTo(100, 0)
    })
  })

  describe('aggregateProfitByVehicle', () => {
    it('debería agrupar por vehicle_id', () => {
      const result = aggregateProfitByVehicle(mockRoutes)
      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBe(2) // v1, v2
    })

    it('cada vehículo debería tener revenue, costs, profit', () => {
      const result = aggregateProfitByVehicle(mockRoutes)
      result.forEach(v => {
        expect(v).toHaveProperty('vehicle_id')
        expect(v).toHaveProperty('revenue')
        expect(v).toHaveProperty('costs')
        expect(v).toHaveProperty('profit')
      })
    })

    it('debería sumar correctamente por vehículo', () => {
      const result = aggregateProfitByVehicle(mockRoutes)
      const v1 = result.find(v => v.vehicle_id === 'v1')
      expect(v1.revenue).toBe(1300) // 500 + 800
    })
  })

  describe('aggregateMonthlyTrend', () => {
    it('debería agrupar por mes', () => {
      const result = aggregateMonthlyTrend(mockRoutes)
      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)
    })

    it('cada mes debería tener month, revenue, costs, profit', () => {
      const result = aggregateMonthlyTrend(mockRoutes)
      result.forEach(m => {
        expect(m).toHaveProperty('month')
        expect(m).toHaveProperty('revenue')
        expect(m).toHaveProperty('costs')
        expect(m).toHaveProperty('profit')
      })
    })
  })

  describe('aggregateFleetKpis', () => {
    const mockVehicles = [
      { id: 'v1', status: 'active', total_odometer_km: 150000 },
      { id: 'v2', status: 'active', total_odometer_km: 80000 },
      { id: 'v3', status: 'inactive', total_odometer_km: 200000 },
    ]

    it('debería calcular total vehículos', () => {
      const kpis = aggregateFleetKpis(mockVehicles)
      const total = kpis.find(k => k.key === 'total_vehicles')
      expect(total.value).toBe(3)
    })

    it('debería calcular vehículos activos', () => {
      const kpis = aggregateFleetKpis(mockVehicles)
      const active = kpis.find(k => k.key === 'active_vehicles')
      expect(active.value).toBe(2)
    })

    it('debería calcular km promedio', () => {
      const kpis = aggregateFleetKpis(mockVehicles)
      const avgKm = kpis.find(k => k.key === 'avg_odometer_km')
      expect(avgKm.value).toBeCloseTo(143333, -2)
    })
  })

  describe('aggregateCargoKpis', () => {
    const mockCargos = [
      { peso_kg: 15000, volumen_m3: 40, tipo: 'general' },
      { peso_kg: 20000, volumen_m3: 55, tipo: 'refrigerated' },
      { peso_kg: 12000, volumen_m3: 30, tipo: 'general' },
    ]

    it('debería calcular peso total', () => {
      const kpis = aggregateCargoKpis(mockCargos)
      const total = kpis.find(k => k.key === 'total_weight')
      expect(total.value).toBe(47000)
    })

    it('debería calcular volumen total', () => {
      const kpis = aggregateCargoKpis(mockCargos)
      const vol = kpis.find(k => k.key === 'total_volume')
      expect(vol.value).toBe(125)
    })

    it('debería calcular número de cargas', () => {
      const kpis = aggregateCargoKpis(mockCargos)
      const count = kpis.find(k => k.key === 'total_cargos')
      expect(count.value).toBe(3)
    })
  })
})
