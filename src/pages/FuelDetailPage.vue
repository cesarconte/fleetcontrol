<template>
  <div>
    <v-btn variant="text" class="mb-4" :to="{ path: '/combustible' }" data-testid="detail-back-btn">
      <v-icon start>mdi-arrow-left</v-icon>
      Volver a combustible
    </v-btn>
    <FuelDetail :record-id="route.params.id" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import FuelDetail from '@/components/fuel/FuelDetail.vue'
const route = useRoute()
</script>
