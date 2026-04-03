/**
 * FleetControl — GPS Math Utilities Tests
 */

import { describe, it, expect } from 'vitest'
import { haversine, interpolate, calculateHeading, gaussianRandom } from './gps-math.js'

describe('gps-math.js', () => {
  describe('haversine', () => {
    it('debería calcular distancia correcta entre Madrid y Barcelona (~505km)', () => {
      const dist = haversine({ lat: 40.4168, lng: -3.7038 }, { lat: 41.3874, lng: 2.1686 })
      expect(dist).toBeGreaterThan(500)
      expect(dist).toBeLessThan(520)
    })

    it('debería devolver 0 para el mismo punto', () => {
      const dist = haversine({ lat: 40.4168, lng: -3.7038 }, { lat: 40.4168, lng: -3.7038 })
      expect(dist).toBe(0)
    })
  })

  describe('interpolate', () => {
    it('debería interpolar correctamente al 50%', () => {
      const result = interpolate({ lat: 0, lng: 0 }, { lat: 10, lng: 10 }, 0.5)
      expect(result.lat).toBeCloseTo(5, 5)
      expect(result.lng).toBeCloseTo(5, 5)
    })

    it('debería devolver origen en progress=0', () => {
      const result = interpolate({ lat: 1, lng: 2 }, { lat: 10, lng: 20 }, 0)
      expect(result.lat).toBe(1)
      expect(result.lng).toBe(2)
    })

    it('debería devolver destino en progress=1', () => {
      const result = interpolate({ lat: 1, lng: 2 }, { lat: 10, lng: 20 }, 1)
      expect(result.lat).toBe(10)
      expect(result.lng).toBe(20)
    })
  })

  describe('calculateHeading', () => {
    it('debería calcular heading hacia el norte (~0°)', () => {
      const heading = calculateHeading({ lat: 40, lng: -3 }, { lat: 41, lng: -3 })
      expect(heading).toBeCloseTo(0, 1)
    })

    it('debería calcular heading hacia el este (~90°)', () => {
      const heading = calculateHeading({ lat: 40, lng: -3 }, { lat: 40, lng: -2 })
      expect(heading).toBeCloseTo(90, 0)
    })

    it('debería calcular heading hacia el sur (~180°)', () => {
      const heading = calculateHeading({ lat: 41, lng: -3 }, { lat: 40, lng: -3 })
      expect(heading).toBeCloseTo(180, 1)
    })

    it('debería calcular heading hacia el oeste (~270°)', () => {
      const heading = calculateHeading({ lat: 40, lng: -2 }, { lat: 40, lng: -3 })
      expect(heading).toBeCloseTo(270, 0)
    })

    it('debería devolver valor entre 0 y 360 para ruta diagonal', () => {
      const heading = calculateHeading(
        { lat: 40.4168, lng: -3.7038 },
        { lat: 41.3874, lng: 2.1686 },
      )
      expect(heading).toBeGreaterThanOrEqual(0)
      expect(heading).toBeLessThan(360)
    })
  })

  describe('gaussianRandom', () => {
    it('debería devolver un número', () => {
      const result = gaussianRandom()
      expect(typeof result).toBe('number')
    })

    it('debería tener media cercana a 0 en muchas iteraciones', () => {
      const samples = Array.from({ length: 10000 }, () => gaussianRandom())
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length
      expect(mean).toBeGreaterThan(-0.1)
      expect(mean).toBeLessThan(0.1)
    })
  })
})
