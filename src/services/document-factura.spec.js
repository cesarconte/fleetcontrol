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

import { generateFacturaDocument } from './document-factura.js'
import { supabase } from '@/services/supabase-client.js'

describe('document-factura', () => {
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
          price: 1000,
          iva_rate: 21,
          payment_terms: '30 días',
          client_name: 'Cliente S.A.',
          client_tax_id: 'A87654321',
          invoice_number: 'FAC-2026-001',
          invoice_date: '2026-04-01',
        },
        error: null,
      })
      .mockResolvedValueOnce({ data: { id: 'v-1', plate: '1234-ABC' }, error: null })
      .mockResolvedValueOnce({ data: { id: 'd-1', full_name: 'Juan García' }, error: null })
      .mockResolvedValueOnce({ data: { id: 'doc-1' }, error: null })
    chain.maybeSingle
      .mockResolvedValueOnce({
        data: {
          company_name: 'Test S.L.',
          cif: 'B12345678',
          address: 'Calle Test 1',
          bank_account: 'ES1234567890',
        },
        error: null,
      })
      .mockResolvedValueOnce({ data: { id: 'cargo-1', description: 'Mercancía' }, error: null })
      .mockResolvedValueOnce({
        data: { id: 'template-fac' },
        error: null,
      })
  })

  it('debería ser una función exportada', () => {
    expect(typeof generateFacturaDocument).toBe('function')
  })

  it('debería generar factura con routeId', async () => {
    const result = await generateFacturaDocument({ routeId: 'route-1' })
    expect(result).toHaveProperty('url')
    expect(result).toHaveProperty('documentId')
    expect(result).toHaveProperty('filename')
    expect(result.filename).toMatch(/factura.*\.pdf$/)
  })

  it('debería lanzar un error si faltan campos obligatorios (ej. importe de servicio)', async () => {
    const chain = supabase.from()
    chain.single.mockReset()
    chain.single
      .mockResolvedValueOnce({
        data: {
          id: 'route-1',
          origin_city: 'Madrid',
          destination_city: 'Barcelona',
          vehicle_id: 'v-1',
          driver_id: 'd-1',
          // price is missing
          iva_rate: 21,
          payment_terms: '30 días',
          client_name: '', // missing client name
          client_tax_id: 'A87654321',
          invoice_number: 'FAC-2026-001',
          invoice_date: '2026-04-01',
        },
        error: null,
      })
      .mockResolvedValueOnce({ data: { id: 'v-1', plate: '1234-ABC' }, error: null })
      .mockResolvedValueOnce({ data: { id: 'd-1', full_name: 'Juan García' }, error: null })
      .mockResolvedValueOnce({ data: { id: 'doc-1' }, error: null })

    chain.maybeSingle.mockReset()
    chain.maybeSingle
      .mockResolvedValueOnce({
        data: {
          company_name: 'Test S.L.',
          cif: 'B12345678',
          address: 'Calle Test 1',
        },
        error: null,
      })
      .mockResolvedValueOnce({ data: { id: 'cargo-1', cmr_recipient: '' }, error: null })

    await expect(generateFacturaDocument({ routeId: 'route-1' })).rejects.toThrow(
      /Campos obligatorios faltantes: recipient_name/,
    )
  })
})
