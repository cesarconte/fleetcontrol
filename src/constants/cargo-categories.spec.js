import { describe, it, expect } from 'vitest'
import {
  CARGO_CATEGORIES,
  getCategoryById,
  getSubcategoryById,
  getAllSubcategories,
  getSubcategoriesByCategory,
  subcategoryToLegacyType,
  getCategoryOptions,
  getSubcategoryOptions,
  getVehicleRequirements,
} from './cargo-categories.js'

describe('cargo-categories', () => {
  describe('estructura', () => {
    it('debería tener 4 categorías', () => {
      expect(CARGO_CATEGORIES).toHaveLength(4)
    })

    it('debería tener IDs únicos en categorías', () => {
      const ids = CARGO_CATEGORIES.map(c => c.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('cada categoría debería tener nombre, legacyType y subcategorias', () => {
      CARGO_CATEGORIES.forEach(cat => {
        expect(cat).toHaveProperty('id')
        expect(cat).toHaveProperty('nombre')
        expect(cat).toHaveProperty('legacyType')
        expect(cat).toHaveProperty('subcategorias')
        expect(Array.isArray(cat.subcategorias)).toBe(true)
        expect(cat.subcategorias.length).toBeGreaterThan(0)
      })
    })

    it('cada subcategoría debería tener id, nombre, requisitosVehiculo y mapToLegacy', () => {
      CARGO_CATEGORIES.forEach(cat => {
        cat.subcategorias.forEach(sub => {
          expect(sub).toHaveProperty('id')
          expect(sub).toHaveProperty('nombre')
          expect(sub).toHaveProperty('requisitosVehiculo')
          expect(sub).toHaveProperty('mapToLegacy')
          expect(Array.isArray(sub.requisitosVehiculo)).toBe(true)
        })
      })
    })

    it('debería tener 27 subcategorías en total', () => {
      const total = CARGO_CATEGORIES.reduce((acc, cat) => acc + cat.subcategorias.length, 0)
      expect(total).toBe(27)
    })

    it('IDs de subcategorías deberían ser únicos globalmente', () => {
      const allIds = getAllSubcategories().map(s => s.id)
      expect(new Set(allIds).size).toBe(allIds.length)
    })

    it('IDs deberían usar kebab-case', () => {
      const kebabCase = /^[a-z][a-z0-9-]+$/
      CARGO_CATEGORIES.forEach(cat => {
        expect(kebabCase.test(cat.id)).toBe(true)
        cat.subcategorias.forEach(sub => {
          expect(kebabCase.test(sub.id)).toBe(true)
        })
      })
    })

    it('mapToLegacy debería ser un valor del enum cargo_type', () => {
      const validTypes = ['general', 'frigorifica', 'peligrosa', 'especial']
      CARGO_CATEGORIES.forEach(cat => {
        cat.subcategorias.forEach(sub => {
          expect(validTypes).toContain(sub.mapToLegacy)
        })
      })
    })
  })

  describe('inmutabilidad', () => {
    it('CARGO_CATEGORIES debería estar congelado', () => {
      expect(Object.isFrozen(CARGO_CATEGORIES)).toBe(true)
    })

    it('no debería permitir modificar subcategorías', () => {
      const cat = CARGO_CATEGORIES[0]
      expect(() => {
        cat.nuevaProp = 'test'
      }).toThrow()
    })
  })

  describe('getCategoryById', () => {
    it('debería retornar la categoría ADR', () => {
      const cat = getCategoryById('adr')
      expect(cat).toBeDefined()
      expect(cat.nombre).toContain('Peligrosas')
    })

    it('debería retornar undefined para ID inexistente', () => {
      expect(getCategoryById('no-existe')).toBeUndefined()
    })
  })

  describe('getSubcategoryById', () => {
    it('debería retornar adr-clase-1 con categoryId adr', () => {
      const sub = getSubcategoryById('adr-clase-1')
      expect(sub).toBeDefined()
      expect(sub.categoryId).toBe('adr')
      expect(sub.nombre).toContain('explosivos')
    })

    it('debería retornar atp-congelados con categoryId atp', () => {
      const sub = getSubcategoryById('atp-congelados')
      expect(sub).toBeDefined()
      expect(sub.categoryId).toBe('atp')
    })

    it('debería retornar undefined para ID inexistente', () => {
      expect(getSubcategoryById('no-existe')).toBeUndefined()
    })
  })

  describe('getAllSubcategories', () => {
    it('debería retornar 27 subcategorías', () => {
      expect(getAllSubcategories()).toHaveLength(27)
    })

    it('cada subcategoría debería tener categoryId y categoryName', () => {
      getAllSubcategories().forEach(sub => {
        expect(sub).toHaveProperty('categoryId')
        expect(sub).toHaveProperty('categoryName')
      })
    })
  })

  describe('getSubcategoriesByCategory', () => {
    it('debería retornar 9 subcategorías para ADR', () => {
      expect(getSubcategoriesByCategory('adr')).toHaveLength(9)
    })

    it('debería retornar 4 subcategorías para ATP', () => {
      expect(getSubcategoriesByCategory('atp')).toHaveLength(4)
    })

    it('debería retornar array vacío para categoría inexistente', () => {
      expect(getSubcategoriesByCategory('no-existe')).toEqual([])
    })
  })

  describe('subcategoryToLegacyType', () => {
    it('ADR debería mapear a peligrosa', () => {
      expect(subcategoryToLegacyType('adr-clase-1')).toBe('peligrosa')
    })

    it('ATP debería mapear a frigorifica', () => {
      expect(subcategoryToLegacyType('atp-congelados')).toBe('frigorifica')
    })

    it('Animales debería mapear a especial', () => {
      expect(subcategoryToLegacyType('ani-ganado-mayor')).toBe('especial')
    })

    it('General debería mapear a general', () => {
      expect(subcategoryToLegacyType('gen-paletizada')).toBe('general')
    })

    it('desconocido debería retornar general por defecto', () => {
      expect(subcategoryToLegacyType('no-existe')).toBe('general')
    })
  })

  describe('getCategoryOptions', () => {
    it('debería retornar opciones para v-select', () => {
      const opts = getCategoryOptions()
      expect(opts).toHaveLength(4)
      opts.forEach(opt => {
        expect(opt).toHaveProperty('title')
        expect(opt).toHaveProperty('value')
      })
    })
  })

  describe('getSubcategoryOptions', () => {
    it('debería retornar opciones para v-select de ADR', () => {
      const opts = getSubcategoryOptions('adr')
      expect(opts.length).toBeGreaterThan(0)
      opts.forEach(opt => {
        expect(opt).toHaveProperty('title')
        expect(opt).toHaveProperty('value')
      })
    })

    it('debería retornar array vacío para categoría inexistente', () => {
      expect(getSubcategoryOptions('no-existe')).toEqual([])
    })
  })

  describe('getVehicleRequirements', () => {
    it('adr-clase-1 debería tener requisitos específicos', () => {
      const reqs = getVehicleRequirements('adr-clase-1')
      expect(reqs.length).toBeGreaterThan(0)
      expect(reqs).toContain('permiso_adr_explosivos')
    })

    it('subcategoría inexistente debería retornar array vacío', () => {
      expect(getVehicleRequirements('no-existe')).toEqual([])
    })
  })
})
