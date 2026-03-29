import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock Supabase client before importing the store
vi.mock('@/services/supabase-client.js', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: { id: '1', email: 'test@test.com' } },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: '1',
              email: 'test@test.com',
              full_name: 'Test User',
              role: 'traffic_manager',
            },
            error: null,
          }),
        }),
      }),
    }),
  },
}))

import { useAuthStore } from './auth.js'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('debería iniciar sin usuario autenticado', () => {
    const store = useAuthStore()
    expect(store.currentUser).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('debería indicar loading durante login', async () => {
    const store = useAuthStore()
    const promise = store.login('test@test.com', 'password123')
    expect(store.isLoading).toBe(true)
    await promise
    expect(store.isLoading).toBe(false)
  })

  it('debería establecer currentUser tras login exitoso', async () => {
    const store = useAuthStore()
    await store.login('test@test.com', 'password123')
    expect(store.currentUser).not.toBeNull()
    expect(store.currentUser.email).toBe('test@test.com')
    expect(store.isAuthenticated).toBe(true)
  })

  it('debería obtener perfil tras login', async () => {
    const store = useAuthStore()
    await store.login('test@test.com', 'password123')
    expect(store.profile).not.toBeNull()
    expect(store.profile.full_name).toBe('Test User')
    expect(store.userRole).toBe('traffic_manager')
    expect(store.userName).toBe('Test User')
  })

  it('debería calcular iniciales del nombre', async () => {
    const store = useAuthStore()
    await store.login('test@test.com', 'password123')
    expect(store.userInitials).toBe('TU')
  })

  it('debería limpiar estado con logout', async () => {
    const store = useAuthStore()
    await store.login('test@test.com', 'pass')
    await store.logout()
    expect(store.currentUser).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.error).toBeNull()
  })

  it('debería obtener sesión existente', async () => {
    const store = useAuthStore()
    const session = await store.getSession()
    expect(session).toBeDefined()
  })

  it('debería retornar iniciales "?" cuando no hay nombre', () => {
    const store = useAuthStore()
    expect(store.userInitials).toBe('?')
  })
})
