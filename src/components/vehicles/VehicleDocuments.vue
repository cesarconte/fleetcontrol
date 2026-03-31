<template>
  <div>
    <v-table density="compact">
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Estado</th>
          <th>Vencimiento</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!documents || documents.length === 0">
          <td colspan="4" class="text-center text-medium-emphasis pa-4">
            Sin documentos registrados
          </td>
        </tr>
        <tr v-for="doc in documents" :key="doc.id">
          <td>{{ getVehicleDocumentTypeLabel(doc.doc_type) }}</td>
          <td>
            <v-chip :color="getStatusColor(doc.status)" size="x-small" variant="tonal">
              {{ getStatusLabel(doc.status) }}
            </v-chip>
          </td>
          <td>{{ formatDate(doc.expiry_date) }}</td>
          <td>
            <v-btn
              v-if="doc.file_url"
              icon="mdi-download"
              size="x-small"
              variant="text"
              data-testid="doc-download"
            />
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useVehicleDocuments } from '@/composables/use-vehicle-documents.js'
import { getVehicleDocumentTypeLabel } from '@/constants/vehicle-document-types.js'

const props = defineProps({
  vehicleId: { type: String, required: true },
})

const { documents, fetchDocuments } = useVehicleDocuments()

watch(
  () => props.vehicleId,
  id => fetchDocuments(id),
  { immediate: true },
)

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
