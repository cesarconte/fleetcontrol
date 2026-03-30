/**
 * FleetControl — Cargo Validation Schema (Zod)
 *
 * All cargo form validations per PRD §4.6.
 * ADR validation for dangerous goods.
 * Subcategory validation from taxonomy.
 */

import { z } from 'zod'
import { getAllSubcategories } from '@/constants/cargo-categories.js'

/** ADR classes 1-9 */
const ADR_CLASSES = ['1', '2', '3', '4.1', '4.2', '4.3', '5.1', '5.2', '6.1', '6.2', '7', '8', '9']

/** Valid subcategory IDs from taxonomy */
const VALID_SUBCATEGORY_IDS = getAllSubcategories().map(s => s.id)

const cargoBaseSchema = z.object({
  route_id: z.string({ required_error: 'Debe seleccionar una ruta' }).uuid('Ruta inválida'),

  descripcion: z
    .string({ required_error: 'La descripción es obligatoria' })
    .min(2, 'La descripción debe tener al menos 2 caracteres'),

  peso_kg: z
    .number({ invalid_type_error: 'Peso inválido' })
    .positive('El peso debe ser mayor que 0'),

  volumen_m3: z.number().positive().optional().nullable(),

  tipo: z
    .enum(['general', 'frigorifica', 'peligrosa', 'especial'], {
      errorMap: () => ({ message: 'Tipo de carga inválido' }),
    })
    .default('general'),

  subcategoria_id: z
    .enum(VALID_SUBCATEGORY_IDS, {
      errorMap: () => ({ message: 'Subcategoría inválida' }),
    })
    .optional()
    .or(z.literal('')),

  // ── ADR (solo si tipo === 'peligrosa') ───────────────
  adr_clase: z
    .enum(ADR_CLASSES, {
      errorMap: () => ({ message: 'Clase ADR inválida' }),
    })
    .optional()
    .or(z.literal('')),

  adr_numero_onu: z
    .string()
    .regex(/^[0-9]{4}$/, 'Número ONU debe tener 4 dígitos')
    .optional()
    .or(z.literal('')),

  adr_grupo_embalaje: z.enum(['I', 'II', 'III', '']).optional().or(z.literal('')),

  // ── CMR fields ──────────────────────────────────────
  cmr_remitente: z.string().optional().or(z.literal('')),
  cmr_destinatario: z.string().optional().or(z.literal('')),
  cmr_lugar_entrega: z.string().optional().or(z.literal('')),
})

export const cargoSchema = cargoBaseSchema.refine(
  data => {
    if (!data.subcategoria_id) return true
    const sub = getAllSubcategories().find(s => s.id === data.subcategoria_id)
    return sub && sub.mapToLegacy === data.tipo
  },
  {
    message: 'La subcategoría no corresponde al tipo de carga seleccionado',
    path: ['subcategoria_id'],
  },
)

export const cargoUpdateSchema = cargoBaseSchema.partial()

export const cargoSearchSchema = z.object({
  search: z.string().optional(),
  tipo: z.string().optional(),
  route_id: z.string().optional(),
})
