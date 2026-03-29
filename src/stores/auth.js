import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => currentUser.value !== null)

  async function login(_email, _password) {
    isLoading.value = true
    error.value = null
    try {
      // TODO 2026-03-29 #1: Implement via api-auth service
      currentUser.value = { id: '1', email: _email }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    currentUser.value = null
    error.value = null
  }

  return {
    currentUser,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
  }
})
