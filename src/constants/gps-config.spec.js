/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import {
  GPS_PROVIDERS,
  GPS_FIX_TYPES,
  GPS_UPDATE_INTERVAL_MS,
  GPS_OFFLINE_THRESHOLD_MS,
} from '@/constants/gps-config.js'

describe('gps-config.js', () => {
  describe('GPS_PROVIDERS', () => {
    it('debería ser un array congelado con 4 proveedores', () => {
      expect(GPS_PROVIDERS).toEqual(['webfleet', 'frotcom', 'geotab', 'mock'])
      expect(Object.isFrozen(GPS_PROVIDERS)).toBe(true)
    })

    it('debería incluir "mock" como proveedor de desarrollo', () => {
      expect(GPS_PROVIDERS).toContain('mock')
    })
  })

  describe('GPS_FIX_TYPES', () => {
    it('debería ser un array congelado con 5 tipos de fix', () => {
      expect(GPS_FIX_TYPES).toEqual(['GPS_2D', 'GPS_3D', 'DEAD_RECKONING', 'CELL_TOWER', 'UNKNOWN'])
      expect(Object.isFrozen(GPS_FIX_TYPES)).toBe(true)
    })
  })

  describe('GPS_UPDATE_INTERVAL_MS', () => {
    it('debería ser 30000ms (30 segundos)', () => {
      expect(GPS_UPDATE_INTERVAL_MS).toBe(30000)
    })
  })

  describe('GPS_OFFLINE_THRESHOLD_MS', () => {
    it('debería ser 900000ms (15 minutos)', () => {
      expect(GPS_OFFLINE_THRESHOLD_MS).toBe(900000)
    })
  })
})
