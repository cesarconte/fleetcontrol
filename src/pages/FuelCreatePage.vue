<template>
  <div>
    <h1 class="text-h4 mb-4">Nuevo repostaje</h1>
    <v-card>
      <v-card-text>
        <FuelForm
          :is-submitting="isSubmitting"
          submit-label="Registrar repostaje"
          cancel-to="/combustible"
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
import { useFuel } from '@/composables/use-fuel.js'
import { fuelSchema } from '@/validations/fuel-schema.js'
import FuelForm from '@/components/fuel/FuelForm.vue'

const router = useRouter()
const { create } = useFuel()
const isSubmitting = ref(false)
const serverErrors = ref({})

async function handleCreate(formData) {
  serverErrors.value = {}
  const result = fuelSchema.safeParse(formData)
  if (!result.success) {
    for (const issue of result.error.issues) {
      serverErrors.value[issue.path[0]] = issue.message
    }
    return
  }
  isSubmitting.value = true
  try {
    const record = await create(result.data)
    router.push({ name: 'FuelDetail', params: { id: record.id } })
  } catch {
  } finally {
    isSubmitting.value = false
  }
}
</script>
