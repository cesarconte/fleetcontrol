/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import { MAP_CONFIG } from '@/constants/map-config.js'

describe('map-config.js', () => {
  describe('MAP_CONFIG', () => {
    it('debería tener DEFAULT_CENTER en Madrid', () => {
      expect(MAP_CONFIG.DEFAULT_CENTER).toEqual({ lat: 40.4168, lng: -3.7038 })
    })

    it('debería tener DEFAULT_ZOOM en 6', () => {
      expect(MAP_CONFIG.DEFAULT_ZOOM).toBe(6)
    })

    it('debería tener ZOOM_MOBILE en 5', () => {
      expect(MAP_CONFIG.ZOOM_MOBILE).toBe(5)
    })

    it('debería tener ZOOM_DETAIL en 12', () => {
      expect(MAP_CONFIG.ZOOM_DETAIL).toBe(12)
    })

    it('debería tener MARKER_COLORS congelado con 5 estados', () => {
      expect(Object.isFrozen(MAP_CONFIG.MARKER_COLORS)).toBe(true)
      expect(MAP_CONFIG.MARKER_COLORS.on_route).toBe('#4CAF50')
      expect(MAP_CONFIG.MARKER_COLORS.in_maintenance).toBe('#FFC107')
      expect(MAP_CONFIG.MARKER_COLORS.active).toBe('#2196F3')
      expect(MAP_CONFIG.MARKER_COLORS.inactive).toBe('#9E9E9E')
      expect(MAP_CONFIG.MARKER_COLORS.decommissioned).toBe('#616161')
    })

    it('debería tener FILTERS congelado con 4 filtros', () => {
      expect(Object.isFrozen(MAP_CONFIG.FILTERS)).toBe(true)
      expect(MAP_CONFIG.FILTERS).toHaveLength(4)
      expect(MAP_CONFIG.FILTERS[0].key).toBe('all')
      expect(MAP_CONFIG.FILTERS[1].key).toBe('on_route')
      expect(MAP_CONFIG.FILTERS[2].key).toBe('in_maintenance')
      expect(MAP_CONFIG.FILTERS[3].key).toBe('has_alerts')
    })

    it('debería ser un objeto congelado', () => {
      expect(Object.isFrozen(MAP_CONFIG)).toBe(true)
    })
  })
})
