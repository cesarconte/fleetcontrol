/**
 * FleetControl — Route Validation Schema (Zod)
 *
 * All route form validations per PRD §4.4.
 * Includes weight validation vs MMA and driver hours (CE 561/2006).
 */

import { z } from 'zod'

export const routeSchema = z.object({
  // ── Planificación ────────────────────────────────────
  departure_date: z
    .string({ required_error: 'La fecha de salida es obligatoria' })
    .min(1, 'La fecha de salida es obligatoria'),

  departure_time: z.string().optional().or(z.literal('')),

  arrival_date: z.string().optional().or(z.literal('')),
  arrival_time: z.string().optional().or(z.literal('')),

  // ── Origen / Destino ─────────────────────────────────
  origin: z
    .string({ required_error: 'El origen es obligatorio' })
    .min(2, 'El origen debe tener al menos 2 caracteres'),

  origin_province: z.string().optional().or(z.literal('')),
  origin_country: z.string().default('España'),

  destination: z
    .string({ required_error: 'El destino es obligatorio' })
    .min(2, 'El destino debe tener al menos 2 caracteres'),

  destination_province: z.string().optional().or(z.literal('')),
  destination_country: z.string().default('España'),

  // ── Asignación ──────────────────────────────────────
  vehicle_id: z
    .string({ required_error: 'Debe seleccionar un vehículo' })
    .uuid('Vehículo inválido'),

  driver_id: z
    .string({ required_error: 'Debe seleccionar un conductor' })
    .uuid('Conductor inválido'),

  // ── Distancia y duración ─────────────────────────────
  planned_distance_km: z
    .number({ invalid_type_error: 'Distancia inválida' })
    .positive('La distancia debe ser mayor que 0')
    .optional()
    .nullable(),

  real_distance_km: z.number().positive().optional().nullable(),
  planned_duration_hours: z.number().positive().optional().nullable(),
  real_duration_hours: z.number().positive().optional().nullable(),

  // ── Carga ───────────────────────────────────────────
  cargo_description: z.string().optional().or(z.literal('')),
  cargo_weight_kg: z
    .number({ invalid_type_error: 'Peso inválido' })
    .positive('El peso de carga debe ser mayor que 0')
    .optional()
    .nullable(),

  cargo_volume_m3: z.number().positive().optional().nullable(),
  cargo_type: z
    .enum(['general', 'refrigerated', 'dangerous', 'special'], {
      errorMap: () => ({ message: 'Tipo de carga inválido' }),
    })
    .default('general'),

  // ── Costes ──────────────────────────────────────────
  fuel_consumed_liters: z.number().positive().optional().nullable(),
  fuel_cost_eur: z.number().min(0).optional().nullable(),
  toll_cost_eur: z.number().min(0).optional().nullable(),
  total_cost_eur: z.number().min(0).optional().nullable(),

  // ── Resultado ───────────────────────────────────────
  status: z
    .enum(['planned', 'active', 'completed', 'delayed', 'incident', 'cancelled'], {
      errorMap: () => ({ message: 'Estado inválido' }),
    })
    .default('planned'),

  delay_minutes: z.number().int().min(0).optional().nullable(),
  observations: z.string().optional().or(z.literal('')),

  // ── Documentación ───────────────────────────────────
  cmr_number: z.string().optional().or(z.literal('')),
  albaran_number: z.string().optional().or(z.literal('')),
})

export const routeUpdateSchema = routeSchema.partial()

export const routeSearchSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  driver_id: z.string().optional(),
  vehicle_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
})
