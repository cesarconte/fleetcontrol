import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes.js'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async to => {
  // Lazy import to avoid circular dependency
  const { useAuthStore } = await import('@/stores/auth.js')
  const auth = useAuthStore()

  // Try to restore session on first navigation
  if (!auth.isAuthenticated) {
    await auth.getSession()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'Login' && auth.isAuthenticated) {
    return { name: 'Dashboard' }
  }
})
