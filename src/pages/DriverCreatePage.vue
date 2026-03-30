<template>
  <div>
    <h1 class="text-h4 mb-4">Nuevo conductor</h1>
    <v-card>
      <v-card-text>
        <DriverForm
          :is-submitting="isSubmitting"
          submit-label="Crear conductor"
          cancel-to="/conductores"
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
import { useDrivers } from '@/composables/use-drivers.js'
import { driverSchema } from '@/validations/driver-schema.js'
import DriverForm from '@/components/drivers/DriverForm.vue'

const router = useRouter()
const { create } = useDrivers()
const isSubmitting = ref(false)
const serverErrors = ref({})

async function handleCreate(formData) {
  serverErrors.value = {}
  const result = driverSchema.safeParse(formData)
  if (!result.success) {
    for (const issue of result.error.issues) {
      serverErrors.value[issue.path[0]] = issue.message
    }
    return
  }

  isSubmitting.value = true
  try {
    const driver = await create(result.data)
    router.push({ name: 'DriverDetail', params: { id: driver.id } })
  } catch {
    // Error handled by composable
  } finally {
    isSubmitting.value = false
  }
}
</script>
