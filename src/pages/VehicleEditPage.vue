<template>
  <div>
    <h1 class="text-h4 mb-4">Editar vehículo</h1>

    <div v-if="isLoading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-card v-else>
      <v-card-text>
        <VehicleForm
          :initial-values="vehicle"
          :is-submitting="isSubmitting"
          submit-label="Guardar cambios"
          :cancel-to="{ name: 'VehicleDetail', params: { id: route.params.id } }"
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
import { useVehicles } from '@/composables/use-vehicles.js'
import { vehicleUpdateSchema } from '@/validations/vehicle-schema.js'
import VehicleForm from '@/components/vehicles/VehicleForm.vue'

const route = useRoute()
const router = useRouter()
const { getById, update, isLoading, currentVehicle: vehicle } = useVehicles()
const isSubmitting = ref(false)
const serverErrors = ref({})

onMounted(async () => {
  await getById(route.params.id)
})

async function handleUpdate(formData) {
  serverErrors.value = {}
  const result = vehicleUpdateSchema.safeParse(formData)
  if (!result.success) {
    for (const issue of result.error.issues) {
      serverErrors.value[issue.path[0]] = issue.message
    }
    return
  }

  isSubmitting.value = true
  try {
    await update(route.params.id, result.data)
    router.push({ name: 'VehicleDetail', params: { id: route.params.id } })
  } catch {
    // Error handled by composable
  } finally {
    isSubmitting.value = false
  }
}
</script>
