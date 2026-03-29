<template>
  <v-app-bar flat elevation="0" color="surface" data-testid="app-topbar">
    <!-- Hamburger menu (mobile) -->
    <v-app-bar-nav-icon
      v-if="isMobile"
      data-testid="topbar-hamburger"
      @click="uiStore.toggleMobileDrawer()"
    />

    <!-- Breadcrumbs / Page title -->
    <v-app-bar-title class="text-body-1 font-weight-medium">
      {{ currentPageTitle }}
    </v-app-bar-title>

    <v-spacer />

    <!-- Search -->
    <v-text-field
      v-model="searchQuery"
      prepend-inner-icon="mdi-magnify"
      placeholder="Buscar..."
      variant="solo"
      density="compact"
      flat
      hide-details
      single-line
      clearable
      class="mr-4 d-none d-sm-flex"
      style="max-width: 320px"
      data-testid="topbar-search"
      @keydown.enter="handleSearch"
    />

    <!-- Notifications -->
    <v-btn
      icon
      variant="text"
      data-testid="topbar-notifications"
      @click="notificationsOpen = !notificationsOpen"
    >
      <v-badge :content="unreadAlerts" :model-value="unreadAlerts > 0" color="error">
        <v-icon>mdi-bell-outline</v-icon>
      </v-badge>
    </v-btn>

    <!-- User menu -->
    <v-menu v-model="userMenuOpen" :close-on-content-click="true">
      <template #activator="{ props }">
        <v-btn v-bind="props" icon variant="text" class="ml-2" data-testid="topbar-user-menu">
          <v-avatar color="primary" size="32">
            <span class="text-caption font-weight-bold">{{ authStore.userInitials }}</span>
          </v-avatar>
        </v-btn>
      </template>

      <v-card min-width="200">
        <v-card-text class="pa-2">
          <div class="text-body-2 font-weight-medium">{{ authStore.userName }}</div>
          <div class="text-caption text-medium-emphasis">{{ authStore.userRole }}</div>
        </v-card-text>
        <v-divider />
        <v-list density="compact" nav>
          <v-list-item
            prepend-icon="mdi-cog"
            title="Configuración"
            to="/configuracion"
            data-testid="topbar-settings"
          />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Cerrar sesión"
            data-testid="topbar-logout"
            @click="handleLogout"
          />
        </v-list>
      </v-card>
    </v-menu>
  </v-app-bar>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useUiStore } from '@/stores/ui.js'
import { useAuthStore } from '@/stores/auth.js'
import { useNotificationStore } from '@/stores/notifications.js'

const router = useRouter()
const route = useRoute()
const { mobile } = useDisplay()
const uiStore = useUiStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const isMobile = computed(() => mobile.value)
const searchQuery = ref('')
const notificationsOpen = ref(false)
const userMenuOpen = ref(false)
const unreadAlerts = ref(0)

const currentPageTitle = computed(() => {
  return route.meta.title ?? route.name ?? 'FleetControl'
})

function handleSearch() {
  if (searchQuery.value) {
    // TODO 2026-03-29: Implement global search
    notificationStore.info(`Buscando: ${searchQuery.value}`)
  }
}

async function handleLogout() {
  await authStore.logout()
  notificationStore.info('Sesión cerrada')
  router.push('/login')
}
</script>
