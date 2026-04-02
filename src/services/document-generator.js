/**
 * FleetControl — Document Generator
 *
 * Generates transport documents (PDF) with auto-filled data from DB.
 * Fetches route, vehicle, driver, cargo, and company data in parallel,
 * maps fields, generates PDF with jsPDF, uploads to Storage, and records in DB.
 *
 * @see PRD §4.9 — Documentación de Transporte
 * @see CMR_FIELD_MAPPING in transport-document-types.js
 */

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { supabase } from './supabase-client.js'
import { apiDocumentTemplates } from './api-document-templates.js'
import { mapSupabaseError } from '@/utils/error-map.js'

const STORAGE_BUCKET = 'transport-documents'

/**
 * Generate a transport document PDF and store it.
 *
 * @param {object} params
 * @param {string} params.documentType - Document type value (cmr, albaran, etc.)
 * @param {string} params.routeId - Route UUID for data source
 * @param {string} [params.cargoId] - Optional cargo UUID
 * @returns {Promise<{ url: string, documentId: string, filename: string }>}
 */
export async function generateDocument({ documentType, routeId, cargoId }) {
  // 1. Fetch route to get vehicle_id and driver_id
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .select('*')
    .eq('id', routeId)
    .single()

  if (routeError) throw mapSupabaseError(routeError)

  // 2. Fetch vehicle, driver, company in parallel
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

  // 3. Fetch cargo
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

  // 4. Fetch template
  const template = await apiDocumentTemplates.getByType(documentType)

  // 5. Assemble data for PDF
  const docData = {
    route: route ?? {},
    vehicle: vehicleResult.data ?? {},
    driver: driverResult.data ?? {},
    company: companyResult.data ?? {},
    cargo: cargo ?? {},
  }

  // 6. Generate PDF
  const doc = new jsPDF()
  const filename = `${documentType}_${routeId.slice(0, 8)}_${Date.now()}.pdf`

  switch (documentType) {
    case 'cmr':
      renderCmrPdf(doc, docData)
      break
    case 'albaran':
      renderAlbaranPdf(doc, docData)
      break
    case 'hoja_ruta':
      renderHojaRutaPdf(doc, docData)
      break
    case 'factura':
      renderFacturaPdf(doc, docData)
      break
    case 'pod':
      renderPodPdf(doc, docData)
      break
    case 'adr':
      renderAdrPdf(doc, docData)
      break
    default:
      renderGenericPdf(doc, docData, documentType)
  }

  // 7. Upload to Storage
  const pdfBlob = doc.output('arraybuffer')
  const filePath = `${routeId}/${filename}`

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, new Uint8Array(pdfBlob), {
      contentType: 'application/pdf',
    })

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)
  const url = urlData.publicUrl

  // 8. Insert record in generated_documents
  const { data: docRecord, error: insertError } = await supabase
    .from('generated_documents')
    .insert({
      template_id: template?.id,
      route_id: routeId,
      cargo_id: cargoId ?? cargo?.id,
      document_type: documentType,
      file_url: url,
      filename,
      generated_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single()

  if (insertError) throw mapSupabaseError(insertError)

  return { url, documentId: docRecord.id, filename }
}

// ── PDF Renderers ────────────────────────────────────────────────────────────

/**
 * Render CMR (Carta de Porte Internacional) layout.
 */
function renderCmrPdf(doc, { company, cargo, vehicle, driver, route }) {
  const pw = doc.internal.pageSize.width
  let y = 15

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('CARTA DE PORTE INTERNACIONAL (CMR)', pw / 2, y, { align: 'center' })
  y += 10

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  // Sender
  doc.setFont('helvetica', 'bold')
  doc.text('1. Remitente:', 14, y)
  doc.setFont('helvetica', 'normal')
  y += 5
  doc.text(company.company_name ?? '—', 14, y)
  y += 4
  doc.text(`${company.address ?? ''} ${company.city ?? ''} ${company.postal_code ?? ''}`, 14, y)
  y += 4
  doc.text(`CIF: ${company.cif ?? '—'}`, 14, y)
  y += 10

  // Recipient
  doc.setFont('helvetica', 'bold')
  doc.text('2. Destinatario:', 14, y)
  doc.setFont('helvetica', 'normal')
  y += 5
  doc.text(cargo.cmr_recipient ?? '—', 14, y)
  y += 4
  doc.text(cargo.cmr_delivery_place ?? '—', 14, y)
  y += 10

  // Cargo table
  doc.autoTable({
    startY: y,
    head: [['Descripción', 'Peso (kg)', 'Volumen (m³)']],
    body: [
      [cargo.description ?? '—', String(cargo.weight_kg ?? '—'), String(cargo.volume_m3 ?? '—')],
    ],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [245, 124, 0] },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 10

  // Vehicle & Driver
  doc.text(`Vehículo: ${vehicle.plate ?? '—'} (${vehicle.vehicle_type ?? '—'})`, 14, y)
  y += 5
  doc.text(
    `Conductor: ${driver.full_name ?? '—'} — Licencia: ${driver.license_number ?? '—'}`,
    14,
    y,
  )
  y += 10

  // Route
  doc.text(`Ruta: ${route.origin_city ?? '—'} → ${route.destination_city ?? '—'}`, 14, y)
  y += 5
  doc.text(`Fecha: ${route.departure_date ?? '—'}`, 14, y)
  y += 15

  // Signatures
  doc.line(14, y, 80, y)
  doc.text('Firma remitente', 14, y + 4)
  doc.line(110, y, 180, y)
  doc.text('Firma conductor', 110, y + 4)
}

/**
 * Render Albarán de Entrega layout.
 */
function renderAlbaranPdf(doc, { company, cargo, driver, route }) {
  const pw = doc.internal.pageSize.width
  let y = 15

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('ALBARÁN DE ENTREGA', pw / 2, y, { align: 'center' })
  y += 10

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  doc.text(`Empresa: ${company.company_name ?? '—'} — CIF: ${company.cif ?? '—'}`, 14, y)
  y += 5
  doc.text(`Dirección: ${company.address ?? '—'}, ${company.city ?? ''}`, 14, y)
  y += 8

  doc.text(`Destinatario: ${cargo.cmr_recipient ?? '—'}`, 14, y)
  y += 5
  doc.text(`Lugar entrega: ${cargo.cmr_delivery_place ?? route.destination_city ?? '—'}`, 14, y)
  y += 8

  doc.autoTable({
    startY: y,
    head: [['Descripción', 'Peso (kg)', 'Observaciones']],
    body: [[cargo.description ?? '—', String(cargo.weight_kg ?? '—'), '']],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [245, 124, 0] },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 10
  doc.text(`Conductor: ${driver.full_name ?? '—'}`, 14, y)
  y += 10

  doc.line(14, y, 80, y)
  doc.text('Firma receptor', 14, y + 4)
  doc.line(110, y, 180, y)
  doc.text('Firma conductor', 110, y + 4)
}

/**
 * Render Hoja de Ruta layout.
 */
function renderHojaRutaPdf(doc, { company, vehicle, driver, route, cargo }) {
  const pw = doc.internal.pageSize.width
  let y = 15

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('HOJA DE RUTA', pw / 2, y, { align: 'center' })
  y += 10

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  doc.text(`Empresa: ${company.company_name ?? '—'}`, 14, y)
  y += 8

  doc.autoTable({
    startY: y,
    head: [['Campo', 'Valor']],
    body: [
      ['Vehículo', `${vehicle.plate ?? '—'} ${vehicle.brand ?? ''} ${vehicle.model ?? ''}`],
      ['Conductor', driver.full_name ?? '—'],
      ['Licencia', driver.license_number ?? '—'],
      ['Origen', `${route.origin_city ?? '—'} (${route.origin_province ?? ''})`],
      ['Destino', `${route.destination_city ?? '—'} (${route.destination_province ?? ''})`],
      ['Fecha', route.departure_date ?? '—'],
      ['Distancia', `${route.distance_total_km ?? '—'} km`],
      ['Carga', cargo.description ?? '—'],
      ['Peso', `${cargo.weight_kg ?? '—'} kg`],
    ],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [245, 124, 0] },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 10
  doc.text('Instrucciones:', 14, y)
  y += 15
  doc.line(14, y, 80, y)
  doc.text('Firma conductor', 14, y + 4)
}

/**
 * Render Factura de Transporte layout.
 */
function renderFacturaPdf(doc, { company, route, cargo: _cargo }) {
  const pw = doc.internal.pageSize.width
  let y = 15

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURA DE TRANSPORTE', pw / 2, y, { align: 'center' })
  y += 10

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  doc.text(`Nº Factura: ${route.invoice_number ?? '—'}`, 14, y)
  doc.text(`Fecha: ${route.invoice_date ?? '—'}`, pw - 60, y)
  y += 8

  doc.text(`${company.company_name ?? '—'}`, 14, y)
  y += 4
  doc.text(`CIF: ${company.cif ?? '—'}`, 14, y)
  y += 8

  doc.text(`Cliente: ${route.client_name ?? '—'}`, 14, y)
  y += 4
  doc.text(`CIF: ${route.client_tax_id ?? '—'}`, 14, y)
  y += 10

  doc.autoTable({
    startY: y,
    head: [['Concepto', 'Importe (€)']],
    body: [[`Transporte ${route.origin_city ?? ''} → ${route.destination_city ?? ''}`, '—']],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [245, 124, 0] },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 10
  doc.text(`Condiciones de pago: ${route.payment_terms ?? '—'}`, 14, y)
}

/**
 * Render POD (Proof of Delivery) layout.
 */
function renderPodPdf(doc, { cargo, driver, route }) {
  const pw = doc.internal.pageSize.width
  let y = 15

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('CERTIFICADO DE ENTREGA (POD)', pw / 2, y, { align: 'center' })
  y += 10

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  doc.text(`Destinatario: ${cargo.cmr_recipient ?? '—'}`, 14, y)
  y += 5
  doc.text(`Lugar: ${cargo.cmr_delivery_place ?? route.destination_city ?? '—'}`, 14, y)
  y += 5
  doc.text(`Conductor: ${driver.full_name ?? '—'}`, 14, y)
  y += 5
  doc.text(`Mercancía: ${cargo.description ?? '—'}`, 14, y)
  y += 15

  doc.line(14, y, 80, y)
  doc.text('Firma receptor', 14, y + 4)
  doc.text(`Fecha: ___/___/______`, 110, y + 4)
}

/**
 * Render ADR document layout.
 */
function renderAdrPdf(doc, { company, cargo, vehicle, driver }) {
  const pw = doc.internal.pageSize.width
  let y = 15

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('DOCUMENTO DE TRANSPORTE ADR', pw / 2, y, { align: 'center' })
  y += 10

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  doc.autoTable({
    startY: y,
    head: [['Campo', 'Valor']],
    body: [
      ['Remitente', company.company_name ?? '—'],
      ['Destinatario', cargo.cmr_recipient ?? '—'],
      ['Vehículo', vehicle.plate ?? '—'],
      ['Conductor', driver.full_name ?? '—'],
      ['Cert. ADR conductor', driver.adr_cert_number ?? '—'],
      ['Clase ADR', cargo.adr_class ?? '—'],
      ['Nº ONU', cargo.adr_un_number ?? '—'],
      ['Grupo embalaje', cargo.adr_packing_group ?? '—'],
      ['Tel. emergencia', cargo.emergency_phone ?? '—'],
    ],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [245, 124, 0] },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 10
  doc.text('Instrucciones de seguridad:', 14, y)
  y += 15
  doc.line(14, y, 80, y)
  doc.text('Firma conductor', 14, y + 4)
}

/**
 * Generic stub layout for types without specific renderer.
 */
function renderGenericPdf(doc, { company, route, cargo, vehicle, driver }, documentType) {
  const pw = doc.internal.pageSize.width
  let y = 15

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`${documentType.toUpperCase()} — DOCUMENTO DE TRANSPORTE`, pw / 2, y, {
    align: 'center',
  })
  y += 15

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  doc.autoTable({
    startY: y,
    head: [['Campo', 'Valor']],
    body: [
      ['Empresa', company.company_name ?? '—'],
      ['CIF', company.cif ?? '—'],
      ['Ruta', `${route.origin_city ?? '—'} → ${route.destination_city ?? '—'}`],
      ['Fecha', route.departure_date ?? '—'],
      ['Vehículo', vehicle.plate ?? '—'],
      ['Conductor', driver.full_name ?? '—'],
      ['Carga', cargo.description ?? '—'],
      ['Peso', `${cargo.weight_kg ?? '—'} kg`],
    ],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [245, 124, 0] },
    margin: { left: 14, right: 14 },
  })
}
