<template>
  <VCard>
    <VCardTitle>Integraciones</VCardTitle>
    <VCardText>
      <VExpansionPanels v-if="isEditable" variant="accordion" data-testid="integrations-panels">
        <!-- Panel 1: GPS/Telemática -->
        <VExpansionPanel data-testid="integrations-gps-panel">
          <VExpansionPanelTitle>
            <VIcon start>mdi-map-marker</VIcon>
            GPS / Telemática
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <VRow>
              <VCol cols="12" sm="6" md="4">
                <v-select
                  v-model="gps.gps_provider"
                  :items="gpsProviders"
                  label="Proveedor GPS"
                  variant="outlined"
                  :error-messages="gpsErrors.gps_provider"
                  data-testid="integrations-gps-provider"
                />
              </VCol>
              <VCol cols="12" sm="6" md="4">
                <v-text-field
                  v-model="gps.gps_api_key"
                  label="API Key"
                  type="password"
                  variant="outlined"
                  data-testid="integrations-gps-api-key"
                />
              </VCol>
              <VCol cols="12" sm="6" md="4">
                <v-text-field
                  v-model="gps.gps_api_secret"
                  label="API Secret"
                  type="password"
                  variant="outlined"
                  data-testid="integrations-gps-api-secret"
                />
              </VCol>
              <VCol v-if="gps.gps_provider === 'mock'" cols="12">
                <VAlert type="info" variant="tonal" density="compact" class="mb-3">
                  <template #prepend>
                    <VIcon>mdi-information</VIcon>
                  </template>
                  El proveedor Mock genera posiciones GPS simuladas leyendo las rutas activas de la
                  BD. Ideal para desarrollo sin hardware de telemática.
                </VAlert>
                <VSwitch
                  v-model="gps.mock_gps_enabled"
                  label="Mock GPS activo"
                  color="primary"
                  inset
                  data-testid="integrations-gps-mock-enabled"
                />
                <div class="text-caption text-medium-emphasis mt-1">
                  {{
                    gps.mock_gps_enabled
                      ? 'Simulación GPS activa — los vehículos generarán posiciones en el mapa'
                      : 'Simulación GPS desactivada'
                  }}
                </div>
              </VCol>
            </VRow>
            <div class="d-flex justify-end ga-3 mt-2">
              <VBtn
                variant="outlined"
                color="secondary"
                disabled
                data-testid="integrations-gps-test"
              >
                Probar conexión
              </VBtn>
              <VBtn
                color="primary"
                :loading="savingGps"
                data-testid="integrations-gps-save"
                @click="saveSection('gps')"
              >
                Guardar
              </VBtn>
            </div>
          </VExpansionPanelText>
        </VExpansionPanel>

        <!-- Panel 2: Email -->
        <VExpansionPanel data-testid="integrations-email-panel">
          <VExpansionPanelTitle>
            <VIcon start>mdi-email</VIcon>
            Email
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <VRow>
              <VCol cols="12" sm="6" md="4">
                <v-select
                  v-model="email.email_provider"
                  :items="emailProviders"
                  label="Proveedor Email"
                  variant="outlined"
                  :error-messages="emailErrors.email_provider"
                  data-testid="integrations-email-provider"
                />
              </VCol>
              <VCol cols="12" sm="6" md="4">
                <v-text-field
                  v-model="email.email_api_key"
                  label="API Key"
                  type="password"
                  variant="outlined"
                  data-testid="integrations-email-api-key"
                />
              </VCol>
              <VCol cols="12" sm="6" md="4">
                <v-text-field
                  v-model="email.email_sender_email"
                  label="Email remitente"
                  type="email"
                  variant="outlined"
                  :error-messages="emailErrors.email_sender_email"
                  data-testid="integrations-email-sender-email"
                />
              </VCol>
              <VCol cols="12" sm="6" md="4">
                <v-text-field
                  v-model="email.email_sender_name"
                  label="Nombre remitente"
                  variant="outlined"
                  data-testid="integrations-email-sender-name"
                />
              </VCol>
            </VRow>
            <div class="d-flex justify-end ga-3 mt-2">
              <VBtn
                variant="outlined"
                color="secondary"
                disabled
                data-testid="integrations-email-test"
              >
                Probar conexión
              </VBtn>
              <VBtn
                color="primary"
                :loading="savingEmail"
                data-testid="integrations-email-save"
                @click="saveSection('email')"
              >
                Guardar
              </VBtn>
            </div>
          </VExpansionPanelText>
        </VExpansionPanel>

        <!-- Panel 3: Maps -->
        <VExpansionPanel data-testid="integrations-maps-panel">
          <VExpansionPanelTitle>
            <VIcon start>mdi-earth</VIcon>
            Mapas
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <VRow>
              <VCol cols="12" sm="6" md="4">
                <v-select
                  v-model="maps.maps_provider"
                  :items="mapsProviders"
                  label="Proveedor Mapas"
                  variant="outlined"
                  :error-messages="mapsErrors.maps_provider"
                  data-testid="integrations-maps-provider"
                />
              </VCol>
              <VCol cols="12" sm="6" md="4">
                <v-text-field
                  v-model="maps.maps_api_key"
                  label="API Key"
                  type="password"
                  variant="outlined"
                  data-testid="integrations-maps-api-key"
                />
              </VCol>
            </VRow>
            <div class="d-flex justify-end ga-3 mt-2">
              <VBtn
                variant="outlined"
                color="secondary"
                disabled
                data-testid="integrations-maps-test"
              >
                Probar conexión
              </VBtn>
              <VBtn
                color="primary"
                :loading="savingMaps"
                data-testid="integrations-maps-save"
                @click="saveSection('maps')"
              >
                Guardar
              </VBtn>
            </div>
          </VExpansionPanelText>
        </VExpansionPanel>

        <!-- Panel 4: Tarjetas Combustible -->
        <VExpansionPanel data-testid="integrations-fuel-panel">
          <VExpansionPanelTitle>
            <VIcon start>mdi-gas-station</VIcon>
            Tarjetas Combustible
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <VRow>
              <VCol cols="12" sm="6" md="4">
                <v-select
                  v-model="fuel.fuel_card_provider"
                  :items="fuelCardProviders"
                  label="Proveedor"
                  variant="outlined"
                  :error-messages="fuelErrors.fuel_card_provider"
                  data-testid="integrations-fuel-provider"
                />
              </VCol>
              <VCol cols="12" sm="6" md="4">
                <v-text-field
                  v-model="fuel.fuel_card_api_key"
                  label="API Key"
                  type="password"
                  variant="outlined"
                  data-testid="integrations-fuel-api-key"
                />
              </VCol>
              <VCol cols="12" sm="6" md="4">
                <v-text-field
                  v-model="fuel.fuel_card_api_secret"
                  label="API Secret"
                  type="password"
                  variant="outlined"
                  data-testid="integrations-fuel-api-secret"
                />
              </VCol>
            </VRow>
            <div class="d-flex justify-end ga-3 mt-2">
              <VBtn
                variant="outlined"
                color="secondary"
                disabled
                data-testid="integrations-fuel-test"
              >
                Probar conexión
              </VBtn>
              <VBtn
                color="primary"
                :loading="savingFuel"
                data-testid="integrations-fuel-save"
                @click="saveSection('fuel')"
              >
                Guardar
              </VBtn>
            </div>
          </VExpansionPanelText>
        </VExpansionPanel>

        <!-- Panel 5: Contabilidad -->
        <VExpansionPanel data-testid="integrations-accounting-panel">
          <VExpansionPanelTitle>
            <VIcon start>mdi-calculator</VIcon>
            Contabilidad
          </VExpansionPanelTitle>
          <VExpansionPanelText>
            <VRow>
              <VCol cols="12" sm="6" md="4">
                <v-select
                  v-model="accounting.accounting_provider"
                  :items="accountingProviders"
                  label="Proveedor"
                  variant="outlined"
                  :error-messages="accountingErrors.accounting_provider"
                  data-testid="integrations-accounting-provider"
                />
              </VCol>
              <VCol cols="12" sm="6" md="4">
                <v-text-field
                  v-model="accounting.accounting_api_key"
                  label="API Key"
                  type="password"
                  variant="outlined"
                  data-testid="integrations-accounting-api-key"
                />
              </VCol>
              <VCol cols="12" sm="6" md="4">
                <v-text-field
                  v-model="accounting.accounting_api_url"
                  label="URL API"
                  variant="outlined"
                  data-testid="integrations-accounting-api-url"
                />
              </VCol>
            </VRow>
            <div class="d-flex justify-end ga-3 mt-2">
              <VBtn
                variant="outlined"
                color="secondary"
                disabled
                data-testid="integrations-accounting-test"
              >
                Probar conexión
              </VBtn>
              <VBtn
                color="primary"
                :loading="savingAccounting"
                data-testid="integrations-accounting-save"
                @click="saveSection('accounting')"
              >
                Guardar
              </VBtn>
            </div>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>

      <!-- Read-only display -->
      <VExpansionPanels v-else variant="accordion">
        <VExpansionPanel title="GPS / Telemática">
          <VExpansionPanelText>
            <VRow>
              <VCol cols="12" sm="6" md="4">
                <div class="text-caption text-uppercase text-medium-emphasis">Proveedor GPS</div>
                <div class="text-body-1">{{ store.companySettings?.gps_provider || '—' }}</div>
              </VCol>
              <VCol cols="12" sm="6" md="4">
                <div class="text-caption text-uppercase text-medium-emphasis">API Key</div>
                <div class="text-body-1">{{ maskSecret(store.companySettings?.gps_api_key) }}</div>
              </VCol>
              <VCol cols="12" sm="6" md="4">
                <div class="text-caption text-uppercase text-medium-emphasis">API Secret</div>
                <div class="text-body-1">
                  {{ maskSecret(store.companySettings?.gps_api_secret) }}
                </div>
              </VCol>
            </VRow>
          </VExpansionPanelText>
        </VExpansionPanel>
        <VExpansionPanel title="Email">
          <VExpansionPanelText>
            <VRow>
              <VCol cols="12" sm="6" md="4">
                <div class="text-caption text-uppercase text-medium-emphasis">Proveedor Email</div>
                <div class="text-body-1">{{ store.companySettings?.email_provider || '—' }}</div>
              </VCol>
              <VCol cols="12" sm="6" md="4">
                <div class="text-caption text-uppercase text-medium-emphasis">API Key</div>
                <div class="text-body-1">
                  {{ maskSecret(store.companySettings?.email_api_key) }}
                </div>
              </VCol>
              <VCol cols="12" sm="6" md="4">
                <div class="text-caption text-uppercase text-medium-emphasis">Remitente</div>
                <div class="text-body-1">
                  {{ store.companySettings?.email_sender_email || '—' }}
                </div>
              </VCol>
            </VRow>
          </VExpansionPanelText>
        </VExpansionPanel>
        <VExpansionPanel title="Mapas">
          <VExpansionPanelText>
            <VRow>
              <VCol cols="12" sm="6" md="4">
                <div class="text-caption text-uppercase text-medium-emphasis">Proveedor Mapas</div>
                <div class="text-body-1">{{ store.companySettings?.maps_provider || '—' }}</div>
              </VCol>
              <VCol cols="12" sm="6" md="4">
                <div class="text-caption text-uppercase text-medium-emphasis">API Key</div>
                <div class="text-body-1">{{ maskSecret(store.companySettings?.maps_api_key) }}</div>
              </VCol>
            </VRow>
          </VExpansionPanelText>
        </VExpansionPanel>
        <VExpansionPanel title="Tarjetas Combustible">
          <VExpansionPanelText>
            <VRow>
              <VCol cols="12" sm="6" md="4">
                <div class="text-caption text-uppercase text-medium-emphasis">Proveedor</div>
                <div class="text-body-1">
                  {{ store.companySettings?.fuel_card_provider || '—' }}
                </div>
              </VCol>
              <VCol cols="12" sm="6" md="4">
                <div class="text-caption text-uppercase text-medium-emphasis">API Key</div>
                <div class="text-body-1">
                  {{ maskSecret(store.companySettings?.fuel_card_api_key) }}
                </div>
              </VCol>
            </VRow>
          </VExpansionPanelText>
        </VExpansionPanel>
        <VExpansionPanel title="Contabilidad">
          <VExpansionPanelText>
            <VRow>
              <VCol cols="12" sm="6" md="4">
                <div class="text-caption text-uppercase text-medium-emphasis">Proveedor</div>
                <div class="text-body-1">
                  {{ store.companySettings?.accounting_provider || '—' }}
                </div>
              </VCol>
              <VCol cols="12" sm="6" md="4">
                <div class="text-caption text-uppercase text-medium-emphasis">API Key</div>
                <div class="text-body-1">
                  {{ maskSecret(store.companySettings?.accounting_api_key) }}
                </div>
              </VCol>
              <VCol cols="12" sm="6" md="4">
                <div class="text-caption text-uppercase text-medium-emphasis">URL API</div>
                <div class="text-body-1">
                  {{ store.companySettings?.accounting_api_url || '—' }}
                </div>
              </VCol>
            </VRow>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
    </VCardText>
  </VCard>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useSettings } from '@/composables/use-settings.js'
