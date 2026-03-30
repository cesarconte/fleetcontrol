<template>
  <div>
    <v-btn
      variant="text"
      class="mb-4"
      :to="{ path: '/mantenimiento' }"
      data-testid="detail-back-btn"
    >
      <v-icon start>mdi-arrow-left</v-icon>
      Volver a mantenimiento
    </v-btn>
    <MaintenanceDetail :record-id="route.params.id" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import MaintenanceDetail from '@/components/maintenance/MaintenanceDetail.vue'

const route = useRoute()
</script>
