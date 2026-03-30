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
              label="Buscar por origen/destino"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              data-testid="routes-search"
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
              data-testid="routes-filter-status"
              @update:model-value="applyFilters"
            />
          </v-col>
          <v-col cols="6" sm="3">
            <v-text-field
              v-model="filterDateFrom"
              label="Desde"
              type="date"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              data-testid="routes-filter-date-from"
              @update:model-value="applyFilters"
            />
          </v-col>
          <v-col cols="12" sm="2" class="d-flex align-center">
            <v-btn
              variant="outlined"
              block
              data-testid="routes-reset-filters"
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
        data-testid="routes-table"
        @click:row="handleRowClick"
      >
        <!-- eslint-disable vue/valid-v-slot -->
        <template #item.departure_date="{ item }">
          {{ formatDate(item.departure_date) }}
        </template>

        <template #item.route="{ item }">
          <span class="font-weight-medium">{{ item.origin }} → {{ item.destination }}</span>
        </template>

        <template #item.planned_distance_km="{ item }">
          {{
            item.planned_distance_km
              ? `${item.planned_distance_km.toLocaleString('es-ES')} km`
              : '—'
          }}
        </template>

        <template #item.cargo_weight_kg="{ item }">
          {{ item.cargo_weight_kg ? `${item.cargo_weight_kg.toLocaleString('es-ES')} kg` : '—' }}
        </template>

        <template #item.total_cost_eur="{ item }">
          {{ item.total_cost_eur ? `${item.total_cost_eur.toFixed(2)} €` : '—' }}
        </template>

        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" variant="tonal">
            {{ getStatusLabel(item.status) }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-eye"
            size="small"
            variant="text"
            data-testid="routes-view"
            :to="{ name: 'RouteDetail', params: { id: item.id } }"
          />
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            data-testid="routes-edit"
            :to="{ name: 'RouteEdit', params: { id: item.id } }"
          />
        </template>

        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <v-icon size="48" color="grey">mdi-map-marker-path</v-icon>
            <p class="text-body-1 mt-4 text-medium-emphasis">No hay rutas registradas</p>
            <v-btn
              color="primary"
              class="mt-4"
              :to="{ name: 'RouteCreate' }"
              data-testid="routes-empty-create"
            >
              Planificar primera ruta
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Cards (mobile) -->
    <div class="d-md-none">
      <RouteCard v-for="route in items" :key="route.id" :route="route" class="mb-3" />
      <div v-if="!isLoading && items.length === 0" class="text-center pa-8">
        <v-icon size="48" color="grey">mdi-map-marker-path</v-icon>
        <p class="text-body-1 mt-4 text-medium-emphasis">No hay rutas registradas</p>
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
import { useRoutes } from '@/composables/use-routes.js'
import RouteCard from './RouteCard.vue'

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
} = useRoutes()

const searchQuery = ref('')
const filterStatus = ref(null)
const filterDateFrom = ref(null)
const tablePage = ref(1)
const sortBy = ref([{ key: 'departure_date', order: 'desc' }])

let searchTimer = null

const headers = [
  { title: 'Fecha', key: 'departure_date', sortable: true },
  { title: 'Ruta', key: 'route', sortable: false },
  { title: 'Distancia', key: 'planned_distance_km', sortable: true },
  { title: 'Carga (kg)', key: 'cargo_weight_kg', sortable: true },
  { title: 'Coste', key: 'total_cost_eur', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

const statusOptions = [
  { title: 'Planificada', value: 'planned' },
  { title: 'En curso', value: 'active' },
  { title: 'Completada', value: 'completed' },
  { title: 'Retrasada', value: 'delayed' },
  { title: 'Incidencia', value: 'incident' },
  { title: 'Cancelada', value: 'cancelled' },
]

function getStatusColor(status) {
  const map = {
    planned: 'info',
    active: 'success',
    completed: 'grey',
    delayed: 'warning',
    incident: 'error',
    cancelled: 'grey-darken-2',
  }
  return map[status] ?? 'grey'
}

function getStatusLabel(status) {
  const map = {
    planned: 'Planificada',
    active: 'En curso',
    completed: 'Completada',
    delayed: 'Retrasada',
    incident: 'Incidencia',
    cancelled: 'Cancelada',
  }
  return map[status] ?? status
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES')
}

function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => applyFilters(), 300)
}

function applyFilters() {
  const f = {}
  if (searchQuery.value) f.search = searchQuery.value
  if (filterStatus.value) f.status = filterStatus.value
  if (filterDateFrom.value) f.date_from = filterDateFrom.value
  setFilters(f)
}

function resetFilters() {
  searchQuery.value = null
  filterStatus.value = null
  filterDateFrom.value = null
  resetFn()
}

function handleRowClick(_event, { item }) {
  router.push({ name: 'RouteDetail', params: { id: item.id } })
}

watch(tablePage, newPage => {
  page.value = newPage
  fetch()
})

onMounted(() => {
  fetch()
})
</script>
