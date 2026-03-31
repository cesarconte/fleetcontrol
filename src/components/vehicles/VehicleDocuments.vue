<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-3">
      <div class="text-subtitle-2">Documentación del vehículo</div>
      <v-btn
        color="primary"
        variant="outlined"
        size="small"
        prepend-icon="mdi-plus"
        data-testid="doc-add-btn"
        @click="openCreateDialog"
      >
        Añadir
      </v-btn>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="d-flex justify-center pa-4">
      <v-progress-circular indeterminate color="primary" size="32" />
    </div>

    <!-- Empty state -->
    <div v-else-if="documents.length === 0" class="text-center pa-4 text-medium-emphasis">
      <v-icon size="32" color="grey">mdi-file-document-outline</v-icon>
      <p class="text-body-2 mt-2">Sin documentos registrados</p>
    </div>

    <!-- Table (desktop) -->
    <v-table v-else density="compact">
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Estado</th>
          <th>Vencimiento</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="doc in documents" :key="doc.id">
          <td>{{ getVehicleDocumentTypeLabel(doc.doc_type) }}</td>
          <td>
            <v-chip :color="getStatusColor(doc.status)" size="x-small" variant="tonal">
              {{ getStatusLabel(doc.status) }}
            </v-chip>
          </td>
          <td>{{ formatDate(doc.expiry_date) }}</td>
          <td class="text-right">
            <v-btn
              v-if="doc.file_url"
              icon="mdi-download"
              size="x-small"
              variant="text"
              :href="doc.file_url"
              target="_blank"
              data-testid="doc-download"
            />
            <v-btn
              icon="mdi-pencil"
              size="x-small"
              variant="text"
              data-testid="doc-edit-btn"
              @click="openEditDialog(doc)"
            />
            <v-btn
              icon="mdi-delete-outline"
              size="x-small"
              variant="text"
              color="error"
              data-testid="doc-delete-btn"
              @click="confirmDelete(doc)"
            />
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Form dialog -->
    <VehicleDocumentFormDialog
      v-model="showFormDialog"
      :vehicle-id="vehicleId"
      :document="selectedDoc"
      @saved="handleSaved"
    />

    <!-- Delete confirmation -->
    <v-dialog v-model="showDeleteDialog" max-width="400" persistent>
      <v-card>
        <v-card-title>¿Eliminar documento?</v-card-title>
        <v-card-text>
          Se eliminará "{{ docToDelete ? getVehicleDocumentTypeLabel(docToDelete.doc_type) : '' }}"
          permanentemente.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" data-testid="delete-doc-cancel" @click="showDeleteDialog = false">
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            :loading="isDeleting"
            data-testid="delete-doc-confirm"
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
import { ref, watch } from 'vue'
import { useVehicleDocuments } from '@/composables/use-vehicle-documents.js'
import { useNotificationStore } from '@/stores/notifications.js'
import { getVehicleDocumentTypeLabel } from '@/constants/vehicle-document-types.js'
import VehicleDocumentFormDialog from './VehicleDocumentFormDialog.vue'

const props = defineProps({
  vehicleId: { type: String, required: true },
})

const notificationStore = useNotificationStore()

const {
  documents,
  isLoading,
  fetchDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  uploadFile,
} = useVehicleDocuments()

const showFormDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedDoc = ref(null)
const docToDelete = ref(null)
const isDeleting = ref(false)

watch(
  () => props.vehicleId,
  id => fetchDocuments(id),
  { immediate: true },
)

function openCreateDialog() {
  selectedDoc.value = null
  showFormDialog.value = true
}

function openEditDialog(doc) {
  selectedDoc.value = doc
  showFormDialog.value = true
}

function confirmDelete(doc) {
  docToDelete.value = doc
  showDeleteDialog.value = true
}

async function handleSaved({ data, file, isEditing, docId }) {
  try {
    if (file) {
      const fileUrl = await uploadFile(file, props.vehicleId, data.doc_type)
      data.file_url = fileUrl
      data.file_name = file.name
      data.file_type = file.type
    }

    if (isEditing && docId) {
      await updateDocument(docId, data)
      notificationStore.success('Documento actualizado')
    } else {
      await createDocument(data)
      notificationStore.success('Documento añadido')
    }
  } catch (err) {
    notificationStore.error(err.message || 'Error al guardar el documento')
  }
}

async function handleDelete() {
  if (!docToDelete.value) return
  isDeleting.value = true
  try {
    await deleteDocument(docToDelete.value.id)
    notificationStore.success('Documento eliminado')
  } catch (err) {
    notificationStore.error(err.message || 'Error al eliminar el documento')
  } finally {
    isDeleting.value = false
    showDeleteDialog.value = false
    docToDelete.value = null
  }
}

function getStatusColor(status) {
  const map = {
    valid: 'success',
    expiring_soon: 'warning',
    critical: 'error',
    expired: 'grey-darken-2',
    not_applicable: 'grey',
  }
  return map[status] ?? 'grey'
}

function getStatusLabel(status) {
  const map = {
    valid: 'En regla',
    expiring_soon: 'Próximo',
    critical: 'Crítico',
    expired: 'Vencido',
    not_applicable: 'N/A',
  }
  return map[status] ?? status
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-ES')
}
</script>
