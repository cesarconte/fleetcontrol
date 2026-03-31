/**
 * FleetControl — Vehicle Equipment Normative (Equipamiento Normativo)
 *
 * Mandatory and recommended vehicle equipment per cargo category.
 * - elementosObligatorios: required by Spanish/EU regulation
 * - elementosRecomendados: industry best practice (not mandatory)
 *
 * @see AGENTS.md §1 — Regulatory Context
 * @see PRD §4.4.3
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
 * @property {string[]} appliesTo
 * @property {string[]} elementosObligatorios
 * @property {string[]} [elementosRecomendados]
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
  // ════════════════════════════════════════════════════════════════════════════
  // ADR — Mercancías Peligrosas
  // ════════════════════════════════════════════════════════════════════════════
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
        id: 'adr-clase-2-eq',
        nombre: 'Clase 2: Gases',
        appliesTo: ['adr-clase-2'],
        elementosObligatorios: [
          'detector_de_fugas_de_gas_portatil',
          'manometro_de_verificacion_presion',
          'ganchos_o_arneses_suspension_botellas',
        ],
        elementosRecomendados: ['mangueras_flexible_conexion_homologadas'],
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
      {
        id: 'adr-clase-6-eq',
        nombre: 'Clase 6: Materias tóxicas e infecciosas',
        appliesTo: ['adr-clase-6'],
        elementosObligatorios: [
          'mascarilla_filtro_p3_o_equipo_autonomo',
          'traje_proteccion_contra_agentes_quimicos',
          'kit_descontaminacion_personal',
        ],
        elementosRecomendados: ['doble_bolsa_estanca_para_residuos_contaminados'],
      },
      {
        id: 'adr-clase-7-eq',
        nombre: 'Clase 7: Materias radiactivas',
        appliesTo: ['adr-clase-7'],
        elementosObligatorios: [
          'detector_radiacion_portatil',
          'dosimetros_personales_para_tripulacion',
          'kit_contaminacion_radiactiva',
          'senal_radiacion_ionizante_adicional',
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // ATP — Mercancías Perecederas
  // ════════════════════════════════════════════════════════════════════════════
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

  // ════════════════════════════════════════════════════════════════════════════
  // ANI — Animales Vivos
  // ════════════════════════════════════════════════════════════════════════════
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

  // ════════════════════════════════════════════════════════════════════════════
  // GEN — Carga General y Especialidades
  // ════════════════════════════════════════════════════════════════════════════
  {
    idCategoria: 'gen',
    nombreCategoria: 'Carga General y Especialidades',
    normativaAplicable: 'RD 563/2017 (Estiba) / RD 2822/1998 (RGV)',
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
        id: 'gen-granel-solido-eq',
        nombre: 'Granel Sólido (cereales, áridos, minerales)',
        appliesTo: ['gen-granel-solido'],
        elementosObligatorios: [],
        elementosRecomendados: [
          'mascarilla_contra_polvo_ffp2',
          'pala_o_sistema_descarga_mecanico',
          'lonas_de_cubricion_estancas',
          'calzos_antideslizantes_para_descarga',
        ],
      },
      {
        id: 'gen-granel-liquido-eq',
        nombre: 'Granel Líquido NO Peligroso',
        appliesTo: ['gen-granel-liquido'],
        elementosObligatorios: [],
        elementosRecomendados: [
          'bandeja_contencion_derrames',
          'kit_absorbente_derrames',
          'gafas_proteccion_contra_salpicaduras',
        ],
      },
      {
        id: 'gen-textil-eq',
        nombre: 'Textil / Prendas Colgadas',
        appliesTo: ['gen-textil'],
        elementosObligatorios: [],
        elementosRecomendados: [
          'barras_colgar_textil_en_techo',
          'fundas_protectoras_para_prendas',
          'cintas_sujecion_para_barras',
        ],
      },
      {
        id: 'gen-maquinaria-eq',
        nombre: 'Maquinaria y Vehículos',
        appliesTo: ['gen-maquinaria'],
        elementosObligatorios: [
          'cinchas_de_amarre_homologadas_en_12195_2',
          'calzo_proporcionado_al_peso',
        ],
        elementosRecomendados: [
          'senal_sobredimensionada_si_procede',
          'carro_auxiliar_para_maquinaria_pesada',
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
        id: 'gen-gran-volumen-eq',
        nombre: 'Gran Volumen / Carga Ligera',
        appliesTo: ['gen-gran-volumen'],
        elementosObligatorios: ['cinchas_de_amarre_homologadas_en_12195_2'],
        elementosRecomendados: [
          'esquineros_proteccion_para_carga',
          'malla_antideslizante_sobre_carga',
        ],
      },
      {
        id: 'gen-mudanzas-eq',
        nombre: 'Mudanzas',
        appliesTo: ['gen-mudanzas'],
        elementosObligatorios: [],
        elementosRecomendados: [
          'mantas_protectoras_para_muebles',
          'carro_de_mano_escaleras',
          'film_de_burbujas_protector',
          'cinta_embalar_reforzada',
          'cinchas_de_amarre_interior_furgon',
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

// ── Lookup index ────────────────────────────────────────────────────────────

/** @type {Map<string, { groupName: string, elementos: string[], elementosRecomendados: string[], normativa: string }[]>} */
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
        elementosRecomendados: group.elementosRecomendados ?? [],
        normativa: cat.normativaAplicable,
      })
    }
  }
}

// ── Public helpers ──────────────────────────────────────────────────────────

/**
 * Get all equipment groups for a given subcategory ID.
 * @param {string} subcategoryId
 * @returns {Array<{ groupName: string, elementos: string[], elementosRecomendados: string[], normativa: string }>}
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
 * Get all recommended equipment elements (flat list) for a subcategory.
 * @param {string} subcategoryId
 * @returns {string[]}
 */
export function getRecommendedEquipmentElements(subcategoryId) {
  const groups = getEquipmentChecklist(subcategoryId)
  return groups.flatMap(g => g.elementosRecomendados)
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
 * @param {string} categoryId
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
