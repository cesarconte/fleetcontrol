/**
 * FleetControl — Alert Validation Schema (Zod)
 *
 * Validations for alert dismissal and filtering per PRD §4.8.
 * Column names match Supabase DB schema (English).
 */

import { z } from 'zod'
import { ALERT_TYPE_VALUES, ALERT_SEVERITY_VALUES } from '@/constants/alert-types.js'

export const alertDismissSchema = z.object({
  justification: z
    .string({ required_error: 'La justificación es obligatoria' })
    .min(1, 'La justificación no puede estar vacía')
    .max(500, 'Máximo 500 caracteres'),
})

export const alertFilterSchema = z.object({
  alert_type: z.enum(ALERT_TYPE_VALUES).optional(),
  severity: z.enum(ALERT_SEVERITY_VALUES).optional(),
  is_read: z.boolean().optional(),
  is_dismissed: z.boolean().optional(),
  vehicle_id: z.string().uuid().optional(),
  driver_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
})
