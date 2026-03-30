<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-expansion-panels v-model="openPanels" multiple>
      <v-expansion-panel title="Información básica" value="basic">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.route_id"
                :items="routeOptions"
                label="Ruta *"
                :error-messages="errors.route_id"
                variant="outlined"
                :loading="loadingRefs"
                data-testid="cargo-route"
              />
            </v-col>
            <v-col cols="6" sm="3">
              <v-select
                v-model="form.tipo"
                :items="cargoTypes"
                label="Tipo *"
                variant="outlined"
                data-testid="cargo-type"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.descripcion"
                label="Descripción *"
                :error-messages="errors.descripcion"
                variant="outlined"
                required
                data-testid="cargo-description"
              />
            </v-col>
            <v-col cols="6" sm="4">
              <v-text-field
                v-model.number="form.peso_kg"
                label="Peso (kg) *"
                type="number"
                :error-messages="errors.peso_kg"
                variant="outlined"
                required
                data-testid="cargo-weight"
              />
            </v-col>
            <v-col cols="6" sm="4">
              <v-text-field
                v-model.number="form.volumen_m3"
                label="Volumen (m³)"
                type="number"
                step="0.1"
                variant="outlined"
                data-testid="cargo-volume"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel
        v-if="form.tipo === 'peligrosa'"
        title="Mercancía peligrosa (ADR)"
        value="adr"
      >
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="4">
              <v-select
                v-model="form.adr_clase"
                :items="adrClasses"
                label="Clase ADR"
                :error-messages="errors.adr_clase"
                variant="outlined"
                data-testid="cargo-adr-class"
              />
            </v-col>
            <v-col cols="6" sm="4">
              <v-text-field
                v-model="form.adr_numero_onu"
                label="Número ONU (4 dígitos)"
                :error-messages="errors.adr_numero_onu"
                variant="outlined"
                maxlength="4"
                data-testid="cargo-un-number"
              />
            </v-col>
            <v-col cols="6" sm="4">
              <v-select
                v-model="form.adr_grupo_embalaje"
                :items="packingGroups"
                label="Grupo embalaje"
                variant="outlined"
                data-testid="cargo-packing-group"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel title="CMR / Logística" value="cmr">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.cmr_remitente"
                label="Remitente"
                variant="outlined"
                data-testid="cargo-sender"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.cmr_destinatario"
                label="Destinatario"
                variant="outlined"
                data-testid="cargo-receiver"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.cmr_lugar_entrega"
                label="Lugar de carga"
                variant="outlined"
                data-testid="cargo-loading"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div class="d-flex justify-end ga-3 mt-4">
      <v-btn variant="text" :to="cancelTo" data-testid="cargo-form-cancel">Cancelar</v-btn>
      <v-btn
        type="submit"
        color="primary"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        data-testid="cargo-form-submit"
      >
        {{ submitLabel }}
      </v-btn>
    </div>
  </v-form>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { apiRoutes } from '@/services/api-routes.js'
import { useNotificationStore } from '@/stores/notifications.js'
import { CARGO_TYPE_OPTIONS } from '@/utils/cargo-helpers.js'

const props = defineProps({
  initialValues: { type: Object, default: () => ({}) },
  isSubmitting: { type: Boolean, default: false },
  submitLabel: { type: String, default: 'Guardar' },
  cancelTo: { type: [String, Object], default: '/cargas' },
  errors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit'])
const formRef = ref(null)
const openPanels = ref(['basic'])
const loadingRefs = ref(true)
const routeOptions = ref([])

const form = reactive({
  route_id: '',
  descripcion: '',
  peso_kg: null,
  volumen_m3: null,
  tipo: 'general',
  adr_clase: '',
  adr_numero_onu: '',
  adr_grupo_embalaje: '',
  cmr_remitente: '',
  cmr_destinatario: '',
  cmr_lugar_entrega: '',
  ...props.initialValues,
})

watch(
  () => props.initialValues,
  nv => {
    Object.assign(form, nv)
  },
  { deep: true },
)

const notifications = useNotificationStore()
const cargoTypes = CARGO_TYPE_OPTIONS

const adrClasses = [
  { title: '1 — Explosivos', value: '1' },
  { title: '2 — Gases', value: '2' },
  { title: '3 — Líquidos inflamables', value: '3' },
  { title: '4.1 — Sólidos inflamables', value: '4.1' },
  { title: '4.2 — Espontáneamente combustibles', value: '4.2' },
  { title: '4.3 — Peligrosos en contacto con agua', value: '4.3' },
  { title: '5.1 — Comburentes', value: '5.1' },
  { title: '5.2 — Peróxidos orgánicos', value: '5.2' },
  { title: '6.1 — Tóxicos', value: '6.1' },
  { title: '6.2 — Infecciosos', value: '6.2' },
  { title: '7 — Radiactivos', value: '7' },
  { title: '8 — Corrosivos', value: '8' },
  { title: '9 — Peligrosos diversos', value: '9' },
]

const packingGroups = [
  { title: 'I — Peligro alto', value: 'I' },
  { title: 'II — Peligro medio', value: 'II' },
  { title: 'III — Peligro bajo', value: 'III' },
]

onMounted(async () => {
  try {
    const routes = await apiRoutes.getAll()
    routeOptions.value = routes.map(r => ({
      title: `${r.origin} → ${r.destination} (${r.departure_date})`,
      value: r.id,
    }))
  } catch {
    notifications.error('Error al cargar rutas')
  } finally {
    loadingRefs.value = false
  }
})

async function handleSubmit() {
  emit('submit', { ...form })
}
defineExpose({ form, handleSubmit })
</script>
