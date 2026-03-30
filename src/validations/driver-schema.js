/**
 * FleetControl — Driver Validation Schema (Zod)
 *
 * All driver form validations per PRD §4.3.
 * NIF: 8 digits + letter / NIE: X/Y/Z + 7 digits + letter
 * Carnets y certificaciones: campos opcionales por normativa.
 */

import { z } from 'zod'
import { CLASES_CARNET } from '@/constants/driver-document-types.js'

const NIF_REGEX = /^[0-9]{8}[A-Z]$/
const NIE_REGEX = /^[XYZ][0-9]{7}[A-Z]$/

/** Base fields — datos personales + laborales */
const baseFields = {
  nombre_completo: z
    .string({ required_error: 'El nombre es obligatorio' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre es demasiado largo'),

  nif_nie: z
    .string({ required_error: 'El NIF/NIE es obligatorio' })
    .regex(NIF_REGEX, 'Formato de NIF inválido (8 dígitos + letra, ej: 12345678A)')
    .or(z.string().regex(NIE_REGEX, 'Formato de NIE inválido (X/Y/Z + 7 dígitos + letra)')),

  fecha_nacimiento: z
    .string({ required_error: 'La fecha de nacimiento es obligatoria' })
    .min(1, 'La fecha de nacimiento es obligatoria'),

  nacionalidad: z.string().optional().or(z.literal('')),

  direccion: z.string().optional().or(z.literal('')),
  ciudad: z.string().optional().or(z.literal('')),
  codigo_postal: z.string().optional().or(z.literal('')),
  provincia: z.string().optional().or(z.literal('')),

  telefono: z
    .string()
    .regex(/^[0-9]{9}$/, 'El teléfono debe tener 9 dígitos')
    .optional()
    .or(z.literal('')),

  email: z.string().email('Email inválido').optional().or(z.literal('')),

  foto_url: z.string().optional().or(z.literal('')),

  fecha_incorporacion: z.string().optional().or(z.literal('')),

  status: z
    .enum(['activo', 'baja_temporal', 'baja_definitiva'], {
      errorMap: () => ({ message: 'Estado inválido' }),
    })
    .default('activo'),
}

/** Carnet de conducir fields (RDL 6/2015) */
const carnetFields = {
  carnet_clase: z
    .enum(CLASES_CARNET, {
      errorMap: () => ({ message: 'Clase de carnet inválida' }),
    })
    .optional()
    .or(z.literal('')),

  carnet_numero: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),

  carnet_fecha_expedicion: z.string().optional().or(z.literal('')),

  carnet_fecha_vencimiento: z.string().optional().or(z.literal('')),
}

/** CAP fields (RD 1032/2007) */
const capFields = {
  cap_numero: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),

  cap_fecha_vencimiento: z.string().optional().or(z.literal('')),

  cap_horas_formacion: z
    .number({ invalid_error: 'Debe ser un número' })
    .int('Debe ser un número entero')
    .min(35, 'Mínimo 35 horas de formación')
    .optional(),
}

/** Tarjeta tacógrafo fields (Reg. UE 165/2014) */
const tacografoFields = {
  tarjeta_tacografo_numero: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),

  tarjeta_tacografo_vencimiento: z.string().optional().or(z.literal('')),
}

/** Reconocimiento médico fields (RD 818/2009) */
const medicoFields = {
  reconocimiento_medico_fecha: z.string().optional().or(z.literal('')),

  reconocimiento_medico_vencimiento: z.string().optional().or(z.literal('')),
}

/** ADR fields (ADR 2025 + RD 97/2014) */
const adrFields = {
  adr_certificado: z.boolean().default(false),

  adr_numero: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),

  adr_fecha_vencimiento: z.string().optional().or(z.literal('')),
}

export const driverSchema = z.object({
  ...baseFields,
  ...carnetFields,
  ...capFields,
  ...tacografoFields,
  ...medicoFields,
  ...adrFields,
})

export const driverUpdateSchema = driverSchema.partial()

export const driverSearchSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
})
