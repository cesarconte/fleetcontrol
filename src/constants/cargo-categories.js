/**
 * FleetControl — Cargo Categories (Taxonomía de Cargas)
 *
 * Hierarchical cargo category taxonomy with vehicle requirements.
 * Single source of truth for cargo classification.
 *
 * @see AGENTS.md §11 — Legal Domain Rules
 * @see PRD §4.6 — Gestión de Cargas
 */

/** @param {object} obj */
function deepFreeze(obj) {
  Object.keys(obj).forEach(key => {
    const val = obj[key]
    if (val && typeof val === 'object') deepFreeze(val)
  })
  return Object.freeze(obj)
}

/**
 * @typedef {Object} Subcategory
 * @property {string} id
 * @property {string} nombre
 * @property {string[]} requisitosVehiculo
 * @property {string} mapToLegacy
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} nombre
 * @property {string} legacyType
 * @property {Subcategory[]} subcategorias
 */

/** @type {Category[]} */
export const CARGO_CATEGORIES = deepFreeze([
  {
    id: 'adr',
    nombre: 'Mercancías Peligrosas (ADR)',
    legacyType: 'dangerous',
    subcategorias: [
      {
        id: 'adr-clase-1',
        nombre: 'Clase 1: Materias y objetos explosivos',
        requisitosVehiculo: ['permiso_adr_explosivos', 'vehiculo_memu_ex'],
        mapToLegacy: 'dangerous',
      },
      {
        id: 'adr-clase-2',
        nombre: 'Clase 2: Gases',
        requisitosVehiculo: ['permiso_adr_basico', 'cisterna_o_botellero'],
        mapToLegacy: 'dangerous',
      },
      {
        id: 'adr-clase-3',
        nombre: 'Clase 3: Líquidos inflamables',
        requisitosVehiculo: ['permiso_adr_basico', 'camion_cisterna_at_fl'],
        mapToLegacy: 'dangerous',
      },
      {
        id: 'adr-clase-4',
        nombre: 'Clase 4: Sólidos inflamables',
        requisitosVehiculo: ['permiso_adr_basico'],
        mapToLegacy: 'dangerous',
      },
      {
        id: 'adr-clase-5',
        nombre: 'Clase 5: Materias comburentes y peróxidos',
        requisitosVehiculo: ['permiso_adr_basico'],
        mapToLegacy: 'dangerous',
      },
      {
        id: 'adr-clase-6',
        nombre: 'Clase 6: Materias tóxicas e infecciosas',
        requisitosVehiculo: ['permiso_adr_basico'],
        mapToLegacy: 'dangerous',
      },
      {
        id: 'adr-clase-7',
        nombre: 'Clase 7: Materias radiactivas',
        requisitosVehiculo: ['permiso_adr_radiactivos', 'vehiculo_autorizado_cuba'],
        mapToLegacy: 'dangerous',
      },
      {
        id: 'adr-clase-8',
        nombre: 'Clase 8: Materias corrosivas',
        requisitosVehiculo: ['permiso_adr_basico', 'cisterna_anticorrosiva'],
        mapToLegacy: 'dangerous',
      },
      {
        id: 'adr-clase-9',
        nombre: 'Clase 9: Materias y objetos peligrosos diversos',
        requisitosVehiculo: ['permiso_adr_basico'],
        mapToLegacy: 'dangerous',
      },
    ],
  },
  {
    id: 'atp',
    nombre: 'Mercancías Perecederas (ATP)',
    legacyType: 'refrigerated',
    subcategorias: [
      {
        id: 'atp-congelados',
        nombre: 'Congelados / Ultracongelados (<-20°C)',
        requisitosVehiculo: ['certificado_atp', 'frigorifico_clase_c'],
        mapToLegacy: 'refrigerated',
      },
      {
        id: 'atp-refrig-fuerte',
        nombre: 'Refrigerados Fríos (0°C a +4°C)',
        requisitosVehiculo: ['certificado_atp', 'frigorifico_clase_b'],
        mapToLegacy: 'refrigerated',
      },
      {
        id: 'atp-refrig-suave',
        nombre: 'Refrigerados Suaves (+4°C a +12°C)',
        requisitosVehiculo: ['certificado_atp', 'frigorifico_clase_a'],
        mapToLegacy: 'refrigerated',
      },
      {
        id: 'atp-calorificos',
        nombre: 'Caloríficos (>+12°C)',
        requisitosVehiculo: ['certificado_atp', 'calorifico'],
        mapToLegacy: 'refrigerated',
      },
    ],
  },
  {
    id: 'ani',
    nombre: 'Animales Vivos',
    legacyType: 'special',
    subcategorias: [
      {
        id: 'ani-ganado-mayor',
        nombre: 'Ganado Mayor (Vacas, caballos...)',
        requisitosVehiculo: ['autorizacion_transporte_animales', 'camion_ganadero_alto'],
        mapToLegacy: 'special',
      },
      {
        id: 'ani-ganado-menor',
        nombre: 'Ganado Menor (Cerdos, ovejas...)',
        requisitosVehiculo: ['autorizacion_transporte_animales', 'camion_ganadero_pisos'],
        mapToLegacy: 'special',
      },
      {
        id: 'ani-aves-conejos',
        nombre: 'Aves de corral y conejos',
        requisitosVehiculo: ['autorizacion_transporte_animales', 'jaulas_modulares'],
        mapToLegacy: 'special',
      },
      {
        id: 'ani-mascotas-otros',
        nombre: 'Mascotas y otros animales',
        requisitosVehiculo: ['autorizacion_transporte_animales'],
        mapToLegacy: 'special',
      },
    ],
  },
  {
    id: 'gen',
    nombre: 'Carga General / Mercancía Industrial',
    legacyType: 'general',
    subcategorias: [
      {
        id: 'gen-paletizada',
        nombre: 'Carga Paletizada Estándar',
        requisitosVehiculo: ['lona_tauliner', 'furgon_cerrado'],
        mapToLegacy: 'general',
      },
      {
        id: 'gen-granel-solido',
        nombre: 'Granel Sólido',
        requisitosVehiculo: ['camion_basculante', 'banera'],
        mapToLegacy: 'general',
      },
      {
        id: 'gen-granel-liquido',
        nombre: 'Granel Líquido NO Peligroso',
        requisitosVehiculo: ['cisterna_alimentaria'],
        mapToLegacy: 'general',
      },
      {
        id: 'gen-vidrio',
        nombre: 'Vidrio y Cristalería',
        requisitosVehiculo: ['caballetes_sujecion', 'suspension_neumatica'],
        mapToLegacy: 'general',
      },
      {
        id: 'gen-textil',
        nombre: 'Textil / Prendas Colgadas',
        requisitosVehiculo: ['barras_porta_perchas'],
        mapToLegacy: 'general',
      },
      {
        id: 'gen-maquinaria',
        nombre: 'Maquinaria y Vehículos',
        requisitosVehiculo: ['gondola', 'plataforma_abierta', 'portavehiculos'],
        mapToLegacy: 'general',
      },
      {
        id: 'gen-siderurgico',
        nombre: 'Siderúrgico y Bobinas',
        requisitosVehiculo: ['fosa_porta_bobinas', 'cinchas_alta_resistencia'],
        mapToLegacy: 'general',
      },
      {
        id: 'gen-gran-volumen',
        nombre: 'Gran Volumen / Carga Ligera',
        requisitosVehiculo: ['camion_mega', 'tren_de_carretera'],
        mapToLegacy: 'general',
      },
      {
        id: 'gen-residuos',
        nombre: 'Residuos No Peligrosos',
        requisitosVehiculo: ['codigo_nima', 'placa_r'],
        mapToLegacy: 'general',
      },
      {
        id: 'gen-mudanzas',
        nombre: 'Mudanzas',
        requisitosVehiculo: ['camion_capitone', 'trampilla_elevadora'],
        mapToLegacy: 'general',
      },
    ],
  },
])

