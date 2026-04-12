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
          <h1 class="text-h5">{{ route.origin_city }} → {{ route.destination_city }}</h1>
          <p class="text-body-2 text-medium-emphasis">
            {{ formatDate(route.departure_date) }}
            {{ extractTime(route.departure_date) ? ` · ${extractTime(route.departure_date)}` : '' }}
          </p>
        </div>
        <div class="d-flex ga-2">
          <v-chip :color="getStatusColor(route.status)" variant="tonal">
            {{ getStatusLabel(route.status) }}
          </v-chip>
          <v-btn
            icon="mdi-file-document-plus-outline"
            variant="outlined"
            size="small"
            data-testid="detail-generate-doc"
            @click="showGenerateDialog = true"
          />
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
                <div class="text-body-1">{{ extractTime(route.departure_date) || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Fecha llegada</div>
                <div class="text-body-1">{{ formatDate(route.planned_arrival_date) }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Hora llegada</div>
                <div class="text-body-1">
                  {{ extractTime(route.planned_arrival_date) || '—' }}
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Dirección origen</div>
                <div class="text-body-1">
                  {{ route.origin_address || route.origin_city || '—' }}
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Dirección destino</div>
                <div class="text-body-1">
                  {{ route.destination_address || route.destination_city || '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Distancia</div>
                <div class="text-body-1">
                  {{
                    route.distance_total_km
                      ? `${Number(route.distance_total_km).toLocaleString('es-ES')} km`
                      : '—'
                  }}
                </div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Duración</div>
                <div class="text-body-1">
                  {{ formatDuration(route.planned_duration_min) }}
                </div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Vehículo y Conductor -->
        <v-expansion-panel title="Vehículo y Conductor" value="vehicle">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Matrícula</div>
                <div class="text-body-1 font-weight-medium">
                  <RouterLink
                    v-if="vehicle?.id"
                    :to="{ name: 'VehicleDetail', params: { id: vehicle.id } }"
                    class="text-primary text-decoration-none"
                  >
                    {{ vehicle.plate || '—' }}
                  </RouterLink>
                  <span v-else>{{ vehicle?.plate || '—' }}</span>
                </div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Vehículo</div>
                <div class="text-body-1">{{ vehicle?.brand || '' }} {{ vehicle?.model || '' }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Conductor</div>
                <div class="text-body-1 font-weight-medium">
                  <RouterLink
                    v-if="driver?.id"
                    :to="{ name: 'DriverDetail', params: { id: driver.id } }"
                    class="text-primary text-decoration-none"
                  >
                    {{ driver.full_name || '—' }}
                  </RouterLink>
                  <span v-else>{{ driver?.full_name || '—' }}</span>
                </div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">NIF Conductor</div>
                <div class="text-body-1">{{ driver?.national_id || '—' }}</div>
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
                <div class="text-body-1">
                  {{ cargo?.description || route.cargo_description || '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Peso</div>
                <div class="text-body-1">
                  {{
                    cargo?.weight_kg || route.cargo_weight_kg
                      ? `${Number(cargo?.weight_kg || route.cargo_weight_kg).toLocaleString('es-ES')} kg`
                      : '—'
                  }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Tipo</div>
                <div class="text-body-1">
                  {{ getCargoTypeLabel(cargo?.cargo_type || route.cargo_type) }}
                </div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Embalaje</div>
                <div class="text-body-1">{{ cargo?.packaging_type || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Bultos</div>
                <div class="text-body-1">{{ cargo?.packages || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Valor declarado</div>
                <div class="text-body-1">
                  {{
                    cargo?.declared_value
                      ? `${Number(cargo.declared_value).toLocaleString('es-ES')} €`
                      : '—'
                  }}
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Destinatario</div>
                <div class="text-body-1">{{ cargo?.consignee_name || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">NIF Destinatario</div>
                <div class="text-body-1">{{ cargo?.consignee_nif || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Lugar entrega</div>
                <div class="text-body-1">{{ cargo?.cmr_delivery_place || '—' }}</div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Cliente y Comercial -->
        <v-expansion-panel title="Cliente y Comercial" value="client">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Cliente</div>
                <div class="text-body-1">{{ route.client_name || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">NIF Cliente</div>
                <div class="text-body-1">{{ route.client_tax_id || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Precio servicio</div>
                <div class="text-body-1 font-weight-medium">
                  {{
                    route.price
                      ? `${Number(route.price).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`
                      : '—'
                  }}
                </div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Condiciones de pago</div>
                <div class="text-body-1">{{ route.payment_terms || '—' }}</div>
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
                  {{ route.fuel_consumption_l ? `${route.fuel_consumption_l} L` : '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Coste combustible</div>
                <div class="text-body-1">
                  {{ route.fuel_cost_eur ? `${Number(route.fuel_cost_eur).toFixed(2)} €` : '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Peajes</div>
                <div class="text-body-1">
                  {{ route.toll_cost_eur ? `${Number(route.toll_cost_eur).toFixed(2)} €` : '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Coste conductor</div>
                <div class="text-body-1">
                  {{
                    route.driver_cost_eur ? `${Number(route.driver_cost_eur).toFixed(2)} €` : '—'
                  }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Otros variables</div>
                <div class="text-body-1">
                  {{
                    route.other_variable_cost_eur
                      ? `${Number(route.other_variable_cost_eur).toFixed(2)} €`
                      : '—'
                  }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Costes fijos asignados</div>
                <div class="text-body-1">
                  {{
                    route.allocated_fixed_cost_eur
                      ? `${Number(route.allocated_fixed_cost_eur).toFixed(2)} €`
                      : '—'
                  }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Coste variable total</div>
                <div class="text-body-1">
                  {{
                    route.total_variable_cost_eur
                      ? `${Number(route.total_variable_cost_eur).toFixed(2)} €`
                      : '—'
                  }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Coste total</div>
                <div class="text-body-1 font-weight-medium">
                  {{ route.total_cost_eur ? `${Number(route.total_cost_eur).toFixed(2)} €` : '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Margen bruto</div>
                <div
                  class="text-body-1 font-weight-medium"
                  :class="marginColor(route.gross_margin_eur)"
                >
                  {{
                    route.gross_margin_eur ? `${Number(route.gross_margin_eur).toFixed(2)} €` : '—'
                  }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Margen neto</div>
                <div
                  class="text-body-1 font-weight-medium"
                  :class="marginColor(route.net_margin_eur)"
                >
                  {{ route.net_margin_eur ? `${Number(route.net_margin_eur).toFixed(2)} €` : '—' }}
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
                <div class="text-body-1 font-weight-medium text-primary">
                  {{ route.cmr_number || '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Nº Factura</div>
                <div class="text-body-1 font-weight-medium text-primary">
                  {{ route.invoice_number || '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Nº Albarán</div>
                <div class="text-body-1 font-weight-medium text-primary">
                  {{ route.delivery_note_number || '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Nº Control Admon.</div>
                <div class="text-body-1 font-weight-medium text-primary">
                  {{ route.control_number || '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Nº ADR</div>
                <div class="text-body-1 font-weight-medium text-primary">
                  {{ route.adr_number || '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Nº Packing List</div>
                <div class="text-body-1 font-weight-medium text-primary">
                  {{ route.packing_list_number || '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Nº Carta Porte Nac.</div>
                <div class="text-body-1 font-weight-medium text-primary">
                  {{ route.cpn_number || '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Nº Cert. Limpieza</div>
                <div class="text-body-1 font-weight-medium text-primary">
                  {{ route.cleaning_cert_number || '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Nº POD</div>
                <div class="text-body-1 font-weight-medium text-primary">
                  {{ route.pod_number || '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Nº Hoja de Ruta</div>
                <div class="text-body-1 font-weight-medium text-primary">
                  {{ route.route_sheet_number || '—' }}
                </div>
              </v-col>
            </v-row>
            <v-row v-if="route.notes">
              <v-col cols="12">
                <div class="text-caption text-medium-emphasis">Observaciones</div>
                <div class="text-body-1">{{ route.notes }}</div>
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

    <!-- Generate document dialog -->
    <GenerateDocumentDialog
      v-model="showGenerateDialog"
      :route-id="routeId"
      @generated="handleDocGenerated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRoutes } from '@/composables/use-routes.js'
import { useNotificationStore } from '@/stores/notifications.js'
import { getStatusColor, getStatusLabel } from '@/utils/status-helpers.js'
import { formatDate } from '@/utils/format-helpers.js'
import GenerateDocumentDialog from '@/components/documents/GenerateDocumentDialog.vue'
import { supabase } from '@/services/supabase-client.js'

const props = defineProps({
  routeId: { type: String, required: true },
})

const router = useRouter()
const { getById, remove, isLoading, currentRoute: route } = useRoutes()
const notifications = useNotificationStore()

const openPanels = ref(['planning', 'cargo'])
const confirmDelete = ref(false)
const isDeleting = ref(false)
const showGenerateDialog = ref(false)
const vehicle = ref(null)
const driver = ref(null)
const cargo = ref(null)

onMounted(async () => {
  await getById(props.routeId)
  await fetchRelatedData(props.routeId)
})

async function fetchRelatedData(routeId) {
  const r = route.value
  if (!r) return

  // Fetch vehicle
  if (r.vehicle_id) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', r.vehicle_id)
      .maybeSingle()
    if (!error) vehicle.value = data
  }

  // Fetch driver
  if (r.driver_id) {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', r.driver_id)
      .maybeSingle()
    if (!error) driver.value = data
  }

  // Fetch cargo
  const { data, error } = await supabase
    .from('cargo_records')
    .select('*')
    .eq('route_id', routeId)
    .maybeSingle()
  if (!error) cargo.value = data
}

function getCargoTypeLabel(type) {
  const map = {
    general: 'General',
    frigorifica: 'Frigorífica',
    peligrosa: 'Peligrosa (ADR)',
    especial: 'Especial',
    refrigerated: 'Refrigerada',
    dangerous: 'Peligrosa (ADR)',
    special: 'Especial',
  }
  return map[type] ?? type ?? '—'
}

function marginColor(value) {
  if (value == null) return ''
  return Number(value) >= 0 ? 'text-success' : 'text-error'
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

async function handleDocGenerated(result) {
  notifications.success(`Documento generado: ${result.filename}`)
  // Refresh route data to show the new document number
  await getById(props.routeId)
}
</script>
