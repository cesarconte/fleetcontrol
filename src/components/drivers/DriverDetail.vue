<template>
  <div>
    <div v-if="isLoading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="!driver" class="text-center pa-8">
      <v-icon size="48" color="grey">mdi-account-off-outline</v-icon>
      <p class="text-body-1 mt-4 text-medium-emphasis">Conductor no encontrado</p>
      <v-btn color="primary" class="mt-4" :to="{ path: '/conductores' }" data-testid="detail-back">
        Volver a la lista
      </v-btn>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-2">
        <div>
          <h1 class="text-h5">{{ driver.full_name }}</h1>
          <p class="text-body-2 text-medium-emphasis">
            {{ driver.nif }}
          </p>
        </div>
        <div class="d-flex ga-2">
          <v-chip :color="getStatusColor(driver.status)" variant="tonal">
            {{ getStatusLabel(driver.status) }}
          </v-chip>
          <v-btn
            icon="mdi-pencil"
            variant="outlined"
            size="small"
            :to="{ name: 'DriverEdit', params: { id: driver.id } }"
            data-testid="detail-edit"
          />
        </div>
      </div>

      <!-- Sections -->
      <v-expansion-panels v-model="openPanels" multiple>
        <!-- Datos personales -->
        <v-expansion-panel title="Datos personales" value="personal">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Nombre</div>
                <div class="text-body-1 font-weight-medium">{{ driver.full_name }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">NIF/NIE</div>
                <div class="text-body-1">{{ driver.nif }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Fecha nacimiento</div>
                <div class="text-body-1">{{ formatDate(driver.birth_date) }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Nacionalidad</div>
                <div class="text-body-1">{{ driver.nationality || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Email</div>
                <div class="text-body-1">{{ driver.email || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Teléfono</div>
                <div class="text-body-1">{{ driver.phone || '—' }}</div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Dirección -->
        <v-expansion-panel title="Dirección" value="address">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Dirección</div>
                <div class="text-body-1">{{ driver.address || '—' }}</div>
              </v-col>
              <v-col cols="6" sm="3" md="2">
                <div class="text-caption text-medium-emphasis">Ciudad</div>
                <div class="text-body-1">{{ driver.city || '—' }}</div>
              </v-col>
              <v-col cols="3" sm="2" md="1">
                <div class="text-caption text-medium-emphasis">C.P.</div>
                <div class="text-body-1">{{ driver.postal_code || '—' }}</div>
              </v-col>
              <v-col cols="3" sm="2" md="1">
                <div class="text-caption text-medium-emphasis">Provincia</div>
                <div class="text-body-1">{{ driver.province || '—' }}</div>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Estado laboral -->
        <v-expansion-panel title="Estado laboral" value="employment">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Fecha incorporación</div>
                <div class="text-body-1">{{ formatDate(driver.hire_date) }}</div>
              </v-col>
              <v-col cols="6" sm="4" md="3">
                <div class="text-caption text-medium-emphasis">Estado</div>
                <v-chip :color="getStatusColor(driver.status)" size="small" variant="tonal">
                  {{ getStatusLabel(driver.status) }}
                </v-chip>
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
              <div class="text-body-2 font-weight-medium">Eliminar conductor</div>
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
        <v-card-title>¿Eliminar conductor?</v-card-title>
        <v-card-text>
          Se eliminará el conductor {{ driver?.full_name }} permanentemente. Esta acción no se puede
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
import { useDrivers } from '@/composables/use-drivers.js'

const props = defineProps({
  driverId: { type: String, required: true },
})

const router = useRouter()
const { getById, remove, isLoading, currentDriver: driver } = useDrivers()

const openPanels = ref(['personal', 'employment'])
const confirmDelete = ref(false)
const isDeleting = ref(false)

onMounted(() => {
  getById(props.driverId)
})

function getStatusColor(status) {
  const map = {
    active: 'success',
    temporary_leave: 'warning',
    inactive: 'grey',
  }
  return map[status] ?? 'grey'
}

function getStatusLabel(status) {
  const map = {
    active: 'Activo',
    temporary_leave: 'Baja temporal',
    inactive: 'Inactivo',
  }
  return map[status] ?? status
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES')
}

async function handleDelete() {
  isDeleting.value = true
  try {
    await remove(props.driverId)
    router.push('/conductores')
  } finally {
    isDeleting.value = false
    confirmDelete.value = false
  }
}
</script>
