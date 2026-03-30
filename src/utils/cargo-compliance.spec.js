import { describe, it, expect } from 'vitest'
import {
  isVehicleTypeCompatible,
  getRecommendedVehicleTypes,
  checkVehicleCompliance,
  getRequirementsForSubcategory,
} from './cargo-compliance.js'

describe('cargo-compliance', () => {
  describe('isVehicleTypeCompatible', () => {
    it('cisterna debería ser compatible con ADR clase 3', () => {
      expect(isVehicleTypeCompatible('cisterna', 'adr-clase-3')).toBe(true)
    })

    it('frigorifico NO debería ser compatible con ADR clase 3', () => {
      expect(isVehicleTypeCompatible('frigorifico', 'adr-clase-3')).toBe(false)
    })

    it('frigorifico debería ser compatible con atp-congelados', () => {
      expect(isVehicleTypeCompatible('frigorifico', 'atp-congelados')).toBe(true)
    })

    it('lona NO debería ser compatible con atp-congelados', () => {
      expect(isVehicleTypeCompatible('lona', 'atp-congelados')).toBe(false)
    })

    it('ganadero debería ser compatible con ani-ganado-mayor', () => {
      expect(isVehicleTypeCompatible('ganadero', 'ani-ganado-mayor')).toBe(true)
    })

    it('caja_cerrada NO debería ser compatible con ani-ganado-mayor', () => {
      expect(isVehicleTypeCompatible('caja_cerrada', 'ani-ganado-mayor')).toBe(false)
    })

    it('lona debería ser compatible con gen-paletizada', () => {
      expect(isVehicleTypeCompatible('lona', 'gen-paletizada')).toBe(true)
    })

    it('basculante debería ser compatible con gen-granel-solido', () => {
      expect(isVehicleTypeCompatible('basculante', 'gen-granel-solido')).toBe(true)
    })

    it('subcategoría inexistente debería retornar true', () => {
      expect(isVehicleTypeCompatible('lona', 'no-existe')).toBe(true)
    })
  })

  describe('getRecommendedVehicleTypes', () => {
    it('adr-clase-2 debería recomendar cisterna', () => {
      const types = getRecommendedVehicleTypes('adr-clase-2')
      expect(types).toContain('cisterna')
    })

    it('gen-granel-solido debería recomendar basculante', () => {
      const types = getRecommendedVehicleTypes('gen-granel-solido')
      expect(types).toContain('basculante')
    })

    it('subcategoría inexistente debería retornar array vacío', () => {
      expect(getRecommendedVehicleTypes('no-existe')).toEqual([])
    })
  })

  describe('checkVehicleCompliance', () => {
    it('vehículo compatible debería ser compliant', () => {
      const vehicle = { tipo_carroceria: 'cisterna', status: 'activo' }
      const result = checkVehicleCompliance(vehicle, 'adr-clase-3')
      expect(result.isCompliant).toBe(true)
      expect(result.autoFailed).toHaveLength(0)
      expect(result.autoPassed.length).toBeGreaterThan(0)
    })

    it('vehículo incompatible debería fallar auto checks', () => {
      const vehicle = { tipo_carroceria: 'frigorifico', status: 'activo' }
      const result = checkVehicleCompliance(vehicle, 'adr-clase-3')
      expect(result.isCompliant).toBe(false)
      expect(result.autoFailed.length).toBeGreaterThan(0)
    })

    it('vehículo inactivo debería fallar', () => {
      const vehicle = { tipo_carroceria: 'cisterna', status: 'mantenimiento' }
      const result = checkVehicleCompliance(vehicle, 'adr-clase-3')
      expect(result.isCompliant).toBe(false)
      expect(result.autoFailed.some(f => f.includes('mantenimiento'))).toBe(true)
    })

    it('debería retornar equipamiento como manual checks', () => {
      const vehicle = { tipo_carroceria: 'cisterna', status: 'activo' }
      const result = checkVehicleCompliance(vehicle, 'adr-clase-3')
      expect(result.manualChecks.length).toBeGreaterThan(0)
      expect(result.manualChecks).toContain('calzo_proporcionado_al_peso')
    })

    it('debería retornar referencia normativa', () => {
      const vehicle = { tipo_carroceria: 'cisterna', status: 'activo' }
      const result = checkVehicleCompliance(vehicle, 'adr-clase-3')
      expect(result.normativeReference).toContain('ADR')
    })

    it('debería retornar nombre de subcategoría', () => {
      const vehicle = { tipo_carroceria: 'frigorifico', status: 'activo' }
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
      const vehicle = { tipo_carroceria: 'frigorifico', status: 'activo' }
      const result = checkVehicleCompliance(vehicle, 'atp-congelados')
      expect(result.equipmentChecklist.length).toBeGreaterThanOrEqual(1)
      expect(result.manualChecks).toContain('termografo_registrador_de_temperatura')
    })

    it('gen-paletizada debería tener equipamiento de estiba', () => {
      const vehicle = { tipo_carroceria: 'lona', status: 'activo' }
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
