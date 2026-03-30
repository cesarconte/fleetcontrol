/**
 * FleetControl — Driver Hours Validator (CE 561/2006)
 *
 * Validates driver driving hours against EU Regulation 561/2006.
 * All limits from LEGAL_LIMITS.DRIVING and LEGAL_LIMITS.REST.
 */

import { LEGAL_LIMITS } from '@/constants/legal-limits.js'

const { DRIVING, REST } = LEGAL_LIMITS

/**
 * Validates if a driver can drive a given number of hours today.
 * @param {number} alreadyDrivenToday - Hours already driven today
 * @param {number} plannedHours - Planned additional driving hours
 * @param {number} extendedDaysThisWeek - Number of extended days (10h) used this week
 * @returns {{ valid: boolean, message: string, severity: 'ok'|'warning'|'critical' }}
 */
export function validateDailyDriving(alreadyDrivenToday, plannedHours, extendedDaysThisWeek = 0) {
  const totalHours = alreadyDrivenToday + plannedHours

  if (totalHours <= DRIVING.MAX_DAILY_NORMAL_HOURS) {
    return { valid: true, message: 'Dentro del límite diario', severity: 'ok' }
  }

  if (
    totalHours <= DRIVING.MAX_DAILY_EXTENDED_HOURS &&
    extendedDaysThisWeek < DRIVING.MAX_EXTENDED_DAYS_PER_WEEK
  ) {
    return {
      valid: true,
      message: `Dentro de ampliación a 10h (${extendedDaysThisWeek}/${DRIVING.MAX_EXTENDED_DAYS_PER_WEEK} días ampliados esta semana)`,
      severity: 'warning',
    }
  }

  return {
    valid: false,
    message: `Supera el límite de conducción diaria (${totalHours.toFixed(1)}h > ${DRIVING.MAX_DAILY_NORMAL_HOURS}h)`,
    severity: 'critical',
  }
}

/**
 * Validates weekly driving hours limit.
 * @param {number} alreadyDrivenThisWeek - Hours already driven this week
 * @param {number} plannedHours - Planned additional driving hours
 * @returns {{ valid: boolean, message: string, severity: 'ok'|'warning'|'critical' }}
 */
export function validateWeeklyDriving(alreadyDrivenThisWeek, plannedHours) {
  const totalHours = alreadyDrivenThisWeek + plannedHours
  const warningThreshold = DRIVING.MAX_WEEKLY_HOURS * 0.8

  if (totalHours <= warningThreshold) {
    return { valid: true, message: 'Dentro del límite semanal', severity: 'ok' }
  }

  if (totalHours <= DRIVING.MAX_WEEKLY_HOURS) {
    return {
      valid: true,
      message: `Próximo al límite semanal (${totalHours.toFixed(1)}h de ${DRIVING.MAX_WEEKLY_HOURS}h)`,
      severity: 'warning',
    }
  }

  return {
    valid: false,
    message: `Supera el límite de conducción semanal (${totalHours.toFixed(1)}h > ${DRIVING.MAX_WEEKLY_HOURS}h)`,
    severity: 'critical',
  }
}

/**
 * Validates biweekly driving hours limit.
 * @param {number} alreadyDrivenBiweekly - Hours already driven in last 2 weeks
 * @param {number} plannedHours - Planned additional driving hours
 * @returns {{ valid: boolean, message: string, severity: 'ok'|'warning'|'critical' }}
 */
export function validateBiweeklyDriving(alreadyDrivenBiweekly, plannedHours) {
  const totalHours = alreadyDrivenBiweekly + plannedHours
  const warningThreshold = DRIVING.MAX_BIWEEKLY_HOURS * 0.8

  if (totalHours <= warningThreshold) {
    return { valid: true, message: 'Dentro del límite bisemanal', severity: 'ok' }
  }

  if (totalHours <= DRIVING.MAX_BIWEEKLY_HOURS) {
    return {
      valid: true,
      message: `Próximo al límite bisemanal (${totalHours.toFixed(1)}h de ${DRIVING.MAX_BIWEEKLY_HOURS}h)`,
      severity: 'warning',
    }
  }

  return {
    valid: false,
    message: `Supera el límite de conducción bisemanal (${totalHours.toFixed(1)}h > ${DRIVING.MAX_BIWEEKLY_HOURS}h)`,
    severity: 'critical',
  }
}

