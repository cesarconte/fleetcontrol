/**
 * FleetControl — Fuel Validation Schema (Zod)
 *
 * All fuel refueling form validations per PRD §4.7.
 */

import { z } from 'zod'

export const fuelSchema = z.object({
  vehicle_id: z
    .string({ required_error: 'Debe seleccionar un vehículo' })
    .uuid('Vehículo inválido'),

  date: z.string({ required_error: 'La fecha es obligatoria' }).min(1, 'La fecha es obligatoria'),

  mileage_km: z
    .number({ invalid_type_error: 'Kilometraje inválido' })
    .int()
    .positive('El kilometraje debe ser mayor que 0'),

  liters: z
    .number({ invalid_type_error: 'Litros inválido' })
    .positive('Los litros deben ser mayores que 0'),

  price_per_liter: z
    .number({ invalid_type_error: 'Precio inválido' })
    .positive('El precio debe ser mayor que 0'),

  total_cost_eur: z
    .number({ invalid_type_error: 'Importe inválido' })
    .min(0, 'El importe no puede ser negativo')
    .optional()
    .nullable(),

  station: z.string().optional().or(z.literal('')),

  fuel_type: z
    .enum(['diesel', 'cng', 'lng', 'hydrogen', 'electric', 'hybrid'], {
      errorMap: () => ({ message: 'Tipo de combustible inválido' }),
    })
    .default('diesel'),

  route_id: z.string().uuid().optional().nullable(),

  observations: z.string().optional().or(z.literal('')),
})

export const fuelUpdateSchema = fuelSchema.partial()

export const fuelSearchSchema = z.object({
  search: z.string().optional(),
  vehicle_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
})
