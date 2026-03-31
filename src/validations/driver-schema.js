/**
 * FleetControl — Driver Validation Schema (Zod)
 *
 * Validations for the `drivers` table per PRD §4.3.
 * NIF: 8 digits + letter / NIE: X/Y/Z + 7 digits + letter
 * Column names match the Supabase DB schema (English).
 */

import { z } from 'zod'

const NIF_REGEX = /^[0-9]{8}[A-Z]$/
const NIE_REGEX = /^[XYZ][0-9]{7}[A-Z]$/

/** Base fields — drivers table columns */
const baseFields = {
  full_name: z
    .string({ required_error: 'El nombre es obligatorio' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre es demasiado largo'),

  nif: z
    .string({ required_error: 'El NIF/NIE es obligatorio' })
    .regex(NIF_REGEX, 'Formato de NIF inválido (8 dígitos + letra, ej: 12345678A)')
    .or(z.string().regex(NIE_REGEX, 'Formato de NIE inválido (X/Y/Z + 7 dígitos + letra)')),

  birth_date: z
    .string({ required_error: 'La fecha de nacimiento es obligatoria' })
    .min(1, 'La fecha de nacimiento es obligatoria'),

  nationality: z.string().optional().or(z.literal('')),

  address: z.string().optional().or(z.literal('')),

  phone: z
    .string()
    .regex(/^[0-9]{9}$/, 'El teléfono debe tener 9 dígitos')
    .optional()
    .or(z.literal('')),

  email: z.string().email('Email inválido').optional().or(z.literal('')),

  photo_url: z.string().optional().or(z.literal('')),

  hire_date: z.string().optional().or(z.literal('')),

  status: z
    .enum(['activo', 'baja_temporal', 'baja_definitiva'], {
      errorMap: () => ({ message: 'Estado inválido' }),
    })
    .default('activo'),
}

export const driverSchema = z.object({
  ...baseFields,
})

export const driverUpdateSchema = driverSchema.partial()

export const driverSearchSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
})
