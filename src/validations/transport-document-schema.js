/**
 * FleetControl — Transport Document Validation Schema (Zod)
 *
 * Validations for generating transport documents and managing templates.
 *
 * @see PRD §4.9 — Documentación de Transporte
 */

import { z } from 'zod'
import { TRANSPORT_DOCUMENT_TYPE_VALUES } from '@/constants/transport-document-types.js'

/**
 * Schema for generating a transport document from a route/cargo.
 */
export const generateDocumentSchema = z.object({
  document_type: z.enum(TRANSPORT_DOCUMENT_TYPE_VALUES, {
    errorMap: () => ({ message: 'Tipo de documento inválido' }),
  }),
  route_id: z.string().uuid('ID de ruta inválido'),
  cargo_id: z.string().uuid('ID de carga inválido').optional(),
})

/**
 * Schema for creating/editing a document template.
 */
export const documentTemplateSchema = z.object({
  document_type: z.enum(TRANSPORT_DOCUMENT_TYPE_VALUES, {
    errorMap: () => ({ message: 'Tipo de documento inválido' }),
  }),
  name: z.string().min(1, 'El nombre es obligatorio').max(200),
  description: z.string().max(500).optional().or(z.literal('')),
  field_config: z.record(z.string(), z.any()).default({}),
  is_active: z.boolean().default(true),
})
