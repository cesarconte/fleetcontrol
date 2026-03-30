<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-expansion-panels v-model="openPanels" multiple>
      <!-- Información básica -->
      <v-expansion-panel title="Información básica" value="basic">
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
                data-testid="maintenance-vehicle"
              />
            </v-col>
            <v-col cols="6" sm="3">
              <v-select
                v-model="form.tipo"
                :items="typeOptions"
                label="Tipo *"
                variant="outlined"
                data-testid="maintenance-type"
              />
            </v-col>
            <v-col cols="6" sm="3">
              <v-select
                v-model="form.status"
                :items="statusOptions"
                label="Estado"
                variant="outlined"
                data-testid="maintenance-status"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.descripcion"
                label="Descripción *"
                :error-messages="errors.descripcion"
                variant="outlined"
                required
                data-testid="maintenance-description"
              />
            </v-col>
            <v-col cols="6" sm="4">
              <v-text-field
                v-model="form.fecha_programada"
                label="Fecha prevista"
                type="date"
                variant="outlined"
                data-testid="maintenance-scheduled-date"
              />
            </v-col>
            <v-col cols="6" sm="4">
              <v-text-field
                v-model="form.fecha_fin"
                label="Fecha realización"
                type="date"
                variant="outlined"
                data-testid="maintenance-completed-date"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="form.km_al_momento"
                label="Km en el momento"
                type="number"
                variant="outlined"
                data-testid="maintenance-mileage"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Diagnóstico e intervención -->
      <v-expansion-panel title="Diagnóstico e Intervención" value="intervention">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="form.diagnostico"
                label="Diagnóstico"
                variant="outlined"
                rows="2"
                data-testid="maintenance-diagnosis"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.intervencion_realizada"
                label="Intervención realizada"
                variant="outlined"
                rows="2"
                data-testid="maintenance-intervention"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.recambios"
                label="Recambios utilizados"
                variant="outlined"
                rows="2"
                data-testid="maintenance-parts"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Costes y taller -->
      <v-expansion-panel title="Costes y Taller" value="costs">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.taller_nombre"
                label="Taller"
                variant="outlined"
                data-testid="maintenance-workshop"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.taller_responsable"
                label="Responsable"
                variant="outlined"
                data-testid="maintenance-responsible"
              />
            </v-col>
            <v-col cols="6" sm="4" md="2">
              <v-text-field
                v-model.number="form.coste_recambios_eur"
                label="Coste piezas (€)"
                type="number"
                step="0.01"
                variant="outlined"
                data-testid="maintenance-parts-cost"
              />
            </v-col>
            <v-col cols="6" sm="4" md="2">
              <v-text-field
                v-model.number="form.coste_total_eur"
                label="Coste total (€)"
                type="number"
                step="0.01"
                variant="outlined"
                data-testid="maintenance-total-cost"
              />
            </v-col>
            <v-col cols="12" sm="4" md="2">
              <v-text-field
                v-model.number="form.inmovilizacion_horas"
                label="Inmovilización (h)"
                type="number"
                variant="outlined"
                data-testid="maintenance-downtime"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Actions -->
    <div class="d-flex justify-end ga-3 mt-4">
      <v-btn variant="text" :to="cancelTo" data-testid="maintenance-form-cancel">Cancelar</v-btn>
      <v-btn
        type="submit"
        color="primary"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        data-testid="maintenance-form-submit"
      >
        {{ submitLabel }}
      </v-btn>
    </div>
  </v-form>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { apiVehicles } from '@/services/api-vehicles.js'
import { useNotificationStore } from '@/stores/notifications.js'

const props = defineProps({
  initialValues: { type: Object, default: () => ({}) },
  isSubmitting: { type: Boolean, default: false },
  submitLabel: { type: String, default: 'Guardar' },
  cancelTo: { type: [String, Object], default: '/mantenimiento' },
  errors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit'])

const formRef = ref(null)
const openPanels = ref(['basic'])
const loadingRefs = ref(true)
const vehicleOptions = ref([])
const notifications = useNotificationStore()

const form = reactive({
  vehicle_id: '',
  tipo: 'preventivo',
  status: 'pendiente',
  fecha_programada: '',
  fecha_fin: '',
  km_al_momento: null,
  descripcion: '',
  diagnostico: '',
  intervencion_realizada: '',
  recambios: '',
  coste_recambios_eur: null,
  taller_nombre: '',
  taller_responsable: '',
  inmovilizacion_horas: null,
  coste_total_eur: null,
  observations: '',
  ...props.initialValues,
})

watch(
  () => props.initialValues,
  newValues => {
    Object.assign(form, newValues)
  },
  { deep: true },
)

const typeOptions = [
  { title: 'Preventivo', value: 'preventivo' },
  { title: 'Correctivo', value: 'correctivo' },
]

const statusOptions = [
  { title: 'Pendiente', value: 'pendiente' },
  { title: 'En curso', value: 'en_curso' },
  { title: 'Completada', value: 'completada' },
  { title: 'Cancelada', value: 'cancelada' },
]

onMounted(async () => {
  try {
    const vehicles = await apiVehicles.getAll()
    vehicleOptions.value = vehicles.map(v => ({
      title: `${v.plate} — ${v.brand} ${v.model}`,
      value: v.id,
    }))
  } catch {
    notifications.error('Error al cargar vehículos')
  } finally {
    loadingRefs.value = false
  }
})

async function handleSubmit() {
  emit('submit', { ...form })
}

defineExpose({ form, handleSubmit })
</script>
