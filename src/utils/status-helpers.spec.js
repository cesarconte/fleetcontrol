import { describe, it, expect } from 'vitest'
import { getStatusColor, getStatusLabel, getDgtColor, getDgtLabel } from '@/utils/status-helpers'

describe('getStatusColor', () => {
  it('vehiculo/active → "success"', () => {
    expect(getStatusColor('active', 'vehiculo')).toBe('success')
  })

  it('ruta/in_progress → "success"', () => {
    expect(getStatusColor('in_progress', 'ruta')).toBe('success')
  })

  it('documento/expired → "grey-darken-2"', () => {
    expect(getStatusColor('expired', 'documento')).toBe('grey-darken-2')
  })

  it('dominio desconocido → "grey"', () => {
    expect(getStatusColor('active', 'unknown')).toBe('grey')
  })

  it('estado desconocido → "grey"', () => {
    expect(getStatusColor('unknown', 'vehiculo')).toBe('grey')
  })
})

describe('getStatusLabel', () => {
  it('vehiculo/active → "Activo"', () => {
    expect(getStatusLabel('active', 'vehiculo')).toBe('Activo')
  })

  it('conductor/temporary_leave → "Baja temporal"', () => {
    expect(getStatusLabel('temporary_leave', 'conductor')).toBe('Baja temporal')
  })

  it('ruta/completed → "Completada"', () => {
    expect(getStatusLabel('completed', 'ruta')).toBe('Completada')
  })

  it('documento/critical → "Crítico"', () => {
    expect(getStatusLabel('critical', 'documento')).toBe('Crítico')
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
