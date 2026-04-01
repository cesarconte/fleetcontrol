/**
 * FleetControl — Export PDF
 *
 * Generate PDF reports using jsPDF + autoTable.
 * Supports title, subtitle, KPI summary, and data tables.
 *
 * @see PRD §4.9 — Todos los reportes exportables en PDF
 */

import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * Generate and download a PDF report.
 * @param {string} title - Report title
 * @param {string[]} columns - Table column headers
 * @param {string[][]} rows - Table data rows
 * @param {object} [options]
 * @param {Array<{label: string, value: string}>} [options.kpis] - KPI summary cards
 * @param {string} [options.subtitle] - Subtitle
 * @param {string} [options.filename] - Output filename
 */
export function exportPdf(title, columns, rows, options = {}) {
  const doc = new jsPDF()
  const { kpis = [], subtitle = '', filename = '' } = options
  const pageWidth = doc.internal.pageSize.width
  let y = 15

  // Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(title, pageWidth / 2, y, { align: 'center' })
  y += 8

  // Subtitle
  if (subtitle) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text(subtitle, pageWidth / 2, y, { align: 'center' })
    doc.setTextColor(0)
    y += 8
  }

  // Generated date
  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text(
    `Generado: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    pageWidth / 2,
    y,
    { align: 'center' },
  )
  doc.setTextColor(0)
  y += 8

  // KPI summary
  if (kpis.length > 0) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumen', 14, y)
    y += 5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const colWidth = (pageWidth - 28) / Math.min(kpis.length, 4)
    kpis.forEach((kpi, i) => {
      const col = i % 4
      const row = Math.floor(i / 4)
      const x = 14 + col * colWidth
      const ky = y + row * 12
      doc.setFont('helvetica', 'bold')
      doc.text(kpi.value, x, ky)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100)
      doc.text(kpi.label, x, ky + 4)
      doc.setTextColor(0)
    })
    y += Math.ceil(kpis.length / 4) * 12 + 4

    // Separator line
    doc.setLineWidth(0.3)
    doc.line(14, y, pageWidth - 14, y)
    y += 4
  }

  // Data table
  doc.autoTable({
    startY: y,
    head: [columns],
    body: rows,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [245, 124, 0],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 14, right: 14 },
  })

  // Save
  const outputFilename =
    filename ||
    `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(outputFilename)
}
