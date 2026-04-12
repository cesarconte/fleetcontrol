/**
 * FleetControl — Documento de Transporte ADR
 *
 * Generates the mandatory ADR transport document (Carta de Porte ADR)
 * according to RD 97/2014 and ADR 2025.
 */

import { jsPDF } from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
applyPlugin(jsPDF)

import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'
import { saveDocumentRecord } from './api-documents-persistence.js'

const STORAGE_BUCKET = 'transport-documents'
const PW = 210
const ML = 10
const MR = 10
const MT = 10
const CW = PW - ML - MR
const PRIMARY_COLOR = [245, 124, 0] // Corporate Orange
const PRIMARY_TEXT_COLOR = [255, 255, 255]

export async function generateAdrDocument({ routeId, cargoId }) {
  const { route, vehicle, driver, company, cargo } = await fetchDocumentData(routeId, cargoId)
  const mappedData = mapAdrFields({ route, vehicle, driver, company, cargo })
  const docNumber = `ADR/${new Date().getFullYear()}/${Date.now().toString().slice(-5)}`
  const doc = renderAdrPdf(mappedData, docNumber)
  const filename = `adr_${routeId.slice(0, 8)}_${Date.now()}.pdf`
  const url = await uploadToStorage(routeId, filename, doc)
  const docRecord = await saveDocumentRecord({
    routeId,
    cargoId,
    docNumber,
    filename,
    url,
    type: 'adr',
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

function mapAdrFields({ route, vehicle, driver, company, cargo }) {
  let formattedDate = ''
  if (route.departure_date) {
    const d = new Date(route.departure_date)
    formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }

  return {
    route,
    vehicle,
    driver,
    company,
    cargo,
    issue_date: formattedDate,
    un_number: cargo?.adr_un_number || 'UN 1202',
    proper_shipping_name: cargo?.description || 'GASÓLEO',
    adr_class: cargo?.adr_class || '3',
    packing_group: cargo?.adr_packing_group || 'III',
    tunnel_code: cargo?.tunnel_code || '(D/E)',
    quantity: cargo?.weight_kg || '0',
    sender: company?.company_name || 'FleetControl S.L.',
    consignee: cargo?.consignee_name || cargo?.cmr_recipient || 'S/N',
  }
}

async function uploadToStorage(routeId, filename, doc) {
  const pdfBlob = doc.output('arraybuffer')
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(`${routeId}/${filename}`, new Uint8Array(pdfBlob), { contentType: 'application/pdf' })
  if (error) throw error
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(`${routeId}/${filename}`).data.publicUrl
}

export function renderAdrPdf(data, docNumber) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MT

  // ── CABECERA ──────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(ML, y, CW, 14, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRIMARY_TEXT_COLOR)
  doc.text('CARTA DE PORTE PARA MERCANCÍAS PELIGROSAS (A.D.R.)', ML + CW / 2, y + 6, {
    align: 'center',
  })
  doc.setFontSize(8)
  doc.text('REAL DECRETO 97/2014 — ACUERDO ADR 2025', ML + CW / 2, y + 11, { align: 'center' })

  doc.setFontSize(9)
  doc.text(`Nº ${docNumber}`, PW - MR - 4, y + 6, { align: 'right' })
  doc.setTextColor(0)
  y += 20

  // ── HELPERS ──────────────────────────────────────────────────
  function sectionBox(x, yp, w, h, title) {
    doc.setDrawColor(...PRIMARY_COLOR)
    doc.setLineWidth(0.3)
    doc.rect(x, yp, w, h)
    doc.setFillColor(...PRIMARY_COLOR)
    doc.rect(x, yp, w, 4, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PRIMARY_TEXT_COLOR)
    doc.text(title.toUpperCase(), x + 2, yp + 3)
    doc.setTextColor(0)
    return { contentY: yp + 8, innerW: w - 4 }
  }

  function writeBoxText(x, yp, label, value, maxWidth) {
    doc.setFontSize(8)
    const lineH = 4.5
    let curY = yp
    doc.setFont('helvetica', 'bold')
    const lbl = label ? label + ': ' : ''
    const labelW = doc.getTextWidth(lbl)
    doc.text(lbl, x, curY)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(String(value || ''), maxWidth - labelW)
    lines.forEach((line, i) => {
      doc.text(line, x + (i === 0 ? labelW : 0), curY)
      curY += lineH
    })
    return curY
  }

  // ── EXPEDIDOR / DESTINATARIO ────────────────────────────────
  const colW = (CW - 5) / 2

  const b1 = sectionBox(ML, y, colW, 40, '1. EXPEDIDOR')
  let b1Y = b1.contentY
  b1Y = writeBoxText(
    ML + 2,
    b1Y,
    'Nombre/Razón Social',
    data.sender || 'FleetControl S.L.',
    b1.innerW,
  )
  b1Y = writeBoxText(
    ML + 2,
    b1Y + 2,
    'Dirección',
    data.company?.address || 'Calle Central 1, Madrid',
    b1.innerW,
  )
  writeBoxText(
    ML + 2,
    b1Y + 2,
    'C.P. / Población',
    `${data.company?.zip || '28001'} ${data.company?.city || 'Madrid'}`,
    b1.innerW,
  )

  const b2 = sectionBox(ML + colW + 5, y, colW, 40, '2. DESTINATARIO')
  let b2Y = b2.contentY
  b2Y = writeBoxText(ML + colW + 7, b2Y, 'Nombre/Razón Social', data.consignee, b2.innerW)
  b2Y = writeBoxText(
    ML + colW + 7,
    b2Y + 2,
    'Dirección',
    data.cargo?.delivery_address || 'S/D',
    b2.innerW,
  )
  writeBoxText(
    ML + colW + 7,
    b2Y + 2,
    'C.P. / Población',
    `${data.cargo?.delivery_zip || ''} ${data.cargo?.delivery_city || ''}`,
    b2.innerW,
  )

  y += 48

  // ── DESCRIPCIÓN DE LA MERCANCÍA ───────────────────────────
  const b3 = sectionBox(ML, y, CW, 120, '3. DESCRIPCIÓN DE LAS MERCANCÍAS PELIGROSAS')
  let b3Y = b3.contentY
  const fullDesc = `${data.un_number}, ${data.proper_shipping_name}, ${data.adr_class}, ${data.packing_group}, ${data.tunnel_code}`

  // Header para la tabla de ADR
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('Descripción oficial del transporte (ADR)', ML + 2, b3Y)
  doc.text('Cant. total', PW - MR - 25, b3Y)

  doc.setDrawColor(200)
  doc.line(ML + 2, b3Y + 2, PW - MR - 2, b3Y + 2)
  b3Y += 8

  doc.setFont('helvetica', 'normal')
  doc.text(fullDesc, ML + 2, b3Y)
  doc.text(`${data.quantity} kg`, PW - MR - 25, b3Y)

  y += 128

  // ── VEHÍCULO / TRANSPORTE ───────────────────────────────
  const b4 = sectionBox(ML, y, CW, 20, '4. INFORMACIÓN DEL TRANSPORTE')
  writeBoxText(ML + 2, b4.contentY, 'Matrícula Vehículo', data.vehicle?.plate, 60)
  writeBoxText(ML + 80, b4.contentY, 'Conductor', data.driver?.full_name, 100)

  // ── DECLARACIÓN ──────────────────────────────────────────
  y = 245
  doc.setFontSize(7.5)
  const declLines = doc.splitTextToSize(
    'DECLARACIÓN: El expedidor declara bajo su responsabilidad que el contenido de este envío está plenamente y exactamente descrito por su designación oficial de transporte y que está clasificado, embalado, marcado y etiquetado y se encuentra en condiciones adecuadas para ser transportado por carretera de acuerdo con las disposiciones del ADR.',
    CW,
  )
  doc.text(declLines, ML, y)

  // ── FIRMAS ──────────────────────────────────────────────
  y = 265
  const sigW = (CW - 10) / 2

  doc.setDrawColor(0)
  doc.setLineWidth(0.2)

  doc.line(ML, y, ML + sigW, y)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('Firma del Expedidor', ML, y + 5)

  doc.line(ML + sigW + 10, y, ML + sigW * 2 + 10, y)
  doc.text('Firma del Transportista / Conductor', ML + sigW + 10, y + 5)

  // Footer page number
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  doc.text('Página 1 de 1', PW / 2, 290, { align: 'center' })

  return doc
}
