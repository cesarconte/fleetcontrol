<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-row>
      <v-col cols="12" sm="6">
        <v-select
          v-model="form.vehicle_id"
          :items="vehicleOptions"
          label="Vehículo *"
          :error-messages="errors.vehicle_id"
          variant="outlined"
          :loading="loadingRefs"
          data-testid="fuel-vehicle"
        />
      </v-col>
      <v-col cols="6" sm="3">
        <v-text-field
          v-model="form.date"
          label="Fecha *"
          type="date"
          :error-messages="errors.date"
          variant="outlined"
          required
          data-testid="fuel-date"
        />
      </v-col>
      <v-col cols="6" sm="3">
        <v-select
          v-model="form.fuel_type"
          :items="fuelTypes"
          label="Combustible"
          variant="outlined"
          data-testid="fuel-type"
        />
      </v-col>
      <v-col cols="6" sm="4">
        <v-text-field
          v-model.number="form.mileage_km"
          label="Km en el momento *"
          type="number"
          :error-messages="errors.mileage_km"
          variant="outlined"
          required
          data-testid="fuel-mileage"
        />
      </v-col>
      <v-col cols="6" sm="4">
        <v-text-field
          v-model.number="form.liters"
          label="Litros *"
          type="number"
          step="0.01"
          :error-messages="errors.liters"
          variant="outlined"
          required
          data-testid="fuel-liters"
        />
      </v-col>
      <v-col cols="6" sm="4">
        <v-text-field
          v-model.number="form.price_per_liter"
          label="Precio/litro (€) *"
          type="number"
          step="0.001"
          :error-messages="errors.price_per_liter"
          variant="outlined"
          required
          data-testid="fuel-price"
        />
      </v-col>
      <v-col cols="6" sm="4">
        <v-text-field
          v-model.number="form.total_cost_eur"
          label="Importe total (€)"
          type="number"
          step="0.01"
          variant="outlined"
          data-testid="fuel-total"
        />
      </v-col>
      <v-col cols="12" sm="8">
        <v-text-field
          v-model="form.station"
          label="Estación de servicio"
          variant="outlined"
          data-testid="fuel-station"
        />
      </v-col>
      <v-col cols="12">
        <v-textarea
          v-model="form.observations"
          label="Observaciones"
          variant="outlined"
          rows="2"
          data-testid="fuel-observations"
        />
      </v-col>
    </v-row>

    <div class="d-flex justify-end ga-3 mt-4">
      <v-btn variant="text" :to="cancelTo" data-testid="fuel-form-cancel">Cancelar</v-btn>
      <v-btn
        type="submit"
        color="primary"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        data-testid="fuel-form-submit"
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
  cancelTo: { type: [String, Object], default: '/combustible' },
  errors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit'])

const formRef = ref(null)
const loadingRefs = ref(true)
const vehicleOptions = ref([])
const notifications = useNotificationStore()

const form = reactive({
  vehicle_id: '',
  date: '',
  mileage_km: null,
  liters: null,
  price_per_liter: null,
  total_cost_eur: null,
  station: '',
  fuel_type: 'diesel',
  route_id: null,
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

const fuelTypes = [
  { title: 'Diésel', value: 'diesel' },
  { title: 'GNC', value: 'cng' },
  { title: 'GNL', value: 'lng' },
  { title: 'Hidrógeno', value: 'hydrogen' },
  { title: 'Eléctrico', value: 'electric' },
  { title: 'Híbrido', value: 'hybrid' },
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
