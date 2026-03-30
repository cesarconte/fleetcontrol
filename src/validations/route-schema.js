/**
 * FleetControl — Route Validation Schema (Zod)
 *
 * All route form validations per PRD §4.4.
 * Field names match Supabase DB schema (source of truth).
 * departure_time / arrival_time are virtual fields (no DB column)
 * combined into fecha_salida / fecha_llegada_prevista at service level.
 */

import { z } from 'zod'

export const routeSchema = z.object({
  // ── Planificación ────────────────────────────────────
  fecha_salida: z
    .string({ required_error: 'La fecha de salida es obligatoria' })
    .min(1, 'La fecha de salida es obligatoria'),

  departure_time: z.string().optional().or(z.literal('')),

  fecha_llegada_prevista: z.string().optional().or(z.literal('')),
  arrival_time: z.string().optional().or(z.literal('')),

  // ── Origen / Destino ─────────────────────────────────
  origen_municipio: z
    .string({ required_error: 'El origen es obligatorio' })
    .min(2, 'El origen debe tener al menos 2 caracteres'),

  origen_provincia: z.string().optional().or(z.literal('')),
  origen_pais: z.string().default('España'),

  destino_municipio: z
    .string({ required_error: 'El destino es obligatorio' })
    .min(2, 'El destino debe tener al menos 2 caracteres'),

  destino_provincia: z.string().optional().or(z.literal('')),
  destino_pais: z.string().default('España'),

  // ── Asignación ──────────────────────────────────────
  vehicle_id: z
    .string({ required_error: 'Debe seleccionar un vehículo' })
    .uuid('Vehículo inválido'),

  driver_id: z
    .string({ required_error: 'Debe seleccionar un conductor' })
    .uuid('Conductor inválido'),

  // ── Distancia y duración ─────────────────────────────
  distancia_total_km: z
    .number({ invalid_type_error: 'Distancia inválida' })
    .positive('La distancia debe ser mayor que 0')
    .optional()
    .nullable(),

  distancia_recorrida_km: z.number().positive().optional().nullable(),
  duracion_prevista_min: z.number().positive().optional().nullable(),
  duracion_real_min: z.number().positive().optional().nullable(),

  // ── Carga ───────────────────────────────────────────
  descripcion_carga: z.string().optional().or(z.literal('')),
  peso_carga_kg: z
    .number({ invalid_type_error: 'Peso inválido' })
    .positive('El peso de carga debe ser mayor que 0')
    .optional()
    .nullable(),

  volumen_carga_m3: z.number().positive().optional().nullable(),
  tipo_carga: z
    .enum(['general', 'frigorifica', 'peligrosa', 'especial'], {
      errorMap: () => ({ message: 'Tipo de carga inválido' }),
    })
    .default('general'),

  // ── Costes ──────────────────────────────────────────
  consumo_combustible_l: z.number().positive().optional().nullable(),
  coste_combustible_eur: z.number().min(0).optional().nullable(),
  coste_peajes_eur: z.number().min(0).optional().nullable(),
  coste_total_eur: z.number().min(0).optional().nullable(),

  // ── Resultado ───────────────────────────────────────
  status: z
    .enum(['planificada', 'en_curso', 'completada', 'retrasada', 'cancelada'], {
      errorMap: () => ({ message: 'Estado inválido' }),
    })
    .default('planificada'),

  retraso_minutos: z.number().int().min(0).optional().nullable(),
  observaciones: z.string().optional().or(z.literal('')),

  // ── Documentación ───────────────────────────────────
  cmr_numero: z.string().optional().or(z.literal('')),
  albaran_numero: z.string().optional().or(z.literal('')),
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
