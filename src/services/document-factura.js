/**
 * FleetControl — Factura de Transporte Document Service
 *
 * Generates Factura de Transporte PDF according to RD 1619/2012.
 * Compatible with Ley 18/2022 (eFactura).
 *
 * @see RD 1619/2012
 * @see Ley 18/2022 (eFactura)
 */

import { jsPDF } from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
applyPlugin(jsPDF)

import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'
import { saveDocumentRecord } from './api-documents-persistence.js'

const STORAGE_BUCKET = 'transport-documents'

const FACTURA_REQUIRED_FIELDS = [
  'invoice_date',
  'sender_name',
  'sender_tax_id',
  'recipient_name',
  'recipient_tax_id',
  'service_amount',
  'iva_rate',
  'total_amount',
]

export async function generateFacturaDocument({ routeId, cargoId }) {
  const { route, vehicle, driver, company, cargo } = await fetchDocumentData(routeId, cargoId)
  const mappedData = mapFacturaFields({ route, vehicle, driver, company, cargo })
  const validation = validateFields(mappedData, FACTURA_REQUIRED_FIELDS)
  if (!validation.valid)
    throw new Error(`Campos obligatorios faltantes: ${validation.missing.join(', ')}`)
  const docNumber = mappedData.invoice_number || generateDocumentNumber('FAC')
  const doc = renderFacturaPdf(mappedData, docNumber)
  const filename = `factura_${routeId.slice(0, 8)}_${Date.now()}.pdf`
  const url = await uploadToStorage(routeId, filename, doc)

  const docRecord = await saveDocumentRecord({
    routeId,
    cargoId,
    docNumber,
    filename,
    url,
    type: 'factura',
  })
  return { url, documentId: docRecord.id, filename }
}

async function fetchDocumentData(routeId, cargoId) {
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .select('*')
    .eq('id', routeId)
    .single()
  if (routeError) throw mapSupabaseError(routeError)
  const [vehicleResult, driverResult, companyResult] = await Promise.all([
    route.vehicle_id
      ? supabase.from('vehicles').select('*').eq('id', route.vehicle_id).single()
      : { data: null, error: null },
    route.driver_id
      ? supabase.from('drivers').select('*').eq('id', route.driver_id).single()
      : { data: null, error: null },
    supabase.from('company_settings').select('*').maybeSingle(),
  ])

  let cargo = null
  if (cargoId) {
    const { data } = await supabase.from('cargo_records').select('*').eq('id', cargoId).single()
    cargo = data
  } else {
    const { data } = await supabase
      .from('cargo_records')
      .select('*')
      .eq('route_id', routeId)
      .maybeSingle()
    cargo = data
  }

  return {
    route: route ?? {},
    vehicle: vehicleResult.data ?? {},
    driver: driverResult.data ?? {},
    company: companyResult.data ?? {},
    cargo: cargo ?? {},
  }
}

