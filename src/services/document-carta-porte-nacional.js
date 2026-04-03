/**
 * FleetControl — Carta de Porte Nacional Document Service
 *
 * Generates Carta de Porte Nacional PDF according to Ley 15/2009 (LCTTM), arts. 10-12.
 * Includes all 10 mandatory sections with 40+ fields.
 *
 * @see Ley 15/2009 (LCTTM) arts. 10-12
 * @see Orden FOM/2861/2012
 */

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

const STORAGE_BUCKET = 'transport-documents'

const NACIONAL_REQUIRED_FIELDS = [
  'shipper_name',
  'shipper_nif',
  'carrier_name',
  'carrier_nif',
  'consignee_name',
  'issue_place',
  'issue_date',
  'loading_address',
  'delivery_address',
  'goods_nature',
  'gross_weight_kg',
  'packaging_type',
  'freight_price',
  'payment_terms',
]

export async function generateCartaPorteNacionalDocument({ routeId, cargoId }) {
  const { route, vehicle, driver, company, cargo } = await fetchDocumentData(routeId, cargoId)
  const mappedData = mapNacionalFields({ route, vehicle, driver, company, cargo })
  const validation = validateFields(mappedData, NACIONAL_REQUIRED_FIELDS)
  if (!validation.valid)
    throw new Error(`Campos obligatorios faltantes: ${validation.missing.join(', ')}`)
  const docNumber = generateDocumentNumber('CPN')
  const doc = renderNacionalPdf(mappedData, docNumber)
  const filename = `carta_porte_nacional_${routeId.slice(0, 8)}_${Date.now()}.pdf`
  const url = await uploadToStorage(routeId, filename, doc)
  const docRecord = await saveDocumentRecord({
    routeId,
    cargoId,
    docNumber,
    filename,
    url,
    type: 'carta_porte_nacional',
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

function mapNacionalFields({ route, vehicle, driver, cargo, company }) {
  const issueDate = route.departure_date
    ? new Date(route.departure_date).toISOString().split('T')[0]
    : ''
  return {
    shipper_name: company.company_name || '',
    shipper_nif: company.cif || '',
    shipper_address: company.address || '',
    shipper_city: company.city || '',
    shipper_province: company.province || '',
    shipper_phone: company.phone || '',
    carrier_name: company.company_name || '',
    carrier_nif: company.cif || '',
    carrier_address: company.address || '',
    carrier_transport_license: company.transport_license || '',
    consignee_name: cargo.cmr_recipient || cargo.consignee_name || '',
    consignee_nif: cargo.consignee_nif || '',
    consignee_address: cargo.cmr_delivery_place || cargo.consignee_address || '',
    consignee_city: cargo.consignee_city || route.destination_city || '',
    consignee_province: cargo.consignee_province || route.destination_province || '',
    consignee_phone: cargo.consignee_phone || '',
    issue_place: route.origin_city || company.city || '',
    issue_date: issueDate,
    loading_address: route.origin_address || `${route.origin_city || ''}`,
    loading_date: route.departure_date || '',
    loading_time: route.departure_time || '',
    delivery_address: route.destination_address || `${route.destination_city || ''}`,
    delivery_date: route.estimated_arrival || '',
    delivery_time_window: cargo.delivery_time_window || '',
    goods_nature: cargo.subcategoria_id || cargo.categoria_id || cargo.description || '',
    goods_description: cargo.description || '',
    packages_count: cargo.packages || '',
    gross_weight_kg: cargo.weight_kg || 0,
    net_weight_kg: cargo.net_weight_kg || cargo.weight_kg || 0,
    volume_m3: cargo.volume_m3 || '',
    adr_class: cargo.adr_class || '',
    adr_un_number: cargo.adr_un_number || '',
    temperature_required: cargo.temperature_required || '',
    packaging_type: cargo.packaging_type || '',
    pallet_count: cargo.pallet_count || '',
    seal_number: cargo.seal_number || '',
    container_number: cargo.container_number || '',
    marking_codes: cargo.marks_numbers || '',
    special_handling: cargo.special_handling || '',
    sealing_instructions: cargo.sealing_instructions || '',
    delivery_deadline: cargo.delivery_deadline || '',
    transit_notes: route.notes || '',
    declared_value: cargo.declared_value || '',
    insurance_company: company.insurance_company || '',
    insurance_policy_number: company.insurance_policy || '',
    coverage_limit: company.insurance_coverage_limit || '',
    freight_price: route.price || 0,
    fuel_surcharge: route.fuel_surcharge || 0,
    toll_fees: route.toll_fees || 0,
    waiting_fees: route.waiting_fees || 0,
    total_amount: route.total_amount || route.price || 0,
    payment_terms: route.payment_terms || '',
    payment_method: route.payment_method || '',
    shipper_signature: '',
    carrier_signature: '',
    consignee_signature: '',
    signature_date: issueDate,
    damage_notes: '',
    missing_packages: '',
    condition_notes: '',
    order_reference: cargo.order_reference || '',
    tms_reference: route.tms_reference || '',
    additional_notes: route.notes || '',
    vehicle_plate: vehicle.plate || '',
    vehicle_type: vehicle.vehicle_type || '',
    driver_name: driver.full_name || '',
    driver_license: driver.license_number || '',
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

function renderNacionalPdf(data, docNumber) {
  const doc = new jsPDF()
  const pw = doc.internal.pageSize.width
  const margin = 14
  let y = 12

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(245, 124, 0)
  doc.text('CARTA DE PORTE NACIONAL', pw / 2, y, { align: 'center' })
  y += 7
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('Ley 15/2009 (LCTTM), arts. 10-12 — Orden FOM/2861/2012', pw / 2, y, { align: 'center' })
  y += 5
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(`Nº: ${docNumber}`, pw / 2, y, { align: 'center' })
  y += 8
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)

  y = renderSectionHeader(doc, y, '1. IDENTIFICACIÓN DE LAS PARTES', margin)
  renderTwoColumnBlock(doc, y, margin, [
    {
      label: 'REMITENTE/CARGADOR',
      fields: [
        data.shipper_name,
        data.shipper_nif,
        data.shipper_address,
        `${data.shipper_city} ${data.shipper_province}`,
        `Tel: ${data.shipper_phone}`,
      ],
    },
    {
      label: 'TRANSPORTISTA',
      fields: [
        data.carrier_name,
        data.carrier_nif,
        data.carrier_address,
        `Licencia: ${data.carrier_transport_license}`,
      ],
    },
  ])
  y += 38

  doc.setFont('helvetica', 'bold')
  doc.text('DESTINATARIO:', margin, y)
  doc.setFont('helvetica', 'normal')
  y += 4
  doc.text(data.consignee_name, margin + 4, y)
  y += 4
  if (data.consignee_nif) {
    doc.text(`NIF: ${data.consignee_nif}`, margin + 4, y)
    y += 4
  }
  doc.text(data.consignee_address, margin + 4, y)
  y += 4
  if (data.consignee_city) {
    doc.text(`${data.consignee_city} ${data.consignee_province}`, margin + 4, y)
    y += 4
  }
  if (data.consignee_phone) {
    doc.text(`Tel: ${data.consignee_phone}`, margin + 4, y)
    y += 4
  }
  y += 4

  y = renderSectionHeader(doc, y, '2. LUGARES Y FECHAS', margin)
  doc.autoTable({
    startY: y,
    head: [['Campo', 'Valor']],
    body: [
      ['Lugar y fecha de emisión', `${data.issue_place} — ${data.issue_date}`],
      [
        'Dirección de carga',
        `${data.loading_address}${data.loading_date ? ` — ${data.loading_date}` : ''}`,
      ],
      [
        'Dirección de entrega',
        `${data.delivery_address}${data.delivery_date ? ` — ${data.delivery_date}` : ''}`,
      ],
    ],
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [245, 124, 0], textColor: 255 },
    margin: { left: margin, right: margin },
  })
  y = doc.lastAutoTable.finalY + 6

  y = renderSectionHeader(doc, y, '3. MERCANCÍAS', margin)
  const cargoBody = [
    [
      data.goods_nature,
      data.goods_description,
      String(data.packages_count ?? '—'),
      `${data.gross_weight_kg} kg`,
      data.volume_m3 ? `${data.volume_m3} m³` : '—',
    ],
  ]
  doc.autoTable({
    startY: y,
    head: [['Naturaleza', 'Descripción', 'Bultos', 'P. Bruto', 'Volumen']],
    body: cargoBody,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [245, 124, 0], textColor: 255 },
    margin: { left: margin, right: margin },
  })
  y = doc.lastAutoTable.finalY + 4

  doc.setFont('helvetica', 'bold')
  doc.text('Embalaje:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data.packaging_type, margin + 22, y)
  y += 5
  if (data.pallet_count) {
    doc.text(`Palets: ${data.pallet_count}`, margin, y)
    y += 5
  }
  if (data.seal_number) {
    doc.text(`Precinto: ${data.seal_number}`, margin, y)
    y += 5
  }
  y += 2

  if (data.special_handling || data.transit_notes) {
    y = renderSectionHeader(doc, y, '4. INSTRUCCIONES DE TRANSPORTE', margin)
    if (data.special_handling) {
      doc.text(`Manipulación: ${data.special_handling}`, margin, y)
      y += 5
    }
    if (data.transit_notes) {
      doc.text(`Observaciones: ${data.transit_notes}`, margin, y)
      y += 5
    }
    y += 2
  }

  if (data.declared_value || data.insurance_company) {
    y = renderSectionHeader(doc, y, '5. VALOR DECLARADO Y SEGUROS', margin)
    if (data.declared_value) {
      doc.text(
        `Valor declarado: ${typeof data.declared_value === 'number' ? `${data.declared_value} €` : data.declared_value}`,
        margin,
        y,
      )
      y += 5
    }
    if (data.insurance_company) {
      doc.text(`Aseguradora: ${data.insurance_company}`, margin, y)
      y += 4
    }
    if (data.insurance_policy_number) {
      doc.text(`Póliza: ${data.insurance_policy_number}`, margin, y)
      y += 5
    }
    y += 2
  }

  y = renderSectionHeader(doc, y, '6. PRECIO DEL FLETE', margin)
  const fleteBody = [['Porte', `${data.freight_price} €`]]
  if (data.fuel_surcharge) fleteBody.push(['Supl. combustible', `${data.fuel_surcharge} €`])
  if (data.toll_fees) fleteBody.push(['Peajes', `${data.toll_fees} €`])
  if (data.waiting_fees) fleteBody.push(['Esperas', `${data.waiting_fees} €`])
  fleteBody.push(['TOTAL', `${data.total_amount || data.freight_price} €`])
  doc.autoTable({
    startY: y,
    head: [['Concepto', 'Importe']],
    body: fleteBody,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [245, 124, 0], textColor: 255 },
    margin: { left: margin, right: margin },
  })
  y = doc.lastAutoTable.finalY + 4
  doc.text(`Forma de pago: ${data.payment_terms}`, margin, y)
  y += 8

  y = renderSectionHeader(doc, y, '7. RESERVA DE COMPROBACIÓN', margin)
  doc.text('Espacio para anotar daños, faltantes o condiciones de la mercancía:', margin, y)
  y += 4
  doc.setDrawColor(180, 180, 180)
  doc.setLineWidth(0.3)
  doc.rect(margin, y, pw - margin * 2, 15)
  y += 19

  if (data.order_reference || data.additional_notes) {
    y = renderSectionHeader(doc, y, '8. OBSERVACIONES', margin)
    if (data.order_reference) {
      doc.text(`Nº Pedido: ${data.order_reference}`, margin, y)
      y += 4
    }
    if (data.tms_reference) {
      doc.text(`Ref. TMS: ${data.tms_reference}`, margin, y)
      y += 4
    }
    if (data.additional_notes) {
      doc.text(data.additional_notes, margin, y)
      y += 4
    }
    y += 4
  }

  y = Math.max(y, doc.internal.pageSize.height - 45)
  doc.setFont('helvetica', 'bold')
  doc.text('FIRMAS', pw / 2, y, { align: 'center' })
  y += 6
  doc.setFont('helvetica', 'normal')
  renderSignatureBlock(doc, y, [
    { label: 'Cargador/Remitente', name: data.shipper_name },
    { label: 'Transportista', name: data.carrier_name },
    { label: 'Destinatario', name: data.consignee_name },
  ])

  return doc
}

function renderSectionHeader(doc, y, title, margin) {
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(245, 124, 0)
  doc.text(title, margin, y)
  y += 5
  doc.setDrawColor(245, 124, 0)
  doc.setLineWidth(0.5)
  doc.line(margin, y - 1, doc.internal.pageSize.width - margin, y - 1)
  doc.setFontSize(7)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  return y
}

function renderTwoColumnBlock(doc, y, margin, columns) {
  const colWidth = (doc.internal.pageSize.width - margin * 2 - 10) / 2
  columns.forEach((col, i) => {
    const x = margin + i * (colWidth + 10)
    doc.setFont('helvetica', 'bold')
    doc.text(col.label, x, y)
    doc.setFont('helvetica', 'normal')
    y += 5
    col.fields.forEach(field => {
      if (field) {
        doc.text(String(field), x + 2, y)
        y += 4
      }
    })
  })
}

function renderSignatureBlock(doc, y, signatures) {
  const pw = doc.internal.pageSize.width
  const sigWidth = 55
  const sigGap = 10
  const sigStartX = (pw - (sigWidth * 3 + sigGap * 2)) / 2
  signatures.forEach((sig, i) => {
    const x = sigStartX + i * (sigWidth + sigGap)
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.line(x, y, x + sigWidth, y)
    doc.setFontSize(7)
    doc.text(sig.label, x, y + 4)
    if (sig.name) {
      doc.setFontSize(6)
      doc.setTextColor(120, 120, 120)
      doc.text(sig.name, x, y + 8)
      doc.setTextColor(0, 0, 0)
    }
    doc.text('Firma: _________________', x, y + 12)
    doc.text(`Fecha: ___/___/______`, x, y + 17)
  })
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
