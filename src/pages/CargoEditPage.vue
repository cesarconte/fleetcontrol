<template>
  <div>
    <h1 class="text-h4 mb-4">Editar carga</h1>
    <div v-if="isLoading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <v-card v-else>
      <v-card-text>
        <CargoForm
          :initial-values="recordData"
          :is-submitting="isSubmitting"
          submit-label="Guardar cambios"
          :cancel-to="{ name: 'CargoDetail', params: { id: route.params.id } }"
          :errors="serverErrors"
          @submit="handleUpdate"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCargo } from '@/composables/use-cargo.js'
import { cargoUpdateSchema } from '@/validations/cargo-schema.js'
import CargoForm from '@/components/cargo/CargoForm.vue'

const route = useRoute()
const router = useRouter()
const { getById, update, isLoading, currentRecord: recordData } = useCargo()
const isSubmitting = ref(false)
const serverErrors = ref({})

onMounted(async () => {
  await getById(route.params.id)
})

async function handleUpdate(formData) {
  serverErrors.value = {}
  const result = cargoUpdateSchema.safeParse(formData)
  if (!result.success) {
    for (const issue of result.error.issues) {
      serverErrors.value[issue.path[0]] = issue.message
    }
    return
  }
  isSubmitting.value = true
  try {
    await update(route.params.id, result.data)
    router.push({ name: 'CargoDetail', params: { id: route.params.id } })
  } catch {
  } finally {
    isSubmitting.value = false
  }
}
</script>
