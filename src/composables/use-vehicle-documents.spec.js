import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/api-vehicle-documents.js', () => ({
  apiVehicleDocuments: {
    getByVehicle: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/services/supabase-client.js', () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.url/file.pdf' } }),
        remove: vi.fn().mockResolvedValue({ error: null }),
      }),
    },
  },
}))

import { useVehicleDocuments } from './use-vehicle-documents.js'
import { apiVehicleDocuments } from '@/services/api-vehicle-documents.js'
import { supabase } from '@/services/supabase-client.js'

const mockDocs = [
  {
    id: '1',
    vehicle_id: 'v-1',
    doc_type: 'itv',
    status: 'valid',
    expiry_date: '2027-01-01',
  },
  {
    id: '2',
    vehicle_id: 'v-1',
    doc_type: 'seguro_rc',
    status: 'valid',
    expiry_date: '2027-02-01',
  },
]

describe('useVehicleDocuments', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('estado inicial', () => {
    it('debería tener documents vacío', () => {
      const { documents } = useVehicleDocuments()
      expect(documents.value).toEqual([])
    })

    it('debería tener isLoading en false', () => {
      const { isLoading } = useVehicleDocuments()
      expect(isLoading.value).toBe(false)
    })

    it('debería tener error en null', () => {
      const { error } = useVehicleDocuments()
      expect(error.value).toBeNull()
    })
  })

  describe('fetchDocuments', () => {
    it('debería cargar documentos del vehículo', async () => {
      apiVehicleDocuments.getByVehicle.mockResolvedValue(mockDocs)
      const { documents, fetchDocuments } = useVehicleDocuments()

      await fetchDocuments('v-1')

      expect(apiVehicleDocuments.getByVehicle).toHaveBeenCalledWith('v-1')
      expect(documents.value).toEqual(mockDocs)
    })

    it('debería establecer isLoading durante la carga', async () => {
      let resolvePromise
      apiVehicleDocuments.getByVehicle.mockReturnValue(
        new Promise(resolve => {
          resolvePromise = resolve
        }),
      )
      const { isLoading, fetchDocuments } = useVehicleDocuments()

      const promise = fetchDocuments('v-1')
      expect(isLoading.value).toBe(true)

      resolvePromise(mockDocs)
      await promise
      expect(isLoading.value).toBe(false)
    })

    it('debería manejar errores', async () => {
      apiVehicleDocuments.getByVehicle.mockRejectedValue(new Error('Network error'))
      const { documents, error, fetchDocuments } = useVehicleDocuments()

      await fetchDocuments('v-1')

      expect(error.value).toBe('Network error')
      expect(documents.value).toEqual([])
    })

    it('debería limpiar documentos si vehicleId es null', async () => {
      apiVehicleDocuments.getByVehicle.mockResolvedValue(mockDocs)
      const { documents, fetchDocuments } = useVehicleDocuments()

      await fetchDocuments('v-1')
      expect(documents.value).toEqual(mockDocs)

      await fetchDocuments(null)
      expect(documents.value).toEqual([])
      expect(apiVehicleDocuments.getByVehicle).toHaveBeenCalledTimes(1)
    })

    it('debería limpiar documentos si vehicleId es undefined', async () => {
      const { documents, fetchDocuments } = useVehicleDocuments()

      await fetchDocuments(undefined)

      expect(documents.value).toEqual([])
      expect(apiVehicleDocuments.getByVehicle).not.toHaveBeenCalled()
    })
  })

  describe('createDocument', () => {
    it('debería crear un documento y añadirlo a la lista', async () => {
      const newDoc = { id: '3', vehicle_id: 'v-1', doc_type: 'itv', status: 'valid' }
      apiVehicleDocuments.create.mockResolvedValue(newDoc)

      const { documents, createDocument } = useVehicleDocuments()
      const result = await createDocument({ vehicle_id: 'v-1', doc_type: 'itv' })

      expect(apiVehicleDocuments.create).toHaveBeenCalledWith({
        vehicle_id: 'v-1',
        doc_type: 'itv',
      })
      expect(result).toEqual(newDoc)
      expect(documents.value).toContainEqual(newDoc)
    })

    it('debería manejar errores al crear', async () => {
      apiVehicleDocuments.create.mockRejectedValue(new Error('Create failed'))

      const { error, createDocument } = useVehicleDocuments()

      await expect(createDocument({})).rejects.toThrow('Create failed')
      expect(error.value).toBe('Create failed')
    })
  })

  describe('updateDocument', () => {
    it('debería actualizar un documento existente', async () => {
      apiVehicleDocuments.getByVehicle.mockResolvedValue([...mockDocs])
      const updatedDoc = { ...mockDocs[0], status: 'expired' }
      apiVehicleDocuments.update.mockResolvedValue(updatedDoc)

      const { documents, fetchDocuments, updateDocument } = useVehicleDocuments()
      await fetchDocuments('v-1')

      const result = await updateDocument('1', { status: 'expired' })

      expect(apiVehicleDocuments.update).toHaveBeenCalledWith('1', { status: 'expired' })
      expect(result).toEqual(updatedDoc)
      expect(documents.value[0].status).toBe('expired')
    })

    it('debería manejar errores al actualizar', async () => {
      apiVehicleDocuments.update.mockRejectedValue(new Error('Update failed'))

      const { error, updateDocument } = useVehicleDocuments()

      await expect(updateDocument('1', {})).rejects.toThrow('Update failed')
      expect(error.value).toBe('Update failed')
    })
  })

  describe('deleteDocument', () => {
    it('debería eliminar un documento de la lista', async () => {
      apiVehicleDocuments.getByVehicle.mockResolvedValue([...mockDocs])
      apiVehicleDocuments.delete.mockResolvedValue()

      const { documents, fetchDocuments, deleteDocument } = useVehicleDocuments()
      await fetchDocuments('v-1')

      await deleteDocument('1')

      expect(apiVehicleDocuments.delete).toHaveBeenCalledWith('1')
      expect(documents.value).toHaveLength(1)
      expect(documents.value.find(d => d.id === '1')).toBeUndefined()
    })

    it('debería eliminar archivo del storage si existe file_url', async () => {
      const docWithFile = {
        ...mockDocs[0],
        file_url: 'https://test.url/vehicle-documents/v-1/itv.pdf',
      }
      apiVehicleDocuments.getByVehicle.mockResolvedValue([docWithFile])
      apiVehicleDocuments.delete.mockResolvedValue()

      const { fetchDocuments, deleteDocument } = useVehicleDocuments()
      await fetchDocuments('v-1')

      await deleteDocument('1')

      expect(supabase.storage.from).toHaveBeenCalledWith('vehicle-documents')
    })

    it('debería manejar errores al eliminar', async () => {
      apiVehicleDocuments.delete.mockRejectedValue(new Error('Delete failed'))

      const { error, deleteDocument } = useVehicleDocuments()

      await expect(deleteDocument('1')).rejects.toThrow('Delete failed')
      expect(error.value).toBe('Delete failed')
    })
  })

  describe('uploadFile', () => {
    it('debería subir un archivo y retornar la URL', async () => {
      const { uploadFile } = useVehicleDocuments()
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })

      const url = await uploadFile(mockFile, 'v-1', 'itv')

      expect(supabase.storage.from).toHaveBeenCalledWith('vehicle-documents')
      expect(url).toBe('https://test.url/file.pdf')
    })

    it('debería lanzar error si la subida falla', async () => {
      supabase.storage.from.mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: new Error('Upload failed') }),
        getPublicUrl: vi.fn(),
      })

      const { uploadFile } = useVehicleDocuments()
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })

      await expect(uploadFile(mockFile, 'v-1', 'itv')).rejects.toThrow('Upload failed')
    })
  })
})