function mapFacturaFields({ route, vehicle, driver, company, cargo }) {
  const d = route.invoice_date ? new Date(route.invoice_date) : new Date()
  const invoiceDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`

  const serviceAmount = route.price || 0
  const ivaRate = route.iva_rate || 21
  const ivaAmount = serviceAmount * (ivaRate / 100)
  const totalAmount = serviceAmount + ivaAmount

  return {
    invoice_number: route.invoice_number || '',
    invoice_date: invoiceDate,
    sender_name: company.company_name || 'FleetControl S.L.',
    sender_address: company.address || '',
    sender_tax_id: company.cif || '',
    recipient_name: route.client_name || cargo.cmr_recipient || '',
    recipient_address: route.client_address || cargo.cmr_delivery_place || '',
    recipient_tax_id: route.client_tax_id || cargo.consignee_nif || '',
    route_description: `Servicio de transporte de mercancías por carretera. Origen: ${route.origin_address || route.origin_city || 'S/N'} — Destino: ${route.destination_address || route.destination_city || 'S/N'}`,
    service_amount: serviceAmount,
    iva_rate: ivaRate,
    iva_amount: ivaAmount,
    total_amount: totalAmount,
    payment_terms: route.payment_terms || '30 días fecha factura',
    bank_account: company.bank_account || '',
    vehicle_plate: vehicle.plate || '',
    driver_name: driver.full_name || '',
    document_number: '',
  }
}

function validateFields(mappedData, requiredFields) {
  const missing = []
  for (const field of requiredFields) {
    const value = mappedData[field]
    if (value === null || value === undefined || value === '') missing.push(field)
  }
  return { valid: missing.length === 0, missing }
}

function generateDocumentNumber(prefix) {
  const year = new Date().getFullYear()
  // Professional industry standard: PREFIX / YEAR / 5-DIGIT-SEQUENCE
  // Using a time-based sequence as a safe fallback for local generation
  const seq = String(Date.now()).slice(-5)
  return `${prefix}/${year}/${seq}`
}

const PW = 210
const ML = 15
const MR = 15
const MT = 15
const CW = PW - ML - MR
const PRIMARY_COLOR = [245, 124, 0]
const PRIMARY_TEXT_COLOR = [255, 255, 255]

function renderFacturaPdf(data, docNumber) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MT

  // ── CABECERA ──────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(ML, y, CW, 15, 'F')
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRIMARY_TEXT_COLOR)
  doc.text('FACTURA DE TRANSPORTE', ML + 5, y + 10)

  doc.setFontSize(10)
  doc.text(`Nº FACTURA: ${docNumber}`, PW - MR - 5, y + 10, { align: 'right' })
  doc.setTextColor(0)
  y += 25

  // ── EMISOR Y RECEPTOR ─────────────────────────────────────────
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DEL EMISOR:', ML, y)
  doc.text('DATOS DEL CLIENTE:', ML + 95, y)

  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.text(data.sender_name, ML, y)
  doc.text(data.recipient_name, ML + 95, y)

  y += 5.5
  doc.text(`CIF/NIF: ${data.sender_tax_id}`, ML, y)
  doc.text(`CIF/NIF: ${data.recipient_tax_id}`, ML + 95, y)

  y += 5.5
  doc.text(data.sender_address, ML, y, { maxWidth: 85 })
  doc.text(data.recipient_address, ML + 95, y, { maxWidth: 85 })

  y += 18
  doc.setFont('helvetica', 'bold')
  doc.text(`FECHA FACTURA: ${data.invoice_date}`, ML, y)

  y += 12

  // ── TABLA DE CONCEPTOS ────────────────────────────────────────
  doc.autoTable({
    startY: y,
    head: [['Concepto / Descripción del Servicio', 'Base Imponible (€)']],
    body: [
      [
        data.route_description,
        `${data.service_amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`,
      ],
      ['', ''], // Empty row for visual spacing
      ['', ''],
      ['', ''],
    ],
    styles: { fontSize: 9.5, cellPadding: 6 },
    headStyles: { fillColor: PRIMARY_COLOR, textColor: PRIMARY_TEXT_COLOR, fontStyle: 'bold' },
    margin: { left: ML, right: MR },
    tableWidth: CW,
    theme: 'grid',
    columnStyles: {
      1: { halign: 'right', cellWidth: 40 },
    },
  })

  y = doc.lastAutoTable.finalY + 10

  // ── TOTALES ───────────────────────────────────────────────────
  const totalBoxW = 70
  const totalX = PW - MR - totalBoxW

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Base Imponible (BI):`, totalX + 5, y)
  doc.text(
    `${data.service_amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`,
    PW - MR - 5,
    y,
    { align: 'right' },
  )

  y += 7
  doc.text(`IVA (${data.iva_rate}%):`, totalX + 5, y)
  doc.text(
    `${data.iva_amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`,
    PW - MR - 5,
    y,
    { align: 'right' },
  )

  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setFillColor(245, 245, 245)
  doc.rect(totalX, y - 7, totalBoxW, 12, 'F')
  doc.setDrawColor(...PRIMARY_COLOR)
  doc.rect(totalX, y - 7, totalBoxW, 12, 'S')
  doc.text(`TOTAL FACTURA:`, totalX + 5, y + 1)
  doc.text(
    `${data.total_amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`,
    PW - MR - 5,
    y + 1,
    { align: 'right' },
  )

  // ── MODO DE PAGO Y OBSERVACIONES AL PIE ──────────────────────
  y = 260
  doc.setDrawColor(200)
  doc.line(ML, y, PW - MR, y)
  y += 8

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMACIÓN DE PAGO Y OBSERVACIONES:', ML, y)

  y += 6
  doc.setFont('helvetica', 'normal')
  doc.text(`Vencimiento: ${data.payment_terms}`, ML, y)

  if (data.bank_account) {
    y += 5
    doc.text(`Cuenta Bancaria (IBAN): ${data.bank_account}`, ML, y)
  }

  y += 10
  doc.setFontSize(7.5)
  doc.setTextColor(100)
  doc.text(
    'Esta factura se rige por la normativa vigente RD 1619/2012 de facturación en España.',
    PW / 2,
    285,
    { align: 'center' },
  )

  return doc
}

async function uploadToStorage(routeId, filename, doc) {
  const pdfBlob = doc.output('arraybuffer')
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(`${routeId}/${filename}`, new Uint8Array(pdfBlob), { contentType: 'application/pdf' })
  if (error) throw error
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(`${routeId}/${filename}`).data.publicUrl
}
