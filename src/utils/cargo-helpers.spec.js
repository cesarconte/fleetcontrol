import { describe, it, expect } from 'vitest'
import {
  getCargoTypeColor,
  getCargoTypeLabel,
  formatKg,
  CARGO_TYPE_OPTIONS,
} from './cargo-helpers.js'

describe('cargo-helpers', () => {
  describe('getCargoTypeColor', () => {
    it('debería retornar info para general', () => {
      expect(getCargoTypeColor('general')).toBe('info')
    })
    it('debería retornar teal para refrigerated', () => {
      expect(getCargoTypeColor('refrigerated')).toBe('teal')
    })
    it('debería retornar error para dangerous', () => {
      expect(getCargoTypeColor('dangerous')).toBe('error')
    })
    it('debería retornar grey para desconocido', () => {
      expect(getCargoTypeColor('unknown')).toBe('grey')
    })
  })

  describe('getCargoTypeLabel', () => {
    it('debería retornar etiqueta en español', () => {
      expect(getCargoTypeLabel('dangerous')).toBe('Peligrosa')
    })
    it('debería retornar el valor para desconocido', () => {
      expect(getCargoTypeLabel('xyz')).toBe('xyz')
    })
  })

  describe('formatKg', () => {
    it('debería formatear kg con separador', () => {
      expect(formatKg(15000)).toBe('15.000 kg')
    })
    it('debería retornar guión para null', () => {
      expect(formatKg(null)).toBe('—')
    })
    it('debería retornar guión para undefined', () => {
      expect(formatKg(undefined)).toBe('—')
    })
    it('debería formatear 0 kg', () => {
      expect(formatKg(0)).toBe('0 kg')
    })
  })

  describe('CARGO_TYPE_OPTIONS', () => {
    it('debería tener 4 opciones', () => {
      expect(CARGO_TYPE_OPTIONS).toHaveLength(4)
    })
    it('debería tener value y title', () => {
      CARGO_TYPE_OPTIONS.forEach(opt => {
        expect(opt).toHaveProperty('value')
        expect(opt).toHaveProperty('title')
      })
    })
  })
})
