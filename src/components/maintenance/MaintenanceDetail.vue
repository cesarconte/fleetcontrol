<template>
  <div>
    <div v-if="isLoading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="!record" class="text-center pa-8">
      <v-icon size="48" color="grey">mdi-wrench</v-icon>
      <p class="text-body-1 mt-4 text-medium-emphasis">Registro no encontrado</p>
      <v-btn
        color="primary"
        class="mt-4"
        :to="{ path: '/mantenimiento' }"
        data-testid="detail-back"
      >
        Volver a la lista
      </v-btn>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-2">
        <div>
          <h1 class="text-h5">{{ record.description }}</h1>
          <p class="text-body-2 text-medium-emphasis">
            {{ getTipoLabel(record.maintenance_type) }} · {{ formatDate(record.scheduled_date) }}
          </p>
        </div>
        <div class="d-flex ga-2">
          <v-chip :color="getStatusColor(record.status)" variant="tonal">
            {{ getStatusLabel(record.status) }}
          </v-chip>
          <v-btn
            icon="mdi-pencil"
            variant="outlined"
            size="small"
            :to="{ name: 'MaintenanceEdit', params: { id: record.id } }"
            data-testid="detail-edit"
          />
        </div>
      </div>

      <!-- Details -->
      <v-expansion-panels v-model="openPanels" multiple>
        <v-expansion-panel title="Detalles" value="details">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Tipo</div>
                <v-chip
                  :color="record.maintenance_type === 'preventive' ? 'info' : 'warning'"
                  size="small"
                  variant="outlined"
                >
                  {{ getTipoLabel(record.maintenance_type) }}
                </v-chip>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Estado</div>
                <v-chip :color="getStatusColor(record.status)" size="small" variant="tonal">
                  {{ getStatusLabel(record.status) }}
                </v-chip>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Fecha prevista</div>
                <div class="text-body-1">{{ formatDate(record.scheduled_date) }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Fecha realización</div>
                <div class="text-body-1">{{ formatDate(record.actual_date) }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Km</div>
                <div class="text-body-1">
                  {{ record.scheduled_km?.toLocaleString('es-ES') || '—' }}
                </div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel title="Diagnóstico e Intervención" value="intervention">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="12">
                <div class="text-caption text-medium-emphasis">Diagnóstico</div>
                <div class="text-body-1">{{ record.diagnosis || '—' }}</div>
              </v-col>
              <v-col cols="12">
                <div class="text-caption text-medium-emphasis">Intervención</div>
                <div class="text-body-1">{{ record.intervention || '—' }}</div>
              </v-col>
              <v-col cols="12">
                <div class="text-caption text-medium-emphasis">Recambios</div>
                <div class="text-body-1">{{ record.parts_used || '—' }}</div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel title="Costes" value="costs">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Taller</div>
                <div class="text-body-1">{{ record.workshop_name || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Responsable</div>
                <div class="text-body-1">{{ record.responsible_name || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Coste total</div>
                <div class="text-body-1 font-weight-medium">
                  {{ record.cost_eur ? `${record.cost_eur.toFixed(2)} €` : '—' }}
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption text-medium-emphasis">Inmovilización</div>
                <div class="text-body-1">
                  {{ record.downtime_hours ? `${record.downtime_hours} h` : '—' }}
                </div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- Danger zone -->
      <v-card class="mt-6" color="error" variant="outlined">
        <v-card-text>
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-body-2 font-weight-medium">Eliminar registro</div>
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
        <v-card-title>¿Eliminar registro?</v-card-title>
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
import { useMaintenance } from '@/composables/use-maintenance.js'

const props = defineProps({
  recordId: { type: String, required: true },
})

const router = useRouter()
const { getById, remove, isLoading, currentRecord: record } = useMaintenance()

const openPanels = ref(['details', 'costs'])
const confirmDelete = ref(false)
const isDeleting = ref(false)

onMounted(() => {
  getById(props.recordId)
})

function getTipoLabel(tipo) {
  return tipo === 'preventive' ? 'Preventivo' : 'Correctivo'
}

function getStatusColor(status) {
  const map = { pending: 'info', in_progress: 'warning', completed: 'success', cancelled: 'grey' }
  return map[status] ?? 'grey'
}

function getStatusLabel(status) {
  const map = {
    pending: 'Pendiente',
    in_progress: 'En curso',
    completed: 'Completada',
    cancelled: 'Cancelada',
  }
  return map[status] ?? status
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES')
}

async function handleDelete() {
  isDeleting.value = true
  try {
    await remove(props.recordId)
    router.push('/mantenimiento')
  } catch {
    // Error handled by composable notification
  } finally {
    isDeleting.value = false
    confirmDelete.value = false
  }
}
</script>
