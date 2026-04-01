import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/api-company-settings.js', () => ({
  apiCompanySettings: {
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
  },
}))

vi.mock('@/services/api-profiles.js', () => ({
  apiProfiles: {
    getAll: vi.fn(),
    updateRole: vi.fn(),
    deactivate: vi.fn(),
    reactivate: vi.fn(),
  },
}))

vi.mock('@/stores/notifications.js', () => ({
  useNotificationStore: () => ({ success: vi.fn(), error: vi.fn() }),
}))

vi.mock('@/stores/auth.js', () => ({
  useAuthStore: vi.fn(() => ({
    userRole: 'admin',
    currentUser: { id: 'admin-1' },
  })),
}))

import { useSettings } from './use-settings.js'
import { apiCompanySettings } from '@/services/api-company-settings.js'
import { apiProfiles } from '@/services/api-profiles.js'

describe('useSettings', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('estado inicial', () => {
    it('debería tener companySettings en null', () => {
      const store = useSettings()
      expect(store.companySettings).toBeNull()
    })

    it('debería tener profiles vacío', () => {
      const store = useSettings()
      expect(store.profiles).toEqual([])
    })

    it('debería tener isLoading en false', () => {
      const store = useSettings()
      expect(store.isLoading).toBe(false)
    })

    it('debería tener isAdmin en true (mock)', () => {
      const store = useSettings()
      expect(store.isAdmin).toBe(true)
    })
  })

  describe('fetchCompanySettings', () => {
    it('debería cargar settings en éxito', async () => {
      const mockSettings = { id: '1', company_name: 'Test S.L.' }
      apiCompanySettings.getSettings.mockResolvedValue(mockSettings)
      const store = useSettings()

      await store.fetchCompanySettings()

      expect(store.companySettings).toEqual(mockSettings)
    })
  })

  describe('fetchProfiles', () => {
    it('debería cargar perfiles', async () => {
      const mockProfiles = [{ id: 'u1', full_name: 'Admin', role: 'admin' }]
      apiProfiles.getAll.mockResolvedValue(mockProfiles)
      const store = useSettings()

      await store.fetchProfiles()

      expect(store.profiles).toEqual(mockProfiles)
    })
  })

  describe('estado compartido', () => {
    it('debería compartir profiles entre componentes', async () => {
      const mockProfiles = [{ id: 'u1', full_name: 'Admin' }]
      apiProfiles.getAll.mockResolvedValue(mockProfiles)

      const store1 = useSettings()
      await store1.fetchProfiles()

      const store2 = useSettings()
      expect(store2.profiles).toEqual(mockProfiles)
    })
  })
})
