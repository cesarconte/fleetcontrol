<template>
  <v-card>
    <v-card-title>Integraciones GPS</v-card-title>
    <v-card-text>
      <v-form
        v-if="isEditable"
        ref="formRef"
        data-testid="integrations-form"
        @submit.prevent="handleSubmit"
      >
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="form.gps_provider"
              :items="gpsProviders"
              label="Proveedor GPS"
              variant="outlined"
              data-testid="integrations-gps-provider"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="form.gps_api_key"
              label="API Key"
              type="password"
              variant="outlined"
              autocomplete="new-password"
              data-testid="integrations-api-key"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="form.gps_api_secret"
              label="API Secret"
              type="password"
              variant="outlined"
              autocomplete="new-password"
              data-testid="integrations-api-secret"
            />
          </v-col>
        </v-row>
        <div class="d-flex justify-end ga-3 mt-2">
          <v-btn
            type="submit"
            color="primary"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            data-testid="integrations-form-submit"
          >
            Guardar
          </v-btn>
        </div>
      </v-form>

      <!-- Read-only display -->
      <v-row v-else>
        <v-col cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">Proveedor GPS</div>
          <div class="text-body-1">{{ settings?.gps_provider ?? '—' }}</div>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">API Key</div>
          <div class="text-body-1">{{ maskSecret(settings?.gps_api_key) }}</div>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">API Secret</div>
          <div class="text-body-1">{{ maskSecret(settings?.gps_api_secret) }}</div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useSettings } from '@/composables/use-settings.js'
import { canEditIntegrations } from '@/constants/role-permissions.js'

const { currentRole, updateCompanySettings } = useSettings()

const props = defineProps({
  settings: { type: Object, default: null },
})

const emit = defineEmits(['saved'])

const formRef = ref(null)
const isSubmitting = ref(false)
const isEditable = canEditIntegrations(currentRole.value)

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
  () => props.settings,
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

async function handleSubmit() {
  isSubmitting.value = true
  try {
    await updateCompanySettings({ ...form })
    emit('saved')
  } finally {
    isSubmitting.value = false
  }
}
</script>
