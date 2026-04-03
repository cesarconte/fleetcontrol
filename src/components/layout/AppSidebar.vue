<template>
  <v-navigation-drawer
    v-model="isOpen"
    :permanent="!isMobile"
    :temporary="isMobile"
    :rail="!isMobile && sidebarCollapsed"
    :scrim="isMobile"
    width="240"
    rail-width="64"
    data-testid="app-sidebar"
  >
    <!-- Logo -->
    <div
      class="pa-4 d-flex align-center"
      :class="{ 'justify-center': sidebarCollapsed && !isMobile }"
    >
      <v-icon color="primary" size="28" class="mr-2">mdi-truck-fast</v-icon>
      <span v-show="!sidebarCollapsed || isMobile" class="text-h6 font-weight-bold">
        FleetControl
      </span>
    </div>

    <v-divider class="mb-2" />

    <!-- Navigation groups -->
    <v-list density="compact" nav>
      <template v-for="group in navGroups" :key="group.title">
        <v-list-subheader v-show="!sidebarCollapsed || isMobile">
          {{ group.title }}
        </v-list-subheader>

        <v-list-item
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :active-class="'bg-primary-container'"
          rounded="lg"
          class="my-1"
          :data-testid="`nav-${item.testId}`"
        >
          <template #append>
            <v-badge v-if="item.badge" :content="item.badge" color="error" inline size="small" />
          </template>
        </v-list-item>

        <v-divider v-if="group.divider" class="my-2" />
      </template>
    </v-list>

    <!-- Spacer -->
    <template #append>
      <v-divider />

      <!-- Collapse toggle (desktop only) -->
      <v-list v-if="!isMobile" density="compact" nav>
        <v-list-item
          prepend-icon="mdi-chevron-left"
          :title="sidebarCollapsed ? '' : 'Contraer'"
          data-testid="sidebar-toggle-collapse"
          @click="uiStore.toggleSidebar()"
        >
          <template #prepend>
            <v-icon>{{ sidebarCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
          </template>
        </v-list-item>
      </v-list>

      <!-- User profile -->
      <v-list density="compact" nav>
        <v-list-item
          :prepend-avatar="undefined"
          :title="authStore.userName || 'Usuario'"
          :subtitle="authStore.userRole"
          data-testid="sidebar-user-profile"
        >
          <template #prepend>
            <v-avatar color="primary" size="36">
              <span class="text-caption font-weight-bold">{{ authStore.userInitials }}</span>
            </v-avatar>
          </template>
          <template #append>
            <v-btn
              icon="mdi-logout"
              variant="text"
              size="small"
              data-testid="sidebar-logout"
              @click="handleLogout"
            />
          </template>
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useUiStore } from '@/stores/ui.js'
import { useAuthStore } from '@/stores/auth.js'
import { useNotificationStore } from '@/stores/notifications.js'
import { useAlerts } from '@/composables/use-alerts.js'

const router = useRouter()
const { mobile } = useDisplay()
const uiStore = useUiStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const { activeCount, fetchActiveCount } = useAlerts()

const isMobile = computed(() => mobile.value)
const sidebarCollapsed = computed(() => uiStore.sidebarCollapsed)

const isOpen = computed({
  get() {
    if (isMobile.value) return uiStore.mobileDrawerOpen
    return true
  },
  set(value) {
    if (isMobile.value) uiStore.mobileDrawerOpen = value
  },
})

const alertsBadge = computed(() => {
  return activeCount.value > 0 ? activeCount.value : null
})

onMounted(() => {
  fetchActiveCount()
})

const navGroups = computed(() => [
  {
    title: 'PRINCIPAL',
    items: [{ title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/', testId: 'dashboard' }],
  },
  {
    title: 'FLOTA',
    divider: true,
    items: [
      { title: 'Vehículos', icon: 'mdi-truck', to: '/vehiculos', testId: 'vehicles' },
      { title: 'Conductores', icon: 'mdi-account-group', to: '/conductores', testId: 'drivers' },
    ],
  },
  {
    title: 'RUTAS',
    items: [{ title: 'Rutas', icon: 'mdi-map-marker-path', to: '/rutas', testId: 'routes' }],
  },
  {
    title: 'GESTIÓN',
    divider: true,
    items: [
      { title: 'Mantenimiento', icon: 'mdi-wrench', to: '/mantenimiento', testId: 'maintenance' },
      { title: 'Combustible', icon: 'mdi-gas-station', to: '/combustible', testId: 'fuel' },
      { title: 'Cargas', icon: 'mdi-package-variant-closed', to: '/cargas', testId: 'cargo' },
      { title: 'Tacógrafos', icon: 'mdi-speedometer', to: '/tacografos', testId: 'tachographs' },
      {
        title: 'Alertas',
        icon: 'mdi-bell',
        to: '/alertas',
        testId: 'alerts',
        badge: alertsBadge.value,
      },
    ],
  },
  {
    title: 'DOCUMENTACIÓN',
    items: [
      {
        title: 'Documentos',
        icon: 'mdi-file-document-multiple',
        to: '/documentacion',
        testId: 'documents',
      },
    ],
  },
  {
    title: 'INFORMES',
    items: [
      { title: 'Informes', icon: 'mdi-chart-bar', to: '/informes', testId: 'reports' },
      { title: 'Configuración', icon: 'mdi-cog', to: '/configuracion', testId: 'settings' },
    ],
  },
])

async function handleLogout() {
  await authStore.logout()
  notificationStore.info('Sesión cerrada')
  router.push('/login')
}
</script>
