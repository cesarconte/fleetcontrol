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

/**
 * Driver KPIs from drivers array.
 * @param {Array} drivers
 * @returns {Array<{key: string, label: string, value: number, formatted: string, icon: string}>}
 */
export function aggregateDriverKpis(drivers) {
  if (!drivers?.length) {
    return [
      {
        key: 'total_drivers',
        label: 'Conductores totales',
        value: 0,
        formatted: '0',
        icon: 'mdi-account-group',
      },
      {
        key: 'active_drivers',
        label: 'Activos',
        value: 0,
        formatted: '0',
        icon: 'mdi-account-check',
      },
      {
        key: 'avg_routes_completed',
        label: 'Rutas completadas (media)',
        value: 0,
        formatted: '0,0',
        icon: 'mdi-truck-check',
      },
      {
        key: 'drivers_with_valid_cap',
        label: 'CAP vigente',
        value: 0,
        formatted: '0',
        icon: 'mdi-card-account-details',
      },
    ]
  }

  const total = drivers.length
  const active = drivers.filter(d => d.status === 'active' || d.status === 'on_route').length
  const totalRoutes = drivers.reduce((s, d) => s + (d.completed_routes_count ?? 0), 0)
  const avgRoutes = total > 0 ? totalRoutes / total : 0
  const validCap = drivers.filter(d => {
    if (!d.cap_expiry_date) return false
    return new Date(d.cap_expiry_date) > new Date()
  }).length

  return [
    {
      key: 'total_drivers',
      label: 'Conductores totales',
      value: total,
      formatted: String(total),
      icon: 'mdi-account-group',
    },
    {
      key: 'active_drivers',
      label: 'Activos',
      value: active,
      formatted: String(active),
      icon: 'mdi-account-check',
    },
    {
      key: 'avg_routes_completed',
      label: 'Rutas completadas (media)',
      value: Math.round(avgRoutes * 10) / 10,
      formatted: fmtNum(avgRoutes),
      icon: 'mdi-truck-check',
    },
    {
      key: 'drivers_with_valid_cap',
      label: 'CAP vigente',
      value: validCap,
      formatted: String(validCap),
      icon: 'mdi-card-account-details',
    },
  ]
}

/**
 * Driver activity — routes grouped by driver.
 * @param {Array} drivers
 * @param {Array} routes
 * @returns {Array<{driver_id: string, driver_name: string, routes_count: number, total_km: number, avg_delay: number}>}
 */
export function aggregateDriverActivity(drivers, routes) {
  if (!routes?.length) return []

  const driverMap = {}
  for (const d of drivers ?? []) {
    driverMap[d.id] = d.full_name ?? d.name ?? 'Desconocido'
  }

  const byDriver = {}
  for (const r of routes) {
    const id = r.driver_id ?? 'unknown'
    if (!byDriver[id]) {
      byDriver[id] = { driver_id: id, routes_count: 0, total_km: 0, total_delay: 0 }
    }
    byDriver[id].routes_count += 1
    byDriver[id].total_km += r.distance_covered_km ?? 0
    byDriver[id].total_delay += r.delay_minutes ?? 0
  }

  return Object.values(byDriver)
    .map(d => ({
      driver_id: d.driver_id,
      driver_name: driverMap[d.driver_id] ?? d.driver_id,
      routes_count: d.routes_count,
      total_km: Math.round(d.total_km),
      avg_delay: d.routes_count > 0 ? Math.round(d.total_delay / d.routes_count) : 0,
    }))
    .sort((a, b) => b.routes_count - a.routes_count)
}

/**
 * Fuel KPIs from fuel_records.
 * @param {Array} fuelRecords
 * @returns {Array<{key: string, label: string, value: number, formatted: string, icon: string}>}
 */
