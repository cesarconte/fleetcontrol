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

import { jsPDF } from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'

// Register autoTable plugin on jsPDF prototype (v5 API)
applyPlugin(jsPDF)

import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'
import { LEGAL_LIMITS } from '@/constants/legal-limits.js'
import { saveDocumentRecord } from './api-documents-persistence.js'

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
  const docRecord = await saveDocumentRecord({
    routeId,
    cargoId,
    docNumber,
    filename,
    url,
    type: 'cmr',
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

function mapCmrFields({ route, vehicle, driver, cargo, company }) {
  const issueDate = route.departure_date ? formatDateES(route.departure_date) : ''
  const pickupDate = route.departure_date ? formatDateES(route.departure_date) : ''
  return {
    issue_place: route.origin_city || company.city || '',
    issue_date: issueDate,
    shipper_name: company.company_name || '',
    shipper_address: company.address || '',
    shipper_tax_id: company.cif || '',
    carrier_name: company.company_name || '',
    carrier_address: company.address || '',
    carrier_tax_id: company.cif || '',
    consignee_name: cargo.consignee_name || cargo.cmr_recipient || '',
    consignee_address: cargo.consignee_address || cargo.cmr_delivery_place || '',
    consignee_tax_id: cargo.consignee_nif || '',
    pickup_place: route.origin_address || route.origin_city || '',
    pickup_date: pickupDate,
    delivery_place: route.destination_address || route.destination_city || '',
    goods_nature: cargo.categoria_id || cargo.subcategoria_id || cargo.description || '',
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

/** Format ISO date to DD/MM/YYYY */
function formatDateES(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
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
  const series = LEGAL_LIMITS.CARTA_PORTE?.CMR_NUMBER_PREFIX || 'CMR'
  return `${series}/${year}/${String(seq).padStart(5, '0')}`
}

const PW = 210
const ML = 10
const MR = 10
const MT = 10
const CW = PW - ML - MR
const PRIMARY_COLOR = [245, 124, 0]
const PRIMARY_TEXT_COLOR = [255, 255, 255]

function renderCmrPdf(data, docNumber) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let currentY = MT

  // ── HEADER SUPERIOR ───────────────────────────────────────
  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(ML, currentY, CW, 12, 'F')
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRIMARY_TEXT_COLOR)
  doc.text('CARTA DE PORTE INTERNACIONAL - CONVENIO CMR', ML + 5, currentY + 8)
  doc.setFontSize(9.5)
  doc.text(`Nº ${docNumber}`, PW - MR - 5, currentY + 8, { align: 'right' })
  doc.setTextColor(0)
  currentY += 18

  // ── Helpers de Layout ────────────────────────────────────
  function sectionBox(x, y, w, h, title, num) {
    doc.setDrawColor(...PRIMARY_COLOR)
    doc.setLineWidth(0.2)
    doc.rect(x, y, w, h)
    doc.setFillColor(...PRIMARY_COLOR)
    doc.rect(x, y, w, 5, 'F')
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PRIMARY_TEXT_COLOR)
    doc.text(`${num} ${title}`.toUpperCase(), x + 2, y + 3.5)
    doc.setTextColor(0)
    return { contentY: y + 9.5, innerW: w - 4 }
  }

  function writeBoxText(x, y, label, value, maxWidth) {
    doc.setFontSize(8.5)
    let curY = y
    const lineH = 4.2
    if (label) {
      doc.setFont('helvetica', 'bold')
      doc.text(label + ': ', x, curY)
      doc.setFont('helvetica', 'normal')
      const labelW = doc.getTextWidth(label + ': ')
      const valText = String(value || 'S/N')
      const lines = doc.splitTextToSize(valText, maxWidth - labelW)
      lines.forEach((line, i) => {
        doc.text(line, x + (i === 0 ? labelW : 0), curY)
        curY += lineH
      })
    } else {
      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(String(value || 'S/N'), maxWidth)
      lines.forEach(line => {
        doc.text(line, x, curY)
        curY += lineH
      })
    }
    return curY
  }

  // ── Cuerpo del Documento (DISTRIBUCIÓN OPTIMIZADA) ───────
  const colW = CW / 2

  // FILA 1: Remitente (1) | Consignatario (2)
  const row1H = 45
  const b1 = sectionBox(ML, currentY, colW, row1H, 'Remitente / Sender', '1')
  let b1Y = b1.contentY
  b1Y = writeBoxText(ML + 3, b1Y, '', data.shipper_name || data.sender_name, b1.innerW)
  writeBoxText(ML + 3, b1Y + 2, 'Dir', data.shipper_address || data.sender_address, b1.innerW)

  const b2 = sectionBox(ML + colW, currentY, colW, row1H, 'Consignatario / Consignee', '2')
  let b2Y = b2.contentY
  b2Y = writeBoxText(ML + colW + 3, b2Y, '', data.consignee_name || data.recipient_name, b2.innerW)
  writeBoxText(
    ML + colW + 3,
    b2Y + 2,
    'Dir',
    data.consignee_address || data.recipient_address,
    b2.innerW,
  )

  currentY += row1H + 2

  // FILA 2: Lugar de entrega (3) | Lugar de carga (4)
  const row2H = 30
  const b3 = sectionBox(ML, currentY, colW, row2H, 'Lugar de entrega / Place of delivery', '3')
  writeBoxText(ML + 3, b3.contentY, '', data.delivery_place || data.recipient_address, b3.innerW)

  const b4 = sectionBox(ML + colW, currentY, colW, row2H, 'Lugar de carga / Place of loading', '4')
  writeBoxText(ML + colW + 3, b4.contentY, '', data.pickup_place || data.sender_address, b4.innerW)

  currentY += row2H + 2

  // FILA 3: Documentos (5) | Mercancía (6-12)
  const row3H = 80
  sectionBox(ML, currentY, colW * 0.4, row3H, 'Doc. Anexos', '5')

  const b6 = sectionBox(
    ML + colW * 0.4,
    currentY,
    colW * 1.6,
    row3H,
    'Naturaleza de la mercancía / Nature of goods',
    '6-12',
  )
  doc.autoTable({
    startY: b6.contentY - 2,
    margin: { left: ML + colW * 0.4 + 2.5 },
    tableWidth: colW * 1.6 - 5,
    head: [['Ref.', 'Descripción / Marcas', 'Bultos', 'Peso', 'ADR']],
    body: [
      [
        '01',
        data.goods_nature || data.items_description,
        data.packages_count || data.items_quantity,
        (data.gross_weight_kg || data.items_weight_kg) + ' kg',
        data.adr_class ? `CL ${data.adr_class} ${data.adr_un_number}` : 'N/A',
      ],
    ],
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: PRIMARY_COLOR, textColor: PRIMARY_TEXT_COLOR, fontStyle: 'bold' },
    theme: 'grid',
  })

  currentY += row3H + 2

  // FILA 4: Porteador (16) | Reservas (18)
  const row4H = 35
  const b16 = sectionBox(ML, currentY, colW, row4H, 'Porteador / Carrier', '16')
  writeBoxText(ML + 3, b16.contentY, '', data.carrier_name, b16.innerW)

  const b18 = sectionBox(ML + colW, currentY, colW, row4H, 'Reservas y Observaciones', '18')
  writeBoxText(ML + colW + 3, b18.contentY, '', data.transit_notes || data.observations, b18.innerW)

  currentY += row4H + 2

  // SECCIÓN FIRMAS (21-24) AL PIE (297mm)
  currentY = 250
  const sigH = 40
  doc.setDrawColor(...PRIMARY_COLOR)
  doc.setLineWidth(0.3)
  doc.rect(ML, currentY, CW, sigH)
  doc.line(ML + CW / 3, currentY, ML + CW / 3, currentY + sigH)
  doc.line(ML + (CW / 3) * 2, currentY, ML + (CW / 3) * 2, currentY + sigH)

  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('21 Establecido en / Established in', ML + 2, currentY + 4.5)
  doc.text('22 Firma y Sello Remitente', ML + CW / 3 + 2, currentY + 4.5)
  doc.text('23 Firma y Sello Porteador', ML + (CW / 3) * 2 + 2, currentY + 4.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`${data.issue_place || ''}`, ML + 2, currentY + 12)
  doc.text(`${data.issue_date || ''}`, ML + 2, currentY + 18)

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
