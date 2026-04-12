import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/supabase-client.js', () => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
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
    setFillColor() {
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
    setLineWidth() {
      return this
    }
    setDrawColor() {
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
    getTextWidth() {
      return 10
    }
    splitTextToSize() {
      return ['text']
    }
    output() {
      return new ArrayBuffer(100)
    }
  }
  return { jsPDF: MockJsPDF }
})

vi.mock('jspdf-autotable', () => ({ applyPlugin: vi.fn() }))

import { generateAlbaranDocument } from './document-albaran.js'
import { supabase } from '@/services/supabase-client.js'

describe('document-albaran', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const chain = supabase.from()
    chain.select.mockReturnValue(chain)
    chain.insert.mockReturnValue(chain)
    chain.update.mockReturnValue(chain)
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
          destination_address: 'Av. Diagonal 100',
        },
        error: null,
      })
      .mockResolvedValueOnce({ data: { id: 'v-1', plate: '1234-ABC' }, error: null })
      .mockResolvedValueOnce({ data: { id: 'd-1', full_name: 'Juan García' }, error: null })
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
          packages: 10,
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: 'template-alb' },
        error: null,
      })
  })

  it('debería ser una función exportada', () => {
    expect(typeof generateAlbaranDocument).toBe('function')
  })

  it('debería generar albarán con routeId', async () => {
    const result = await generateAlbaranDocument({ routeId: 'route-1' })
    expect(result).toHaveProperty('url')
    expect(result).toHaveProperty('documentId')
    expect(result).toHaveProperty('filename')
    expect(result.filename).toMatch(/albaran.*\.pdf$/)
  })
})
