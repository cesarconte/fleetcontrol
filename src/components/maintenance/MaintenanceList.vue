<template>
  <div>
    <!-- Filters bar -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row density="comfortable">
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Buscar por descripción"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              data-testid="maintenance-search"
              @update:model-value="debouncedSearch"
            />
          </v-col>
          <v-col cols="6" sm="3">
            <v-select
              v-model="filterType"
              :items="typeOptions"
              label="Tipo"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              data-testid="maintenance-filter-type"
              @update:model-value="applyFilters"
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
              data-testid="maintenance-filter-status"
              @update:model-value="applyFilters"
            />
          </v-col>
          <v-col cols="12" sm="2" class="d-flex align-center">
            <v-btn
              variant="outlined"
              block
              data-testid="maintenance-reset-filters"
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
        data-testid="maintenance-table"
        @click:row="handleRowClick"
      >
        <template #item.maintenance_type="{ item }">
          <v-chip
            :color="item.maintenance_type === 'preventive' ? 'info' : 'warning'"
            size="small"
            variant="outlined"
          >
            {{ item.maintenance_type === 'preventive' ? 'Preventivo' : 'Correctivo' }}
          </v-chip>
        </template>

        <template #item.scheduled_date="{ item }">
          {{ formatDate(item.scheduled_date) }}
        </template>

        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" variant="tonal">
            {{ getStatusLabel(item.status) }}
          </v-chip>
        </template>

        <template #item.cost_eur="{ item }">
          {{ item.cost_eur ? `${item.cost_eur.toFixed(2)} €` : '—' }}
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-eye"
            size="small"
            variant="text"
            data-testid="maintenance-view"
            :to="{ name: 'MaintenanceDetail', params: { id: item.id } }"
          />
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            data-testid="maintenance-edit"
            :to="{ name: 'MaintenanceEdit', params: { id: item.id } }"
          />
        </template>

        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <v-icon size="48" color="grey">mdi-wrench</v-icon>
            <p class="text-body-1 mt-4 text-medium-emphasis">No hay registros de mantenimiento</p>
            <v-btn
              color="primary"
              class="mt-4"
              :to="{ name: 'MaintenanceCreate' }"
              data-testid="maintenance-empty-create"
            >
              Registrar mantenimiento
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Cards (mobile) -->
    <div class="d-md-none">
      <MaintenanceCard v-for="record in items" :key="record.id" :record="record" class="mb-3" />
      <div v-if="!isLoading && items.length === 0" class="text-center pa-8">
        <v-icon size="48" color="grey">mdi-wrench</v-icon>
        <p class="text-body-1 mt-4 text-medium-emphasis">No hay registros</p>
        <v-btn
          color="primary"
          class="mt-4"
          :to="{ name: 'MaintenanceCreate' }"
          data-testid="maintenance-mobile-create"
        >
          Registrar mantenimiento
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
import { useMaintenance } from '@/composables/use-maintenance.js'
import MaintenanceCard from './MaintenanceCard.vue'

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
} = useMaintenance()

const searchQuery = ref('')
const filterType = ref(null)
const filterStatus = ref(null)
const tablePage = ref(1)
const sortBy = ref([{ key: 'scheduled_date', order: 'desc' }])

let searchTimer = null

const headers = [
  { title: 'Tipo', key: 'maintenance_type', sortable: true },
  { title: 'Descripción', key: 'description', sortable: false },
  { title: 'Fecha prevista', key: 'scheduled_date', sortable: true },
  { title: 'Taller', key: 'workshop_name', sortable: false },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Coste', key: 'cost_eur', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

const typeOptions = [
  { title: 'Preventivo', value: 'preventive' },
  { title: 'Correctivo', value: 'corrective' },
]

const statusOptions = [
  { title: 'Pendiente', value: 'pending' },
  { title: 'En curso', value: 'in_progress' },
  { title: 'Completada', value: 'completed' },
  { title: 'Cancelada', value: 'cancelled' },
]

function getStatusColor(status) {
  const map = {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'grey',
  }
  return map[status] ?? 'grey'
}

function getStatusLabel(status) {
  const map = {
    pending: 'Pendiente',
    in_progress: 'En curso',
    completed: 'Completada',
    cancelled: 'Cancelada',
  }
  return map[status] ?? status
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES')
}

function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => applyFilters(), 300)
}

function applyFilters() {
  const f = {}
  if (searchQuery.value) f.search = searchQuery.value
  if (filterType.value) f.maintenance_type = filterType.value
  if (filterStatus.value) f.status = filterStatus.value
  setFilters(f)
}

function resetFilters() {
  searchQuery.value = null
  filterType.value = null
  filterStatus.value = null
  resetFn()
}

function handleRowClick(_event, { item }) {
  router.push({ name: 'MaintenanceDetail', params: { id: item.id } })
}

watch(tablePage, newPage => {
  page.value = newPage
  fetch()
})

onMounted(() => {
  fetch()
})
</script>
