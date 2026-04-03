/**
 * FleetControl — Transport Document Types
 *
 * Catalog of transport document types supported by the system.
 * Each type defines its fields, data source mapping, and legal basis.
 *
 * Based on PRD §4.9 — Documentación de Transporte.
 *
 * @see Convenio CMR 1956 — Carta de Porte Internacional
 * @see LCTTM (Ley 15/2009) — Albarán y Factura
 * @see LOTT / RD 70/2019 — Hoja de Ruta
 * @see RD 1619/2012 + Ley 18/2022 — Factura de Transporte
 * @see ADR 2025 (5.4) + RD 97/2014 — Documento ADR
 */

/** @param {object} obj */
function deepFreeze(obj) {
  Object.keys(obj).forEach(key => {
    const val = obj[key]
    if (val && typeof val === 'object') deepFreeze(val)
  })
  return Object.freeze(obj)
}

export const TRANSPORT_DOCUMENT_TYPES = deepFreeze({
  CMR: {
    value: 'cmr',
    label: 'Carta de Porte CMR',
    description: 'Convenio CMR 1956 (arts. 5-6) — transporte internacional de mercancías',
    baseLegal: 'Convenio CMR 1956',
    icon: 'mdi-file-document-outline',
    fields: [
      'sender_name',
      'sender_address',
      'sender_tax_id',
      'recipient_name',
      'recipient_address',
      'pickup_place',
      'delivery_place',
      'vehicle_plate',
      'vehicle_type',
      'driver_name',
      'driver_license',
      'cargo_description',
      'cargo_weight_kg',
      'cargo_volume_m3',
      'cargo_packages',
      'cargo_value',
      'route_origin',
      'route_destination',
      'transport_price',
      'carrier_notes',
    ],
  },
  ALBARAN: {
    value: 'albaran',
    label: 'Albarán de Entrega',
    description: 'Documento de entrega según UNE 56100',
    baseLegal: 'UNE 56100',
    icon: 'mdi-clipboard-text-outline',
    fields: [
      'sender_name',
      'sender_address',
      'sender_tax_id',
      'recipient_name',
      'recipient_address',
      'delivery_date',
      'delivery_time',
      'items_description',
      'items_quantity',
      'items_weight_kg',
      'observations',
      'signature',
    ],
  },
  HOJA_RUTA: {
    value: 'hoja_ruta',
    label: 'Hoja de Ruta',
    description: 'Planificación de ruta según LOTT / RD 70/2019',
    baseLegal: 'LOTT / RD 70/2019',
    icon: 'mdi-map-marker-path',
    fields: [
      'vehicle_plate',
      'vehicle_brand_model',
      'driver_name',
      'driver_license',
      'driver_national_id',
      'route_origin',
      'route_destination',
      'departure_date',
      'departure_time',
      'estimated_arrival',
      'stops',
      'instructions',
      'cargo_description',
      'cargo_weight_kg',
    ],
  },
  FACTURA: {
    value: 'factura',
    label: 'Factura de Transporte',
    description: 'Factura de servicios de transporte según RD 1619/2012',
    baseLegal: 'RD 1619/2012 + Ley 18/2022',
    icon: 'mdi-file-currency-outline',
    fields: [
      'invoice_number',
      'invoice_date',
      'sender_name',
      'sender_address',
      'sender_tax_id',
      'recipient_name',
      'recipient_address',
      'recipient_tax_id',
      'route_description',
      'service_amount',
      'iva_rate',
      'iva_amount',
      'total_amount',
      'payment_terms',
      'bank_account',
    ],
  },
  POD: {
    value: 'pod',
    label: 'Certificado de Entrega (POD)',
    description: 'Proof of Delivery — prueba de entrega según LCTTM',
    baseLegal: 'LCTTM (Ley 15/2009)',
    icon: 'mdi-check-decagram-outline',
    fields: [
      'recipient_name',
      'recipient_signature',
      'delivery_date',
      'delivery_time',
      'cargo_description',
      'cargo_condition',
      'observations',
    ],
  },
  ADR: {
    value: 'adr',
    label: 'Documento de Transporte ADR',
    description: 'Documento para transporte de mercancías peligrosas',
    baseLegal: 'ADR 2025 (5.4) + RD 97/2014',
    icon: 'mdi-hazard-lights',
    fields: [
      'sender_name',
      'sender_address',
      'recipient_name',
      'recipient_address',
      'vehicle_plate',
      'driver_name',
      'driver_adr_cert',
      'adr_class',
      'adr_un_number',
      'adr_packing_group',
      'adr_labels',
      'adr_tremcard',
      'emergency_phone',
    ],
  },
})

/**
 * Array of all transport document type values (for selects and validation).
 * @type {string[]}
 */
export const TRANSPORT_DOCUMENT_TYPE_VALUES = Object.freeze(
  Object.values(TRANSPORT_DOCUMENT_TYPES).map(t => t.value),
)

/**
 * Get the Spanish label for a transport document type value.
 * @param {string} value
 * @returns {string}
 */
export function getTransportDocumentTypeLabel(value) {
  const entry = Object.values(TRANSPORT_DOCUMENT_TYPES).find(t => t.value === value)
  return entry?.label ?? value
}

/**
 * Get the field list for a transport document type.
 * @param {string} value - Document type value
 * @returns {string[]}
 */
export function getTransportDocumentTypeFields(value) {
  const entry = Object.values(TRANSPORT_DOCUMENT_TYPES).find(t => t.value === value)
  return entry?.fields ?? []
}

/**
 * Get all document types as {value, label} for selects.
 * @returns {Array<{value: string, label: string}>}
 */
export function getActiveTransportDocumentTypes() {
  return Object.values(TRANSPORT_DOCUMENT_TYPES).map(t => ({
    value: t.value,
    label: t.label,
  }))
}

/**
 * CMR field mapping: maps field groups to their data source tables and columns.
 * Used by document-generator.js to auto-fill CMR fields from DB data.
 */
export const CMR_FIELD_MAPPING = deepFreeze({
  sender: {
    source: 'company_settings',
    fields: {
      sender_name: 'company_name',
      sender_address: 'address',
      sender_tax_id: 'cif',
    },
  },
  recipient: {
    source: 'cargo_records',
    fields: {
      recipient_name: 'cmr_recipient',
      recipient_address: 'cmr_delivery_place',
    },
  },
  vehicle: {
    source: 'vehicles',
    fields: {
      vehicle_plate: 'plate',
      vehicle_type: 'vehicle_type',
    },
  },
  driver: {
    source: 'drivers',
    fields: {
      driver_name: 'full_name',
      driver_license: 'license_number',
    },
  },
  cargo: {
    source: 'cargo_records',
    fields: {
      cargo_description: 'description',
      cargo_weight_kg: 'weight_kg',
      cargo_volume_m3: 'volume_m3',
      cargo_packages: 'packages',
      cargo_value: 'declared_value',
    },
  },
  route: {
    source: 'routes',
    fields: {
      route_origin: 'origin_city',
      route_destination: 'destination_city',
      transport_price: 'price',
      carrier_notes: 'notes',
    },
  },
})
