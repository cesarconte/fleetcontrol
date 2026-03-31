<template>
  <div>
    <div v-if="isLoading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="!record" class="text-center pa-8">
      <v-icon size="48" color="grey">mdi-gas-station</v-icon>
      <p class="text-body-1 mt-4 text-medium-emphasis">Repostaje no encontrado</p>
      <v-btn color="primary" class="mt-4" :to="{ path: '/combustible' }" data-testid="detail-back">
        Volver a la lista
      </v-btn>
    </div>

    <div v-else>
      <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-2">
        <div>
          <h1 class="text-h5">Repostaje — {{ formatDate(record.refuel_date) }}</h1>
          <p class="text-body-2 text-medium-emphasis">
            {{ record.quantity }} L a {{ record.unit_price?.toFixed(3) }} €/L
          </p>
        </div>
        <div class="d-flex ga-2">
          <v-chip color="primary" variant="tonal">{{ record.total_eur?.toFixed(2) }} €</v-chip>
          <v-btn
            icon="mdi-pencil"
            variant="outlined"
            size="small"
            :to="{ name: 'FuelEdit', params: { id: record.id } }"
            data-testid="detail-edit"
          />
        </div>
      </div>

      <v-expansion-panels v-model="openPanels" multiple>
        <v-expansion-panel title="Detalles del repostaje" value="details">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Fecha</div>
                <div class="text-body-1">{{ formatDate(record.refuel_date) }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Km</div>
                <div class="text-body-1">{{ record.odometer_km?.toLocaleString('es-ES') }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Litros</div>
                <div class="text-body-1">{{ record.quantity?.toFixed(1) }} L</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Precio/L</div>
                <div class="text-body-1">{{ record.unit_price?.toFixed(3) }} €</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Total</div>
                <div class="text-body-1 font-weight-medium">
                  {{ record.total_eur?.toFixed(2) }} €
                </div>
              </v-col>
              <v-col cols="12" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Estación</div>
                <div class="text-body-1">{{ record.station_name || '—' }}</div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-card class="mt-6" color="error" variant="outlined">
        <v-card-text>
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-body-2 font-weight-medium">Eliminar repostaje</div>
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
        <v-card-title>¿Eliminar repostaje?</v-card-title>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFuel } from '@/composables/use-fuel.js'

const props = defineProps({ recordId: { type: String, required: true } })

const router = useRouter()
const { getById, remove, isLoading, currentRecord: record } = useFuel()

const openPanels = ref(['details'])
const confirmDelete = ref(false)
const isDeleting = ref(false)

onMounted(() => {
  getById(props.recordId)
})

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES')
}

async function handleDelete() {
  isDeleting.value = true
  try {
    await remove(props.recordId)
    router.push('/combustible')
  } finally {
    isDeleting.value = false
    confirmDelete.value = false
  }
}
</script>
