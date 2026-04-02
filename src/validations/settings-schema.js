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
  logo_url: z.string().url('URL inválida').optional().or(z.literal('')),
})

export const alertThresholdsSchema = z.object({
  alert_days_vehicle_doc: z.number().int().min(1).max(365),
  alert_days_driver_doc: z.number().int().min(1).max(365),
  alert_days_maintenance_km: z.number().int().min(100).max(200000),
  alert_days_maintenance_days: z.number().int().min(1).max(365),
  alert_critical_doc_days: z.number().int().min(1).max(90),
  fuel_anomaly_percent: z.number().int().min(1).max(100),
  alert_driving_hours: z.number().min(1).max(24),
  alert_tachograph_days: z.number().int().min(1).max(90),
  alert_speed_limit: z.number().int().min(1).max(200),
})

const GPS_PROVIDERS = ['webfleet', 'frotcom', 'geotab', 'otro', '']
const EMAIL_PROVIDERS = ['brevo', 'sendgrid', '']
const MAPS_PROVIDERS = ['google_maps', '']
const FUEL_CARD_PROVIDERS = ['dkv', 'wabco', 'otro', '']
const ACCOUNTING_PROVIDERS = ['sage', 'a3', 'holded', 'otro', '']

export const integrationsSchema = z.object({
  gps_provider: z.enum(GPS_PROVIDERS).optional().or(z.literal('')),
  gps_api_key: z.string().optional().or(z.literal('')),
  gps_api_secret: z.string().optional().or(z.literal('')),
})

export const emailIntegrationsSchema = z.object({
  email_provider: z.enum(EMAIL_PROVIDERS).optional().or(z.literal('')),
  email_api_key: z.string().optional().or(z.literal('')),
  email_sender_email: z.string().email('Email inválido').optional().or(z.literal('')),
  email_sender_name: z.string().max(200).optional().or(z.literal('')),
})

export const mapsIntegrationsSchema = z.object({
  maps_provider: z.enum(MAPS_PROVIDERS).optional().or(z.literal('')),
  maps_api_key: z.string().optional().or(z.literal('')),
})

export const fuelCardIntegrationsSchema = z.object({
  fuel_card_provider: z.enum(FUEL_CARD_PROVIDERS).optional().or(z.literal('')),
  fuel_card_api_key: z.string().optional().or(z.literal('')),
  fuel_card_api_secret: z.string().optional().or(z.literal('')),
})

export const accountingIntegrationsSchema = z.object({
  accounting_provider: z.enum(ACCOUNTING_PROVIDERS).optional().or(z.literal('')),
  accounting_api_key: z.string().optional().or(z.literal('')),
  accounting_api_url: z.string().optional().or(z.literal('')),
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
