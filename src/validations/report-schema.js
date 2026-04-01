/**
 * FleetControl — Informe Validation Schema (Zod)
 *
 * Validations for informe filters per PRD §4.9.
 */

import { z } from 'zod'
import { REPORT_TYPE_VALUES } from '@/constants/report-types.js'

export const reportFilterSchema = z.object({
  report_type: z.enum(REPORT_TYPE_VALUES).optional(),
  period: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  vehicle_id: z.string().uuid().optional(),
  driver_id: z.string().uuid().optional(),
})
