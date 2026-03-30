<template>
  <div>
    <h1 class="text-h4 mb-4">Editar conductor</h1>

    <div v-if="isLoading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-card v-else>
      <v-card-text>
        <DriverForm
          :initial-values="driver"
          :is-submitting="isSubmitting"
          submit-label="Guardar cambios"
          :cancel-to="{ name: 'DriverDetail', params: { id: route.params.id } }"
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
import { useDrivers } from '@/composables/use-drivers.js'
import { driverUpdateSchema } from '@/validations/driver-schema.js'
import DriverForm from '@/components/drivers/DriverForm.vue'

const route = useRoute()
const router = useRouter()
const { getById, update, isLoading, currentDriver: driver } = useDrivers()
const isSubmitting = ref(false)
const serverErrors = ref({})

onMounted(async () => {
  await getById(route.params.id)
})

async function handleUpdate(formData) {
  serverErrors.value = {}
  const result = driverUpdateSchema.safeParse(formData)
  if (!result.success) {
    for (const issue of result.error.issues) {
      serverErrors.value[issue.path[0]] = issue.message
    }
    return
  }

  isSubmitting.value = true
  try {
    await update(route.params.id, result.data)
    router.push({ name: 'DriverDetail', params: { id: route.params.id } })
  } catch {
    // Error handled by composable
  } finally {
    isSubmitting.value = false
  }
}
</script>
