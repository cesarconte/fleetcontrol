/**
 * FleetControl — export-documents.js Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { documentsToCsv, downloadCsv, generateExportFilename } from './export-documents.js'

vi.mock('@/constants/vehicle-document-types.js', () => ({
  getVehicleDocumentTypeLabel: val =>
    val === 'itv' ? 'ITV — Inspección Técnica de Vehículos' : val,
}))

vi.mock('@/constants/driver-document-types.js', () => ({
  getDriverDocumentTypeLabel: val =>
    val === 'cap' ? 'CAP — Certificado de Aptitud Profesional' : val,
}))

vi.mock('@/constants/transport-document-types.js', () => ({
  getTransportDocumentTypeLabel: val => (val === 'cmr' ? 'Carta de Porte CMR' : val),
}))

describe('export-documents.js', () => {
  describe('documentsToCsv', () => {
    it('debería incluir BOM UTF-8 al inicio', () => {
      const csv = documentsToCsv([], 'vehicle')
      expect(csv.charCodeAt(0)).toBe(0xfeff)
    })

    it('debería usar punto y coma como separador', () => {
      const csv = documentsToCsv([], 'vehicle')
      const lines = csv.split('\n')
      expect(lines[0].includes(';')).toBe(true)
    })

    it('debería generar headers correctos para vehicle', () => {
      const csv = documentsToCsv([], 'vehicle')
      const header = csv.replace('\uFEFF', '').split('\n')[0]
      expect(header).toContain('Vehículo')
      expect(header).toContain('Tipo documento')
      expect(header).toContain('Estado')
    })

    it('debería generar headers correctos para driver', () => {
      const csv = documentsToCsv([], 'driver')
      const header = csv.replace('\uFEFF', '').split('\n')[0]
      expect(header).toContain('Conductor')
      expect(header).toContain('Tipo documento')
    })

    it('debería generar headers correctos para transport', () => {
      const csv = documentsToCsv([], 'transport')
      const header = csv.replace('\uFEFF', '').split('\n')[0]
      expect(header).toContain('Ruta')
      expect(header).toContain('Fecha generación')
    })

    it('debería formatear datos de vehículo correctamente', () => {
      const docs = [
        {
          doc_type: 'itv',
          status: 'valid',
          reference_number: 'REF-001',
          issue_date: '2026-01-15',
          expiry_date: '2027-01-15',
          file_name: 'itv.pdf',
          vehicles: { plate: '1234-BCD', brand: 'Volvo', model: 'FH' },
        },
      ]

      const csv = documentsToCsv(docs, 'vehicle')
      const lines = csv.replace('\uFEFF', '').split('\n')

      expect(lines).toHaveLength(2) // header + 1 data row
      expect(lines[1]).toContain('1234-BCD')
      expect(lines[1]).toContain('Volvo')
      expect(lines[1]).toContain('valid')
    })

    it('debería formatear datos de conductor correctamente', () => {
      const docs = [
        {
          doc_type: 'cap',
          status: 'expiring_soon',
          reference_number: 'CAP-001',
          issue_date: '2021-05-01',
          expiry_date: '2026-05-01',
          file_name: 'cap.pdf',
          drivers: { full_name: 'Juan García', national_id: '12345678A' },
        },
      ]

      const csv = documentsToCsv(docs, 'driver')
      const lines = csv.replace('\uFEFF', '').split('\n')

      expect(lines).toHaveLength(2)
      expect(lines[1]).toContain('Juan García')
    })

    it('debería formatear datos de transporte correctamente', () => {
      const docs = [
        {
          document_type: 'cmr',
          generated_at: '2026-04-01T10:30:00Z',
          generated_by: 'user-1',
          routes: { origin_city: 'Madrid', destination_city: 'Barcelona' },
        },
      ]

      const csv = documentsToCsv(docs, 'transport')
      const lines = csv.replace('\uFEFF', '').split('\n')

      expect(lines).toHaveLength(2)
      expect(lines[1]).toContain('Madrid')
      expect(lines[1]).toContain('Barcelona')
    })

    it('debería escapar celdas con punto y coma', () => {
      const docs = [
        {
          doc_type: 'itv',
          status: 'valid',
          reference_number: 'REF;001',
          issue_date: null,
          expiry_date: null,
          file_name: '',
          vehicles: { plate: '1234-BCD', brand: '', model: '' },
        },
      ]

      const csv = documentsToCsv(docs, 'vehicle')
      const lines = csv.replace('\uFEFF', '').split('\n')

      expect(lines[1]).toContain('"REF;001"')
    })

    it('debería manejar documentos vacíos sin error', () => {
      const csv = documentsToCsv([], 'vehicle')
      expect(csv).toBeTruthy()
      const lines = csv.replace('\uFEFF', '').split('\n')
      expect(lines).toHaveLength(1) // only header
    })
  })

  describe('downloadCsv', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      global.URL.createObjectURL = vi.fn(() => 'blob:test')
      global.URL.revokeObjectURL = vi.fn()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('debería crear blob y trigger download', () => {
      const clickSpy = vi.fn()
      vi.stubGlobal('document', {
        createElement: vi.fn(() => ({ click: clickSpy, href: '', download: '' })),
      })

      downloadCsv('test,content', 'test-file')

      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
    })
  })

  describe('generateExportFilename', () => {
    it('debería generar nombre con formato fleetcontrol-documentos-YYYYMMDD', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-04-03T10:00:00Z'))

      const filename = generateExportFilename()

      expect(filename).toBe('fleetcontrol-documentos-20260403')

      vi.useRealTimers()
    })
  })
})
