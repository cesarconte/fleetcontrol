<template>
  <v-card class="vehicle-detail-panel" data-testid="vehicle-detail-panel" elevation="4">
    <v-card-title class="d-flex align-center justify-space-between">
      <span class="text-h6">{{ vehicle.vehicles?.plate || 'Sin matrícula' }}</span>
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        data-testid="close-panel"
        aria-label="Cerrar panel"
        @click="$emit('close')"
      />
    </v-card-title>

    <v-card-text class="pa-3">
      <!-- Estado -->
      <div class="mb-3">
        <v-chip :color="statusColor" size="small" class="mr-2">
          <v-icon start size="small">{{ statusIcon }}</v-icon>
          {{ statusLabel }}
        </v-chip>
        <v-chip v-if="vehicle._isOffline" color="grey" size="small">
          <v-icon start size="small">mdi-wifi-off</v-icon>
          Sin señal
        </v-chip>
      </div>

      <!-- Vehículo -->
      <v-list density="compact" class="bg-transparent pa-0">
        <v-list-item class="px-0">
          <template #prepend>
            <v-icon size="small" color="primary">mdi-truck</v-icon>
          </template>
          <v-list-item-title class="text-body-2">
            {{ vehicle.vehicles?.brand }} {{ vehicle.vehicles?.model }}
          </v-list-item-title>
        </v-list-item>

        <v-list-item v-if="assignedDriver" class="px-0">
          <template #prepend>
            <v-icon size="small" color="primary">mdi-account</v-icon>
          </template>
          <v-list-item-title class="text-body-2">{{ assignedDriver }}</v-list-item-title>
          <v-list-item-subtitle>Conductor asignado</v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <!-- Posición actual -->
      <v-divider class="my-2" />
      <div class="text-caption text-uppercase tracking-wide text-medium-emphasis mb-1">
        Posición actual
      </div>

      <v-list density="compact" class="bg-transparent pa-0">
        <v-list-item class="px-0">
          <template #prepend>
            <v-icon size="small" color="info">mdi-map-marker</v-icon>
          </template>
          <v-list-item-title class="text-body-2">
            {{ vehicle.latitude?.toFixed(6) }}, {{ vehicle.longitude?.toFixed(6) }}
          </v-list-item-title>
        </v-list-item>

        <v-list-item v-if="vehicle.speed_kph != null" class="px-0">
          <template #prepend>
            <v-icon size="small" color="info">mdi-speedometer</v-icon>
          </template>
          <v-list-item-title class="text-body-2">{{ vehicle.speed_kph }} km/h</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="vehicle.heading_degrees != null" class="px-0">
          <template #prepend>
            <v-icon size="small" color="info">mdi-compass-outline</v-icon>
          </template>
          <v-list-item-title class="text-body-2">
            {{ vehicle.heading_degrees.toFixed(0) }}°
          </v-list-item-title>
          <v-list-item-subtitle>Rumbo</v-list-item-subtitle>
        </v-list-item>

        <v-list-item v-if="vehicle.recorded_at" class="px-0">
          <template #prepend>
            <v-icon size="small" color="info">mdi-clock-outline</v-icon>
          </template>
          <v-list-item-title class="text-body-2">
            Última actualización: {{ formatTime(vehicle.recorded_at) }}
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <!-- Ruta activa -->
      <template v-if="activeRoute">
        <v-divider class="my-2" />
        <div class="text-caption text-uppercase tracking-wide text-medium-emphasis mb-1">
          Ruta activa
        </div>

        <v-list density="compact" class="bg-transparent pa-0">
          <v-list-item class="px-0">
            <template #prepend>
              <v-icon size="small" color="success">mdi-map-marker-radius-outline</v-icon>
            </template>
            <v-list-item-title class="text-body-2">{{ activeRoute.origin_city }}</v-list-item-title>
            <v-list-item-subtitle>Origen</v-list-item-subtitle>
          </v-list-item>

          <v-list-item class="px-0">
            <template #prepend>
              <v-icon size="small" color="error">mdi-map-marker-check</v-icon>
            </template>
            <v-list-item-title class="text-body-2">
              {{ activeRoute.destination_city }}
            </v-list-item-title>
            <v-list-item-subtitle>Destino</v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="activeRoute.distance_total_km" class="px-0">
            <template #prepend>
              <v-icon size="small" color="warning">mdi-ruler</v-icon>
            </template>
            <v-list-item-title class="text-body-2">
              {{ Number(activeRoute.distance_total_km).toFixed(0) }} km
            </v-list-item-title>
            <v-list-item-subtitle>Distancia total</v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="activeRoute.departure_time" class="px-0">
            <template #prepend>
              <v-icon size="small" color="warning">mdi-clock-start</v-icon>
            </template>
            <v-list-item-title class="text-body-2">
              {{ formatDateTime(activeRoute.departure_time) }}
            </v-list-item-title>
            <v-list-item-subtitle>Salida</v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="activeRoute.estimated_arrival" class="px-0">
            <template #prepend>
              <v-icon size="small" color="warning">mdi-clock-end</v-icon>
            </template>
            <v-list-item-title class="text-body-2">
              {{ formatDateTime(activeRoute.estimated_arrival) }}
            </v-list-item-title>
            <v-list-item-subtitle>ETA</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </template>

      <!-- Carga -->
      <template v-if="activeCargo">
        <v-divider class="my-2" />
        <div class="text-caption text-uppercase tracking-wide text-medium-emphasis mb-1">
          Carga actual
        </div>

        <v-list density="compact" class="bg-transparent pa-0">
          <v-list-item class="px-0">
            <template #prepend>
              <v-icon size="small" color="warning">mdi-package-variant</v-icon>
            </template>
            <v-list-item-title class="text-body-2">
              {{ activeCargo.cargo_type || '—' }}
            </v-list-item-title>
            <v-list-item-subtitle>Tipo de mercancía</v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="activeCargo.weight_kg" class="px-0">
            <template #prepend>
              <v-icon size="small" color="warning">mdi-weight</v-icon>
            </template>
            <v-list-item-title class="text-body-2">
              {{ Number(activeCargo.weight_kg).toLocaleString('es-ES') }} kg
            </v-list-item-title>
            <v-list-item-subtitle>Peso</v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="activeCargo.client_name" class="px-0">
            <template #prepend>
              <v-icon size="small" color="warning">mdi-domain</v-icon>
            </template>
            <v-list-item-title class="text-body-2">{{ activeCargo.client_name }}</v-list-item-title>
            <v-list-item-subtitle>Cliente</v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="activeCargo.cmr_number" class="px-0">
            <template #prepend>
              <v-icon size="small" color="warning">mdi-file-document</v-icon>
            </template>
            <v-list-item-title class="text-body-2">{{ activeCargo.cmr_number }}</v-list-item-title>
            <v-list-item-subtitle>CMR</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </template>

      <!-- Conductor — horas conducción -->
      <template v-if="driverHours">
        <v-divider class="my-2" />
        <div class="text-caption text-uppercase tracking-wide text-medium-emphasis mb-1">
          Conductor — Reglamento CE 561/2006
        </div>

        <v-list density="compact" class="bg-transparent pa-0">
          <v-list-item class="px-0">
            <template #prepend>
              <v-icon size="small" :color="driverHoursColor">mdi-timer</v-icon>
            </template>
            <v-list-item-title class="text-body-2">
              Conducción hoy: {{ driverHours.driving_today }}h / 9h
            </v-list-item-title>
            <v-list-item-subtitle>
              Límite diario (ampliable a 10h, máx. 2 veces/semana)
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item class="px-0">
            <template #prepend>
              <v-icon size="small" :color="driverHoursColor">mdi-calendar-clock</v-icon>
            </template>
            <v-list-item-title class="text-body-2">
              Conducción semanal: {{ driverHours.driving_week }}h / 56h
            </v-list-item-title>
            <v-list-item-subtitle>Límite semanal</v-list-item-subtitle>
          </v-list-item>

          <v-list-item class="px-0">
            <template #prepend>
              <v-icon size="small" color="info">mdi-coffee</v-icon>
            </template>
            <v-list-item-title class="text-body-2">
              Próximo descanso: {{ driverHours.next_rest }}
            </v-list-item-title>
            <v-list-item-subtitle>45 min tras 4h30min de conducción</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </template>

      <!-- Alertas activas -->
      <template v-if="activeAlerts.length > 0">
        <v-divider class="my-2" />
        <div class="text-caption text-uppercase tracking-wide text-medium-emphasis mb-1">
          Alertas activas
        </div>

        <v-alert
          v-for="alert in activeAlerts"
          :key="alert.id"
          :type="alert.type"
          variant="tonal"
          density="compact"
          class="mb-2"
        >
          {{ alert.message }}
        </v-alert>
      </template>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn
        variant="outlined"
        size="small"
        data-testid="view-detail"
        @click="$emit('view-detail', vehicle.vehicles?.id)"
      >
        Ver ficha completa
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  vehicle: { type: Object, required: true },
  activeRoute: { type: Object, default: null },
  activeCargo: { type: Object, default: null },
  driverHours: { type: Object, default: null },
  activeAlerts: { type: Array, default: () => [] },
})

