/**
 * FleetControl — Cargo Compliance Utilities
 *
 * Pure functions to check vehicle compliance against cargo subcategory
 * requirements and provide equipment checklists.
 *
 * @see PRD §4.4.3 — Planificación de Rutas (validación automática)
 * @see PRD §4.6 — Gestión de Cargas
 */

import { getSubcategoryById } from '@/constants/cargo-categories.js'
import {
  getEquipmentChecklist,
  getEquipmentElements,
  getNormativeReference,
} from '@/constants/vehicle-equipment.js'

/**
 * @typedef {Object} ComplianceResult
 * @property {boolean} isCompliant
 * @property {string[]} autoPassed - Requirements verified automatically
 * @property {string[]} autoFailed - Requirements that failed automatically
 * @property {string[]} manualChecks - Requirements needing physical verification
 * @property {Array<{ groupName: string, elementos: string[], normativa: string }>} equipmentChecklist
 * @property {string | null} normativeReference
 * @property {string | null} subcategoryName
 * @property {string} legacyType
 */

/**
 * Map of vehicle types that are suitable for each cargo legacy type.
 * A vehicle is "compatible" if its tipo_vehiculo is in the list for the cargo type.
 */
const VEHICLE_COMPATIBILITY = {
  general: [
    'lona',
    'caja_cerrada',
    'furgon',
    'furgoneta',
    'plataforma_abierta',
    'semirremolque',
    'remolque',
    'vehiculo_rigido',
    'tractora',
    'portacontenedores',
    'mixto',
    'especial',
  ],
  frigorifica: ['frigorifico', 'isotermo', 'semirremolque', 'vehiculo_rigido', 'tractora'],
  peligrosa: [
    'cisterna',
    'caja_cerrada',
    'semirremolque',
    'vehiculo_rigido',
    'tractora',
    'especial',
  ],
  especial: [
    'ganadero',
    'plataforma_abierta',
    'basculante',
    'gondola',
    'grua',
    'portacoches',
    'mega',
    'tolva',
    'camion_basculante',
    'semirremolque',
    'vehiculo_rigido',
    'tractora',
    'especial',
  ],
}

/**
 * Additional type-specific compatibility overrides per subcategory.
 * These extend or refine the legacy type defaults.
 */
const SUBCATEGORY_VEHICLE_OVERRIDES = {
  'adr-clase-1': ['caja_cerrada', 'especial'],
  'adr-clase-2': ['cisterna'],
  'adr-clase-3': ['cisterna'],
  'adr-clase-7': ['especial'],
  'adr-clase-8': ['cisterna'],
  'atp-congelados': ['frigorifico', 'isotermo'],
  'atp-refrig-fuerte': ['frigorifico', 'isotermo'],
  'atp-refrig-suave': ['frigorifico', 'isotermo'],
  'atp-calorificos': ['isotermo'],
  'ani-ganado-mayor': ['ganadero'],
  'ani-ganado-menor': ['ganadero'],
  'ani-aves-conejos': ['ganadero', 'especial'],
  'gen-granel-solido': ['basculante', 'camion_basculante', 'tolva'],
  'gen-granel-liquido': ['cisterna'],
  'gen-vidrio': ['plataforma_abierta', 'especial'],
  'gen-maquinaria': ['gondola', 'plataforma_abierta', 'portacoches', 'grua'],
  'gen-siderurgico': ['plataforma_abierta', 'gondola'],
  'gen-gran-volumen': ['mega', 'semirremolque'],
  'gen-mudanzas': ['caja_cerrada', 'furgon', 'furgoneta', 'mixto'],
}

/**
 * Check if a vehicle type is compatible with a cargo subcategory.
 * @param {string} vehicleType - The vehicle's tipo_vehiculo value
 * @param {string} subcategoryId - The cargo subcategory ID
 * @returns {boolean}
 */