export function aggregateFuelKpis(fuelRecords) {
  if (!fuelRecords?.length) {
    return [
      {
        key: 'total_liters',
        label: 'Litros totales',
        value: 0,
        formatted: '0,0 L',
        icon: 'mdi-gas-station',
      },
      {
        key: 'total_cost',
        label: 'Coste total',
        value: 0,
        formatted: fmtEur(0),
        icon: 'mdi-cash',
      },
      {
        key: 'avg_consumption',
        label: 'Consumo medio',
        value: 0,
        formatted: '0,0 L/100km',
        icon: 'mdi-fuel',
      },
      {
        key: 'total_co2',
        label: 'CO₂ emitido',
        value: 0,
        formatted: '0,0 kg',
        icon: 'mdi-molecule-co2',
      },
      {
        key: 'avg_price_per_liter',
        label: 'Precio medio/L',
        value: 0,
        formatted: '0,000 €/L',
        icon: 'mdi-tag',
      },
    ]
  }

  const totalLiters = fuelRecords.reduce((s, f) => s + (f.liters ?? 0), 0)
  const totalCost = fuelRecords.reduce((s, f) => s + (f.cost_eur ?? 0), 0)
  const totalKm = fuelRecords.reduce((s, f) => s + (f.distance_km ?? 0), 0)
  const totalCo2 = fuelRecords.reduce((s, f) => s + (f.co2_kg ?? 0), 0)
  const avgConsumption = totalKm > 0 ? (totalLiters / totalKm) * 100 : 0
  const avgPrice = totalLiters > 0 ? totalCost / totalLiters : 0

  return [
    {
      key: 'total_liters',
      label: 'Litros totales',
      value: totalLiters,
      formatted: `${fmtNum(totalLiters, 1)} L`,
      icon: 'mdi-gas-station',
    },
    {
      key: 'total_cost',
      label: 'Coste total',
      value: totalCost,
      formatted: fmtEur(totalCost),
      icon: 'mdi-cash',
    },
    {
      key: 'avg_consumption',
      label: 'Consumo medio',
      value: Math.round(avgConsumption * 10) / 10,
      formatted: `${fmtNum(avgConsumption, 1)} L/100km`,
      icon: 'mdi-fuel',
    },
    {
      key: 'total_co2',
      label: 'CO₂ emitido',
      value: Math.round(totalCo2 * 10) / 10,
      formatted: `${fmtNum(totalCo2, 1)} kg`,
      icon: 'mdi-molecule-co2',
    },
    {
      key: 'avg_price_per_liter',
      label: 'Precio medio/L',
      value: Math.round(avgPrice * 1000) / 1000,
      formatted: `${fmtNum(avgPrice, 3)} €/L`,
      icon: 'mdi-tag',
    },
  ]
}

/**
 * Fuel consumption grouped by vehicle.
 * @param {Array} fuelRecords
 * @returns {Array<{vehicle_id: string, liters: number, cost: number, consumption_l100km: number}>}
 */
