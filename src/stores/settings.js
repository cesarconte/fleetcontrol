/**
 * FleetControl — Settings Store
 *
 * Shared state for the settings module.
 * Uses Pinia to share profiles and companySettings across components.
 *
 * @see PRD §4.10 — Configuración
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiCompanySettings } from '@/services/api-company-settings.js'
import { apiProfiles } from '@/services/api-profiles.js'
import { useNotificationStore } from '@/stores/notifications.js'
import { useAuthStore } from '@/stores/auth.js'

export const useSettingsStore = defineStore('settings', () => {
  const companySettings = ref(null)
  const profiles = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const notifications = useNotificationStore()
  const authStore = useAuthStore()

  const isAdmin = computed(() => authStore.userRole === 'admin')
  const currentRole = computed(() => authStore.userRole)

  async function fetchCompanySettings() {
    isLoading.value = true
    error.value = null
    try {
      companySettings.value = await apiCompanySettings.getSettings()
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar configuración de empresa')
    } finally {
      isLoading.value = false
    }
  }

  async function updateCompanySettings(fields) {
    if (!companySettings.value?.id) return
    error.value = null
    try {
      companySettings.value = await apiCompanySettings.updateSettings(
        companySettings.value.id,
        fields,
      )
      notifications.success('Configuración actualizada')
    } catch (err) {
      error.value = err
      notifications.error('Error al actualizar configuración')
      throw err
    }
  }

  async function fetchProfiles() {
    isLoading.value = true
    error.value = null
    try {
      profiles.value = await apiProfiles.getAll()
    } catch (err) {
      error.value = err
      notifications.error('Error al cargar usuarios')
    } finally {
      isLoading.value = false
    }
  }

  async function updateUserRole(userId, role) {
    if (!isAdmin.value) {
      notifications.error('Solo el administrador puede cambiar roles')
      return
    }
    if (userId === authStore.currentUser?.id) {
      notifications.error('No puedes cambiar tu propio rol')
      return
    }
    error.value = null
    try {
      await apiProfiles.updateRole(userId, role)
      notifications.success('Rol actualizado')
      await fetchProfiles()
    } catch (err) {
      error.value = err
      notifications.error('Error al actualizar rol')
      throw err
    }
  }

  async function deactivateUser(userId) {
    if (!isAdmin.value) {
      notifications.error('Solo el administrador puede desactivar usuarios')
      return
    }
    error.value = null
    try {
      await apiProfiles.deactivate(userId)
      notifications.success('Usuario desactivado')
      await fetchProfiles()
    } catch (err) {
      error.value = err
      notifications.error('Error al desactivar usuario')
      throw err
    }
  }

  async function reactivateUser(userId) {
    if (!isAdmin.value) {
      notifications.error('Solo el administrador puede reactivar usuarios')
      return
    }
    error.value = null
    try {
      await apiProfiles.reactivate(userId)
      notifications.success('Usuario reactivado')
      await fetchProfiles()
    } catch (err) {
      error.value = err
      notifications.error('Error al reactivar usuario')
      throw err
    }
  }

  return {
    companySettings,
    profiles,
    isLoading,
    error,
    isAdmin,
    currentRole,
    fetchCompanySettings,
    updateCompanySettings,
    fetchProfiles,
    updateUserRole,
    deactivateUser,
    reactivateUser,
  }
})
