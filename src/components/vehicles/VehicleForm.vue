<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <!-- Identificación -->
    <v-expansion-panels v-model="openPanels" multiple>
      <v-expansion-panel title="Identificación" value="id">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.matricula"
                label="Matrícula *"
                :error-messages="errors.matricula"
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
                v-model="form.marca"
                label="Marca *"
                :error-messages="errors.marca"
                variant="outlined"
                required
                data-testid="vehicle-brand"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.modelo"
                label="Modelo *"
                :error-messages="errors.modelo"
                variant="outlined"
                required
                data-testid="vehicle-model"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.variante"
                label="Variante"
                variant="outlined"
                data-testid="vehicle-variant"
              />
            </v-col>
            <v-col cols="6" sm="4" md="2">
              <v-text-field
                v-model.number="form.anio_fabricacion"
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
                v-model="form.distintivo_ambiental"
                :items="dgtBadges"
                label="Distintivo DGT"
                variant="outlined"
                data-testid="vehicle-dgt-badge"
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="form.euro_emisiones"
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

      <!-- Clasificación UE y Estado -->
      <v-expansion-panel title="Clasificación y Estado" value="type">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="4">
              <v-select
                v-model="form.categoria_ue"
                :items="euCategoriaOptions"
                label="Categoría UE *"
                :error-messages="errors.categoria_ue"
                variant="outlined"
                required
                data-testid="vehicle-eu-category"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                v-model="form.tipo_carroceria"
                :items="bodyTypeOptions"
                label="Tipo de carrocería *"
                :error-messages="errors.tipo_carroceria"
                variant="outlined"
                required
                data-testid="vehicle-body-type"
              />
            </v-col>
            <v-col cols="12" sm="4">
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
                v-model="form.tipo_combustible"
                :items="fuelTypes"
                label="Combustible"
                variant="outlined"
                data-testid="vehicle-fuel-type"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.matricula_semirremolque"
                label="Matrícula semirremolque"
                variant="outlined"
                data-testid="vehicle-semitrailer"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.tipo_enganche"
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
                v-model.number="form.mma_kg"
                label="MMA (kg)"
                type="number"
                :error-messages="errors.mma_kg"
                variant="outlined"
                data-testid="vehicle-gross-weight"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.tara_kg"
                label="Tara (kg)"
                type="number"
                variant="outlined"
                data-testid="vehicle-tare"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.carga_util_max_kg"
                label="Carga útil (kg)"
                type="number"
                variant="outlined"
                data-testid="vehicle-payload"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.mma_conjunto_kg"
                label="MMA conjunto (kg)"
                type="number"
                variant="outlined"
                data-testid="vehicle-combined-weight"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.anchura_max_m"
                label="Ancho (m)"
                type="number"
                step="0.01"
                :error-messages="errors.anchura_max_m"
                variant="outlined"
                data-testid="vehicle-width"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.altura_max_m"
                label="Alto (m)"
                type="number"
                step="0.01"
                :error-messages="errors.altura_max_m"
                variant="outlined"
                data-testid="vehicle-height"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.longitud_total_m"
                label="Largo (m)"
                type="number"
                step="0.01"
                :error-messages="errors.longitud_total_m"
                variant="outlined"
                data-testid="vehicle-length"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.numero_ejes"
                label="Nº ejes"
                type="number"
                variant="outlined"
                data-testid="vehicle-axles"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.longitud_caja_m"
                label="Largo caja (m)"
                type="number"
                step="0.01"
                variant="outlined"
                data-testid="vehicle-box-length"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.volumen_carga_m3"
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
                v-model.number="form.cilindrada_cc"
                label="Cilindrada (cc)"
                type="number"
                variant="outlined"
                data-testid="vehicle-engine-cc"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.potencia_cv"
                label="Potencia (CV)"
                type="number"
                variant="outlined"
                data-testid="vehicle-power-cv"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.potencia_kw"
                label="Potencia (kW)"
                type="number"
                variant="outlined"
                data-testid="vehicle-power-kw"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.par_motor_nm"
                label="Par (Nm)"
                type="number"
                variant="outlined"
                data-testid="vehicle-torque"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model="form.caja_cambios"
                label="Transmisión"
                variant="outlined"
                data-testid="vehicle-transmission"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.velocidad_max_autorizada_kmh"
                label="Vel. máx (km/h)"
                type="number"
                variant="outlined"
                data-testid="vehicle-max-speed"
              />
            </v-col>
            <v-col cols="6" sm="4" md="3">
              <v-text-field
                v-model.number="form.consumo_medio_homologado"
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
import { getEUCategoriaOptions, getBodyOptions } from '@/constants/vehicle-types.js'

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
  matricula: '',
  vin: '',
  marca: '',
  modelo: '',
  variante: '',
  color: '',
  anio_fabricacion: null,
  transport_card_number: '',
  fecha_primera_matriculacion: '',
  distintivo_ambiental: 'sin_etiqueta',
  euro_emisiones: null,
  categoria_ue: 'N3',
  tipo_carroceria: 'lona',
  status: 'activo',
  tipo_combustible: 'diesel',
  matricula_semirremolque: '',
  tipo_enganche: '',
  mma_kg: null,
  tara_kg: null,
  mma_conjunto_kg: null,
  carga_util_max_kg: null,
  anchura_max_m: null,
  altura_max_m: null,
  longitud_total_m: null,
  numero_ejes: null,
  longitud_caja_m: null,
  volumen_carga_m3: null,
  cilindrada_cc: null,
  potencia_cv: null,
  potencia_kw: null,
  par_motor_nm: null,
  caja_cambios: '',
  velocidad_max_autorizada_kmh: null,
  consumo_medio_homologado: null,
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
  { title: '0 — Cero emisiones', value: '0' },
  { title: 'ECO', value: 'eco' },
  { title: 'C', value: 'c' },
  { title: 'B', value: 'b' },
  { title: 'Sin distintivo', value: 'sin_etiqueta' },
]

const euroClasses = [
  { title: 'Euro I', value: 'euro_i' },
  { title: 'Euro II', value: 'euro_ii' },
  { title: 'Euro III', value: 'euro_iii' },
  { title: 'Euro IV', value: 'euro_iv' },
  { title: 'Euro V', value: 'euro_v' },
  { title: 'Euro VI', value: 'euro_vi' },
  { title: 'Euro VI-d', value: 'euro_vi_d' },
  { title: 'Euro VI-e', value: 'euro_vi_e' },
  { title: 'Euro VI-d temp', value: 'euro_vi_d_temp' },
]

const euCategoriaOptions = getEUCategoriaOptions()
const bodyTypeOptions = getBodyOptions()

const vehicleStatuses = [
  { title: 'Activo', value: 'activo' },
  { title: 'En ruta', value: 'en_ruta' },
  { title: 'En mantenimiento', value: 'en_mantenimiento' },
  { title: 'Inactivo', value: 'inactivo' },
  { title: 'Dado de baja', value: 'dado_de_baja' },
]

const fuelTypes = [
  { title: 'Diésel', value: 'diesel' },
  { title: 'GNC', value: 'gnc' },
  { title: 'GNL', value: 'gnl' },
  { title: 'Hidrógeno', value: 'hidrogeno' },
  { title: 'Eléctrico', value: 'electrico' },
  { title: 'Híbrido', value: 'hibrido' },
]

async function handleSubmit() {
  emit('submit', { ...form })
}

defineExpose({ form, handleSubmit })
</script>
