<template>
  <div>
    <v-card class="mb-4">
      <v-card-text>
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Buscar por descripción"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              data-testid="cargo-search"
              @update:model-value="debouncedSearch"
            />
          </v-col>
          <v-col cols="6" sm="4">
            <v-select
              v-model="filterType"
              :items="typeOptions"
              label="Tipo"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              data-testid="cargo-filter-type"
              @update:model-value="applyFilters"
            />
          </v-col>
          <v-col cols="6" sm="2" class="d-flex align-center">
            <v-btn variant="outlined" block data-testid="cargo-reset-filters" @click="resetFilters">
              Limpiar
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

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
        data-testid="cargo-table"
        @click:row="handleRowClick"
      >
        <template #item.peso_kg="{ item }">{{ item.peso_kg?.toLocaleString('es-ES') }} kg</template>

        <template #item.tipo="{ item }">
          <v-chip :color="getCargoTypeColor(item.tipo)" size="small" variant="tonal">
            {{ getCargoTypeLabel(item.tipo) }}
          </v-chip>
        </template>

        <template #item.adr="{ item }">
          <template v-if="item.tipo === 'peligrosa'">
            <v-chip color="error" size="x-small" variant="outlined">
              {{ item.adr_clase }} · ONU {{ item.adr_numero_onu }}
            </v-chip>
          </template>
          <span v-else class="text-medium-emphasis">—</span>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-eye"
            size="small"
            variant="text"
            data-testid="cargo-view"
            :to="{ name: 'CargoDetail', params: { id: item.id } }"
          />
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            data-testid="cargo-edit"
            :to="{ name: 'CargoEdit', params: { id: item.id } }"
          />
        </template>

        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <v-icon size="48" color="grey">mdi-package-variant-closed</v-icon>
            <p class="text-body-1 mt-4 text-medium-emphasis">No hay cargas registradas</p>
            <v-btn
              color="primary"
              class="mt-4"
              :to="{ name: 'CargoCreate' }"
              data-testid="cargo-empty-create"
            >
              Registrar carga
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <div class="d-md-none">
      <CargoCard v-for="record in items" :key="record.id" :record="record" class="mb-3" />
      <div v-if="!isLoading && items.length === 0" class="text-center pa-8">
        <v-icon size="48" color="grey">mdi-package-variant-closed</v-icon>
        <p class="text-body-1 mt-4 text-medium-emphasis">No hay cargas</p>
        <v-btn
          color="primary"
          class="mt-4"
          :to="{ name: 'CargoCreate' }"
          data-testid="cargo-mobile-create"
        >
          Registrar carga
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
import { useCargo } from '@/composables/use-cargo.js'
import { getCargoTypeColor, getCargoTypeLabel, CARGO_TYPE_OPTIONS } from '@/utils/cargo-helpers.js'
import CargoCard from './CargoCard.vue'

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
} = useCargo()

const searchQuery = ref('')
const filterType = ref(null)
const tablePage = ref(1)
const sortBy = ref([{ key: 'created_at', order: 'desc' }])
let searchTimer = null

const headers = [
  { title: 'Descripción', key: 'descripcion', sortable: false },
  { title: 'Peso', key: 'peso_kg', sortable: true },
  { title: 'Tipo', key: 'tipo', sortable: true },
  { title: 'ADR', key: 'adr', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

const typeOptions = CARGO_TYPE_OPTIONS

function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => applyFilters(), 300)
}

function applyFilters() {
  const f = {}
  if (searchQuery.value) f.search = searchQuery.value
  if (filterType.value) f.tipo = filterType.value
  setFilters(f)
}

function resetFilters() {
  searchQuery.value = null
  filterType.value = null
  resetFn()
}

function handleRowClick(_event, { item }) {
  router.push({ name: 'CargoDetail', params: { id: item.id } })
}

watch(tablePage, newPage => {
  page.value = newPage
  fetch()
})

onMounted(() => {
  fetch()
})
</script>
