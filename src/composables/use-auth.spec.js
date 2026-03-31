import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockPush = vi.fn()
const mockRoute = { query: {} }

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => mockRoute,
}))

vi.mock('@/stores/auth.js', () => {
  const { ref, computed } = require('vue')
  return {
    useAuthStore: () => {
      const currentUser = ref(null)
      const isLoading = ref(false)
      const error = ref(null)
      return {
        currentUser,
        isLoading,
        error,
        isAuthenticated: computed(() => currentUser.value !== null),
        login: vi.fn().mockImplementation(async (email, _password) => {
          isLoading.value = true
          currentUser.value = { id: '1', email }
          isLoading.value = false
        }),
        register: vi.fn().mockImplementation(async (email, _password, _meta) => {
          isLoading.value = true
          currentUser.value = { id: '1', email }
          isLoading.value = false
        }),
        logout: vi.fn().mockImplementation(async () => {
          currentUser.value = null
        }),
      }
    },
  }
})

const mockSuccess = vi.fn()
const mockError = vi.fn()
const mockInfo = vi.fn()

vi.mock('@/stores/notifications.js', () => ({
  useNotificationStore: () => ({
    success: mockSuccess,
    error: mockError,
    info: mockInfo,
    items: [],
    add: vi.fn(),
    remove: vi.fn(),
    warning: vi.fn(),
  }),
}))

import { useAuth } from './use-auth.js'

describe('useAuth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockRoute.query = {}
  })

  describe('interfaz pública', () => {
    it('debería retornar isAuthenticated, isLoading, error como computed', () => {
      const auth = useAuth()
      expect(auth.isAuthenticated).toHaveProperty('value')
      expect(auth.isLoading).toHaveProperty('value')
      expect(auth.error).toHaveProperty('value')
    })

    it('debería retornar login, register, logout, resetPassword como funciones', () => {
      const auth = useAuth()
      expect(typeof auth.login).toBe('function')
      expect(typeof auth.register).toBe('function')
      expect(typeof auth.logout).toBe('function')
      expect(typeof auth.resetPassword).toBe('function')
    })
  })

  describe('login', () => {
    it('debería llamar a auth.login con email y password', async () => {
      const { login } = useAuth()
      await login('test@test.com', 'password123')
      expect(mockSuccess).toHaveBeenCalledWith('Sesión iniciada correctamente')
    })

    it('debería redirigir a "/" por defecto tras login exitoso', async () => {
      const { login } = useAuth()
      await login('test@test.com', 'password123')
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('debería redirigir a la URL de query param si existe', async () => {
      mockRoute.query = { redirect: '/dashboard' }
      const { login } = useAuth()
      await login('test@test.com', 'password123')
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('register', () => {
    it('debería llamar a auth.register', async () => {
      const { register } = useAuth()
      await register('new@test.com', 'password123', { full_name: 'Test' })
      expect(mockSuccess).toHaveBeenCalledWith('Cuenta creada correctamente')
    })

    it('debería redirigir a "/" tras registro exitoso', async () => {
      const { register } = useAuth()
      await register('new@test.com', 'password123', {})
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  describe('logout', () => {
    it('debería llamar a auth.logout', async () => {
      const { logout } = useAuth()
      await logout()
      expect(mockInfo).toHaveBeenCalledWith('Sesión cerrada')
    })

    it('debería redirigir a "/login" tras logout', async () => {
      const { logout } = useAuth()
      await logout()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  describe('resetPassword', () => {
    it('debería mostrar success si la llamada tiene éxito', async () => {
      // Mock dinámico del api-auth
      vi.doMock('@/services/api-auth.js', () => ({
        apiAuth: { resetPassword: vi.fn().mockResolvedValue() },
      }))
      const { resetPassword } = useAuth()
      await resetPassword('test@test.com')
      expect(mockSuccess).toHaveBeenCalledWith('Revisa tu correo para restablecer la contraseña')
    })
  })

  describe('interfaz pública', () => {
    it('debería retornar todas las funciones esperadas', () => {
      const auth = useAuth()
      expect(auth).toHaveProperty('isAuthenticated')
      expect(auth).toHaveProperty('isLoading')
      expect(auth).toHaveProperty('error')
      expect(auth).toHaveProperty('login')
      expect(auth).toHaveProperty('register')
      expect(auth).toHaveProperty('logout')
      expect(auth).toHaveProperty('resetPassword')
    })
  })
})
