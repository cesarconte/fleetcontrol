<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h4">Mantenimiento</h1>
      <v-btn
        color="primary"
        :to="{ name: 'MaintenanceCreate' }"
        data-testid="maintenance-create-btn"
      >
        <v-icon start>mdi-plus</v-icon>
        Nuevo registro
      </v-btn>
    </div>
    <MaintenanceList />
  </div>
</template>

<script setup>
import MaintenanceList from '@/components/maintenance/MaintenanceList.vue'
</script>
