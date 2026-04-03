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
    text() {
      return this
    }
    line() {
      return this
    }
    autoTable() {
      return this
    }
    output() {
      return new ArrayBuffer(100)
    }
  }
  return { default: MockJsPDF }
})

vi.mock('jspdf-autotable', () => ({}))

import { generateHojaRutaDocument } from './document-hoja-ruta.js'
import { supabase } from '@/services/supabase-client.js'

describe('document-hoja-ruta', () => {
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
          origin_province: 'Madrid',
          destination_province: 'Barcelona',
          vehicle_id: 'v-1',
          driver_id: 'd-1',
          departure_date: '2026-04-01',
          distance_total_km: 600,
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: 'v-1', plate: '1234-ABC', brand: 'Volvo', model: 'FH16' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: 'd-1', full_name: 'Juan García', license_number: 'L123' },
        error: null,
      })
      .mockResolvedValueOnce({ data: { id: 'doc-1' }, error: null })
    chain.maybeSingle
      .mockResolvedValueOnce({ data: { company_name: 'Test S.L.' }, error: null })
      .mockResolvedValueOnce({
        data: { id: 'cargo-1', description: 'Mercancía', weight_kg: 1000 },
        error: null,
      })
  })

  it('debería ser una función exportada', () => {
    expect(typeof generateHojaRutaDocument).toBe('function')
  })

  it('debería generar hoja de ruta con routeId', async () => {
    const result = await generateHojaRutaDocument({ routeId: 'route-1' })
    expect(result).toHaveProperty('url')
    expect(result).toHaveProperty('documentId')
    expect(result).toHaveProperty('filename')
    expect(result.filename).toMatch(/hoja_ruta.*\.pdf$/)
  })
})
