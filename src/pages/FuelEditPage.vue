<template>
  <div>
    <h1 class="text-h4 mb-4">Editar repostaje</h1>
    <div v-if="isLoading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <v-card v-else>
      <v-card-text>
        <FuelForm
          :initial-values="recordData"
          :is-submitting="isSubmitting"
          submit-label="Guardar cambios"
          :cancel-to="{ name: 'FuelDetail', params: { id: route.params.id } }"
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
import { useFuel } from '@/composables/use-fuel.js'
import { fuelUpdateSchema } from '@/validations/fuel-schema.js'
import FuelForm from '@/components/fuel/FuelForm.vue'

const route = useRoute()
const router = useRouter()
const { getById, update, isLoading, currentRecord: recordData } = useFuel()
const isSubmitting = ref(false)
const serverErrors = ref({})

onMounted(async () => {
  await getById(route.params.id)
})

async function handleUpdate(formData) {
  serverErrors.value = {}
  const result = fuelUpdateSchema.safeParse(formData)
  if (!result.success) {
    for (const issue of result.error.issues) {
      serverErrors.value[issue.path[0]] = issue.message
    }
    return
  }
  isSubmitting.value = true
  try {
    await update(route.params.id, result.data)
    router.push({ name: 'FuelDetail', params: { id: route.params.id } })
  } catch {
  } finally {
    isSubmitting.value = false
  }
}
</script>
