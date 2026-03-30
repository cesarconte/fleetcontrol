/**
 * FleetControl — Maintenance Validation Schema (Zod)
 *
 * All maintenance form validations per PRD §4.5.
 */

import { z } from 'zod'

export const maintenanceSchema = z.object({
  vehicle_id: z
    .string({ required_error: 'Debe seleccionar un vehículo' })
    .uuid('Vehículo inválido'),

  type: z
    .enum(['preventive', 'corrective'], {
      errorMap: () => ({ message: 'Tipo de mantenimiento inválido' }),
    })
    .default('preventive'),

  status: z
    .enum(['pending', 'in_progress', 'completed', 'cancelled'], {
      errorMap: () => ({ message: 'Estado inválido' }),
    })
    .default('pending'),

  scheduled_date: z.string().optional().or(z.literal('')),
  completed_date: z.string().optional().or(z.literal('')),

  mileage_km: z
    .number({ invalid_type_error: 'Kilometraje inválido' })
    .int()
    .positive('El kilometraje debe ser mayor que 0')
    .optional()
    .nullable(),

  description: z
    .string({ required_error: 'La descripción es obligatoria' })
    .min(3, 'La descripción debe tener al menos 3 caracteres'),

  diagnosis: z.string().optional().or(z.literal('')),
  intervention: z.string().optional().or(z.literal('')),

  parts_used: z.string().optional().or(z.literal('')),
  parts_cost_eur: z.number().min(0).optional().nullable(),

  workshop: z.string().optional().or(z.literal('')),
  responsible: z.string().optional().or(z.literal('')),

  downtime_hours: z.number().min(0).optional().nullable(),

  total_cost_eur: z.number().min(0).optional().nullable(),

  observations: z.string().optional().or(z.literal('')),
})

export const maintenanceUpdateSchema = maintenanceSchema.partial()

export const maintenanceSearchSchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  vehicle_id: z.string().optional(),
})
