/**
 * FleetControl — Route Validation Schema (Zod)
 *
 * All route form validations per PRD §4.4.
 * Field names match Supabase DB schema (source of truth).
 * departure_time / arrival_time are virtual fields (no DB column)
 * combined into departure_date / planned_arrival_date at service level.
 */

import { z } from 'zod'

export const routeSchema = z.object({
  // ── Planificación ────────────────────────────────────
  departure_date: z
    .string({ required_error: 'La fecha de salida es obligatoria' })
    .min(1, 'La fecha de salida es obligatoria'),

  departure_time: z.string().optional().or(z.literal('')),

  planned_arrival_date: z.string().optional().or(z.literal('')),
  arrival_time: z.string().optional().or(z.literal('')),

  // ── Origen / Destino ─────────────────────────────────
  origin_city: z
    .string({ required_error: 'El origen es obligatorio' })
    .min(2, 'El origen debe tener al menos 2 caracteres'),

  origin_province: z.string().optional().or(z.literal('')),
  origin_country: z.string().default('España'),

  destination_city: z
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

  actual_distance_km: z.number().positive().optional().nullable(),
  planned_duration_min: z.number().positive().optional().nullable(),
  actual_duration_min: z.number().positive().optional().nullable(),

  // ── Carga ───────────────────────────────────────────
  cargo_description: z.string().optional().or(z.literal('')),
  cargo_weight_kg: z
    .number({ invalid_type_error: 'Peso inválido' })
    .positive('El peso de carga debe ser mayor que 0')
    .optional()
    .nullable(),

  cargo_volume_m3: z.number().positive().optional().nullable(),

  subcategoria_id: z.string().optional().or(z.literal('')),

  // ── Costes ──────────────────────────────────────────
  fuel_consumed_liters: z.number().positive().optional().nullable(),
  fuel_cost_eur: z.number().min(0).optional().nullable(),
  toll_cost_eur: z.number().min(0).optional().nullable(),
  total_cost_eur: z.number().min(0).optional().nullable(),

  // ── Resultado ───────────────────────────────────────
  status: z
    .enum(['planned', 'in_progress', 'completed', 'delayed', 'cancelled'], {
      errorMap: () => ({ message: 'Estado inválido' }),
    })
    .default('planned'),

  delay_minutes: z.number().int().min(0).optional().nullable(),
  result_notes: z.string().optional().or(z.literal('')),

  // ── Documentación ───────────────────────────────────
  linked_document_ref: z.string().optional().or(z.literal('')),
  invoice_number: z.string().optional().or(z.literal('')),
  cmr_number: z.string().optional().or(z.literal('')),
  delivery_note_number: z.string().optional().or(z.literal('')),
  cpn_number: z.string().optional().or(z.literal('')),
  adr_number: z.string().optional().or(z.literal('')),
  control_number: z.string().optional().or(z.literal('')),
  packing_list_number: z.string().optional().or(z.literal('')),
  cleaning_cert_number: z.string().optional().or(z.literal('')),
  pod_number: z.string().optional().or(z.literal('')),
  route_sheet_number: z.string().optional().or(z.literal('')),
})

export const routeUpdateSchema = routeSchema.partial()

export const routeSearchSchema = z.object({
  search: z.string().optional(),
  origin_city: z.string().optional(),
  destination_city: z.string().optional(),
  status: z.string().optional(),
  driver_id: z.string().optional(),
  vehicle_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
})
