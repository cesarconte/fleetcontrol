<template>
  <div class="fleet-map-page" data-testid="fleet-map-page">
    <FleetMap />
  </div>
</template>

<script setup>
import FleetMap from '@/components/map/FleetMap.vue'
</script>

<style scoped>
.fleet-map-page {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
