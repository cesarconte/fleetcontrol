/**
 * FleetControl — Vehicle Validation Schema (Zod)
 *
 * All vehicle form validations per PRD §4.2.1.
 * Spanish plate format: 4 digits + 2-3 letters (old) or 1234-LLL (new)
 *
 * Field names match Supabase DB schema (source of truth).
 */

import { z } from 'zod'

const PLATE_REGEX = /^(\d{4}[A-Z]{3}|\d{4}[A-Z]{2})$/

export const vehicleSchema = z.object({
  // ── Identificación ──────────────────────────────────────
  matricula: z
    .string({ required_error: 'La matrícula es obligatoria' })
    .min(6, 'Matrícula inválida (mínimo 6 caracteres)')
    .max(7, 'Matrícula inválida (máximo 7 caracteres)')
    .regex(PLATE_REGEX, 'Formato de matrícula inválida (ej: 1234ABC)'),

  vin: z
    .string()
    .length(17, 'El VIN debe tener exactamente 17 caracteres')
    .optional()
    .or(z.literal('')),

  marca: z.string({ required_error: 'La marca es obligatoria' }).min(1, 'La marca es obligatoria'),

  modelo: z
    .string({ required_error: 'El modelo es obligatorio' })
    .min(1, 'El modelo es obligatorio'),

  variante: z.string().optional().or(z.literal('')),
  color: z.string().optional().or(z.literal('')),
  anio_fabricacion: z.number().int().min(1990).max(2030).optional().nullable(),
  transport_card_number: z.string().optional().or(z.literal('')),

  fecha_primera_matriculacion: z.string().optional().or(z.literal('')),

  distintivo_ambiental: z
    .enum(['0', 'eco', 'c', 'b', 'sin_etiqueta'], {
      errorMap: () => ({ message: 'Distintivo DGT inválido' }),
    })
    .default('sin_etiqueta'),

  euro_emisiones: z
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
  mma_kg: z
    .number({ invalid_type_error: 'Peso inválido' })
    .positive('El peso bruto debe ser mayor que 0')
    .max(44000, 'El MMA no puede exceder 44.000 kg (configuración eco)')
    .optional()
    .nullable(),

  tara_kg: z.number().positive().optional().nullable(),
  mma_conjunto_kg: z.number().positive().optional().nullable(),
  carga_util_max_kg: z.number().positive().optional().nullable(),

  anchura_max_m: z
    .number()
    .max(2.6, 'El ancho máximo es 2,60 m (refrigerados)')
    .optional()
    .nullable(),

  altura_max_m: z.number().max(4.0, 'La altura máxima es 4,00 m').optional().nullable(),

  numero_ejes: z.number().int().min(2).max(6).optional().nullable(),
  longitud_total_m: z
    .number()
    .max(16.5, 'El largo máximo articulado es 16,50 m')
    .optional()
    .nullable(),

  // ── Motor y Emisiones ──────────────────────────────────
  tipo_combustible: z
    .enum(['diesel', 'gnc', 'gnl', 'hidrogeno', 'electrico', 'hibrido'], {
      errorMap: () => ({ message: 'Tipo de combustible inválido' }),
    })
    .default('diesel'),

  cilindrada_cc: z.number().int().positive().optional().nullable(),
  potencia_cv: z.number().int().positive().optional().nullable(),
  potencia_kw: z.number().int().positive().optional().nullable(),
  par_motor_nm: z.number().int().positive().optional().nullable(),
  caja_cambios: z.string().optional().or(z.literal('')),
  velocidad_max_autorizada_kmh: z.number().int().positive().optional().nullable(),
  consumo_medio_homologado: z.number().positive().optional().nullable(),
  adblue: z.boolean().default(false),

  // ── Tipo de vehículo ───────────────────────────────────
  tipo_vehiculo: z.enum(
    [
      'tractora',
      'vehiculo_rigido',
      'semirremolque',
      'remolque',
      'cisterna',
      'frigorifico',
      'basculante',
      'lona',
      'caja_cerrada',
      'especial',
      'portacoches',
    ],
    { errorMap: () => ({ message: 'Tipo de vehículo inválido' }) },
  ),

  status: z
    .enum(['activo', 'en_ruta', 'en_mantenimiento', 'inactivo', 'dado_de_baja'], {
      errorMap: () => ({ message: 'Estado inválido' }),
    })
    .default('activo'),

  matricula_semirremolque: z.string().optional().or(z.literal('')),
  longitud_caja_m: z.number().positive().optional().nullable(),
  volumen_carga_m3: z.number().positive().optional().nullable(),
  tipo_enganche: z.string().optional().or(z.literal('')),
})

export const vehicleUpdateSchema = vehicleSchema.partial()

export const vehicleSearchSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  tipo_vehiculo: z.string().optional(),
  distintivo_ambiental: z.string().optional(),
})
