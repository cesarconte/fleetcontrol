<template>
  <div>
    <!-- Filters bar -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row density="comfortable">
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Buscar por nombre o NIF"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              data-testid="drivers-search"
              @update:model-value="debouncedSearch"
            />
          </v-col>
          <v-col cols="6" sm="4">
            <v-select
              v-model="filterStatus"
              :items="statusOptions"
              label="Estado"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              data-testid="drivers-filter-status"
              @update:model-value="applyFilters"
            />
          </v-col>
          <v-col cols="6" sm="2" class="d-flex align-center">
            <v-btn
              variant="outlined"
              block
              data-testid="drivers-reset-filters"
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
        data-testid="drivers-table"
        @click:row="handleRowClick"
      >
        <!-- eslint-disable vue/valid-v-slot -->
        <template #item.full_name="{ item }">
          <span class="font-weight-medium">{{ item.full_name }}</span>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status, 'conductor')" size="small" variant="tonal">
            {{ getStatusLabel(item.status, 'conductor') }}
          </v-chip>
        </template>

        <template #item.birth_date="{ item }">
          {{ formatDate(item.birth_date) }}
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-eye"
            size="small"
            variant="text"
            data-testid="drivers-view"
            :to="{ name: 'DriverDetail', params: { id: item.id } }"
          />
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            data-testid="drivers-edit"
            :to="{ name: 'DriverEdit', params: { id: item.id } }"
          />
        </template>

        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <v-icon size="48" color="grey">mdi-account-off-outline</v-icon>
            <p class="text-body-1 mt-4 text-medium-emphasis">No hay conductores registrados</p>
            <v-btn
              color="primary"
              class="mt-4"
              :to="{ name: 'DriverCreate' }"
              data-testid="drivers-empty-create"
            >
              Añadir primer conductor
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Cards (mobile) -->
    <div class="d-md-none">
      <DriverCard v-for="driver in items" :key="driver.id" :driver="driver" class="mb-3" />
      <div v-if="!isLoading && items.length === 0" class="text-center pa-8">
        <v-icon size="48" color="grey">mdi-account-off-outline</v-icon>
        <p class="text-body-1 mt-4 text-medium-emphasis">No hay conductores registrados</p>
        <v-btn
          color="primary"
          class="mt-4"
          :to="{ name: 'DriverCreate' }"
          data-testid="drivers-empty-create-mobile"
        >
          Añadir primer conductor
        </v-btn>
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
import { useDrivers } from '@/composables/use-drivers.js'
import { getStatusColor, getStatusLabel } from '@/utils/status-helpers.js'
import { formatDate } from '@/utils/format-helpers.js'
import DriverCard from './DriverCard.vue'

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
} = useDrivers()

const searchQuery = ref('')
const filterStatus = ref(null)
const tablePage = ref(1)
const sortBy = ref([{ key: 'full_name', order: 'asc' }])

let searchTimer = null

const headers = [
  { title: 'Nombre', key: 'full_name', sortable: true },
  { title: 'NIF/NIE', key: 'national_id', sortable: true },
  { title: 'Teléfono', key: 'phone', sortable: false },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

const statusOptions = [
  { title: 'Activo', value: 'active' },
  { title: 'Baja temporal', value: 'temporary_leave' },
  { title: 'Baja definitiva', value: 'permanently_off' },
]

function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => applyFilters(), 300)
}

function applyFilters() {
  const f = {}
  if (searchQuery.value) f.search = searchQuery.value
  if (filterStatus.value) f.status = filterStatus.value
  setFilters(f)
}

function resetFilters() {
  searchQuery.value = null
  filterStatus.value = null
  resetFn()
}

function handleRowClick(_event, { item }) {
  router.push({ name: 'DriverDetail', params: { id: item.id } })
}

watch(tablePage, newPage => {
  page.value = newPage
  fetch()
})

onMounted(() => {
  fetch()
})
</script>
