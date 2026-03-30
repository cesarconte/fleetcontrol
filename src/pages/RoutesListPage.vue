<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">Rutas</h1>
      <v-btn color="primary" :to="{ name: 'RouteCreate' }" data-testid="routes-create-btn">
        <v-icon start>mdi-plus</v-icon>
        Nueva ruta
      </v-btn>
    </div>
    <RouteList />
  </div>
</template>

<script setup>
import RouteList from '@/components/routes/RouteList.vue'
</script>
