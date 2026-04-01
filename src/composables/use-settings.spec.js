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
    updateProfile: vi.fn(),
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
      const { companySettings } = useSettings()
      expect(companySettings.value).toBeNull()
    })

    it('debería tener profiles vacío', () => {
      const { profiles } = useSettings()
      expect(profiles.value).toEqual([])
    })

    it('debería tener isLoading en false', () => {
      const { isLoading } = useSettings()
      expect(isLoading.value).toBe(false)
    })

    it('debería tener isAdmin en true (mock)', () => {
      const { isAdmin } = useSettings()
      expect(isAdmin.value).toBe(true)
    })
  })

  describe('fetchCompanySettings', () => {
    it('debería cargar settings en éxito', async () => {
      const mockSettings = { id: '1', company_name: 'Test S.L.' }
      apiCompanySettings.getSettings.mockResolvedValue(mockSettings)
      const { companySettings, fetchCompanySettings } = useSettings()

      await fetchCompanySettings()

      expect(companySettings.value).toEqual(mockSettings)
    })

    it('debería manejar error', async () => {
      apiCompanySettings.getSettings.mockRejectedValue(new Error('fail'))
      const { companySettings, fetchCompanySettings } = useSettings()

      await fetchCompanySettings()

      expect(companySettings.value).toBeNull()
    })
  })

  describe('updateCompanySettings', () => {
    it('debería actualizar settings', async () => {
      const updated = { id: '1', company_name: 'Nueva S.L.' }
      apiCompanySettings.getSettings.mockResolvedValue({ id: '1', company_name: 'Test S.L.' })
      apiCompanySettings.updateSettings.mockResolvedValue(updated)
      const { companySettings, fetchCompanySettings, updateCompanySettings } = useSettings()

      await fetchCompanySettings()
      await updateCompanySettings({ company_name: 'Nueva S.L.' })

      expect(apiCompanySettings.updateSettings).toHaveBeenCalled()
      expect(companySettings.value).toEqual(updated)
    })
  })

  describe('fetchProfiles', () => {
    it('debería cargar perfiles', async () => {
      const mockProfiles = [
        { id: 'u1', full_name: 'Admin', role: 'admin' },
        { id: 'u2', full_name: 'User', role: 'solo_lectura' },
      ]
      apiProfiles.getAll.mockResolvedValue(mockProfiles)
      const { profiles, fetchProfiles } = useSettings()

      await fetchProfiles()

      expect(profiles.value).toEqual(mockProfiles)
    })
  })

  describe('updateUserRole', () => {
    it('debería actualizar rol del usuario', async () => {
      apiProfiles.updateRole.mockResolvedValue({ id: 'u1', role: 'traffic_manager' })
      apiProfiles.getAll.mockResolvedValue([])
      const { updateUserRole } = useSettings()

      await updateUserRole('u1', 'traffic_manager')

      expect(apiProfiles.updateRole).toHaveBeenCalledWith('u1', 'traffic_manager')
    })
  })

  describe('deactivateUser', () => {
    it('debería desactivar usuario', async () => {
      apiProfiles.deactivate.mockResolvedValue({ id: 'u1', is_active: false })
      apiProfiles.getAll.mockResolvedValue([])
      const { deactivateUser } = useSettings()

      await deactivateUser('u1')

      expect(apiProfiles.deactivate).toHaveBeenCalledWith('u1')
    })
  })
})
