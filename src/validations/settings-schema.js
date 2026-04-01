/**
 * FleetControl — Settings Validation Schema (Zod)
 *
 * Validations for company settings, alert thresholds, and user profiles.
 *
 * @see PRD §4.10 — Configuración
 */

import { z } from 'zod'
import { USER_ROLE_VALUES } from '@/constants/role-permissions.js'

export const companySettingsSchema = z.object({
  company_name: z.string().min(1, 'El nombre de la empresa es obligatorio').max(200),
  cif: z.string().min(1, 'El CIF es obligatorio').max(20),
  address: z.string().max(300).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  postal_code: z.string().max(10).optional().or(z.literal('')),
  province: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).default('España'),
  transport_authorization_number: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
})

export const alertThresholdsSchema = z.object({
  alert_days_vehicle_doc: z.number().int().min(1).max(365),
  alert_days_driver_doc: z.number().int().min(1).max(365),
  alert_days_maintenance_km: z.number().int().min(100).max(200000),
  alert_days_maintenance_days: z.number().int().min(1).max(365),
  alert_critical_doc_days: z.number().int().min(1).max(90),
  fuel_anomaly_percent: z.number().int().min(1).max(100),
})

export const userProfileSchema = z.object({
  full_name: z.string().min(1, 'El nombre es obligatorio').max(200),
  phone: z.string().max(20).optional().or(z.literal('')),
})

export const userCreateSchema = z.object({
  email: z.string().email('Email inválido'),
  full_name: z.string().min(1, 'El nombre es obligatorio').max(200),
  role: z.enum(USER_ROLE_VALUES),
})

export const userUpdateRoleSchema = z.object({
  role: z.enum(USER_ROLE_VALUES),
})
