import { describe, it, expect, vi, beforeEach } from 'vitest'

const instances = []
vi.mock('jspdf', () => {
  class MockJsPDF {
    constructor() {
      this.internal = { pageSize: { width: 210, height: 297 } }
      this.lastAutoTable = { finalY: 100 }
      this.calls = []
      instances.push(this)
    }
    setFillColor() {
      return this
    }
    rect() {
      return this
    }
    setFontSize() {
      return this
    }
    setFont() {
      return this
    }
    setTextColor() {
      return this
    }
    text(text, x, y, options) {
      this.calls.push({ method: 'text', args: [text, x, y, options] })
      return this
    }
    setDrawColor() {
      return this
    }
    setLineWidth() {
      return this
    }
    line() {
      return this
    }
    autoTable(options) {
      this.calls.push({ method: 'autoTable', args: [options] })
      return this
    }
    getTextWidth() {
      return 10
    }
    splitTextToSize(text) {
      return [String(text)]
    }
    output() {
      return new ArrayBuffer(100)
    }
  }

  return { jsPDF: MockJsPDF }
})

vi.mock('jspdf-autotable', () => ({
  applyPlugin: vi.fn(),
}))

vi.mock('@/services/supabase-client.js', () => {
  const createChain = () => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  })

  const chains = {}
  return {
    supabase: {
      from: vi.fn(table => {
        if (!chains[table]) chains[table] = createChain()
        return chains[table]
      }),
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi.fn(() => ({
            data: { publicUrl: 'https://storage.example.com/test.pdf' },
          })),
        })),
      },
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
      },
    },
  }
})

import { generateHojaRutaDocument } from './document-hoja-ruta.js'
import { supabase } from '@/services/supabase-client.js'

/**
 * Sets up all per-table mock chains for a complete happy-path scenario.
 * Each mock is scoped to the table name to avoid ordering issues.
 *
 * @param {object} overrides - Optional overrides per table
 * @param {object} [overrides.route] - Partial route data
 * @param {object} [overrides.driver] - Partial driver data or null for missing driver
 */
function setupHappyPathMocks(overrides = {}) {
  const routesChain = supabase.from('routes')
  routesChain.select.mockReturnValue(routesChain)
  routesChain.update.mockReturnValue(routesChain)
  routesChain.eq.mockReturnValue(routesChain)
  routesChain.single.mockResolvedValueOnce({
    data: {
      id: 'route-1',
      origin_city: 'Madrid',
      destination_city: 'Barcelona',
      origin_address: 'Calle A, 1',
      destination_address: 'Calle B, 2',
      vehicle_id: 'v-1',
      driver_id: 'd-1',
      departure_date: '2026-04-01',
      departure_time: '08:00',
      estimated_arrival: '16:00',
      distance_total_km: 600,
      instructions: 'Cuidado con el puente',
      ...(overrides.route || {}),
    },
    error: null,
  })

  const vehiclesChain = supabase.from('vehicles')
  vehiclesChain.select.mockReturnValue(vehiclesChain)
  vehiclesChain.eq.mockReturnValue(vehiclesChain)
  vehiclesChain.single.mockResolvedValueOnce({
    data: { id: 'v-1', plate: '1234-ABC', brand: 'Volvo', model: 'FH16', type: 'Tractocamión' },
    error: null,
  })

  const driversChain = supabase.from('drivers')
  driversChain.select.mockReturnValue(driversChain)
  driversChain.eq.mockReturnValue(driversChain)
  if (overrides.driver === null) {
    // Simulate no driver — fetchDocumentData won't query drivers at all
    // because driver_id is null in route override
  } else {
    driversChain.single.mockResolvedValueOnce({
      data: {
        id: 'd-1',
        full_name: 'Juan García',
        license_number: 'L123',
        national_id: '12345678Z',
        ...(overrides.driver || {}),
      },
      error: null,
    })
  }

  const companyChain = supabase.from('company_settings')
  companyChain.select.mockReturnValue(companyChain)
  companyChain.maybeSingle.mockResolvedValueOnce({
    data: { company_name: 'Test S.L.' },
    error: null,
  })

  const cargoChain = supabase.from('cargo_records')
  cargoChain.select.mockReturnValue(cargoChain)
  cargoChain.eq.mockReturnValue(cargoChain)
  cargoChain.maybeSingle.mockResolvedValueOnce({
    data: { id: 'cargo-1', description: 'Mercancía', weight_kg: 1000 },
    error: null,
  })

  const templatesChain = supabase.from('document_templates')
  templatesChain.select.mockReturnValue(templatesChain)
  templatesChain.eq.mockReturnValue(templatesChain)
  templatesChain.maybeSingle.mockResolvedValueOnce({
    data: { id: 'template-hr' },
    error: null,
  })

  const generatedDocsChain = supabase.from('generated_documents')
  generatedDocsChain.insert.mockReturnValue(generatedDocsChain)
  generatedDocsChain.select.mockReturnValue(generatedDocsChain)
  generatedDocsChain.single.mockResolvedValueOnce({
    data: { id: 'gen-doc-1' },
    error: null,
  })
}

describe('document-hoja-ruta', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    instances.length = 0
  })

  it('debería ser una función exportada', () => {
    expect(typeof generateHojaRutaDocument).toBe('function')
  })

  it('debería generar hoja de ruta con routeId y datos correctos', async () => {
    setupHappyPathMocks()

    const result = await generateHojaRutaDocument({ routeId: 'route-1' })

    expect(result).toHaveProperty('url')
    expect(result).toHaveProperty('documentId')
    expect(result.filename).toMatch(/hoja_ruta.*\.pdf$/)
  })

  it('debería lanzar error si faltan campos obligatorios (ej. sin conductor)', async () => {
    setupHappyPathMocks({
      route: { driver_id: null },
      driver: null,
    })

    await expect(generateHojaRutaDocument({ routeId: 'route-1' })).rejects.toThrow(
      /Campos obligatorios faltantes: driver_name/,
    )
  })

  it('debería mapear correctamente los datos al PDF', async () => {
    setupHappyPathMocks()

    await generateHojaRutaDocument({ routeId: 'route-1' })
    const doc = instances[0]

    const texts = doc.calls.filter(c => c.method === 'text').map(c => c.args[0])

    expect(texts).toContain('HOJA DE RUTA / OPERATIVE PLAN')
    expect(texts.some(t => t.includes('1234-ABC'))).toBe(true)
    expect(texts.some(t => t.includes('Madrid'))).toBe(true)
    expect(texts.some(t => t.includes('Barcelona'))).toBe(true)
  })

  it('debería descubrir la carga automáticamente si no se proporciona cargoId', async () => {
    setupHappyPathMocks()

    const result = await generateHojaRutaDocument({ routeId: 'route-1' })
    expect(result).toHaveProperty('url')
  })
})
