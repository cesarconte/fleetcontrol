/**
 * FleetControl — Carta de Porte Nacional Document Service
 *
 * Generates Carta de Porte Nacional PDF according to the official model
 * (Orden FOM/2861/2012, BOE 5 enero 2013).
 *
 * Layout matches the official 24-section form used in Spanish road freight.
 *
 * @see Orden FOM/2861/2012
 * @see Ley 15/2009 (LCTTM) arts. 10-12
 */

import { jsPDF } from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'

applyPlugin(jsPDF)

import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'
import { saveDocumentRecord } from './api-documents-persistence.js'

const STORAGE_BUCKET = 'transport-documents'
const PW = 210 // A4 width mm
const ML = 10 // left margin mm
const MR = 10 // right margin mm
const MT = 8 // top margin mm
const CW = PW - ML - MR // content width = 190mm
const PRIMARY_COLOR = [245, 124, 0] // #F57C00
const PRIMARY_TEXT_COLOR = [255, 255, 255] // #FFFFFF

const NACIONAL_REQUIRED_FIELDS = [
  'shipper_name',
  'shipper_nif',
  'carrier_name',
  'carrier_nif',
  'consignee_name',
  'issue_place',
  'issue_date',
  'loading_address',
  'delivery_address',
  'goods_nature',
  'gross_weight_kg',
  'packaging_type',
  'freight_price',
  'payment_terms',
]

