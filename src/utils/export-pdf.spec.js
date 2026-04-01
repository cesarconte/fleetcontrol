import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDoc = {
  setFontSize: vi.fn().mockReturnThis(),
  setFont: vi.fn().mockReturnThis(),
  text: vi.fn().mockReturnThis(),
  setLineWidth: vi.fn().mockReturnThis(),
  line: vi.fn().mockReturnThis(),
  setTextColor: vi.fn().mockReturnThis(),
  autoTable: vi.fn().mockReturnThis(),
  lastAutoTable: { finalY: 100 },
  save: vi.fn().mockReturnThis(),
  internal: { pageSize: { width: 210, height: 297 } },
}

vi.mock('jspdf', () => {
  return {
    default: class MockJsPDF {
      constructor() {
        Object.assign(this, mockDoc)
      }
    },
  }
})

vi.mock('jspdf-autotable', () => ({}))

import { exportPdf } from './export-pdf.js'

describe('exportPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería ser una función', () => {
    expect(typeof exportPdf).toBe('function')
  })

  it('debería llamar a save con filename', () => {
    const columns = ['Fecha', 'Origen', 'Destino', '€']
    const rows = [['2026-03-01', 'Madrid', 'Barcelona', '450']]
    exportPdf('Informe Rutas', columns, rows)
    expect(mockDoc.save).toHaveBeenCalled()
  })

  it('debería manejar filas vacías', () => {
    expect(() => exportPdf('Test', ['Col1', 'Col2'], [])).not.toThrow()
  })

  it('debería llamar a text para título', () => {
    exportPdf('Mi Informe', ['C1'], [['v1']])
    expect(mockDoc.text).toHaveBeenCalledWith(
      'Mi Informe',
      expect.any(Number),
      expect.any(Number),
      expect.anything(),
    )
  })

  it('debería llamar a autoTable con columnas y filas', () => {
    const columns = ['A', 'B']
    const rows = [['1', '2']]
    exportPdf('Test', columns, rows)
    expect(mockDoc.autoTable).toHaveBeenCalled()
  })

  it('debería incluir subtítulo si se proporciona', () => {
    exportPdf('Test', ['C1'], [['v1']], { subtitle: 'Enero 2026' })
    const textCalls = mockDoc.text.mock.calls
    const subtitles = textCalls.filter(call => call[0] === 'Enero 2026')
    expect(subtitles.length).toBe(1)
  })
})
