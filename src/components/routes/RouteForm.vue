<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-expansion-panels v-model="openPanels" multiple>
      <!-- Planificación -->
      <v-expansion-panel title="Planificación" value="planning">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="6" md="3">
              <v-text-field
                v-model="form.fecha_salida"
                label="Fecha salida *"
                type="date"
                :error-messages="errors.fecha_salida"
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
                v-model="form.fecha_llegada_prevista"
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
                v-model="form.origen_municipio"
                label="Origen *"
                :error-messages="errors.origen_municipio"
                variant="outlined"
                required
                data-testid="route-origin"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.destino_municipio"
                label="Destino *"
                :error-messages="errors.destino_municipio"
                variant="outlined"
                required
                data-testid="route-destination"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model="form.origen_provincia"
                label="Provincia origen"
                variant="outlined"
                data-testid="route-origin-province"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model="form.destino_provincia"
                label="Provincia destino"
                variant="outlined"
                data-testid="route-dest-province"
              />
            </v-col>
            <v-col cols="12" sm="4" md="3">
              <v-text-field
                v-model.number="form.distancia_total_km"
                label="Distancia planificada (km)"
                type="number"
                variant="outlined"
                data-testid="route-distance"
              />
            </v-col>
            <v-col cols="12" sm="4" md="3">
              <v-text-field
                v-model.number="form.duracion_prevista_min"
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
                v-model="form.descripcion_carga"
                label="Descripción de la carga"
                variant="outlined"
                data-testid="route-cargo-desc"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.peso_carga_kg"
                label="Peso (kg)"
                type="number"
                variant="outlined"
                data-testid="route-cargo-weight"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.volumen_carga_m3"
                label="Volumen (m³)"
                type="number"
                step="0.1"
                variant="outlined"
                data-testid="route-cargo-volume"
              />
            </v-col>
            <v-col cols="12" sm="4" md="3">
              <v-select
                v-model="form.tipo_carga"
                :items="cargoTypes"
                label="Tipo de carga"
                variant="outlined"
                data-testid="route-cargo-type"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Costes y resultado (solo en edición) -->
      <v-expansion-panel v-if="showResults" title="Costes y Resultado" value="results">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.distancia_recorrida_km"
                label="Distancia real (km)"
                type="number"
                variant="outlined"
                data-testid="route-real-distance"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.duracion_real_min"
                label="Duración real (min)"
                type="number"
                step="5"
                variant="outlined"
                data-testid="route-real-duration"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.consumo_combustible_l"
                label="Combustible (L)"
                type="number"
                step="0.1"
                variant="outlined"
                data-testid="route-fuel"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.coste_combustible_eur"
                label="Coste combustible (€)"
                type="number"
                step="0.01"
                variant="outlined"
                data-testid="route-fuel-cost"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.coste_peajes_eur"
                label="Peajes (€)"
                type="number"
                step="0.01"
                variant="outlined"
                data-testid="route-toll-cost"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.coste_total_eur"
                label="Coste total (€)"
                type="number"
                step="0.01"
                variant="outlined"
                data-testid="route-total-cost"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.retraso_minutos"
                label="Retraso (min)"
                type="number"
                variant="outlined"
                data-testid="route-delay"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Documentación -->
      <v-expansion-panel title="Documentación" value="docs">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.cmr_numero"
                label="Nº CMR"
                variant="outlined"
                data-testid="route-cmr"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.albaran_numero"
                label="Nº Albarán"
                variant="outlined"
                data-testid="route-albaran"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="form.observaciones"
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

const form = reactive({
  fecha_salida: '',
  departure_time: '',
  fecha_llegada_prevista: '',
  arrival_time: '',
  origen_municipio: '',
  origen_provincia: '',
  origen_pais: 'España',
  destino_municipio: '',
  destino_provincia: '',
  destino_pais: 'España',
  vehicle_id: '',
  driver_id: '',
  distancia_total_km: null,
  distancia_recorrida_km: null,
  duracion_prevista_min: null,
  duracion_real_min: null,
  descripcion_carga: '',
  peso_carga_kg: null,
  volumen_carga_m3: null,
  tipo_carga: 'general',
  consumo_combustible_l: null,
  coste_combustible_eur: null,
  coste_peajes_eur: null,
  coste_total_eur: null,
  status: 'planificada',
  retraso_minutos: null,
  observaciones: '',
  cmr_numero: '',
  albaran_numero: '',
  ...props.initialValues,
})

watch(
  () => props.initialValues,
  newValues => {
    Object.assign(form, newValues)
  },
  { deep: true },
)

const routeStatuses = [
  { title: 'Planificada', value: 'planificada' },
  { title: 'En curso', value: 'en_curso' },
  { title: 'Completada', value: 'completada' },
  { title: 'Retrasada', value: 'retrasada' },
  { title: 'Cancelada', value: 'cancelada' },
]

const cargoTypes = [
  { title: 'General', value: 'general' },
  { title: 'Frigorífica', value: 'frigorifica' },
  { title: 'Peligrosa (ADR)', value: 'peligrosa' },
  { title: 'Especial', value: 'especial' },
]

onMounted(async () => {
  try {
    const [vehicles, drivers] = await Promise.all([apiVehicles.getAll(), apiDrivers.getAll()])
    vehicleOptions.value = vehicles.map(v => ({
      title: `${v.plate} — ${v.brand} ${v.model}`,
      value: v.id,
    }))
    driverOptions.value = drivers.map(d => ({
      title: `${d.full_name} (${d.nif})`,
      value: d.id,
    }))
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
