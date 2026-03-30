<template>
  <div>
    <v-btn variant="text" class="mb-4" :to="{ path: '/conductores' }" data-testid="detail-back-btn">
      <v-icon start>mdi-arrow-left</v-icon>
      Volver a conductores
    </v-btn>
    <DriverDetail :driver-id="route.params.id" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import DriverDetail from '@/components/drivers/DriverDetail.vue'

const route = useRoute()
</script>
