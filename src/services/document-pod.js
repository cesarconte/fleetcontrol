/**
 * FleetControl — Certificado de Entrega (POD) Document Service
 *
 * Generates Proof of Delivery (POD) PDF according to LCTTM.
 *
 * @see LCTTM (Ley 15/2009)
 */

import jsPDF from 'jspdf'
import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

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

function mapPodFields({ route, vehicle, driver, _company, cargo }) {
  const deliveryDate = route.departure_date
    ? new Date(route.departure_date).toISOString().split('T')[0]
    : ''
  return {
    recipient_name: cargo.cmr_recipient || cargo.consignee_name || '',
    recipient_signature: '',
    delivery_date: deliveryDate,
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
  const seq = Date.now() % 100000
  return `${prefix}-${year}-${String(seq).padStart(5, '0')}`
}

function renderPodPdf(data, docNumber) {
  const doc = new jsPDF()
  const pw = doc.internal.pageSize.width
  let y = 15
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('CERTIFICADO DE ENTREGA (POD)', pw / 2, y, { align: 'center' })
  y += 7
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nº: ${docNumber}`, pw / 2, y, { align: 'center' })
  y += 10
  doc.text(`Destinatario: ${data.recipient_name}`, 14, y)
  y += 5
  doc.text(`Lugar entrega: ${data.delivery_address}`, 14, y)
  y += 5
  doc.text(`Fecha: ${data.delivery_date} ${data.delivery_time}`, 14, y)
  y += 5
  doc.text(`Conductor: ${data.driver_name}`, 14, y)
  y += 5
  doc.text(`Mercancía: ${data.cargo_description}`, 14, y)
  y += 5
  doc.text(`Estado: ${data.cargo_condition}`, 14, y)
  y += 15
  doc.line(14, y, 80, y)
  doc.text('Firma receptor', 14, y + 4)
  doc.line(110, y, 180, y)
  doc.text('Firma conductor', 110, y + 4)
  if (data.observations) {
    y += 15
    doc.text(`Observaciones: ${data.observations}`, 14, y)
  }
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

async function saveDocumentRecord({ routeId, cargoId, docNumber, filename, url, type }) {
  const { data: docRecord, error: insertError } = await supabase
    .from('generated_documents')
    .insert({
      route_id: routeId,
      cargo_id: cargoId,
      document_type: type,
      document_number: docNumber,
      file_url: url,
      filename,
      generated_by: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single()
  if (insertError) throw mapSupabaseError(insertError)
  return docRecord
}
