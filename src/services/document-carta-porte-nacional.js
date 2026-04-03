/**
 * FleetControl — Carta de Porte Nacional Document Service
 *
 * Generates Carta de Porte Nacional PDF according to the official model
 * (Orden FOM/2861/2012, BOE 5 enero 2013).
 *
 * Layout matches the official 24-section form used in Spanish road freight.
 *
 * @see Orden FOM/2861/2012
 * @see Ley 15/2009 (LCTTM) arts. 10-12
 */

import { jsPDF } from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'

applyPlugin(jsPDF)

import { supabase } from './supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

const STORAGE_BUCKET = 'transport-documents'
const PW = 210 // A4 width mm
const PH = 297 // A4 height mm
const M = 10 // margin mm

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
    consignee_name: cargo.consignee_name || cargo.cmr_recipient || '',
    consignee_nif: cargo.consignee_nif || '',
    consignee_address: cargo.consignee_address || cargo.cmr_delivery_place || '',
    consignee_city: cargo.consignee_city || route.destination_city || '',
    consignee_province: cargo.consignee_province || route.destination_province || '',
    consignee_phone: cargo.consignee_phone || '',
    issue_place: route.origin_city || company.city || '',
    issue_date: formatDateES(new Date()),
    loading_address: route.origin_address || route.origin_city || '',
    loading_date: formatDateES(route.departure_date),
    loading_time: route.departure_date ? extractTime(route.departure_date) : '',
    delivery_address: route.destination_address || route.destination_city || '',
    delivery_date: route.planned_arrival_date ? formatDateES(route.planned_arrival_date) : '',
    delivery_time_window: '',
    goods_nature: cargo.categoria_id || cargo.subcategoria_id || cargo.description || '',
    goods_description: cargo.description || '',
    packages_count: cargo.packages || '',
    gross_weight_kg: cargo.weight_kg || 0,
    net_weight_kg: cargo.weight_kg || 0,
    volume_m3: cargo.volume_m3 || '',
    adr_class: cargo.adr_class || '',
    adr_un_number: cargo.adr_un_number || '',
    temperature_required: '',
    packaging_type: cargo.packaging_type || '',
    pallet_count: cargo.pallet_count || '',
    seal_number: cargo.seal_number || '',
    container_number: cargo.container_number || '',
    marking_codes: cargo.marks_numbers || '',
    special_handling: cargo.special_handling || '',
    sealing_instructions: cargo.sealing_instructions || '',
    delivery_deadline: '',
    transit_notes: route.notes || '',
    declared_value: cargo.declared_value || '',
    insurance_company: company.insurance_company || '',
    insurance_policy_number: company.insurance_policy || '',
    coverage_limit: company.insurance_coverage_limit || '',
    freight_price: route.price || 0,
    fuel_surcharge: 0,
    toll_fees: 0,
    waiting_fees: 0,
    total_amount: route.price || 0,
    payment_terms: route.payment_terms || '',
    payment_method: '',
    shipper_signature: '',
    carrier_signature: '',
    consignee_signature: '',
    signature_date: formatDateES(new Date()),
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

