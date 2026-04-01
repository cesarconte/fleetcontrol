/**
 * FleetControl — Informe Aggregation Utils
 *
 * Pure functions for computing KPIs, series, and breakdowns from raw data.
 * Each function takes raw arrays and returns structured report data.
 *
 * @see PRD §4.9 — Informes
 */

/**
 * Format EUR value.
 * @param {number} v
 * @returns {string}
 */
function fmtEur(v) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v ?? 0)
}

/**
 * Format number with decimals.
 * @param {number} v
 * @param {number} [decimals=1]
 * @returns {string}
 */
function fmtNum(v, decimals = 1) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(v ?? 0)
}

/**
 * Compute financial KPIs from completed routes.
 * @param {Array} routes
 * @returns {Array<{key: string, label: string, value: number, formatted: string, icon: string}>}
 */
export function aggregateFinancialKpis(routes) {
  if (!routes?.length) {
    return [
      {
        key: 'total_revenue',
        label: 'Ingresos totales',
        value: 0,
        formatted: fmtEur(0),
        icon: 'mdi-cash',
      },
      {
        key: 'total_costs',
        label: 'Costes totales',
        value: 0,
        formatted: fmtEur(0),
        icon: 'mdi-cash-minus',
      },
      {
        key: 'net_profit',
        label: 'Beneficio neto',
        value: 0,
        formatted: fmtEur(0),
        icon: 'mdi-cash-plus',
      },
      {
        key: 'net_margin_pct',
        label: 'Margen neto',
        value: 0,
        formatted: '0,0%',
        icon: 'mdi-percent',
      },
      { key: 'cost_per_km', label: 'CPM', value: 0, formatted: '0,000 €/km', icon: 'mdi-gauge' },
      {
        key: 'revenue_per_km',
        label: 'Ingreso/km',
        value: 0,
        formatted: '0,000 €/km',
        icon: 'mdi-trending-up',
      },
      {
        key: 'avg_route_revenue',
        label: 'Tarifa media',
        value: 0,
        formatted: fmtEur(0),
        icon: 'mdi-calculator',
      },
      {
        key: 'total_routes',
        label: 'Rutas completadas',
        value: 0,
        formatted: '0',
        icon: 'mdi-truck-check',
      },
    ]
  }

  const totalRevenue = routes.reduce((s, r) => s + (r.revenue_eur ?? 0), 0)
  const totalCosts = routes.reduce((s, r) => s + (r.total_variable_cost_eur ?? 0), 0)
  const totalFixed = routes.reduce((s, r) => s + (r.allocated_fixed_cost_eur ?? 0), 0)
  const netProfit = totalRevenue - totalCosts - totalFixed
  const totalKm = routes.reduce((s, r) => s + (r.distance_covered_km ?? 0), 0)
  const allCosts = totalCosts + totalFixed

  return [
    {
      key: 'total_revenue',
      label: 'Ingresos totales',
      value: totalRevenue,
      formatted: fmtEur(totalRevenue),
      icon: 'mdi-cash',
    },
    {
      key: 'total_costs',
      label: 'Costes totales',
      value: allCosts,
      formatted: fmtEur(allCosts),
      icon: 'mdi-cash-minus',
    },
    {
      key: 'net_profit',
      label: 'Beneficio neto',
      value: netProfit,
      formatted: fmtEur(netProfit),
      icon: 'mdi-cash-plus',
    },
    {
      key: 'net_margin_pct',
      label: 'Margen neto',
      value: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      formatted: `${fmtNum(totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0)}%`,
      icon: 'mdi-percent',
    },
    {
      key: 'cost_per_km',
      label: 'CPM',
      value: totalKm > 0 ? allCosts / totalKm : 0,
      formatted: `${fmtNum(totalKm > 0 ? allCosts / totalKm : 0, 3)} €/km`,
      icon: 'mdi-gauge',
    },
    {
      key: 'revenue_per_km',
      label: 'Ingreso/km',
      value: totalKm > 0 ? totalRevenue / totalKm : 0,
      formatted: `${fmtNum(totalKm > 0 ? totalRevenue / totalKm : 0, 3)} €/km`,
      icon: 'mdi-trending-up',
    },
    {
      key: 'avg_route_revenue',
      label: 'Tarifa media',
      value: routes.length > 0 ? totalRevenue / routes.length : 0,
      formatted: fmtEur(routes.length > 0 ? totalRevenue / routes.length : 0),
      icon: 'mdi-calculator',
    },
    {
      key: 'total_routes',
      label: 'Rutas completadas',
      value: routes.length,
      formatted: String(routes.length),
      icon: 'mdi-truck-check',
    },
  ]
}

/**
 * Cost breakdown by category (for pie chart).
 * @param {Array} routes
 * @returns {Array<{name: string, value: number, percentage: number}>}
 */
export function aggregateCostBreakdown(routes) {
  const totals = {
    Combustible: routes.reduce((s, r) => s + (r.fuel_cost_eur ?? 0), 0),
    Peajes: routes.reduce((s, r) => s + (r.toll_cost_eur ?? 0), 0),
    Conductor: routes.reduce((s, r) => s + (r.driver_cost_eur ?? 0), 0),
    'Otros variables': routes.reduce((s, r) => s + (r.other_variable_cost_eur ?? 0), 0),
    'Costes fijos': routes.reduce((s, r) => s + (r.allocated_fixed_cost_eur ?? 0), 0),
  }

  const total = Object.values(totals).reduce((s, v) => s + v, 0)
  if (total === 0)
    return Object.entries(totals).map(([name, value]) => ({ name, value, percentage: 0 }))

  return Object.entries(totals)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value, percentage: Math.round((value / total) * 1000) / 10 }))
}

