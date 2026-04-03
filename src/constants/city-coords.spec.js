/**
 * FleetControl — City Coordinates Tests
 */

import { describe, it, expect } from 'vitest'
import { getCityCoords, CITY_COORDS } from './city-coords.js'

describe('city-coords.js', () => {
  describe('CITY_COORDS', () => {
    it('debería tener coordenadas para ciudades principales', () => {
      expect(CITY_COORDS.madrid.lat).toBe(40.4168)
      expect(CITY_COORDS.barcelona.lat).toBe(41.3874)
      expect(CITY_COORDS.valencia.lng).toBe(-0.3763)
      expect(CITY_COORDS.sevilla.lat).toBe(37.3891)
    })

    it('debería estar congelado', () => {
      expect(Object.isFrozen(CITY_COORDS)).toBe(true)
    })
  })

  describe('getCityCoords', () => {
    it('debería encontrar Madrid por nombre exacto', () => {
      const coords = getCityCoords('Madrid')
      expect(coords).toEqual({ lat: 40.4168, lng: -3.7038 })
    })

    it('debería encontrar Barcelona con mayúsculas', () => {
      const coords = getCityCoords('BARCELONA')
      expect(coords.lat).toBe(41.3874)
    })

    it('debería encontrar por coincidencia parcial', () => {
      const coords = getCityCoords('San Sebastian')
      expect(coords.lat).toBe(43.3183)
    })

    it('debería encontrar "Hospitalet de Llobregat" por subcadena', () => {
      const coords = getCityCoords('Hospitalet')
      expect(coords.lat).toBe(41.3598)
    })

    it('debería retornar null para ciudad desconocida', () => {
      const coords = getCityCoords('CiudadInventada123')
      expect(coords).toBeNull()
    })

    it('debería retornar null para input vacío', () => {
      expect(getCityCoords('')).toBeNull()
      expect(getCityCoords(null)).toBeNull()
      expect(getCityCoords(undefined)).toBeNull()
    })

    it('debería encontrar con espacios extra', () => {
      const coords = getCityCoords('  Valencia  ')
      expect(coords.lat).toBe(39.4699)
    })
  })
})
