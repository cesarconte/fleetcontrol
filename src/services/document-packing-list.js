/**
 * FleetControl — Listado de Contenido / Packing List
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

export async function generatePackingListDocument({ routeId, cargoId }) {
  const { route, vehicle, driver, company, cargo } = await fetchDocumentData(routeId, cargoId)
  const mappedData = mapPackingFields({ route, vehicle, driver, company, cargo })
  const docNumber = `PL/${new Date().getFullYear()}/${Date.now().toString().slice(-5)}`
  const doc = renderPackingListPdf(mappedData, docNumber)
  const filename = `packing_${routeId.slice(0, 8)}_${Date.now()}.pdf`
  const url = await uploadToStorage(routeId, filename, doc)
  const docRecord = await saveDocumentRecord({
    routeId,
    cargoId,
    docNumber,
    filename,
    url,
    type: 'packing_list',
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
    // Si no hay cargoId, intentamos pillar el primero de la ruta
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

function mapPackingFields({ route, cargo, company }) {
  // Formatear fecha a DD/MM/YYYY
  let formattedDate = ''
  if (route.departure_date) {
    const d = new Date(route.departure_date)
    formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }

  return {
    sender_name: company.company_name || 'FleetControl S.L.',
    sender_address: company.address || '',
    recipient_name: cargo.consignee_name || 'S/N',
    recipient_address: cargo.cmr_delivery_place || '',
    delivery_date: formattedDate,
    items_description: cargo.description || 'Mercancía General',
    items_quantity: cargo.packages || 0,
    items_weight_kg: cargo.weight_kg || 0,
    observations: cargo.notes || 'Ninguna.',
    vehicle_plate: route.vehicle_plate || '',
    category: cargo.category || 'General',
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

export function renderPackingListPdf(data, docNumber) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MT

  // ── CABECERA ──────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY_COLOR)
  doc.rect(ML, y, CW, 15, 'F')
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRIMARY_TEXT_COLOR)
  doc.text('LISTADO DE CARGA / PACKING LIST', ML + 5, y + 10)

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

  // ── DATOS GENERALES ──────────────────────────────────────────
  const b1H = 35
  const b1 = sectionBox(ML, y, CW, b1H, 'DATOS DEL ENVÍO Y TRANSPORTE')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')

  let b1Y = b1.contentY
  doc.text('EXPEDIDOR:', ML + 3, b1Y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${data.sender_name}`, ML + 30, b1Y)

  doc.setFont('helvetica', 'bold')
  doc.text('DESTINATARIO:', ML + 100, b1Y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${data.recipient_name}`, ML + 130, b1Y)

  b1Y += 7
  doc.setFont('helvetica', 'bold')
  doc.text('DIRECCIÓN:', ML + 3, b1Y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${data.sender_address || '—'}`, ML + 30, b1Y, { maxWidth: 65 })

  doc.setFont('helvetica', 'bold')
  doc.text('ENTREGA:', ML + 100, b1Y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${data.recipient_address || '—'}`, ML + 130, b1Y, { maxWidth: 65 })

  b1Y += 8
  doc.setFont('helvetica', 'bold')
  doc.text('FECHA CARGA:', ML + 3, b1Y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${data.delivery_date}`, ML + 30, b1Y)

  doc.setFont('helvetica', 'bold')
  doc.text('CATEGORÍA:', ML + 100, b1Y)
  doc.setFont('helvetica', 'normal')
  doc.text(`${data.category}`, ML + 130, b1Y)

  y += b1H + 10

  // ── DETALLE DE CARGA (AMPLIADO) ──────────────────────────────
  const bodyRows = [
    [
      '001',
      data.items_description,
      data.items_quantity,
      'Bulto(s)',
      '—',
      `${data.items_weight_kg} kg`,
      '—',
    ],
  ]
  // Rellenar hasta 14 filas para ocupar espacio profesionalmente (bajado de 15)
  for (let i = 2; i <= 14; i++) {
    bodyRows.push([String(i).padStart(3, '0'), '', '', '', '', '', ''])
  }
  bodyRows.push(['', 'TOTALES:', data.items_quantity, '', '—', `${data.items_weight_kg} kg`, ''])

  doc.autoTable({
    startY: y,
    head: [
      ['Item', 'Descripción del Producto', 'Cant.', 'Embalaje', 'P. Neto', 'P. Bruto', 'Dims'],
    ],
    body: bodyRows,
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: PRIMARY_COLOR, textColor: PRIMARY_TEXT_COLOR, fontStyle: 'bold' },
    margin: { left: ML, right: MR },
    tableWidth: CW,
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 60 },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'center', cellWidth: 20 },
      4: { halign: 'center', cellWidth: 20 },
      5: { halign: 'center', cellWidth: 25 },
      6: { halign: 'center' },
    },
    theme: 'grid',
  })

  y = doc.lastAutoTable.finalY + 5 // Margin decreased to 5

  // ── OBSERVACIONES ────────────────────────────────────────────
  const b2H = 20
  const b2 = sectionBox(ML, y, CW, b2H, 'DETALLE DE CARGA Y OBSERVACIONES')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const obsLines = doc.splitTextToSize(
    data.observations || 'Sin incidencias durante la carga.',
    b2.innerW,
  )
  doc.text(obsLines, ML + 3, b2.contentY)

  // ── FIRMAS AL PIE ─────────────────────────
  // Posicionamiento dinámico en base a la caja de observaciones anterior
  y = y + b2H + 5

  const signW = (CW - 10) / 2
  const signH = 25

  const b3 = sectionBox(ML, y, signW, signH, 'EXPEDIDOR / ALMACÉN SALIDA')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Firma y Sello:', ML + 3, b3.contentY)

  const b4 = sectionBox(ML + signW + 10, y, signW, signH, 'TRANSPORTISTA (RECEPCIÓN)')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Firma y Sello:', ML + signW + 13, b4.contentY)

  return doc
}
