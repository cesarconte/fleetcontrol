<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">Combustible</h1>
      <v-btn color="primary" :to="{ name: 'FuelCreate' }" data-testid="fuel-create-btn">
        <v-icon start>mdi-plus</v-icon>
        Nuevo repostaje
      </v-btn>
    </div>
    <FuelList />
  </div>
</template>

<script setup>
import FuelList from '@/components/fuel/FuelList.vue'
</script>
