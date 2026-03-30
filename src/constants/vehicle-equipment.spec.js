import { describe, it, expect } from 'vitest'
import {
  VEHICLE_EQUIPMENT,
  getEquipmentChecklist,
  getEquipmentElements,
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
          expect(group.elementosObligatorios.length).toBeGreaterThan(0)
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

    it('subcategorías cubiertas deberían referenciar IDs válidos', () => {
      const allSubIds = new Set(getAllSubcategories().map(s => s.id))
      const coveredIds = new Set()
      VEHICLE_EQUIPMENT.forEach(cat => {
        cat.subcategorias.forEach(group => {
          group.appliesTo.forEach(id => coveredIds.add(id))
        })
      })
      // Todos los IDs cubiertos deben existir en cargo-categories
      coveredIds.forEach(id => {
        expect(allSubIds.has(id)).toBe(true)
      })
    })

    it('debería cubrir al menos 21 de 27 subcategorías (6 gen sin equipamiento específico definido)', () => {
      const coveredIds = new Set()
      VEHICLE_EQUIPMENT.forEach(cat => {
        cat.subcategorias.forEach(group => {
          group.appliesTo.forEach(id => coveredIds.add(id))
        })
      })
      expect(coveredIds.size).toBeGreaterThanOrEqual(21)
      // TODO 2026-03-30: Definir equipamiento para gen-granel-solido, gen-granel-liquido,
      // gen-textil, gen-maquinaria, gen-gran-volumen, gen-mudanzas
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

    it('atp-congelados debería tener equipamiento ATP', () => {
      const groups = getEquipmentChecklist('atp-congelados')
      expect(groups.length).toBeGreaterThanOrEqual(1)
      expect(groups[0].elementos).toContain('termografo_registrador_de_temperatura')
    })

    it('subcategoría inexistente debería retornar array vacío', () => {
      expect(getEquipmentChecklist('no-existe')).toEqual([])
    })
  })

  describe('getEquipmentElements', () => {
    it('debería retornar lista plana de elementos', () => {
      const elements = getEquipmentElements('adr-clase-1')
      expect(elements.length).toBeGreaterThan(0)
      expect(elements).toContain('calzo_proporcionado_al_peso')
      expect(elements).toContain('placas_etiquetas_de_peligro_clase_1')
    })

    it('gen-paletizada debería tener cinchas de amarre', () => {
      const elements = getEquipmentElements('gen-paletizada')
      expect(elements).toContain('cinchas_de_amarre_homologadas_en_12195_2')
    })

    it('subcategoría sin equipamiento debería retornar array vacío', () => {
      expect(getEquipmentElements('no-existe')).toEqual([])
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
    it('debería retornar todas las subcategorías cubiertas', () => {
      const subs = getSubcategoriesWithEquipment()
      expect(subs.length).toBeGreaterThan(0)
      expect(subs).toContain('adr-clase-1')
      expect(subs).toContain('atp-congelados')
      expect(subs).toContain('ani-ganado-mayor')
      expect(subs).toContain('gen-paletizada')
    })
  })
})
