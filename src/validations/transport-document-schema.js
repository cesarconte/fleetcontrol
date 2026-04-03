/**
 * FleetControl — Transport Document Validation Schema (Zod)
 *
 * Validations for generating transport documents and managing templates.
 * Includes schemas for all 6 document types.
 *
 * @see PRD §4.9 — Documentación de Transporte
 * @see LCTTM arts. 10-12 — Carta de Porte Nacional
 * @see Convenio CMR 1956 arts. 5-6 — Carta de Porte Internacional
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

/**
 * Carta de Porte Nacional — Schema de validación (Ley 15/2009, art. 10).
 * Valida los campos obligatorios de las 10 secciones.
 */
export const cartaPorteNacionalSchema = z.object({
  // Sección 1: Identificación
  shipper_name: z.string().min(1, 'Nombre del cargador obligatorio'),
  shipper_nif: z.string().min(1, 'NIF del cargador obligatorio'),
  shipper_address: z.string().min(1, 'Dirección del cargador obligatoria'),
  carrier_name: z.string().min(1, 'Nombre del transportista obligatorio'),
  carrier_nif: z.string().min(1, 'NIF del transportista obligatorio'),
  consignee_name: z.string().min(1, 'Nombre del destinatario obligatorio'),
  consignee_address: z.string().min(1, 'Dirección del destinatario obligatoria'),
  // Sección 2: Lugares y fechas
  issue_place: z.string().min(1, 'Lugar de emisión obligatorio'),
  issue_date: z.string().min(1, 'Fecha de emisión obligatoria'),
  loading_address: z.string().min(1, 'Dirección de carga obligatoria'),
  delivery_address: z.string().min(1, 'Dirección de entrega obligatoria'),
  // Sección 3: Mercancías
  goods_nature: z.string().min(1, 'Naturaleza de la mercancía obligatoria'),
  gross_weight_kg: z.number().positive('Peso bruto debe ser positivo'),
  // Sección 4: Embalaje
  packaging_type: z.string().min(1, 'Tipo de embalaje obligatorio'),
  // Sección 7: Flete
  freight_price: z.number().min(0, 'Precio del flete obligatorio'),
  payment_terms: z.string().min(1, 'Condiciones de pago obligatorias'),
  // Opcionales
  shipper_city: z.string().optional().default(''),
  shipper_province: z.string().optional().default(''),
  shipper_phone: z.string().optional().default(''),
  carrier_address: z.string().optional().default(''),
  carrier_transport_license: z.string().optional().default(''),
  consignee_nif: z.string().optional().default(''),
  consignee_city: z.string().optional().default(''),
  consignee_province: z.string().optional().default(''),
  consignee_phone: z.string().optional().default(''),
  loading_date: z.string().optional().default(''),
  loading_time: z.string().optional().default(''),
  delivery_date: z.string().optional().default(''),
  delivery_time_window: z.string().optional().default(''),
  goods_description: z.string().optional().default(''),
  packages_count: z.union([z.number(), z.string()]).optional(),
  net_weight_kg: z.number().nonnegative().optional().default(0),
  volume_m3: z.union([z.number(), z.string()]).optional(),
  adr_class: z.string().optional().default(''),
  adr_un_number: z.string().optional().default(''),
  temperature_required: z.string().optional().default(''),
  pallet_count: z.union([z.number(), z.string()]).optional(),
  seal_number: z.string().optional().default(''),
  container_number: z.string().optional().default(''),
  marking_codes: z.string().optional().default(''),
  special_handling: z.string().optional().default(''),
  sealing_instructions: z.string().optional().default(''),
  delivery_deadline: z.string().optional().default(''),
  transit_notes: z.string().optional().default(''),
  declared_value: z.union([z.number(), z.string()]).optional(),
  insurance_company: z.string().optional().default(''),
  insurance_policy_number: z.string().optional().default(''),
  coverage_limit: z.union([z.number(), z.string()]).optional(),
  fuel_surcharge: z.number().nonnegative().optional().default(0),
  toll_fees: z.number().nonnegative().optional().default(0),
  waiting_fees: z.number().nonnegative().optional().default(0),
  total_amount: z.number().nonnegative().optional(),
  payment_method: z.string().optional().default(''),
  shipper_signature: z.string().optional().default(''),
  carrier_signature: z.string().optional().default(''),
  consignee_signature: z.string().optional().default(''),
  signature_date: z.string().optional().default(''),
  damage_notes: z.string().optional().default(''),
  missing_packages: z.string().optional().default(''),
  condition_notes: z.string().optional().default(''),
  order_reference: z.string().optional().default(''),
  tms_reference: z.string().optional().default(''),
  additional_notes: z.string().optional().default(''),
  vehicle_plate: z.string().optional().default(''),
  vehicle_type: z.string().optional().default(''),
  driver_name: z.string().optional().default(''),
  driver_license: z.string().optional().default(''),
  document_number: z.string().optional().default(''),
})

