import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/api-vehicle-documents.js', () => ({
  apiVehicleDocuments: {
    getByVehicle: vi.fn(),
  },
}))

import { useVehicleDocuments } from './use-vehicle-documents.js'
import { apiVehicleDocuments } from '@/services/api-vehicle-documents.js'

const mockDocs = [
  { id: '1', vehicle_id: 'v-1', doc_type: 'itv', status: 'valid', expiry_date: '2027-01-01' },
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
})
