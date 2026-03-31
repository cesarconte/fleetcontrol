<template>
  <div>
    <!-- Filters bar -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row dense>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Buscar por matrícula"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              data-testid="vehicles-search"
              @update:model-value="debouncedSearch"
            />
          </v-col>
          <v-col cols="6" sm="3">
            <v-select
              v-model="filterStatus"
              :items="statusOptions"
              label="Estado"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              data-testid="vehicles-filter-status"
              @update:model-value="applyFilters"
            />
          </v-col>
          <v-col cols="6" sm="3">
            <v-select
              v-model="filterType"
              :items="typeOptions"
              label="Carrocería"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              data-testid="vehicles-filter-type"
              @update:model-value="applyFilters"
            />
          </v-col>
          <v-col cols="12" sm="2" class="d-flex align-center">
            <v-btn
              variant="outlined"
              block
              data-testid="vehicles-reset-filters"
              @click="resetFilters"
            >
              Limpiar
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Table (desktop) -->
    <v-card class="d-none d-md-block">
      <v-data-table-server
        v-model:items-per-page="pageSize"
        v-model:page="tablePage"
        v-model:sort-by="sortBy"
        :headers="headers"
        :items="items"
        :items-length="total"
        :loading="isLoading"
        hover
        data-testid="vehicles-table"
        @click:row="handleRowClick"
      >
        <!-- eslint-disable vue/valid-v-slot -->
        <template v-slot:item.plate="{ item }">
          <span class="font-weight-medium">{{ item.plate }}</span>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status, 'vehiculo')" size="small" variant="tonal">
            {{ getStatusLabel(item.status, 'vehiculo') }}
          </v-chip>
        </template>

        <template v-slot:item.dgt_badge="{ item }">
          <v-chip :color="getDgtColor(item.dgt_badge)" size="small" variant="flat">
            {{ getDgtLabel(item.dgt_badge) }}
          </v-chip>
        </template>

        <template v-slot:item.body_type="{ item }">
          {{ getBodyLabel(item.body_type) }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon="mdi-eye"
            size="small"
            variant="text"
            data-testid="vehicles-view"
            :to="{ name: 'VehicleDetail', params: { id: item.id } }"
          />
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            data-testid="vehicles-edit"
            :to="{ name: 'VehicleEdit', params: { id: item.id } }"
          />
        </template>

        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <v-icon size="48" color="grey">mdi-truck-outline</v-icon>
            <p class="text-body-1 mt-4 text-medium-emphasis">No hay vehículos registrados</p>
            <v-btn
              color="primary"
              class="mt-4"
              :to="{ name: 'VehicleCreate' }"
              data-testid="vehicles-empty-create"
            >
              Añadir primer vehículo
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Cards (mobile) -->
    <div class="d-md-none">
      <VehicleCard v-for="vehicle in items" :key="vehicle.id" :vehicle="vehicle" class="mb-3" />
      <div v-if="!isLoading && items.length === 0" class="text-center pa-8">
        <v-icon size="48" color="grey">mdi-truck-outline</v-icon>
        <p class="text-body-1 mt-4 text-medium-emphasis">No hay vehículos registrados</p>
      </div>
      <div v-if="totalPages > 1" class="d-flex justify-center mt-4">
        <v-pagination v-model="tablePage" :length="totalPages" :total-visible="5" rounded />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useVehicles } from '@/composables/use-vehicles.js'
import { getStatusColor, getStatusLabel, getDgtColor, getDgtLabel } from '@/utils/status-helpers.js'
import { getBodyOptions, getBodyLabel } from '@/constants/vehicle-types.js'
import VehicleCard from './VehicleCard.vue'

const router = useRouter()
const {
  items,
  total,
  totalPages,
  isLoading,
  page,
  pageSize,
  fetch,
  setFilters,
  resetFilters: resetFn,
} = useVehicles()

const searchQuery = ref('')
const filterStatus = ref(null)
const filterType = ref(null)
const tablePage = ref(1)
const sortBy = ref([{ key: 'plate', order: 'asc' }])

let searchTimer = null

const headers = [
  { title: 'Matrícula', key: 'plate', sortable: true },
  { title: 'Marca', key: 'brand', sortable: true },
  { title: 'Modelo', key: 'model', sortable: true },
  { title: 'Carrocería', key: 'body_type', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'DGT', key: 'dgt_badge', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

const statusOptions = [
  { title: 'Activo', value: 'activo' },
  { title: 'En ruta', value: 'en_ruta' },
  { title: 'En mantenimiento', value: 'en_mantenimiento' },
  { title: 'Inactivo', value: 'inactivo' },
  { title: 'Dado de baja', value: 'dado_de_baja' },
]

const typeOptions = getBodyOptions()

function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => applyFilters(), 300)
}

function applyFilters() {
  const f = {}
  if (searchQuery.value) f.search = searchQuery.value
  if (filterStatus.value) f.status = filterStatus.value
  if (filterType.value) f.body_type = filterType.value
  setFilters(f)
}

function resetFilters() {
  searchQuery.value = null
  filterStatus.value = null
  filterType.value = null
  resetFn()
}

function handleRowClick(_event, { item }) {
  router.push({ name: 'VehicleDetail', params: { id: item.id } })
}

watch(tablePage, newPage => {
  page.value = newPage
  fetch()
})

watch(sortBy, newSort => {
  if (newSort.length) {
    setFilters({ ...filters.value })
  }
})

onMounted(() => {
  fetch()
})
</script>
