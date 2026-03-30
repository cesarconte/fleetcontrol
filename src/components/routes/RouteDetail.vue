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
          <h1 class="text-h5">{{ route.origen_municipio }} → {{ route.destino_municipio }}</h1>
          <p class="text-body-2 text-medium-emphasis">
            {{ formatDate(route.fecha_salida) }}
            {{ extractTime(route.fecha_salida) ? ` · ${extractTime(route.fecha_salida)}` : '' }}
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
                  {{ formatDate(route.fecha_salida) }}
                </div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Hora salida</div>
                <div class="text-body-1">{{ extractTime(route.fecha_salida) || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Fecha llegada</div>
                <div class="text-body-1">{{ formatDate(route.fecha_llegada_prevista) }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Hora llegada</div>
                <div class="text-body-1">
                  {{ extractTime(route.fecha_llegada_prevista) || '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Origen</div>
                <div class="text-body-1">{{ route.origen_municipio }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Destino</div>
                <div class="text-body-1">{{ route.destino_municipio }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Distancia</div>
                <div class="text-body-1">
                  {{
                    route.distancia_total_km
                      ? `${route.distancia_total_km.toLocaleString('es-ES')} km`
                      : '—'
                  }}
                </div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Duración</div>
                <div class="text-body-1">
                  {{ formatDuration(route.duracion_prevista_min) }}
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
                <div class="text-body-1">{{ route.descripcion_carga || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Peso</div>
                <div class="text-body-1">
                  {{
                    route.peso_carga_kg ? `${route.peso_carga_kg.toLocaleString('es-ES')} kg` : '—'
                  }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Tipo</div>
                <div class="text-body-1">{{ getCargoTypeLabel(route.tipo_carga) }}</div>
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
                  {{ route.consumo_combustible_l ? `${route.consumo_combustible_l} L` : '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Coste combustible</div>
                <div class="text-body-1">
                  {{
                    route.coste_combustible_eur
                      ? `${route.coste_combustible_eur.toFixed(2)} €`
                      : '—'
                  }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Peajes</div>
                <div class="text-body-1">
                  {{ route.coste_peajes_eur ? `${route.coste_peajes_eur.toFixed(2)} €` : '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Coste total</div>
                <div class="text-body-1 font-weight-medium">
                  {{ route.coste_total_eur ? `${route.coste_total_eur.toFixed(2)} €` : '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Retraso</div>
                <div class="text-body-1">
                  {{ route.retraso_minutos ? `${route.retraso_minutos} min` : '—' }}
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
                <div class="text-body-1">{{ route.cmr_numero || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Nº Albarán</div>
                <div class="text-body-1">{{ route.albaran_numero || '—' }}</div>
              </v-col>
            </v-row>
            <v-row v-if="route.observaciones">
              <v-col cols="12">
                <div class="text-caption text-medium-emphasis">Observaciones</div>
                <div class="text-body-1">{{ route.observaciones }}</div>
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
    <v-dialog v-model="confirmDelete" max-width="400" persistent>
      <v-card>
        <v-card-title>¿Eliminar ruta?</v-card-title>
        <v-card-text>
          Se eliminará la ruta permanentemente. Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" data-testid="delete-cancel" @click="confirmDelete = false">
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            :loading="isDeleting"
            data-testid="delete-confirm"
            @click="handleDelete"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRoutes } from '@/composables/use-routes.js'
import { useNotificationStore } from '@/stores/notifications.js'
import { getStatusColor, getStatusLabel } from '@/utils/status-helpers.js'
import { formatDate } from '@/utils/format-helpers.js'

const props = defineProps({
  routeId: { type: String, required: true },
})

const router = useRouter()
const { getById, remove, isLoading, currentRoute: route } = useRoutes()
const notifications = useNotificationStore()

const openPanels = ref(['planning', 'cargo'])
const confirmDelete = ref(false)
const isDeleting = ref(false)

onMounted(() => {
  getById(props.routeId)
})

function getCargoTypeLabel(type) {
  const map = {
    general: 'General',
    frigorifica: 'Frigorífica',
    peligrosa: 'Peligrosa (ADR)',
    especial: 'Especial',
  }
  return map[type] ?? type
}

function extractTime(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(minutes) {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}

async function handleDelete() {
  isDeleting.value = true
  try {
    await remove(props.routeId)
    router.push('/rutas')
  } catch (err) {
    notifications.error(err.message || 'Error al eliminar la ruta')
  } finally {
    isDeleting.value = false
    confirmDelete.value = false
  }
}
</script>
