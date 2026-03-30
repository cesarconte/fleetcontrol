/**
 * FleetControl — Vehicle Types (Categorías UE + Estructura + Carrocería)
 *
 * Three-field vehicle classification per EU Homologation Categories
 * and Spanish Reglamento General de Vehículos (Anexo II).
 *
 * @see EU Regulation (UE) 2018/858 — Categorías de homologación
 * @see RD 2822/1998 — Reglamento General de Vehículos (Anexo II)
 * @see PRD §4.2.1 — Ficha de Vehículo
 */

/** @param {object} obj */
function deepFreeze(obj) {
  Object.keys(obj).forEach(key => {
    const val = obj[key]
    if (val && typeof val === 'object') deepFreeze(val)
  })
  return Object.freeze(obj)
}

// ── 1. Categoría UE de Homologación (Masa) ──────────────────────────────────

/**
 * EU homologation categories by mass.
 * Determines driving license, tachograph, and speed limits.
 *
 * @typedef {{ value: string, label: string, description: string, mmaRange: string, licencia: string }} EUCategoria
 */
export const EU_CATEGORIAS = deepFreeze([
  {
    value: 'N1',
    label: 'N1 — Ligeros',
    description: 'Transporte de mercancías con MMA ≤ 3.500 kg',
    mmaRange: 'Hasta 3.500 kg',
    licencia: 'B',
  },
  {
    value: 'N2',
    label: 'N2 — Medios',
    description: 'Transporte de mercancías con MMA entre 3.500 y 12.000 kg',
    mmaRange: '3.501 — 12.000 kg',
    licencia: 'C1 o C',
  },
  {
    value: 'N3',
    label: 'N3 — Pesados',
    description: 'Transporte de mercancías con MMA > 12.000 kg',
    mmaRange: 'Más de 12.000 kg',
    licencia: 'C',
  },
  {
    value: 'O1',
    label: 'O1 — Ligeros',
    description: 'Remolques con MMA ≤ 750 kg',
    mmaRange: 'Hasta 750 kg',
    licencia: 'B+E (según tractor)',
  },
  {
    value: 'O2',
    label: 'O2 — Medios',
    description: 'Remolques con MMA entre 750 y 3.500 kg',
    mmaRange: '751 — 3.500 kg',
    licencia: 'B+E o C1+E',
  },
  {
    value: 'O3',
    label: 'O3 — Pesados',
    description: 'Remolques con MMA entre 3.500 y 10.000 kg',
    mmaRange: '3.501 — 10.000 kg',
    licencia: 'C1+E o C+E',
  },
  {
    value: 'O4',
    label: 'O4 — Gran tonelaje',
    description: 'Remolques con MMA > 10.000 kg (mayoría de semirremolques)',
    mmaRange: 'Más de 10.000 kg',
    licencia: 'C+E',
  },
])

// ── 2. Tipo de Vehículo (Estructura física) ────────────────────────────────

/**
 * Physical vehicle structure — what the driver and client see.
 *
 * @typedef {{ value: string, label: string, description: string }} VehicleStructure
 */
export const VEHICLE_STRUCTURE_TYPES = deepFreeze([
  {
    value: 'rigido',
    label: 'Rígido',
    description: 'Cabina y estructura de carga sobre el mismo chasis (indivisible)',
  },
  {
    value: 'cab_tractora',
    label: 'Cabeza Tractora',
    description: 'Vehículo de motor concebido exclusivamente para arrastrar un semirremolque',
  },
  {
    value: 'tren_carretera',
    label: 'Tren de Carretera',
    description: 'Camión rígido + remolque arrastrado (conjunto de vehículos)',
  },
  {
    value: 'trailer',
    label: 'Vehículo Articulado (Tráiler)',
    description: 'Cabeza tractora + semirremolque apoyado sobre ella',
  },
  {
    value: 'semirremolque',
    label: 'Semirremolque',
    description: 'Unidad de carga sin motor, apoyada sobre la tractora (categoría O)',
  },
  {
    value: 'remolque',
    label: 'Remolque',
    description: 'Unidad de carga sin motor, arrastrada por un vehículo de motor (categoría O)',
  },
  {
    value: 'pick_up',
    label: 'Pick-up',
    description: 'Plataforma abierta de carga separada de la cabina (MMA habitualmente ≤ 3.500 kg)',
  },
])

// ── 3. Tipo de Carrocería (Criterio de utilización) ────────────────────────

/**
 * Body type — what the vehicle carries. "Dialogues" directly with cargo type.
 *
 * @typedef {{ value: string, label: string, description: string }} VehicleBodyType
 */