/**
 * Profit grouped by vehicle (for bar chart ranking).
 * @param {Array} routes
 * @returns {Array<{vehicle_id: string, revenue: number, costs: number, profit: number}>}
 */
export function aggregateProfitByVehicle(routes) {
  const byVehicle = {}
  for (const r of routes) {
    const id = r.vehicle_id ?? 'unknown'
    if (!byVehicle[id]) byVehicle[id] = { vehicle_id: id, revenue: 0, costs: 0, profit: 0 }
    byVehicle[id].revenue += r.revenue_eur ?? 0
    byVehicle[id].costs += (r.total_variable_cost_eur ?? 0) + (r.allocated_fixed_cost_eur ?? 0)
    byVehicle[id].profit += r.net_margin_eur ?? 0
  }
  return Object.values(byVehicle).sort((a, b) => b.profit - a.profit)
}

/**
 * Monthly trend (for line chart).
 * @param {Array} routes
 * @returns {Array<{month: string, revenue: number, costs: number, profit: number}>}
 */
export function aggregateMonthlyTrend(routes) {
  const byMonth = {}
  for (const r of routes) {
    const month = (r.departure_date ?? '').slice(0, 7)
    if (!month) continue
    if (!byMonth[month]) byMonth[month] = { month, revenue: 0, costs: 0, profit: 0 }
    byMonth[month].revenue += r.revenue_eur ?? 0
    byMonth[month].costs += (r.total_variable_cost_eur ?? 0) + (r.allocated_fixed_cost_eur ?? 0)
    byMonth[month].profit += r.net_margin_eur ?? 0
  }
  return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month))
}

/**
 * Fleet KPIs from vehicles array.
 * @param {Array} vehicles
 * @returns {Array<{key: string, label: string, value: number, formatted: string, icon: string}>}
 */
export function aggregateFleetKpis(vehicles) {
  const total = vehicles.length
  const active = vehicles.filter(v => v.status === 'active' || v.status === 'on_route').length
  const inMaintenance = vehicles.filter(v => v.status === 'in_maintenance').length
  const avgKm = total > 0 ? vehicles.reduce((s, v) => s + (v.total_odometer_km ?? 0), 0) / total : 0
  const totalKm = vehicles.reduce((s, v) => s + (v.total_odometer_km ?? 0), 0)

  return [
    {
      key: 'total_vehicles',
      label: 'Vehículos totales',
      value: total,
      formatted: String(total),
      icon: 'mdi-truck',
    },
    {
      key: 'active_vehicles',
      label: 'Activos',
      value: active,
      formatted: String(active),
      icon: 'mdi-truck-check',
    },
    {
      key: 'in_maintenance',
      label: 'En mantenimiento',
      value: inMaintenance,
      formatted: String(inMaintenance),
      icon: 'mdi-wrench',
    },
    {
      key: 'avg_odometer_km',
      label: 'Km promedio',
      value: Math.round(avgKm),
      formatted: `${fmtNum(avgKm, 0)} km`,
      icon: 'mdi-speedometer',
    },
    {
      key: 'total_fleet_km',
      label: 'Km totales flota',
      value: Math.round(totalKm),
      formatted: `${fmtNum(totalKm, 0)} km`,
      icon: 'mdi-map-marker-distance',
    },
  ]
}

/**
 * Cargo KPIs from cargo_records.
 * @param {Array} cargos
 * @returns {Array<{key: string, label: string, value: number, formatted: string, icon: string}>}
 */
export function aggregateCargoKpis(cargos) {
  const totalWeight = cargos.reduce((s, c) => s + (c.peso_kg ?? 0), 0)
  const totalVolume = cargos.reduce((s, c) => s + (c.volumen_m3 ?? 0), 0)
  const adrCount = cargos.filter(c => c.adr_clase).length

  return [
    {
      key: 'total_cargos',
      label: 'Total cargas',
      value: cargos.length,
      formatted: String(cargos.length),
      icon: 'mdi-package-variant-closed',
    },
    {
      key: 'total_weight',
      label: 'Peso total',
      value: totalWeight,
      formatted: `${fmtNum(totalWeight, 0)} kg`,
      icon: 'mdi-weight',
    },
    {
      key: 'total_volume',
      label: 'Volumen total',
      value: totalVolume,
      formatted: `${fmtNum(totalVolume, 1)} m³`,
      icon: 'mdi-cube-outline',
    },
    {
      key: 'avg_weight',
      label: 'Peso promedio',
      value: cargos.length > 0 ? Math.round(totalWeight / cargos.length) : 0,
      formatted: `${fmtNum(cargos.length > 0 ? totalWeight / cargos.length : 0, 0)} kg`,
      icon: 'mdi-scale',
    },
    {
      key: 'adr_count',
      label: 'Mercancías peligrosas',
      value: adrCount,
      formatted: String(adrCount),
      icon: 'mdi-hazard-lights',
    },
  ]
}