export async function generateCartaPorteNacionalDocument({ routeId, cargoId }) {
  const { route, vehicle, driver, company, cargo } = await fetchDocumentData(routeId, cargoId)
  const mappedData = mapNacionalFields({ route, vehicle, driver, company, cargo })
  const validation = validateFields(mappedData, NACIONAL_REQUIRED_FIELDS)
  if (!validation.valid)
    throw new Error(`Campos obligatorios faltantes: ${validation.missing.join(', ')}`)
  const docNumber = generateDocumentNumber('CPN')
  const doc = renderNacionalPdf(mappedData, docNumber)
  const filename = `carta_porte_nacional_${routeId.slice(0, 8)}_${Date.now()}.pdf`
  const url = await uploadToStorage(routeId, filename, doc)
  const docRecord = await saveDocumentRecord({
    routeId,
    cargoId,
    docNumber,
    filename,
    url,
    type: 'carta_porte_nacional',
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

function mapNacionalFields({ route, vehicle, driver, cargo, company }) {
  return {
    shipper_name: company.company_name || '',
    shipper_nif: company.cif || '',
    shipper_address: company.address || '',
    shipper_city: company.city || '',
    shipper_province: company.province || '',
    shipper_phone: company.phone || '',
    carrier_name: company.company_name || '',
    carrier_nif: company.cif || '',
    carrier_address: company.address || '',
    carrier_transport_license: company.transport_license || '',
    consignee_name: cargo.consignee_name || cargo.cmr_recipient || '',
    consignee_nif: cargo.consignee_nif || '',
    consignee_address: cargo.consignee_address || cargo.cmr_delivery_place || '',
    consignee_city: cargo.consignee_city || route.destination_city || '',
    consignee_province: cargo.consignee_province || route.destination_province || '',
    consignee_phone: cargo.consignee_phone || '',
    issue_place: route.origin_city || company.city || '',
    issue_date: formatDateES(new Date()),
    loading_address: route.origin_address || route.origin_city || '',
    loading_date: formatDateES(route.departure_date),
    loading_time: route.departure_date ? extractTime(route.departure_date) : '',
    delivery_address: route.destination_address || route.destination_city || '',
    delivery_date: route.planned_arrival_date ? formatDateES(route.planned_arrival_date) : '',
    delivery_time_window: '',
    goods_nature: cargo.categoria_id || cargo.subcategoria_id || cargo.description || '',
    goods_description: cargo.description || '',
    packages_count: cargo.packages || '',
    gross_weight_kg: cargo.weight_kg || 0,
    net_weight_kg: cargo.weight_kg || 0,
    volume_m3: cargo.volume_m3 || '',
    adr_class: cargo.adr_class || '',
    adr_un_number: cargo.adr_un_number || '',
    temperature_required: '',
    packaging_type: cargo.packaging_type || '',
    pallet_count: cargo.pallet_count || '',
    seal_number: cargo.seal_number || '',
    container_number: cargo.container_number || '',
    marking_codes: cargo.marks_numbers || '',
    special_handling: cargo.special_handling || '',
    sealing_instructions: cargo.sealing_instructions || '',
    delivery_deadline: '',
    transit_notes: route.notes || '',
    declared_value: cargo.declared_value || '',
    insurance_company: company.insurance_company || '',
    insurance_policy_number: company.insurance_policy || '',
    coverage_limit: company.insurance_coverage_limit || '',
    freight_price: route.price || 0,
    fuel_surcharge: 0,
    toll_fees: 0,
    waiting_fees: 0,
    total_amount: route.price || 0,
    payment_terms: route.payment_terms || '',
    payment_method: '',
    shipper_signature: '',
    carrier_signature: '',
    consignee_signature: '',
    signature_date: formatDateES(new Date()),
    damage_notes: '',
    missing_packages: '',
    condition_notes: '',
    order_reference: cargo.order_reference || '',
    tms_reference: route.tms_reference || '',
    additional_notes: route.notes || '',
    vehicle_plate: vehicle.plate || '',
    vehicle_type: vehicle.vehicle_type || '',
    driver_name: driver.full_name || '',
    driver_license: driver.license_number || '',
    document_number: '',
  }
}

function formatDateES(dateStr) {
  if (!dateStr) return ''
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function extractTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
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
  return `${prefix}/${year}/${String(seq).padStart(5, '0')}`
}

function renderNacionalPdf(data, docNumber) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MT

  // ── 1. CABECERA OFICIAL ─────────────────────────────────────────
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.text('DOCUMENTO DE CONTROL DE LOS ENVÍOS DE TRANSPORTE PÚBLICO DE MERCANCÍAS', PW / 2, y, {
    align: 'center',
  })
  y += 4.5
  doc.setFontSize(6)
  doc.setTextColor(100, 100, 100)
  doc.text('Orden FOM/2861/2012 (BOE 5 enero 2013) — Ley 15/2009 (LCTTM) arts. 10-12', PW / 2, y, {
    align: 'center',
  })
  y += 6

  // Barra de título con número de documento destacado
  doc.setDrawColor(0)
  doc.setLineWidth(0.4)
  doc.line(ML, y, ML + CW, y)

  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(ML, y + 0.1, CW, 10, 'F')

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRIMARY_TEXT_COLOR)
  doc.text('CARTA DE PORTE NACIONAL (CPN)', ML + 3, y + 6.5)

  doc.setFontSize(10)
  doc.text(`Nº ${docNumber}`, PW - MR - 3, y + 6.5, { align: 'right' })

  y += 10.5
  doc.setLineWidth(0.2)
  doc.line(ML, y, ML + CW, y)
  y += 5

  // ── 2. HELPERS DE DIBUJO ────────────────────────────────────────

  function sectionBox(xPos, yPos, width, height, titleText, num) {
    doc.setDrawColor(120)
    doc.setLineWidth(0.2)
    doc.rect(xPos, yPos, width, height)

    // Header de casilla con color primario del proyecto
    doc.setFillColor(...PRIMARY_COLOR)
    doc.rect(xPos + 0.1, yPos + 0.1, width - 0.2, 5, 'F')

    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PRIMARY_TEXT_COLOR)
    const label = num ? `${num}  ${titleText}` : titleText
    doc.text(label.toUpperCase(), xPos + 2, yPos + 3.8)
    doc.setTextColor(0)

    return {
      contentY: yPos + 10,
      innerW: width - 5,
    }
  }

  function writeBoxText(x, yPos, label, value, maxWidth, size = 8) {
    doc.setFontSize(size)
    const lineH = size * 0.45
    let curY = yPos

    if (label && value) {
      doc.setFont('helvetica', 'bold')
      const lbl = label.endsWith(':') ? label : label + ':'
      const labelText = lbl + ' '
      const labelW = doc.getTextWidth(labelText)

      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(String(value), maxWidth - labelW)

      lines.forEach((line, i) => {
        if (i === 0) {
          doc.setFont('helvetica', 'bold')
          doc.text(labelText, x, curY)
          doc.setFont('helvetica', 'normal')
          doc.text(line, x + labelW, curY)
        } else {
          doc.text(line, x, curY)
        }
        curY += lineH
      })
    } else if (value) {
      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(String(value), maxWidth)
      lines.forEach(line => {
        doc.text(line, x, curY)
        curY += lineH
      })
    } else if (label) {
      doc.setFont('helvetica', 'bold')
      doc.text(label, x, curY)
      curY += lineH
    }

    return curY
  }

  // ── 3. LAYOUT DE 24 CASILLAS (DISTRIBUCIÓN POLISHED A4) ─────────
  const colLW = CW * 0.58
  const colRW = CW * 0.42
  const colRX = ML + colLW
  let currentY = y

  // FILA 1: Remitente (1) | Porteador (16)
  const row1H = 38
  const b1 = sectionBox(ML, currentY, colLW, row1H, 'REMITENTE / EXPEDIDOR', '1')
  let b1Y = b1.contentY
  b1Y = writeBoxText(ML + 3, b1Y, '', data.shipper_name, b1.innerW, 8.5)
  b1Y = writeBoxText(ML + 3, b1Y + 1, 'NIF/CIF', data.shipper_nif, b1.innerW, 8)
  writeBoxText(
    ML + 3,
    b1Y + 1,
    '',
    data.shipper_address + '\n' + data.shipper_city + ' (' + data.shipper_province + ')',
    b1.innerW,
    7.5,
  )

  const b16 = sectionBox(colRX, currentY, colRW, row1H, 'TRANSPORTISTA / PORTEADOR', '16')
  let b16Y = b16.contentY
  b16Y = writeBoxText(colRX + 3, b16Y, '', data.carrier_name, b16.innerW, 8.5)
  b16Y = writeBoxText(colRX + 3, b16Y + 1, 'NIF/CIF', data.carrier_nif, b16.innerW, 8)
  writeBoxText(
    colRX + 3,
    b16Y + 1,
    '',
    data.carrier_address + '\nLicencia: ' + (data.carrier_transport_license || '—'),
    b16.innerW,
    7.5,
  )
  currentY += row1H + 2

  // FILA 2: Consignatario (2) | Transportistas Sucesivos (17)
  const row2H = 35
  const b2 = sectionBox(ML, currentY, colLW, row2H, 'CONSIGNATARIO / DESTINATARIO', '2')
  let b2Y = b2.contentY
  b2Y = writeBoxText(ML + 3, b2Y, '', data.consignee_name, b2.innerW, 8.5)
  b2Y = writeBoxText(ML + 3, b2Y + 1, 'NIF/CIF', data.consignee_nif, b2.innerW, 8)
  writeBoxText(
    ML + 3,
    b2Y + 1,
    'Dirección',
    data.consignee_address + '\n' + data.consignee_city,
    b2.innerW,
    7.5,
  )

  const b17 = sectionBox(colRX, currentY, colRW, row2H, 'TRANSPORTISTAS SUCESIVOS', '17')
  writeBoxText(
    colRX + 3,
    b17.contentY,
    '',
    'A rellenar solo en caso de transbordos o sucesiones de transportistas.',
    b17.innerW,
    6.5,
  )
  currentY += row2H + 2

  // FILA 3: Lugar Entrega (3) | Reservas (18)
  const row3H = 22
  const b3 = sectionBox(ML, currentY, colLW, row3H, 'LUGAR DE ENTREGA DE LA MERCANCÍA', '3')
  let b3Y = b3.contentY
  b3Y = writeBoxText(ML + 3, b3Y, '', data.delivery_address, b3.innerW, 7.5)
  writeBoxText(ML + 3, b3Y + 1, 'Fecha prevista', data.delivery_date || '—', b3.innerW, 7)

  const b18 = sectionBox(
    colRX,
    currentY,
    colRW,
    row3H,
    'RESERVAS Y OBSERVACIONES DEL PORTEADOR',
    '18',
  )
  writeBoxText(
    colRX + 3,
    b18.contentY,
    '',
    data.condition_notes || 'Sin observaciones al momento de la carga.',
    b18.innerW,
    6.5,
  )
  currentY += row3H + 2

  // FILA 4: TABLA MERCANCÍAS (AMPLIADA 6-12)
  const tableY = currentY
  const tableH = 75 // Expanded vertical space
  doc.setDrawColor(120)
  doc.rect(ML, tableY, CW, tableH)
  const tableHeaders = [
    '6 Marca/Núm',
    '7 N. Bultos',
    '8 Embalaje',
    '9 Naturaleza de la mercancía',
    '10 N. Estad',
    '11 Peso (kg)',
    '12 Vol m3',
  ]
  const tableCols = [25, 15, 20, 75, 15, 22, 18]
  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(ML, tableY, CW, 5.5, 'F')
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRIMARY_TEXT_COLOR)
  let curTX = ML
  tableHeaders.forEach((th, i) => {
    doc.rect(curTX, tableY, tableCols[i], 5.5)
    doc.text(th, curTX + 1.5, tableY + 4)
    curTX += tableCols[i]
  })
  doc.setTextColor(0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  const goodsStr =
    (data.goods_nature || '') + (data.goods_description ? '\n' + data.goods_description : '')
  const rowData = [
    data.marking_codes || '—',
    String(data.packages_count || '—'),
    data.packaging_type || '—',
    goodsStr,
    '—',
    String(data.gross_weight_kg),
    data.volume_m3 || '—',
  ]
  curTX = ML
  rowData.forEach((val, i) => {
    doc.rect(curTX, tableY + 5.5, tableCols[i], tableH - 5.5)
    const lines = doc.splitTextToSize(val, tableCols[i] - 3)
    doc.text(lines, curTX + 1.5, tableY + 11)
    curTX += tableCols[i]
  })
  currentY += tableH + 4

  // FILA PAGO: Pago (14) y Precio (20)
  const rowPayH = 35
  const b14 = sectionBox(ML, currentY, colLW, rowPayH, 'FORMA DE PAGO Y REEMBOLSO', '14-15')
  writeBoxText(
    ML + 3,
    b14.contentY,
    'Condiciones',
    data.payment_terms || 'Porte Pagado',
    b14.innerW,
    8,
  )
  writeBoxText(ML + 3, b14.contentY + 10, 'Reembolso', '—', b14.innerW, 8)

  const b20 = sectionBox(colRX, currentY, colRW, rowPayH, 'PRECIO DEL TRANSPORTE', '20')
  doc.autoTable({
    startY: b20.contentY - 2.5,
    head: [['Concepto', 'Total EUR']],
    body: [
      ['Porte / Flete', `${Number(data.freight_price).toFixed(2)}`],
      ['Combustible', `${Number(data.fuel_surcharge).toFixed(2)}`],
      [
        { content: 'TOTAL', styles: { fontStyle: 'bold' } },
        { content: `${Number(data.total_amount).toFixed(2)}`, styles: { fontStyle: 'bold' } },
      ],
    ],
    styles: { fontSize: 7, cellPadding: 1.5, lineWidth: 0.1 },
    headStyles: { fillColor: PRIMARY_COLOR, textColor: PRIMARY_TEXT_COLOR },
    margin: { left: colRX + 1 },
    tableWidth: colRW - 2,
    theme: 'grid',
  })
  currentY += rowPayH + 4

  // ── 8. FIRMAS AL PIE (Ajustadas a 297mm) ───────────────────────
  currentY = 250 // Signatures clearly at the bottom
  const sigH = 40
  doc.setDrawColor(...PRIMARY_COLOR)
  doc.setLineWidth(0.3)
  doc.rect(ML, currentY, CW, sigH)

  // Dibujar 3 columnas para firmas
  doc.line(ML + CW / 3, currentY, ML + CW / 3, currentY + sigH)
  doc.line(ML + (CW / 3) * 2, currentY, ML + (CW / 3) * 2, currentY + sigH)

  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('21 ESTABLECIDO EN / ISSUED AT', ML + 3, currentY + 5)
  doc.text('22 FIRMA REMITENTE', ML + CW / 3 + 3, currentY + 5)
  doc.text('23 FIRMA TRANSPORTISTA', ML + (CW / 3) * 2 + 3, currentY + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.text(`${data.issue_place || '—'}`, ML + 3, currentY + 14)
  doc.text(`${data.issue_date || '—'}`, ML + 3, currentY + 22)

  // Subtítulos para firmas
  doc.setFontSize(6)
  doc.text('FIRMA / SELLO', ML + CW / 3 + 3, currentY + sigH - 4)
  doc.text('FIRMA / SELLO / DNI', ML + (CW / 3) * 2 + 3, currentY + sigH - 4)

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
