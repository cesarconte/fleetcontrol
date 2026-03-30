/**
 * FleetControl — Vehicle Equipment Normative (Equipamiento Normativo)
 *
 * Mandatory vehicle equipment per cargo category, based on applicable
 * Spanish and EU transport regulations.
 *
 * @see AGENTS.md §1 — Regulatory Context
 * @see PRD §4.2.3 — Estado en Tiempo Real
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
 * @typedef {Object} EquipmentGroup
 * @property {string} id
 * @property {string} nombre
 * @property {string[]} elementosObligatorios
 */

/**
 * @typedef {Object} CategoryEquipment
 * @property {string} idCategoria
 * @property {string} nombreCategoria
 * @property {string} normativaAplicable
 * @property {EquipmentGroup[]} subcategorias
 */

/** @type {CategoryEquipment[]} */
export const VEHICLE_EQUIPMENT = deepFreeze([
  {
    idCategoria: 'adr',
    nombreCategoria: 'Mercancías Peligrosas (ADR)',
    normativaAplicable: 'Acuerdo Internacional ADR / Real Decreto 97/2014',
    subcategorias: [
      {
        id: 'adr-general',
        nombre: 'Equipamiento común para cualquier transporte ADR',
        appliesTo: [
          'adr-clase-1',
          'adr-clase-2',
          'adr-clase-3',
          'adr-clase-4',
          'adr-clase-5',
          'adr-clase-6',
          'adr-clase-7',
          'adr-clase-8',
          'adr-clase-9',
        ],
        elementosObligatorios: [
          'calzo_proporcionado_al_peso',
          'dos_senales_de_advertencia_autonomas',
          'liquido_para_lavado_de_ojos',
          'chaleco_fluorescente_conductor',
          'linterna_portatil_sin_superficies_metalicas',
          'guantes_de_proteccion',
          'gafas_de_proteccion',
          'extintor_polvo_abc_min_2kg_cabina',
          'extintores_adicionales_segun_mma_unidad',
        ],
      },
      {
        id: 'adr-clase-1-eq',
        nombre: 'Clase 1: Explosivos',
        appliesTo: ['adr-clase-1'],
        elementosObligatorios: [
          'compartimento_de_carga_cerrado_o_entoldado_ignifugo',
          'homologacion_ex_ii_o_ex_iii_en_ficha_itv',
          'paneles_naranja_reflectantes_lisos',
          'placas_etiquetas_de_peligro_clase_1',
        ],
      },
      {
        id: 'adr-clases-3-9-eq',
        nombre: 'Líquidos, Sólidos y Corrosivos (Cisternas o bultos)',
        appliesTo: ['adr-clase-3', 'adr-clase-4', 'adr-clase-5', 'adr-clase-8', 'adr-clase-9'],
        elementosObligatorios: [
          'mascara_de_evacuacion_de_emergencia',
          'pala_de_recogida',
          'obturador_de_alcantarillado',
          'recipiente_colector_de_plastico',
          'paneles_naranja_con_numeracion_peligro_materia',
          'interruptor_corte_bateria_en_cabina',
        ],
      },
    ],
  },
  {
    idCategoria: 'atp',
    nombreCategoria: 'Mercancías Perecederas (ATP)',
    normativaAplicable: 'Acuerdo ATP / RD 237/2000',
    subcategorias: [
      {
        id: 'atp-frigorificos-eq',
        nombre: 'Transporte bajo temperatura controlada',
        appliesTo: ['atp-congelados', 'atp-refrig-fuerte', 'atp-refrig-suave', 'atp-calorificos'],
        elementosObligatorios: [
          'placa_fna_o_frc_en_el_exterior',
          'termografo_registrador_de_temperatura',
          'carroceria_isoterma_homologada_itv',
          'equipo_de_frio_con_mantenimiento_al_dia',
          'paredes_interiores_lisas_y_lavables',
        ],
      },
    ],
  },
  {
    idCategoria: 'ani',
    nombreCategoria: 'Animales Vivos',
    normativaAplicable: 'Reglamento (CE) nº 1/2005 / RD 542/2016',
    subcategorias: [
      {
        id: 'animales-vivos-eq',
        nombre: 'Transporte de Ganado y Animales',
        appliesTo: [
          'ani-ganado-mayor',
          'ani-ganado-menor',
          'ani-aves-conejos',
          'ani-mascotas-otros',
        ],
        elementosObligatorios: [
          'suelo_antideslizante',
          'sistema_de_recogida_de_deyecciones_y_orines',
          'sistema_de_ventilacion_forzada',
          'sensores_de_temperatura_con_alerta_en_cabina',
          'techo_aislante_del_calor',
          'separadores_interiores_moviles',
          'sistema_de_suministro_de_agua_bebederos',
          'rotulo_exterior_transporte_de_animales_vivos',
        ],
      },
    ],
  },
  {
    idCategoria: 'gen',
    nombreCategoria: 'Carga General y Especialidades',
    normativaAplicable: 'Reglamento General de Vehículos / RD 563/2017 (Estiba)',
    subcategorias: [
      {
        id: 'gen-estandar-eq',
        nombre: 'Carga General Paletizada',
        appliesTo: ['gen-paletizada'],
        elementosObligatorios: [
          'cinchas_de_amarre_homologadas_en_12195_2',
          'puntos_de_amarre_en_chasis',
          'lonas_con_certificado_code_xl_si_hacen_retencion',
        ],
      },
      {
        id: 'gen-siderurgico-eq',
        nombre: 'Bobinas de Acero',
        appliesTo: ['gen-siderurgico'],
        elementosObligatorios: [
          'fosa_porta_bobinas_en_el_semirremolque',
          'alfombrillas_antideslizantes',
          'cinchas_de_alta_resistencia_stf_500_dan',
          'protectores_de_cantos',
        ],
      },
      {
        id: 'gen-vidrio-eq',
        nombre: 'Vidrio y Cristalería',
        appliesTo: ['gen-vidrio'],
        elementosObligatorios: [
          'caballetes_especificos_de_transporte_vidrio',
          'suspension_neumatica_en_ejes_traseros',
          'barras_de_bloqueo_ajustables',
        ],
      },
      {
        id: 'gen-residuos-eq',
        nombre: 'Residuos No Peligrosos',
        appliesTo: ['gen-residuos'],
        elementosObligatorios: [
          'placa_reflectante_letra_r_blanca_fondo_naranja',
          'lona_de_cubricion_para_evitar_vuelos_de_carga',
          'estanqueidad_si_transporta_lodos_o_liquidos',
        ],
      },
    ],
  },
])

