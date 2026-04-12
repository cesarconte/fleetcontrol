/**
 * FleetControl — Documento de Control Administrativo (España)
 *
 * Generates the mandatory "Documento de Control" for road freight in Spain
 * according to Orden FOM/2861/2012.
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

export async function generateControlDocument({ routeId, cargoId }) {
  const { route, vehicle, driver, company, cargo } = await fetchDocumentData(routeId, cargoId)
  const mappedData = mapControlFields({ route, vehicle, driver, company, cargo })
  const docNumber = `CTRL/${new Date().getFullYear()}/${Date.now().toString().slice(-5)}`
  const doc = renderControlPdf(mappedData, docNumber)
  const filename = `control_${routeId.slice(0, 8)}_${Date.now()}.pdf`
  const url = await uploadToStorage(routeId, filename, doc)
  const docRecord = await saveDocumentRecord({
    routeId,
    cargoId,
    docNumber,
    filename,
    url,
    type: 'documento_control',
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
  }
  return {
    route: route ?? {},
    vehicle: vehicleResult.data ?? {},
    driver: driverResult.data ?? {},
    company: companyResult.data ?? {},
    cargo: cargo ?? {},
  }
}

function mapControlFields({ route, vehicle, driver, company, cargo }) {
  return {
    route,
    company,
    cargo,
    vehicle_plate: vehicle.plate || '',
    driver_name: driver.full_name || '',
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

function renderControlPdf(data, docNumber) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MT

  // ── CABECERA ──────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(ML, y, CW, 15, 'F')
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRIMARY_TEXT_COLOR)
  doc.text('DOCUMENTO DE CONTROL ADMINISTRATIVO', ML + 5, y + 10)

  doc.setFontSize(10)
  doc.text(`Nº ${docNumber}`, PW - MR - 5, y + 10, { align: 'right' })
  doc.setTextColor(0)
  y += 25

  // ── HELPERS ──────────────────────────────────────────────────
  function sectionBox(x, yp, w, h, title) {
    doc.setDrawColor(...PRIMARY_COLOR)
    doc.setLineWidth(0.3)
    doc.rect(x, yp, w, h)
    doc.setFillColor(...PRIMARY_COLOR)
    doc.rect(x, yp, w, 6, 'F')
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PRIMARY_TEXT_COLOR)
    doc.text(title.toUpperCase(), x + 3, yp + 4.2)
    doc.setTextColor(0)
    return { contentY: yp + 11, innerW: w - 6 }
  }

  function writeBoxText(x, yp, label, value, maxWidth) {
    doc.setFontSize(9)
    const lineH = 5
    let curY = yp
    doc.setFont('helvetica', 'bold')
    const lbl = label ? label + ': ' : ''
    const labelW = doc.getTextWidth(lbl)
    doc.text(lbl, x, curY)
    doc.setFont('helvetica', 'normal')
    const valStr = String(value || 'S/N')
    const lines = doc.splitTextToSize(valStr, maxWidth - labelW)
    lines.forEach((line, i) => {
      doc.text(line, x + (i === 0 ? labelW : 0), curY)
      curY += lineH
    })
    return curY
  }

  // ── DATOS CARGADOR / PORTEADOR ────────────────────────────────
  const colW = (CW - 10) / 2

  const b1 = sectionBox(ML, y, colW, 40, 'CARGADOR CONTRACTUAL')
  let b1Y = b1.contentY
  b1Y = writeBoxText(ML + 3, b1Y, '', data.company?.company_name, b1.innerW)
  writeBoxText(ML + 3, b1Y + 2, 'NIF', data.company?.cif, b1.innerW)

  const b2 = sectionBox(ML + colW + 10, y, colW, 40, 'PORTEADOR EFECTIVO')
  let b2Y = b2.contentY
  b2Y = writeBoxText(ML + colW + 13, b2Y, '', data.company?.company_name, b2.innerW)
  writeBoxText(ML + colW + 13, b2Y + 2, 'NIF', data.company?.cif, b2.innerW)

  y += 50

  // ── ORIGEN / DESTINO ──────────────────────────────────────────
  const b3 = sectionBox(ML, y, colW, 30, 'ORIGEN DE LA CARGA')
  let b3Y = b3.contentY
  b3Y = writeBoxText(ML + 3, b3Y, 'Lugar', data.route?.origin_city, b3.innerW)
  writeBoxText(ML + 3, b3Y + 1, 'Fecha', data.route?.departure_date, b3.innerW)

  const b4 = sectionBox(ML + colW + 10, y, colW, 30, 'DESTINO DE LA CARGA')
  let b4Y = b4.contentY
  b4Y = writeBoxText(ML + colW + 13, b4Y, 'Lugar', data.route?.destination_city, b4.innerW)
  writeBoxText(ML + colW + 13, b4Y + 1, 'Fecha', data.route?.arrival_date, b4.innerW)

  y += 40

  // ── MERCANCÍA (AMPLIADA) ──────────────────────────────────────
  const b5Height = 90
  const b5 = sectionBox(ML, y, CW, b5Height, 'NATURALEZA Y PESO DE LA MERCANCÍA')
  let b5Y = b5.contentY
  b5Y = writeBoxText(
    ML + 3,
    b5Y,
    'Naturaleza de la Mercancía',
    data.cargo?.description || 'Carga general de mercancías por carretera.',
    b5.innerW,
  )
  b5Y += 8
  b5Y = writeBoxText(ML + 3, b5Y, 'Peso Bruto (kg)', data.cargo?.weight_kg || '—', b5.innerW)
  b5Y += 8
  writeBoxText(
    ML + 3,
    b5Y,
    'Otras observaciones',
    data.cargo?.notes ||
      (data.cargo?.adr_class
        ? `Mercancía ADR Clase ${data.cargo.adr_class}`
        : 'Sin requisitos especiales.'),
    b5.innerW,
  )

  y += b5Height + 10

  // ── VEHÍCULO / CONDUCTOR ─────────────────────────────────────
  const b6 = sectionBox(ML, y, CW, 20, 'IDENTIFICACIÓN DEL VEHÍCULO Y CONDUCTOR')
  let b6Y = b6.contentY
  writeBoxText(ML + 3, b6Y, 'Matrícula', data.vehicle_plate, 60)
  writeBoxText(ML + 100, b6Y, 'Conductor', data.driver_name, 80)

  // ── FIRMAS AL PIE (Ajustadas a 297mm) ─────────────────────────
  // Queremos que el margen inferior sea igual al superior (MT=15)
  // 297 - 15 = 282mm (línea final de texto sugerida)

  y = 265 // Inicio sección de firmas

  const lineW = (CW - 20) / 2
  doc.setLineWidth(0.2)
  doc.setDrawColor(100)

  // Línea Izquierda
  doc.line(ML, y, ML + lineW, y)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('Firma y Sello del Cargador', ML, y + 5)

  // Línea Derecha
  doc.line(PW - MR - lineW, y, PW - MR, y)
  doc.text('Firma y Sello del Porteador', PW - MR - lineW, y + 5)

  // Nota Legal al Pie
  y = 282
  doc.setFontSize(7)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(100)
  const legalNote =
    'Este documento cumple con los requisitos mínimos de la Orden FOM/2861/2012 para el transporte de mercancías por carretera. Deberá conservarse a disposición de la inspección de transporte durante un año.'
  doc.text(legalNote, PW / 2, y, { align: 'center', maxWidth: CW })

  return doc
}
