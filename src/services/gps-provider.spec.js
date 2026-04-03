import { describe, it, expect } from 'vitest'
import { GpsProvider } from '@/services/gps-provider.js'

describe('gps-provider.js', () => {
  describe('GpsProvider (interfaz abstracta)', () => {
    it('debería lanzar Error en getPositions', async () => {
      const provider = new GpsProvider()
      await expect(provider.getPositions('vehicle-1', {})).rejects.toThrow('Not implemented')
    })

    it('debería lanzar Error en getLatestPosition', async () => {
      const provider = new GpsProvider()
      await expect(provider.getLatestPosition('vehicle-1')).rejects.toThrow('Not implemented')
    })

    it('debería lanzar Error en getFleetPositions', async () => {
      const provider = new GpsProvider()
      await expect(provider.getFleetPositions()).rejects.toThrow('Not implemented')
    })

    it('debería lanzar Error en ingestPosition', async () => {
      const provider = new GpsProvider()
      await expect(provider.ingestPosition({})).rejects.toThrow('Not implemented')
    })

    it('debería lanzar Error en ingestBatch', async () => {
      const provider = new GpsProvider()
      await expect(provider.ingestBatch([])).rejects.toThrow('Not implemented')
    })
  })
})
