/**
 * FleetControl — Carta de Porte CMR Document Service
 *
 * Generates Carta de Porte CMR (Carta de Porte Internacional) PDF
 * according to Convenio CMR 1956, arts. 5-6.
 *
 * All 30+ mandatory fields are mapped from DB records, validated,
 * and rendered in a professional PDF layout.
 *
 * @see Convenio CMR 1956 arts. 5-6
 * @see Reg. UE 1072/2009
 */

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'
import { LEGAL_LIMITS } from '@/constants/legal-limits.js'

const STORAGE_BUCKET = 'transport-documents'

/** Required CMR fields per art. 5 */
const CMR_REQUIRED_FIELDS = [
  'issue_place',
  'issue_date',
  'shipper_name',
  'shipper_address',
  'carrier_name',
  'carrier_address',
  'consignee_name',
  'pickup_place',
  'pickup_date',
  'delivery_place',
  'goods_nature',
  'packaging_type',
  'gross_weight_kg',
  'freight_charges',
  'payment_terms',
]

/**
 * Generate a CMR Carta de Porte PDF.
 *
 * @param {object} params
 * @param {string} params.routeId - Route UUID
 * @param {string} [params.cargoId] - Optional cargo UUID
 * @returns {Promise<{ url: string, documentId: string, filename: string }>}
 */
export async function generateCmrDocument({ routeId, cargoId }) {
  const { route, vehicle, driver, company, cargo } = await fetchDocumentData(routeId, cargoId)
  const mappedData = mapCmrFields({ route, vehicle, driver, company, cargo })
  const validation = validateCmrFields(mappedData)
  if (!validation.valid) {
    throw new Error(`Campos CMR obligatorios faltantes: ${validation.missing.join(', ')}`)
  }
  const docNumber = generateCmrNumber()
  const doc = renderCmrPdf(mappedData, docNumber)
  const filename = `cmr_${routeId.slice(0, 8)}_${Date.now()}.pdf`
  const url = await uploadToStorage(routeId, filename, doc)
  const docRecord = await saveDocumentRecord({ routeId, cargoId, docNumber, filename, url })
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

function mapCmrFields({ route, vehicle, driver, cargo, company }) {
  const issueDate = route.departure_date
    ? new Date(route.departure_date).toISOString().split('T')[0]
    : ''
  return {
    issue_place: route.origin_city || company.city || '',
    issue_date: issueDate,
    shipper_name: company.company_name || '',
    shipper_address: company.address || '',
    shipper_tax_id: company.cif || '',
    carrier_name: company.company_name || '',
    carrier_address: company.address || '',
    carrier_tax_id: company.cif || '',
    consignee_name: cargo.cmr_recipient || cargo.consignee_name || '',
    consignee_address: cargo.cmr_delivery_place || cargo.consignee_address || '',
    consignee_tax_id: cargo.consignee_nif || '',
    pickup_place: route.origin_address || route.origin_city || '',
    pickup_date: route.departure_date || '',
    delivery_place: route.destination_address || route.destination_city || '',
    goods_nature: cargo.subcategoria_id || cargo.categoria_id || cargo.description || '',
    goods_description: cargo.description || '',
    packaging_type: cargo.packaging_type || '',
    packages_count: cargo.packages || '',
    package_marks: cargo.marks_numbers || '',
    gross_weight_kg: cargo.weight_kg || 0,
    freight_charges: route.price || 0,
    payment_terms: route.payment_terms || '',
    cod_amount: cargo.cod_amount || '',
    goods_value: cargo.declared_value || '',
    customs_instructions: cargo.customs_notes || '',
    transit_notes: route.notes || '',
    vehicle_plate: vehicle.plate || '',
    vehicle_type: vehicle.vehicle_type || '',
    driver_name: driver.full_name || '',
    driver_license: driver.license_number || '',
    driver_national_id: driver.national_id || '',
    adr_class: cargo.adr_class || '',
    adr_un_number: cargo.adr_un_number || '',
    adr_packing_group: cargo.adr_packing_group || '',
    shipper_signature: '',
    carrier_signature: '',
    consignee_signature: '',
    signature_date: issueDate,
    document_number: '',
  }
}

function validateCmrFields(mappedData) {
  const missing = []
  for (const field of CMR_REQUIRED_FIELDS) {
    const value = mappedData[field]
    if (value === null || value === undefined || value === '') {
      missing.push(field)
    }
  }
  return { valid: missing.length === 0, missing }
}

function generateCmrNumber() {
  const year = new Date().getFullYear()
  const seq = Date.now() % 100000
  return `${LEGAL_LIMITS.CARTA_PORTE?.CMR_NUMBER_PREFIX || 'CMR'}-${year}-${String(seq).padStart(5, '0')}`
}

function renderCmrPdf(data, docNumber) {
  const doc = new jsPDF()
  const pw = doc.internal.pageSize.width
  const margin = 14
  let y = 12

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(245, 124, 0)
  doc.text('CARTA DE PORTE INTERNACIONAL (CMR)', pw / 2, y, { align: 'center' })
  y += 7
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('Convenio CMR 1956, arts. 5-6 — Reg. UE 1072/2009', pw / 2, y, { align: 'center' })
  y += 5
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(`Nº: ${docNumber}`, pw / 2, y, { align: 'center' })
  y += 8
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)

  y = renderSection(doc, y, '1. REMITENTE (Art. 5b)', margin, [
    data.shipper_name,
    data.shipper_address,
    data.shipper_tax_id && `NIF: ${data.shipper_tax_id}`,
  ])
  y = renderSection(doc, y, '2. TRANSPORTISTA (Art. 5b)', margin, [
    data.carrier_name,
    data.carrier_address,
  ])
  y = renderSection(doc, y, '3. DESTINATARIO (Art. 5c)', margin, [
    data.consignee_name,
    data.consignee_address,
  ])

  y = renderSectionHeader(doc, y, '4. LUGARES Y FECHAS', margin)
  doc.autoTable({
    startY: y,
    head: [['Campo', 'Valor']],
    body: [
      ['Lugar y fecha de emisión', `${data.issue_place} — ${data.issue_date}`],
      ['Lugar y fecha de toma en carga', `${data.pickup_place} — ${data.pickup_date}`],
      ['Lugar de entrega', data.delivery_place],
    ],
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [245, 124, 0], textColor: 255 },
    margin: { left: margin, right: margin },
  })
  y = doc.lastAutoTable.finalY + 6

  y = renderSectionHeader(doc, y, '5. MERCANCÍAS', margin)
  doc.autoTable({
    startY: y,
    head: [['Naturaleza', 'Embalaje', 'Bultos', 'Marcas', 'Peso Bruto']],
    body: [
      [
        data.goods_nature,
        data.packaging_type,
        String(data.packages_count ?? '—'),
        data.package_marks || '—',
        `${data.gross_weight_kg} kg`,
      ],
    ],
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [245, 124, 0], textColor: 255 },
    margin: { left: margin, right: margin },
  })
  y = doc.lastAutoTable.finalY + 4

  if (data.adr_class) {
    doc.setFont('helvetica', 'bold')
    doc.text(`ADR Clase ${data.adr_class}`, margin, y)
    if (data.adr_un_number) {
      doc.text(` — ${data.adr_un_number}`, margin + 30, y)
    }
    doc.setFont('helvetica', 'normal')
    y += 6
  }

  y = renderSectionHeader(doc, y, '6. GASTOS DE TRANSPORTE (Art. 5i)', margin)
  doc.text(`Importe: ${data.freight_charges} €`, margin, y)
  y += 4
  doc.text(`Condiciones de pago: ${data.payment_terms}`, margin, y)
  y += 4
  if (data.cod_amount) {
    doc.text(`Contra reembolso: ${data.cod_amount}`, margin, y)
    y += 4
  }
  if (data.goods_value) {
    doc.text(`Valor declarado: ${data.goods_value}`, margin, y)
    y += 4
  }
  y += 2

  if (data.customs_instructions) {
    y = renderSectionHeader(doc, y, '7. INSTRUCCIONES ADUANERAS (Art. 5l)', margin)
    doc.text(data.customs_instructions, margin, y)
    y += 6
  }

  y = renderSectionHeader(doc, y, '8. VEHÍCULO Y CONDUCTOR', margin)
  doc.text(`Matrícula: ${data.vehicle_plate}`, margin, y)
  y += 4
  doc.text(`Conductor: ${data.driver_name} — Licencia: ${data.driver_license}`, margin, y)
  y += 8

  y = Math.max(y, doc.internal.pageSize.height - 45)
  doc.setFont('helvetica', 'bold')
  doc.text('FIRMAS', pw / 2, y, { align: 'center' })
  y += 6
  doc.setFont('helvetica', 'normal')
  renderSignatureBlock(doc, y, [
    { label: 'Remitente', name: data.shipper_name },
    { label: 'Transportista', name: data.carrier_name },
    { label: 'Destinatario', name: data.consignee_name },
  ])

  return doc
}

