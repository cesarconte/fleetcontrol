/**
 * FleetControl — Export XLSX
 *
 * Generate Excel reports using ExcelJS.
 * Supports title, multiple sheets, KPI summary, and data tables.
 *
 * @see PRD §4.9 — Todos los reportes exportables
 */

import ExcelJS from 'exceljs'

/**
 * Generate an XLSX file as Blob.
 * @param {string} title - Report title
 * @param {string[]} columns - Table column headers
 * @param {Array<Array>} rows - Table data rows
 * @param {object} [options]
 * @param {Array<{label: string, value: string|number}>} [options.kpis] - KPI summary
 * @param {Array<{name: string, columns: string[], rows: Array<Array>}>} [options.sheets] - Additional sheets
 * @param {string} [options.filename] - Output filename
 * @returns {Promise<Blob>}
 */
export async function exportXlsx(title, columns, rows, options = {}) {
  const { kpis = [], sheets = [], filename = '' } = options
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'FleetControl'
  workbook.created = new Date()

  // Main sheet
  const mainSheet = workbook.addWorksheet(title.slice(0, 31))

  // Title row
  mainSheet.mergeCells('A1:F1')
  const titleCell = mainSheet.getCell('A1')
  titleCell.value = title
  titleCell.font = { size: 16, bold: true }
  mainSheet.getRow(1).height = 30

  let startRow = 3

  // KPIs
  if (kpis.length > 0) {
    const kpiHeaderRow = mainSheet.getRow(startRow)
    kpis.forEach((kpi, i) => {
      const col = i * 2 + 1
      const valueCell = mainSheet.getCell(startRow, col)
      valueCell.value = kpi.value
      valueCell.font = { size: 12, bold: true }

      const labelCell = mainSheet.getCell(startRow + 1, col)
      labelCell.value = kpi.label
      labelCell.font = { size: 9, color: { argb: '88888888' } }
    })
    startRow += 3
  }

  // Data table
  if (columns.length > 0) {
    const headerRow = mainSheet.getRow(startRow)
    columns.forEach((col, i) => {
      const cell = headerRow.getCell(i + 1)
      cell.value = col
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF57C00' } }
      cell.alignment = { horizontal: 'center' }
    })

    rows.forEach((row, rowIndex) => {
      const dataRow = mainSheet.getRow(startRow + rowIndex + 1)
      row.forEach((value, colIndex) => {
        const cell = dataRow.getCell(colIndex + 1)
        cell.value = value
        if (rowIndex % 2 === 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } }
        }
      })
    })

    // Auto-width columns
    columns.forEach((col, i) => {
      const maxLen = Math.max(col.length, ...rows.map(r => String(r[i] ?? '').length))
      mainSheet.getColumn(i + 1).width = Math.min(maxLen + 4, 40)
    })
  }

  // Additional sheets
  for (const sheetDef of sheets) {
    const sheet = workbook.addWorksheet(sheetDef.name.slice(0, 31))
    const headerRow = sheet.getRow(1)
    sheetDef.columns.forEach((col, i) => {
      const cell = headerRow.getCell(i + 1)
      cell.value = col
      cell.font = { bold: true }
    })
    sheetDef.rows.forEach((row, rowIndex) => {
      const dataRow = sheet.getRow(rowIndex + 2)
      row.forEach((value, colIndex) => {
        dataRow.getCell(colIndex + 1).value = value
      })
    })
  }

  // Generate blob
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  // Auto-download if in browser
  if (typeof window !== 'undefined') {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download =
      filename ||
      `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  return blob
}
