import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/supabase-client.js', () => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
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
        })),
      },
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
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
    setDrawColor() {
      return this
    }
    setFillColor() {
      return this
    }
    text() {
      return this
    }
    line() {
      return this
    }
    rect() {
      return this
    }
    autoTable() {
      return this
    }
    output() {
      return new ArrayBuffer(100)
    }
  }
  return { jsPDF: MockJsPDF }
})

vi.mock('jspdf-autotable', () => ({ applyPlugin: vi.fn() }))

import { generateCartaPorteNacionalDocument } from './document-carta-porte-nacional.js'
import { supabase } from '@/services/supabase-client.js'

describe('document-carta-porte-nacional', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
          price: 1200,
          payment_terms: '30 días',
          origin_address: 'Calle Alcalá 1, Madrid',
          destination_address: 'Av. Diagonal 100, Barcelona',
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: 'v-1', plate: '1234-ABC', vehicle_type: 'tractor' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: 'd-1', full_name: 'Juan García', license_number: 'L123' },
        error: null,
      })
      .mockResolvedValueOnce({ data: { id: 'doc-1' }, error: null })
    chain.maybeSingle
      .mockResolvedValueOnce({
        data: { company_name: 'Test S.L.', cif: 'B12345678', address: 'Calle Test 1' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          id: 'cargo-1',
          description: 'Mercancía',
          weight_kg: 1000,
          cmr_recipient: 'Destinatario S.L.',
          packaging_type: 'Palets',
          packages: 10,
        },
        error: null,
      })
  })

  it('debería ser una función exportada', () => {
    expect(typeof generateCartaPorteNacionalDocument).toBe('function')
  })

  it('debería generar documento con routeId', async () => {
    const result = await generateCartaPorteNacionalDocument({ routeId: 'route-1' })
    expect(result).toBeDefined()
    expect(result).toHaveProperty('url')
    expect(result).toHaveProperty('documentId')
    expect(result).toHaveProperty('filename')
    expect(result.filename).toMatch(/carta_porte_nacional.*\.pdf$/)
  })
})
