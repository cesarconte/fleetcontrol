<template>
  <div>
    <h1 class="text-h4 mb-4">Nueva ruta</h1>
    <v-card>
      <v-card-text>
        <RouteForm
          :is-submitting="isSubmitting"
          submit-label="Crear ruta"
          cancel-to="/rutas"
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
import { useRoutes } from '@/composables/use-routes.js'
import { routeSchema } from '@/validations/route-schema.js'
import RouteForm from '@/components/routes/RouteForm.vue'

const router = useRouter()
const { create } = useRoutes()
const isSubmitting = ref(false)
const serverErrors = ref({})

async function handleCreate(formData) {
  serverErrors.value = {}
  const result = routeSchema.safeParse(formData)
  if (!result.success) {
    for (const issue of result.error.issues) {
      serverErrors.value[issue.path[0]] = issue.message
    }
    return
  }

  isSubmitting.value = true
  try {
    const newRoute = await create(result.data)
    router.push({ name: 'RouteDetail', params: { id: newRoute.id } })
  } catch {
    // Error handled by composable
  } finally {
    isSubmitting.value = false
  }
}
</script>
