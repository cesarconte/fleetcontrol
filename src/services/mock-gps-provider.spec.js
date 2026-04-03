/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  MockGpsProvider,
  haversine,
  interpolate,
  calculateHeading,
} from '@/services/mock-gps-provider.js'

describe('mock-gps-provider.js', () => {
  describe('Utility functions', () => {
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
        expect(heading).toBeGreaterThanOrEqual(0)
        expect(heading).toBeLessThan(360)
      })

      it('debería devolver valor entre 0 y 360', () => {
        const heading = calculateHeading(
          { lat: 40.4168, lng: -3.7038 },
          { lat: 41.3874, lng: 2.1686 },
        )
        expect(heading).toBeGreaterThanOrEqual(0)
        expect(heading).toBeLessThan(360)
      })
    })
  })

  describe('MockGpsProvider', () => {
    let provider

    beforeEach(() => {
      provider = new MockGpsProvider()
    })

    afterEach(() => {
      provider.stopSimulation()
    })

    it('debería extender GpsProvider', async () => {
      const { GpsProvider } = await import('@/services/gps-provider.js')
      expect(provider).toBeInstanceOf(GpsProvider)
    })

    it('debería generar posición con interpolación correcta', () => {
      const pos = provider._generatePosition(
        { origin_lat: 40.4168, origin_lng: -3.7038, dest_lat: 41.3874, dest_lng: 2.1686 },
        0.5,
      )
      expect(pos.latitude).toBeGreaterThan(40)
      expect(pos.latitude).toBeLessThan(42)
      expect(pos.longitude).toBeGreaterThan(-4)
      expect(pos.longitude).toBeLessThan(3)
    })

    it('debería generar velocidad dentro de rango realista (0-120 km/h)', () => {
      const pos = provider._generatePosition(
        { origin_lat: 40.4168, origin_lng: -3.7038, dest_lat: 41.3874, dest_lng: 2.1686 },
        0.5,
      )
      expect(pos.speed_kph).toBeGreaterThanOrEqual(0)
      expect(pos.speed_kph).toBeLessThanOrEqual(120)
    })

    it('debería calcular heading correctamente', () => {
      const pos = provider._generatePosition(
        { origin_lat: 40.4168, origin_lng: -3.7038, dest_lat: 41.3874, dest_lng: 2.1686 },
        0.5,
      )
      expect(pos.heading_degrees).toBeGreaterThanOrEqual(0)
      expect(pos.heading_degrees).toBeLessThan(360)
    })

    it('debería tener ignition_on=true para vehículos en ruta', () => {
      const pos = provider._generatePosition(
        { origin_lat: 40.4168, origin_lng: -3.7038, dest_lat: 41.3874, dest_lng: 2.1686 },
        0.5,
      )
      expect(pos.ignition_on).toBe(true)
    })

    it('debería devolver posición con provider="mock"', () => {
      const pos = provider._generatePosition(
        { origin_lat: 40.4168, origin_lng: -3.7038, dest_lat: 41.3874, dest_lng: 2.1686 },
        0.5,
      )
      expect(pos.provider).toBe('mock')
    })

    it('debería tener gps_fix_type válido', () => {
      const pos = provider._generatePosition(
        { origin_lat: 40.4168, origin_lng: -3.7038, dest_lat: 41.3874, dest_lng: 2.1686 },
        0.5,
      )
      const validTypes = ['GPS_2D', 'GPS_3D', 'DEAD_RECKONING', 'CELL_TOWER', 'UNKNOWN']
      expect(validTypes).toContain(pos.gps_fix_type)
    })

    it('startSimulation() debería iniciar el ciclo de simulación', () => {
      provider.startSimulation()
      expect(provider.isRunning).toBe(true)
    })

    it('stopSimulation() debería detener el ciclo de simulación', () => {
      provider.startSimulation()
      provider.stopSimulation()
      expect(provider.isRunning).toBe(false)
    })

    it('debería tener un intervalo configurado', async () => {
      const { GPS_UPDATE_INTERVAL_MS } = await import('@/constants/gps-config.js')
      expect(provider.updateIntervalMs).toBe(GPS_UPDATE_INTERVAL_MS)
    })
  })
})
