import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/api-document-templates.js', () => ({
  apiDocumentTemplates: {
    getActiveTemplates: vi.fn().mockResolvedValue([
      { id: '1', document_type: 'cmr', name: 'CMR', is_active: true },
      { id: '2', document_type: 'albaran', name: 'Albarán', is_active: true },
    ]),
    toggleActive: vi.fn().mockResolvedValue({ id: '1', is_active: false }),
  },
  apiGeneratedDocuments: {
    getByRoute: vi
      .fn()
      .mockResolvedValue([{ id: 'doc-1', document_type: 'cmr', route_id: 'route-1' }]),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('@/services/document-generator.js', () => ({
  generateDocument: vi.fn().mockResolvedValue({
    url: 'https://storage.example.com/test.pdf',
    documentId: 'doc-1',
    filename: 'cmr_route-1.pdf',
  }),
}))

import { useDocumentTemplates } from './use-document-templates.js'
import { apiDocumentTemplates, apiGeneratedDocuments } from '@/services/api-document-templates.js'
import { generateDocument } from '@/services/document-generator.js'

describe('use-document-templates', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('debería devolver templates, isLoading, error', () => {
    const { templates, isLoading, error } = useDocumentTemplates()
    expect(templates.value).toEqual([])
    expect(isLoading.value).toBe(false)
    expect(error.value).toBe(null)
  })

  it('debería devolver isGenerating, generateError', () => {
    const { isGenerating, generateError } = useDocumentTemplates()
    expect(isGenerating.value).toBe(false)
    expect(generateError.value).toBe(null)
  })

  it('debería devolver funciones: fetchTemplates, toggleTemplate, generateDocument, deleteGeneratedDocument', () => {
    const composable = useDocumentTemplates()
    expect(typeof composable.fetchTemplates).toBe('function')
    expect(typeof composable.toggleTemplate).toBe('function')
    expect(typeof composable.generateDocument).toBe('function')
    expect(typeof composable.deleteGeneratedDocument).toBe('function')
  })

  it('fetchTemplates debería cargar plantillas activas', async () => {
    const { templates, isLoading, fetchTemplates } = useDocumentTemplates()

    await fetchTemplates()

    expect(apiDocumentTemplates.getActiveTemplates).toHaveBeenCalled()
    expect(templates.value).toHaveLength(2)
    expect(isLoading.value).toBe(false)
  })

  it('fetchTemplates debería establecer isLoading durante la carga', async () => {
    const { isLoading, fetchTemplates } = useDocumentTemplates()

    const promise = fetchTemplates()
    expect(isLoading.value).toBe(true)
    await promise
    expect(isLoading.value).toBe(false)
  })

  it('fetchTemplates debería manejar errores', async () => {
    apiDocumentTemplates.getActiveTemplates.mockRejectedValueOnce(new Error('DB error'))
    const { error, templates, fetchTemplates } = useDocumentTemplates()

    await fetchTemplates()

    expect(error.value).toBe('DB error')
    expect(templates.value).toEqual([])
  })

  it('toggleTemplate debería cambiar estado activo', async () => {
    const { toggleTemplate } = useDocumentTemplates()

    await toggleTemplate('1', false)

    expect(apiDocumentTemplates.toggleActive).toHaveBeenCalledWith('1', false)
  })

  it('generateDocument debería generar y devolver resultado', async () => {
    const { isGenerating, generateError, generateDocument: gen } = useDocumentTemplates()

    const result = await gen({ documentType: 'cmr', routeId: 'route-1' })

    expect(generateDocument).toHaveBeenCalledWith({
      documentType: 'cmr',
      routeId: 'route-1',
      cargoId: undefined,
    })
    expect(result.url).toBe('https://storage.example.com/test.pdf')
    expect(isGenerating.value).toBe(false)
    expect(generateError.value).toBe(null)
  })

  it('generateDocument debería manejar errores', async () => {
    generateDocument.mockRejectedValueOnce(new Error('PDF error'))
    const { generateError, generateDocument: gen } = useDocumentTemplates()

    await expect(gen({ documentType: 'cmr', routeId: 'route-1' })).rejects.toThrow('PDF error')
    expect(generateError.value).toBe('PDF error')
  })

  it('deleteGeneratedDocument debería eliminar documento', async () => {
    const { deleteGeneratedDocument } = useDocumentTemplates()

    await deleteGeneratedDocument('doc-1')

    expect(apiGeneratedDocuments.delete).toHaveBeenCalledWith('doc-1')
  })
})
