<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <!-- Identificación -->
    <v-expansion-panels v-model="openPanels" multiple>
      <v-expansion-panel title="Identificación" value="id">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.plate"
                label="Matrícula *"
                :error-messages="errors.plate"
                variant="outlined"
                required
                data-testid="vehicle-plate"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.vin"
                label="VIN (17 caracteres)"
                :error-messages="errors.vin"
                variant="outlined"
                maxlength="17"
                data-testid="vehicle-vin"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.transport_card_number"
                label="Nº tarjeta transporte"
                variant="outlined"
                data-testid="vehicle-transport-card"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.brand"
                label="Marca *"
                :error-messages="errors.brand"
                variant="outlined"
                required
                data-testid="vehicle-brand"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.model"
                label="Modelo *"
                :error-messages="errors.model"
                variant="outlined"
                required
                data-testid="vehicle-model"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.variant"
                label="Variante"
                variant="outlined"
                data-testid="vehicle-variant"
              />
            </v-col>
            <v-col cols="6" sm="4" md="2">
              <v-text-field
                v-model.number="form.year"
                label="Año"
                type="number"
                variant="outlined"
                data-testid="vehicle-year"
              />
            </v-col>
            <v-col cols="6" sm="4" md="2">
              <v-text-field
                v-model="form.color"
                label="Color"
                variant="outlined"
                data-testid="vehicle-color"
              />
            </v-col>
            <v-col cols="12" sm="4" md="3">
              <v-select
                v-model="form.dgt_badge"
                :items="dgtBadges"
                label="Distintivo DGT"
                variant="outlined"
                data-testid="vehicle-dgt-badge"
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="form.euro_class"
                :items="euroClasses"
                label="Euro"
                variant="outlined"
                clearable
                data-testid="vehicle-euro-class"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Tipo y Estado -->
      <v-expansion-panel title="Tipo y Estado" value="type">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.vehicle_type"
                :items="vehicleTypes"
                label="Tipo de vehículo *"
                :error-messages="errors.vehicle_type"
                variant="outlined"
                required
                data-testid="vehicle-type"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.status"
                :items="vehicleStatuses"
                label="Estado"
                variant="outlined"
                data-testid="vehicle-status"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-select
                v-model="form.fuel_type"
                :items="fuelTypes"
                label="Combustible"
                variant="outlined"
                data-testid="vehicle-fuel-type"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.associated_semitrailer_plate"
                label="Matrícula semirremolque"
                variant="outlined"
                data-testid="vehicle-semitrailer"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.hitch_type"
                label="Tipo de enganche"
                variant="outlined"
                data-testid="vehicle-hitch"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Masas y Dimensiones -->
      <v-expansion-panel title="Masas y Dimensiones" value="mass">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.gross_weight_kg"
                label="MMA (kg)"
                type="number"
                :error-messages="errors.gross_weight_kg"
                variant="outlined"
                data-testid="vehicle-gross-weight"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.tare_kg"
                label="Tara (kg)"
                type="number"
                variant="outlined"
                data-testid="vehicle-tare"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.max_payload_kg"
                label="Carga útil (kg)"
                type="number"
                variant="outlined"
                data-testid="vehicle-payload"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.combined_gross_weight_kg"
                label="MMA conjunto (kg)"
                type="number"
                variant="outlined"
                data-testid="vehicle-combined-weight"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.width_m"
                label="Ancho (m)"
                type="number"
                step="0.01"
                :error-messages="errors.width_m"
                variant="outlined"
                data-testid="vehicle-width"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.height_m"
                label="Alto (m)"
                type="number"
                step="0.01"
                :error-messages="errors.height_m"
                variant="outlined"
                data-testid="vehicle-height"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.length_m"
                label="Largo (m)"
                type="number"
                step="0.01"
                :error-messages="errors.length_m"
                variant="outlined"
                data-testid="vehicle-length"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.axle_count"
                label="Nº ejes"
                type="number"
                variant="outlined"
                data-testid="vehicle-axles"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.box_length_m"
                label="Largo caja (m)"
                type="number"
                step="0.01"
                variant="outlined"
                data-testid="vehicle-box-length"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.cargo_volume_m3"
                label="Volumen carga (m³)"
                type="number"
                step="0.01"
                variant="outlined"
                data-testid="vehicle-cargo-volume"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Motor y Emisiones -->
      <v-expansion-panel title="Motor y Emisiones" value="engine">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.engine_cc"
                label="Cilindrada (cc)"
                type="number"
                variant="outlined"
                data-testid="vehicle-engine-cc"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.power_cv"
                label="Potencia (CV)"
                type="number"
                variant="outlined"
                data-testid="vehicle-power-cv"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.power_kw"
                label="Potencia (kW)"
                type="number"
                variant="outlined"
                data-testid="vehicle-power-kw"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.torque_nm"
                label="Par (Nm)"
                type="number"
                variant="outlined"
                data-testid="vehicle-torque"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model="form.transmission"
                label="Transmisión"
                variant="outlined"
                data-testid="vehicle-transmission"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.max_speed_kmh"
                label="Vel. máx (km/h)"
                type="number"
                variant="outlined"
                data-testid="vehicle-max-speed"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.consumption_homologated"
                label="Consumo homologado (L/100km)"
                type="number"
                step="0.01"
                variant="outlined"
                data-testid="vehicle-consumption"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3" class="d-flex align-center">
              <v-checkbox v-model="form.adblue" label="AdBlue" data-testid="vehicle-adblue" />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Actions -->
    <div class="d-flex justify-end ga-3 mt-4">
      <v-btn variant="text" :to="cancelTo" data-testid="vehicle-form-cancel">Cancelar</v-btn>
      <v-btn
        type="submit"
        color="primary"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        data-testid="vehicle-form-submit"
      >
        {{ submitLabel }}
      </v-btn>
    </div>
  </v-form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  initialValues: { type: Object, default: () => ({}) },
  isSubmitting: { type: Boolean, default: false },
  submitLabel: { type: String, default: 'Guardar' },
  cancelTo: { type: [String, Object], default: '/vehiculos' },
  errors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit'])

