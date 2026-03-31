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

  refuel_date: z
    .string({ required_error: 'La fecha es obligatoria' })
    .min(1, 'La fecha es obligatoria'),

  odometer_km: z
    .number({ invalid_type_error: 'Kilometraje inválido' })
    .int()
    .positive('El kilometraje debe ser mayor que 0'),

  quantity: z
    .number({ invalid_type_error: 'Litros inválido' })
    .positive('Los litros deben ser mayores que 0'),

  unit_price: z
    .number({ invalid_type_error: 'Precio inválido' })
    .positive('El precio debe ser mayor que 0'),

  total_eur: z
    .number({ invalid_type_error: 'Importe inválido' })
    .min(0, 'El importe no puede ser negativo')
    .optional()
    .nullable(),

  station_name: z.string().optional().or(z.literal('')),

  route_id: z.string().uuid().optional().nullable(),
})

export const fuelUpdateSchema = fuelSchema.partial()

export const fuelSearchSchema = z.object({
  station_name: z.string().optional(),
  vehicle_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
})
