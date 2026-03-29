<template>
  <div>
    <h1 class="text-h4 mb-4">Nuevo vehículo</h1>
    <v-card>
      <v-card-text>
        <VehicleForm
          :is-submitting="isSubmitting"
          submit-label="Crear vehículo"
          cancel-to="/vehiculos"
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
import { useVehicles } from '@/composables/use-vehicles.js'
import { vehicleSchema } from '@/validations/vehicle-schema.js'
import VehicleForm from '@/components/vehicles/VehicleForm.vue'

const router = useRouter()
const { create } = useVehicles()
const isSubmitting = ref(false)
const serverErrors = ref({})

async function handleCreate(formData) {
  serverErrors.value = {}
  const result = vehicleSchema.safeParse(formData)
  if (!result.success) {
    for (const issue of result.error.issues) {
      serverErrors.value[issue.path[0]] = issue.message
    }
    return
  }

  isSubmitting.value = true
  try {
    const vehicle = await create(result.data)
    router.push({ name: 'VehicleDetail', params: { id: vehicle.id } })
  } catch {
    // Error handled by composable
  } finally {
    isSubmitting.value = false
  }
}
</script>
