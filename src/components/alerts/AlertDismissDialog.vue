<template>
  <VDialog
    :model-value="modelValue"
    max-width="500"
    persistent
    data-testid="alert-dismiss-dialog"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle>Silenciar alerta</VCardTitle>
      <VCardText>
        <p class="text-body-2 mb-4">
          {{ alert?.title }}
        </p>
        <VForm ref="formRef" @submit.prevent="handleDismiss">
          <VTextarea
            v-model="justification"
            label="Justificación"
            :rules="justificationRules"
            variant="outlined"
            rows="3"
            counter="500"
            data-testid="alert-dismiss-justification"
          />
        </VForm>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" data-testid="alert-dismiss-cancel" @click="handleCancel">
          Cancelar
        </VBtn>
        <VBtn
          color="warning"
          :loading="isSubmitting"
          data-testid="alert-dismiss-confirm"
          @click="handleDismiss"
        >
          Silenciar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: { type: Boolean, default: false },
  alert: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'dismiss'])

const formRef = ref(null)
const justification = ref('')
const isSubmitting = ref(false)

const justificationRules = [
  v => !!v || 'La justificación es obligatoria',
  v => v.length <= 500 || 'Máximo 500 caracteres',
]

function handleCancel() {
  justification.value = ''
  emit('update:modelValue', false)
}

async function handleDismiss() {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  isSubmitting.value = true
  emit('dismiss', justification.value)
  isSubmitting.value = false
  justification.value = ''
}
</script>
