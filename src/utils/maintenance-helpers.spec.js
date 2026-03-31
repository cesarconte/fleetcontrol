import { describe, it, expect } from 'vitest'
import {
  getTipoColor,
  getTipoLabel,
  getMantenimientoStatusColor,
  getMantenimientoStatusLabel,
} from '@/utils/maintenance-helpers'

describe('getTipoColor', () => {
  it('"preventive" → "info"', () => {
    expect(getTipoColor('preventive')).toBe('info')
  })

  it('"corrective" → "warning"', () => {
    expect(getTipoColor('corrective')).toBe('warning')
  })

  it('valor desconocido → "grey"', () => {
    expect(getTipoColor('unknown')).toBe('grey')
  })
})

describe('getTipoLabel', () => {
  it('"preventive" → "Preventivo"', () => {
    expect(getTipoLabel('preventive')).toBe('Preventivo')
  })

  it('"corrective" → "Correctivo"', () => {
    expect(getTipoLabel('corrective')).toBe('Correctivo')
  })

  it('valor desconocido devuelve el propio valor', () => {
    expect(getTipoLabel('unknown')).toBe('unknown')
  })
})

describe('getMantenimientoStatusColor', () => {
  it('"pending" → "info"', () => {
    expect(getMantenimientoStatusColor('pending')).toBe('info')
  })

  it('"in_progress" → "warning"', () => {
    expect(getMantenimientoStatusColor('in_progress')).toBe('warning')
  })

  it('"completed" → "success"', () => {
    expect(getMantenimientoStatusColor('completed')).toBe('success')
  })

  it('"cancelled" → "grey"', () => {
    expect(getMantenimientoStatusColor('cancelled')).toBe('grey')
  })

  it('valor desconocido → "grey"', () => {
    expect(getMantenimientoStatusColor('unknown')).toBe('grey')
  })
})

describe('getMantenimientoStatusLabel', () => {
  it('"pending" → "Pendiente"', () => {
    expect(getMantenimientoStatusLabel('pending')).toBe('Pendiente')
  })

  it('"in_progress" → "En curso"', () => {
    expect(getMantenimientoStatusLabel('in_progress')).toBe('En curso')
  })

  it('"completed" → "Completada"', () => {
    expect(getMantenimientoStatusLabel('completed')).toBe('Completada')
  })

  it('"cancelled" → "Cancelada"', () => {
    expect(getMantenimientoStatusLabel('cancelled')).toBe('Cancelada')
  })

  it('valor desconocido devuelve el propio valor', () => {
    expect(getMantenimientoStatusLabel('unknown')).toBe('unknown')
  })
})
