/**
 * FleetControl — Hoja de Ruta Document Service
 *
 * Generates Hoja de Ruta PDF with vehicle, driver, cargo, and route data.
 *
 * @see LOTT / RD 70/2019
 */

import { jsPDF } from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
applyPlugin(jsPDF)

import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'
import { saveDocumentRecord } from './api-documents-persistence.js'

const STORAGE_BUCKET = 'transport-documents'

const HOJA_RUTA_REQUIRED_FIELDS = [
  'vehicle_plate',
  'driver_name',
  'origin',
  'destination',
  'departure_date',
]

export async function generateHojaRutaDocument({ routeId, cargoId }) {
  const { route, vehicle, driver, company, cargo } = await fetchDocumentData(routeId, cargoId)
  const mappedData = mapHojaRutaFields({ route, vehicle, driver, company, cargo })
  const validation = validateFields(mappedData, HOJA_RUTA_REQUIRED_FIELDS)
  if (!validation.valid)
    throw new Error(`Campos obligatorios faltantes: ${validation.missing.join(', ')}`)
  const docNumber = generateDocumentNumber('HR')
  const doc = renderHojaRutaPdf(mappedData, docNumber)
  const filename = `hoja_ruta_${routeId.slice(0, 8)}_${Date.now()}.pdf`
  const url = await uploadToStorage(routeId, filename, doc)

  const docRecord = await saveDocumentRecord({
    routeId,
    cargoId,
    docNumber,
    filename,
    url,
    type: 'hoja_ruta',
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

function mapHojaRutaFields({ route, vehicle, driver, company, cargo }) {
  let formattedDate = ''
  if (route.departure_date) {
    const d = new Date(route.departure_date)
    formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }

  return {
    vehicle_plate: vehicle.plate || '',
    vehicle_brand_model: `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`,
    vehicle_type: vehicle.type || 'N/A',
    driver_name: driver.full_name || '',
    driver_license: driver.license_number || '',
    driver_national_id: driver.national_id || '',
    route_origin: `${route.origin_address || ''} (${route.origin_city || ''})`,
    route_destination: `${route.destination_address || ''} (${route.destination_city || ''})`,
    origin: route.origin_city || '',
    destination: route.destination_city || '',
    departure_date: formattedDate,
    departure_time: route.departure_time || '',
    estimated_arrival: route.estimated_arrival || '',
    stops: route.stops || '',
    instructions: route.instructions || '',
    cargo_description: cargo.description || '',
    cargo_weight_kg: cargo.weight_kg || '',
    company_name: company.company_name || 'FleetControl S.L.',
    distance_total_km: route.distance_total_km || '',
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

function renderHojaRutaPdf(data, docNumber) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MT

  // ── Cabecera ──────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(ML, y, CW, 12, 'F')
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRIMARY_TEXT_COLOR)
  doc.text('HOJA DE RUTA / OPERATIVE PLAN', ML + 5, y + 8)

  doc.setFontSize(10)
  doc.text(`Nº ${docNumber}`, PW - MR - 5, y + 8, { align: 'right' })
  doc.setTextColor(0)
  y += 18

  // ── Helpers ──────────────────────────────────────────────────
  function sectionBox(x, yPos, width, height, title) {
    doc.setDrawColor(...PRIMARY_COLOR)
    doc.setLineWidth(0.3)
    doc.rect(x, yPos, width, height)
    doc.setFillColor(...PRIMARY_COLOR)
    doc.rect(x, yPos, width, 5, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PRIMARY_TEXT_COLOR)
    doc.text(title.toUpperCase(), x + 2, yPos + 3.5)
    doc.setTextColor(0)
    return { contentY: yPos + 9, innerW: width - 4 }
  }

  function writeBoxText(x, yPos, label, value, maxWidth) {
    doc.setFontSize(8)
    const lineH = 4.5
    let curY = yPos
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

  // ── Datos del Viaje ──────────────────────────────────────────
  const colW = (CW - 5) / 2

  const b1 = sectionBox(ML, y, colW, 30, 'CONDUCTOR Y VEHÍCULO')
  let b1Y = b1.contentY
  b1Y = writeBoxText(ML + 2, b1Y, 'Conductor', data.driver_name, b1.innerW)
  b1Y = writeBoxText(ML + 2, b1Y, 'DNI/NIF', data.driver_national_id, b1.innerW)
  b1Y = writeBoxText(ML + 2, b1Y, 'Matrícula', data.vehicle_plate, b1.innerW)
  writeBoxText(ML + 2, b1Y, 'Tipo Vehículo', data.vehicle_type, b1.innerW)

  const b2 = sectionBox(ML + colW + 5, y, colW, 30, 'ITINERARIO PREVISTO')
  let b2Y = b2.contentY
  b2Y = writeBoxText(ML + colW + 7, b2Y, 'Origen', data.origin, b2.innerW)
  b2Y = writeBoxText(ML + colW + 7, b2Y, 'Destino', data.destination, b2.innerW)
  b2Y = writeBoxText(ML + colW + 7, b2Y, 'Fecha Salida', data.departure_date, b2.innerW)
  writeBoxText(ML + colW + 7, b2Y, 'Hora Prevista', data.departure_time || 'S/D', b2.innerW)

  y += 35

  // ── Planificación de Paradas ─────────────────────────────────
  doc.autoTable({
    startY: y,
    head: [['Ubicación / Punto de Control', 'Actividad Requerida', 'ETA / Hora', 'Real', 'Obs.']],
    body: [
      [data.origin, 'Carga / Picking', data.departure_time || '--:--', '', ''],
      ['Área de Servicio I', 'Descanso Tacógrafo (45 min)', '--:--', '', ''],
      ['Punto de Aduana / Control', 'Validación Documental', '--:--', '', ''],
      ['Plataforma Logística II', 'Control Pesaje / Crossdocking', '--:--', '', ''],
      ['Área de Servicio II', 'Pausa Obligatoria / Comida', '--:--', '', ''],
      ['Cargador Intermedio', 'Grupaje / Carga Adicional', '--:--', '', ''],
      [data.destination, 'Descarga / Entrega Mercancía', data.estimated_arrival || '--:--', '', ''],
      ['Terminal de Retorno', 'Entrega de Remolque / Fin', '--:--', '', ''],
      ['Base Operativa', 'Cierre de Hoja de Ruta', '--:--', '', ''],
    ],
    styles: { fontSize: 8.5, cellPadding: 5 },
    headStyles: { fillColor: PRIMARY_COLOR, textColor: PRIMARY_TEXT_COLOR, fontStyle: 'bold' },
    columnStyles: {
      3: { cellWidth: 20 },
      4: { cellWidth: 25 },
    },
    margin: { left: ML, right: MR },
    tableWidth: CW,
    theme: 'grid',
  })

  y = doc.lastAutoTable.finalY + 12

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Instrucciones Especiales y Seguridad:', ML, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  const instLines = doc.splitTextToSize(
    data.instructions ||
      'Sin instrucciones adicionales. Respetar tiempos de conducción y descanso conforme Reg. CE 561/2006.',
    CW,
  )
  doc.text(instLines, ML, y)

  // ── FIRMA CONDUCTOR AL PIE ──────────────────────────────────
  y = 265
  doc.setDrawColor(0)
  doc.setLineWidth(0.3)
  doc.line(ML, y, ML + 80, y)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Firma y Conformidad del Conductor / Operador', ML, y + 5)

  // Footer page number
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(150)
  doc.text(
    'Página 1 de 1 — Documento interno de control operativo — ' + data.company_name,
    PW / 2,
    290,
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
