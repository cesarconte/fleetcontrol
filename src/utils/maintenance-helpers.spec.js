import { describe, it, expect } from 'vitest'
import {
  getTipoColor,
  getTipoLabel,
  getMantenimientoStatusColor,
  getMantenimientoStatusLabel,
} from '@/utils/maintenance-helpers'

describe('getTipoColor', () => {
  it('"preventivo" → "info"', () => {
    expect(getTipoColor('preventivo')).toBe('info')
  })

  it('"correctivo" → "warning"', () => {
    expect(getTipoColor('correctivo')).toBe('warning')
  })

  it('valor desconocido → "grey"', () => {
    expect(getTipoColor('unknown')).toBe('grey')
  })
})

describe('getTipoLabel', () => {
  it('"preventivo" → "Preventivo"', () => {
    expect(getTipoLabel('preventivo')).toBe('Preventivo')
  })

  it('"correctivo" → "Correctivo"', () => {
    expect(getTipoLabel('correctivo')).toBe('Correctivo')
  })

  it('valor desconocido devuelve el propio valor', () => {
    expect(getTipoLabel('unknown')).toBe('unknown')
  })
})

describe('getMantenimientoStatusColor', () => {
  it('"pendiente" → "info"', () => {
    expect(getMantenimientoStatusColor('pendiente')).toBe('info')
  })

  it('"en_curso" → "warning"', () => {
    expect(getMantenimientoStatusColor('en_curso')).toBe('warning')
  })

  it('"completada" → "success"', () => {
    expect(getMantenimientoStatusColor('completada')).toBe('success')
  })

  it('"cancelada" → "grey"', () => {
    expect(getMantenimientoStatusColor('cancelada')).toBe('grey')
  })

  it('valor desconocido → "grey"', () => {
    expect(getMantenimientoStatusColor('unknown')).toBe('grey')
  })
})

describe('getMantenimientoStatusLabel', () => {
  it('"pendiente" → "Pendiente"', () => {
    expect(getMantenimientoStatusLabel('pendiente')).toBe('Pendiente')
  })

  it('"en_curso" → "En curso"', () => {
    expect(getMantenimientoStatusLabel('en_curso')).toBe('En curso')
  })

  it('"completada" → "Completada"', () => {
    expect(getMantenimientoStatusLabel('completada')).toBe('Completada')
  })

  it('"cancelada" → "Cancelada"', () => {
    expect(getMantenimientoStatusLabel('cancelada')).toBe('Cancelada')
  })

  it('valor desconocido devuelve el propio valor', () => {
    expect(getMantenimientoStatusLabel('unknown')).toBe('unknown')
  })
})
