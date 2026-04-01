<template>
  <v-card>
    <v-card-title>Datos de la empresa</v-card-title>
    <v-card-text>
      <v-form
        v-if="isEditable"
        ref="formRef"
        data-testid="company-form"
        @submit.prevent="handleSubmit"
      >
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.company_name"
              label="Nombre de la empresa *"
              :error-messages="errors.company_name"
              variant="outlined"
              required
              data-testid="company-name"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.cif"
              label="CIF *"
              :error-messages="errors.cif"
              variant="outlined"
              required
              data-testid="company-cif"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="form.address"
              label="Dirección"
              variant="outlined"
              data-testid="company-address"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="form.city"
              label="Ciudad"
              variant="outlined"
              data-testid="company-city"
            />
          </v-col>
          <v-col cols="6" sm="3" md="2">
            <v-text-field
              v-model="form.postal_code"
              label="C.P."
              variant="outlined"
              data-testid="company-postal-code"
            />
          </v-col>
          <v-col cols="6" sm="3" md="3">
            <v-text-field
              v-model="form.province"
              label="Provincia"
              variant="outlined"
              data-testid="company-province"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="form.country"
              label="País"
              variant="outlined"
              data-testid="company-country"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="form.email"
              label="Email"
              type="email"
              :error-messages="errors.email"
              variant="outlined"
              data-testid="company-email"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="form.phone"
              label="Teléfono"
              variant="outlined"
              data-testid="company-phone"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="form.transport_authorization_number"
              label="Nº autorización transporte"
              variant="outlined"
              data-testid="company-transport-auth"
            />
          </v-col>
        </v-row>
        <div class="d-flex justify-end ga-3 mt-2">
          <v-btn
            type="submit"
            color="primary"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            data-testid="company-form-submit"
          >
            Guardar
          </v-btn>
        </div>
      </v-form>

      <!-- Read-only display -->
      <v-row v-else>
        <v-col cols="12" sm="6">
          <div class="text-caption text-uppercase text-medium-emphasis">Nombre</div>
          <div class="text-body-1">{{ settings?.company_name ?? '—' }}</div>
        </v-col>
        <v-col cols="12" sm="6">
          <div class="text-caption text-uppercase text-medium-emphasis">CIF</div>
          <div class="text-body-1">{{ settings?.cif ?? '—' }}</div>
        </v-col>
        <v-col cols="12">
          <div class="text-caption text-uppercase text-medium-emphasis">Dirección</div>
          <div class="text-body-1">{{ fullAddress }}</div>
        </v-col>
        <v-col cols="12" sm="6">
          <div class="text-caption text-uppercase text-medium-emphasis">Email</div>
          <div class="text-body-1">{{ settings?.email ?? '—' }}</div>
        </v-col>
        <v-col cols="12" sm="6">
          <div class="text-caption text-uppercase text-medium-emphasis">Teléfono</div>
          <div class="text-body-1">{{ settings?.phone ?? '—' }}</div>
        </v-col>
        <v-col cols="12" sm="6">
          <div class="text-caption text-uppercase text-medium-emphasis">
            Autorización transporte
          </div>
          <div class="text-body-1">{{ settings?.transport_authorization_number ?? '—' }}</div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useSettings } from '@/composables/use-settings.js'
import { canEditCompanySettings } from '@/constants/role-permissions.js'
import { companySettingsSchema } from '@/validations/settings-schema.js'

const { currentRole, updateCompanySettings } = useSettings()

const props = defineProps({
  settings: { type: Object, default: null },
})

const emit = defineEmits(['saved'])

const formRef = ref(null)
const isSubmitting = ref(false)
const errors = reactive({})

const isEditable = computed(() => canEditCompanySettings(currentRole))

const fullAddress = computed(() => {
  const s = props.settings
  if (!s) return '—'
  return [s.address, s.postal_code, s.city, s.province, s.country].filter(Boolean).join(', ') || '—'
})

const form = reactive({
  company_name: '',
  cif: '',
  address: '',
  city: '',
  postal_code: '',
  province: '',
  country: 'España',
  email: '',
  phone: '',
  transport_authorization_number: '',
})

watch(
  () => props.settings,
  s => {
    if (s) Object.assign(form, s)
  },
  { immediate: true },
)

function clearErrors() {
  Object.keys(errors).forEach(k => delete errors[k])
}

async function handleSubmit() {
  clearErrors()
  const result = companySettingsSchema.safeParse(form)
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors[issue.path[0]] = issue.message
    }
    return
  }
  isSubmitting.value = true
  try {
    await updateCompanySettings(result.data)
    emit('saved')
  } finally {
    isSubmitting.value = false
  }
}
</script>
