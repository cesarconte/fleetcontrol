<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">Conductores</h1>
      <v-btn color="primary" :to="{ name: 'DriverCreate' }" data-testid="drivers-create-btn">
        <v-icon start>mdi-plus</v-icon>
        Nuevo conductor
      </v-btn>
    </div>
    <DriverList />
  </div>
</template>

<script setup>
import DriverList from '@/components/drivers/DriverList.vue'
</script>