defineEmits(['close', 'view-detail'])

const statusColor = computed(() => {
  if (props.vehicle._isOffline) return 'grey'
  const status = props.vehicle.vehicles?.status
  const colors = {
    on_route: 'success',
    in_maintenance: 'warning',
    active: 'info',
    inactive: 'grey',
    decommissioned: 'grey-darken-2',
  }
  return colors[status] || 'grey'
})

const statusIcon = computed(() => {
  if (props.vehicle._isOffline) return 'mdi-wifi-off'
  const status = props.vehicle.vehicles?.status
  const icons = {
    on_route: 'mdi-truck-fast',
    in_maintenance: 'mdi-wrench',
    active: 'mdi-check-circle',
    inactive: 'mdi-pause-circle',
    decommissioned: 'mdi-delete-forever',
  }
  return icons[status] || 'mdi-help-circle'
})

const statusLabel = computed(() => {
  if (props.vehicle._isOffline) return 'Sin señal'
  const status = props.vehicle.vehicles?.status
  const labels = {
    on_route: 'En Ruta',
    in_maintenance: 'Mantenimiento',
    active: 'Activo',
    inactive: 'Inactivo',
    decommissioned: 'Retirado',
  }
  return labels[status] || status || 'Desconocido'
})

const assignedDriver = computed(() => {
  return props.vehicle.vehicles?.assigned_driver_name || null
})

const driverHoursColor = computed(() => {
  if (!props.driverHours) return 'info'
  const pct = props.driverHours.driving_today / 9
  if (pct >= 0.9) return 'error'
  if (pct >= 0.75) return 'warning'
  return 'success'
})

function formatTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function formatDateTime(isoString) {
  try {
    return new Date(isoString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}
</script>

<style scoped>
.vehicle-detail-panel {
  border-radius: 8px 0 0 8px;
}
</style>
