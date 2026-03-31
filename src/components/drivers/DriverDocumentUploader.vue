<template>
  <div>
    <!-- Upload button -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="text-subtitle-2">Documentos adjuntos</div>
      <v-btn
        color="primary"
        variant="outlined"
        size="small"
        prepend-icon="mdi-upload"
        data-testid="driver-doc-upload-btn"
        @click="showUploadDialog = true"
      >
        Adjuntar documento
      </v-btn>
    </div>

    <!-- Document list -->
    <div v-if="isLoading" class="d-flex justify-center pa-4">
      <v-progress-circular indeterminate color="primary" size="32" />
    </div>

    <div v-else-if="documentos.length === 0" class="text-center pa-4 text-medium-emphasis">
      <v-icon size="32" color="grey">mdi-file-document-outline</v-icon>
      <p class="text-body-2 mt-2">No hay documentos adjuntos</p>
    </div>

    <v-list v-else density="compact" lines="two">
      <v-list-item
        v-for="doc in documentos"
        :key="doc.id"
        :href="doc.file_url"
        target="_blank"
        data-testid="driver-doc-item"
      >
        <template #prepend>
          <v-icon :icon="getFileIcon(doc.file_type)" size="small" />
        </template>

        <v-list-item-title class="text-body-2">
          {{ getTipoLabel(doc.doc_type) }}
        </v-list-item-title>

        <v-list-item-subtitle class="text-caption">
          {{ doc.file_name }}
          <template v-if="doc.expiry_date">· Vence: {{ formatDate(doc.expiry_date) }}</template>
        </v-list-item-subtitle>

        <template #append>
          <v-chip
            :color="getEstado(doc.expiry_date).color"
            size="x-small"
            variant="tonal"
            class="mr-2"
          >
            {{ getEstado(doc.expiry_date).label }}
          </v-chip>
          <v-btn
            icon="mdi-delete-outline"
            size="x-small"
            variant="text"
            color="error"
            data-testid="driver-doc-delete"
            @click.stop.prevent="confirmDelete(doc)"
          />
        </template>
      </v-list-item>
    </v-list>

    <!-- Upload dialog -->
    <v-dialog v-model="showUploadDialog" max-width="500" persistent>
      <v-card>
        <v-card-title>Adjuntar documento</v-card-title>
        <v-card-text>
          <v-form ref="uploadFormRef">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="uploadForm.doc_type"
                  :items="tipoOptions"
                  label="Tipo de documento *"
                  variant="outlined"
                  :rules="[v => !!v || 'Seleccione un tipo']"
                  data-testid="driver-doc-tipo"
                />
              </v-col>
              <v-col cols="12">
                <v-file-input
                  v-model="uploadFiles"
                  label="Archivo *"
                  variant="outlined"
                  accept=".pdf,.jpg,.jpeg,.png"
                  :rules="[v => (v && v.length > 0) || 'Seleccione un archivo']"
                  prepend-icon="mdi-paperclip"
                  show-size
                  data-testid="driver-doc-file"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="uploadForm.issue_date"
                  label="Fecha de expedición"
                  type="date"
                  variant="outlined"
                  data-testid="driver-doc-expedicion"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="uploadForm.expiry_date"
                  label="Fecha de vencimiento"
                  type="date"
                  variant="outlined"
                  data-testid="driver-doc-vencimiento"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="uploadForm.notas"
                  label="Notas"
                  variant="outlined"
                  rows="2"
                  data-testid="driver-doc-notas"
                />
              </v-col>
            </v-row>
          </v-form>

          <v-progress-linear v-if="isUploading" indeterminate color="primary" class="mt-2" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" data-testid="driver-doc-cancel" @click="closeUploadDialog">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            :loading="isUploading"
            :disabled="isUploading"
            data-testid="driver-doc-submit"
            @click="handleUpload"
          >
            Subir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400" persistent>
      <v-card>
        <v-card-title>¿Eliminar documento?</v-card-title>
        <v-card-text>Se eliminará "{{ docToDelete?.file_name }}" permanentemente.</v-card-text>
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
import { ref, reactive, onMounted } from 'vue'
import { useDriverDocuments } from '@/composables/use-driver-documents.js'
import {
  DRIVER_DOCUMENT_TYPES,
  getDriverDocumentTypeLabel,
} from '@/constants/driver-document-types.js'
import { formatDate } from '@/utils/format-helpers.js'

const props = defineProps({
  driverId: { type: String, required: true },
})

const {
  documentos,
  isLoading,
  isUploading,
  cargarDocumentos,
  subirDocumento,
  eliminarDocumento,
  getEstadoDocumento: getEstado,
} = useDriverDocuments(props.driverId)

const showUploadDialog = ref(false)
const showDeleteDialog = ref(false)
const uploadFormRef = ref(null)
const uploadFiles = ref([])
const docToDelete = ref(null)
const isDeleting = ref(false)

const uploadForm = reactive({
  doc_type: '',
  issue_date: '',
  expiry_date: '',
  notas: '',
})

const tipoOptions = Object.values(DRIVER_DOCUMENT_TYPES).map(t => ({
  title: t.label,
  value: t.value,
}))

onMounted(() => {
  cargarDocumentos()
})

function getTipoLabel(value) {
  return getDriverDocumentTypeLabel(value)
}

function getFileIcon(mimeType) {
  if (mimeType?.includes('pdf')) return 'mdi-file-pdf-box'
  if (mimeType?.includes('image')) return 'mdi-file-image-outline'
  return 'mdi-file-document-outline'
}

function confirmDelete(doc) {
  docToDelete.value = doc
  showDeleteDialog.value = true
}

async function handleUpload() {
  const { valid } = await uploadFormRef.value.validate()
  if (!valid) return

  const file = uploadFiles.value[0]
  await subirDocumento(file, { ...uploadForm })
  closeUploadDialog()
}

async function handleDelete() {
  if (!docToDelete.value) return
  isDeleting.value = true
  try {
    await eliminarDocumento(docToDelete.value.id)
  } finally {
    isDeleting.value = false
    showDeleteDialog.value = false
    docToDelete.value = null
  }
}

function closeUploadDialog() {
  showUploadDialog.value = false
  uploadForm.doc_type = ''
  uploadForm.issue_date = ''
  uploadForm.expiry_date = ''
  uploadForm.notas = ''
  uploadFiles.value = []
  uploadFormRef.value?.resetValidation()
}
</script>
