<template>
  <VCard>
    <VCardTitle>Umbrales de alerta</VCardTitle>
    <VCardText>
      <VForm
        v-if="isEditable"
        ref="formRef"
        data-testid="alert-thresholds-form"
        @submit.prevent="handleSubmit"
      >
        <VRow>
          <VCol cols="12" sm="6" md="4">
            <v-text-field
              v-model.number="form.alert_days_vehicle_doc"
              label="Días aviso doc. vehículo"
              type="number"
              :min="1"
              :max="365"
              :error-messages="errors.alert_days_vehicle_doc"
              variant="outlined"
              data-testid="alert-vehicle-doc"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <v-text-field
              v-model.number="form.alert_days_driver_doc"
              label="Días aviso doc. conductor"
              type="number"
              :min="1"
              :max="365"
              :error-messages="errors.alert_days_driver_doc"
              variant="outlined"
              data-testid="alert-driver-doc"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <v-text-field
              v-model.number="form.alert_days_maintenance_km"
              label="Aviso mantenimiento (km)"
              type="number"
              :min="100"
              :max="200000"
              :error-messages="errors.alert_days_maintenance_km"
              variant="outlined"
              data-testid="alert-maintenance-km"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <v-text-field
              v-model.number="form.alert_days_maintenance_days"
              label="Aviso mantenimiento (días)"
              type="number"
              :min="1"
              :max="365"
              :error-messages="errors.alert_days_maintenance_days"
              variant="outlined"
              data-testid="alert-maintenance-days"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <v-text-field
              v-model.number="form.alert_critical_doc_days"
              label="Días doc. crítico"
              type="number"
              :min="1"
              :max="90"
              :error-messages="errors.alert_critical_doc_days"
              variant="outlined"
              data-testid="alert-critical-doc"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <v-text-field
              v-model.number="form.fuel_anomaly_percent"
              label="% anomalía combustible"
              type="number"
              :min="1"
              :max="100"
              :error-messages="errors.fuel_anomaly_percent"
              variant="outlined"
              data-testid="alert-fuel-anomaly"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <v-text-field
              v-model.number="form.alert_driving_hours"
              label="Horas conducción (alerta)"
              type="number"
              :min="1"
              :max="24"
              :error-messages="errors.alert_driving_hours"
              variant="outlined"
              data-testid="alert-driving-hours"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <v-text-field
              v-model.number="form.alert_tachograph_days"
              label="Días sin descargar tacógrafo"
              type="number"
              :min="1"
              :max="90"
              :error-messages="errors.alert_tachograph_days"
              variant="outlined"
              data-testid="alert-tachograph-days"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4">
            <v-text-field
              v-model.number="form.alert_speed_limit"
              label="Límite velocidad (km/h)"
              type="number"
              :min="1"
              :max="200"
              :error-messages="errors.alert_speed_limit"
              variant="outlined"
              data-testid="alert-speed-limit"
            />
          </VCol>
        </VRow>
        <div class="d-flex justify-end ga-3 mt-2">
          <VBtn
            type="submit"
            color="primary"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            data-testid="alert-thresholds-submit"
          >
            Guardar
          </VBtn>
        </div>
      </VForm>

      <!-- Read-only display -->
      <VRow v-else>
        <VCol cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">Aviso doc. vehículo</div>
          <div class="text-body-1">
            {{ store.companySettings?.alert_days_vehicle_doc ?? '—' }} días
          </div>
        </VCol>
        <VCol cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">Aviso doc. conductor</div>
          <div class="text-body-1">
            {{ store.companySettings?.alert_days_driver_doc ?? '—' }} días
          </div>
        </VCol>
        <VCol cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">Mantenimiento (km)</div>
          <div class="text-body-1">
            {{ store.companySettings?.alert_days_maintenance_km ?? '—' }} km
          </div>
        </VCol>
        <VCol cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">Mantenimiento (días)</div>
          <div class="text-body-1">
            {{ store.companySettings?.alert_days_maintenance_days ?? '—' }} días
          </div>
        </VCol>
        <VCol cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">Doc. crítico</div>
          <div class="text-body-1">
            {{ store.companySettings?.alert_critical_doc_days ?? '—' }} días
          </div>
        </VCol>
        <VCol cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">Anomalía combustible</div>
          <div class="text-body-1">{{ store.companySettings?.fuel_anomaly_percent ?? '—' }}%</div>
        </VCol>
        <VCol cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">Horas conducción</div>
          <div class="text-body-1">{{ store.companySettings?.alert_driving_hours ?? '—' }} h</div>
        </VCol>
        <VCol cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">Días tacógrafo</div>
          <div class="text-body-1">
            {{ store.companySettings?.alert_tachograph_days ?? '—' }} días
          </div>
        </VCol>
        <VCol cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">Límite velocidad</div>
          <div class="text-body-1">{{ store.companySettings?.alert_speed_limit ?? '—' }} km/h</div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useSettings } from '@/composables/use-settings.js'
import { canEditAlertThresholds } from '@/constants/role-permissions.js'
import { alertThresholdsSchema } from '@/validations/settings-schema.js'

const store = useSettings()

const emit = defineEmits(['saved'])

const formRef = ref(null)
const isSubmitting = ref(false)
const errors = reactive({})
const isEditable = computed(() => canEditAlertThresholds(store.currentRole))

const form = reactive({
  alert_days_vehicle_doc: 30,
  alert_days_driver_doc: 30,
  alert_days_maintenance_km: 5000,
  alert_days_maintenance_days: 30,
  alert_critical_doc_days: 7,
  fuel_anomaly_percent: 20,
  alert_driving_hours: 9,
  alert_tachograph_days: 28,
  alert_speed_limit: 90,
})

watch(
  () => store.companySettings,
  s => {
    if (s) {
      for (const key of Object.keys(form)) {
        if (s[key] != null) form[key] = s[key]
      }
    }
  },
  { immediate: true },
)

function clearErrors() {
  Object.keys(errors).forEach(k => delete errors[k])
}

async function handleSubmit() {
  clearErrors()
  const result = alertThresholdsSchema.safeParse(form)
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
