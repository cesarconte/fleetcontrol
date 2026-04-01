<template>
  <v-card>
    <v-card-title>Umbrales de alerta</v-card-title>
    <v-card-text>
      <v-form
        v-if="isEditable"
        ref="formRef"
        data-testid="alert-thresholds-form"
        @submit.prevent="handleSubmit"
      >
        <v-row>
          <v-col cols="12" sm="6" md="4">
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
          </v-col>
          <v-col cols="12" sm="6" md="4">
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
          </v-col>
          <v-col cols="12" sm="6" md="4">
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
          </v-col>
          <v-col cols="12" sm="6" md="4">
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
          </v-col>
          <v-col cols="12" sm="6" md="4">
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
          </v-col>
          <v-col cols="12" sm="6" md="4">
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
          </v-col>
        </v-row>
        <div class="d-flex justify-end ga-3 mt-2">
          <v-btn
            type="submit"
            color="primary"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            data-testid="alert-thresholds-submit"
          >
            Guardar
          </v-btn>
        </div>
      </v-form>

      <!-- Read-only display -->
      <v-row v-else>
        <v-col cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">Aviso doc. vehículo</div>
          <div class="text-body-1">{{ settings?.alert_days_vehicle_doc ?? '—' }} días</div>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">Aviso doc. conductor</div>
          <div class="text-body-1">{{ settings?.alert_days_driver_doc ?? '—' }} días</div>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">Mantenimiento (km)</div>
          <div class="text-body-1">{{ settings?.alert_days_maintenance_km ?? '—' }} km</div>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">Mantenimiento (días)</div>
          <div class="text-body-1">{{ settings?.alert_days_maintenance_days ?? '—' }} días</div>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">Doc. crítico</div>
          <div class="text-body-1">{{ settings?.alert_critical_doc_days ?? '—' }} días</div>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <div class="text-caption text-uppercase text-medium-emphasis">Anomalía combustible</div>
          <div class="text-body-1">{{ settings?.fuel_anomaly_percent ?? '—' }}%</div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useSettings } from '@/composables/use-settings.js'
import { canEditAlertThresholds } from '@/constants/role-permissions.js'
import { alertThresholdsSchema } from '@/validations/settings-schema.js'

const { currentRole, updateCompanySettings } = useSettings()

const props = defineProps({
  settings: { type: Object, default: null },
})

const emit = defineEmits(['saved'])

const formRef = ref(null)
const isSubmitting = ref(false)
const errors = reactive({})
const isEditable = canEditAlertThresholds(currentRole)

const form = reactive({
  alert_days_vehicle_doc: 30,
  alert_days_driver_doc: 30,
  alert_days_maintenance_km: 10000,
  alert_days_maintenance_days: 90,
  alert_critical_doc_days: 15,
  fuel_anomaly_percent: 20,
})

watch(
  () => props.settings,
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
    await updateCompanySettings(result.data)
    emit('saved')
  } finally {
    isSubmitting.value = false
  }
}
</script>