/**
 * CMR Internacional — Schema de validación (Convenio CMR 1956, arts. 5-6).
 */
export const cmrSchema = z.object({
  // Art. 5(a)
  issue_place: z.string().min(1, 'Lugar de emisión obligatorio (CMR art. 5a)'),
  issue_date: z.string().min(1, 'Fecha de emisión obligatoria (CMR art. 5a)'),
  // Art. 5(b)
  shipper_name: z.string().min(1, 'Nombre del remitente obligatorio (CMR art. 5b)'),
  shipper_address: z.string().min(1, 'Dirección del remitente obligatoria (CMR art. 5b)'),
  carrier_name: z.string().min(1, 'Nombre del transportista obligatorio (CMR art. 5b)'),
  carrier_address: z.string().min(1, 'Dirección del transportista obligatoria (CMR art. 5b)'),
  // Art. 5(c)
  consignee_name: z.string().min(1, 'Nombre del destinatario obligatorio (CMR art. 5c)'),
  consignee_address: z.string().min(1, 'Dirección del destinatario obligatoria (CMR art. 5c)'),
  // Art. 5(d)
  pickup_place: z.string().min(1, 'Lugar de toma en carga obligatorio (CMR art. 5d)'),
  pickup_date: z.string().min(1, 'Fecha de toma en carga obligatoria (CMR art. 5d)'),
  // Art. 5(e)
  delivery_place: z.string().min(1, 'Lugar de entrega obligatorio (CMR art. 5e)'),
  // Art. 5(f)
  goods_nature: z.string().min(1, 'Naturaleza de la mercancía obligatoria (CMR art. 5f)'),
  packaging_type: z.string().min(1, 'Tipo de embalaje obligatorio (CMR art. 5f)'),
  // Art. 5(h)
  gross_weight_kg: z.number().positive('Peso bruto obligatorio (CMR art. 5h)'),
  // Art. 5(i)
  freight_charges: z.number().min(0, 'Gastos de transporte obligatorios (CMR art. 5i)'),
  payment_terms: z.string().min(1, 'Condiciones de pago obligatorias (CMR art. 5i)'),
  // Opcionales
  shipper_tax_id: z.string().optional().default(''),
  carrier_tax_id: z.string().optional().default(''),
  consignee_tax_id: z.string().optional().default(''),
  goods_description: z.string().optional().default(''),
  packages_count: z.union([z.number(), z.string()]).optional(),
  package_marks: z.string().optional().default(''),
  cod_amount: z.union([z.number(), z.string()]).optional(),
  goods_value: z.union([z.number(), z.string()]).optional(),
  customs_instructions: z.string().optional().default(''),
  transit_notes: z.string().optional().default(''),
  vehicle_plate: z.string().optional().default(''),
  vehicle_type: z.string().optional().default(''),
  driver_name: z.string().optional().default(''),
  driver_license: z.string().optional().default(''),
  driver_national_id: z.string().optional().default(''),
  adr_class: z.string().optional().default(''),
  adr_un_number: z.string().optional().default(''),
  adr_packing_group: z.string().optional().default(''),
  shipper_signature: z.string().optional().default(''),
  carrier_signature: z.string().optional().default(''),
  consignee_signature: z.string().optional().default(''),
  signature_date: z.string().optional().default(''),
  document_number: z.string().optional().default(''),
})

/**
 * Albarán de Entrega — Schema de validación (UNE 56100).
 */