/**
 * Validates if driver has enough rest before a planned route.
 * @param {number} hoursSinceLastRest - Hours since last daily rest
 * @param {number} plannedDrivingHours - Planned driving hours
 * @returns {{ valid: boolean, message: string, severity: 'ok'|'warning'|'critical' }}
 */
export function validateRestPeriod(hoursSinceLastRest, plannedDrivingHours) {
  const maxContinuousDriving = DRIVING.MANDATORY_BREAK_AFTER_MINUTES / 60
  const hoursAfterRoute = hoursSinceLastRest + plannedDrivingHours

  if (hoursAfterRoute <= REST.DAILY_NORMAL_HOURS) {
    return { valid: true, message: 'Descanso suficiente', severity: 'ok' }
  }

  if (plannedDrivingHours > maxContinuousDriving) {
    return {
      valid: true,
      message: `Requiere pausa de ${DRIVING.MANDATORY_BREAK_MINUTES} min tras ${maxContinuousDriving}h de conducción`,
      severity: 'warning',
    }
  }

  return {
    valid: false,
    message: `No hay descanso suficiente antes de la próxima jornada`,
    severity: 'critical',
  }
}

/**
 * Comprehensive validation for a planned route.
 * @param {object} params
 * @param {number} params.drivenToday - Hours driven today before this route
 * @param {number} params.drivenThisWeek - Hours driven this week before this route
 * @param {number} params.drivenBiweekly - Hours driven in last 2 weeks
 * @param {number} params.plannedHours - Planned driving hours for this route
 * @param {number} params.extendedDaysThisWeek - Extended days used this week
 * @returns {{ valid: boolean, checks: Array<{ name: string, result: object }> }}
 */
export function validateDriverHours({
  drivenToday = 0,
  drivenThisWeek = 0,
  drivenBiweekly = 0,
  plannedHours = 0,
  extendedDaysThisWeek = 0,
}) {
  const checks = [
    {
      name: 'Conducción diaria',
      result: validateDailyDriving(drivenToday, plannedHours, extendedDaysThisWeek),
    },
    { name: 'Conducción semanal', result: validateWeeklyDriving(drivenThisWeek, plannedHours) },
    { name: 'Conducción bisemanal', result: validateBiweeklyDriving(drivenBiweekly, plannedHours) },
  ]

  const valid = checks.every(c => c.result.valid)

  return { valid, checks }
}

/**
 * Validates cargo weight against vehicle MMA.
 * @param {number} cargoWeightKg - Cargo weight in kg
 * @param {number} vehicleMmaKg - Vehicle MMA in kg
 * @param {number} [vehicleTareKg] - Vehicle tare in kg (optional, for payload check)
 * @returns {{ valid: boolean, message: string, severity: 'ok'|'warning'|'critical' }}
 */
export function validateCargoWeight(cargoWeightKg, vehicleMmaKg, vehicleTareKg = 0) {
  if (!cargoWeightKg || !vehicleMmaKg) {
    return { valid: true, message: 'Sin datos de peso', severity: 'ok' }
  }

  if (vehicleTareKg > 0) {
    const maxPayload = vehicleMmaKg - vehicleTareKg
    if (cargoWeightKg > maxPayload) {
      return {
        valid: false,
        message: `Carga (${cargoWeightKg.toLocaleString('es-ES')} kg) excede la carga útil (${maxPayload.toLocaleString('es-ES')} kg)`,
        severity: 'critical',
      }
    }
  }

  if (cargoWeightKg > vehicleMmaKg) {
    return {
      valid: false,
      message: `Carga (${cargoWeightKg.toLocaleString('es-ES')} kg) excede la MMA (${vehicleMmaKg.toLocaleString('es-ES')} kg)`,
      severity: 'critical',
    }
  }

  const warningThreshold = vehicleMmaKg * 0.9
  if (cargoWeightKg > warningThreshold) {
    return {
      valid: true,
      message: `Carga próxima al límite MMA (${cargoWeightKg.toLocaleString('es-ES')} de ${vehicleMmaKg.toLocaleString('es-ES')} kg)`,
      severity: 'warning',
    }
  }

  return { valid: true, message: 'Peso dentro de límites', severity: 'ok' }
}
