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
    <v-menu v-model="notificationsOpen" :close-on-content-click="false" offset="10">
      <template #activator="{ props }">
        <v-btn v-bind="props" icon variant="text" data-testid="topbar-notifications">
          <v-badge :content="unreadAlerts" :model-value="unreadAlerts > 0" color="error">
            <v-icon>mdi-bell-outline</v-icon>
          </v-badge>
        </v-btn>
      </template>

      <v-card min-width="320" max-width="400" elevation="8">
        <v-card-title class="d-flex align-center pa-4">
          <span class="text-subtitle-1 font-weight-bold">Alertas</span>
          <v-spacer />
          <v-btn
            v-if="unreadAlerts > 0"
            variant="text"
            size="small"
            color="primary"
            data-testid="notifications-mark-all-read"
            @click="handleMarkAllRead"
          >
            Marcar todas leídas
          </v-btn>
        </v-card-title>
        <v-divider />

        <v-card-text v-if="alertsLoading" class="pa-4 text-center">
          <v-progress-circular indeterminate size="24" color="primary" />
        </v-card-text>

        <v-list v-else-if="recentAlerts.length > 0" density="compact" max-height="360" class="pa-0">
          <v-list-item
            v-for="alert in recentAlerts"
            :key="alert.id"
            :prepend-icon="getAlertIcon(alert)"
            :title="alert.title"
            :subtitle="formatAlertTime(alert.created_at)"
            :class="{ 'bg-surface-light': !alert.is_read }"
            @click="handleAlertClick(alert)"
          >
            <template #append>
              <v-chip :color="getAlertColor(alert.severity)" size="x-small" class="text-uppercase">
                {{ alert.severity }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>

        <v-card-text v-else class="pa-6 text-center text-medium-emphasis">
          <v-icon size="40" class="mb-2">mdi-bell-off-outline</v-icon>
          <div>No hay alertas recientes</div>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-2">
          <v-btn variant="text" block to="/alertas" @click="notificationsOpen = false">
            Ver todas las alertas
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useUiStore } from '@/stores/ui.js'
import { useAuthStore } from '@/stores/auth.js'
import { useNotificationStore } from '@/stores/notifications.js'
import { useAlerts } from '@/composables/use-alerts.js'

const router = useRouter()
const route = useRoute()
const { mobile } = useDisplay()
const uiStore = useUiStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const {
  activeCount,
  fetchActiveCount,
  items: alertItems,
  isLoading: alertsLoading,
  markAsRead,
  markAllAsRead,
  fetch,
} = useAlerts({
  sort: { col: 'created_at', asc: false },
})

const isMobile = computed(() => mobile.value)
const searchQuery = ref('')
const notificationsOpen = ref(false)
const userMenuOpen = ref(false)
const unreadAlerts = computed(() => activeCount.value)

const recentAlerts = computed(() => alertItems.value.slice(0, 10))

onMounted(() => {
  fetchActiveCount()
  fetch()
})

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

async function handleAlertClick(alert) {
  notificationsOpen.value = false
  if (!alert.is_read) {
    await markAsRead(alert.id)
  }
  router.push('/alertas')
}

async function handleMarkAllRead() {
  await markAllAsRead()
  notificationsOpen.value = false
}

function getAlertIcon(alert) {
  const icons = {
    vehicle_doc_expired: 'mdi-file-alert',
    driver_doc_expired: 'mdi-account-alert',
    driving_limit: 'mdi-clock-alert',
    maintenance_pending: 'mdi-wrench-clock',
    anomalous_consumption: 'mdi-gas-station-alert',
    vehicle_stopped: 'mdi-car-off',
    speeding: 'mdi-speedometer',
    tachograph_download: 'mdi-download-alert',
    driving_violation: 'mdi-alert-octagon',
  }
  return icons[alert.alert_type] || 'mdi-bell'
}

function getAlertColor(severity) {
  const colors = { critical: 'error', warning: 'warning', info: 'info' }
  return colors[severity] || 'grey'
}

function formatAlertTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Ahora mismo'
  if (diffMin < 60) return `Hace ${diffMin} min`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `Hace ${diffHrs}h`
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}
</script>
