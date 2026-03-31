/**
 * FleetControl — Cargo Compliance Utilities
 *
 * Pure functions to check vehicle compliance against cargo subcategory
 * requirements and provide equipment checklists.
 *
 * Compatibility checks use body_type (vehicle body type) which
 * "dialogues" directly with cargo type per EU/RD 2822/1998 classification.
 *
 * @see PRD §4.4.3
 * @see PRD §4.6
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
 * @property {string[]} autoPassed
 * @property {string[]} autoFailed
 * @property {string[]} manualChecks
 * @property {Array<{ groupName: string, elementos: string[], normativa: string }>} equipmentChecklist
 * @property {string | null} normativeReference
 * @property {string | null} subcategoryName
 * @property {string} legacyType
 */

/**
 * Body types compatible with each cargo legacy type.
 * Values match DB body_type enum (English).
 */
const VEHICLE_COMPATIBILITY = {
  general: [
    'curtain',
    'closed_box',
    'open_box',
    'delivery_truck',
    'van',
    'open_platform',
    'container_carrier',
    'padded',
    'special',
  ],
  frigorifica: ['refrigerated', 'insulated', 'heated'],
  peligrosa: ['tanker', 'closed_box', 'special'],
  especial: [
    'livestock',
    'open_platform',
    'dump',
    'crane',
    'car_carrier',
    'hopper',
    'cage',
    'silo',
    'special',
  ],
}

/**
 * Subcategory-specific body type overrides.
 * When present, ONLY these body types are allowed.
 * Values match DB body_type enum (English).
 */
const SUBCATEGORY_BODY_OVERRIDES = {
  'adr-clase-1': ['closed_box', 'special'],
  'adr-clase-2': ['tanker'],
  'adr-clase-3': ['tanker'],
  'adr-clase-7': ['special'],
  'adr-clase-8': ['tanker'],
  'atp-congelados': ['refrigerated', 'insulated'],
  'atp-refrig-fuerte': ['refrigerated', 'insulated'],
  'atp-refrig-suave': ['refrigerated', 'insulated'],
  'atp-calorificos': ['insulated', 'heated'],
  'ani-ganado-mayor': ['livestock', 'cage'],
  'ani-ganado-menor': ['livestock', 'cage'],
  'ani-aves-conejos': ['cage', 'livestock'],
  'gen-granel-solido': ['dump', 'hopper'],
  'gen-granel-liquido': ['tanker'],
  'gen-vidrio': ['open_platform', 'special'],
  'gen-maquinaria': ['open_platform', 'crane', 'car_carrier'],
  'gen-siderurgico': ['open_platform', 'coil_carrier'],
  'gen-gran-volumen': ['curtain', 'special'],
  'gen-mudanzas': ['closed_box', 'delivery_truck', 'van', 'padded'],
}

/**
 * Check if a vehicle body type is compatible with a cargo subcategory.
 * @param {string} bodyType - The vehicle's body_type value (DB English)
 * @param {string} subcategoryId
 * @returns {boolean}
 */
export function isVehicleTypeCompatible(bodyType, subcategoryId) {
  const sub = getSubcategoryById(subcategoryId)
  if (!sub) return true

  const overrides = SUBCATEGORY_BODY_OVERRIDES[subcategoryId]
  if (overrides) {
    return overrides.includes(bodyType)
  }

  const legacyType = sub.mapToLegacy
  const compatible = VEHICLE_COMPATIBILITY[legacyType] ?? []
  return compatible.includes(bodyType)
}

/**
 * Get the recommended body types for a subcategory.
 * @param {string} subcategoryId
 * @returns {string[]}
 */
export function getRecommendedVehicleTypes(subcategoryId) {
  const sub = getSubcategoryById(subcategoryId)
  if (!sub) return []

  const overrides = SUBCATEGORY_BODY_OVERRIDES[subcategoryId]
  if (overrides) return overrides

  return VEHICLE_COMPATIBILITY[sub.mapToLegacy] ?? []
}

/**
 * Full compliance check for a vehicle against a cargo subcategory.
 * @param {{ body_type: string, eu_category?: string, gross_weight_kg?: number, status?: string } | null} vehicle
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

  // ── Auto check 1: Body type compatibility ──────────────────────────────
  if (vehicle?.body_type) {
    if (isVehicleTypeCompatible(vehicle.body_type, subcategoryId)) {
      autoPassed.push(`Carrocería (${vehicle.body_type}) compatible`)
    } else {
      autoFailed.push(
        `Carrocería (${vehicle.body_type}) no apta. Recomendado: ${getRecommendedVehicleTypes(subcategoryId).join(', ')}`,
      )
    }
  }

  // ── Auto check 2: Vehicle is active ────────────────────────────────────
  if (vehicle?.status && vehicle.status !== 'active') {
    autoFailed.push(`Vehículo en estado "${vehicle.status}" — debe estar activo`)
  } else if (vehicle?.status === 'active') {
    autoPassed.push('Vehículo activo')
  }

  // ── Equipment checklist (manual verification) ──────────────────────────
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
 * Get combined requirements summary for a subcategory.
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