// ── Lookup index (id → subcategory) ────────────────────────────────────────

/** @type {Map<string, Subcategory & { categoryId: string, categoryName: string }>} */
const subcategoryIndex = new Map()

for (const cat of CARGO_CATEGORIES) {
  for (const sub of cat.subcategorias) {
    subcategoryIndex.set(sub.id, {
      ...sub,
      categoryId: cat.id,
      categoryName: cat.nombre,
    })
  }
}

// ── Public helpers ──────────────────────────────────────────────────────────

/**
 * Get a category by its ID.
 * @param {string} id - Category ID (e.g. 'adr', 'atp')
 * @returns {Category | undefined}
 */
export function getCategoryById(id) {
  return CARGO_CATEGORIES.find(c => c.id === id)
}

/**
 * Get a subcategory by its ID across all categories.
 * @param {string} id - Subcategory ID (e.g. 'adr-clase-1')
 * @returns {(Subcategory & { categoryId: string, categoryName: string }) | undefined}
 */
export function getSubcategoryById(id) {
  return subcategoryIndex.get(id)
}

/**
 * Get all subcategories flattened.
 * @returns {Array<Subcategory & { categoryId: string, categoryName: string }>}
 */
export function getAllSubcategories() {
  return Array.from(subcategoryIndex.values())
}

/**
 * Get subcategories for a given category ID.
 * @param {string} categoryId
 * @returns {Subcategory[]}
 */
export function getSubcategoriesByCategory(categoryId) {
  const cat = getCategoryById(categoryId)
  return cat ? cat.subcategorias : []
}

/**
 * Map a subcategory ID to the legacy cargo_type enum value.
 * @param {string} subcategoryId
 * @returns {'general' | 'refrigerated' | 'dangerous' | 'special'}
 */
export function subcategoryToLegacyType(subcategoryId) {
  const sub = getSubcategoryById(subcategoryId)
  return sub ? sub.mapToLegacy : 'general'
}

/**
 * Get category options for Vuetify v-select (title/value pairs).
 * @returns {Array<{ title: string, value: string }>}
 */
export function getCategoryOptions() {
  return CARGO_CATEGORIES.map(c => ({ title: c.nombre, value: c.id }))
}

/**
 * Get subcategory options for a given category (for Vuetify v-select).
 * @param {string} categoryId
 * @returns {Array<{ title: string, value: string }>}
 */
export function getSubcategoryOptions(categoryId) {
  return getSubcategoriesByCategory(categoryId).map(s => ({
    title: s.nombre,
    value: s.id,
  }))
}

/**
 * Get vehicle requirement labels for a subcategory.
 * @param {string} subcategoryId
 * @returns {string[]}
 */
export function getVehicleRequirements(subcategoryId) {
  const sub = getSubcategoryById(subcategoryId)
  return sub ? sub.requisitosVehiculo : []
}
