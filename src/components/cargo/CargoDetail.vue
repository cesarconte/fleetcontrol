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
            {{ formatKg(record.weight_kg) }} · {{ getTypeLabel(record.type) }}
          </p>
        </div>
        <div class="d-flex ga-2">
          <v-chip :color="getTypeColor(record.type)" variant="tonal">
            {{ getTypeLabel(record.type) }}
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
                <div class="text-body-1">{{ getTypeLabel(record.type) }}</div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel v-if="record.type === 'dangerous'" title="ADR" value="adr">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="4">
                <div class="text-caption text-medium-emphasis">Clase</div>
                <div class="text-body-1">{{ record.adr_class || '—' }}</div>
              </v-col>
              <v-col cols="4">
                <div class="text-caption text-medium-emphasis">Número ONU</div>
                <div class="text-body-1">{{ record.un_number || '—' }}</div>
              </v-col>
              <v-col cols="4">
                <div class="text-caption text-medium-emphasis">Grupo embalaje</div>
                <div class="text-body-1">{{ record.packing_group || '—' }}</div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel title="CMR" value="cmr">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">Remitente</div>
                <div class="text-body-1">{{ record.sender_name || '—' }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">Destinatario</div>
                <div class="text-body-1">{{ record.receiver_name || '—' }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">Lugar carga</div>
                <div class="text-body-1">{{ record.loading_place || '—' }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">Lugar descarga</div>
                <div class="text-body-1">{{ record.unloading_place || '—' }}</div>
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

    <v-dialog v-model="confirmDelete" max-width="400">
      <v-card>
        <v-card-title>¿Eliminar carga?</v-card-title>
        <v-card-text>Se eliminará el registro permanentemente.</v-card-text>
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
import { useCargo } from '@/composables/use-cargo.js'

const props = defineProps({ recordId: { type: String, required: true } })
const router = useRouter()
const { getById, remove, isLoading, currentRecord: record } = useCargo()
const openPanels = ref(['details'])
const confirmDelete = ref(false)
const isDeleting = ref(false)

onMounted(() => {
  getById(props.recordId)
})

function getTypeColor(type) {
  const map = { general: 'info', refrigerated: 'cyan', dangerous: 'error', special: 'warning' }
  return map[type] ?? 'grey'
}

function getTypeLabel(type) {
  const map = {
    general: 'General',
    refrigerated: 'Frigorífica',
    dangerous: 'Peligrosa',
    special: 'Especial',
  }
  return map[type] ?? type
}

function formatKg(kg) {
  return kg ? `${kg.toLocaleString('es-ES')} kg` : '—'
}

async function handleDelete() {
  isDeleting.value = true
  try {
    await remove(props.recordId)
    router.push('/cargas')
  } finally {
    isDeleting.value = false
    confirmDelete.value = false
  }
}
</script>