const formRef = ref(null)
const openPanels = ref(['id', 'type'])

const form = reactive({
  plate: '',
  vin: '',
  brand: '',
  model: '',
  variant: '',
  color: '',
  year: null,
  transport_card_number: '',
  first_registration_date: '',
  dgt_badge: 'none',
  euro_class: null,
  vehicle_type: 'tractor',
  status: 'active',
  fuel_type: 'diesel',
  associated_semitrailer_plate: '',
  hitch_type: '',
  gross_weight_kg: null,
  tare_kg: null,
  combined_gross_weight_kg: null,
  max_payload_kg: null,
  width_m: null,
  height_m: null,
  length_m: null,
  axle_count: null,
  box_length_m: null,
  cargo_volume_m3: null,
  engine_cc: null,
  power_cv: null,
  power_kw: null,
  torque_nm: null,
  transmission: '',
  max_speed_kmh: null,
  consumption_homologated: null,
  adblue: false,
  ...props.initialValues,
})

watch(
  () => props.initialValues,
  newValues => {
    Object.assign(form, newValues)
  },
  { deep: true },
)

const dgtBadges = [
  { title: '0 — Cero emisiones', value: 'zero' },
  { title: 'ECO', value: 'eco' },
  { title: 'C', value: 'c' },
  { title: 'B', value: 'b' },
  { title: 'Sin distintivo', value: 'none' },
]

const euroClasses = [
  { title: 'Euro 1', value: 'euro_1' },
  { title: 'Euro 2', value: 'euro_2' },
  { title: 'Euro 3', value: 'euro_3' },
  { title: 'Euro 4', value: 'euro_4' },
  { title: 'Euro 5', value: 'euro_5' },
  { title: 'Euro 6', value: 'euro_6' },
  { title: 'Euro 6d', value: 'euro_6d' },
  { title: 'Euro 6e', value: 'euro_6e' },
  { title: 'Euro 6d-temp', value: 'euro_6d_temp' },
]

const vehicleTypes = [
  { title: 'Tractor', value: 'tractor' },
  { title: 'Rígido', value: 'rigid' },
  { title: 'Semirremolque', value: 'semitrailer' },
  { title: 'Remolque', value: 'trailer' },
  { title: 'Cisterna', value: 'tanker' },
  { title: 'Frigorífico', value: 'refrigerated' },
  { title: 'Volquete', value: 'dump' },
  { title: 'Lona', value: 'curtain' },
  { title: 'Furgón', value: 'box' },
  { title: 'Especial', value: 'special' },
]

const vehicleStatuses = [
  { title: 'Activo', value: 'active' },
  { title: 'En ruta', value: 'in_route' },
  { title: 'En mantenimiento', value: 'in_maintenance' },
  { title: 'Inactivo', value: 'inactive' },
  { title: 'Archivado', value: 'archived' },
]

const fuelTypes = [
  { title: 'Diésel', value: 'diesel' },
  { title: 'GNC', value: 'cng' },
  { title: 'GNL', value: 'lng' },
  { title: 'Hidrógeno', value: 'hydrogen' },
  { title: 'Eléctrico', value: 'electric' },
  { title: 'Híbrido', value: 'hybrid' },
]

async function handleSubmit() {
  emit('submit', { ...form })
}

defineExpose({ form, handleSubmit })
</script>
