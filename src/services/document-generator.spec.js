import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the specialized services
vi.mock('./document-cmr.js', () => ({
  generateCmrDocument: vi.fn().mockResolvedValue({
    url: 'https://storage.example.com/cmr.pdf',
    documentId: 'doc-cmr-1',
    filename: 'cmr_route1_123.pdf',
  }),
}))

vi.mock('./document-carta-porte-nacional.js', () => ({
  generateCartaPorteNacionalDocument: vi.fn().mockResolvedValue({
    url: 'https://storage.example.com/cpn.pdf',
    documentId: 'doc-cpn-1',
    filename: 'carta_porte_nacional_route1_123.pdf',
  }),
}))

vi.mock('./document-albaran.js', () => ({
  generateAlbaranDocument: vi.fn().mockResolvedValue({
    url: 'https://storage.example.com/albaran.pdf',
    documentId: 'doc-alb-1',
    filename: 'albaran_route1_123.pdf',
  }),
}))

vi.mock('./document-hoja-ruta.js', () => ({
  generateHojaRutaDocument: vi.fn().mockResolvedValue({
    url: 'https://storage.example.com/hoja_ruta.pdf',
    documentId: 'doc-hr-1',
    filename: 'hoja_ruta_route1_123.pdf',
  }),
}))

vi.mock('./document-factura.js', () => ({
  generateFacturaDocument: vi.fn().mockResolvedValue({
    url: 'https://storage.example.com/factura.pdf',
    documentId: 'doc-fac-1',
    filename: 'factura_route1_123.pdf',
  }),
}))

vi.mock('./document-pod.js', () => ({
  generatePodDocument: vi.fn().mockResolvedValue({
    url: 'https://storage.example.com/pod.pdf',
    documentId: 'doc-pod-1',
    filename: 'pod_route1_123.pdf',
  }),
}))

import { generateDocument } from './document-generator.js'
import { generateCmrDocument } from './document-cmr.js'
import { generateCartaPorteNacionalDocument } from './document-carta-porte-nacional.js'
import { generateAlbaranDocument } from './document-albaran.js'
import { generateHojaRutaDocument } from './document-hoja-ruta.js'
import { generateFacturaDocument } from './document-factura.js'
import { generatePodDocument } from './document-pod.js'

describe('document-generator (orchestrator)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debería ser una función exportada', () => {
    expect(typeof generateDocument).toBe('function')
  })

  it('debería delegar a generateCmrDocument para tipo cmr', async () => {
    const result = await generateDocument({ documentType: 'cmr', routeId: 'route-1' })
    expect(generateCmrDocument).toHaveBeenCalledWith({ routeId: 'route-1', cargoId: undefined })
    expect(result).toHaveProperty('url')
    expect(result).toHaveProperty('documentId')
    expect(result).toHaveProperty('filename')
  })

  it('debería delegar a generateCartaPorteNacionalDocument para tipo carta_porte_nacional', async () => {
    const result = await generateDocument({
      documentType: 'carta_porte_nacional',
      routeId: 'route-1',
    })
    expect(generateCartaPorteNacionalDocument).toHaveBeenCalledWith({
      routeId: 'route-1',
      cargoId: undefined,
    })
    expect(result).toHaveProperty('url')
  })

  it('debería delegar a generateAlbaranDocument para tipo albaran', async () => {
    const result = await generateDocument({ documentType: 'albaran', routeId: 'route-1' })
    expect(generateAlbaranDocument).toHaveBeenCalledWith({ routeId: 'route-1', cargoId: undefined })
    expect(result).toHaveProperty('url')
  })

  it('debería delegar a generateHojaRutaDocument para tipo hoja_ruta', async () => {
    const result = await generateDocument({ documentType: 'hoja_ruta', routeId: 'route-1' })
    expect(generateHojaRutaDocument).toHaveBeenCalledWith({
      routeId: 'route-1',
      cargoId: undefined,
    })
    expect(result).toHaveProperty('url')
  })

  it('debería delegar a generateFacturaDocument para tipo factura', async () => {
    const result = await generateDocument({ documentType: 'factura', routeId: 'route-1' })
    expect(generateFacturaDocument).toHaveBeenCalledWith({ routeId: 'route-1', cargoId: undefined })
    expect(result).toHaveProperty('url')
  })

  it('debería delegar a generatePodDocument para tipo pod', async () => {
    const result = await generateDocument({ documentType: 'pod', routeId: 'route-1' })
    expect(generatePodDocument).toHaveBeenCalledWith({ routeId: 'route-1', cargoId: undefined })
    expect(result).toHaveProperty('url')
  })

  it('debería pasar cargoId cuando se proporciona', async () => {
    await generateDocument({ documentType: 'cmr', routeId: 'route-1', cargoId: 'cargo-1' })
    expect(generateCmrDocument).toHaveBeenCalledWith({ routeId: 'route-1', cargoId: 'cargo-1' })
  })

  it('debería lanzar error para tipo de documento no soportado', async () => {
    await expect(generateDocument({ documentType: 'unknown', routeId: 'route-1' })).rejects.toThrow(
      'Tipo de documento no soportado: unknown',
    )
  })
})
