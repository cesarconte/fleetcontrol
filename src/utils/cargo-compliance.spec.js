import { describe, it, expect } from 'vitest'
import {
  isVehicleTypeCompatible,
  getRecommendedVehicleTypes,
  checkVehicleCompliance,
  getRequirementsForSubcategory,
} from './cargo-compliance.js'

describe('cargo-compliance', () => {
  describe('isVehicleTypeCompatible', () => {
    it('tanker debería ser compatible con ADR clase 3', () => {
      expect(isVehicleTypeCompatible('tanker', 'adr-clase-3')).toBe(true)
    })

    it('refrigerated NO debería ser compatible con ADR clase 3', () => {
      expect(isVehicleTypeCompatible('refrigerated', 'adr-clase-3')).toBe(false)
    })

    it('refrigerated debería ser compatible con atp-congelados', () => {
      expect(isVehicleTypeCompatible('refrigerated', 'atp-congelados')).toBe(true)
    })

    it('curtain NO debería ser compatible con atp-congelados', () => {
      expect(isVehicleTypeCompatible('curtain', 'atp-congelados')).toBe(false)
    })

    it('livestock debería ser compatible con ani-ganado-mayor', () => {
      expect(isVehicleTypeCompatible('livestock', 'ani-ganado-mayor')).toBe(true)
    })

    it('closed_box NO debería ser compatible con ani-ganado-mayor', () => {
      expect(isVehicleTypeCompatible('closed_box', 'ani-ganado-mayor')).toBe(false)
    })

    it('curtain debería ser compatible con gen-paletizada', () => {
      expect(isVehicleTypeCompatible('curtain', 'gen-paletizada')).toBe(true)
    })

    it('dump debería ser compatible con gen-granel-solido', () => {
      expect(isVehicleTypeCompatible('dump', 'gen-granel-solido')).toBe(true)
    })

    it('subcategoría inexistente debería retornar true', () => {
      expect(isVehicleTypeCompatible('curtain', 'no-existe')).toBe(true)
    })
  })

  describe('getRecommendedVehicleTypes', () => {
    it('adr-clase-2 debería recomendar tanker', () => {
      const types = getRecommendedVehicleTypes('adr-clase-2')
      expect(types).toContain('tanker')
    })

    it('gen-granel-solido debería recomendar dump', () => {
      const types = getRecommendedVehicleTypes('gen-granel-solido')
      expect(types).toContain('dump')
    })

    it('subcategoría inexistente debería retornar array vacío', () => {
      expect(getRecommendedVehicleTypes('no-existe')).toEqual([])
    })
  })

  describe('checkVehicleCompliance', () => {
    it('vehículo compatible debería ser compliant', () => {
      const vehicle = { body_type: 'tanker', status: 'active' }
      const result = checkVehicleCompliance(vehicle, 'adr-clase-3')
      expect(result.isCompliant).toBe(true)
      expect(result.autoFailed).toHaveLength(0)
      expect(result.autoPassed.length).toBeGreaterThan(0)
    })

    it('vehículo incompatible debería fallar auto checks', () => {
      const vehicle = { body_type: 'refrigerated', status: 'active' }
      const result = checkVehicleCompliance(vehicle, 'adr-clase-3')
      expect(result.isCompliant).toBe(false)
      expect(result.autoFailed.length).toBeGreaterThan(0)
    })

    it('vehículo inactivo debería fallar', () => {
      const vehicle = { body_type: 'tanker', status: 'in_maintenance' }
      const result = checkVehicleCompliance(vehicle, 'adr-clase-3')
      expect(result.isCompliant).toBe(false)
      expect(result.autoFailed.some(f => f.includes('in_maintenance'))).toBe(true)
    })

    it('debería retornar equipamiento como manual checks', () => {
      const vehicle = { body_type: 'tanker', status: 'active' }
      const result = checkVehicleCompliance(vehicle, 'adr-clase-3')
      expect(result.manualChecks.length).toBeGreaterThan(0)
      expect(result.manualChecks).toContain('calzo_proporcionado_al_peso')
    })

    it('debería retornar referencia normativa', () => {
      const vehicle = { body_type: 'tanker', status: 'active' }
      const result = checkVehicleCompliance(vehicle, 'adr-clase-3')
      expect(result.normativeReference).toContain('ADR')
    })

    it('debería retornar nombre de subcategoría', () => {
      const vehicle = { body_type: 'refrigerated', status: 'active' }
      const result = checkVehicleCompliance(vehicle, 'atp-congelados')
      expect(result.subcategoryName).toContain('Congelados')
    })

    it('subcategoría inexistente debería retornar compliant', () => {
      const result = checkVehicleCompliance(null, 'no-existe')
      expect(result.isCompliant).toBe(true)
      expect(result.equipmentChecklist).toEqual([])
    })

    it('vehicle null debería retornar solo manual checks', () => {
      const result = checkVehicleCompliance(null, 'adr-clase-1')
      expect(result.manualChecks.length).toBeGreaterThan(0)
      expect(result.autoPassed).toHaveLength(0)
      expect(result.autoFailed).toHaveLength(0)
    })

    it('ATP debería tener checklist de equipamiento frigorífico', () => {
      const vehicle = { body_type: 'refrigerated', status: 'active' }
      const result = checkVehicleCompliance(vehicle, 'atp-congelados')
      expect(result.equipmentChecklist.length).toBeGreaterThanOrEqual(1)
      expect(result.manualChecks).toContain('termografo_registrador_de_temperatura')
    })

    it('gen-paletizada debería tener equipamiento de estiba', () => {
      const vehicle = { body_type: 'curtain', status: 'active' }
      const result = checkVehicleCompliance(vehicle, 'gen-paletizada')
      expect(result.manualChecks).toContain('cinchas_de_amarre_homologadas_en_12195_2')
    })
  })

  describe('getRequirementsForSubcategory', () => {
    it('debería retornar requisitos de vehículo para ADR', () => {
      const reqs = getRequirementsForSubcategory('adr-clase-1')
      expect(reqs.vehicleRequirements).toContain('permiso_adr_explosivos')
      expect(reqs.equipmentElements.length).toBeGreaterThan(0)
      expect(reqs.normativeReference).toContain('ADR')
    })

    it('subcategoría inexistente debería retornar vacío', () => {
      const reqs = getRequirementsForSubcategory('no-existe')
      expect(reqs.vehicleRequirements).toEqual([])
      expect(reqs.equipmentElements).toEqual([])
      expect(reqs.normativeReference).toBeNull()
    })
  })
})
