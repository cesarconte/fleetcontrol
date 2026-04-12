/**
 * FleetControl — Certificado de Limpieza (Tanker/Food Service)
 *
 * Generates a standard cleaning certificate for tanks, silos, or reefers.
 * Required for food-grade, pharmaceutical, or chemical transport.
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

export async function generateCleaningCertDocument({ routeId, cargoId }) {
  const { route, vehicle, driver, company, cargo } = await fetchDocumentData(routeId, cargoId)
  const mappedData = mapCleaningFields({ route, vehicle, driver, company, cargo })
  const docNumber = generateDocumentNumber('CLEAN')
  const doc = renderCleaningCertPdf(mappedData, docNumber)
  const filename = `cleaning_${routeId.slice(0, 8)}_${Date.now()}.pdf`
  const url = await uploadToStorage(routeId, filename, doc)
  const docRecord = await saveDocumentRecord({
    routeId,
    cargoId,
    docNumber,
    filename,
    url,
    type: 'cleaning_cert',
  })
  return { url, documentId: docRecord.id, filename }
}

function generateDocumentNumber(prefix) {
  const year = new Date().getFullYear()
  const seq = Date.now() % 100000
  return `${prefix}/${year}/${String(seq).padStart(5, '0')}`
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

function mapCleaningFields({ vehicle, cargo, company }) {
  return {
    company_name: company.company_name,
    company_tax_id: company.cif,
    vehicle_plate: vehicle.plate,
    vehicle_type: vehicle.vehicle_type,
    previous_cargo: cargo?.description,
  }
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

export function renderCleaningCertPdf(data, docNumber) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MT

  // ── CABECERA ──────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(ML, y, CW, 12, 'F')
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRIMARY_TEXT_COLOR)
  doc.text('CERTIFICADO DE LIMPIEZA / HIGIENIZACIÓN', ML + 5, y + 8)

  doc.setFontSize(10)
  doc.text(`Nº ${docNumber}`, PW - MR - 5, y + 8, { align: 'right' })
  doc.setTextColor(0)
  y += 18

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

  // ── DATOS ESTACIÓN DE LIMPIEZA ────────────────────────────────
  const b1 = sectionBox(ML, y, CW, 35, 'DATOS DE LA ESTACIÓN DE LIMPIEZA / SERVICE PROVIDER')
  let b1Y = b1.contentY
  b1Y = writeBoxText(
    ML + 2,
    b1Y,
    'Empresa',
    data.company_name || 'FleetControl Cleaning Services',
    b1.innerW,
  )
  b1Y = writeBoxText(ML + 2, b1Y, 'NIF', data.company_tax_id || 'B12345678', b1.innerW)
  writeBoxText(
    ML + 2,
    b1Y,
    'Ubicación / Base',
    data.location || 'Base Principal Logística',
    b1.innerW,
  )

  y += 40

  // ── DATOS DEL VEHÍCULO ────────────────────────────────────────
  const b2 = sectionBox(ML, y, CW, 18, 'IDENTIFICACIÓN DEL EQUIPO / VEHICLE IDENTIFICATION')
  writeBoxText(ML + 2, b2.contentY, 'Matrícula', data.vehicle_plate, 60)
  writeBoxText(
    ML + 80,
    b2.contentY,
    'Tipo de Equipo',
    data.vehicle_type || 'Cisterna / Silo / Frigo',
    100,
  )

  y += 25

  // ── DETALLES DE LA LIMPIEZA ──────────────────────────────────
  doc.autoTable({
    startY: y,
    head: [['Cod.', 'Operación Realizada / Cleaning Operation', 'Referencia / Producto Anterior']],
    body: [
      [
        '01',
        'Lavado interior alta presión agua caliente (85ºC)',
        data.previous_cargo || 'Carga general',
      ],
      ['02', 'Vaporizado y desinfección química (Food Grade)', 'No procede'],
      ['03', 'Limpieza y soplado de mangueras y accesorios', 'Completado'],
      ['04', 'Secado interior aire filtrado', 'Completado'],
      [
        '05',
        'Inspección visual y sellado de domos/válvulas',
        'Precinto: ' + (Math.random() * 100000).toFixed(0),
      ],
    ],
    styles: { fontSize: 8.5, cellPadding: 4 },
    headStyles: { fillColor: PRIMARY_COLOR, textColor: PRIMARY_TEXT_COLOR, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 50 },
    },
    theme: 'grid',
  })

  y = doc.lastAutoTable.finalY + 12

  // ── DECLARACIÓN DE CONFORMIDAD ──────────────────────────────
  const b3 = sectionBox(ML, y, CW, 30, 'DECLARACIÓN DE CONFORMIDAD / DECLARATION OF CONFORMITY')
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  const declText =
    'Se certifica que el equipo arriba mencionado ha sido limpiado y desinfectado siguiendo estrictamente los protocolos de seguridad técnica y sanitaria vigentes. El equipo queda en condiciones óptimas para la carga de nuevas mercancías, garantizando la ausencia de residuos contaminantes.'
  doc.text(doc.splitTextToSize(declText, b3.innerW), ML + 2, b3.contentY)

  // ── FIRMAS Y SELLO ────────────────────────────────────────────
  y = 265
  const sigW = (CW - 10) / 2

  doc.setDrawColor(0)
  doc.setLineWidth(0.2)

  doc.line(ML, y, ML + sigW, y)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Firma Responsable Estación / Sello', ML, y + 5)

  doc.line(ML + sigW + 10, y, ML + sigW * 2 + 10, y)
  doc.text('Vº Bº Conductor / Driver Acceptance', ML + sigW + 10, y + 5)

  // Footer page number
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120)
  doc.text('FleetControl — Documento generado electrónicamente — Página 1 de 1', PW / 2, 290, {
    align: 'center',
  })

  return doc
}
