import { describe, it, expect } from 'vitest'
import {
  VEHICLE_EQUIPMENT,
  getEquipmentChecklist,
  getEquipmentElements,
  getRecommendedEquipmentElements,
  getNormativeReference,
  getCategoryEquipment,
  getSubcategoriesWithEquipment,
} from './vehicle-equipment.js'
import { getAllSubcategories } from './cargo-categories.js'

describe('vehicle-equipment', () => {
  describe('estructura', () => {
    it('debería tener 4 categorías de equipamiento', () => {
      expect(VEHICLE_EQUIPMENT).toHaveLength(4)
    })

    it('cada categoría debería tener idCategoria, nombreCategoria, normativaAplicable y subcategorias', () => {
      VEHICLE_EQUIPMENT.forEach(cat => {
        expect(cat).toHaveProperty('idCategoria')
        expect(cat).toHaveProperty('nombreCategoria')
        expect(cat).toHaveProperty('normativaAplicable')
        expect(cat).toHaveProperty('subcategorias')
        expect(Array.isArray(cat.subcategorias)).toBe(true)
      })
    })

    it('cada grupo de equipamiento debería tener id, nombre, appliesTo y elementosObligatorios', () => {
      VEHICLE_EQUIPMENT.forEach(cat => {
        cat.subcategorias.forEach(group => {
          expect(group).toHaveProperty('id')
          expect(group).toHaveProperty('nombre')
          expect(group).toHaveProperty('appliesTo')
          expect(group).toHaveProperty('elementosObligatorios')
          expect(Array.isArray(group.appliesTo)).toBe(true)
          expect(Array.isArray(group.elementosObligatorios)).toBe(true)
        })
      })
    })
  })

  describe('inmutabilidad', () => {
    it('VEHICLE_EQUIPMENT debería estar congelado', () => {
      expect(Object.isFrozen(VEHICLE_EQUIPMENT)).toBe(true)
    })
  })

  describe('coherencia con cargo-categories', () => {
    it('todos los appliesTo deberían referenciar subcategorías existentes', () => {
      const validIds = new Set(getAllSubcategories().map(s => s.id))
      VEHICLE_EQUIPMENT.forEach(cat => {
        cat.subcategorias.forEach(group => {
          group.appliesTo.forEach(subId => {
            expect(validIds.has(subId)).toBe(true)
          })
        })
      })
    })

    it('debería cubrir las 27 subcategorías', () => {
      const coveredIds = new Set()
      VEHICLE_EQUIPMENT.forEach(cat => {
        cat.subcategorias.forEach(group => {
          group.appliesTo.forEach(id => coveredIds.add(id))
        })
      })
      expect(coveredIds.size).toBe(27)
    })
  })

  describe('getEquipmentChecklist', () => {
    it('adr-clase-1 debería tener equipamiento general + específico', () => {
      const groups = getEquipmentChecklist('adr-clase-1')
      expect(groups.length).toBeGreaterThanOrEqual(2)
      const groupNames = groups.map(g => g.groupName)
      expect(groupNames.some(n => n.includes('común'))).toBe(true)
      expect(groupNames.some(n => n.includes('Explosivos'))).toBe(true)
    })

    it('adr-clase-2 debería tener equipamiento general + específico de gases', () => {
      const groups = getEquipmentChecklist('adr-clase-2')
      expect(groups.length).toBeGreaterThanOrEqual(2)
      const allElements = groups.flatMap(g => g.elementos)
      expect(allElements).toContain('detector_de_fugas_de_gas_portatil')
    })

    it('adr-clase-6 debería tener equipamiento general + específico de tóxicos', () => {
      const groups = getEquipmentChecklist('adr-clase-6')
      expect(groups.length).toBeGreaterThanOrEqual(2)
      const allElements = groups.flatMap(g => g.elementos)
      expect(allElements).toContain('mascarilla_filtro_p3_o_equipo_autonomo')
    })

    it('adr-clase-7 debería tener equipamiento general + específico de radiactivas', () => {
      const groups = getEquipmentChecklist('adr-clase-7')
      expect(groups.length).toBeGreaterThanOrEqual(2)
      const allElements = groups.flatMap(g => g.elementos)
      expect(allElements).toContain('detector_radiacion_portatil')
    })

    it('atp-congelados debería tener equipamiento ATP', () => {
      const groups = getEquipmentChecklist('atp-congelados')
      expect(groups.length).toBeGreaterThanOrEqual(1)
      expect(groups[0].elementos).toContain('termografo_registrador_de_temperatura')
    })

    it('gen-granel-solido debería tener equipamiento recomendado', () => {
      const groups = getEquipmentChecklist('gen-granel-solido')
      expect(groups.length).toBeGreaterThanOrEqual(1)
      expect(groups[0].elementosRecomendados).toContain('mascarilla_contra_polvo_ffp2')
    })

    it('gen-mudanzas debería tener equipamiento recomendado', () => {
      const groups = getEquipmentChecklist('gen-mudanzas')
      expect(groups.length).toBeGreaterThanOrEqual(1)
      expect(groups[0].elementosRecomendados).toContain('mantas_protectoras_para_muebles')
    })

    it('subcategoría inexistente debería retornar array vacío', () => {
      expect(getEquipmentChecklist('no-existe')).toEqual([])
    })
  })

  describe('getEquipmentElements (obligatorios)', () => {
    it('debería retornar lista plana de elementos obligatorios', () => {
      const elements = getEquipmentElements('adr-clase-1')
      expect(elements.length).toBeGreaterThan(0)
      expect(elements).toContain('calzo_proporcionado_al_peso')
      expect(elements).toContain('placas_etiquetas_de_peligro_clase_1')
    })

    it('gen-paletizada debería tener cinchas de amarre', () => {
      const elements = getEquipmentElements('gen-paletizada')
      expect(elements).toContain('cinchas_de_amarre_homologadas_en_12195_2')
    })

    it('gen-granel-solido NO debería tener elementos obligatorios', () => {
      const elements = getEquipmentElements('gen-granel-solido')
      expect(elements).toHaveLength(0)
    })

    it('subcategoría sin equipamiento debería retornar array vacío', () => {
      expect(getEquipmentElements('no-existe')).toEqual([])
    })
  })

  describe('getRecommendedEquipmentElements', () => {
    it('gen-granel-solido debería retornar elementos recomendados', () => {
      const elements = getRecommendedEquipmentElements('gen-granel-solido')
      expect(elements.length).toBeGreaterThan(0)
      expect(elements).toContain('mascarilla_contra_polvo_ffp2')
    })

    it('gen-maquinaria debería retornar elementos recomendados', () => {
      const elements = getRecommendedEquipmentElements('gen-maquinaria')
      expect(elements).toContain('senal_sobredimensionada_si_procede')
    })

    it('gen-paletizada NO debería tener elementos recomendados', () => {
      const elements = getRecommendedEquipmentElements('gen-paletizada')
      expect(elements).toHaveLength(0)
    })

    it('subcategoría inexistente debería retornar array vacío', () => {
      expect(getRecommendedEquipmentElements('no-existe')).toEqual([])
    })
  })

  describe('getNormativeReference', () => {
    it('ADR debería referenciar RD 97/2014', () => {
      const ref = getNormativeReference('adr-clase-1')
      expect(ref).toContain('ADR')
      expect(ref).toContain('97/2014')
    })

    it('ATP debería referenciar ATP / RD 237/2000', () => {
      const ref = getNormativeReference('atp-congelados')
      expect(ref).toContain('ATP')
      expect(ref).toContain('237/2000')
    })

    it('GEN debería referenciar RD 563/2017', () => {
      const ref = getNormativeReference('gen-paletizada')
      expect(ref).toContain('563/2017')
    })

    it('subcategoría inexistente debería retornar null', () => {
      expect(getNormativeReference('no-existe')).toBeNull()
    })
  })

  describe('getCategoryEquipment', () => {
    it('debería retornar equipamiento de ADR', () => {
      const eq = getCategoryEquipment('adr')
      expect(eq).toBeDefined()
      expect(eq.normativaAplicable).toContain('ADR')
    })

    it('categoría inexistente debería retornar undefined', () => {
      expect(getCategoryEquipment('no-existe')).toBeUndefined()
    })
  })

  describe('getSubcategoriesWithEquipment', () => {
    it('debería retornar las 27 subcategorías cubiertas', () => {
      const subs = getSubcategoriesWithEquipment()
      expect(subs).toHaveLength(27)
      expect(subs).toContain('adr-clase-1')
      expect(subs).toContain('atp-congelados')
      expect(subs).toContain('ani-ganado-mayor')
      expect(subs).toContain('gen-paletizada')
      expect(subs).toContain('gen-mudanzas')
      expect(subs).toContain('gen-granel-solido')
    })
  })
})
