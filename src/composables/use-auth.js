/**
 * FleetControl — useAuth Composable
 *
 * Reactive wrapper around auth store for component use.
 * Provides form helpers and redirect logic.
 */

import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useNotificationStore } from '@/stores/notifications.js'

export function useAuth() {
  const router = useRouter()
  const route = useRoute()
  const auth = useAuthStore()
  const notifications = useNotificationStore()

  const isAuthenticated = computed(() => auth.isAuthenticated)
  const isLoading = computed(() => auth.isLoading)
  const error = computed(() => auth.error)

  async function login(email, password) {
    try {
      await auth.login(email, password)
      notifications.success('Sesión iniciada correctamente')
      const redirect = route.query.redirect ?? '/'
      router.push(redirect)
    } catch {
      notifications.error(auth.error ?? 'Error al iniciar sesión')
    }
  }

  async function register(email, password, metadata = {}) {
    try {
      await auth.register(email, password, metadata)
      notifications.success('Cuenta creada correctamente')
      router.push('/')
    } catch {
      notifications.error(auth.error ?? 'Error al crear la cuenta')
    }
  }

  async function logout() {
    await auth.logout()
    notifications.info('Sesión cerrada')
    router.push('/login')
  }

  async function resetPassword(email) {
    try {
      const { apiAuth } = await import('@/services/api-auth.js')
      await apiAuth.resetPassword(email)
      notifications.success('Revisa tu correo para restablecer la contraseña')
    } catch {
      notifications.error('Error al enviar el correo de recuperación')
    }
  }

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    resetPassword,
  }
}