function formatDateES(dateStr) {
  if (!dateStr) return ''
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function extractTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
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
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const contentW = PW - M * 2
  let y = 8

  // ── Header ──────────────────────────────────────────────────────
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.text('DOCUMENTO DE CONTROL DE LOS ENVÍOS DE TRANSPORTE PÚBLICO DE MERCANCÍAS', PW / 2, y, {
    align: 'center',
  })
  y += 4
  doc.setFontSize(6)
  doc.setTextColor(120, 120, 120)
  doc.text(
    'Orden FOM/2861/2012 de 13 de diciembre (BOE 5 de enero de 2013) — Deroga Orden FOM 238/2003',
    PW / 2,
    y,
    { align: 'center' },
  )
  y += 5

  // Title bar
  doc.setFillColor(245, 124, 0)
  doc.rect(M, y, contentW, 8, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('CARTA DE PORTE NACIONAL', PW / 2, y + 5.5, { align: 'center' })
  y += 10

  doc.setFontSize(6)
  doc.setTextColor(100, 100, 100)
  doc.text(
    'A rellenar bajo la responsabilidad del remitente (1-15, 19, 21, 22). Los recuadros en línea gruesa deben ser rellenados por el porteador.',
    PW / 2,
    y,
    { align: 'center' },
  )
  y += 3

  // Doc number
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(`Nº ${docNumber}`, PW - M, y, { align: 'right' })
  y += 2

  // ── Section 1: Remitente + Cargador + Operador ─────────────────
  y = drawBox(doc, y, contentW, 22, '1  REMITENTE / CARGADOR / OPERADOR')
  y += 1
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  const leftCol = M + 2
  const rightCol = M + contentW / 2 + 2
  const colW = contentW / 2 - 4

  doc.setFont('helvetica', 'bold')
  doc.text('Remitente:', leftCol, y)
  doc.setFont('helvetica', 'normal')
  y += 3.5
  doc.text(data.shipper_name, leftCol, y)
  y += 3.5
  doc.text(`NIF: ${data.shipper_nif}`, leftCol, y)
  y += 3.5
  doc.text(data.shipper_address, leftCol, y)
  y += 3.5
  doc.text(`${data.shipper_city} ${data.shipper_province}`, leftCol, y)

  // Reset y for right column
  let yR = y - 14
  doc.setFont('helvetica', 'bold')
  doc.text('Cargador Contractual:', rightCol, yR)
  doc.setFont('helvetica', 'normal')
  yR += 3.5
  doc.text(data.shipper_name, rightCol, yR)
  yR += 3.5
  doc.text(`NIF: ${data.shipper_nif}`, rightCol, yR)
  yR += 3.5
  doc.text(data.carrier_address, rightCol, yR)
  yR += 3.5
  doc.text(`${data.shipper_city}`, rightCol, yR)

  y = Math.max(y, yR) + 1
  doc.setFont('helvetica', 'bold')
  doc.text('Operador de Transporte:', leftCol, y)
  doc.setFont('helvetica', 'normal')
  y += 3
  doc.text(data.carrier_name, leftCol, y)
  y += 3
  doc.text(`NIF: ${data.carrier_nif}`, leftCol, y)
  y += 3
  doc.text(data.carrier_address, leftCol, y)
  y += 3
  doc.text(`Licencia: ${data.carrier_transport_license}`, leftCol, y)

  y += 2

  // ── Sections 2 + 3 + 16 + 17 + Vehículo ────────────────────────
  const rowH = 14
  y = drawBox(doc, y, contentW, rowH, '2  CONSIGNATARIO')
  y += 1
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text(data.consignee_name, leftCol, y)
  y += 3.5
  doc.text(`NIF: ${data.consignee_nif}`, leftCol, y)
  y += 3.5
  doc.text(data.consignee_address, leftCol, y)
  y += 3.5
  doc.text(`${data.consignee_city} ${data.consignee_province}`, leftCol, y)

  y = drawBox(doc, y, contentW, rowH, '3  LUGAR DE ENTREGA DE LA MERCANCÍA')
  y += 1
  doc.text(data.delivery_address, leftCol, y)
  y += 3

  // ── Sections 4 + 5 + 18 ────────────────────────────────────────
  y = drawBox(doc, y, contentW, rowH, '4  LUGAR Y FECHA DE CARGA')
  y += 1
  doc.text(`${data.loading_address}`, leftCol, y)
  y += 3.5
  doc.text(`Fecha: ${data.loading_date}  Hora: ${data.loading_time}`, leftCol, y)
  y += 3

  y = drawBox(doc, y, contentW, 8, '5  DOCUMENTOS ANEXOS')
  y += 1
  doc.text(data.order_reference || data.tms_reference || '—', leftCol, y)
  y += 3

  // ── Vehículo ────────────────────────────────────────────────────
  y = drawBox(doc, y, contentW, 8, 'VEHÍCULO')
  y += 1
  doc.text(`Matrícula: ${data.vehicle_plate}`, leftCol, y)
  y += 3
  doc.text(`Tipo: ${data.vehicle_type}`, leftCol + 50, y)
  y += 3
  doc.text(`Conductor: ${data.driver_name}`, leftCol + 100, y)
  y += 3
  doc.text(`Licencia: ${data.driver_license}`, leftCol + 145, y)
  y += 2

  // ── Section 6-12: Mercancías table ─────────────────────────────
  y = drawBox(doc, y, contentW, 6, 'MERCANCÍAS')
  y += 0.5

  doc.autoTable({
    startY: y,
    head: [
      [
        '6 Marca y\nnúmeros',
        '7 Nº\nbultos',
        '8 Clases de\nembalaje',
        '9 Naturaleza de la mercancía',
        '10 Nº\nEstadístico',
        '11 Peso\nbruto (kg)',
        '12 Vol.\n(m³)',
      ],
    ],
    body: [
      [
        data.marking_codes || '—',
        String(data.packages_count ?? '—'),
        data.packaging_type || '—',
        data.goods_nature + (data.goods_description ? `\n${data.goods_description}` : ''),
        '—',
        `${data.gross_weight_kg}`,
        data.volume_m3 ? `${data.volume_m3}` : '—',
      ],
    ],
    styles: {
      fontSize: 6.5,
      cellPadding: 1.5,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [245, 124, 0],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 12, halign: 'center' },
      2: { cellWidth: 20 },
      3: { cellWidth: 65 },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 14, halign: 'center' },
    },
    margin: { left: M, right: M },
    theme: 'grid',
  })
  y = doc.lastAutoTable.finalY + 3

  // ADR note
  if (data.adr_class) {
    doc.setFontSize(6)
    doc.setFont('helvetica', 'bold')
    doc.text(
      `Mercancías peligrosas: Clase ${data.adr_class}${data.adr_un_number ? ` — UN ${data.adr_un_number}` : ''}`,
      M,
      y,
    )
    y += 5
  }

  // ── Section 13: Instrucciones + Estipulaciones ─────────────────
  y = drawBox(doc, y, contentW, 6, '13  INSTRUCCIONES DEL REMITENTE / ESTIPULACIONES PARTICULARES')
  y += 1
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  if (data.special_handling) {
    doc.text(`Manipulación: ${data.special_handling}`, M + 1, y)
    y += 3.5
  }
  if (data.sealing_instructions) {
    doc.text(`Precinto: ${data.sealing_instructions}`, M + 1, y)
    y += 3.5
  }
  if (data.transit_notes) {
    doc.text(`Observaciones: ${data.transit_notes}`, M + 1, y)
    y += 3.5
  }
  if (!data.special_handling && !data.sealing_instructions && !data.transit_notes) {
    doc.text('—', M + 1, y)
    y += 3.5
  }
  y += 1

  // Arbitration clause
  doc.setFontSize(5.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 100, 100)
  doc.text(
    'LAS PARTES INTERVINIENTES EN ESTE CONTRATO SE SOMETEN EXPRESAMENTE A LA JUNTA ARBITRAL DEL TRANSPORTE DE ESTA PROVINCIA, INCLUSO EN CONTROVERSIAS QUE EXCEDAN DE 3.000 €',
    PW / 2,
    y,
    { align: 'center' },
  )
  doc.setTextColor(0, 0, 0)
  y += 5

  // ── Section 14 + 20: Precio del transporte ─────────────────────
  y = drawBox(doc, y, contentW, 6, '14  FORMA DE PAGO / PRECIO DEL TRANSPORTE')
  y += 0.5

  doc.autoTable({
    startY: y,
    head: [['Concepto', 'Importe (€)']],
    body: [
      ['Porte / Flete', `${Number(data.freight_price).toFixed(2)} €`],
      ['Supl. combustible', `${Number(data.fuel_surcharge).toFixed(2)} €`],
      ['Peajes', `${Number(data.toll_fees).toFixed(2)} €`],
      ['Esperas', `${Number(data.waiting_fees).toFixed(2)} €`],
      [
        { content: 'TOTAL', styles: { fontStyle: 'bold' } },
        {
          content: `${Number(data.total_amount || data.freight_price).toFixed(2)} €`,
          styles: { fontStyle: 'bold' },
        },
      ],
    ],
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [245, 124, 0], textColor: 255 },
    columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 40, halign: 'right' } },
    margin: { left: M, right: M },
    theme: 'grid',
  })
  y = doc.lastAutoTable.finalY + 2

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  const payLabel = data.payment_terms?.toLowerCase().includes('debido')
    ? 'Porte debido'
    : 'Porte pagado'
  doc.text(`Forma de pago: ${payLabel} — ${data.payment_terms}`, M + 1, y)
  y += 4

  // ── Section 15: Formalizado + Reembolso ────────────────────────
  y = drawBox(doc, y, contentW, 8, '15  FORMALIZADO / REEMBOLSO')
  y += 1
  doc.text(`Formalizado en: ${data.issue_place} el ${data.issue_date}`, M + 1, y)
  y += 4
  doc.text('Reembolso: —', M + 1, y)
  y += 4

  // ── Section 18: Reservas ───────────────────────────────────────
  y = drawBox(doc, y, contentW, 12, '18  RESERVAS Y OBSERVACIONES DEL PORTADOR')
  y += 1
  doc.text(data.damage_notes || data.condition_notes || 'Sin reservas', M + 1, y)
  y += 5

  // ── Signatures ──────────────────────────────────────────────────
  y = Math.max(y, PH - 62)
  y = drawBox(doc, y, contentW, 6, 'FIRMAS')
  y += 1

  const sigW = contentW / 3 - 4
  const sigPositions = [
    { label: '21 REMITENTE/CARGADOR', name: data.shipper_name },
    { label: '23 TRANSPORTISTA', name: data.carrier_name },
    { label: '24 CONSIGNATARIO', name: data.consignee_name },
  ]
  sigPositions.forEach((sig, i) => {
    const x = M + 2 + i * (sigW + 4)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'bold')
    doc.text(sig.label, x, y)
    y += 3
    doc.setFont('helvetica', 'normal')
    doc.text(sig.name || '', x, y)
    y += 3
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.3)
    doc.line(x, y, x + sigW, y)
    y += 3
    doc.setFontSize(5.5)
    doc.text('Firma y sello', x, y)
    y += 3
    doc.text('Fecha: ___/___/______', x, y)
    y -= 9 // reset y for next column
  })

  return doc
}

function drawBox(doc, y, width, height, title) {
  doc.setDrawColor(100, 100, 100)
  doc.setLineWidth(0.3)
  doc.rect(M, y, width, height)

  if (title) {
    doc.setFillColor(245, 124, 0)
    doc.rect(M, y, width, 5, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(title, M + 1, y + 3.5)
    doc.setTextColor(0, 0, 0)
    return y + 5
  }
  return y
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
