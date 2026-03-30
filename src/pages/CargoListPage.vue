<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">Cargas</h1>
      <v-btn color="primary" :to="{ name: 'CargoCreate' }" data-testid="cargo-create-btn">
        <v-icon start>mdi-plus</v-icon>
        Nueva carga
      </v-btn>
    </div>
    <CargoList />
  </div>
</template>

<script setup>
import CargoList from '@/components/cargo/CargoList.vue'
</script>
