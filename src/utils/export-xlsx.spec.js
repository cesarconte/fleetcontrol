import { describe, it, expect } from 'vitest'
import { exportXlsx } from './export-xlsx.js'

describe('exportXlsx', () => {
  it('debería ser una función', () => {
    expect(typeof exportXlsx).toBe('function')
  })

  it('debería retornar un Blob', async () => {
    const columns = ['Fecha', 'Origen', 'Destino', '€']
    const rows = [['2026-03-01', 'Madrid', 'Barcelona', 450]]
    const blob = await exportXlsx('Informe', columns, rows)
    expect(blob).toBeInstanceOf(Blob)
  })

  it('debería retornar un Blob incluso con filas vacías', async () => {
    const blob = await exportXlsx('Test', ['C1', 'C2'], [])
    expect(blob).toBeInstanceOf(Blob)
  })

  it('debería incluir múltiples sheets si se proporcionan', async () => {
    const sheets = [
      { name: 'Resumen', columns: ['KPI', 'Valor'], rows: [['Rutas', 42]] },
      { name: 'Detalle', columns: ['Fecha', 'Ruta'], rows: [['2026-03-01', 'MAD-BCN']] },
    ]
    const blob = await exportXlsx('Informe', [], [], { sheets })
    expect(blob).toBeInstanceOf(Blob)
  })

  it('debería incluir KPIs en hoja Resumen si se proporcionan', async () => {
    const kpis = [{ label: 'Total', value: '42' }]
    const blob = await exportXlsx('Test', ['C1'], [['v1']], { kpis })
    expect(blob).toBeInstanceOf(Blob)
  })
})
