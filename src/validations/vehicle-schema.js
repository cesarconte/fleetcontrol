/**
 * FleetControl — Vehicle Validation Schema (Zod)
 *
 * All vehicle form validations per PRD §4.2.1.
 * Spanish plate format: 4 digits + 2-3 letters (old) or 1234-LLL (new)
 *
 * Field names match Supabase DB schema (source of truth).
 * Vehicle types derived from src/constants/vehicle-types.js (DRY).
 */

import { z } from 'zod'
import { getValidVehicleValues } from '@/constants/vehicle-types.js'

const PLATE_REGEX = /^(\d{4}[A-Z]{3}|\d{4}[A-Z]{2})$/
const { euCategorias, bodyTypes } = getValidVehicleValues()

export const vehicleSchema = z.object({
  // ── Identificación ──────────────────────────────────────
  plate: z
    .string({ required_error: 'La matrícula es obligatoria' })
    .min(6, 'Matrícula inválida (mínimo 6 caracteres)')
    .max(7, 'Matrícula inválida (máximo 7 caracteres)')
    .regex(PLATE_REGEX, 'Formato de matrícula inválida (ej: 1234ABC)'),

  vin: z
    .string()
    .length(17, 'El VIN debe tener exactamente 17 caracteres')
    .optional()
    .or(z.literal('')),

  brand: z.string({ required_error: 'La marca es obligatoria' }).min(1, 'La marca es obligatoria'),

  model: z
    .string({ required_error: 'El modelo es obligatorio' })
    .min(1, 'El modelo es obligatorio'),

  variant: z.string().optional().or(z.literal('')),
  color: z.string().optional().or(z.literal('')),
  year: z.number().int().min(1990).max(2030).optional().nullable(),
  transport_card_number: z.string().optional().or(z.literal('')),

  first_registration_date: z.string().optional().or(z.literal('')),

  dgt_badge: z
    .enum(['0', 'eco', 'c', 'b', 'sin_etiqueta'], {
      errorMap: () => ({ message: 'Distintivo DGT inválido' }),
    })
    .default('sin_etiqueta'),

  euro_class: z
    .enum([
      'euro_i',
      'euro_ii',
      'euro_iii',
      'euro_iv',
      'euro_v',
      'euro_vi',
      'euro_vi_d',
      'euro_vi_e',
      'euro_vi_d_temp',
    ])
    .optional()
    .nullable(),

  // ── Masas y Dimensiones ─────────────────────────────────
  gross_weight_kg: z
    .number({ invalid_type_error: 'Peso inválido' })
    .positive('El peso bruto debe ser mayor que 0')
    .max(44000, 'El MMA no puede exceder 44.000 kg (configuración eco)')
    .optional()
    .nullable(),

  tare_kg: z.number().positive().optional().nullable(),
  combined_gross_weight_kg: z.number().positive().optional().nullable(),
  max_payload_kg: z.number().positive().optional().nullable(),

  width_m: z.number().max(2.6, 'El ancho máximo es 2,60 m (refrigerados)').optional().nullable(),

  height_m: z.number().max(4.0, 'La altura máxima es 4,00 m').optional().nullable(),

  axle_count: z.number().int().min(2).max(6).optional().nullable(),
  length_m: z.number().max(16.5, 'El largo máximo articulado es 16,50 m').optional().nullable(),

  // ── Motor y Emisiones ──────────────────────────────────
  fuel_type: z
    .enum(['diesel', 'gnc', 'gnl', 'hidrogeno', 'electrico', 'hibrido'], {
      errorMap: () => ({ message: 'Tipo de combustible inválido' }),
    })
    .default('diesel'),

  engine_cc: z.number().int().positive().optional().nullable(),
  power_cv: z.number().int().positive().optional().nullable(),
  power_kw: z.number().int().positive().optional().nullable(),
  torque_nm: z.number().int().positive().optional().nullable(),
  transmission: z.string().optional().or(z.literal('')),
  max_speed_kmh: z.number().int().positive().optional().nullable(),
  consumption_homologated: z.number().positive().optional().nullable(),
  adblue: z.boolean().default(false),

  // ── Clasificación UE (3 campos) ─────────────────────────
  eu_category: z.enum(euCategorias, {
    errorMap: () => ({ message: 'Categoría UE inválida' }),
  }),

  body_type: z.enum(bodyTypes, {
    errorMap: () => ({ message: 'Tipo de carrocería inválido' }),
  }),

  status: z
    .enum(['activo', 'en_ruta', 'en_mantenimiento', 'inactivo', 'dado_de_baja'], {
      errorMap: () => ({ message: 'Estado inválido' }),
    })
    .default('activo'),

  associated_semitrailer_plate: z.string().optional().or(z.literal('')),
  box_length_m: z.number().positive().optional().nullable(),
  cargo_volume_m3: z.number().positive().optional().nullable(),
  hitch_type: z.string().optional().or(z.literal('')),
})

export const vehicleUpdateSchema = vehicleSchema.partial()

export const vehicleSearchSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  eu_category: z.string().optional(),
  body_type: z.string().optional(),
  dgt_badge: z.string().optional(),
})
