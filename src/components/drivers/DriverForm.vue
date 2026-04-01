<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-expansion-panels v-model="openPanels" multiple>
      <!-- Datos personales -->
      <v-expansion-panel title="Datos personales" value="personal">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.full_name"
                label="Nombre completo *"
                :error-messages="errors.full_name"
                variant="outlined"
                required
                data-testid="driver-nombre-completo"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.national_id"
                label="NIF/NIE *"
                :error-messages="errors.national_id"
                variant="outlined"
                required
                maxlength="9"
                data-testid="driver-nif-nie"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.birth_date"
                label="Fecha de nacimiento *"
                type="date"
                :error-messages="errors.birth_date"
                variant="outlined"
                required
                data-testid="driver-fecha-nacimiento"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.nationality"
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
                v-model="form.phone"
                label="Teléfono"
                :error-messages="errors.phone"
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
                v-model="form.address"
                label="Dirección"
                variant="outlined"
                data-testid="driver-direccion"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.city"
                label="Ciudad"
                variant="outlined"
                data-testid="driver-ciudad"
              />
            </v-col>
            <v-col cols="6" sm="3" md="2">
              <v-text-field
                v-model="form.postal_code"
                label="C.P."
                variant="outlined"
                maxlength="5"
                data-testid="driver-codigo-postal"
              />
            </v-col>
            <v-col cols="6" sm="3" md="2">
              <v-text-field
                v-model="form.province"
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
                v-model="form.join_date"
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
  full_name: '',
  national_id: '',
  birth_date: '',
  nationality: '',
  address: '',
  city: '',
  postal_code: '',
  province: '',
  phone: '',
  email: '',
  photo_url: '',
  join_date: '',
  status: 'active',
  license_class: '',
  license_number: '',
  license_issue_date: '',
  license_expiry_date: '',
  cap_number: '',
  cap_expiry_date: '',
  cap_training_hours: 35,
  tachograph_card_number: '',
  tachograph_card_expiry: '',
  medical_exam_date: '',
  medical_exam_expiry: '',
  adr_certificate: false,
  adr_number: '',
  adr_expiry_date: '',
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
  { title: 'Activo', value: 'active' },
  { title: 'Baja temporal', value: 'temporary_leave' },
  { title: 'Baja definitiva', value: 'permanently_off' },
]

function onFieldChange({ field, value }) {
  form[field] = value
}

async function handleSubmit() {
  emit('submit', { ...form })
}

defineExpose({ form, handleSubmit })
</script>
