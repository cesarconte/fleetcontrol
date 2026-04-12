<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-expansion-panels v-model="openPanels" multiple>
      <!-- Planificación -->
      <v-expansion-panel title="Planificación" value="planning">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="6" md="3">
              <v-text-field
                v-model="form.departure_date"
                label="Fecha salida *"
                type="date"
                :error-messages="errors.departure_date"
                variant="outlined"
                required
                data-testid="route-departure-date"
              />
            </v-col>
            <v-col cols="6" sm="3" md="2">
              <v-text-field
                v-model="form.departure_time"
                label="Hora salida"
                type="time"
                variant="outlined"
                data-testid="route-departure-time"
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-text-field
                v-model="form.planned_arrival_date"
                label="Fecha llegada"
                type="date"
                variant="outlined"
                data-testid="route-arrival-date"
              />
            </v-col>
            <v-col cols="6" sm="3" md="2">
              <v-text-field
                v-model="form.arrival_time"
                label="Hora llegada"
                type="time"
                variant="outlined"
                data-testid="route-arrival-time"
              />
            </v-col>
            <v-col cols="12" sm="6" md="2">
              <v-select
                v-model="form.status"
                :items="routeStatuses"
                label="Estado"
                variant="outlined"
                data-testid="route-status"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Origen / Destino -->
      <v-expansion-panel title="Origen y Destino" value="location">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.origin_city"
                label="Origen *"
                :error-messages="errors.origin_city"
                variant="outlined"
                required
                data-testid="route-origin"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.destination_city"
                label="Destino *"
                :error-messages="errors.destination_city"
                variant="outlined"
                required
                data-testid="route-destination"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model="form.origin_province"
                label="Provincia origen"
                variant="outlined"
                data-testid="route-origin-province"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model="form.destination_province"
                label="Provincia destino"
                variant="outlined"
                data-testid="route-dest-province"
              />
            </v-col>
            <v-col cols="12" sm="4" md="3">
              <v-text-field
                v-model.number="form.planned_distance_km"
                label="Distancia planificada (km)"
                type="number"
                variant="outlined"
                data-testid="route-distance"
              />
            </v-col>
            <v-col cols="12" sm="4" md="3">
              <v-text-field
                v-model.number="form.planned_duration_min"
                label="Duración estimada (min)"
                type="number"
                step="5"
                variant="outlined"
                data-testid="route-duration"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Asignación -->
      <v-expansion-panel title="Asignación" value="assignment">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.vehicle_id"
                :items="vehicleOptions"
                label="Vehículo *"
                :error-messages="errors.vehicle_id"
                variant="outlined"
                :loading="loadingRefs"
                data-testid="route-vehicle"
                @update:model-value="onVehicleChange"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.driver_id"
                :items="driverOptions"
                label="Conductor *"
                :error-messages="errors.driver_id"
                variant="outlined"
                :loading="loadingRefs"
                data-testid="route-driver"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Carga -->
      <v-expansion-panel title="Carga" value="cargo">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.cargo_description"
                label="Descripción de la carga"
                variant="outlined"
                data-testid="route-cargo-desc"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.cargo_weight_kg"
                label="Peso (kg)"
                type="number"
                variant="outlined"
                data-testid="route-cargo-weight"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.cargo_volume_m3"
                label="Volumen (m³)"
                type="number"
                step="0.1"
                variant="outlined"
                data-testid="route-cargo-volume"
              />
            </v-col>
            <v-col cols="12" sm="6" md="6">
              <v-select
                v-model="form.subcategoria_id"
                :items="subcategoryOptions"
                label="Tipo de carga (subcategoría)"
                variant="outlined"
                data-testid="route-cargo-subcategory"
                clearable
              />
            </v-col>
          </v-row>

          <!-- Compliance check -->
          <RouteCompliancePanel
            v-if="selectedVehicle && form.subcategoria_id"
            :vehicle="selectedVehicle"
            :subcategoria-id="form.subcategoria_id"
            :cargo-weight-kg="form.cargo_weight_kg"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Costes y resultado (solo en edición) -->
      <v-expansion-panel v-if="showResults" title="Costes y Resultado" value="results">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.actual_distance_km"
                label="Distancia real (km)"
                type="number"
                variant="outlined"
                data-testid="route-real-distance"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.actual_duration_min"
                label="Duración real (min)"
                type="number"
                step="5"
                variant="outlined"
                data-testid="route-real-duration"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.fuel_consumed_liters"
                label="Combustible (L)"
                type="number"
                step="0.1"
                variant="outlined"
                data-testid="route-fuel"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.fuel_cost_eur"
                label="Coste combustible (€)"
                type="number"
                step="0.01"
                variant="outlined"
                data-testid="route-fuel-cost"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.toll_cost_eur"
                label="Peajes (€)"
                type="number"
                step="0.01"
                variant="outlined"
                data-testid="route-toll-cost"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.total_cost_eur"
                label="Coste total (€)"
                type="number"
                step="0.01"
                variant="outlined"
                data-testid="route-total-cost"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.delay_minutes"
                label="Retraso (min)"
                type="number"
                variant="outlined"
                data-testid="route-delay"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel title="Documentación y Números de Referencia" value="docs">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.invoice_number"
                label="Nº Factura"
                variant="outlined"
                data-testid="route-invoice-num"
                placeholder="PRO-FAC/2026/00000"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.cmr_number"
                label="Nº CMR (Internacional)"
                variant="outlined"
                data-testid="route-cmr-num"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.delivery_note_number"
                label="Nº Albarán"
                variant="outlined"
                data-testid="route-albaran-num"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.cpn_number"
                label="Nº Carta Porte Nac."
                variant="outlined"
                data-testid="route-cpn-num"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.adr_number"
                label="Nº ADR (Peligrosas)"
                variant="outlined"
                data-testid="route-adr-num"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.control_number"
                label="Nº Control Admon."
                variant="outlined"
                data-testid="route-control-num"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.packing_list_number"
                label="Nº Packing List"
                variant="outlined"
                data-testid="route-packing-num"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.cleaning_cert_number"
                label="Nº Cert. Limpieza"
                variant="outlined"
                data-testid="route-cleaning-num"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.pod_number"
                label="Nº POD (Entrega)"
                variant="outlined"
                data-testid="route-pod-num"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.route_sheet_number"
                label="Nº Hoja de Ruta"
                variant="outlined"
                data-testid="route-route-sheet-num"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="form.result_notes"
                label="Observaciones"
                variant="outlined"
                rows="3"
                data-testid="route-observations"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Actions -->
    <div class="d-flex justify-end ga-3 mt-4">
      <v-btn variant="text" :to="cancelTo" data-testid="route-form-cancel">Cancelar</v-btn>
      <v-btn
        type="submit"
        color="primary"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        data-testid="route-form-submit"
      >
        {{ submitLabel }}
      </v-btn>
    </div>
  </v-form>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { apiVehicles } from '@/services/api-vehicles.js'
