import { describe, it, expect } from 'vitest'
import { formatDate, formatKm, formatPrice, formatKg } from '@/utils/format-helpers'

describe('formatDate', () => {
  it('devuelve "—" para null', () => {
    expect(formatDate(null)).toBe('—')
  })

  it('devuelve "—" para undefined', () => {
    expect(formatDate(undefined)).toBe('—')
  })

  it('devuelve "—" para cadena vacía', () => {
    expect(formatDate('')).toBe('—')
  })

  it('formatea fecha ISO a locale español', () => {
    expect(formatDate('2026-03-15')).toBe('15/3/2026')
  })
})

describe('formatKm', () => {
  it('devuelve "—" para null', () => {
    expect(formatKm(null)).toBe('—')
  })

  it('devuelve "—" para undefined', () => {
    expect(formatKm(undefined)).toBe('—')
  })

  it('formatea 0 → "0 km"', () => {
    expect(formatKm(0)).toBe('0 km')
  })

  it('formatea 12345 → "12.345 km"', () => {
    expect(formatKm(12345)).toBe('12.345 km')
  })

  it('formatea 500.5 → "500,5 km"', () => {
    expect(formatKm(500.5)).toBe('500,5 km')
  })
})

describe('formatPrice', () => {
  it('devuelve "—" para null', () => {
    expect(formatPrice(null)).toBe('—')
  })

  it('devuelve "—" para undefined', () => {
    expect(formatPrice(undefined)).toBe('—')
  })

  it('formatea 0 → "0,00 €"', () => {
    expect(formatPrice(0)).toBe('0,00 €')
  })

  it('formatea 1234.5 → "1234,50 €"', () => {
    expect(formatPrice(1234.5)).toBe('1234,50 €')
  })

  it('formatea 99.9 → "99,90 €"', () => {
    expect(formatPrice(99.9)).toBe('99,90 €')
  })
})

describe('formatKg', () => {
  it('devuelve "—" para null', () => {
    expect(formatKg(null)).toBe('—')
  })

  it('devuelve "—" para undefined', () => {
    expect(formatKg(undefined)).toBe('—')
  })

  it('formatea 0 → "0 kg"', () => {
    expect(formatKg(0)).toBe('0 kg')
  })

  it('formatea 25000 → "25.000 kg"', () => {
    expect(formatKg(25000)).toBe('25.000 kg')
  })
})
