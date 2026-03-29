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
          <td>{{ doc.doc_name }}</td>
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
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase-client.js'

const props = defineProps({
  vehicleId: { type: String, required: true },
})

const documents = ref([])

onMounted(async () => {
  const { data } = await supabase
    .from('vehicle_documents')
    .select('*')
    .eq('vehicle_id', props.vehicleId)
    .order('expiry_date', { ascending: true })
  if (data) documents.value = data
})

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