export function isVehicleTypeCompatible(vehicleType, subcategoryId) {
  const sub = getSubcategoryById(subcategoryId)
  if (!sub) return true

  // Check subcategory-specific overrides first
  const overrides = SUBCATEGORY_VEHICLE_OVERRIDES[subcategoryId]
  if (overrides && overrides.includes(vehicleType)) return true
  if (overrides && !overrides.includes(vehicleType)) {
    // If overrides exist, they are the ONLY allowed types
    return false
  }

  // Fall back to legacy type compatibility
  const legacyType = sub.mapToLegacy
  const compatible = VEHICLE_COMPATIBILITY[legacyType] ?? []
  return compatible.includes(vehicleType)
}

/**
 * Get the recommended vehicle types for a subcategory.
 * @param {string} subcategoryId
 * @returns {string[]}
 */
export function getRecommendedVehicleTypes(subcategoryId) {
  const sub = getSubcategoryById(subcategoryId)
  if (!sub) return []

  const overrides = SUBCATEGORY_VEHICLE_OVERRIDES[subcategoryId]
  if (overrides) return overrides

  return VEHICLE_COMPATIBILITY[sub.mapToLegacy] ?? []
}

/**
 * Full compliance check for a vehicle against a cargo subcategory.
 * @param {{ tipo_vehiculo: string, mma_kg?: number, status?: string } | null} vehicle
 * @param {string} subcategoryId
 * @returns {ComplianceResult}
 */
export function checkVehicleCompliance(vehicle, subcategoryId) {
  const sub = getSubcategoryById(subcategoryId)

  if (!sub) {
    return {
      isCompliant: true,
      autoPassed: [],
      autoFailed: [],
      manualChecks: [],
      equipmentChecklist: [],
      normativeReference: null,
      subcategoryName: null,
      legacyType: 'general',
    }
  }

  const autoPassed = []
  const autoFailed = []

  // ── Auto check 1: Vehicle type compatibility ──────────────────────────
  if (vehicle?.tipo_vehiculo) {
    if (isVehicleTypeCompatible(vehicle.tipo_vehiculo, subcategoryId)) {
      autoPassed.push(`Tipo de vehículo (${vehicle.tipo_vehiculo}) compatible`)
    } else {
      autoFailed.push(
        `Tipo de vehículo (${vehicle.tipo_vehiculo}) no apto. Recomendado: ${getRecommendedVehicleTypes(subcategoryId).join(', ')}`,
      )
    }
  }

  // ── Auto check 2: Vehicle is active ───────────────────────────────────
  if (vehicle?.status && vehicle.status !== 'activo') {
    autoFailed.push(`Vehículo en estado "${vehicle.status}" — debe estar activo`)
  } else if (vehicle?.status === 'activo') {
    autoPassed.push('Vehículo activo')
  }

  // ── Equipment checklist (manual verification) ─────────────────────────
  const equipmentGroups = getEquipmentChecklist(subcategoryId)
  const allEquipment = getEquipmentElements(subcategoryId)
  const normative = getNormativeReference(subcategoryId)

  const isCompliant = autoFailed.length === 0

  return {
    isCompliant,
    autoPassed,
    autoFailed,
    manualChecks: allEquipment,
    equipmentChecklist: equipmentGroups,
    normativeReference: normative,
    subcategoryName: sub.nombre,
    legacyType: sub.mapToLegacy,
  }
}

/**
 * Get combined requirements summary for a subcategory (vehicle type + equipment).
 * @param {string} subcategoryId
 * @returns {{ vehicleRequirements: string[], equipmentElements: string[], normativeReference: string | null }}
 */
export function getRequirementsForSubcategory(subcategoryId) {
  const sub = getSubcategoryById(subcategoryId)
  return {
    vehicleRequirements: sub ? sub.requisitosVehiculo : [],
    equipmentElements: getEquipmentElements(subcategoryId),
    normativeReference: getNormativeReference(subcategoryId),
  }
}
