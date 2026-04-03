/**
 * FleetControl — Unified Document Schema (Zod)
 *
 * Validation schema for document create/edit operations in the centralized
 * Documents page. Used by DocumentActionsDialog.
 *
 * @see docs/plans/feature-documentos-centralizados-plan.md — Fase 3
 */

import { z } from 'zod'

/**
 * Schema for creating or editing a document entry.
 */
export const documentSchema = z.object({
  docType: z.string().min(1, 'Tipo de documento obligatorio'),
  referenceNumber: z.string().optional().or(z.literal('')),
  issueDate: z.string().optional().or(z.literal('')),
  expiryDate: z.string().min(1, 'Fecha de vencimiento obligatoria'),
  notes: z.string().optional().or(z.literal('')),
})
