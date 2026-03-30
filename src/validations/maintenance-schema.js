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

  tipo: z
    .enum(['preventivo', 'correctivo'], {
      errorMap: () => ({ message: 'Tipo de mantenimiento inválido' }),
    })
    .default('preventivo'),

  status: z
    .enum(['pendiente', 'en_curso', 'completada', 'cancelada'], {
      errorMap: () => ({ message: 'Estado inválido' }),
    })
    .default('pendiente'),

  fecha_programada: z.string().optional().or(z.literal('')),
  fecha_fin: z.string().optional().or(z.literal('')),

  km_al_momento: z
    .number({ invalid_type_error: 'Kilometraje inválido' })
    .int()
    .positive('El kilometraje debe ser mayor que 0')
    .optional()
    .nullable(),

  descripcion: z
    .string({ required_error: 'La descripción es obligatoria' })
    .min(3, 'La descripción debe tener al menos 3 caracteres'),

  diagnostico: z.string().optional().or(z.literal('')),
  intervencion_realizada: z.string().optional().or(z.literal('')),

  recambios: z.string().optional().or(z.literal('')),
  coste_recambios_eur: z.number().min(0).optional().nullable(),

  taller_nombre: z.string().optional().or(z.literal('')),
  taller_responsable: z.string().optional().or(z.literal('')),

  inmovilizacion_horas: z.number().min(0).optional().nullable(),

  coste_total_eur: z.number().min(0).optional().nullable(),

  observations: z.string().optional().or(z.literal('')),
})

export const maintenanceUpdateSchema = maintenanceSchema.partial()

export const maintenanceSearchSchema = z.object({
  search: z.string().optional(),
  tipo: z.string().optional(),
  status: z.string().optional(),
  vehicle_id: z.string().optional(),
})
