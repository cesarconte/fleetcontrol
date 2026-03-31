/**
 * FleetControl — Vehicle Document Validation Schema (Zod)
 *
 * Validations for vehicle_documents CRUD per PRD §4.2.2.
 * Column names match Supabase DB schema (English).
 */

import { z } from 'zod'
import { VEHICLE_DOCUMENT_TYPE_VALUES } from '@/constants/vehicle-document-types.js'

export const vehicleDocumentSchema = z.object({
  vehicle_id: z
    .string({ required_error: 'Debe seleccionar un vehículo' })
    .uuid('Vehículo inválido'),

  doc_type: z.enum(VEHICLE_DOCUMENT_TYPE_VALUES, {
    errorMap: () => ({ message: 'Tipo de documento inválido' }),
  }),

  reference_number: z.string().optional().or(z.literal('')),

  issue_date: z.string().optional().or(z.literal('')),

  expiry_date: z.string().optional().or(z.literal('')),

  alert_days_before: z
    .number({ invalid_type_error: 'Días de alerta inválido' })
    .int()
    .min(1, 'Mínimo 1 día')
    .max(365, 'Máximo 365 días')
    .default(30),

  notes: z.string().optional().or(z.literal('')),

  file_url: z.string().optional().or(z.literal('')),
  file_name: z.string().optional().or(z.literal('')),
  file_type: z.string().optional().or(z.literal('')),
})

export const vehicleDocumentUpdateSchema = vehicleDocumentSchema
  .partial()
  .omit({ vehicle_id: true })
