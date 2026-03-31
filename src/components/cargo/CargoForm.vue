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
                v-model="selectedCategoryId"
                :items="categoryOptions"
                label="Categoría *"
                variant="outlined"
                data-testid="cargo-category"
                @update:model-value="onCategoryChange"
              />
            </v-col>
            <v-col cols="6" sm="3">
              <v-select
                v-model="form.subcategoria_id"
                :items="subcategoryOptions"
                label="Subcategoría"
                variant="outlined"
                :disabled="!selectedCategoryId"
                data-testid="cargo-subcategory"
                @update:model-value="onSubcategoryChange"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.description"
                label="Descripción *"
                :error-messages="errors.description"
                variant="outlined"
                required
                data-testid="cargo-description"
              />
            </v-col>
            <v-col cols="6" sm="4">
              <v-text-field
                v-model.number="form.weight_kg"
                label="Peso (kg) *"
                type="number"
                :error-messages="errors.weight_kg"
                variant="outlined"
                required
                data-testid="cargo-weight"
              />
            </v-col>
            <v-col cols="6" sm="4">
              <v-text-field
                v-model.number="form.volume_m3"
                label="Volumen (m³)"
                type="number"
                step="0.1"
                variant="outlined"
                data-testid="cargo-volume"
              />
            </v-col>
          </v-row>

          <v-row v-if="selectedSubcategory">
            <v-col cols="12">
              <v-alert type="info" variant="tonal" density="compact">
                <div class="text-caption font-weight-medium mb-1">Normativa aplicable</div>
                <div class="text-body-2">{{ normativeReference || '—' }}</div>
              </v-alert>
            </v-col>
            <v-col v-if="vehicleRequirements.length" cols="12">
              <div class="text-caption text-medium-emphasis mb-1">Requisitos del vehículo</div>
              <div class="d-flex flex-wrap ga-1">
                <v-chip
                  v-for="req in vehicleRequirements"
                  :key="req"
                  size="small"
                  variant="outlined"
                  color="primary"
                >
                  {{ formatRequirement(req) }}
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel
        v-if="form.cargo_type === 'peligrosa'"
        title="Mercancía peligrosa (ADR)"
        value="adr"
      >
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="4">
              <v-select
                v-model="form.adr_class"
                :items="adrClasses"
                label="Clase ADR"
                :error-messages="errors.adr_class"
                variant="outlined"
                data-testid="cargo-adr-class"
              />
            </v-col>
            <v-col cols="6" sm="4">
              <v-text-field
                v-model="form.adr_un_number"
                label="Número ONU (4 dígitos)"
                :error-messages="errors.adr_un_number"
                variant="outlined"
                maxlength="4"
                data-testid="cargo-un-number"
              />
            </v-col>
            <v-col cols="6" sm="4">
              <v-select
                v-model="form.adr_packing_group"
                :items="packingGroups"
                label="Grupo embalaje"
                variant="outlined"
                data-testid="cargo-packing-group"
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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { apiRoutes } from '@/services/api-routes.js'
import { useNotificationStore } from '@/stores/notifications.js'
import {
  getCategoryOptions,
  getSubcategoryOptions,
  getVehicleRequirements,
  getCategoryById,
  subcategoryToLegacyType,
} from '@/constants/cargo-categories.js'
import { getNormativeReference } from '@/constants/vehicle-equipment.js'

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
  description: '',
  weight_kg: null,
  volume_m3: null,
  cargo_type: 'general',
  subcategoria_id: '',
  adr_class: '',
  adr_un_number: '',
  adr_packing_group: '',
  ...props.initialValues,
})

watch(
  () => props.initialValues,
  nv => {
    Object.assign(form, nv)
    if (nv.subcategoria_id) {
      const sub = getVehicleRequirements(nv.subcategoria_id)
      if (sub.length) {
        // Derive category from subcategory
        const catId = nv.subcategoria_id.split('-')[0]
        selectedCategoryId.value = catId
      }
    }
  },
  { deep: true },
)

const notifications = useNotificationStore()

// ── Hierarchical selectors ──────────────────────────────────────────────

const selectedCategoryId = ref('')
const categoryOptions = getCategoryOptions()

const subcategoryOptions = computed(() =>
  selectedCategoryId.value ? getSubcategoryOptions(selectedCategoryId.value) : [],
)

const selectedSubcategory = computed(() => form.subcategoria_id || null)

const vehicleRequirements = computed(() =>
  selectedSubcategory.value ? getVehicleRequirements(selectedSubcategory.value) : [],
)

const normativeReference = computed(() =>
  selectedSubcategory.value ? getNormativeReference(selectedSubcategory.value) : null,
)

function onCategoryChange(categoryId) {
  form.subcategoria_id = ''
  if (categoryId) {
    const cat = getCategoryById(categoryId)
    if (cat) form.cargo_type = cat.legacyType
  }
}

function onSubcategoryChange(subcategoryId) {
  if (subcategoryId) {
    form.cargo_type = subcategoryToLegacyType(subcategoryId)
  }
}

function formatRequirement(req) {
  return req.replace(/_/g, ' ')
}

// ── ADR options (unchanged) ─────────────────────────────────────────────

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

// ── Init ────────────────────────────────────────────────────────────────

onMounted(async () => {
  // Restore category from existing subcategory
  if (form.subcategoria_id) {
    selectedCategoryId.value = form.subcategoria_id.split('-')[0]
  }

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
