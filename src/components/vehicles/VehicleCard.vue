<template>
  <v-card
    :to="{ name: 'VehicleDetail', params: { id: vehicle.id } }"
    hover
    data-testid="vehicle-card"
  >
    <v-card-text>
      <div class="d-flex justify-space-between align-start mb-2">
        <div>
          <div class="text-h6 font-weight-bold">{{ vehicle.plate }}</div>
          <div class="text-body-2 text-medium-emphasis">
            {{ vehicle.brand }} {{ vehicle.model }}
          </div>
        </div>
        <v-chip :color="getStatusColor(vehicle.status)" size="small" variant="tonal">
          {{ getStatusLabel(vehicle.status) }}
        </v-chip>
      </div>

      <v-divider class="my-2" />

      <div class="d-flex justify-space-between text-caption text-medium-emphasis">
        <span>{{ getTypeLabel(vehicle.vehicle_type) }}</span>
        <span>
          <v-chip
            v-if="vehicle.dgt_badge && vehicle.dgt_badge !== 'none'"
            :color="getDgtColor(vehicle.dgt_badge)"
            size="x-small"
            variant="flat"
          >
            {{ getDgtLabel(vehicle.dgt_badge) }}
          </v-chip>
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  vehicle: { type: Object, required: true },
})

function getStatusColor(status) {
  const map = {
    active: 'success',
    in_route: 'info',
    in_maintenance: 'warning',
    inactive: 'grey',
    archived: 'grey-darken-2',
  }
  return map[status] ?? 'grey'
}

function getStatusLabel(status) {
  const map = {
    active: 'Activo',
    in_route: 'En ruta',
    in_maintenance: 'Mantenimiento',
    inactive: 'Inactivo',
    archived: 'Archivado',
  }
  return map[status] ?? status
}

function getDgtColor(badge) {
  const map = {
    zero: 'green-darken-2',
    eco: 'green',
    c: 'yellow-darken-2',
    b: 'orange',
    none: 'grey',
  }
  return map[badge] ?? 'grey'
}

function getDgtLabel(badge) {
  const map = { zero: '0', eco: 'ECO', c: 'C', b: 'B', none: '—' }
  return map[badge] ?? badge
}

function getTypeLabel(type) {
  const map = {
    tractor: 'Tractor',
    rigid: 'Rígido',
    semitrailer: 'Semirremolque',
    trailer: 'Remolque',
    tanker: 'Cisterna',
    refrigerated: 'Frigorífico',
    dump: 'Volquete',
    curtain: 'Lona',
    box: 'Furgón',
    special: 'Especial',
  }
  return map[type] ?? type
}
</script>
