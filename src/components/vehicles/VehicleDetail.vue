<template>
  <div>
    <div v-if="isLoading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="!vehicle" class="text-center pa-8">
      <v-icon size="48" color="grey">mdi-truck-off-outline</v-icon>
      <p class="text-body-1 mt-4 text-medium-emphasis">Vehículo no encontrado</p>
      <v-btn color="primary" class="mt-4" :to="{ path: '/vehiculos' }" data-testid="detail-back">
        Volver a la lista
      </v-btn>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-2">
        <div>
          <h1 class="text-h5">{{ vehicle.plate }}</h1>
          <p class="text-body-2 text-medium-emphasis">
            {{ vehicle.brand }} {{ vehicle.model }} {{ vehicle.variant }}
          </p>
        </div>
        <div class="d-flex ga-2">
          <v-chip :color="getStatusColor(vehicle.status, 'vehiculo')" variant="tonal">
            {{ getStatusLabel(vehicle.status, 'vehiculo') }}
          </v-chip>
          <v-btn
            icon="mdi-pencil"
            variant="outlined"
            size="small"
            :to="{ name: 'VehicleEdit', params: { id: vehicle.id } }"
            data-testid="detail-edit"
          />
        </div>
      </div>

      <!-- Sections -->
      <v-expansion-panels v-model="openPanels" multiple>
        <!-- Datos principales -->
        <v-expansion-panel title="Datos principales" value="main">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Matrícula</div>
                <div class="text-body-1 font-weight-medium">{{ vehicle.plate }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">VIN</div>
                <div class="text-body-1">{{ vehicle.vin || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Marca</div>
                <div class="text-body-1">{{ vehicle.brand }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Modelo</div>
                <div class="text-body-1">{{ vehicle.model }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Categoría UE</div>
                <div class="text-body-1">{{ getEUCategoriaLabel(vehicle.eu_category) }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Carrocería</div>
                <div class="text-body-1">{{ getBodyLabel(vehicle.body_type) }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Combustible</div>
                <div class="text-body-1">{{ getFuelLabel(vehicle.fuel_type) }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">DGT</div>
                <v-chip :color="getDgtColor(vehicle.dgt_badge)" size="small" variant="flat">
                  {{ getDgtLabel(vehicle.dgt_badge) }}
                </v-chip>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Euro</div>
                <div class="text-body-1">
                  {{ vehicle.euro_class?.replace('_', ' ') || '—' }}
                </div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Masas y Dimensiones -->
        <v-expansion-panel title="Masas y Dimensiones" value="mass">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">MMA</div>
                <div class="text-body-1">{{ formatKg(vehicle.gross_weight_kg) }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Tara</div>
                <div class="text-body-1">{{ formatKg(vehicle.tare_kg) }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Carga útil</div>
                <div class="text-body-1">{{ formatKg(vehicle.max_payload_kg) }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">MMA conjunto</div>
                <div class="text-body-1">{{ formatKg(vehicle.combined_gross_weight_kg) }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Dimensiones (A×H×L)</div>
                <div class="text-body-1">
                  {{ formatM(vehicle.width_m) }} × {{ formatM(vehicle.height_m) }} ×
                  {{ formatM(vehicle.length_m) }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Nº ejes</div>
                <div class="text-body-1">{{ vehicle.axle_count ?? '—' }}</div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Documentación -->
        <v-expansion-panel title="Documentación" value="docs">
          <v-expansion-panel-text>
            <VehicleDocuments :vehicle-id="vehicle.id" />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- Danger zone -->
      <v-card class="mt-6" color="error" variant="outlined">
        <v-card-text>
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-body-2 font-weight-medium">Eliminar vehículo</div>
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

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="confirmDelete" max-width="400">
      <v-card>
        <v-card-title>¿Eliminar vehículo?</v-card-title>
        <v-card-text>
          Se eliminará el vehículo {{ vehicle?.plate }} permanentemente. Esta acción no se puede
          deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDelete = false">Cancelar</v-btn>
          <v-btn color="error" :loading="isDeleting" @click="handleDelete">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVehicles } from '@/composables/use-vehicles.js'
import { getStatusColor, getStatusLabel, getDgtColor, getDgtLabel } from '@/utils/status-helpers.js'
import { formatKg } from '@/utils/format-helpers.js'
import { getEUCategoriaLabel, getBodyLabel } from '@/constants/vehicle-types.js'
import VehicleDocuments from './VehicleDocuments.vue'

const props = defineProps({
  vehicleId: { type: String, required: true },
})

const router = useRouter()
const { getById, remove, isLoading, currentVehicle: vehicle } = useVehicles()

const openPanels = ref(['main', 'docs'])
const confirmDelete = ref(false)
const isDeleting = ref(false)

onMounted(() => {
  getById(props.vehicleId)
})

function getFuelLabel(fuel) {
  const map = {
    diesel: 'Diésel',
    gnc: 'GNC',
    gnl: 'GNL',
    hidrogeno: 'Hidrógeno',
    electrico: 'Eléctrico',
    hibrido: 'Híbrido',
  }
  return map[fuel] ?? fuel
}

function formatM(val) {
  if (!val) return '—'
  return `${val} m`
}

async function handleDelete() {
  isDeleting.value = true
  try {
    await remove(props.vehicleId)
    router.push('/vehiculos')
  } finally {
    isDeleting.value = false
    confirmDelete.value = false
  }
}
</script>
