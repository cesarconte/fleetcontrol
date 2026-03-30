import { describe, it, expect } from 'vitest'
import {
  validateDailyDriving,
  validateWeeklyDriving,
  validateBiweeklyDriving,
  validateCargoWeight,
  validateDriverHours,
} from './validate-driver-hours.js'

describe('validateDailyDriving', () => {
  it('debería aceptar conducción por debajo de 9h', () => {
    const result = validateDailyDriving(2, 4)
    expect(result.valid).toBe(true)
    expect(result.severity).toBe('ok')
  })

  it('debería aceptar exactamente 9h', () => {
    const result = validateDailyDriving(5, 4)
    expect(result.valid).toBe(true)
  })

  it('debería aceptar 10h si hay días de ampliación disponibles', () => {
    const result = validateDailyDriving(5, 5, 0)
    expect(result.valid).toBe(true)
    expect(result.severity).toBe('warning')
  })

  it('debería rechazar 10h si ya se usaron 2 ampliaciones', () => {
    const result = validateDailyDriving(5, 5, 2)
    expect(result.valid).toBe(false)
    expect(result.severity).toBe('critical')
  })

  it('debería rechazar más de 10h', () => {
    const result = validateDailyDriving(6, 5, 0)
    expect(result.valid).toBe(false)
  })
})

describe('validateWeeklyDriving', () => {
  it('debería aceptar por debajo del 80% del límite', () => {
    const result = validateWeeklyDriving(20, 20)
    expect(result.valid).toBe(true)
    expect(result.severity).toBe('ok')
  })

  it('debería advertir entre 80% y 100%', () => {
    const result = validateWeeklyDriving(40, 6)
    expect(result.valid).toBe(true)
    expect(result.severity).toBe('warning')
  })

  it('debería rechazar más de 56h', () => {
    const result = validateWeeklyDriving(50, 10)
    expect(result.valid).toBe(false)
    expect(result.severity).toBe('critical')
  })
})

describe('validateBiweeklyDriving', () => {
  it('debería aceptar por debajo del límite', () => {
    const result = validateBiweeklyDriving(40, 20)
    expect(result.valid).toBe(true)
  })

  it('debería rechazar más de 90h', () => {
    const result = validateBiweeklyDriving(85, 10)
    expect(result.valid).toBe(false)
  })
})

describe('validateCargoWeight', () => {
  it('debería aceptar peso dentro de MMA', () => {
    const result = validateCargoWeight(15000, 40000)
    expect(result.valid).toBe(true)
    expect(result.severity).toBe('ok')
  })

  it('debería advertir si supera 90% de MMA', () => {
    const result = validateCargoWeight(38000, 40000)
    expect(result.valid).toBe(true)
    expect(result.severity).toBe('warning')
  })

  it('debería rechazar si supera MMA', () => {
    const result = validateCargoWeight(45000, 40000)
    expect(result.valid).toBe(false)
    expect(result.severity).toBe('critical')
  })

  it('debería rechazar si supera carga útil', () => {
    const result = validateCargoWeight(25000, 40000, 18000)
    expect(result.valid).toBe(false)
  })

  it('debería aceptar si no hay datos', () => {
    const result = validateCargoWeight(null, null)
    expect(result.valid).toBe(true)
  })
})

describe('validateDriverHours', () => {
  it('debería retornar válido si todos los checks pasan', () => {
    const result = validateDriverHours({
      drivenToday: 2,
      drivenThisWeek: 20,
      drivenBiweekly: 40,
      plannedHours: 4,
    })
    expect(result.valid).toBe(true)
    expect(result.checks).toHaveLength(3)
  })

  it('debería retornar inválido si algún check falla', () => {
    const result = validateDriverHours({
      drivenToday: 7,
      drivenThisWeek: 50,
      drivenBiweekly: 85,
      plannedHours: 5,
    })
    expect(result.valid).toBe(false)
  })
})
