<template>
  <div>
    <!-- Filters bar -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row dense>
          <v-col cols="12" sm="4">
            <v-select
              v-model="filterVehicle"
              :items="vehicleOptions"
              label="Vehículo"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              :loading="loadingVehicles"
              data-testid="fuel-filter-vehicle"
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
              data-testid="fuel-filter-from"
              @update:model-value="applyFilters"
            />
          </v-col>
          <v-col cols="6" sm="3">
            <v-text-field
              v-model="filterDateTo"
              label="Hasta"
              type="date"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              data-testid="fuel-filter-to"
              @update:model-value="applyFilters"
            />
          </v-col>
          <v-col cols="12" sm="2" class="d-flex align-center">
            <v-btn variant="outlined" block data-testid="fuel-reset-filters" @click="resetFilters">
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
        data-testid="fuel-table"
      >
        <template #item.fecha="{ item }">
          {{ formatDate(item.fecha) }}
        </template>

        <template #item.km_al_momento="{ item }">
          {{ item.km_al_momento?.toLocaleString('es-ES') }} km
        </template>

        <template #item.litros_kg="{ item }">{{ item.litros_kg?.toFixed(1) }} L</template>

        <template #item.precio_por_litro_eur="{ item }">
          {{ item.precio_por_litro_eur?.toFixed(3) }} €/L
        </template>

        <template #item.importe_total_eur="{ item }">
          <span class="font-weight-medium">{{ item.importe_total_eur?.toFixed(2) }} €</span>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-eye"
            size="small"
            variant="text"
            data-testid="fuel-view"
            :to="{ name: 'FuelDetail', params: { id: item.id } }"
          />
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            data-testid="fuel-edit"
            :to="{ name: 'FuelEdit', params: { id: item.id } }"
          />
        </template>

        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <v-icon size="48" color="grey">mdi-gas-station</v-icon>
            <p class="text-body-1 mt-4 text-medium-emphasis">No hay repostajes registrados</p>
            <v-btn
              color="primary"
              class="mt-4"
              :to="{ name: 'FuelCreate' }"
              data-testid="fuel-empty-create"
            >
              Registrar repostaje
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Cards (mobile) -->
    <div class="d-md-none">
      <FuelCard v-for="record in items" :key="record.id" :record="record" class="mb-3" />
      <div v-if="!isLoading && items.length === 0" class="text-center pa-8">
        <v-icon size="48" color="grey">mdi-gas-station</v-icon>
        <p class="text-body-1 mt-4 text-medium-emphasis">No hay repostajes</p>
        <v-btn
          color="primary"
          class="mt-4"
          :to="{ name: 'FuelCreate' }"
          data-testid="fuel-mobile-create"
        >
          Registrar repostaje
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
import { useFuel } from '@/composables/use-fuel.js'
import { apiVehicles } from '@/services/api-vehicles.js'
import FuelCard from './FuelCard.vue'

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
} = useFuel()

const filterVehicle = ref(null)
const filterDateFrom = ref(null)
const filterDateTo = ref(null)
const tablePage = ref(1)
const sortBy = ref([{ key: 'fecha', order: 'desc' }])
const vehicleOptions = ref([])
const loadingVehicles = ref(true)

const headers = [
  { title: 'Fecha', key: 'fecha', sortable: true },
  { title: 'Vehículo', key: 'vehicle_id', sortable: false },
  { title: 'Km', key: 'km_al_momento', sortable: true },
  { title: 'Litros', key: 'litros_kg', sortable: true },
  { title: 'Precio/L', key: 'precio_por_litro_eur', sortable: true },
  { title: 'Total', key: 'importe_total_eur', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES')
}

function applyFilters() {
  const f = {}
  if (filterVehicle.value) f.vehicle_id = filterVehicle.value
  if (filterDateFrom.value) f.date_from = filterDateFrom.value
  if (filterDateTo.value) f.date_to = filterDateTo.value
  setFilters(f)
}

function resetFilters() {
  filterVehicle.value = null
  filterDateFrom.value = null
  filterDateTo.value = null
  resetFn()
}

watch(tablePage, newPage => {
  page.value = newPage
  fetch()
})

onMounted(async () => {
  fetch()
  try {
    const vehicles = await apiVehicles.getAll()
    vehicleOptions.value = vehicles.map(v => ({
      title: `${v.plate} — ${v.brand} ${v.model}`,
      value: v.id,
    }))
  } catch {
    // Silently fail
  } finally {
    loadingVehicles.value = false
  }
})
</script>
