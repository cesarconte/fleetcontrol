<template>
  <VCard>
    <VCardTitle>Datos de la empresa</VCardTitle>
    <VCardText>
      <VForm
        v-if="isEditable"
        ref="formRef"
        data-testid="company-form"
        @submit.prevent="handleSubmit"
      >
        <VRow>
          <VCol cols="12" sm="6">
            <v-text-field
              v-model="form.company_name"
              label="Nombre de la empresa *"
              :error-messages="errors.company_name"
              variant="outlined"
              required
              data-testid="company-name"
            />
          </VCol>
          <VCol cols="12" sm="6">
            <v-text-field
              v-model="form.cif"
              label="CIF *"
              :error-messages="errors.cif"
              variant="outlined"
              required
              data-testid="company-cif"
            />
          </VCol>
          <VCol cols="12">
            <v-text-field
              v-model="form.address"
              label="Dirección"
              variant="outlined"
              data-testid="company-address"
            />
          </VCol>
          <VCol cols="12" sm="6" md="3">
            <v-text-field
              v-model="form.city"
              label="Ciudad"
              variant="outlined"
              data-testid="company-city"
            />
          </VCol>
          <VCol cols="6" sm="3" md="2">
            <v-text-field
              v-model="form.postal_code"
              label="C.P."
              variant="outlined"
              data-testid="company-postal-code"
            />
          </VCol>
          <VCol cols="6" sm="3" md="3">
            <v-text-field
              v-model="form.province"
              label="Provincia"
              variant="outlined"
              data-testid="company-province"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <v-text-field
              v-model="form.country"
              label="País"
              variant="outlined"
              data-testid="company-country"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <v-text-field
              v-model="form.email"
              label="Email"
              type="email"
              :error-messages="errors.email"
              variant="outlined"
              data-testid="company-email"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <v-text-field
              v-model="form.phone"
              label="Teléfono"
              variant="outlined"
              data-testid="company-phone"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <v-text-field
              v-model="form.transport_authorization_number"
              label="Nº autorización transporte"
              variant="outlined"
              data-testid="company-transport-auth"
            />
          </VCol>
        </VRow>
        <div class="d-flex justify-end ga-3 mt-2">
          <VBtn
            type="submit"
            color="primary"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            data-testid="company-form-submit"
          >
            Guardar
          </VBtn>
        </div>
      </VForm>

      <!-- Read-only display -->
      <VRow v-else>
        <VCol cols="12" sm="6">
          <div class="text-caption text-uppercase text-medium-emphasis">Nombre</div>
          <div class="text-body-1">{{ store.companySettings?.company_name ?? '—' }}</div>
        </VCol>
        <VCol cols="12" sm="6">
          <div class="text-caption text-uppercase text-medium-emphasis">CIF</div>
          <div class="text-body-1">{{ store.companySettings?.cif ?? '—' }}</div>
        </VCol>
        <VCol cols="12">
          <div class="text-caption text-uppercase text-medium-emphasis">Dirección</div>
          <div class="text-body-1">{{ fullAddress }}</div>
        </VCol>
        <VCol cols="12" sm="6">
          <div class="text-caption text-uppercase text-medium-emphasis">Email</div>
          <div class="text-body-1">{{ store.companySettings?.email ?? '—' }}</div>
        </VCol>
        <VCol cols="12" sm="6">
          <div class="text-caption text-uppercase text-medium-emphasis">Teléfono</div>
          <div class="text-body-1">{{ store.companySettings?.phone ?? '—' }}</div>
        </VCol>
        <VCol cols="12" sm="6">
          <div class="text-caption text-uppercase text-medium-emphasis">
            Autorización transporte
          </div>
          <div class="text-body-1">
            {{ store.companySettings?.transport_authorization_number ?? '—' }}
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useSettings } from '@/composables/use-settings.js'
import { canEditCompanySettings } from '@/constants/role-permissions.js'
import { companySettingsSchema } from '@/validations/settings-schema.js'

const store = useSettings()

const emit = defineEmits(['saved'])

const formRef = ref(null)
const isSubmitting = ref(false)
const errors = reactive({})

const isEditable = computed(() => canEditCompanySettings(store.currentRole))

const fullAddress = computed(() => {
  const s = store.companySettings
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
  () => store.companySettings,
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
    await store.updateCompanySettings(result.data)
    emit('saved')
  } finally {
    isSubmitting.value = false
  }
}
</script>
