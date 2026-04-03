/**
 * FleetControl — Hoja de Ruta Document Service
 *
 * Generates Hoja de Ruta PDF with vehicle, driver, cargo, and route data.
 *
 * @see LOTT / RD 70/2019
 */

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

const STORAGE_BUCKET = 'transport-documents'

const HOJA_RUTA_REQUIRED_FIELDS = [
  'vehicle_plate',
  'driver_name',
  'driver_license',
  'route_origin',
  'route_destination',
  'departure_date',
  'cargo_description',
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

function mapHojaRutaFields({ route, vehicle, driver, company, cargo }) {
  return {
    vehicle_plate: vehicle.plate || '',
    vehicle_brand_model: `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`,
    driver_name: driver.full_name || '',
    driver_license: driver.license_number || '',
    driver_national_id: driver.national_id || '',
    route_origin: `${route.origin_city ?? ''} (${route.origin_province ?? ''})`,
    route_destination: `${route.destination_city ?? ''} (${route.destination_province ?? ''})`,
    departure_date: route.departure_date || '',
    departure_time: route.departure_time || '',
    estimated_arrival: route.estimated_arrival || '',
    stops: route.stops || '',
    instructions: route.instructions || '',
    cargo_description: cargo.description || '',
    cargo_weight_kg: cargo.weight_kg || '',
    company_name: company.company_name || '',
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
  const seq = Date.now() % 100000
  return `${prefix}-${year}-${String(seq).padStart(5, '0')}`
}

function renderHojaRutaPdf(data, docNumber) {
  const doc = new jsPDF()
  const pw = doc.internal.pageSize.width
  let y = 15
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('HOJA DE RUTA', pw / 2, y, { align: 'center' })
  y += 7
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Empresa: ${data.company_name}`, 14, y)
  y += 5
  doc.text(`Nº: ${docNumber}`, pw / 2, y, { align: 'center' })
  y += 8
  doc.autoTable({
    startY: y,
    head: [['Campo', 'Valor']],
    body: [
      ['Vehículo', data.vehicle_plate + ' ' + data.vehicle_brand_model],
      ['Conductor', data.driver_name],
      ['Licencia', data.driver_license],
      ['Origen', data.route_origin],
      ['Destino', data.route_destination],
      ['Fecha', data.departure_date],
      ['Distancia', `${data.distance_total_km} km`],
      ['Carga', data.cargo_description],
      ['Peso', `${data.cargo_weight_kg} kg`],
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
