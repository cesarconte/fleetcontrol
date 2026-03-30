/**
 * FleetControl — Cargo Compliance Utilities
 *
 * Pure functions to check vehicle compliance against cargo subcategory
 * requirements and provide equipment checklists.
 *
 * Compatibility checks use tipo_carroceria (vehicle body type) which
 * "dialogues" directly with cargo type per EU/RD 2822/1998 classification.
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
 * Map of body types (tipo_carroceria) compatible with each cargo legacy type.
 * Values match vehicle_body_type enum in PostgreSQL.
 */
const VEHICLE_COMPATIBILITY = {
  general: [
    'lona',
    'caja_cerrada',
    'caja_abierta',
    'furgon',
    'furgoneta',
    'plataforma_abierta',
    'portacontenedores',
    'capitone',
    'especial',
  ],
  frigorifica: ['frigorifico', 'isotermo', 'calorifico'],
  peligrosa: ['cisterna', 'caja_cerrada', 'especial'],
  especial: [
    'ganadero',
    'plataforma_abierta',
    'basculante',
    'grua',
    'portavehiculos',
    'tolva',
    'jaula',
    'silo',
    'especial',
  ],
}

/**
 * Additional compatibility overrides per subcategory.
 * When present, ONLY these body types are allowed (no fallback to legacy).
 * Values match vehicle_body_type enum.
 */
const SUBCATEGORY_BODY_OVERRIDES = {
  'adr-clase-1': ['caja_cerrada', 'especial'],
  'adr-clase-2': ['cisterna'],
  'adr-clase-3': ['cisterna'],
  'adr-clase-7': ['especial'],
  'adr-clase-8': ['cisterna'],
  'atp-congelados': ['frigorifico', 'isotermo'],
  'atp-refrig-fuerte': ['frigorifico', 'isotermo'],
  'atp-refrig-suave': ['frigorifico', 'isotermo'],
  'atp-calorificos': ['isotermo', 'calorifico'],
  'ani-ganado-mayor': ['ganadero', 'jaula'],
  'ani-ganado-menor': ['ganadero', 'jaula'],
  'ani-aves-conejos': ['jaula', 'ganadero'],
  'gen-granel-solido': ['basculante', 'tolva'],
  'gen-granel-liquido': ['cisterna'],
  'gen-vidrio': ['plataforma_abierta', 'especial'],
  'gen-maquinaria': ['plataforma_abierta', 'grua', 'portavehiculos'],
  'gen-siderurgico': ['plataforma_abierta', 'portabobinas'],
  'gen-gran-volumen': ['lona', 'especial'],
  'gen-mudanzas': ['caja_cerrada', 'furgon', 'furgoneta', 'capitone'],
}

/**
 * Check if a vehicle body type is compatible with a cargo subcategory.
 * @param {string} bodyType - The vehicle's tipo_carroceria value
 * @param {string} subcategoryId - The cargo subcategory ID
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
 * @param {{ tipo_carroceria: string, categoria_ue?: string, mma_kg?: number, status?: string } | null} vehicle
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
  if (vehicle?.tipo_carroceria) {
    if (isVehicleTypeCompatible(vehicle.tipo_carroceria, subcategoryId)) {
      autoPassed.push(`Carrocería (${vehicle.tipo_carroceria}) compatible`)
    } else {
      autoFailed.push(
        `Carrocería (${vehicle.tipo_carroceria}) no apta. Recomendado: ${getRecommendedVehicleTypes(subcategoryId).join(', ')}`,
      )
    }
  }

  // ── Auto check 2: Vehicle is active ────────────────────────────────────
  if (vehicle?.status && vehicle.status !== 'activo') {
    autoFailed.push(`Vehículo en estado "${vehicle.status}" — debe estar activo`)
  } else if (vehicle?.status === 'activo') {
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