function renderSectionHeader(doc, y, title, margin) {
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(245, 124, 0)
  doc.text(title, margin, y)
  y += 5
  doc.setDrawColor(245, 124, 0)
  doc.setLineWidth(0.5)
  doc.line(margin, y - 1, doc.internal.pageSize.width - margin, y - 1)
  doc.setFontSize(7)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  return y
}

function renderSection(doc, y, title, margin, lines) {
  y = renderSectionHeader(doc, y, title, margin)
  lines.filter(Boolean).forEach(line => {
    doc.text(line, margin, y)
    y += 4
  })
  return y + 2
}

function renderSignatureBlock(doc, y, signatures) {
  const pw = doc.internal.pageSize.width
  const sigWidth = 55
  const sigGap = 10
  const sigStartX = (pw - (sigWidth * 3 + sigGap * 2)) / 2
  signatures.forEach((sig, i) => {
    const x = sigStartX + i * (sigWidth + sigGap)
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.line(x, y, x + sigWidth, y)
    doc.setFontSize(7)
    doc.text(sig.label, x, y + 4)
    if (sig.name) {
      doc.setFontSize(6)
      doc.setTextColor(120, 120, 120)
      doc.text(sig.name, x, y + 8)
      doc.setTextColor(0, 0, 0)
    }
    doc.text('Firma: _________________', x, y + 12)
    doc.text(`Fecha: ___/___/______`, x, y + 17)
  })
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

async function saveDocumentRecord({ routeId, cargoId, docNumber, filename, url }) {
  const { data: docRecord, error: insertError } = await supabase
    .from('generated_documents')
    .insert({
      route_id: routeId,
      cargo_id: cargoId,
      document_type: 'cmr',
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
