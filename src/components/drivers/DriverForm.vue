<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-expansion-panels v-model="openPanels" multiple>
      <!-- Datos personales -->
      <v-expansion-panel title="Datos personales" value="personal">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.nombre_completo"
                label="Nombre completo *"
                :error-messages="errors.nombre_completo"
                variant="outlined"
                required
                data-testid="driver-nombre-completo"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.nif_nie"
                label="NIF/NIE *"
                :error-messages="errors.nif_nie"
                variant="outlined"
                required
                maxlength="9"
                data-testid="driver-nif-nie"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.fecha_nacimiento"
                label="Fecha de nacimiento *"
                type="date"
                :error-messages="errors.fecha_nacimiento"
                variant="outlined"
                required
                data-testid="driver-fecha-nacimiento"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.nacionalidad"
                label="Nacionalidad"
                variant="outlined"
                data-testid="driver-nacionalidad"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.email"
                label="Email"
                type="email"
                :error-messages="errors.email"
                variant="outlined"
                data-testid="driver-email"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.telefono"
                label="Teléfono"
                :error-messages="errors.telefono"
                variant="outlined"
                maxlength="9"
                data-testid="driver-telefono"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Dirección -->
      <v-expansion-panel title="Dirección" value="direccion">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.direccion"
                label="Dirección"
                variant="outlined"
                data-testid="driver-direccion"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.ciudad"
                label="Ciudad"
                variant="outlined"
                data-testid="driver-ciudad"
              />
            </v-col>
            <v-col cols="6" sm="3" md="2">
              <v-text-field
                v-model="form.codigo_postal"
                label="C.P."
                variant="outlined"
                maxlength="5"
                data-testid="driver-codigo-postal"
              />
            </v-col>
            <v-col cols="6" sm="3" md="2">
              <v-text-field
                v-model="form.provincia"
                label="Provincia"
                variant="outlined"
                data-testid="driver-provincia"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Estado laboral -->
      <v-expansion-panel title="Estado laboral" value="laboral">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.fecha_incorporacion"
                label="Fecha de incorporación"
                type="date"
                variant="outlined"
                data-testid="driver-fecha-incorporacion"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-select
                v-model="form.status"
                :items="estadosConductor"
                label="Estado"
                variant="outlined"
                data-testid="driver-status"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Carnets y Certificaciones -->
      <DriverFormCarnets :model-value="form" :errors="errors" @field-change="onFieldChange" />
    </v-expansion-panels>

    <!-- Actions -->
    <div class="d-flex justify-end ga-3 mt-4">
      <v-btn variant="text" :to="cancelTo" data-testid="driver-form-cancel">Cancelar</v-btn>
      <v-btn
        type="submit"
        color="primary"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        data-testid="driver-form-submit"
      >
        {{ submitLabel }}
      </v-btn>
    </div>
  </v-form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import DriverFormCarnets from './DriverFormCarnets.vue'

const props = defineProps({
  initialValues: { type: Object, default: () => ({}) },
  isSubmitting: { type: Boolean, default: false },
  submitLabel: { type: String, default: 'Guardar' },
  cancelTo: { type: [String, Object], default: '/conductores' },
  errors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit'])

const formRef = ref(null)
const openPanels = ref(['personal'])

const form = reactive({
  nombre_completo: '',
  nif_nie: '',
  fecha_nacimiento: '',
  nacionalidad: '',
  direccion: '',
  ciudad: '',
  codigo_postal: '',
  provincia: '',
  telefono: '',
  email: '',
  foto_url: '',
  fecha_incorporacion: '',
  status: 'activo',
  carnet_clase: '',
  carnet_numero: '',
  carnet_fecha_expedicion: '',
  carnet_fecha_vencimiento: '',
  cap_numero: '',
  cap_fecha_vencimiento: '',
  cap_horas_formacion: 35,
  tarjeta_tacografo_numero: '',
  tarjeta_tacografo_vencimiento: '',
  reconocimiento_medico_fecha: '',
  reconocimiento_medico_vencimiento: '',
  adr_certificado: false,
  adr_numero: '',
  adr_fecha_vencimiento: '',
  ...props.initialValues,
})

watch(
  () => props.initialValues,
  newValues => {
    Object.assign(form, newValues)
  },
  { deep: true },
)

const estadosConductor = [
  { title: 'Activo', value: 'activo' },
  { title: 'Baja temporal', value: 'baja_temporal' },
  { title: 'Baja definitiva', value: 'baja_definitiva' },
]

function onFieldChange({ field, value }) {
  form[field] = value
}

async function handleSubmit() {
  emit('submit', { ...form })
}

defineExpose({ form, handleSubmit })
</script>
