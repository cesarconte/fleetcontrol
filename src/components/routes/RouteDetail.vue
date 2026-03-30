<template>
  <div>
    <div v-if="isLoading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="!route" class="text-center pa-8">
      <v-icon size="48" color="grey">mdi-map-marker-off-outline</v-icon>
      <p class="text-body-1 mt-4 text-medium-emphasis">Ruta no encontrada</p>
      <v-btn color="primary" class="mt-4" :to="{ path: '/rutas' }" data-testid="detail-back">
        Volver a la lista
      </v-btn>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-2">
        <div>
          <h1 class="text-h5">{{ route.origin }} → {{ route.destination }}</h1>
          <p class="text-body-2 text-medium-emphasis">
            {{ formatDate(route.departure_date) }}
            {{ route.departure_time ? ` · ${route.departure_time}` : '' }}
          </p>
        </div>
        <div class="d-flex ga-2">
          <v-chip :color="getStatusColor(route.status)" variant="tonal">
            {{ getStatusLabel(route.status) }}
          </v-chip>
          <v-btn
            icon="mdi-pencil"
            variant="outlined"
            size="small"
            :to="{ name: 'RouteEdit', params: { id: route.id } }"
            data-testid="detail-edit"
          />
        </div>
      </div>

      <!-- Sections -->
      <v-expansion-panels v-model="openPanels" multiple>
        <!-- Planificación -->
        <v-expansion-panel title="Planificación" value="planning">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Fecha salida</div>
                <div class="text-body-1 font-weight-medium">
                  {{ formatDate(route.departure_date) }}
                </div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Hora salida</div>
                <div class="text-body-1">{{ route.departure_time || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Fecha llegada</div>
                <div class="text-body-1">{{ formatDate(route.arrival_date) }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Hora llegada</div>
                <div class="text-body-1">{{ route.arrival_time || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Origen</div>
                <div class="text-body-1">{{ route.origin }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Destino</div>
                <div class="text-body-1">{{ route.destination }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Distancia</div>
                <div class="text-body-1">
                  {{
                    route.planned_distance_km
                      ? `${route.planned_distance_km.toLocaleString('es-ES')} km`
                      : '—'
                  }}
                </div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Duración</div>
                <div class="text-body-1">
                  {{ route.planned_duration_hours ? `${route.planned_duration_hours} h` : '—' }}
                </div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Carga -->
        <v-expansion-panel title="Carga" value="cargo">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Descripción</div>
                <div class="text-body-1">{{ route.cargo_description || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Peso</div>
                <div class="text-body-1">
                  {{
                    route.cargo_weight_kg
                      ? `${route.cargo_weight_kg.toLocaleString('es-ES')} kg`
                      : '—'
                  }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Tipo</div>
                <div class="text-body-1">{{ getCargoTypeLabel(route.cargo_type) }}</div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Costes -->
        <v-expansion-panel title="Costes y Resultado" value="costs">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Combustible</div>
                <div class="text-body-1">
                  {{ route.fuel_consumed_liters ? `${route.fuel_consumed_liters} L` : '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Coste combustible</div>
                <div class="text-body-1">
                  {{ route.fuel_cost_eur ? `${route.fuel_cost_eur.toFixed(2)} €` : '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Peajes</div>
                <div class="text-body-1">
                  {{ route.toll_cost_eur ? `${route.toll_cost_eur.toFixed(2)} €` : '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Coste total</div>
                <div class="text-body-1 font-weight-medium">
                  {{ route.total_cost_eur ? `${route.total_cost_eur.toFixed(2)} €` : '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Retraso</div>
                <div class="text-body-1">
                  {{ route.delay_minutes ? `${route.delay_minutes} min` : '—' }}
                </div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Observaciones -->
        <v-expansion-panel title="Documentación y Observaciones" value="docs">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Nº CMR</div>
                <div class="text-body-1">{{ route.cmr_number || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Nº Albarán</div>
                <div class="text-body-1">{{ route.albaran_number || '—' }}</div>
              </v-col>
            </v-row>
            <v-row v-if="route.observations">
              <v-col cols="12">
                <div class="text-caption text-medium-emphasis">Observaciones</div>
                <div class="text-body-1">{{ route.observations }}</div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- Danger zone -->
      <v-card class="mt-6" color="error" variant="outlined">
        <v-card-text>
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-body-2 font-weight-medium">Eliminar ruta</div>
              <div class="text-caption">Esta acción no se puede deshacer</div>
            </div>
            <v-btn
              color="error"
              variant="outlined"
              size="small"
              data-testid="detail-delete"
              @click="confirmDelete = true"
            >
              Eliminar
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="confirmDelete" max-width="400">
      <v-card>
        <v-card-title>¿Eliminar ruta?</v-card-title>
        <v-card-text>
          Se eliminará la ruta permanentemente. Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDelete = false">Cancelar</v-btn>
          <v-btn color="error" :loading="isDeleting" @click="handleDelete">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRoutes } from '@/composables/use-routes.js'

const props = defineProps({
  routeId: { type: String, required: true },
})

const router = useRouter()
const { getById, remove, isLoading, currentRoute: route } = useRoutes()

const openPanels = ref(['planning', 'cargo'])
const confirmDelete = ref(false)
const isDeleting = ref(false)

onMounted(() => {
  getById(props.routeId)
})

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

function getCargoTypeLabel(type) {
  const map = {
    general: 'General',
    refrigerated: 'Frigorífica',
    dangerous: 'Peligrosa (ADR)',
    special: 'Especial',
  }
  return map[type] ?? type
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES')
}

async function handleDelete() {
  isDeleting.value = true
  try {
    await remove(props.routeId)
    router.push('/rutas')
  } finally {
    isDeleting.value = false
    confirmDelete.value = false
  }
}
</script>
