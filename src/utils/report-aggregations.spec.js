import { describe, it, expect } from 'vitest'
import {
  aggregateFinancialKpis,
  aggregateCostBreakdown,
  aggregateProfitByVehicle,
  aggregateMonthlyTrend,
  aggregateFleetKpis,
  aggregateCargoKpis,
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
  aggregateCargoBreakdown,
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

  // ── aggregateDriverKpis ──────────────────────────────────────────────

  describe('aggregateDriverKpis', () => {
    const mockDrivers = [
      { id: 'd1', status: 'active', completed_routes_count: 45, cap_expiry_date: '2027-06-01' },
      { id: 'd2', status: 'active', completed_routes_count: 30, cap_expiry_date: '2026-12-15' },
      { id: 'd3', status: 'inactive', completed_routes_count: 10, cap_expiry_date: '2025-01-01' },
    ]

    it('debería calcular total de conductores', () => {
      const kpis = aggregateDriverKpis(mockDrivers)
      const total = kpis.find(k => k.key === 'total_drivers')
      expect(total.value).toBe(3)
    })

    it('debería calcular conductores activos', () => {
      const kpis = aggregateDriverKpis(mockDrivers)
      const active = kpis.find(k => k.key === 'active_drivers')
      expect(active.value).toBe(2)
    })

    it('debería calcular rutas completadas promedio', () => {
      const kpis = aggregateDriverKpis(mockDrivers)
      const avg = kpis.find(k => k.key === 'avg_routes_completed')
      expect(avg.value).toBeCloseTo(28.3, 0)
    })

    it('debería calcular conductores con CAP vigente', () => {
      const kpis = aggregateDriverKpis(mockDrivers)
      const cap = kpis.find(k => k.key === 'drivers_with_valid_cap')
      expect(cap.value).toBe(2)
    })

    it('debería retornar KPIs vacíos si no hay datos', () => {
      const kpis = aggregateDriverKpis([])
      expect(kpis).toBeInstanceOf(Array)
      expect(kpis.length).toBeGreaterThan(0)
      kpis.forEach(k => expect(k.value).toBe(0))
    })

    it('debería manejar null/undefined', () => {
      const kpis = aggregateDriverKpis(null)
      expect(kpis).toBeInstanceOf(Array)
      kpis.forEach(k => expect(k.value).toBe(0))
    })
  })

  // ── aggregateDriverActivity ──────────────────────────────────────────

  describe('aggregateDriverActivity', () => {
    const mockDrivers = [
      { id: 'd1', full_name: 'Carlos García' },
      { id: 'd2', full_name: 'Ana López' },
    ]
    const mockRoutes = [
      { driver_id: 'd1', distance_covered_km: 300, delay_minutes: 10 },
      { driver_id: 'd1', distance_covered_km: 500, delay_minutes: 0 },
      { driver_id: 'd2', distance_covered_km: 200, delay_minutes: 45 },
    ]

    it('debería agrupar rutas por conductor', () => {
      const result = aggregateDriverActivity(mockDrivers, mockRoutes)
      expect(result.length).toBe(2)
    })

    it('debería contar rutas por conductor', () => {
      const result = aggregateDriverActivity(mockDrivers, mockRoutes)
      const d1 = result.find(d => d.driver_id === 'd1')
      expect(d1.routes_count).toBe(2)
    })

    it('debería sumar km por conductor', () => {
      const result = aggregateDriverActivity(mockDrivers, mockRoutes)
      const d1 = result.find(d => d.driver_id === 'd1')
      expect(d1.total_km).toBe(800)
    })

    it('debería calcular retraso promedio', () => {
      const result = aggregateDriverActivity(mockDrivers, mockRoutes)
      const d1 = result.find(d => d.driver_id === 'd1')
      expect(d1.avg_delay).toBe(5) // (10+0)/2
    })

    it('debería resolver nombre del conductor', () => {
      const result = aggregateDriverActivity(mockDrivers, mockRoutes)
      const d1 = result.find(d => d.driver_id === 'd1')
      expect(d1.driver_name).toBe('Carlos García')
    })

    it('debería retornar vacío si no hay rutas', () => {
      expect(aggregateDriverActivity(mockDrivers, [])).toEqual([])
    })

    it('debería manejar null en drivers', () => {
      const result = aggregateDriverActivity(null, mockRoutes)
      expect(result.length).toBe(2)
      result.forEach(r => expect(r.driver_name).toBe(r.driver_id))
    })
  })

  // ── aggregateFuelKpis ────────────────────────────────────────────────

  describe('aggregateFuelKpis', () => {
    const mockFuel = [
      { liters: 100, cost_eur: 160, distance_km: 500, co2_kg: 262 },
      { liters: 80, cost_eur: 128, distance_km: 400, co2_kg: 210 },
    ]

    it('debería calcular litros totales', () => {
      const kpis = aggregateFuelKpis(mockFuel)
      const liters = kpis.find(k => k.key === 'total_liters')
      expect(liters.value).toBe(180)
    })

    it('debería calcular coste total', () => {
      const kpis = aggregateFuelKpis(mockFuel)
      const cost = kpis.find(k => k.key === 'total_cost')
      expect(cost.value).toBe(288)
    })

    it('debería calcular consumo medio L/100km', () => {
      const kpis = aggregateFuelKpis(mockFuel)
      const avg = kpis.find(k => k.key === 'avg_consumption')
      expect(avg.value).toBeCloseTo(20, 0) // 180/900*100
    })

    it('debería calcular CO2 total', () => {
      const kpis = aggregateFuelKpis(mockFuel)
      const co2 = kpis.find(k => k.key === 'total_co2')
      expect(co2.value).toBe(472)
    })

    it('debería calcular precio medio por litro', () => {
      const kpis = aggregateFuelKpis(mockFuel)
      const price = kpis.find(k => k.key === 'avg_price_per_liter')
      expect(price.value).toBeCloseTo(1.6, 2) // 288/180
    })

    it('debería retornar KPIs vacíos si no hay datos', () => {
      const kpis = aggregateFuelKpis([])
      expect(kpis).toBeInstanceOf(Array)
      kpis.forEach(k => expect(k.value).toBe(0))
    })
  })

  // ── aggregateFuelByVehicle ───────────────────────────────────────────

  describe('aggregateFuelByVehicle', () => {
    const mockFuel = [
      { vehicle_id: 'v1', liters: 100, cost_eur: 160, distance_km: 500 },
      { vehicle_id: 'v1', liters: 80, cost_eur: 128, distance_km: 400 },
      { vehicle_id: 'v2', liters: 60, cost_eur: 96, distance_km: 300 },
    ]

    it('debería agrupar por vehículo', () => {
      const result = aggregateFuelByVehicle(mockFuel)
      expect(result.length).toBe(2)
    })

    it('debería sumar litros por vehículo', () => {
      const result = aggregateFuelByVehicle(mockFuel)
      const v1 = result.find(v => v.vehicle_id === 'v1')
      expect(v1.liters).toBe(180)
    })

    it('debería calcular consumo L/100km', () => {
      const result = aggregateFuelByVehicle(mockFuel)
      const v1 = result.find(v => v.vehicle_id === 'v1')
      expect(v1.consumption_l100km).toBe(20) // 180/900*100
    })

    it('debería retornar vacío si no hay datos', () => {
      expect(aggregateFuelByVehicle([])).toEqual([])
    })
  })

  // ── aggregateMaintenanceKpis ─────────────────────────────────────────

  describe('aggregateMaintenanceKpis', () => {
    const mockRecords = [
      { type: 'preventive', cost_eur: 500, downtime_hours: 4 },
      { type: 'corrective', cost_eur: 1200, downtime_hours: 8 },
      { type: 'preventive', cost_eur: 300, downtime_hours: 2 },
    ]

    it('debería contar intervenciones totales', () => {
      const kpis = aggregateMaintenanceKpis(mockRecords)
      const total = kpis.find(k => k.key === 'total_interventions')
      expect(total.value).toBe(3)
    })

    it('debería calcular coste total', () => {
      const kpis = aggregateMaintenanceKpis(mockRecords)
      const cost = kpis.find(k => k.key === 'total_cost')
      expect(cost.value).toBe(2000)
    })

    it('debería calcular horas de parada', () => {
      const kpis = aggregateMaintenanceKpis(mockRecords)
      const hours = kpis.find(k => k.key === 'total_downtime_hours')
      expect(hours.value).toBe(14)
    })

    it('debería contar preventivas', () => {
      const kpis = aggregateMaintenanceKpis(mockRecords)
      const prev = kpis.find(k => k.key === 'preventive_count')
      expect(prev.value).toBe(2)
    })

    it('debería contar correctivas', () => {
      const kpis = aggregateMaintenanceKpis(mockRecords)
      const corr = kpis.find(k => k.key === 'corrective_count')
      expect(corr.value).toBe(1)
    })

    it('debería retornar KPIs vacíos si no hay datos', () => {
      const kpis = aggregateMaintenanceKpis([])
      expect(kpis).toBeInstanceOf(Array)
      kpis.forEach(k => expect(k.value).toBe(0))
    })
  })

  // ── aggregateMaintenanceByVehicle ────────────────────────────────────

  describe('aggregateMaintenanceByVehicle', () => {
    const mockRecords = [
      { vehicle_id: 'v1', cost_eur: 500, downtime_hours: 4 },
      { vehicle_id: 'v1', cost_eur: 1200, downtime_hours: 8 },
      { vehicle_id: 'v2', cost_eur: 300, downtime_hours: 2 },
    ]

    it('debería agrupar por vehículo', () => {
      const result = aggregateMaintenanceByVehicle(mockRecords)
      expect(result.length).toBe(2)
    })

    it('debería sumar costes por vehículo', () => {
      const result = aggregateMaintenanceByVehicle(mockRecords)
      const v1 = result.find(v => v.vehicle_id === 'v1')
      expect(v1.total_cost).toBe(1700)
    })

    it('debería contar intervenciones por vehículo', () => {
      const result = aggregateMaintenanceByVehicle(mockRecords)
      const v1 = result.find(v => v.vehicle_id === 'v1')
      expect(v1.interventions).toBe(2)
    })

    it('debería retornar vacío si no hay datos', () => {
      expect(aggregateMaintenanceByVehicle([])).toEqual([])
    })
  })

  // ── aggregateComplianceKpis ──────────────────────────────────────────

  describe('aggregateComplianceKpis', () => {
    const today = new Date()
    const futureDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    const soonDate = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    const pastDate = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const vehicleDocs = [
      { id: 'd1', expiry_date: futureDate },
      { id: 'd2', expiry_date: soonDate },
    ]
    const driverDocs = [
      { id: 'd3', expiry_date: pastDate },
      { id: 'd4', expiry_date: futureDate },
    ]

    it('debería contar documentos totales', () => {
      const kpis = aggregateComplianceKpis(vehicleDocs, driverDocs)
      const total = kpis.find(k => k.key === 'total_docs')
      expect(total.value).toBe(4)
    })

    it('debería contar documentos en regla', () => {
      const kpis = aggregateComplianceKpis(vehicleDocs, driverDocs)
      const valid = kpis.find(k => k.key === 'valid_count')
      expect(valid.value).toBe(2)
    })

    it('debería contar documentos vencidos', () => {
      const kpis = aggregateComplianceKpis(vehicleDocs, driverDocs)
      const expired = kpis.find(k => k.key === 'expired_count')
      expect(expired.value).toBe(1)
    })

    it('debería contar documentos próximos a vencer', () => {
      const kpis = aggregateComplianceKpis(vehicleDocs, driverDocs)
      const expiring = kpis.find(k => k.key === 'expiring_soon_count')
      expect(expiring.value).toBe(1)
    })

    it('debería calcular porcentaje de cumplimiento', () => {
      const kpis = aggregateComplianceKpis(vehicleDocs, driverDocs)
      const pct = kpis.find(k => k.key === 'compliance_pct')
      expect(pct.value).toBe(50) // 2/4
    })

    it('debería retornar KPIs vacíos si no hay datos', () => {
      const kpis = aggregateComplianceKpis([], [])
      expect(kpis).toBeInstanceOf(Array)
      kpis.forEach(k => expect(k.value).toBe(0))
    })
  })

  // ── aggregateComplianceBreakdown ─────────────────────────────────────

  describe('aggregateComplianceBreakdown', () => {
    const today = new Date()
    const futureDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    const soonDate = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    const pastDate = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    it('debería retornar categorías de cumplimiento', () => {
      const result = aggregateComplianceBreakdown(
        [{ expiry_date: futureDate }, { expiry_date: soonDate }],
        [{ expiry_date: pastDate }],
      )
      expect(result).toBeInstanceOf(Array)
      expect(result.find(r => r.name === 'En regla').value).toBe(1)
      expect(result.find(r => r.name === 'Próximo a vencer').value).toBe(1)
      expect(result.find(r => r.name === 'Vencido').value).toBe(1)
    })

    it('debería retornar vacío si no hay documentos', () => {
      const result = aggregateComplianceBreakdown([], [])
      const total = result.reduce((s, r) => s + r.value, 0)
      expect(total).toBe(0)
    })
  })

  // ── aggregateTachographKpis ──────────────────────────────────────────

  describe('aggregateTachographKpis', () => {
    const mockRecords = [
      { type: 'download', violations_count: 0, driving_hours: 8.5 },
      { type: 'download', violations_count: 2, driving_hours: 9.0 },
      { type: 'analysis', violations_count: 1, driving_hours: 7.5 },
    ]

    it('debería contar descargas', () => {
      const kpis = aggregateTachographKpis(mockRecords)
      const downloads = kpis.find(k => k.key === 'total_downloads')
      expect(downloads.value).toBe(2)
    })

    it('debería contar infracciones', () => {
      const kpis = aggregateTachographKpis(mockRecords)
      const violations = kpis.find(k => k.key === 'violations_count')
      expect(violations.value).toBe(3)
    })

    it('debería sumar horas de conducción', () => {
      const kpis = aggregateTachographKpis(mockRecords)
      const hours = kpis.find(k => k.key === 'total_driving_hours')
      expect(hours.value).toBe(25) // 8.5+9+7.5
    })

    it('debería retornar KPIs vacíos si no hay datos', () => {
      const kpis = aggregateTachographKpis([])
      expect(kpis).toBeInstanceOf(Array)
      kpis.forEach(k => expect(k.value).toBe(0))
    })
  })

  // ── aggregateTachographByDriver ──────────────────────────────────────

  describe('aggregateTachographByDriver', () => {
    const mockRecords = [
      { driver_id: 'd1', type: 'download', violations_count: 0, driving_hours: 8.5 },
      { driver_id: 'd1', type: 'download', violations_count: 1, driving_hours: 9.0 },
      { driver_id: 'd2', type: 'analysis', violations_count: 2, driving_hours: 7.0 },
    ]

    it('debería agrupar por conductor', () => {
      const result = aggregateTachographByDriver(mockRecords)
      expect(result.length).toBe(2)
    })

    it('debería contar descargas por conductor', () => {
      const result = aggregateTachographByDriver(mockRecords)
      const d1 = result.find(d => d.driver_id === 'd1')
      expect(d1.downloads).toBe(2)
    })

    it('debería sumar infracciones por conductor', () => {
      const result = aggregateTachographByDriver(mockRecords)
      const d1 = result.find(d => d.driver_id === 'd1')
      expect(d1.violations).toBe(1)
    })

    it('debería retornar vacío si no hay datos', () => {
      expect(aggregateTachographByDriver([])).toEqual([])
    })
  })

  // ── aggregateRouteIncidents ──────────────────────────────────────────

  describe('aggregateRouteIncidents', () => {
    const mockRoutes = [
      { delay_minutes: 0, status: 'completed' },
      { delay_minutes: 15, status: 'completed' },
      { delay_minutes: 45, status: 'completed' },
      { delay_minutes: 90, status: 'completed' },
      { delay_minutes: 0, status: 'cancelled' },
    ]

    it('debería categorizar rutas por retraso', () => {
      const result = aggregateRouteIncidents(mockRoutes)
      const onTime = result.find(r => r.name === 'A tiempo')
      expect(onTime.value).toBe(1) // delay=0, status!=cancelled
    })

    it('debería contar retrasos <30 min', () => {
      const result = aggregateRouteIncidents(mockRoutes)
      const delay30 = result.find(r => r.name === 'Retraso <30 min')
      expect(delay30.value).toBe(1)
    })

    it('debería contar rutas canceladas', () => {
      const result = aggregateRouteIncidents(mockRoutes)
      const cancelled = result.find(r => r.name === 'Cancelada')
      expect(cancelled.value).toBe(1)
    })

    it('debería retornar estructura vacía si no hay rutas', () => {
      const result = aggregateRouteIncidents([])
      expect(result).toBeInstanceOf(Array)
      result.forEach(r => expect(r.value).toBe(0))
    })
  })

  // ── aggregateCargoBreakdown ──────────────────────────────────────────

  describe('aggregateCargoBreakdown', () => {
    const mockCargos = [
      { cargo_type: 'general' },
      { cargo_type: 'refrigerated' },
      { cargo_type: 'general' },
      { cargo_type: null },
    ]

    it('debería agrupar por tipo de carga', () => {
      const result = aggregateCargoBreakdown(mockCargos)
      const general = result.find(r => r.name === 'general')
      expect(general.value).toBe(2)
    })

    it('debería asignar "Sin tipo" si cargo_type es null', () => {
      const result = aggregateCargoBreakdown(mockCargos)
      const sinTipo = result.find(r => r.name === 'Sin tipo')
      expect(sinTipo.value).toBe(1)
    })

    it('debería calcular porcentajes', () => {
      const result = aggregateCargoBreakdown(mockCargos)
      const general = result.find(r => r.name === 'general')
      expect(general.percentage).toBe(50) // 2/4
    })

    it('debería retornar vacío si no hay datos', () => {
      expect(aggregateCargoBreakdown([])).toEqual([])
    })
  })
})