import { apiDrivers } from '@/services/api-drivers.js'
import { useNotificationStore } from '@/stores/notifications.js'
import { CARGO_CATEGORIES } from '@/constants/cargo-categories.js'
import RouteCompliancePanel from './RouteCompliancePanel.vue'

const props = defineProps({
  initialValues: { type: Object, default: () => ({}) },
  isSubmitting: { type: Boolean, default: false },
  submitLabel: { type: String, default: 'Guardar' },
  cancelTo: { type: [String, Object], default: '/rutas' },
  errors: { type: Object, default: () => ({}) },
  showResults: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])
const notifications = useNotificationStore()

const formRef = ref(null)
const openPanels = ref(['planning', 'location'])
const loadingRefs = ref(true)
const vehicleOptions = ref([])
const driverOptions = ref([])
const vehiclesList = ref([])
const selectedVehicle = ref(null)

// All subcategories grouped by category for VSelect
const subcategoryOptions = CARGO_CATEGORIES.flatMap(cat =>
  cat.subcategorias.map(sub => ({
    title: sub.nombre,
    value: sub.id,
    props: { subtitle: cat.nombre },
  })),
)

const form = reactive({
  departure_date: '',
  departure_time: '',
  planned_arrival_date: '',
  arrival_time: '',
  origin_city: '',
  origin_province: '',
  origin_country: 'España',
  destination_city: '',
  destination_province: '',
  destination_country: 'España',
  vehicle_id: '',
  driver_id: '',
  planned_distance_km: null,
  actual_distance_km: null,
  planned_duration_min: null,
  actual_duration_min: null,
  cargo_description: '',
  cargo_weight_kg: null,
  cargo_volume_m3: null,
  subcategoria_id: '',
  fuel_consumed_liters: null,
  fuel_cost_eur: null,
  toll_cost_eur: null,
  total_cost_eur: null,
  status: 'planned',
  delay_minutes: null,
  result_notes: '',
  invoice_number: '',
  cmr_number: '',
  delivery_note_number: '',
  cpn_number: '',
  adr_number: '',
  control_number: '',
  packing_list_number: '',
  cleaning_cert_number: '',
  pod_number: '',
  route_sheet_number: '',
  ...props.initialValues,
})

watch(
  () => props.initialValues,
  newValues => {
    Object.assign(form, newValues)
    // Restore selected vehicle from initial values
    if (form.vehicle_id && vehiclesList.value.length) {
      selectedVehicle.value = vehiclesList.value.find(v => v.id === form.vehicle_id) ?? null
    }
  },
  { deep: true },
)

const routeStatuses = [
  { title: 'Planificada', value: 'planned' },
  { title: 'En curso', value: 'in_progress' },
  { title: 'Completada', value: 'completed' },
  { title: 'Retrasada', value: 'delayed' },
  { title: 'Cancelada', value: 'cancelled' },
]

function onVehicleChange(vehicleId) {
  selectedVehicle.value = vehiclesList.value.find(v => v.id === vehicleId) ?? null
}

onMounted(async () => {
  try {
    const [vehicles, drivers] = await Promise.all([apiVehicles.getAll(), apiDrivers.getAll()])
    vehiclesList.value = vehicles
    vehicleOptions.value = vehicles.map(v => ({
      title: `${v.plate} — ${v.brand} ${v.model}`,
      value: v.id,
    }))
    driverOptions.value = drivers.map(d => ({
      title: `${d.full_name} (${d.national_id})`,
      value: d.id,
    }))
    // Restore selected vehicle if editing
    if (form.vehicle_id) {
      selectedVehicle.value = vehicles.find(v => v.id === form.vehicle_id) ?? null
    }
  } catch {
    notifications.error('Error al cargar vehículos y conductores')
  } finally {
    loadingRefs.value = false
  }
})

async function handleSubmit() {
  emit('submit', { ...form })
}

defineExpose({ form, handleSubmit })
</script>
