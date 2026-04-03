/**
 * FleetControl — Legal Limits (Single Source of Truth)
 *
 * All regulatory numeric limits for Spain + EU transport regulations.
 * Import from this file whenever a legal constant is needed.
 * NEVER hardcode regulatory values in other files.
 *
 * @see AGENTS.md §1 for regulatory references
 */

/** @param {object} obj */
function deepFreeze(obj) {
  Object.keys(obj).forEach(key => {
    const val = obj[key]
    if (val && typeof val === 'object') deepFreeze(val)
  })
  return Object.freeze(obj)
}

export const LEGAL_LIMITS = deepFreeze({
  /** CE 561/2006 — Driving times */
  DRIVING: {
    MAX_DAILY_NORMAL_HOURS: 9,
    MAX_DAILY_EXTENDED_HOURS: 10,
    MAX_EXTENDED_DAYS_PER_WEEK: 2,
    MAX_WEEKLY_HOURS: 56,
    MAX_BIWEEKLY_HOURS: 90,
    MANDATORY_BREAK_AFTER_MINUTES: 270,
    MANDATORY_BREAK_MINUTES: 45,
    MANDATORY_BREAK_SPLIT_OPTIONS: [15, 30],
  },

  /** CE 561/2006 — Rest periods */
  REST: {
    DAILY_NORMAL_HOURS: 11,
    DAILY_REDUCED_HOURS: 9,
    MAX_REDUCED_DAILY_PER_BIWEEKLY: 3,
    WEEKLY_NORMAL_HOURS: 45,
    WEEKLY_REDUCED_HOURS: 24,
    WEEKLY_REDUCTION_COMPENSATION_REQUIRED: true,
    RETURN_TO_BASE_WEEKS: 4,
  },

  /** RD 1561/1995 — Working time */
  WORKING_TIME: {
    MAX_DAILY_HOURS: 9,
    MAX_DAILY_EXTENDED_HOURS: 10,
    MAX_EXTENDED_DAYS_PER_WEEK: 2,
    MAX_WEEKLY_HOURS: 48,
    AVG_WEEKLY_OVER_4_MONTHS_HOURS: 40,
    MIN_REST_BETWEEN_SHIFTS_HOURS: 12,
    MIN_REST_BETWEEN_SHIFTS_BUNK_HOURS: 10,
    MIN_WEEKLY_REST_HOURS: 36,
  },

  /** Vehicle dimensions & weights */
  VEHICLE: {
    MAX_WIDTH_M: 2.55,
    MAX_WIDTH_REFRIGERATED_M: 2.6,
    MAX_HEIGHT_M: 4.0,
    MAX_ARTICULATED_LENGTH_M: 16.5,
    MAX_GROSS_WEIGHT_STANDARD_KG: 40000,
    MAX_GROSS_WEIGHT_ECO_KG: 44000,
  },

  /** Speed limits km/h (TRLGSV — Ley 18/2021) */
  SPEED: {
    MOTORWAY_RIGID: 90,
    MOTORWAY_ARTICULATED: 80,
    CONVENTIONAL_RIGID: 80,
    CONVENTIONAL_ARTICULATED: 70,
    URBAN: 50,
    ZONE_30: 30,
  },

  /** ITV periodicity */
  ITV: {
    HEAVY_VEHICLE_MONTHS: 12,
    HEAVY_TRAILER_MONTHS: 12,
    PASSENGER_OVER_9_MONTHS: 6,
  },

  /** CAP — Professional aptitude */
  CAP: {
    CONTINUOUS_TRAINING_HOURS: 36,
    VALIDITY_YEARS: 5,
    MIN_AGE_NATIONAL: 18,
    MIN_AGE_INTERNATIONAL: 21,
  },

  /** ADR — Dangerous goods */
  ADR: {
    DRIVER_CERT_VALIDITY_YEARS: 5,
    VEHICLE_CERT_VALIDITY_MONTHS: 12,
  },

  /** Insurance (Ley 5/2025) */
  INSURANCE: {
    MIN_PROPERTY_DAMAGE_PER_EVENT_EUR: 1200000,
    MAX_INSURED_LIABILITY_EUR: 70000000,
    CARGO_LIABILITY_PER_KG_EUR: 5.34,
  },

  /** Tacógrafo */
  TACHOGRAPH: {
    CARD_VALIDITY_YEARS: 5,
    CALIBRATION_MONTHS: 24,
  },

  /** Document alert thresholds (default, configurable) */
  ALERT_THRESHOLDS: {
    DOCUMENT_EXPIRY_WARNING_DAYS: 30,
    DOCUMENT_EXPIRY_CRITICAL_DAYS: 7,
    DRIVER_DOC_EXPIRY_WARNING_DAYS: 30,
    MAINTENANCE_KM_WARNING: 5000,
    MAINTENANCE_DAYS_WARNING: 30,
    FUEL_ANOMALY_PERCENT: 20,
    DRIVING_HOURS: 9,
    TACHOGRAPH_DOWNLOAD_DAYS: 28,
    SPEED_LIMIT_KMH: 90,
  },

  /** Document management */
  DOCUMENT_MANAGEMENT: {
    DOCUMENT_EXPIRY_WARNING_DAYS: 30,
    DOCUMENT_EXPIRY_CRITICAL_DAYS: 7,
    DOCUMENT_MAX_FILE_SIZE_MB: 10,
    DOCUMENT_ALLOWED_FILE_TYPES: ['pdf', 'jpeg', 'jpg', 'png'],
    DOCUMENT_RETENTION_YEARS: 5,
    DOCUMENT_PAGE_SIZE_DEFAULT: 25,
  },
})
