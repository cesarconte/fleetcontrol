<template>
  <div>
    <h1 class="text-h4 mb-4">Nuevo registro de mantenimiento</h1>
    <v-card>
      <v-card-text>
        <MaintenanceForm
          :is-submitting="isSubmitting"
          submit-label="Crear registro"
          cancel-to="/mantenimiento"
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
import { useMaintenance } from '@/composables/use-maintenance.js'
import { maintenanceSchema } from '@/validations/maintenance-schema.js'
import MaintenanceForm from '@/components/maintenance/MaintenanceForm.vue'

const router = useRouter()
const { create } = useMaintenance()
const isSubmitting = ref(false)
const serverErrors = ref({})

async function handleCreate(formData) {
  serverErrors.value = {}
  const result = maintenanceSchema.safeParse(formData)
  if (!result.success) {
    for (const issue of result.error.issues) {
      serverErrors.value[issue.path[0]] = issue.message
    }
    return
  }

  isSubmitting.value = true
  try {
    const record = await create(result.data)
    router.push({ name: 'MaintenanceDetail', params: { id: record.id } })
  } catch {
    // Error handled by composable
  } finally {
    isSubmitting.value = false
  }
}
</script>