import { canEditIntegrations } from '@/constants/role-permissions.js'
import { computed } from 'vue'
import {
  integrationsSchema,
  emailIntegrationsSchema,
  mapsIntegrationsSchema,
  fuelCardIntegrationsSchema,
  accountingIntegrationsSchema,
} from '@/validations/settings-schema.js'

const store = useSettings()
const emit = defineEmits(['saved'])
const isEditable = computed(() => canEditIntegrations(store.currentRole))

const gpsProviders = [
  { title: 'Webfleet', value: 'webfleet' },
  { title: 'Frotcom', value: 'frotcom' },
  { title: 'Geotab', value: 'geotab' },
  { title: 'Mock (desarrollo)', value: 'mock' },
]
const emailProviders = [
  { title: 'Brevo', value: 'brevo' },
  { title: 'SendGrid', value: 'sendgrid' },
]
const mapsProviders = [{ title: 'Google Maps', value: 'google_maps' }]
const fuelCardProviders = [
  { title: 'DKV', value: 'dkv' },
  { title: 'WABCO', value: 'wabco' },
]
const accountingProviders = [
  { title: 'Sage', value: 'sage' },
  { title: 'A3', value: 'a3' },
  { title: 'Holded', value: 'holded' },
]

const SECTION_SCHEMAS = {
  gps: integrationsSchema,
  email: emailIntegrationsSchema,
  maps: mapsIntegrationsSchema,
  fuel: fuelCardIntegrationsSchema,
  accounting: accountingIntegrationsSchema,
}

