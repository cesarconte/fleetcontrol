<template>
  <VCard>
    <VCardTitle>Integraciones GPS</VCardTitle>
    <VCardText>
      <VForm
        v-if="isEditable"
        ref="formRef"
        data-testid="integrations-form"
        @submit.prevent="handleSubmit"
      >
        <VRow>
          <VCol cols="12" sm="6" md="4">
            <v-select
              v-model="form.gps_provider"
              :items="gpsProviders"
              label="Proveedor GPS"
              variant="outlined"
              :error-messages="errors.gps_provider"
              data-testid="integrations-gps-provider"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <v-text-field
              v-model="form.gps_api_key"
              label="API Key"
              type="password"
              variant="outlined"
              data-testid="integrations-api-key"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <v-text-field
              v-model="form.gps_api_secret"
              label="API Secret"
              type="password"
              variant="outlined"
              data-testid="integrations-api-secret"
            />
          </VCol>
        </VRow>
        <div class="d-flex justify-end ga-3 mt-2">
          <VBtn
            type="submit"
            color="primary"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            data-testid="integrations-form-submit"
          >
            Guardar
          </VBtn>
        </div>
      </VForm>

      <!-- Read-only display -->
      <VRow v-else>
        <VCol cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">Proveedor GPS</div>
          <div class="text-body-1">{{ store.companySettings?.gps_provider ?? '—' }}</div>
        </VCol>
        <VCol cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">API Key</div>
          <div class="text-body-1">{{ maskSecret(store.companySettings?.gps_api_key) }}</div>
        </VCol>
        <VCol cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">API Secret</div>
          <div class="text-body-1">{{ maskSecret(store.companySettings?.gps_api_secret) }}</div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useSettings } from '@/composables/use-settings.js'
import { canEditIntegrations } from '@/constants/role-permissions.js'
import { integrationsSchema } from '@/validations/settings-schema.js'

const store = useSettings()

const emit = defineEmits(['saved'])

const formRef = ref(null)
const isSubmitting = ref(false)
const errors = reactive({})
const isEditable = computed(() => canEditIntegrations(store.currentRole))

const gpsProviders = [
  { title: 'Webfleet', value: 'webfleet' },
  { title: 'Frotcom', value: 'frotcom' },
  { title: 'Geotab', value: 'geotab' },
  { title: 'Otro', value: 'otro' },
]

const form = reactive({
  gps_provider: '',
  gps_api_key: '',
  gps_api_secret: '',
})

watch(
  () => store.companySettings,
  s => {
    if (s) {
      form.gps_provider = s.gps_provider ?? ''
      form.gps_api_key = s.gps_api_key ?? ''
      form.gps_api_secret = s.gps_api_secret ?? ''
    }
  },
  { immediate: true },
)

function maskSecret(value) {
  if (!value) return '—'
  if (value.length <= 4) return '••••'
  return '••••' + value.slice(-4)
}

function clearErrors() {
  Object.keys(errors).forEach(k => delete errors[k])
}

async function handleSubmit() {
  clearErrors()
  const result = integrationsSchema.safeParse(form)
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
