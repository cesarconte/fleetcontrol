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
                data-testid="driver-full-name"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.nif"
                label="NIF/NIE *"
                :error-messages="errors.nif"
                variant="outlined"
                required
                maxlength="9"
                data-testid="driver-nif"
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
                data-testid="driver-birth-date"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.nationality"
                label="Nacionalidad"
                variant="outlined"
                data-testid="driver-nationality"
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
                data-testid="driver-phone"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Dirección -->
      <v-expansion-panel title="Dirección" value="address">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.address"
                label="Dirección"
                variant="outlined"
                data-testid="driver-address"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.city"
                label="Ciudad"
                variant="outlined"
                data-testid="driver-city"
              />
            </v-col>
            <v-col cols="6" sm="3" md="2">
              <v-text-field
                v-model="form.postal_code"
                label="C.P."
                variant="outlined"
                maxlength="5"
                data-testid="driver-postal-code"
              />
            </v-col>
            <v-col cols="6" sm="3" md="2">
              <v-text-field
                v-model="form.province"
                label="Provincia"
                variant="outlined"
                data-testid="driver-province"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Estado laboral -->
      <v-expansion-panel title="Estado laboral" value="employment">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="form.hire_date"
                label="Fecha de incorporación"
                type="date"
                variant="outlined"
                data-testid="driver-hire-date"
              />
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-select
                v-model="form.status"
                :items="driverStatuses"
                label="Estado"
                variant="outlined"
                data-testid="driver-status"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
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
  nif: '',
  birth_date: '',
  nationality: '',
  address: '',
  city: '',
  postal_code: '',
  province: '',
  phone: '',
  email: '',
  photo_url: '',
  hire_date: '',
  status: 'active',
  ...props.initialValues,
})

watch(
  () => props.initialValues,
  newValues => {
    Object.assign(form, newValues)
  },
  { deep: true },
)

const driverStatuses = [
  { title: 'Activo', value: 'active' },
  { title: 'Baja temporal', value: 'temporary_leave' },
  { title: 'Inactivo', value: 'inactive' },
]

async function handleSubmit() {
  emit('submit', { ...form })
}

defineExpose({ form, handleSubmit })
</script>