const SECTION_FIELDS = {
  gps: ['gps_provider', 'gps_api_key', 'gps_api_secret'],
  email: ['email_provider', 'email_api_key', 'email_sender_email', 'email_sender_name'],
  maps: ['maps_provider', 'maps_api_key'],
  fuel: ['fuel_card_provider', 'fuel_card_api_key', 'fuel_card_api_secret'],
  accounting: ['accounting_provider', 'accounting_api_key', 'accounting_api_url'],
}

// ── Section forms ───────────────────────────────────────
const gps = reactive({
  gps_provider: '',
  gps_api_key: '',
  gps_api_secret: '',
  mock_gps_enabled: false,
})
const email = reactive({
  email_provider: '',
  email_api_key: '',
  email_sender_email: '',
  email_sender_name: '',
})
const maps = reactive({ maps_provider: '', maps_api_key: '' })
const fuel = reactive({ fuel_card_provider: '', fuel_card_api_key: '', fuel_card_api_secret: '' })
const accounting = reactive({
  accounting_provider: '',
  accounting_api_key: '',
  accounting_api_url: '',
})

const SECTION_FORMS = { gps, email, maps, fuel, accounting }

// ── Section errors ──────────────────────────────────────
const gpsErrors = reactive({})
const emailErrors = reactive({})
const mapsErrors = reactive({})
const fuelErrors = reactive({})
const accountingErrors = reactive({})

