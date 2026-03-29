import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase-client.js'
import { mapSupabaseError } from '@/utils/error-map.js'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const profile = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => currentUser.value !== null)
  const userRole = computed(() => profile.value?.role ?? 'readonly')
  const userName = computed(() => profile.value?.full_name ?? currentUser.value?.email ?? '')
  const userInitials = computed(() => {
    const name = userName.value
    if (!name) return '?'
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  })

  async function login(email, password) {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) throw authError
      currentUser.value = data.user
      await fetchProfile()
    } catch (err) {
      error.value = mapSupabaseError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    currentUser.value = null
    profile.value = null
    error.value = null
  }

  async function getSession() {
    const { data } = await supabase.auth.getSession()
    if (data.session?.user) {
      currentUser.value = data.session.user
      await fetchProfile()
    }
    return data.session
  }

  async function fetchProfile() {
    if (!currentUser.value) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.value.id)
      .single()
    if (data) profile.value = data
  }

  return {
    currentUser,
    profile,
    isLoading,
    error,
    isAuthenticated,
    userRole,
    userName,
    userInitials,
    userProfile: computed(() => profile.value),
    login,
    logout,
    getSession,
    fetchProfile,
  }
})
