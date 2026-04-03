import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/supabase-client.js', () => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
  }

  return {
    supabase: {
      from: vi.fn(() => chain),
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi.fn(() => ({
            data: { publicUrl: 'https://storage.example.com/test.pdf' },
          })),
          remove: vi.fn().mockResolvedValue({ error: null }),
        })),
      },
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
          error: null,
        }),
      },
    },
  }
})

vi.mock('jspdf', () => {
  class MockJsPDF {
    constructor() {
      this.internal = { pageSize: { width: 210, height: 297 } }
      this.lastAutoTable = { finalY: 100 }
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
    setLineWidth() {
      return this
    }
    text() {
      return this
    }
    line() {
      return this
    }
    autoTable() {
      return this
    }
    save() {
      return this
    }
    output() {
      return new ArrayBuffer(100)
    }
  }
  return { default: MockJsPDF }
})

vi.mock('jspdf-autotable', () => ({}))

vi.mock('./api-document-templates.js', () => ({
  apiDocumentTemplates: {
    getByType: vi.fn().mockResolvedValue({
      id: 'template-1',
      document_type: 'cmr',
      is_active: true,
    }),
  },
  apiGeneratedDocuments: {},
}))

import { generateDocument } from './document-generator.js'
import { supabase } from '@/services/supabase-client.js'
import { apiDocumentTemplates } from './api-document-templates.js'

describe('document-generator', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default chain behavior
    const chain = supabase.from()
    chain.select.mockReturnValue(chain)
    chain.insert.mockReturnValue(chain)
    chain.eq.mockReturnValue(chain)
    chain.single
      .mockResolvedValueOnce({
        data: {
          id: 'route-1',
          origin_city: 'Madrid',
          destination_city: 'Barcelona',
          vehicle_id: 'v-1',
          driver_id: 'd-1',
          departure_date: '2026-04-01',
        },
        error: null,
      }) // route
      .mockResolvedValueOnce({
        data: { id: 'v-1', plate: '1234-ABC', vehicle_type: 'tractor' },
        error: null,
      }) // vehicle
      .mockResolvedValueOnce({
        data: { id: 'd-1', full_name: 'Juan García', license_number: 'L123' },
        error: null,
      }) // driver
      .mockResolvedValueOnce({
        data: { id: 'doc-1', file_url: 'https://storage.example.com/test.pdf' },
        error: null,
      }) // insert result

    chain.maybeSingle
      .mockResolvedValueOnce({
        data: { company_name: 'Test S.L.', cif: 'B12345678' },
        error: null,
      }) // company
      .mockResolvedValueOnce({
        data: { id: 'cargo-1', description: 'Mercancía', weight_kg: 1000 },
        error: null,
      }) // cargo
  })

  it('debería ser una función exportada', () => {
    expect(typeof generateDocument).toBe('function')
  })

  it('debería aceptar un objeto con documentType y routeId', async () => {
    const result = await generateDocument({ documentType: 'cmr', routeId: 'route-1' })
    expect(result).toBeDefined()
  })

  it('debería devolver url, documentId y filename', async () => {
    const result = await generateDocument({ documentType: 'cmr', routeId: 'route-1' })
    expect(result).toHaveProperty('url')
    expect(result).toHaveProperty('documentId')
    expect(result).toHaveProperty('filename')
  })

  it('debería generar filename con extensión .pdf', async () => {
    const result = await generateDocument({ documentType: 'cmr', routeId: 'route-1' })
    expect(result.filename).toMatch(/\.pdf$/)
  })

  it('debería incluir el tipo de documento en el filename', async () => {
    const result = await generateDocument({ documentType: 'cmr', routeId: 'route-1' })
    expect(result.filename).toMatch(/cmr/)
  })

  it('debería buscar la plantilla por tipo de documento', async () => {
    await generateDocument({ documentType: 'cmr', routeId: 'route-1' })
    expect(apiDocumentTemplates.getByType).toHaveBeenCalledWith('cmr')
  })
})
