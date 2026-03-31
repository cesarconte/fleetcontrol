<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title>{{ isEditing ? 'Editar documento' : 'Añadir documento' }}</v-card-title>
      <v-card-text>
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="form.doc_type"
                :items="docTypeOptions"
                label="Tipo de documento *"
                variant="outlined"
                :rules="[v => !!v || 'Seleccione un tipo']"
                :disabled="isEditing"
                data-testid="doc-form-type"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.reference_number"
                label="Nº de referencia"
                variant="outlined"
                data-testid="doc-form-ref"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.alert_days_before"
                label="Alerta (días antes)"
                type="number"
                variant="outlined"
                min="1"
                max="365"
                :rules="[v => v >= 1 || 'Mínimo 1 día', v => v <= 365 || 'Máximo 365 días']"
                data-testid="doc-form-alert-days"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.issue_date"
                label="Fecha de expedición"
                type="date"
                variant="outlined"
                data-testid="doc-form-issue-date"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.expiry_date"
                label="Fecha de vencimiento"
                type="date"
                variant="outlined"
                data-testid="doc-form-expiry-date"
              />
            </v-col>
            <v-col cols="12">
              <v-file-input
                v-model="selectedFile"
                label="Archivo (PDF, JPG, PNG)"
                variant="outlined"
                accept=".pdf,.jpg,.jpeg,.png"
                prepend-icon="mdi-paperclip"
                show-size
                clearable
                data-testid="doc-form-file"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.notes"
                label="Notas"
                variant="outlined"
                rows="2"
                data-testid="doc-form-notes"
              />
            </v-col>
          </v-row>
        </v-form>
        <v-progress-linear v-if="isSaving" indeterminate color="primary" class="mt-2" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" data-testid="doc-form-cancel" @click="handleCancel">Cancelar</v-btn>
        <v-btn
          color="primary"
          :loading="isSaving"
          :disabled="isSaving"
          data-testid="doc-form-submit"
          @click="handleSubmit"
        >
          {{ isEditing ? 'Guardar' : 'Añadir' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { VEHICLE_DOCUMENT_TYPES } from '@/constants/vehicle-document-types.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  vehicleId: { type: String, required: true },
  document: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const formRef = ref(null)
const isSaving = ref(false)
const selectedFile = ref([])

const isEditing = computed(() => !!props.document)

const form = reactive({
  doc_type: '',
  reference_number: '',
  issue_date: '',
  expiry_date: '',
  alert_days_before: 30,
  notes: '',
})

const docTypeOptions = Object.values(VEHICLE_DOCUMENT_TYPES).map(t => ({
  title: t.label,
  value: t.value,
}))

watch(
  () => props.modelValue,
  open => {
    if (open) {
      if (props.document) {
        form.doc_type = props.document.doc_type || ''
        form.reference_number = props.document.reference_number || ''
        form.issue_date = props.document.issue_date || ''
        form.expiry_date = props.document.expiry_date || ''
        form.alert_days_before = props.document.alert_days_before ?? 30
        form.notes = props.document.notes || ''
      } else {
        resetForm()
      }
    }
  },
)

function resetForm() {
  form.doc_type = ''
  form.reference_number = ''
  form.issue_date = ''
  form.expiry_date = ''
  form.alert_days_before = 30
  form.notes = ''
  selectedFile.value = []
  formRef.value?.resetValidation()
}

function handleCancel() {
  emit('update:modelValue', false)
  resetForm()
}

async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  isSaving.value = true
  try {
    const data = {
      vehicle_id: props.vehicleId,
      doc_type: form.doc_type,
      reference_number: form.reference_number || null,
      issue_date: form.issue_date || null,
      expiry_date: form.expiry_date || null,
      alert_days_before: form.alert_days_before,
      notes: form.notes || null,
    }

    const file = selectedFile.value?.[0] || null
    emit('saved', { data, file, isEditing: isEditing.value, docId: props.document?.id })
    emit('update:modelValue', false)
    resetForm()
  } finally {
    isSaving.value = false
  }
}
</script>
