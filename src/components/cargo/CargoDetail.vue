<template>
  <div>
    <div v-if="isLoading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <div v-else-if="!record" class="text-center pa-8">
      <v-icon size="48" color="grey">mdi-package-variant-closed</v-icon>
      <p class="text-body-1 mt-4 text-medium-emphasis">Carga no encontrada</p>
      <v-btn color="primary" class="mt-4" :to="{ path: '/cargas' }" data-testid="detail-back">
        Volver a la lista
      </v-btn>
    </div>
    <div v-else>
      <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-2">
        <div>
          <h1 class="text-h5">{{ record.description }}</h1>
          <p class="text-body-2 text-medium-emphasis">
            {{ formatKg(record.weight_kg) }} · {{ getCargoTypeLabel(record.cargo_type) }}
            <template v-if="subcategoryName">· {{ subcategoryName }}</template>
          </p>
        </div>
        <div class="d-flex ga-2">
          <v-chip :color="getCargoTypeColor(record.cargo_type)" variant="tonal">
            {{ getCargoTypeLabel(record.cargo_type) }}
          </v-chip>
          <v-btn
            icon="mdi-pencil"
            variant="outlined"
            size="small"
            :to="{ name: 'CargoEdit', params: { id: record.id } }"
            data-testid="detail-edit"
          />
        </div>
      </div>

      <v-expansion-panels v-model="openPanels" multiple>
        <v-expansion-panel title="Detalles" value="details">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Descripción</div>
                <div class="text-body-1">{{ record.description }}</div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Peso</div>
                <div class="text-body-1">{{ formatKg(record.weight_kg) }}</div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Volumen</div>
                <div class="text-body-1">
                  {{ record.volume_m3 ? `${record.volume_m3} m³` : '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Tipo</div>
                <div class="text-body-1">{{ getCargoTypeLabel(record.cargo_type) }}</div>
              </v-col>
              <v-col v-if="subcategoryName" cols="6" sm="4">
                <div class="text-caption text-medium-emphasis">Subcategoría</div>
                <div class="text-body-1">{{ subcategoryName }}</div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel v-if="record.cargo_type === 'dangerous'" title="ADR" value="adr">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="4">
                <div class="text-caption text-medium-emphasis">Clase</div>
                <div class="text-body-1">{{ record.adr_class || '—' }}</div>
              </v-col>
              <v-col cols="4">
                <div class="text-caption text-medium-emphasis">Número ONU</div>
                <div class="text-body-1">{{ record.adr_un_number || '—' }}</div>
              </v-col>
              <v-col cols="4">
                <div class="text-caption text-medium-emphasis">Grupo embalaje</div>
                <div class="text-body-1">{{ record.adr_packing_group || '—' }}</div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel
          v-if="normativeRef || equipmentGroups.length"
          title="Requisitos y Normativa"
          value="requirements"
        >
          <v-expansion-panel-text>
            <v-row>
              <v-col v-if="normativeRef" cols="12">
                <v-alert type="info" variant="tonal" density="compact" class="mb-3">
                  <div class="text-caption font-weight-medium">Normativa aplicable</div>
                  <div class="text-body-2">{{ normativeRef }}</div>
                </v-alert>
              </v-col>
              <v-col v-if="record.subcategoria_id" cols="12">
                <div class="text-caption text-medium-emphasis mb-1">Requisitos del vehículo</div>
                <div class="d-flex flex-wrap ga-1">
                  <v-chip
                    v-for="req in vehicleReqs"
                    :key="req"
                    size="small"
                    variant="outlined"
                    color="primary"
                  >
                    {{ req.replace(/_/g, ' ') }}
                  </v-chip>
                </div>
              </v-col>
              <v-col v-for="group in equipmentGroups" :key="group.groupName" cols="12">
                <div class="text-caption font-weight-medium mb-1">{{ group.groupName }}</div>
                <v-list density="compact" class="bg-transparent">
                  <v-list-item v-for="el in group.elementos" :key="el" class="px-0" min-height="32">
                    <template #prepend>
                      <v-icon size="small" color="warning">mdi-checkbox-blank-outline</v-icon>
                    </template>
                    <v-list-item-title class="text-body-2">
                      {{ el.replace(/_/g, ' ') }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-card class="mt-6" color="error" variant="outlined">
        <v-card-text>
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-body-2 font-weight-medium">Eliminar carga</div>
              <div class="text-caption">Esta acción no se puede deshacer</div>
            </div>
            <v-btn
              color="error"
              variant="outlined"
              size="small"
              data-testid="detail-delete"
              @click="confirmDelete = true"
            >
              Eliminar
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <v-dialog v-model="confirmDelete" max-width="400" persistent>
      <v-card>
        <v-card-title>¿Eliminar carga?</v-card-title>
        <v-card-text>Se eliminará el registro permanentemente.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" data-testid="delete-cancel" @click="confirmDelete = false">
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            :loading="isDeleting"
            data-testid="delete-confirm"
            @click="handleDelete"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCargo } from '@/composables/use-cargo.js'
import { getCargoTypeColor, getCargoTypeLabel, formatKg } from '@/utils/cargo-helpers.js'
import { getSubcategoryById, getVehicleRequirements } from '@/constants/cargo-categories.js'
import { getEquipmentChecklist, getNormativeReference } from '@/constants/vehicle-equipment.js'

const props = defineProps({ recordId: { type: String, required: true } })
const router = useRouter()
const { getById, remove, isLoading, currentRecord: record } = useCargo()
const openPanels = ref(['details'])
const confirmDelete = ref(false)
const isDeleting = ref(false)

const subcategoryName = computed(() => {
  if (!record.value?.subcategoria_id) return null
  const sub = getSubcategoryById(record.value.subcategoria_id)
  return sub ? sub.nombre : null
})

const normativeRef = computed(() => {
  if (!record.value?.subcategoria_id) return null
  return getNormativeReference(record.value.subcategoria_id)
})

const vehicleReqs = computed(() => {
  if (!record.value?.subcategoria_id) return []
  return getVehicleRequirements(record.value.subcategoria_id)
})

const equipmentGroups = computed(() => {
  if (!record.value?.subcategoria_id) return []
  return getEquipmentChecklist(record.value.subcategoria_id)
})

onMounted(() => {
  getById(props.recordId)
})

async function handleDelete() {
  isDeleting.value = true
  try {
    await remove(props.recordId)
    router.push('/cargas')
  } catch {
    // Error handled by composable notification
  } finally {
    isDeleting.value = false
    confirmDelete.value = false
  }
}
</script>
