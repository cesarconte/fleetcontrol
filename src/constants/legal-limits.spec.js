import { describe, it, expect } from 'vitest'
import { LEGAL_LIMITS } from './legal-limits.js'

describe('LEGAL_LIMITS', () => {
  it('debería ser un objeto congelado (inmutable)', () => {
    expect(Object.isFrozen(LEGAL_LIMITS)).toBe(true)
  })

  it('no debería permitir mutaciones', () => {
    expect(() => {
      LEGAL_LIMITS.DRIVING.MAX_DAILY_NORMAL_HOURS = 99
    }).toThrow()
  })

  describe('DRIVING — CE 561/2006', () => {
    it('conducción diaria normal: 9h', () => {
      expect(LEGAL_LIMITS.DRIVING.MAX_DAILY_NORMAL_HOURS).toBe(9)
    })

    it('conducción diaria extendida: 10h', () => {
      expect(LEGAL_LIMITS.DRIVING.MAX_DAILY_EXTENDED_HOURS).toBe(10)
    })

    it('conducción semanal: 56h', () => {
      expect(LEGAL_LIMITS.DRIVING.MAX_WEEKLY_HOURS).toBe(56)
    })

    it('conducción bisemanal: 90h', () => {
      expect(LEGAL_LIMITS.DRIVING.MAX_BIWEEKLY_HOURS).toBe(90)
    })

    it('pausa obligatoria tras 4h30min (270 min)', () => {
      expect(LEGAL_LIMITS.DRIVING.MANDATORY_BREAK_AFTER_MINUTES).toBe(270)
    })

    it('pausa mínima: 45 min', () => {
      expect(LEGAL_LIMITS.DRIVING.MANDATORY_BREAK_MINUTES).toBe(45)
    })
  })

  describe('REST — CE 561/2006', () => {
    it('descanso diario normal: 11h', () => {
      expect(LEGAL_LIMITS.REST.DAILY_NORMAL_HOURS).toBe(11)
    })

    it('descanso diario reducido: 9h', () => {
      expect(LEGAL_LIMITS.REST.DAILY_REDUCED_HOURS).toBe(9)
    })

    it('descanso semanal normal: 45h', () => {
      expect(LEGAL_LIMITS.REST.WEEKLY_NORMAL_HOURS).toBe(45)
    })

    it('descanso semanal reducido: 24h', () => {
      expect(LEGAL_LIMITS.REST.WEEKLY_REDUCED_HOURS).toBe(24)
    })
  })

  describe('WORKING_TIME — RD 1561/1995', () => {
    it('jornada semanal máxima: 48h', () => {
      expect(LEGAL_LIMITS.WORKING_TIME.MAX_WEEKLY_HOURS).toBe(48)
    })

    it('media semanal 4 meses: 40h', () => {
      expect(LEGAL_LIMITS.WORKING_TIME.AVG_WEEKLY_OVER_4_MONTHS_HOURS).toBe(40)
    })
  })

  describe('VEHICLE', () => {
    it('ancho máximo: 2.55m', () => {
      expect(LEGAL_LIMITS.VEHICLE.MAX_WIDTH_M).toBe(2.55)
    })

    it('altura máxima: 4.0m', () => {
      expect(LEGAL_LIMITS.VEHICLE.MAX_HEIGHT_M).toBe(4.0)
    })

    it('MMA estándar: 40000 kg', () => {
      expect(LEGAL_LIMITS.VEHICLE.MAX_GROSS_WEIGHT_STANDARD_KG).toBe(40000)
    })

    it('MMA eco: 44000 kg', () => {
      expect(LEGAL_LIMITS.VEHICLE.MAX_GROSS_WEIGHT_ECO_KG).toBe(44000)
    })
  })

  describe('SPEED', () => {
    it('autopista rígido: 90 km/h', () => {
      expect(LEGAL_LIMITS.SPEED.MOTORWAY_RIGID).toBe(90)
    })

    it('autopista conjunto: 80 km/h', () => {
      expect(LEGAL_LIMITS.SPEED.MOTORWAY_ARTICULATED).toBe(80)
    })
  })

  describe('ALERT_THRESHOLDS', () => {
    it('aviso vencimiento documento: 30 días', () => {
      expect(LEGAL_LIMITS.ALERT_THRESHOLDS.DOCUMENT_EXPIRY_WARNING_DAYS).toBe(30)
    })

    it('alerta crítica vencimiento: 7 días', () => {
      expect(LEGAL_LIMITS.ALERT_THRESHOLDS.DOCUMENT_EXPIRY_CRITICAL_DAYS).toBe(7)
    })

    it('aviso vencimiento doc. conductor: 30 días', () => {
      expect(LEGAL_LIMITS.ALERT_THRESHOLDS.DRIVER_DOC_EXPIRY_WARNING_DAYS).toBe(30)
    })

    it('umbral conducción: 9 horas', () => {
      expect(LEGAL_LIMITS.ALERT_THRESHOLDS.DRIVING_HOURS).toBe(9)
    })

    it('umbral descarga tacógrafo: 28 días', () => {
      expect(LEGAL_LIMITS.ALERT_THRESHOLDS.TACHOGRAPH_DOWNLOAD_DAYS).toBe(28)
    })

    it('umbral velocidad: 90 km/h', () => {
      expect(LEGAL_LIMITS.ALERT_THRESHOLDS.SPEED_LIMIT_KMH).toBe(90)
    })
  })
})
