/**
 * FleetControl — Certificado de Entrega (POD) Document Service
 *
 * Generates Proof of Delivery (POD) PDF according to LCTTM.
 *
 * @see LCTTM (Ley 15/2009)
 */

import { jsPDF } from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
applyPlugin(jsPDF)

import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'
import { saveDocumentRecord } from './api-documents-persistence.js'

const STORAGE_BUCKET = 'transport-documents'

const POD_REQUIRED_FIELDS = ['recipient_name', 'delivery_date', 'cargo_description']

export async function generatePodDocument({ routeId, cargoId }) {
  const { route, vehicle, driver, company, cargo } = await fetchDocumentData(routeId, cargoId)
  const mappedData = mapPodFields({ route, vehicle, driver, company, cargo })
  const validation = validateFields(mappedData, POD_REQUIRED_FIELDS)
  if (!validation.valid)
    throw new Error(`Campos obligatorios faltantes: ${validation.missing.join(', ')}`)
  const docNumber = generateDocumentNumber('POD')
  const doc = renderPodPdf(mappedData, docNumber)
  const filename = `pod_${routeId.slice(0, 8)}_${Date.now()}.pdf`
  const url = await uploadToStorage(routeId, filename, doc)

  const docRecord = await saveDocumentRecord({
    routeId,
    cargoId,
    docNumber,
    filename,
    url,
    type: 'pod',
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

function mapPodFields({ route, vehicle, driver, _company, cargo }) {
  let formattedDate = ''
  if (route.departure_date) {
    const d = new Date(route.departure_date)
    formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }

  return {
    recipient_name: cargo.cmr_recipient || cargo.consignee_name || '',
    recipient_signature: '',
    delivery_date: formattedDate,
    delivery_time: route.departure_time || '',
    cargo_description: cargo.description || '',
    cargo_condition: cargo.cargo_condition || 'Buen estado',
    observations: route.notes || '',
    vehicle_plate: vehicle.plate || '',
    driver_name: driver.full_name || '',
    delivery_address: cargo.cmr_delivery_place || route.destination_city || '',
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
const ML = 15
const MR = 15
const MT = 15
const CW = PW - ML - MR
const PRIMARY_COLOR = [245, 124, 0]
const PRIMARY_TEXT_COLOR = [255, 255, 255]

function renderPodPdf(data, docNumber) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MT

  // ── CABECERA ───────────────────────────────────────
  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(ML, y, CW, 15, 'F')
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRIMARY_TEXT_COLOR)
  doc.text('COMPROBANTE DE ENTREGA (P.O.D.)', ML + 5, y + 10)

  doc.setFontSize(10)
  doc.text(`Nº ${docNumber}`, PW - MR - 5, y + 10, { align: 'right' })
  doc.setTextColor(0)
  y += 25

  // ── Helpers ───────────────────────────────────────
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

  // ── Detalles de la Entrega (AMPLIADO) ──────────────
  const b1H = 65
  const b1 = sectionBox(ML, y, CW, b1H, 'DETALLES DE LA ENTREGA Y RECEPCIÓN')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  let b1Y = b1.contentY

  const labelX = ML + 5
  const valueX = ML + 45
  const lineH = 8

  const fields = [
    ['DESTINATARIO', data.recipient_name],
    ['DIRECCIÓN', data.delivery_address],
    ['MERCANCÍA', data.cargo_description],
    ['CANTIDAD', data.items_quantity || '1 bulto'],
    ['FECHA/HORA', `${data.delivery_date} ${data.delivery_time}`],
    ['ESTADO', data.cargo_condition],
  ]

  fields.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label + ':', labelX, b1Y)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(String(value || 'S/N'), b1.innerW - 40)
    doc.text(lines, valueX, b1Y)
    b1Y += lines.length * lineH - (lines.length > 1 ? 2 : 0)
  })

  y += b1H + 15

  // ── Observaciones (Centro) ────────────────────────
  const b2H = 40
  const b2 = sectionBox(ML, y, CW, b2H, 'OBSERVACIONES E INCIDENCIAS')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const obs =
    data.observations || 'Bultos recibidos en aparente buen estado y sin reservas externas.'
  doc.text(obs, ML + 5, b2.contentY, { maxWidth: b2.innerW })

  y += b2H + 20

  // ── FIRMAS AL PIE (Ajustadas a 297mm) ─────────────
  y = 265
  const lineW = (CW - 20) / 2
  doc.setLineWidth(0.2)
  doc.setDrawColor(100)

  doc.line(ML, y, ML + lineW, y)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Firma del Transportista (Entrega)', ML, y + 5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.text(`Nombre: ${data.driver_name}`, ML, y + 9)

  doc.line(PW - MR - lineW, y, PW - MR, y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text('Firma y Sello del Receptor', PW - MR - lineW, y + 5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.text('Fecha: ____/____/202_', PW - MR - lineW, y + 9)

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
