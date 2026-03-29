<template>
  <div>
    <v-btn variant="text" class="mb-4" :to="{ path: '/vehiculos' }" data-testid="detail-back-btn">
      <v-icon start>mdi-arrow-left</v-icon>
      Volver a vehículos
    </v-btn>
    <VehicleDetail :vehicle-id="route.params.id" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import VehicleDetail from '@/components/vehicles/VehicleDetail.vue'

const route = useRoute()
</script>
