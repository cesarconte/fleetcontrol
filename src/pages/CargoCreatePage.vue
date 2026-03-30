<template>
  <div>
    <h1 class="text-h4 mb-4">Nueva carga</h1>
    <v-card>
      <v-card-text>
        <CargoForm
          :is-submitting="isSubmitting"
          submit-label="Registrar carga"
          cancel-to="/cargas"
          :errors="serverErrors"
          @submit="handleCreate"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCargo } from '@/composables/use-cargo.js'
import { cargoSchema } from '@/validations/cargo-schema.js'
import CargoForm from '@/components/cargo/CargoForm.vue'

const router = useRouter()
const { create } = useCargo()
const isSubmitting = ref(false)
const serverErrors = ref({})

async function handleCreate(formData) {
  serverErrors.value = {}
  const result = cargoSchema.safeParse(formData)
  if (!result.success) {
    for (const issue of result.error.issues) {
      serverErrors.value[issue.path[0]] = issue.message
    }
    return
  }
  isSubmitting.value = true
  try {
    const record = await create(result.data)
    router.push({ name: 'CargoDetail', params: { id: record.id } })
  } catch {
  } finally {
    isSubmitting.value = false
  }
}
</script>