export const albaranSchema = z.object({
  sender_name: z.string().min(1, 'Nombre del remitente obligatorio'),
  sender_address: z.string().min(1, 'Dirección del remitente obligatoria'),
  recipient_name: z.string().min(1, 'Nombre del destinatario obligatorio'),
  recipient_address: z.string().min(1, 'Dirección del destinatario obligatoria'),
  delivery_date: z.string().min(1, 'Fecha de entrega obligatoria'),
  items_description: z.string().min(1, 'Descripción de artículos obligatoria'),
  sender_tax_id: z.string().optional().default(''),
  delivery_time: z.string().optional().default(''),
  items_quantity: z.union([z.number(), z.string()]).optional(),
  items_weight_kg: z.union([z.number(), z.string()]).optional(),
  observations: z.string().optional().default(''),
  signature: z.string().optional().default(''),
  vehicle_plate: z.string().optional().default(''),
  driver_name: z.string().optional().default(''),
  document_number: z.string().optional().default(''),
})

/**
 * Hoja de Ruta — Schema de validación (LOTT / RD 70/2019).
 */
export const hojaRutaSchema = z.object({
  vehicle_plate: z.string().min(1, 'Matrícula del vehículo obligatoria'),
  driver_name: z.string().min(1, 'Nombre del conductor obligatorio'),
  driver_license: z.string().min(1, 'Licencia del conductor obligatoria'),
  route_origin: z.string().min(1, 'Origen de la ruta obligatorio'),
  route_destination: z.string().min(1, 'Destino de la ruta obligatorio'),
  departure_date: z.string().min(1, 'Fecha de salida obligatoria'),
  cargo_description: z.string().min(1, 'Descripción de la carga obligatoria'),
  vehicle_brand_model: z.string().optional().default(''),
  driver_national_id: z.string().optional().default(''),
  departure_time: z.string().optional().default(''),
  estimated_arrival: z.string().optional().default(''),
  stops: z.string().optional().default(''),
  instructions: z.string().optional().default(''),
  cargo_weight_kg: z.union([z.number(), z.string()]).optional(),
  company_name: z.string().optional().default(''),
  distance_total_km: z.union([z.number(), z.string()]).optional(),
  document_number: z.string().optional().default(''),
})

/**
 * Factura de Transporte — Schema de validación (RD 1619/2012).
 */
export const facturaSchema = z.object({
  invoice_number: z.string().min(1, 'Número de factura obligatorio'),
  invoice_date: z.string().min(1, 'Fecha de factura obligatoria'),
  sender_name: z.string().min(1, 'Nombre del emisor obligatorio'),
  sender_tax_id: z.string().min(1, 'NIF del emisor obligatorio'),
  recipient_name: z.string().min(1, 'Nombre del receptor obligatorio'),
  recipient_tax_id: z.string().min(1, 'NIF del receptor obligatorio'),
  service_amount: z.number().min(0, 'Importe del servicio obligatorio'),
  iva_rate: z.number().min(0, 'Tipo de IVA obligatorio'),
  total_amount: z.number().min(0, 'Importe total obligatorio'),
  sender_address: z.string().optional().default(''),
  recipient_address: z.string().optional().default(''),
  route_description: z.string().optional().default(''),
  iva_amount: z.number().nonnegative().optional().default(0),
  payment_terms: z.string().optional().default(''),
  bank_account: z.string().optional().default(''),
  vehicle_plate: z.string().optional().default(''),
  driver_name: z.string().optional().default(''),
  document_number: z.string().optional().default(''),
})

/**
 * Certificado de Entrega (POD) — Schema de validación (LCTTM).
 */
export const podSchema = z.object({
  recipient_name: z.string().min(1, 'Nombre del destinatario obligatorio'),
  delivery_date: z.string().min(1, 'Fecha de entrega obligatoria'),
  cargo_description: z.string().min(1, 'Descripción de la mercancía obligatoria'),
  recipient_signature: z.string().optional().default(''),
  delivery_time: z.string().optional().default(''),
  cargo_condition: z.string().optional().default('Buen estado'),
  observations: z.string().optional().default(''),
  vehicle_plate: z.string().optional().default(''),
  driver_name: z.string().optional().default(''),
  delivery_address: z.string().optional().default(''),
  document_number: z.string().optional().default(''),
})
