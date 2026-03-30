<template>
  <div>
    <v-btn variant="text" class="mb-4" :to="{ path: '/rutas' }" data-testid="detail-back-btn">
      <v-icon start>mdi-arrow-left</v-icon>
      Volver a rutas
    </v-btn>
    <RouteDetail :route-id="route.params.id" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import RouteDetail from '@/components/routes/RouteDetail.vue'

const route = useRoute()
</script>
