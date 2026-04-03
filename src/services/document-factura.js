/**
 * FleetControl — Factura de Transporte Document Service
 *
 * Generates Factura de Transporte PDF according to RD 1619/2012.
 * Compatible with Ley 18/2022 (eFactura).
 *
 * @see RD 1619/2012
 * @see Ley 18/2022 (eFactura)
 */

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

const STORAGE_BUCKET = 'transport-documents'

const FACTURA_REQUIRED_FIELDS = [
  'invoice_number',
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
  if (vehicleResult.error) throw mapSupabaseError(vehicleResult.error)
  if (driverResult.error) throw mapSupabaseError(driverResult.error)
  if (companyResult.error) throw mapSupabaseError(companyResult.error)
  let cargo = null
  if (cargoId) {
    const { data, error } = await supabase
      .from('cargo_records')
      .select('*')
      .eq('id', cargoId)
      .single()
    if (error) throw mapSupabaseError(error)
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
  const invoiceDate = route.invoice_date
    ? new Date(route.invoice_date).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]
  const serviceAmount = route.price || 0
  const ivaRate = route.iva_rate || 21
  const ivaAmount = serviceAmount * (ivaRate / 100)
  const totalAmount = serviceAmount + ivaAmount
  return {
    invoice_number: route.invoice_number || '',
    invoice_date: invoiceDate,
    sender_name: company.company_name || '',
    sender_address: company.address || '',
    sender_tax_id: company.cif || '',
    recipient_name: route.client_name || cargo.cmr_recipient || '',
    recipient_address: route.client_address || cargo.cmr_delivery_place || '',
    recipient_tax_id: route.client_tax_id || cargo.consignee_nif || '',
    route_description: `Transporte ${route.origin_city ?? ''} → ${route.destination_city ?? ''}`,
    service_amount: serviceAmount,
    iva_rate: ivaRate,
    iva_amount: ivaAmount,
    total_amount: totalAmount,
    payment_terms: route.payment_terms || '',
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
  const seq = Date.now() % 100000
  return `${prefix}-${year}-${String(seq).padStart(5, '0')}`
}

function renderFacturaPdf(data, docNumber) {
  const doc = new jsPDF()
  const pw = doc.internal.pageSize.width
  let y = 15
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURA DE TRANSPORTE', pw / 2, y, { align: 'center' })
  y += 7
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nº Factura: ${docNumber}`, 14, y)
  doc.text(`Fecha: ${data.invoice_date}`, pw - 60, y)
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.text(data.sender_name, 14, y)
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.text(`CIF: ${data.sender_tax_id}`, 14, y)
  y += 4
  doc.text(data.sender_address, 14, y)
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.text('Facturar a:', 14, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(data.recipient_name, 14, y)
  y += 4
  doc.text(`CIF: ${data.recipient_tax_id}`, 14, y)
  y += 4
  doc.text(data.recipient_address, 14, y)
  y += 10
  doc.autoTable({
    startY: y,
    head: [['Concepto', 'Importe (€)']],
    body: [
      [data.route_description, `${data.service_amount.toFixed(2)} €`],
      [`IVA (${data.iva_rate}%)`, `${data.iva_amount.toFixed(2)} €`],
      ['TOTAL', `${data.total_amount.toFixed(2)} €`],
    ],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [245, 124, 0] },
    margin: { left: 14, right: 14 },
  })
  y = doc.lastAutoTable.finalY + 10
  doc.text(`Condiciones de pago: ${data.payment_terms}`, 14, y)
  y += 5
  if (data.bank_account) {
    doc.text(`IBAN: ${data.bank_account}`, 14, y)
  }
  return doc
}

async function uploadToStorage(routeId, filename, doc) {
  const pdfBlob = doc.output('arraybuffer')
  const filePath = `${routeId}/${filename}`
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, new Uint8Array(pdfBlob), { contentType: 'application/pdf' })
  if (uploadError) throw uploadError
  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)
  return urlData.publicUrl
}

async function saveDocumentRecord({ routeId, cargoId, docNumber, filename, url, type }) {
  const { data: docRecord, error: insertError } = await supabase
    .from('generated_documents')
    .insert({
      route_id: routeId,
      cargo_id: cargoId,
      document_type: type,
      document_number: docNumber,
      file_url: url,
      filename,
      generated_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single()
  if (insertError) throw mapSupabaseError(insertError)
  return docRecord
}
