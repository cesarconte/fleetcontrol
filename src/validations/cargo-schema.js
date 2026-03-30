/**
 * FleetControl — Cargo Validation Schema (Zod)
 *
 * All cargo form validations per PRD §4.6.
 * ADR validation for dangerous goods.
 */

import { z } from 'zod'

/** ADR classes 1-9 */
const ADR_CLASSES = ['1', '2', '3', '4.1', '4.2', '4.3', '5.1', '5.2', '6.1', '6.2', '7', '8', '9']

export const cargoSchema = z.object({
  route_id: z.string({ required_error: 'Debe seleccionar una ruta' }).uuid('Ruta inválida'),

  description: z
    .string({ required_error: 'La descripción es obligatoria' })
    .min(2, 'La descripción debe tener al menos 2 caracteres'),

  weight_kg: z
    .number({ invalid_type_error: 'Peso inválido' })
    .positive('El peso debe ser mayor que 0'),

  volume_m3: z.number().positive().optional().nullable(),

  type: z
    .enum(['general', 'refrigerated', 'dangerous', 'special'], {
      errorMap: () => ({ message: 'Tipo de carga inválido' }),
    })
    .default('general'),

  // ── ADR (solo si type === 'dangerous') ───────────────
  adr_class: z
    .enum(ADR_CLASSES, {
      errorMap: () => ({ message: 'Clase ADR inválida' }),
    })
    .optional()
    .or(z.literal('')),

  un_number: z
    .string()
    .regex(/^[0-9]{4}$/, 'Número ONU debe tener 4 dígitos')
    .optional()
    .or(z.literal('')),

  packing_group: z.enum(['I', 'II', 'III', '']).optional().or(z.literal('')),

  // ── CMR fields ──────────────────────────────────────
  sender_name: z.string().optional().or(z.literal('')),
  receiver_name: z.string().optional().or(z.literal('')),
  loading_place: z.string().optional().or(z.literal('')),
  unloading_place: z.string().optional().or(z.literal('')),

  // ── Temperature (refrigerated) ──────────────────────
  required_temp_min_c: z.number().optional().nullable(),
  required_temp_max_c: z.number().optional().nullable(),

  observations: z.string().optional().or(z.literal('')),
})

export const cargoUpdateSchema = cargoSchema.partial()

export const cargoSearchSchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  route_id: z.string().optional(),
})