export function aggregateFuelByVehicle(fuelRecords) {
  if (!fuelRecords?.length) return []

  const byVehicle = {}
  for (const f of fuelRecords) {
    const id = f.vehicle_id ?? 'unknown'
    if (!byVehicle[id]) byVehicle[id] = { vehicle_id: id, liters: 0, cost: 0, km: 0 }
    byVehicle[id].liters += f.liters ?? 0
    byVehicle[id].cost += f.cost_eur ?? 0
    byVehicle[id].km += f.distance_km ?? 0
  }

  return Object.values(byVehicle)
    .map(v => ({
      vehicle_id: v.vehicle_id,
      liters: Math.round(v.liters * 10) / 10,
      cost: Math.round(v.cost * 100) / 100,
      consumption_l100km: v.km > 0 ? Math.round((v.liters / v.km) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.cost - a.cost)
}

/**
 * Maintenance KPIs from maintenance_records.
 * @param {Array} records
 * @returns {Array<{key: string, label: string, value: number, formatted: string, icon: string}>}
 */
export function aggregateMaintenanceKpis(records) {
  if (!records?.length) {
    return [
      {
        key: 'total_interventions',
        label: 'Intervenciones',
        value: 0,
        formatted: '0',
        icon: 'mdi-wrench',
      },
      {
        key: 'total_cost',
        label: 'Coste total',
        value: 0,
        formatted: fmtEur(0),
        icon: 'mdi-cash',
      },
      {
        key: 'total_downtime_hours',
        label: 'Horas paradas',
        value: 0,
        formatted: '0,0 h',
        icon: 'mdi-clock-outline',
      },
      {
        key: 'preventive_count',
        label: 'Preventivas',
        value: 0,
        formatted: '0',
        icon: 'mdi-shield-check',
      },
      {
        key: 'corrective_count',
        label: 'Correctivas',
        value: 0,
        formatted: '0',
        icon: 'mdi-alert-circle',
      },
    ]
  }

  const totalCost = records.reduce((s, r) => s + (r.cost_eur ?? 0), 0)
  const totalDowntime = records.reduce((s, r) => s + (r.downtime_hours ?? 0), 0)
  const preventive = records.filter(r => r.type === 'preventive').length
  const corrective = records.filter(r => r.type === 'corrective').length

  return [
    {
      key: 'total_interventions',
      label: 'Intervenciones',
      value: records.length,
      formatted: String(records.length),
      icon: 'mdi-wrench',
    },
    {
      key: 'total_cost',
      label: 'Coste total',
      value: totalCost,
      formatted: fmtEur(totalCost),
      icon: 'mdi-cash',
    },
    {
      key: 'total_downtime_hours',
      label: 'Horas paradas',
      value: Math.round(totalDowntime * 10) / 10,
      formatted: `${fmtNum(totalDowntime, 1)} h`,
      icon: 'mdi-clock-outline',
    },
    {
      key: 'preventive_count',
      label: 'Preventivas',
      value: preventive,
      formatted: String(preventive),
      icon: 'mdi-shield-check',
    },
    {
      key: 'corrective_count',
      label: 'Correctivas',
      value: corrective,
      formatted: String(corrective),
      icon: 'mdi-alert-circle',
    },
  ]
}

/**
 * Maintenance costs grouped by vehicle.
 * @param {Array} records
 * @returns {Array<{vehicle_id: string, total_cost: number, downtime_hours: number, interventions: number}>}
 */
export function aggregateMaintenanceByVehicle(records) {
  if (!records?.length) return []

  const byVehicle = {}
  for (const r of records) {
    const id = r.vehicle_id ?? 'unknown'
    if (!byVehicle[id])
      byVehicle[id] = { vehicle_id: id, total_cost: 0, downtime_hours: 0, interventions: 0 }
    byVehicle[id].total_cost += r.cost_eur ?? 0
    byVehicle[id].downtime_hours += r.downtime_hours ?? 0
    byVehicle[id].interventions += 1
  }

  return Object.values(byVehicle)
    .map(v => ({
      vehicle_id: v.vehicle_id,
      total_cost: Math.round(v.total_cost * 100) / 100,
      downtime_hours: Math.round(v.downtime_hours * 10) / 10,
      interventions: v.interventions,
    }))
    .sort((a, b) => b.total_cost - a.total_cost)
}

/**
 * Compliance KPIs from vehicle and driver documents.
 * @param {Array} vehicleDocs
 * @param {Array} driverDocs
 * @returns {Array<{key: string, label: string, value: number, formatted: string, icon: string}>}
 */
export function aggregateComplianceKpis(vehicleDocs, driverDocs) {
  const allDocs = [...(vehicleDocs ?? []), ...(driverDocs ?? [])]
  const today = new Date()
  const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  if (!allDocs.length) {
    return [
      {
        key: 'total_docs',
        label: 'Documentos totales',
        value: 0,
        formatted: '0',
        icon: 'mdi-file-document-multiple',
      },
      { key: 'valid_count', label: 'En regla', value: 0, formatted: '0', icon: 'mdi-check-circle' },
      {
        key: 'expiring_soon_count',
        label: 'Próximos a vencer',
        value: 0,
        formatted: '0',
        icon: 'mdi-alert',
      },
      {
        key: 'critical_count',
        label: 'Críticos',
        value: 0,
        formatted: '0',
        icon: 'mdi-alert-circle',
      },
      {
        key: 'expired_count',
        label: 'Vencidos',
        value: 0,
        formatted: '0',
        icon: 'mdi-close-circle',
      },
      {
        key: 'compliance_pct',
        label: 'Cumplimiento',
        value: 0,
        formatted: '0,0%',
        icon: 'mdi-shield-check',
      },
    ]
  }

  const validCount = allDocs.filter(d => {
    const exp = new Date(d.expiry_date)
    return exp > thirtyDays
  }).length

  const expiringSoon = allDocs.filter(d => {
    const exp = new Date(d.expiry_date)
    return exp > today && exp <= thirtyDays
  }).length

  const expiredCount = allDocs.filter(d => new Date(d.expiry_date) <= today).length

  const criticalCount = allDocs.filter(d => {
    const exp = new Date(d.expiry_date)
    const diffDays = (exp - today) / (24 * 60 * 60 * 1000)
    return diffDays > 0 && diffDays <= 7
  }).length

  const compliancePct = allDocs.length > 0 ? (validCount / allDocs.length) * 100 : 0

  return [
    {
      key: 'total_docs',
      label: 'Documentos totales',
      value: allDocs.length,
      formatted: String(allDocs.length),
      icon: 'mdi-file-document-multiple',
    },
    {
      key: 'valid_count',
      label: 'En regla',
      value: validCount,
      formatted: String(validCount),
      icon: 'mdi-check-circle',
    },
    {
      key: 'expiring_soon_count',
      label: 'Próximos a vencer',
      value: expiringSoon,
      formatted: String(expiringSoon),
      icon: 'mdi-alert',
    },
    {
      key: 'critical_count',
      label: 'Críticos',
      value: criticalCount,
      formatted: String(criticalCount),
      icon: 'mdi-alert-circle',
    },
    {
      key: 'expired_count',
      label: 'Vencidos',
      value: expiredCount,
      formatted: String(expiredCount),
      icon: 'mdi-close-circle',
    },
    {
      key: 'compliance_pct',
      label: 'Cumplimiento',
      value: Math.round(compliancePct * 10) / 10,
      formatted: `${fmtNum(compliancePct, 1)}%`,
      icon: 'mdi-shield-check',
    },
  ]
}

/**
 * Compliance breakdown for pie chart.
 * @param {Array} vehicleDocs
 * @param {Array} driverDocs
 * @returns {Array<{name: string, value: number}>}
 */
export function aggregateComplianceBreakdown(vehicleDocs, driverDocs) {
  const allDocs = [...(vehicleDocs ?? []), ...(driverDocs ?? [])]
  const today = new Date()
  const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  const enRegla = allDocs.filter(d => new Date(d.expiry_date) > thirtyDays).length
  const proximo = allDocs.filter(d => {
    const exp = new Date(d.expiry_date)
    return exp > today && exp <= thirtyDays
  }).length
  const vencido = allDocs.filter(d => new Date(d.expiry_date) <= today).length

  return [
    { name: 'En regla', value: enRegla },
    { name: 'Próximo a vencer', value: proximo },
    { name: 'Vencido', value: vencido },
  ]
}

/**
 * Tachograph KPIs from tachograph_records.
 * @param {Array} records
 * @returns {Array<{key: string, label: string, value: number, formatted: string, icon: string}>}
 */
export function aggregateTachographKpis(records) {
  if (!records?.length) {
    return [
      {
        key: 'total_downloads',
        label: 'Descargas',
        value: 0,
        formatted: '0',
        icon: 'mdi-download',
      },
      {
        key: 'violations_count',
        label: 'Infracciones',
        value: 0,
        formatted: '0',
        icon: 'mdi-alert-octagon',
      },
      {
        key: 'total_driving_hours',
        label: 'Horas conducción',
        value: 0,
        formatted: '0,0 h',
        icon: 'mdi-steering',
      },
    ]
  }

  const totalDownloads = records.filter(r => r.type === 'download').length
  const violationsCount = records.reduce((s, r) => s + (r.violations_count ?? 0), 0)
  const totalDrivingHours = records.reduce((s, r) => s + (r.driving_hours ?? 0), 0)

  return [
    {
      key: 'total_downloads',
      label: 'Descargas',
      value: totalDownloads,
      formatted: String(totalDownloads),
      icon: 'mdi-download',
    },
    {
      key: 'violations_count',
      label: 'Infracciones',
      value: violationsCount,
      formatted: String(violationsCount),
      icon: 'mdi-alert-octagon',
    },
    {
      key: 'total_driving_hours',
      label: 'Horas conducción',
      value: Math.round(totalDrivingHours * 10) / 10,
      formatted: `${fmtNum(totalDrivingHours, 1)} h`,
      icon: 'mdi-steering',
    },
  ]
}

/**
 * Tachograph data grouped by driver.
 * @param {Array} records
 * @returns {Array<{driver_id: string, downloads: number, violations: number, driving_hours: number}>}
 */
export function aggregateTachographByDriver(records) {
  if (!records?.length) return []

  const byDriver = {}
  for (const r of records) {
    const id = r.driver_id ?? 'unknown'
    if (!byDriver[id])
      byDriver[id] = { driver_id: id, downloads: 0, violations: 0, driving_hours: 0 }
    if (r.type === 'download') byDriver[id].downloads += 1
    byDriver[id].violations += r.violations_count ?? 0
    byDriver[id].driving_hours += r.driving_hours ?? 0
  }

  return Object.values(byDriver)
    .map(d => ({
      driver_id: d.driver_id,
      downloads: d.downloads,
      violations: d.violations,
      driving_hours: Math.round(d.driving_hours * 10) / 10,
    }))
    .sort((a, b) => b.violations - a.violations)
}

/**
 * Route incidents — delay categories for pie chart.
 * @param {Array} routes
 * @returns {Array<{name: string, value: number}>}
 */
export function aggregateRouteIncidents(routes) {
  if (!routes?.length) {
    return [
      { name: 'A tiempo', value: 0 },
      { name: 'Retraso <30 min', value: 0 },
      { name: 'Retraso 30-60 min', value: 0 },
      { name: 'Retraso >1 h', value: 0 },
      { name: 'Cancelada', value: 0 },
    ]
  }

  let onTime = 0
  let delay30 = 0
  let delay60 = 0
  let delayed = 0
  let cancelled = 0

  for (const r of routes) {
    if (r.status === 'cancelled') {
      cancelled++
      continue
    }
    const delay = r.delay_minutes ?? 0
    if (delay <= 0) onTime++
    else if (delay < 30) delay30++
    else if (delay < 60) delay60++
    else delayed++
  }

  return [
    { name: 'A tiempo', value: onTime },
    { name: 'Retraso <30 min', value: delay30 },
    { name: 'Retraso 30-60 min', value: delay60 },
    { name: 'Retraso >1 h', value: delayed },
    { name: 'Cancelada', value: cancelled },
  ]
}

/**
 * Cargo breakdown by type and ADR class.
 * @param {Array} cargos
 * @returns {Array<{name: string, value: number, percentage: number}>}
 */
export function aggregateCargoBreakdown(cargos) {
  if (!cargos?.length) return []

  const byType = {}
  for (const c of cargos) {
    const type = c.cargo_type ?? 'Sin tipo'
    byType[type] = (byType[type] ?? 0) + 1
  }

  const total = cargos.length
  return Object.entries(byType)
    .map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / total) * 1000) / 10,
    }))
    .sort((a, b) => b.value - a.value)
}
