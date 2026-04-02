import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock services
vi.mock('@/services/api-company-settings.js', () => ({
  apiCompanySettings: {
    getSettings: vi.fn().mockResolvedValue({
      id: 'cs-1',
      company_name: 'Test S.L.',
      alert_days_vehicle_doc: 30,
    }),
    updateSettings: vi.fn().mockResolvedValue({
      id: 'cs-1',
      company_name: 'Test S.L.',
      alert_days_vehicle_doc: 30,
    }),
  },
}))

vi.mock('@/services/api-profiles.js', () => ({
  apiProfiles: {
    getAll: vi.fn().mockResolvedValue([
      { id: 'u-admin', full_name: 'Admin', role: 'admin', is_active: true },
      { id: 'u-agent', full_name: 'Agent', role: 'traffic_agent', is_active: true },
    ]),
    updateRole: vi.fn().mockResolvedValue({ id: 'u-agent', role: 'traffic_manager' }),
    deactivate: vi.fn().mockResolvedValue({ id: 'u-agent', is_active: false }),
    reactivate: vi.fn().mockResolvedValue({ id: 'u-agent', is_active: true }),
  },
}))

// Mock notifications store
vi.mock('@/stores/notifications.js', () => ({
  useNotificationStore: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}))

// Mock Supabase client (needed by auth store)
vi.mock('@/services/supabase-client.js', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  },
}))

import { useSettingsStore } from './settings.js'
import { useAuthStore } from './auth.js'
import { apiProfiles } from '@/services/api-profiles.js'

describe('useSettingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('updateUserRole', () => {
    it('debería rechazar cambio de rol si no es admin', async () => {
      const authStore = useAuthStore()
      // Simulate non-admin user
      authStore.profile = { id: 'u-agent', role: 'traffic_manager' }

      const store = useSettingsStore()
      await store.updateUserRole('u-other', 'read_only')

      expect(apiProfiles.updateRole).not.toHaveBeenCalled()
    })

    it('debería permitir a admin cambiar rol de otro usuario', async () => {
      const authStore = useAuthStore()
      authStore.profile = { id: 'u-admin', role: 'admin' }

      const store = useSettingsStore()
      await store.updateUserRole('u-agent', 'traffic_manager')

      expect(apiProfiles.updateRole).toHaveBeenCalledWith('u-agent', 'traffic_manager')
    })

    it('debería impedir que admin se degrade a sí mismo', async () => {
      const authStore = useAuthStore()
      authStore.currentUser = { id: 'u-admin', email: 'admin@test.com' }
      authStore.profile = { id: 'u-admin', role: 'admin' }

      const store = useSettingsStore()
      await store.updateUserRole('u-admin', 'read_only')

      expect(apiProfiles.updateRole).not.toHaveBeenCalled()
    })
  })
})
