---
description: Workflow — Nueva Vista Completa (Page)
---

Genera una vista completa de Vue Router: componente de página, integración con stores,
layout con Vuetify y configuración de ruta.

---

## Paso 1 — Definir la vista

- ¿Cuál es la URL y los parámetros de ruta? (`/vehicles/:id`, `/routes?status=active`)
- ¿Requiere autenticación?
- ¿Qué datos necesita? ¿De qué stores los consume?
- ¿Es una vista de lista, detalle, formulario, o mixta?

---

## Paso 2 — Configuración de la ruta

```javascript
// En src/router/routes.js — lazy loading obligatorio
{
  path: '/[ruta]/:param?',
  name: '[NombrePagina]',
  component: () => import('@/pages/[NombrePagina]Page.vue'),
  meta: {
    requiresAuth: true,
    title: 'Título de la página'
  }
}
```

Guard de autenticación en `router/index.js`:
```javascript
router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
})
```

---

## Paso 3 — Estructura del componente de vista

```vue
<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEntityStore } from '@/stores/entity'
import { useNotificationStore } from '@/stores/notifications'

const route = useRoute()
const router = useRouter()
const entityStore = useEntityStore()
const notificationStore = useNotificationStore()

onMounted(async () => {
  try {
    await entityStore.fetchItems()
  } catch {
    // El error ya está en entityStore.error
  }
})

async function handleCreate(data) {
  try {
    await entityStore.createItem(data)
    notificationStore.success('Elemento creado correctamente.')
  } catch {
    notificationStore.error('No se pudo crear el elemento.')
  }
}
</script>

<template>
  <VContainer>
    <VRow class="mb-4" align="center">
      <VCol>
        <h1 class="text-h4">Título de la vista</h1>
      </VCol>
      <VCol cols="auto">
        <VBtn color="primary" prepend-icon="mdi-plus">Crear nuevo</VBtn>
      </VCol>
    </VRow>

    <VAlert v-if="entityStore.error" type="error" variant="tonal" class="mb-4" closable>
      {{ entityStore.error }}
      <template #append>
        <VBtn variant="text" @click="entityStore.fetchItems()">Reintentar</VBtn>
      </template>
    </VAlert>

    <!-- Contenido principal -->
  </VContainer>
</template>
```

---

## Paso 4 — Gestión de estados de la vista

**Estado de carga inicial:** Skeleton de página completa.
**Recarga con datos existentes:** Indicador sutil (no bloquear la UI).

```vue
<template v-if="entityStore.isLoading && !entityStore.items.length">
  <VSkeletonLoader v-for="n in 5" :key="n" type="list-item-two-line" class="mb-2" />
</template>
<template v-else>
  <!-- Contenido -->
</template>
```

---

## Paso 5 — Accesibilidad de la vista

- `<h1>` único por vista con el título de la página.
- Anunciar cambios dinámicos de contenido con `aria-live` si corresponde.
- `data-testid` en acciones principales.

---

## Paso 6 — Tests de la vista (TDD)

```javascript
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import NombreVistaPage from '../NombreVistaPage.vue'

describe('NombreVistaPage', () => {
  it('debería llamar a fetchItems al montarse', async () => { })
  it('debería mostrar el skeleton loader durante la carga inicial', () => { })
  it('debería mostrar el error con opción de reintento cuando falla la carga', () => { })
})
```

---

## Entrega

Archivos a generar:
1. `src/pages/[NombrePagina]Page.vue` — la vista completa
2. Fragmento de ruta para añadir en `src/router/routes.js`
3. `src/pages/[NombrePagina]Page.spec.js` — tests

Si la vista requiere componentes nuevos: aplicar el workflow `wf-new-component.md` para cada uno.
