import { describe, it, expect } from 'vitest'
import { getStatusColor, getStatusLabel, getDgtColor, getDgtLabel } from '@/utils/status-helpers'

describe('getStatusColor', () => {
  it('vehiculo/activo → "success"', () => {
    expect(getStatusColor('activo', 'vehiculo')).toBe('success')
  })

  it('ruta/en_curso → "success"', () => {
    expect(getStatusColor('en_curso', 'ruta')).toBe('success')
  })

  it('documento/vencido → "grey-darken-2"', () => {
    expect(getStatusColor('vencido', 'documento')).toBe('grey-darken-2')
  })

  it('dominio desconocido → "grey"', () => {
    expect(getStatusColor('activo', 'unknown')).toBe('grey')
  })

  it('estado desconocido → "grey"', () => {
    expect(getStatusColor('unknown', 'vehiculo')).toBe('grey')
  })
})

describe('getStatusLabel', () => {
  it('vehiculo/activo → "Activo"', () => {
    expect(getStatusLabel('activo', 'vehiculo')).toBe('Activo')
  })

  it('conductor/baja_temporal → "Baja temporal"', () => {
    expect(getStatusLabel('baja_temporal', 'conductor')).toBe('Baja temporal')
  })

  it('ruta/completada → "Completada"', () => {
    expect(getStatusLabel('completada', 'ruta')).toBe('Completada')
  })

  it('documento/critico → "Crítico"', () => {
    expect(getStatusLabel('critico', 'documento')).toBe('Crítico')
  })

  it('estado desconocido devuelve el propio valor', () => {
    expect(getStatusLabel('unknown', 'vehiculo')).toBe('unknown')
  })
})

describe('getDgtColor', () => {
  it('"eco" → "green"', () => {
    expect(getDgtColor('eco')).toBe('green')
  })

  it('"c" → "orange"', () => {
    expect(getDgtColor('c')).toBe('orange')
  })

  it('"b" → "blue-grey"', () => {
    expect(getDgtColor('b')).toBe('blue-grey')
  })

  it('null → "grey"', () => {
    expect(getDgtColor(null)).toBe('grey')
  })
})

describe('getDgtLabel', () => {
  it('"eco" → "ECO"', () => {
    expect(getDgtLabel('eco')).toBe('ECO')
  })

  it('"c" → "C"', () => {
    expect(getDgtLabel('c')).toBe('C')
  })

  it('"b" → "B"', () => {
    expect(getDgtLabel('b')).toBe('B')
  })

  it('null → "—"', () => {
    expect(getDgtLabel(null)).toBe('—')
  })
})