export const VEHICLE_BODY_TYPES = deepFreeze([
  {
    value: 'caja_abierta',
    label: 'Caja Abierta',
    description: 'Para materiales de construcción o mercancía que no teme a las inclemencias',
  },
  {
    value: 'lona',
    label: 'Lona / Tauliner',
    description:
      'Estándar europeo. Cerrado con lonas laterales correderas para carga lateral o desde arriba',
  },
  {
    value: 'caja_cerrada',
    label: 'Furgón Cerrado (Caja Rígida)',
    description: 'Mayor seguridad contra robos. Típico de paquetería express',
  },
  {
    value: 'frigorifico',
    label: 'Frigorífico',
    description: 'Aislamiento + motor de frío para mercancía perecedera (ATP)',
  },
  {
    value: 'isotermo',
    label: 'Isotermo',
    description: 'Aislamiento térmico sin motor de frío activo (mantiene temperatura)',
  },
  {
    value: 'calorifico',
    label: 'Calorífico',
    description: 'Capaz de elevar y mantener la temperatura de la carga',
  },
  {
    value: 'cisterna',
    label: 'Cisterna',
    description: 'Transporte de líquidos (combustibles, leche, químicos) o gases a granel',
  },
  {
    value: 'silo',
    label: 'Silo',
    description: 'Transporte de polvos o granulados (cemento, harina) descargados por presión',
  },
  {
    value: 'basculante',
    label: 'Basculante / Bañera',
    description: 'La caja se eleva mediante pistón hidráulico para volcar la carga',
  },
  {
    value: 'portavehiculos',
    label: 'Portavehículos (Góndola/Mosquito)',
    description: 'Específico para transportar coches, camiones u otra maquinaria',
  },
  {
    value: 'portacontenedores',
    label: 'Portacontenedores',
    description: 'Chasis para anclar contenedores multimodales de 20, 40 o 45 pies',
  },
  {
    value: 'jaula',
    label: 'Jaula',
    description: 'Carrocería con ventilación para transporte de animales vivos',
  },
  {
    value: 'ganadero',
    label: 'Ganadero',
    description: 'Vehículo especializado para transporte de ganado mayor y menor',
  },
  {
    value: 'capitone',
    label: 'Capitoné',
    description: 'Furgón acolchado interiormente para mudanzas de mobiliario',
  },
  {
    value: 'portabobinas',
    label: 'Portabobinas',
    description: 'Semirremolque con fosa longitudinal para bobinas de acero',
  },
  {
    value: 'plataforma_abierta',
    label: 'Plataforma Abierta',
    description: 'Superficie plana sin laterales para maquinaria pesada o carga sobredimensionada',
  },
  {
    value: 'furgon',
    label: 'Furgón',
    description: 'Vehículo rígido de categoría N2 donde cabina y carga comparten chasis',
  },
  {
    value: 'furgoneta',
    label: 'Furgoneta',
    description: 'Vehículo ligero N1 con cabina integrada en la carrocería de carga',
  },
  {
    value: 'grua',
    label: 'Grúa',
    description: 'Vehículo equipado con brazo grúa para carga/descarga de mercancías pesadas',
  },
  {
    value: 'tolva',
    label: 'Tolva',
    description: 'Depósito inclinado para transporte de graneles sólidos (cereales, áridos)',
  },
  {
    value: 'especial',
    label: 'Especial',
    description: 'Otras carrocerías no contempladas en las categorías anteriores',
  },
])

// ── Lookup maps (string → label) ───────────────────────────────────────────

const EU_CATEGORIA_MAP = new Map(EU_CATEGORIAS.map(c => [c.value, c]))
const STRUCTURE_MAP = new Map(VEHICLE_STRUCTURE_TYPES.map(s => [s.value, s]))
const BODY_MAP = new Map(VEHICLE_BODY_TYPES.map(b => [b.value, b]))

// ── Public helpers ──────────────────────────────────────────────────────────

/**
 * @param {string} value
 * @returns {string}
 */
export function getEUCategoriaLabel(value) {
  return EU_CATEGORIA_MAP.get(value)?.label ?? value
}

/**
 * @param {string} value
 * @returns {string}
 */
export function getStructureLabel(value) {
  return STRUCTURE_MAP.get(value)?.label ?? value
}

/**
 * @param {string} value
 * @returns {string}
 */
export function getBodyLabel(value) {
  return BODY_MAP.get(value)?.label ?? value
}

/**
 * @param {string} value
 * @returns {string | null}
 */
export function getEUCategoriaDescription(value) {
  return EU_CATEGORIA_MAP.get(value)?.description ?? null
}

/**
 * @param {string} value
 * @returns {string | null}
 */
export function getBodyDescription(value) {
  return BODY_MAP.get(value)?.description ?? null
}

/**
 * Options for Vuetify v-select.
 * @returns {Array<{ title: string, value: string }>}
 */
export function getEUCategoriaOptions() {
  return EU_CATEGORIAS.map(c => ({ title: c.label, value: c.value }))
}

/**
 * @returns {Array<{ title: string, value: string }>}
 */
export function getStructureOptions() {
  return VEHICLE_STRUCTURE_TYPES.map(s => ({ title: s.label, value: s.value }))
}

/**
 * @returns {Array<{ title: string, value: string }>}
 */
export function getBodyOptions() {
  return VEHICLE_BODY_TYPES.map(b => ({ title: b.label, value: b.value }))
}

/**
 * Get all valid values for each enum.
 * @returns {{ euCategorias: string[], structures: string[], bodyTypes: string[] }}
 */
export function getValidVehicleValues() {
  return {
    euCategorias: EU_CATEGORIAS.map(c => c.value),
    structures: VEHICLE_STRUCTURE_TYPES.map(s => s.value),
    bodyTypes: VEHICLE_BODY_TYPES.map(b => b.value),
  }
}
