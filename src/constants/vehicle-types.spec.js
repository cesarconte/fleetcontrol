import { describe, it, expect } from 'vitest'
import {
  EU_CATEGORIAS,
  VEHICLE_STRUCTURE_TYPES,
  VEHICLE_BODY_TYPES,
  getEUCategoriaLabel,
  getStructureLabel,
  getBodyLabel,
  getEUCategoriaDescription,
  getBodyDescription,
  getEUCategoriaOptions,
  getStructureOptions,
  getBodyOptions,
  getValidVehicleValues,
} from './vehicle-types.js'

describe('vehicle-types', () => {
  describe('EU_CATEGORIAS', () => {
    it('debería tener 7 categorías (N1-N3, O1-O4)', () => {
      expect(EU_CATEGORIAS).toHaveLength(7)
    })

    it('debería tener N1, N2, N3, O1, O2, O3, O4', () => {
      const values = EU_CATEGORIAS.map(c => c.value)
      expect(values).toEqual(['N1', 'N2', 'N3', 'O1', 'O2', 'O3', 'O4'])
    })

    it('cada categoría debería tener value, label, description, mmaRange, licencia', () => {
      EU_CATEGORIAS.forEach(cat => {
        expect(cat).toHaveProperty('value')
        expect(cat).toHaveProperty('label')
        expect(cat).toHaveProperty('description')
        expect(cat).toHaveProperty('mmaRange')
        expect(cat).toHaveProperty('licencia')
      })
    })

    it('debería estar congelado', () => {
      expect(Object.isFrozen(EU_CATEGORIAS)).toBe(true)
    })
  })

  describe('VEHICLE_STRUCTURE_TYPES', () => {
    it('debería tener 7 tipos de estructura', () => {
      expect(VEHICLE_STRUCTURE_TYPES).toHaveLength(7)
    })

    it('cada tipo debería tener value, label, description', () => {
      VEHICLE_STRUCTURE_TYPES.forEach(t => {
        expect(t).toHaveProperty('value')
        expect(t).toHaveProperty('label')
        expect(t).toHaveProperty('description')
      })
    })

    it('debería incluir valores en inglés: rigid, tractor, road_train, trailer', () => {
      const values = VEHICLE_STRUCTURE_TYPES.map(t => t.value)
      expect(values).toContain('rigid')
      expect(values).toContain('tractor')
      expect(values).toContain('road_train')
      expect(values).toContain('trailer')
    })

    it('debería estar congelado', () => {
      expect(Object.isFrozen(VEHICLE_STRUCTURE_TYPES)).toBe(true)
    })
  })

  describe('VEHICLE_BODY_TYPES', () => {
    it('debería tener al menos 20 tipos de carrocería', () => {
      expect(VEHICLE_BODY_TYPES.length).toBeGreaterThanOrEqual(20)
    })

    it('cada tipo debería tener value, label, description', () => {
      VEHICLE_BODY_TYPES.forEach(t => {
        expect(t).toHaveProperty('value')
        expect(t).toHaveProperty('label')
        expect(t).toHaveProperty('description')
      })
    })

    it('values deberían ser snake_case en inglés', () => {
      const validPattern = /^[a-z][a-z_]+$/
      VEHICLE_BODY_TYPES.forEach(t => {
        expect(validPattern.test(t.value)).toBe(true)
      })
    })

    it('debería incluir body types clave en inglés: curtain, refrigerated, tanker, dump', () => {
      const values = VEHICLE_BODY_TYPES.map(t => t.value)
      expect(values).toContain('curtain')
      expect(values).toContain('refrigerated')
      expect(values).toContain('tanker')
      expect(values).toContain('dump')
      expect(values).toContain('container_carrier')
      expect(values).toContain('coil_carrier')
    })

    it('debería estar congelado', () => {
      expect(Object.isFrozen(VEHICLE_BODY_TYPES)).toBe(true)
    })
  })

  describe('getEUCategoriaLabel', () => {
    it('debería retornar label para N1', () => {
      expect(getEUCategoriaLabel('N1')).toContain('Ligeros')
    })

    it('debería retornar label para O4', () => {
      expect(getEUCategoriaLabel('O4')).toContain('Gran tonelaje')
    })

    it('debería retornar el valor para desconocido', () => {
      expect(getEUCategoriaLabel('X9')).toBe('X9')
    })
  })

  describe('getStructureLabel', () => {
    it('debería retornar label para rigid', () => {
      expect(getStructureLabel('rigid')).toBe('Rígido')
    })

    it('debería retornar label para tractor', () => {
      expect(getStructureLabel('tractor')).toContain('Tractora')
    })

    it('debería retornar el valor para desconocido', () => {
      expect(getStructureLabel('unknown')).toBe('unknown')
    })
  })

  describe('getBodyLabel', () => {
    it('debería retornar label para curtain', () => {
      expect(getBodyLabel('curtain')).toContain('Lona')
    })

    it('debería retornar label para tanker', () => {
      expect(getBodyLabel('tanker')).toContain('Cisterna')
    })

    it('debería retornar el valor para desconocido', () => {
      expect(getBodyLabel('unknown')).toBe('unknown')
    })
  })

  describe('getEUCategoriaDescription', () => {
    it('debería retornar descripción para N1', () => {
      expect(getEUCategoriaDescription('N1')).toContain('3.500')
    })

    it('debería retornar null para desconocido', () => {
      expect(getEUCategoriaDescription('X9')).toBeNull()
    })
  })

  describe('getBodyDescription', () => {
    it('debería retornar descripción para refrigerated', () => {
      expect(getBodyDescription('refrigerated')).toContain('perecedera')
    })

    it('debería retornar null para desconocido', () => {
      expect(getBodyDescription('unknown')).toBeNull()
    })
  })

  describe('getEUCategoriaOptions', () => {
    it('debería retornar 7 opciones para v-select', () => {
      const opts = getEUCategoriaOptions()
      expect(opts).toHaveLength(7)
      opts.forEach(o => {
        expect(o).toHaveProperty('title')
        expect(o).toHaveProperty('value')
      })
    })
  })

  describe('getStructureOptions', () => {
    it('debería retornar opciones para v-select', () => {
      const opts = getStructureOptions()
      expect(opts.length).toBeGreaterThan(0)
      opts.forEach(o => {
        expect(o).toHaveProperty('title')
        expect(o).toHaveProperty('value')
      })
    })
  })

  describe('getBodyOptions', () => {
    it('debería retornar opciones para v-select', () => {
      const opts = getBodyOptions()
      expect(opts.length).toBeGreaterThan(0)
      opts.forEach(o => {
        expect(o).toHaveProperty('title')
        expect(o).toHaveProperty('value')
      })
    })
  })

  describe('getValidVehicleValues', () => {
    it('debería retornar los 3 arrays de valores válidos', () => {
      const vals = getValidVehicleValues()
      expect(vals.euCategorias).toHaveLength(7)
      expect(vals.structures.length).toBeGreaterThan(0)
      expect(vals.bodyTypes.length).toBeGreaterThan(0)
    })
  })
})
