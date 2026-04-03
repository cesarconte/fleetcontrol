<template>
  <VDialog
    :model-value="modelValue"
    max-width="600"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle>{{ dialogTitle }}</VCardTitle>
      <VCardText>
        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <!-- Document Type -->
          <VAutocomplete
            v-if="mode === 'create'"
            v-model="form.docType"
            :items="docTypeItems"
            label="Tipo de documento"
            :rules="requiredRules"
            item-title="label"
            item-value="key"
            data-testid="doc-type-selector"
          />

          <!-- Reference Number -->
          <VTextField
            v-model="form.referenceNumber"
            label="Nº referencia"
            :rules="requiredRules"
            data-testid="doc-reference"
          />

          <!-- Issue Date -->
          <VTextField
            v-model="form.issueDate"
            label="Fecha expedición"
            type="date"
            :rules="requiredRules"
            data-testid="doc-issue-date"
          />

          <!-- Expiry Date -->
          <VTextField
            v-model="form.expiryDate"
            label="Fecha vencimiento"
            type="date"
            :rules="expiryRules"
            data-testid="doc-expiry-date"
          />

          <!-- File Upload (create/edit only) -->
          <VFileInput
            v-if="mode !== 'view'"
            v-model="form.file"
            label="Adjuntar archivo"
            accept=".pdf,.jpg,.jpeg,.png"
            :rules="fileRules"
            prepend-icon=""
            prepend-inner-icon="mdi-paperclip"
            data-testid="doc-file-input"
          />

          <!-- Notes -->
          <VTextarea
            v-model="form.notes"
            label="Notas"
            rows="2"
            auto-grow
            data-testid="doc-notes"
          />

          <!-- Server Errors -->
          <VAlert
            v-if="serverError"
            type="error"
            variant="tonal"
            class="mt-3"
            data-testid="server-error"
          >
            {{ serverError }}
          </VAlert>
        </VForm>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn variant="text" data-testid="dialog-cancel" @click="$emit('update:modelValue', false)">
          Cancelar
        </VBtn>
        <VBtn
          v-if="mode !== 'view'"
          color="primary"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          data-testid="dialog-save"
          @click="handleSubmit"
        >
          {{ mode === 'create' ? 'Crear' : 'Guardar' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
/**
 * FleetControl — Document Actions Dialog
 *
 * Reusable dialog for creating, editing, and viewing vehicle/driver documents.
 *
 * @see docs/plans/feature-documentos-centralizados-plan.md — Fase 3
 */

import { ref, computed, watch } from 'vue'
import { VEHICLE_DOCUMENT_TYPES } from '@/constants/vehicle-document-types.js'
import { DRIVER_DOCUMENT_TYPES } from '@/constants/driver-document-types.js'
import { documentSchema } from '@/validations/document-schema.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: 'create', validator: v => ['create', 'edit', 'view'].includes(v) },
  document: { type: Object, default: null },
  entityType: {
    type: String,
    default: 'vehicle',
    validator: v => ['vehicle', 'driver'].includes(v),
  },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const formRef = ref(null)
const isSubmitting = ref(false)
const serverError = ref(null)

const form = ref({
  docType: '',
  referenceNumber: '',
  issueDate: '',
  expiryDate: '',
  file: null,
  notes: '',
})

// ── Computed ─────────────────────────────────────────────────────────
const dialogTitle = computed(() => {
  if (props.mode === 'create') return 'Nuevo documento'
  if (props.mode === 'edit') return 'Editar documento'
  return 'Detalle del documento'
})

const docTypeItems = computed(() => {
  const types = props.entityType === 'vehicle' ? VEHICLE_DOCUMENT_TYPES : DRIVER_DOCUMENT_TYPES
  return Object.values(types).map(t => ({ label: t.label, key: t.key }))
})

// ── Validation Rules ─────────────────────────────────────────────────
const requiredRules = [v => !!v || 'Campo obligatorio']
const expiryRules = [v => !!v || 'Campo obligatorio']
const fileRules = [
  v => {
    if (!v) return true // optional
    const maxSize = 10 * 1024 * 1024 // 10MB
    return v.size <= maxSize || 'El archivo no debe superar 10 MB'
  },
]

// ── Handlers ─────────────────────────────────────────────────────────
/**
 * Validate and submit form.
 */
async function handleSubmit() {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  isSubmitting.value = true
  serverError.value = null

  try {
    const payload = {
      docType: form.value.docType,
      referenceNumber: form.value.referenceNumber,
      issueDate: form.value.issueDate,
      expiryDate: form.value.expiryDate,
      notes: form.value.notes,
      file: form.value.file,
    }

    // Zod validation
    const result = documentSchema.safeParse(payload)
    if (!result.success) {
      serverError.value = result.error.errors[0].message
      return
    }

    emit('saved', result.data)
    emit('update:modelValue', false)
  } catch (err) {
    serverError.value = err.message || 'Error al guardar el documento'
  } finally {
    isSubmitting.value = false
  }
}

// ── Watchers ─────────────────────────────────────────────────────────
watch(
  () => props.document,
  doc => {
    if (doc) {
      form.value = {
        docType: doc.docType || doc.doc_type || '',
        referenceNumber: doc.referenceNumber || doc.reference_number || '',
        issueDate: doc.issueDate || doc.issue_date || '',
        expiryDate: doc.expiryDate || doc.expiry_date || '',
        file: null,
        notes: doc.notes || '',
      }
    } else {
      form.value = {
        docType: '',
        referenceNumber: '',
        issueDate: '',
        expiryDate: '',
        file: null,
        notes: '',
      }
    }
  },
  { immediate: true },
)

watch(
  () => props.modelValue,
  isOpen => {
    if (isOpen && !props.document) {
      form.value = {
        docType: '',
        referenceNumber: '',
        issueDate: '',
        expiryDate: '',
        file: null,
        notes: '',
      }
    }
    serverError.value = null
  },
)
</script>
