<template>
  <div>
    <h1 class="text-h4 mb-4">Editar ruta</h1>

    <div v-if="isLoading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-card v-else>
      <v-card-text>
        <RouteForm
          :initial-values="routeData"
          :is-submitting="isSubmitting"
          submit-label="Guardar cambios"
          :cancel-to="{ name: 'RouteDetail', params: { id: route.params.id } }"
          :errors="serverErrors"
          :show-results="true"
          @submit="handleUpdate"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoutes } from '@/composables/use-routes.js'
import { routeUpdateSchema } from '@/validations/route-schema.js'
import RouteForm from '@/components/routes/RouteForm.vue'

const route = useRoute()
const router = useRouter()
const { getById, update, isLoading, currentRoute: routeData } = useRoutes()
const isSubmitting = ref(false)
const serverErrors = ref({})

onMounted(async () => {
  await getById(route.params.id)
})

async function handleUpdate(formData) {
  serverErrors.value = {}
  const result = routeUpdateSchema.safeParse(formData)
  if (!result.success) {
    for (const issue of result.error.issues) {
      serverErrors.value[issue.path[0]] = issue.message
    }
    return
  }

  isSubmitting.value = true
  try {
    await update(route.params.id, result.data)
    router.push({ name: 'RouteDetail', params: { id: route.params.id } })
  } catch {
    // Error handled by composable
  } finally {
    isSubmitting.value = false
  }
}
</script>
