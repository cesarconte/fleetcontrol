<template>
  <VDialog v-model="isOpen" max-width="450" persistent>
    <VCard>
      <VCardTitle class="text-h6">Confirmar eliminación</VCardTitle>
      <VCardText>
        ¿Está seguro de que desea eliminar este documento? Esta acción no se puede deshacer.
        <div v-if="document" class="mt-2 text-body-2 text-medium-emphasis">
          <strong>Tipo:</strong>
          {{ document.doc_type || document.document_type }}
          <br />
          <strong>Referencia:</strong>
          {{ document.reference_number || document.file_name || 'N/A' }}
        </div>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" data-testid="btn-cancel-delete" @click="cancel">Cancelar</VBtn>
        <VBtn color="error" data-testid="btn-confirm-delete" @click="confirm">Eliminar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { computed } from 'vue'
/**
 * Delete confirmation dialog for documents.
 * @param {boolean} modelValue - Dialog visibility
 * @param {object|null} document - Document to delete
 * @emits {void} confirm - User confirmed deletion
 * @emits {void} cancel - User cancelled deletion
 */
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  document: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const isOpen = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

function confirm() {
  emit('confirm')
}

function cancel() {
  emit('cancel')
  isOpen.value = false
}
</script>
