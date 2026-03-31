import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/api-drivers.js', () => ({
  apiDrivers: {
    getDocumentos: vi.fn(),
    subirDocumento: vi.fn(),
    eliminarDocumento: vi.fn(),
  },
}))

const mockNotifications = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  remove: vi.fn(),
  items: [],
}

vi.mock('@/stores/notifications.js', () => ({
  useNotificationStore: vi.fn(() => mockNotifications),
}))

import { useDriverDocuments } from './use-driver-documents.js'
import { apiDrivers } from '@/services/api-drivers.js'

const mockDocs = [
  { id: '1', driver_id: 'd-1', doc_type: 'cap', expiry_date: '2027-06-01' },
  { id: '2', driver_id: 'd-1', doc_type: 'tacografo', expiry_date: '2026-12-01' },
]

const DRIVER_ID = 'd-1'

describe('useDriverDocuments', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockNotifications.success.mockClear()
    mockNotifications.error.mockClear()
  })

  describe('estado inicial', () => {
    it('debería tener documentos vacío', () => {
      const { documentos } = useDriverDocuments(DRIVER_ID)
      expect(documentos.value).toEqual([])
    })

    it('debería tener isLoading en false', () => {
      const { isLoading } = useDriverDocuments(DRIVER_ID)
      expect(isLoading.value).toBe(false)
    })

    it('debería tener isUploading en false', () => {
      const { isUploading } = useDriverDocuments(DRIVER_ID)
      expect(isUploading.value).toBe(false)
    })

    it('debería tener error en null', () => {
      const { error } = useDriverDocuments(DRIVER_ID)
      expect(error.value).toBeNull()
    })
  })

  describe('getEstadoDocumento', () => {
    it('debería retornar sin_fecha si la fecha es null', () => {
      const { getEstadoDocumento } = useDriverDocuments(DRIVER_ID)
      const result = getEstadoDocumento(null)

      expect(result).toEqual({ status: 'sin_fecha', label: 'Sin fecha', color: 'grey' })
    })

    it('debería retornar vencido si la fecha ya pasó', () => {
      const { getEstadoDocumento } = useDriverDocuments(DRIVER_ID)
      const pastDate = '2020-01-01'
      const result = getEstadoDocumento(pastDate)

      expect(result.status).toBe('vencido')
      expect(result.color).toBe('error')
    })

    it('debería retornar critico si quedan 7 días o menos', () => {
      const { getEstadoDocumento } = useDriverDocuments(DRIVER_ID)
      const nearDate = new Date()
      nearDate.setDate(nearDate.getDate() + 5)
      const result = getEstadoDocumento(nearDate.toISOString())

      expect(result.status).toBe('critico')
      expect(result.color).toBe('error')
    })

    it('debería retornar proximo_a_vencer si quedan entre 8 y 30 días', () => {
      const { getEstadoDocumento } = useDriverDocuments(DRIVER_ID)
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 20)
      const result = getEstadoDocumento(futureDate.toISOString())

      expect(result.status).toBe('proximo_a_vencer')
      expect(result.color).toBe('warning')
    })

    it('debería retornar en_regla si quedan más de 30 días', () => {
      const { getEstadoDocumento } = useDriverDocuments(DRIVER_ID)
      const farDate = new Date()
      farDate.setDate(farDate.getDate() + 90)
      const result = getEstadoDocumento(farDate.toISOString())

      expect(result.status).toBe('en_regla')
      expect(result.color).toBe('success')
    })
  })

  describe('cargarDocumentos', () => {
    it('debería cargar documentos correctamente', async () => {
      apiDrivers.getDocumentos.mockResolvedValue(mockDocs)
      const { documentos, cargarDocumentos } = useDriverDocuments(DRIVER_ID)

      await cargarDocumentos()

      expect(apiDrivers.getDocumentos).toHaveBeenCalledWith(DRIVER_ID)
      expect(documentos.value).toEqual(mockDocs)
    })

    it('debería establecer isLoading durante la carga', async () => {
      let resolvePromise
      apiDrivers.getDocumentos.mockReturnValue(
        new Promise(resolve => {
          resolvePromise = resolve
        }),
      )
      const { isLoading, cargarDocumentos } = useDriverDocuments(DRIVER_ID)

      const promise = cargarDocumentos()
      expect(isLoading.value).toBe(true)

      resolvePromise(mockDocs)
      await promise
      expect(isLoading.value).toBe(false)
    })

    it('debería establecer error y notificar si falla', async () => {
      const err = new Error('Network error')
      apiDrivers.getDocumentos.mockRejectedValue(err)
      const { error, cargarDocumentos } = useDriverDocuments(DRIVER_ID)

      await cargarDocumentos()

      expect(error.value).toBe(err)
      expect(mockNotifications.error).toHaveBeenCalledWith(
        'Error al cargar los documentos del conductor',
      )
    })

    it('no debería hacer nada si no hay driverId', async () => {
      const { cargarDocumentos } = useDriverDocuments(null)

      await cargarDocumentos()

      expect(apiDrivers.getDocumentos).not.toHaveBeenCalled()
    })
  })

  describe('subirDocumento', () => {
    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const mockMetadata = { doc_type: 'cap', expiry_date: '2027-01-01' }
    const mockNewDoc = { id: '3', driver_id: DRIVER_ID, doc_type: 'cap', expiry_date: '2027-01-01' }

    it('debería subir documento y prepend a la lista', async () => {
      apiDrivers.subirDocumento.mockResolvedValue(mockNewDoc)
      const { documentos, subirDocumento } = useDriverDocuments(DRIVER_ID)

      documentos.value = [...mockDocs]
      await subirDocumento(mockFile, mockMetadata)

      expect(apiDrivers.subirDocumento).toHaveBeenCalledWith(DRIVER_ID, mockFile, mockMetadata)
      expect(documentos.value[0]).toEqual(mockNewDoc)
      expect(documentos.value).toHaveLength(3)
    })

    it('debería notificar éxito al subir', async () => {
      apiDrivers.subirDocumento.mockResolvedValue(mockNewDoc)
      const { subirDocumento } = useDriverDocuments(DRIVER_ID)

      await subirDocumento(mockFile, mockMetadata)

      expect(mockNotifications.success).toHaveBeenCalledWith('Documento subido correctamente')
    })

    it('debería retornar el documento creado', async () => {
      apiDrivers.subirDocumento.mockResolvedValue(mockNewDoc)
      const { subirDocumento } = useDriverDocuments(DRIVER_ID)

      const result = await subirDocumento(mockFile, mockMetadata)

      expect(result).toEqual(mockNewDoc)
    })

    it('debería establecer isUploading durante la subida', async () => {
      let resolvePromise
      apiDrivers.subirDocumento.mockReturnValue(
        new Promise(resolve => {
          resolvePromise = resolve
        }),
      )
      const { isUploading, subirDocumento } = useDriverDocuments(DRIVER_ID)

      const promise = subirDocumento(mockFile, mockMetadata)
      expect(isUploading.value).toBe(true)

      resolvePromise(mockNewDoc)
      await promise
      expect(isUploading.value).toBe(false)
    })

    it('debería lanzar error y notificar si falla', async () => {
      const err = new Error('Upload failed')
      apiDrivers.subirDocumento.mockRejectedValue(err)
      const { error, subirDocumento } = useDriverDocuments(DRIVER_ID)

      await expect(subirDocumento(mockFile, mockMetadata)).rejects.toThrow('Upload failed')
      expect(error.value).toBe(err)
      expect(mockNotifications.error).toHaveBeenCalledWith('Error al subir el documento')
    })

    it('no debería hacer nada si no hay driverId', async () => {
      const { subirDocumento } = useDriverDocuments(null)

      await subirDocumento(mockFile, mockMetadata)

      expect(apiDrivers.subirDocumento).not.toHaveBeenCalled()
    })
  })

  describe('eliminarDocumento', () => {
    it('debería eliminar documento de la lista', async () => {
      apiDrivers.eliminarDocumento.mockResolvedValue(undefined)
      const { documentos, eliminarDocumento } = useDriverDocuments(DRIVER_ID)

      documentos.value = [...mockDocs]
      await eliminarDocumento('1')

      expect(apiDrivers.eliminarDocumento).toHaveBeenCalledWith('1')
      expect(documentos.value).toHaveLength(1)
      expect(documentos.value[0].id).toBe('2')
    })

    it('debería notificar éxito al eliminar', async () => {
      apiDrivers.eliminarDocumento.mockResolvedValue(undefined)
      const { eliminarDocumento } = useDriverDocuments(DRIVER_ID)

      await eliminarDocumento('1')

      expect(mockNotifications.success).toHaveBeenCalledWith('Documento eliminado')
    })

    it('debería lanzar error y notificar si falla', async () => {
      const err = new Error('Delete failed')
      apiDrivers.eliminarDocumento.mockRejectedValue(err)
      const { error, eliminarDocumento } = useDriverDocuments(DRIVER_ID)

      await expect(eliminarDocumento('1')).rejects.toThrow('Delete failed')
      expect(error.value).toBe(err)
      expect(mockNotifications.error).toHaveBeenCalledWith('Error al eliminar el documento')
    })
  })

  describe('documentosPorTipo', () => {
    it('debería agrupar documentos por tipo', () => {
      const { documentos, documentosPorTipo } = useDriverDocuments(DRIVER_ID)

      documentos.value = [...mockDocs]
      const grouped = documentosPorTipo()

      expect(grouped).toHaveProperty('cap')
      expect(grouped).toHaveProperty('tacografo')
      expect(grouped.cap).toHaveLength(1)
      expect(grouped.tacografo).toHaveLength(1)
    })

    it('debería incluir estado calculado en cada documento', () => {
      const { documentos, documentosPorTipo } = useDriverDocuments(DRIVER_ID)

      documentos.value = [...mockDocs]
      const grouped = documentosPorTipo()

      expect(grouped.cap[0]).toHaveProperty('estado')
      expect(grouped.cap[0].estado).toHaveProperty('status')
      expect(grouped.cap[0].estado).toHaveProperty('color')
    })
  })
})
