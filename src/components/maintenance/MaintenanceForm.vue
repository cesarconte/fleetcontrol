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
                v-model="form.type"
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
                v-model="form.description"
                label="Descripción *"
                :error-messages="errors.description"
                variant="outlined"
                required
                data-testid="maintenance-description"
              />
            </v-col>
            <v-col cols="6" sm="4">
              <v-text-field
                v-model="form.scheduled_date"
                label="Fecha prevista"
                type="date"
                variant="outlined"
                data-testid="maintenance-scheduled-date"
              />
            </v-col>
            <v-col cols="6" sm="4">
              <v-text-field
                v-model="form.completed_date"
                label="Fecha realización"
                type="date"
                variant="outlined"
                data-testid="maintenance-completed-date"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="form.mileage_km"
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
                v-model="form.diagnosis"
                label="Diagnóstico"
                variant="outlined"
                rows="2"
                data-testid="maintenance-diagnosis"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.intervention"
                label="Intervención realizada"
                variant="outlined"
                rows="2"
                data-testid="maintenance-intervention"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.parts_used"
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
                v-model="form.workshop"
                label="Taller"
                variant="outlined"
                data-testid="maintenance-workshop"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.responsible"
                label="Responsable"
                variant="outlined"
                data-testid="maintenance-responsible"
              />
            </v-col>
            <v-col cols="6" sm="4" md="2">
              <v-text-field
                v-model.number="form.parts_cost_eur"
                label="Coste piezas (€)"
                type="number"
                step="0.01"
                variant="outlined"
                data-testid="maintenance-parts-cost"
              />
            </v-col>
            <v-col cols="6" sm="4" md="2">
              <v-text-field
                v-model.number="form.total_cost_eur"
                label="Coste total (€)"
                type="number"
                step="0.01"
                variant="outlined"
                data-testid="maintenance-total-cost"
              />
            </v-col>
            <v-col cols="12" sm="4" md="2">
              <v-text-field
                v-model.number="form.downtime_hours"
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
  type: 'preventive',
  status: 'pending',
  scheduled_date: '',
  completed_date: '',
  mileage_km: null,
  description: '',
  diagnosis: '',
  intervention: '',
  parts_used: '',
  parts_cost_eur: null,
  workshop: '',
  responsible: '',
  downtime_hours: null,
  total_cost_eur: null,
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
  { title: 'Preventivo', value: 'preventive' },
  { title: 'Correctivo', value: 'corrective' },
]

const statusOptions = [
  { title: 'Pendiente', value: 'pending' },
  { title: 'En curso', value: 'in_progress' },
  { title: 'Completado', value: 'completed' },
  { title: 'Cancelado', value: 'cancelled' },
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
