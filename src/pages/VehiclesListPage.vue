<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">Vehículos</h1>
      <v-btn color="primary" :to="{ name: 'VehicleCreate' }" data-testid="vehicles-create-btn">
        <v-icon start>mdi-plus</v-icon>
        Nuevo vehículo
      </v-btn>
    </div>
    <VehicleList />
  </div>
</template>

<script setup>
import VehicleList from '@/components/vehicles/VehicleList.vue'
</script>
