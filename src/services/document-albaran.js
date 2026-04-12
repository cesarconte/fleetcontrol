/**
 * FleetControl — Albarán de Entrega Document Service
 *
 * Generates Albarán de Entrega PDF according to UNE 56100.
 *
 * @see UNE 56100
 */

import { jsPDF } from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
applyPlugin(jsPDF)

import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'
import { saveDocumentRecord } from './api-documents-persistence.js'

const STORAGE_BUCKET = 'transport-documents'

const ALBARAN_REQUIRED_FIELDS = ['sender_name', 'recipient_name', 'delivery_date']

export async function generateAlbaranDocument({ routeId, cargoId }) {
  const { route, vehicle, driver, company, cargo } = await fetchDocumentData(routeId, cargoId)
  const mappedData = mapAlbaranFields({ route, vehicle, driver, company, cargo })
  const validation = validateFields(mappedData, ALBARAN_REQUIRED_FIELDS)
  if (!validation.valid)
    throw new Error(`Campos obligatorios faltantes: ${validation.missing.join(', ')}`)
  const docNumber = generateDocumentNumber('ALB')
  const doc = renderAlbaranPdf(mappedData, docNumber)
  const filename = `albaran_${routeId.slice(0, 8)}_${Date.now()}.pdf`
  const url = await uploadToStorage(routeId, filename, doc)
  const docRecord = await saveDocumentRecord({
    routeId,
    cargoId,
    docNumber,
    filename,
    url,
    type: 'albaran',
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

function mapAlbaranFields({ route, vehicle, driver, company, cargo }) {
  let formattedDate = ''
  if (route.departure_date) {
    const d = new Date(route.departure_date)
    formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }

  return {
    sender_name: company.company_name || 'FleetControl S.L.',
    sender_address: company.address || '',
    sender_tax_id: company.cif || '',
    recipient_name: cargo.cmr_recipient || cargo.consignee_name || '',
    recipient_address:
      cargo.cmr_delivery_place || route.destination_address || route.destination_city || '',
    delivery_date: formattedDate,
    delivery_time: route.departure_time || '',
    items_description: cargo.description || '',
    items_quantity: cargo.packages || '',
    items_weight_kg: cargo.weight_kg || '',
    observations: route.notes || '',
    signature: '',
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
  const seq = String(Date.now()).slice(-5)
  return `${prefix}/${year}/${seq}`
}

const PW = 210
const ML = 10
const MR = 10
const MT = 10
const CW = PW - ML - MR
const PRIMARY_COLOR = [245, 124, 0]
const PRIMARY_TEXT_COLOR = [255, 255, 255]

function renderAlbaranPdf(data, docNumber) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MT

  // ── Caballera ──────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(ML, y, CW, 15, 'F')
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRIMARY_TEXT_COLOR)
  doc.text('ALBARÁN DE ENTREGA', ML + 5, y + 10)

  doc.setFontSize(10)
  doc.text(`Nº ${docNumber}`, PW - MR - 5, y + 10, { align: 'right' })
  doc.setTextColor(0)
  y += 25

  // ── Helpers ──────────────────────────────────────────────────
  function sectionBox(xPos, yPos, width, height, titleText) {
    doc.setDrawColor(...PRIMARY_COLOR)
    doc.setLineWidth(0.3)
    doc.rect(xPos, yPos, width, height)
    doc.setFillColor(...PRIMARY_COLOR)
    doc.rect(xPos, yPos, width, 6, 'F')
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PRIMARY_TEXT_COLOR)
    doc.text(titleText.toUpperCase(), xPos + 3, yPos + 4.2)
    doc.setTextColor(0)
    return { contentY: yPos + 11, innerW: width - 6 }
  }

  function writeBoxText(x, yPos, label, value, maxWidth) {
    doc.setFontSize(9)
    const lineH = 5
    let curY = yPos
    doc.setFont('helvetica', 'bold')
    const lbl = label ? (label.endsWith(':') ? label : label + ':') + ' ' : ''
    const labelW = doc.getTextWidth(lbl)
    doc.text(lbl, x, curY)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(String(value || 'S/N'), maxWidth - labelW)
    lines.forEach((line, i) => {
      doc.text(line, x + (i === 0 ? labelW : 0), curY)
      curY += lineH
    })
    return curY
  }

  // ── Datos Principales ─────────────────────────────────────────
  const colW = (CW - 10) / 2

  const b1H = 35
  const b1 = sectionBox(ML, y, colW, b1H, 'EMISOR / REMITENTE')
  let b1Y = b1.contentY
  b1Y = writeBoxText(ML + 3, b1Y, '', data.sender_name, b1.innerW)
  b1Y = writeBoxText(ML + 3, b1Y + 2, 'CIF', data.sender_tax_id, b1.innerW)
  writeBoxText(ML + 3, b1Y + 2, 'Dirección', data.sender_address, b1.innerW)

  const b2 = sectionBox(ML + colW + 10, y, colW, b1H, 'CLIENTE / DESTINATARIO')
  let b2Y = b2.contentY
  b2Y = writeBoxText(ML + colW + 13, b2Y, '', data.recipient_name, b2.innerW)
  writeBoxText(ML + colW + 13, b2Y + 2, 'Dirección', data.recipient_address, b2.innerW)

  y += b1H + 5

  const b3Height = 20
  const b3 = sectionBox(ML, y, CW, b3Height, 'DATOS DEL TRANSPORTE')
  let b3Y = b3.contentY
  writeBoxText(ML + 3, b3Y, 'Vehículo', data.vehicle_plate, 60)
  writeBoxText(ML + 75, b3Y, 'Conductor', data.driver_name, 65)
  writeBoxText(ML + 145, b3Y, 'Fecha', data.delivery_date, 40)

  y += b3Height + 5

  // ── Tabla de Mercancía ─────────────────────────────
  const bodyRows = [
    ['01', data.items_description, '1', String(data.items_quantity), String(data.items_weight_kg)],
  ]
  for (let i = 2; i <= 10; i++) {
    bodyRows.push([String(i).padStart(2, '0'), '', '', '', ''])
  }

  doc.autoTable({
    startY: y,
    head: [['Ref.', 'Descripción de la Mercancía', 'Cant.', 'Bultos', 'Peso (kg)']],
    body: bodyRows,
    styles: { fontSize: 8.5, cellPadding: 3.5 },
    headStyles: { fillColor: PRIMARY_COLOR, textColor: PRIMARY_TEXT_COLOR, fontStyle: 'bold' },
    margin: { left: ML, right: MR },
    tableWidth: CW,
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 80 },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
    },
    theme: 'grid',
  })

  y = doc.lastAutoTable.finalY + 5

  // ── Observaciones ────────────────────────────────────────────
  const b4H = 20
  const b4 = sectionBox(ML, y, CW, b4H, 'OBSERVACIONES Y RESERVAS')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const obsLines = doc.splitTextToSize(
    data.observations || 'Bultos recibidos en aparente buen estado.',
    b4.innerW,
  )
  doc.text(obsLines, ML + 3, b4.contentY)

  // ── FIRMAS AL PIE ─────────────────────────
  // Colocamos las firmas de manera relativa, dejando un hueco de 5mm debajo de observaciones
  y = y + b4H + 5

  const signW = (CW - 10) / 2
  const signH = 25

  // Caja de firma del transportista
  const b5 = sectionBox(ML, y, signW, signH, 'CONFORMIDAD (TRANSPORTISTA)')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Firma y Sello:', ML + 3, b5.contentY)
  doc.text('Fecha: ____/____/202_', ML + 3, y + signH - 3)

  // Caja de firma del receptor
  const b6 = sectionBox(ML + signW + 10, y, signW, signH, 'RECIBÍ DE CONFORMIDAD (DESTINATARIO)')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Firma y Sello:', ML + signW + 13, b6.contentY)
  doc.text('Fecha: ____/____/202_', ML + signW + 13, y + signH - 3)

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