// ── Lookup index (subcategoryId → equipment groups that apply) ──────────────

/** @type {Map<string, { groupName: string, elementos: string[], normativa: string }[]>} */
const equipmentBySubcategory = new Map()

for (const cat of VEHICLE_EQUIPMENT) {
  for (const group of cat.subcategorias) {
    for (const subId of group.appliesTo) {
      if (!equipmentBySubcategory.has(subId)) {
        equipmentBySubcategory.set(subId, [])
      }
      equipmentBySubcategory.get(subId).push({
        groupName: group.nombre,
        elementos: group.elementosObligatorios,
        normativa: cat.normativaAplicable,
      })
    }
  }
}

// ── Public helpers ──────────────────────────────────────────────────────────

/**
 * Get all equipment groups for a given subcategory ID.
 * @param {string} subcategoryId - e.g. 'adr-clase-1', 'atp-congelados'
 * @returns {Array<{ groupName: string, elementos: string[], normativa: string }>}
 */
export function getEquipmentChecklist(subcategoryId) {
  return equipmentBySubcategory.get(subcategoryId) ?? []
}

/**
 * Get all mandatory equipment elements (flat list) for a subcategory.
 * @param {string} subcategoryId
 * @returns {string[]}
 */
export function getEquipmentElements(subcategoryId) {
  const groups = getEquipmentChecklist(subcategoryId)
  return groups.flatMap(g => g.elementos)
}

/**
 * Get the normative reference for a subcategory.
 * @param {string} subcategoryId
 * @returns {string | null}
 */
export function getNormativeReference(subcategoryId) {
  const groups = getEquipmentChecklist(subcategoryId)
  return groups.length > 0 ? groups[0].normativa : null
}

/**
 * Get the category-level equipment by category ID.
 * @param {string} categoryId - e.g. 'adr', 'atp'
 * @returns {CategoryEquipment | undefined}
 */
export function getCategoryEquipment(categoryId) {
  return VEHICLE_EQUIPMENT.find(c => c.idCategoria === categoryId)
}

/**
 * Get all subcategory IDs that have equipment requirements.
 * @returns {string[]}
 */
export function getSubcategoriesWithEquipment() {
  return Array.from(equipmentBySubcategory.keys())
}