const SECTION_ERRORS = {
  gps: gpsErrors,
  email: emailErrors,
  maps: mapsErrors,
  fuel: fuelErrors,
  accounting: accountingErrors,
}

// ── Section loading states ──────────────────────────────
const savingGps = ref(false)
const savingEmail = ref(false)
const savingMaps = ref(false)
const savingFuel = ref(false)
const savingAccounting = ref(false)

const SECTION_LOADING = {
  gps: savingGps,
  email: savingEmail,
  maps: savingMaps,
  fuel: savingFuel,
  accounting: savingAccounting,
}

// ── Populate from store ─────────────────────────────────
watch(
  () => store.companySettings,
  s => {
    if (!s) return
    for (const [section, fields] of Object.entries(SECTION_FIELDS)) {
      const form = SECTION_FORMS[section]
      for (const field of fields) {
        form[field] = s[field] ?? ''
      }
    }
  },
  { immediate: true },
)

// ── Helpers ─────────────────────────────────────────────
function maskSecret(value) {
  if (!value) return '—'
  if (value.length <= 4) return '••••'
  return '••••' + value.slice(-4)
}

function clearSectionErrors(section) {
  const errors = SECTION_ERRORS[section]
  Object.keys(errors).forEach(k => delete errors[k])
}

// ── Save per section ────────────────────────────────────
async function saveSection(section) {
  clearSectionErrors(section)
  const schema = SECTION_SCHEMAS[section]
  const form = SECTION_FORMS[section]
  const errors = SECTION_ERRORS[section]
  const loading = SECTION_LOADING[section]

  const result = schema.safeParse({ ...form })
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors[issue.path[0]] = issue.message
    }
    return
  }
  loading.value = true
  try {
    await store.updateCompanySettings(result.data)
    emit('saved')
  } finally {
    loading.value = false
  }
}
</script>
