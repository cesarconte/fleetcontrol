<template>
  <div>
    <v-btn variant="text" class="mb-4" :to="{ path: '/cargas' }" data-testid="detail-back-btn">
      <v-icon start>mdi-arrow-left</v-icon>
      Volver a cargas
    </v-btn>
    <CargoDetail :record-id="route.params.id" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import CargoDetail from '@/components/cargo/CargoDetail.vue'
const route = useRoute()
</script>
